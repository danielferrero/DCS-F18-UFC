-- UFC: Headless DCS message collector + UDP sender
-- Captures in-game messages and sends them to the external Electron app via UDP

local function loadUFC()
    local base = _G

    local lfs = base.require("lfs")
    local Tools = base.require("tools")

    ---------------------------------------------------------------------------
    -- State
    ---------------------------------------------------------------------------
    local messages = {}
    local MAX_MESSAGES = 200
    local udpSocket = nil
    local socketReady = false

    local logFile = io.open(lfs.writedir() .. [[Logs\UFC.log]], "w")

    ---------------------------------------------------------------------------
    -- Config
    ---------------------------------------------------------------------------
    local UDP_HOST = "127.0.0.1"
    local UDP_PORT = 15488

    ---------------------------------------------------------------------------
    -- Logging
    ---------------------------------------------------------------------------
    local function log(str)
        if logFile then
            logFile:write(os.date("%H:%M:%S") .. " " .. tostring(str) .. "\n")
            logFile:flush()
        end
    end

    ---------------------------------------------------------------------------
    -- JSON encoding (minimal, for flat message objects)
    ---------------------------------------------------------------------------
    local function jsonEscape(s)
        s = s:gsub('\\', '\\\\')
        s = s:gsub('"', '\\"')
        s = s:gsub('\n', '\\n')
        s = s:gsub('\r', '\\r')
        s = s:gsub('\t', '\\t')
        return s
    end

    local function messageToJson(msg)
        return string.format(
            '{"time":"%s","from":"%s","text":"%s"}',
            jsonEscape(msg.time or ""),
            jsonEscape(msg.from or ""),
            jsonEscape(msg.text or "")
        )
    end

    ---------------------------------------------------------------------------
    -- UDP Socket
    ---------------------------------------------------------------------------
    local function initSocket()
        if socketReady then return true end

        local ok, err = pcall(function()
            package.path = package.path .. ";" .. lfs.currentdir() .. "/LuaSocket/?.lua"
            package.cpath = package.cpath .. ";" .. lfs.currentdir() .. "/LuaSocket/?.dll"

            local socket = require("socket")
            udpSocket = socket.udp()
            udpSocket:setpeername(UDP_HOST, UDP_PORT)
            udpSocket:settimeout(0) -- non-blocking
            socketReady = true
            log("UDP socket initialized -> " .. UDP_HOST .. ":" .. UDP_PORT)
        end)

        if not ok then
            log("ERROR initializing UDP socket: " .. tostring(err))
            return false
        end
        return true
    end

    local function sendMessage(msg)
        if not socketReady then return end

        local json = messageToJson(msg)
        local ok, err = pcall(function()
            udpSocket:send(json)
        end)
        if not ok then
            log("ERROR sending UDP: " .. tostring(err))
        end
    end

    ---------------------------------------------------------------------------
    -- Message management
    ---------------------------------------------------------------------------
    local function formatTimestamp()
        local t = os.date("*t")
        return string.format("[%02d:%02d:%02d]", t.hour, t.min, t.sec)
    end

    local function addMessage(from, text)
        local msg = {
            time = formatTimestamp(),
            from = from or "SYSTEM",
            text = text or "",
        }
        table.insert(messages, msg)

        while #messages > MAX_MESSAGES do
            table.remove(messages, 1)
        end

        sendMessage(msg)
    end

    ---------------------------------------------------------------------------
    -- DCS User Callbacks
    ---------------------------------------------------------------------------
    local handler = {}

    function handler.onSimulationFrame()
        if not socketReady then
            initSocket()
        end
    end

    function handler.onMissionLoadEnd()
        log("Mission loaded")
    end

    function handler.onSimulationStop()
        log("Simulation stopped")
    end

    function handler.onChatMessage(message, from)
        log("Chat message from " .. tostring(from) .. ": " .. tostring(message))
        addMessage(from, message)
    end

    function handler.onTriggerMessage(message, duration, clearView)
        log("Trigger message: " .. tostring(message))
        addMessage("TRIGGER", message)
    end

    function handler.onRadioMessage(message, duration)
        log("Radio message: " .. tostring(message))
        addMessage("RADIO", message)
    end

    DCS.setUserCallbacks(handler)

    log("UFC headless hook loaded successfully")
end

-- wrap in pcall so errors don't crash DCS
local status, err = pcall(loadUFC)
if not status then
    net.log("[UFC] Load Error: " .. tostring(err))
end
