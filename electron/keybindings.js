const fs = require("fs");
const path = require("path");
const { app } = require("electron");

const CONFIG_FILE = path.join(app.getPath("userData"), "keybindings.json");

// Keys are decimal vkCode strings, values are command names
const DEFAULT_BINDINGS = {
  "77": "HOTKEY_TOGGLE", // M
};

function loadBindings() {
  try {
    const data = fs.readFileSync(CONFIG_FILE, "utf-8");
    const saved = JSON.parse(data);

    // Merge: ensure every default command has a binding
    const savedCommands = new Set(Object.values(saved));
    for (const [vk, cmd] of Object.entries(DEFAULT_BINDINGS)) {
      if (!savedCommands.has(cmd)) {
        saved[vk] = cmd;
      }
    }
    return saved;
  } catch {
    return { ...DEFAULT_BINDINGS };
  }
}

function saveBindings(bindings) {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(bindings, null, 2));
  } catch (err) {
    console.error("Failed to save keybindings:", err.message);
  }
}

module.exports = { DEFAULT_BINDINGS, loadBindings, saveBindings };
