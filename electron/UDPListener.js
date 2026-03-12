const dgram = require("dgram");

class UDPListener {
  constructor(mainWindow, port = 15488) {
    this.mainWindow = mainWindow;
    this.port = port;
    this.socket = null;
    this.lastMessageTime = 0;
    this.activityTimer = null;
    this._status = "disconnected";
    this._bind();
  }

  _bind() {
    this.socket = dgram.createSocket("udp4");

    this.socket.on("message", (rawMsg) => {
      this.lastMessageTime = Date.now();
      this._setStatus("receiving");
      try {
        const msg = JSON.parse(rawMsg.toString());
        if (this.mainWindow && !this.mainWindow.isDestroyed()) {
          this.mainWindow.webContents.send("dcs-message", msg);
        }
      } catch (err) {
        console.error("Failed to parse UDP message:", err.message);
      }
    });

    this.socket.on("error", (err) => {
      console.error("UDP socket error:", err.message);
      this._setStatus("disconnected");
      this.socket.close();
    });

    this.socket.bind(this.port, () => {
      console.log(`UDP listener bound to port ${this.port}`);
      this._setStatus("listening");
    });

    this.activityTimer = setInterval(() => {
      if (this._status === "receiving" && Date.now() - this.lastMessageTime > 5000) {
        this._setStatus("listening");
      }
    }, 2000);
  }

  _setStatus(newStatus) {
    if (this._status === newStatus) return;
    this._status = newStatus;
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send("udp-status", newStatus);
    }
  }

  get status() {
    return this._status;
  }

  rebind(newPort) {
    this.close();
    this.port = newPort;
    this._bind();
  }

  close() {
    if (this.activityTimer) {
      clearInterval(this.activityTimer);
      this.activityTimer = null;
    }
    try {
      this.socket.close();
    } catch {
      // already closed
    }
    this._status = "disconnected";
  }
}

module.exports = UDPListener;
