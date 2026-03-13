import React, { useState, useCallback, useEffect } from "react";
import "../scss/UFC.scss";

// ─── F/A-18C UFC Device & Command Codes (Device 25) ────────────────
const UFC_DEVICE = 25;

const CMD = {
  // Verified against command_defs.lua — UFC (Device 25), count starts at 3000
  AP: 3001,           // FuncSwAP
  IFF: 3002,          // FuncSwIFF
  TCN: 3003,          // FuncSwTCN
  ILS: 3004,          // FuncSwILS
  DL: 3005,           // FuncSwDL
  BCN: 3006,          // FuncSwBCN
  ONOFF: 3007,        // FuncSwOnOff
  COMM1_PULL: 3008,   // Comm1Fcn (push)
  COMM2_PULL: 3009,   // Comm2Fcn (push)
  OS: [3010, 3011, 3012, 3013, 3014], // OptSw1-5
  IP: 3015,           // SwIP
  ADF: 3016,          // SwADF
  EMCON: 3017,        // SwEMCON
  KEY: [3018, 3019, 3020, 3021, 3022, 3023, 3024, 3025, 3026, 3027], // KbdSw0-9
  CLR: 3028,          // KbdSwCLR
  ENT: 3029,          // KbdSwENT
  COMM1_VOL: 3030,    // Comm1Vol
  COMM2_VOL: 3031,    // Comm2Vol
  BRT: 3032,          // BrtDim
  COMM1_CHAN: 3033,    // Comm1Ch (rotate)
  COMM2_CHAN: 3034,    // Comm2Ch (rotate)
};

const MAX_SCRATCHPAD = 7;

// Number keys with compass secondary labels
const NUM_KEYS = [
  { num: 1 },
  { num: 2, alt: "N" },
  { num: 3 },
  { num: 4, alt: "W" },
  { num: 5 },
  { num: 6, alt: "E" },
  { num: 7 },
  { num: 8, alt: "S" },
  { num: 9 },
];

// Mode-specific option display content (5 lines)
const MODE_OPTIONS = {
  TCN: [":T / R", "R C V", ":A / A", ":", "Y"],
  ILS: [":ON", "", "", "", ""],
  AP: [":BARO", ":RAD", "", "", ""],
  IFF: [":M1", ":M2", ":M3/A", "M4", ""],
  DL: [":OWN", ":L16", "", "", ""],
  BCN: [":ON", "", "", "", ""],
};

// Mode-specific scratchpad label
const MODE_LABELS = {
  TCN: "T", ILS: "I", AP: "A", IFF: "F", DL: "D", BCN: "B",
};

const FUNC_BUTTONS = [
  { label: "A/P", key: "AP", code: CMD.AP },
  { label: "IFF", key: "IFF", code: CMD.IFF },
  { label: "TCN", key: "TCN", code: CMD.TCN },
  { label: "ILS", key: "ILS", code: CMD.ILS },
  { label: "D/L", key: "DL", code: CMD.DL },
  { label: "BCN", key: "BCN", code: CMD.BCN },
  { label: "ON\nOFF", key: null, code: CMD.ONOFF, longPress: true },
];

export default function UFC() {
  const [scratchpad, setScratchpad] = useState("");
  const [activeMode, setActiveMode] = useState(null);
  const [comm1Chan, setComm1Chan] = useState(1);
  const [comm2Chan, setComm2Chan] = useState(1);
  const [adfPos, setAdfPos] = useState(0); // 0=OFF, 1=1, 2=2
  const [brightness, setBrightness] = useState(0.7);
  const [dcsDisplay, setDcsDisplay] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [winWidth, setWinWidth] = useState(750);
  const [winHeight, setWinHeight] = useState(460);
  const [theme, setTheme] = useState("stealth");

  // Load saved window dimensions on mount
  useEffect(() => {
    if (!window.electronAPI?.getSettings) return;
    window.electronAPI.getSettings().then(({ settings }) => {
      if (settings.windowWidth) setWinWidth(settings.windowWidth);
      if (settings.windowHeight) setWinHeight(settings.windowHeight);
      if (settings.theme) setTheme(settings.theme);
    });
  }, []);

  const applyWindowSize = useCallback(() => {
    if (!window.electronAPI?.setWindowSize) return;
    window.electronAPI.setWindowSize(winWidth, winHeight);
  }, [winWidth, winHeight]);

  const applyTheme = useCallback((newTheme) => {
    setTheme(newTheme);
    if (window.electronAPI?.setTheme) {
      window.electronAPI.setTheme(newTheme);
    }
  }, []);

  // ─── DCS Display Listener ────────────────────────────────────────
  useEffect(() => {
    if (!window.electronAPI?.onUfcDisplay) return;
    window.electronAPI.onUfcDisplay((data) => {
      setDcsDisplay(data);
    });
  }, []);

  // ─── Derive display values (DCS data takes priority over local state) ──
  const localOptions = activeMode && MODE_OPTIONS[activeMode]
    ? MODE_OPTIONS[activeMode]
    : ["", "", "", "", ""];

  const localScratchpadLabel = activeMode && MODE_LABELS[activeMode]
    ? MODE_LABELS[activeMode]
    : "";

  // When DCS display data is available, use it; otherwise fall back to local state
  const options = dcsDisplay
    ? [1, 2, 3, 4, 5].map((n) => {
        const cue  = dcsDisplay[`OptionCueing${n}`]  || dcsDisplay[`UFC_OptionCueing${n}`]  || "";
        const disp = dcsDisplay[`OptionDisplay${n}`]  || dcsDisplay[`UFC_OptionDisplay${n}`]  || "";
        return cue + disp;
      })
    : localOptions;

  const scratchpadLabel = dcsDisplay
    ? (dcsDisplay.ScratchpadStr1Display || dcsDisplay.UFC_ScratchPadStr1Display || localScratchpadLabel)
    : localScratchpadLabel;

  const scratchpadValue = dcsDisplay
    ? (dcsDisplay.ScratchpadNumberDisplay || dcsDisplay.UFC_ScratchPadNumberDisplay || scratchpad)
    : scratchpad;

  const displayComm1 = dcsDisplay
    ? (dcsDisplay.Comm1Display || dcsDisplay.UFC_Comm1Display || comm1Chan)
    : comm1Chan;

  const displayComm2 = dcsDisplay
    ? (dcsDisplay.Comm2Display || dcsDisplay.UFC_Comm2Display || comm2Chan)
    : comm2Chan;

  // ─── DCS Command Sender ──────────────────────────────────────────
  const sendBtn = useCallback((code, device = UFC_DEVICE) => {
    if (!window.electronAPI) return;
    window.electronAPI.sendCommand({
      type: "commands",
      payload: [{ device, code, delay: 100, activate: 1, addDepress: true }],
    });
  }, []);

  const sendBtnLong = useCallback((code, device = UFC_DEVICE) => {
    if (!window.electronAPI) return;
    window.electronAPI.sendCommand({
      type: "commands",
      payload: [{ device, code, delay: 600, activate: 1, addDepress: true }],
    });
  }, []);

  // Rotary encoder: +0.1 = CW (up), -0.1 = CCW (down)
  const sendRotary = useCallback((code, direction, device = UFC_DEVICE) => {
    if (!window.electronAPI) return;
    window.electronAPI.sendCommand({
      type: "commands",
      payload: [{ device, code, delay: 100, activate: direction > 0 ? 0.1 : -0.1, addDepress: false }],
    });
  }, []);

  // ─── Handlers ────────────────────────────────────────────────────
  const pressNum = useCallback((num) => {
    setScratchpad((prev) => (prev.length >= MAX_SCRATCHPAD ? prev : prev + num));
    sendBtn(CMD.KEY[num]);
  }, [sendBtn]);

  const pressClear = useCallback(() => {
    setScratchpad((prev) => prev.slice(0, -1));
    sendBtn(CMD.CLR);
  }, [sendBtn]);

  const pressEnter = useCallback(() => {
    setScratchpad("");
    sendBtn(CMD.ENT);
  }, [sendBtn]);

  const pressMode = useCallback((key, code, longPress) => {
    if (key) setActiveMode((prev) => (prev === key ? null : key));
    if (longPress) {
      sendBtnLong(code);
    } else {
      sendBtn(code);
    }
  }, [sendBtn, sendBtnLong]);

  const pressOS = useCallback((i) => sendBtn(CMD.OS[i]), [sendBtn]);

  const toggleAdf = useCallback(() => {
    setAdfPos((prev) => (prev + 1) % 3);
    sendBtn(CMD.ADF);
  }, [sendBtn]);

  // ─── Keyboard ────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (e.key >= "0" && e.key <= "9") pressNum(parseInt(e.key));
      else if (e.key === "Backspace") { e.preventDefault(); pressClear(); }
      else if (e.key === "Enter") pressEnter();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pressNum, pressClear, pressEnter]);

  // ─── COMM Channel Up/Down ────────────────────────────────────────
  const commUp = useCallback((setter, cmd) => {
    setter((p) => Math.min(20, p + 1));
    sendRotary(cmd, 1);
  }, [sendRotary]);

  const commDown = useCallback((setter, cmd) => {
    setter((p) => Math.max(1, p - 1));
    sendRotary(cmd, -1);
  }, [sendRotary]);

  const scrollBrt = useCallback((e) => {
    e.preventDefault();
    setBrightness((p) => Math.max(0.1, Math.min(1, p + (e.deltaY < 0 ? 0.05 : -0.05))));
  }, []);

  // ─── Render ──────────────────────────────────────────────────────
  return (
    <div className={`ufc-panel${theme !== "stealth" ? ` theme-${theme}` : ""}`}>
      {/* Drag handle */}
      <div className="ufc-top-bar">
        <span className="ufc-top-label">UFC</span>
        <span className="ufc-top-label">IFEI</span>
        <button
          className="ufc-settings-btn"
          onClick={() => setSettingsOpen((p) => !p)}
          title="Settings"
        >&#9881;</button>
      </div>

      {settingsOpen && (
        <div className="ufc-settings-overlay">
          <div className="ufc-settings-panel">
            <div className="ufc-settings-header">
              <span>SETTINGS</span>
              <button className="ufc-settings-close" onClick={() => setSettingsOpen(false)}>&times;</button>
            </div>
            <div className="ufc-settings-body">
              <label className="ufc-settings-label">
                WIDTH
                <input
                  type="number"
                  className="ufc-settings-input"
                  value={winWidth}
                  min={500}
                  max={3840}
                  onChange={(e) => setWinWidth(parseInt(e.target.value, 10) || 500)}
                />
              </label>
              <label className="ufc-settings-label">
                HEIGHT
                <input
                  type="number"
                  className="ufc-settings-input"
                  value={winHeight}
                  min={300}
                  max={2160}
                  onChange={(e) => setWinHeight(parseInt(e.target.value, 10) || 300)}
                />
              </label>
              <label className="ufc-settings-label">
                THEME
                <select
                  className="ufc-settings-input"
                  value={theme}
                  onChange={(e) => applyTheme(e.target.value)}
                >
                  <option value="stealth">Stealth</option>
                  <option value="hornet">Hornet</option>
                  <option value="viper">Viper</option>
                </select>
              </label>
              <button className="ufc-settings-apply" onClick={applyWindowSize}>APPLY</button>
            </div>
          </div>
        </div>
      )}

      <div className="ufc-main">
        {/* ── Left Column ── */}
        <div className="ufc-col ufc-col-left">
          <button className="ufc-round-btn ufc-ip-btn" onClick={() => sendBtn(CMD.IP)}>
            I/P
          </button>

          <div className="ufc-adf" onClick={toggleAdf}>
            <span className="ufc-tiny-label">ADF</span>
            <div className="ufc-adf-switch">
              <div className={`ufc-adf-pos ${adfPos === 1 ? "on" : ""}`}>1</div>
              <div className={`ufc-adf-pos ufc-adf-off ${adfPos === 0 ? "on" : ""}`}>OFF</div>
              <div className={`ufc-adf-pos ${adfPos === 2 ? "on" : ""}`}>2</div>
            </div>
          </div>

          <span className="ufc-tiny-label ufc-push-bottom">COMM 1</span>
          <div className="ufc-chan-ctrl">
            <button className="ufc-chan-btn" onClick={() => commUp(setComm1Chan, CMD.COMM1_CHAN)}>▲</button>
            <div className="ufc-chan-display" onClick={() => sendBtn(CMD.COMM1_PULL)}>{displayComm1}</div>
            <button className="ufc-chan-btn" onClick={() => commDown(setComm1Chan, CMD.COMM1_CHAN)}>▼</button>
          </div>
        </div>

        {/* ── Center: Scratchpad + Numpad ── */}
        <div className="ufc-center">
          <div className="ufc-scratchpad">
            <span className="ufc-sp-left">{scratchpadLabel}</span>
            <span className="ufc-sp-right">{scratchpadValue}</span>
          </div>

          <div className="ufc-numpad">
            {NUM_KEYS.map(({ num, alt }) => (
              <button key={num} className="ufc-num-btn" onClick={() => pressNum(num)}>
                {alt && <span className="ufc-num-alt">{alt}</span>}
                <span className="ufc-num-val">{num}</span>
              </button>
            ))}
            <button className="ufc-num-btn ufc-num-fn" onClick={pressClear}>
              <span className="ufc-num-val">CLR</span>
            </button>
            <button className="ufc-num-btn" onClick={() => pressNum(0)}>
              <span className="ufc-num-alt">-</span>
              <span className="ufc-num-val">0</span>
            </button>
            <button className="ufc-num-btn ufc-num-fn" onClick={pressEnter}>
              <span className="ufc-num-val">ENT</span>
            </button>
          </div>
        </div>

        {/* ── OSB Column ── */}
        <div className="ufc-osb-col">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="ufc-osb-slot">
              <button className="ufc-round-btn ufc-osb" onClick={() => pressOS(i)} />
            </div>
          ))}
        </div>

        {/* ── Option Display ── */}
        <div className="ufc-options">
          {options.map((text, i) => (
            <div key={i} className="ufc-opt-line">
              <span>{text}</span>
            </div>
          ))}
        </div>

        {/* ── Right Column ── */}
        <div className="ufc-col ufc-col-right">
          <span className="ufc-tiny-label">BRT</span>
          <div
            className="ufc-brt-knob"
            onWheel={scrollBrt}
          />
          <span className="ufc-tiny-label">DIM</span>

          <button className="ufc-emcon-btn" onClick={() => sendBtn(CMD.EMCON)}>
            <span>EM</span><span>CON</span>
          </button>

          <span className="ufc-tiny-label ufc-push-bottom">COMM 2</span>
          <div className="ufc-chan-ctrl">
            <button className="ufc-chan-btn" onClick={() => commUp(setComm2Chan, CMD.COMM2_CHAN)}>▲</button>
            <div className="ufc-chan-display" onClick={() => sendBtn(CMD.COMM2_PULL)}>{displayComm2}</div>
            <button className="ufc-chan-btn" onClick={() => commDown(setComm2Chan, CMD.COMM2_CHAN)}>▼</button>
          </div>
        </div>
      </div>

      {/* ── Bottom Row ── */}
      <div className="ufc-bottom">
        <div className="ufc-round-btn ufc-indicator">
          <div className="ufc-indicator-dot ufc-dot-green" />
        </div>
        {FUNC_BUTTONS.map(({ label, key, code, longPress }) => (
          <button
            key={label}
            className={`ufc-func-btn ${key && activeMode === key ? "active" : ""}`}
            onClick={() => pressMode(key, code, longPress)}
          >{label}</button>
        ))}
        <div className="ufc-round-btn ufc-indicator">
          <div className="ufc-indicator-dot ufc-dot-blue" />
        </div>
      </div>
    </div>
  );
}
