const fs = require("fs");
const path = require("path");
const { app } = require("electron");

const CONFIG_FILE = path.join(app.getPath("userData"), "settings.json");

const DEFAULTS = {
  udpPort: 15488,
  dcsTcpPort: 42072,
  dcsTelemetryPort: 42070,
  dcsAutoInstallScripts: true,
  dcsSavedGamesPaths: [],
  windowWidth: 750,
  windowHeight: 460,
  theme: "stealth",
};

function loadSettings() {
  try {
    const data = fs.readFileSync(CONFIG_FILE, "utf-8");
    const saved = JSON.parse(data);
    return { ...DEFAULTS, ...saved };
  } catch {
    return { ...DEFAULTS };
  }
}

function saveSettings(settings) {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(settings, null, 2));
  } catch (err) {
    console.error("Failed to save settings:", err.message);
  }
}

module.exports = { DEFAULTS, loadSettings, saveSettings };
