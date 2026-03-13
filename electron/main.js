const { app, BrowserWindow, ipcMain, clipboard, dialog } = require("electron");
const fs = require("fs");
const path = require("path");
const net = require("net");
const { spawn } = require("child_process");
const UDPListener = require("./UDPListener");
const DCSBridge = require("./DCSBridge");
const { loadBindings, saveBindings, DEFAULT_BINDINGS } = require("./keybindings");
const { loadSettings, saveSettings, DEFAULTS: SETTING_DEFAULTS } = require("./settings");
const { installScripts } = require("./dcsInstaller");

let mainWindow = null;
let udpListener = null;
let dcsBridge = null;
let hotkeyProcess = null;
let bindings = {};
let captureMode = false;
let settings = {};

// Hotkey watchdog state
let hotkeyRetries = 0;
let hotkeyBackoffTimer = null;
let hotkeyStartedAt = 0;
let hotkeyStatus = "stopped";
const MAX_HOTKEY_RETRIES = 5;
const HOTKEY_STABLE_THRESHOLD = 10000;

const DEV_SERVER_URL = "http://localhost:5174";

// Prevent Chromium from throttling/freezing the renderer when DCS is fullscreen
app.commandLine.appendSwitch("disable-backgrounding-occluded-windows");

function isDevServerRunning() {
  return new Promise((resolve) => {
    const client = net.createConnection({ port: 5174 }, () => {
      client.end();
      resolve(true);
    });
    client.on("error", () => resolve(false));
  });
}

function sendHotkeyStatus() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("hotkey-status", hotkeyStatus);
  }
}

// ---------------------------------------------------------------------------
// Low-level hotkey listener (PowerShell companion process)
// ---------------------------------------------------------------------------
function startHotkeyListener() {
  if (hotkeyProcess) return;

  const scriptPath = app.isPackaged
    ? path.join(process.resourcesPath, "Scripts", "hotkey-listener.ps1")
    : path.join(__dirname, "..", "Scripts", "hotkey-listener.ps1");
  hotkeyProcess = spawn("powershell.exe", [
    "-NoProfile",
    "-ExecutionPolicy", "Bypass",
    "-File", scriptPath,
  ], {
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  });

  hotkeyStartedAt = Date.now();
  hotkeyStatus = "running";
  sendHotkeyStatus();

  hotkeyProcess.stdout.on("data", (data) => {
    const lines = data.toString().split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !mainWindow) continue;
      if (trimmed === "HOOK_READY") continue;

      if (!trimmed.startsWith("KEY:")) continue;
      const vkCode = trimmed.substring(4);

      if (captureMode) {
        mainWindow.webContents.send("key-captured", vkCode);
        continue;
      }

      const command = bindings[vkCode];
      if (!command) continue;

      if (command === "HOTKEY_TOGGLE") {
        if (mainWindow.isVisible()) {
          mainWindow.hide();
        } else {
          mainWindow.showInactive();
        }
      } else {
        mainWindow.webContents.send("hotkey-command", command);
      }
    }
  });

  hotkeyProcess.stderr.on("data", (data) => {
    console.error("[hotkey-listener]", data.toString());
  });

  hotkeyProcess.on("exit", (code) => {
    console.log(`[hotkey-listener] exited with code ${code}`);
    hotkeyProcess = null;

    if (hotkeyStatus === "stopped") return;

    const uptime = Date.now() - hotkeyStartedAt;
    if (uptime > HOTKEY_STABLE_THRESHOLD) {
      hotkeyRetries = 0;
    }

    if (hotkeyRetries >= MAX_HOTKEY_RETRIES) {
      console.error("[hotkey-listener] max retries reached, giving up");
      hotkeyStatus = "failed";
      sendHotkeyStatus();
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, hotkeyRetries), 16000);
    hotkeyRetries++;
    console.log(`[hotkey-listener] restarting in ${delay}ms (attempt ${hotkeyRetries}/${MAX_HOTKEY_RETRIES})`);

    hotkeyBackoffTimer = setTimeout(() => {
      hotkeyBackoffTimer = null;
      startHotkeyListener();
    }, delay);
  });
}

function stopHotkeyListener() {
  hotkeyStatus = "stopped";
  if (hotkeyBackoffTimer) {
    clearTimeout(hotkeyBackoffTimer);
    hotkeyBackoffTimer = null;
  }
  if (hotkeyProcess) {
    hotkeyProcess.kill();
    hotkeyProcess = null;
  }
}

async function createWindow() {
  settings = loadSettings();

  mainWindow = new BrowserWindow({
    width: settings.windowWidth || 750,
    height: settings.windowHeight || 460,
    minWidth: 500,
    minHeight: 300,
    alwaysOnTop: true,
    skipTaskbar: true,
    frame: false,
    transparent: true,
    backgroundColor: "#00000000",
    icon: path.join(__dirname, "../build/icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.setAlwaysOnTop(true, "screen-saver");

  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow.webContents.setZoomLevel(0);
  });

  // Prevent Chromium zoom — the app manages font size itself
  mainWindow.webContents.on("before-input-event", (event, input) => {
    if (input.control && !input.alt) {
      if (input.key === "+" || input.key === "=" || input.key === "-" || input.key === "_") {
        event.preventDefault();
      }
    }
  });

  const devRunning = await isDevServerRunning();
  if (devRunning) {
    mainWindow.loadURL(DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  // Auto-install DCS Lua scripts
  try {
    const installResult = installScripts(settings);
    if (installResult.errors.length > 0) {
      console.warn("[main] DCS script install had errors:", installResult.errors);
    }
  } catch (err) {
    console.error("[main] DCS script install failed:", err.message);
  }

  udpListener = new UDPListener(mainWindow, settings.udpPort);
  dcsBridge = new DCSBridge(mainWindow, settings.dcsTcpPort, settings.dcsTelemetryPort);

  bindings = loadBindings();
  startHotkeyListener();

  mainWindow.on("blur", () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.setAlwaysOnTop(true, "screen-saver");
    }
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
    if (udpListener) {
      udpListener.close();
      udpListener = null;
    }
    if (dcsBridge) {
      dcsBridge.close();
      dcsBridge = null;
    }
  });
}

// ---------------------------------------------------------------------------
// IPC handlers — keybinding settings
// ---------------------------------------------------------------------------
ipcMain.handle("get-keybindings", () => {
  return { bindings, defaults: DEFAULT_BINDINGS };
});

ipcMain.handle("set-keybindings", (_event, newBindings) => {
  bindings = newBindings;
  saveBindings(bindings);
});

ipcMain.handle("start-key-capture", () => {
  captureMode = true;
});

ipcMain.handle("stop-key-capture", () => {
  captureMode = false;
});

// ---------------------------------------------------------------------------
// IPC handlers — UDP status & settings
// ---------------------------------------------------------------------------
ipcMain.handle("get-udp-status", () => {
  return udpListener ? udpListener.status : "disconnected";
});

ipcMain.handle("get-settings", () => {
  return { settings, defaults: SETTING_DEFAULTS };
});

ipcMain.handle("set-udp-port", (_event, port) => {
  const parsed = parseInt(port, 10);
  if (isNaN(parsed) || parsed < 1024 || parsed > 65535) {
    return { success: false, error: "PORT MUST BE 1024-65535" };
  }
  settings.udpPort = parsed;
  saveSettings(settings);
  if (udpListener) {
    udpListener.rebind(parsed);
  }
  return { success: true };
});

ipcMain.handle("set-window-size", (_event, width, height) => {
  const w = parseInt(width, 10);
  const h = parseInt(height, 10);
  if (isNaN(w) || isNaN(h) || w < 500 || h < 300 || w > 3840 || h > 2160) {
    return { success: false, error: "INVALID DIMENSIONS" };
  }
  settings.windowWidth = w;
  settings.windowHeight = h;
  saveSettings(settings);
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.setSize(w, h);
  }
  return { success: true };
});

ipcMain.handle("set-theme", (_event, themeName) => {
  const allowed = ["stealth", "hornet", "viper"];
  if (!allowed.includes(themeName)) {
    return { success: false, error: "INVALID THEME" };
  }
  settings.theme = themeName;
  saveSettings(settings);
  return { success: true };
});

// ---------------------------------------------------------------------------
// IPC handlers — hotkey status
// ---------------------------------------------------------------------------
ipcMain.handle("get-hotkey-status", () => {
  return hotkeyStatus;
});

ipcMain.handle("restart-hotkey-listener", () => {
  hotkeyRetries = 0;
  stopHotkeyListener();
  startHotkeyListener();
  return { success: true };
});

// ---------------------------------------------------------------------------
// IPC handlers — DCS bridge
// ---------------------------------------------------------------------------
ipcMain.handle("get-dcs-bridge-status", () => {
  return dcsBridge ? dcsBridge.status : "disconnected";
});

ipcMain.handle("get-dcs-telemetry", () => {
  return dcsBridge ? dcsBridge.telemetry : null;
});

ipcMain.handle("send-command", async (_event, payload) => {
  if (!dcsBridge) return { success: false, error: "DCS BRIDGE NOT INITIALIZED" };
  return dcsBridge.sendCommand(payload);
});

ipcMain.handle("set-dcs-tcp-port", (_event, port) => {
  const parsed = parseInt(port, 10);
  if (isNaN(parsed) || parsed < 1024 || parsed > 65535) {
    return { success: false, error: "PORT MUST BE 1024-65535" };
  }
  settings.dcsTcpPort = parsed;
  saveSettings(settings);
  if (dcsBridge) {
    dcsBridge.tcpPort = parsed;
  }
  return { success: true };
});

ipcMain.handle("set-dcs-telemetry-port", (_event, port) => {
  const parsed = parseInt(port, 10);
  if (isNaN(parsed) || parsed < 1024 || parsed > 65535) {
    return { success: false, error: "PORT MUST BE 1024-65535" };
  }
  settings.dcsTelemetryPort = parsed;
  saveSettings(settings);
  if (dcsBridge) {
    dcsBridge.rebindTelemetry(parsed);
  }
  return { success: true };
});

// ---------------------------------------------------------------------------
// IPC handlers — save log
// ---------------------------------------------------------------------------
ipcMain.handle("save-log", async (_event, lines) => {
  if (!mainWindow) return { success: false, error: "NO WINDOW" };
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
    defaultPath: `ufc-log-${dateStr}.txt`,
    filters: [{ name: "Text Files", extensions: ["txt"] }],
  });
  if (canceled || !filePath) return { success: false, error: "CANCELLED" };
  try {
    fs.writeFileSync(filePath, lines.join("\n"), "utf-8");
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// ---------------------------------------------------------------------------
// IPC handlers — clipboard
// ---------------------------------------------------------------------------
ipcMain.handle("copy-to-clipboard", (_event, text) => {
  if (typeof text !== "string" || text.length === 0) return { success: false };
  clipboard.writeText(text);
  return { success: true };
});

app.whenReady().then(createWindow);

app.on("will-quit", () => {
  stopHotkeyListener();
  if (udpListener) {
    udpListener.close();
    udpListener = null;
  }
  if (dcsBridge) {
    dcsBridge.close();
    dcsBridge = null;
  }
});

app.on("window-all-closed", () => {
  app.quit();
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
