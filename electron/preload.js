const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  onMessage: (callback) => {
    ipcRenderer.removeAllListeners("dcs-message");
    ipcRenderer.on("dcs-message", (_event, msg) => callback(msg));
  },
  onHotkeyCommand: (callback) => {
    ipcRenderer.removeAllListeners("hotkey-command");
    ipcRenderer.on("hotkey-command", (_event, cmd) => callback(cmd));
  },
  getKeybindings: () => ipcRenderer.invoke("get-keybindings"),
  setKeybindings: (bindings) => ipcRenderer.invoke("set-keybindings", bindings),
  startKeyCapture: () => ipcRenderer.invoke("start-key-capture"),
  stopKeyCapture: () => ipcRenderer.invoke("stop-key-capture"),
  onKeyCaptured: (callback) => {
    ipcRenderer.on("key-captured", (_event, vkCode) => callback(vkCode));
  },
  removeKeyCapturedListener: () => {
    ipcRenderer.removeAllListeners("key-captured");
  },

  // UDP status
  onUdpStatus: (callback) => {
    ipcRenderer.removeAllListeners("udp-status");
    ipcRenderer.on("udp-status", (_event, status) => callback(status));
  },
  getUdpStatus: () => ipcRenderer.invoke("get-udp-status"),

  // App settings
  getSettings: () => ipcRenderer.invoke("get-settings"),
  setUdpPort: (port) => ipcRenderer.invoke("set-udp-port", port),
  setWindowSize: (width, height) => ipcRenderer.invoke("set-window-size", width, height),

  // Hotkey status
  onHotkeyStatus: (callback) => {
    ipcRenderer.removeAllListeners("hotkey-status");
    ipcRenderer.on("hotkey-status", (_event, status) => callback(status));
  },
  getHotkeyStatus: () => ipcRenderer.invoke("get-hotkey-status"),
  restartHotkeyListener: () => ipcRenderer.invoke("restart-hotkey-listener"),

  // Clipboard
  copyToClipboard: (text) => ipcRenderer.invoke("copy-to-clipboard", text),

  // DCS Bridge
  onDcsBridgeStatus: (callback) => {
    ipcRenderer.removeAllListeners("dcs-bridge-status");
    ipcRenderer.on("dcs-bridge-status", (_event, status) => callback(status));
  },
  getDcsBridgeStatus: () => ipcRenderer.invoke("get-dcs-bridge-status"),
  onDcsTelemetry: (callback) => {
    ipcRenderer.removeAllListeners("dcs-telemetry");
    ipcRenderer.on("dcs-telemetry", (_event, data) => callback(data));
  },
  getDcsTelemetry: () => ipcRenderer.invoke("get-dcs-telemetry"),
  onUfcDisplay: (callback) => {
    ipcRenderer.removeAllListeners("dcs-ufc-display");
    ipcRenderer.on("dcs-ufc-display", (_event, data) => callback(data));
  },
  sendCommand: (payload) => ipcRenderer.invoke("send-command", payload),
  setDcsTcpPort: (port) => ipcRenderer.invoke("set-dcs-tcp-port", port),
  setDcsTelemetryPort: (port) => ipcRenderer.invoke("set-dcs-telemetry-port", port),

  // Save log
  saveLog: (lines) => ipcRenderer.invoke("save-log", lines),
});
