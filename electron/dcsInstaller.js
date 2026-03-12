const fs = require("fs");
const path = require("path");
const os = require("os");
const { app } = require("electron");

const SCRIPTS = [
  { src: "Hooks/ufc-hook.lua", dest: "Scripts/Hooks/ufc-hook.lua" },
  { src: "Export/ufc-export.lua", dest: "Scripts/Export/ufc-export.lua" },
];

function getScriptsSourceDir() {
  return app.isPackaged
    ? path.join(process.resourcesPath, "Scripts")
    : path.join(__dirname, "..", "Scripts");
}

function detectDcsPaths() {
  const savedGamesDir = path.join(os.homedir(), "Saved Games");
  const found = [];

  if (!fs.existsSync(savedGamesDir)) {
    console.log("[dcs-installer] Saved Games directory not found");
    return found;
  }

  try {
    const entries = fs.readdirSync(savedGamesDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && entry.name.startsWith("DCS")) {
        found.push(path.join(savedGamesDir, entry.name));
      }
    }
  } catch (err) {
    console.error("[dcs-installer] Error scanning Saved Games:", err.message);
  }

  return found;
}

const DOFILE_LINE = `dofile(lfs.writedir()..[[Scripts\\Export\\ufc-export.lua]])`;
const DOFILE_MARKER = "ufc-export.lua";

function ensureExportLoader(dcsPath, results) {
  const exportLua = path.join(dcsPath, "Scripts", "Export.lua");
  const exportDir = path.dirname(exportLua);

  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }

  if (fs.existsSync(exportLua)) {
    const content = fs.readFileSync(exportLua, "utf8");
    if (content.includes(DOFILE_MARKER)) {
      console.log(`[dcs-installer] Export.lua already loads ufc-export.lua`);
      results.skipped.push(exportLua);
      return;
    }
    // Append dofile line to existing Export.lua
    fs.appendFileSync(exportLua, `\n${DOFILE_LINE}\n`, "utf8");
    console.log(`[dcs-installer] Appended dofile to existing Export.lua: ${exportLua}`);
    results.installed.push(`${exportLua} (appended dofile)`);
  } else {
    // Create Export.lua with dofile line
    fs.writeFileSync(exportLua, `${DOFILE_LINE}\n`, "utf8");
    console.log(`[dcs-installer] Created Export.lua with dofile: ${exportLua}`);
    results.installed.push(`${exportLua} (created)`);
  }
}

function installScripts(settings) {
  if (settings.dcsAutoInstallScripts === false) {
    console.log("[dcs-installer] Auto-install disabled in settings");
    return { installed: [], skipped: [], errors: [] };
  }

  let dcsPaths;
  if (settings.dcsSavedGamesPaths && settings.dcsSavedGamesPaths.length > 0) {
    dcsPaths = settings.dcsSavedGamesPaths;
    console.log("[dcs-installer] Using manually configured paths:", dcsPaths);
  } else {
    dcsPaths = detectDcsPaths();
    console.log("[dcs-installer] Auto-detected DCS paths:", dcsPaths);
  }

  if (dcsPaths.length === 0) {
    console.log("[dcs-installer] No DCS Saved Games folders found, skipping");
    return { installed: [], skipped: [], errors: [] };
  }

  const sourceDir = getScriptsSourceDir();
  const results = { installed: [], skipped: [], errors: [] };

  for (const dcsPath of dcsPaths) {
    for (const script of SCRIPTS) {
      const srcFile = path.join(sourceDir, script.src);
      const destFile = path.join(dcsPath, script.dest);

      try {
        if (!fs.existsSync(srcFile)) {
          const msg = `Source not found: ${srcFile}`;
          console.error(`[dcs-installer] ${msg}`);
          results.errors.push(msg);
          continue;
        }

        const destDir = path.dirname(destFile);
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
          console.log(`[dcs-installer] Created directory: ${destDir}`);
        }

        if (fs.existsSync(destFile)) {
          const srcContent = fs.readFileSync(srcFile);
          const destContent = fs.readFileSync(destFile);
          if (srcContent.equals(destContent)) {
            console.log(`[dcs-installer] Already up to date: ${destFile}`);
            results.skipped.push(destFile);
            continue;
          }
        }

        fs.copyFileSync(srcFile, destFile);
        console.log(`[dcs-installer] Installed: ${srcFile} -> ${destFile}`);
        results.installed.push(destFile);
      } catch (err) {
        const msg = `Error installing ${script.src} to ${dcsPath}: ${err.message}`;
        console.error(`[dcs-installer] ${msg}`);
        results.errors.push(msg);
      }
    }

    // Ensure Export.lua loads ufc-export.lua via dofile()
    try {
      ensureExportLoader(dcsPath, results);
    } catch (err) {
      const msg = `Error updating Export.lua in ${dcsPath}: ${err.message}`;
      console.error(`[dcs-installer] ${msg}`);
      results.errors.push(msg);
    }
  }

  return results;
}

module.exports = { detectDcsPaths, installScripts };
