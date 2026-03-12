const dgram = require("dgram");
const net = require("net");

class DCSBridge {
  constructor(mainWindow, tcpPort = 42072, telemetryPort = 42070) {
    this.mainWindow = mainWindow;
    this.tcpPort = tcpPort;
    this.telemetryPort = telemetryPort;

    this.telemetrySocket = null;
    this.lastTelemetry = null;
    this.lastTelemetryTime = 0;
    this.activityTimer = null;
    this._status = "disconnected";
    this._sending = false;

    this._bindTelemetry();
  }

  _bindTelemetry() {
    this.telemetrySocket = dgram.createSocket("udp4");

    this.telemetrySocket.on("message", (rawMsg) => {
      this.lastTelemetryTime = Date.now();
      this._setStatus("connected");
      try {
        const data = JSON.parse(rawMsg.toString());
        if (data.type === "telemetry") {
          this.lastTelemetry = {
            model: data.model,
            lat: data.lat,
            lon: data.lon,
            alt: data.alt,
          };
          if (this.mainWindow && !this.mainWindow.isDestroyed()) {
            this.mainWindow.webContents.send("dcs-telemetry", this.lastTelemetry);
          }
        } else if (data.type === "ufc_display") {
          if (this.mainWindow && !this.mainWindow.isDestroyed()) {
            this.mainWindow.webContents.send("dcs-ufc-display", data);
          }
        }
      } catch (err) {
        console.error("Failed to parse DCS telemetry:", err.message);
      }
    });

    this.telemetrySocket.on("error", (err) => {
      console.error("DCS telemetry socket error:", err.message);
      this._setStatus("disconnected");
      try { this.telemetrySocket.close(); } catch {}
    });

    this.telemetrySocket.bind(this.telemetryPort, () => {
      console.log(`DCS telemetry listener bound to port ${this.telemetryPort}`);
      this._setStatus("listening");
    });

    // Activity timeout — drop to "listening" after 5s of no telemetry
    this.activityTimer = setInterval(() => {
      if (this._status === "connected" && Date.now() - this.lastTelemetryTime > 5000) {
        this._setStatus("listening");
        this.lastTelemetry = null;
      }
    }, 2000);
  }

  _setStatus(newStatus) {
    if (this._status === newStatus) return;
    this._status = newStatus;
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send("dcs-bridge-status", newStatus);
    }
  }

  get status() {
    return this._status;
  }

  get telemetry() {
    return this.lastTelemetry;
  }

  /**
   * Send a command payload to DCS via TCP.
   * @param {{ type: string, payload: Array }} commandPayload
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  sendCommand(commandPayload) {
    if (this._sending) {
      return Promise.resolve({ success: false, error: "SEND IN PROGRESS" });
    }

    this._sending = true;

    return new Promise((resolve) => {
      let settled = false;
      const done = (result) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        this._sending = false;
        resolve(result);
      };

      const client = new net.Socket();
      const timeout = setTimeout(() => {
        client.destroy();
        done({ success: false, error: "CONNECTION TIMEOUT" });
      }, 3000);

      client
        .connect(this.tcpPort, "127.0.0.1", () => {
          client.write(JSON.stringify(commandPayload) + "\n");
          client.end();
          done({ success: true });
        })
        .on("error", (err) => {
          if (err.code === "ECONNREFUSED") {
            done({ success: false, error: "DCS EXPORT SCRIPT NOT RUNNING" });
          } else {
            done({ success: false, error: err.message.toUpperCase() });
          }
        });
    });
  }

  rebindTelemetry(newPort) {
    this.close();
    this.telemetryPort = newPort;
    this._bindTelemetry();
  }

  close() {
    if (this.activityTimer) {
      clearInterval(this.activityTimer);
      this.activityTimer = null;
    }
    try {
      this.telemetrySocket.close();
    } catch {
      // already closed
    }
    this.lastTelemetry = null;
    this._status = "disconnected";
  }
}

module.exports = DCSBridge;
