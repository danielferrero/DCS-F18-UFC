-- UFC Export: DCS cockpit button automation + telemetry sender
-- Chains with existing Export scripts (TheWay, Tacview, SRS, etc.)
-- TCP server receives button-press commands from the Electron app
-- UDP sender broadcasts aircraft telemetry

local socket = require("socket")

-- ---------------------------------------------------------------------------
-- Config
-- ---------------------------------------------------------------------------
local UFC_TCP_PORT = 42072
local UFC_UDP_TELEMETRY_PORT = 42070
local UFC_TELEMETRY_INTERVAL = 1.0  -- seconds
local UFC_DISPLAY_INTERVAL = 0.2    -- 200ms (5 Hz) for responsive display updates
local UFC_DISPLAY_INDICATOR = 6     -- F/A-18C UFC display indicator ID

-- ---------------------------------------------------------------------------
-- State
-- ---------------------------------------------------------------------------
local ufcTcpServer = nil
local ufcTcpClient = nil
local ufcUdpTelemetry = nil

local ufcCommandQueue = {}
local ufcQueueIndex = 0
local ufcLastCommandTime = 0
local ufcPendingDepress = nil

local ufcLastTelemetryTime = 0
local ufcLastDisplayTime = 0
local ufcDisplayDumped = false

-- ---------------------------------------------------------------------------
-- JSON helpers
-- ---------------------------------------------------------------------------
local function ufcJsonEscape(s)
    return s:gsub('\\', '\\\\'):gsub('"', '\\"'):gsub('\n', '\\n'):gsub('\r', '\\r')
end

local function ufcParseJSON(str)
    local ok, json = pcall(require, "json")
    if ok and json then
        local success, result = pcall(json.decode, str)
        if success then return result end
    end
    local lua = str
    lua = lua:gsub('%[', '{'):gsub('%]', '}')
    lua = lua:gsub('"([^"]+)"%s*:', '["%1"]=')
    lua = lua:gsub(': *true', '=true'):gsub(': *false', '=false')
    lua = lua:gsub(': *null', '=nil')
    local fn = loadstring("return " .. lua)
    if fn then
        setfenv(fn, {})
        local s, r = pcall(fn)
        if s then return r end
    end
    return nil
end

-- ---------------------------------------------------------------------------
-- Display reading helpers
-- ---------------------------------------------------------------------------
local function ufcParseIndication(indicator_id)
    local s = list_indication(indicator_id)
    if not s or s == "" or s == "\n" then return nil end

    local result = {}
    local lines = {}
    for line in s:gmatch("([^\n]*)\n") do
        lines[#lines + 1] = line
    end

    -- Skip separator lines (dashes)
    local i = 1
    while i <= #lines and lines[i]:match("^%-%-%-") do
        i = i + 1
    end

    -- Parse name/value pairs
    while i + 1 <= #lines do
        local name = lines[i]:match("^%s*(.-)%s*$")
        local value = lines[i + 1]:match("^%s*(.-)%s*$")
        if name and name ~= "" then
            result[name] = value or ""
        end
        i = i + 2
    end

    return next(result) and result or nil
end

-- One-time dump of all indicators to a log file for field-name discovery
local function ufcDumpIndicators()
    if ufcDisplayDumped then return end
    ufcDisplayDumped = true

    local logPath = lfs.writedir() .. "Logs\\ufc-indicators-dump.txt"
    local f = io.open(logPath, "w")
    if not f then return end

    f:write("UFC Indicator Dump — " .. os.date() .. "\n")
    f:write(string.rep("=", 50) .. "\n\n")

    for id = 0, 25 do
        local ok, s = pcall(list_indication, id)
        if ok and s and s ~= "" and s ~= "\n" then
            f:write(string.format("--- Indicator %d ---\n", id))
            f:write(s)
            f:write("\n\n")
        end
    end

    f:close()
end

-- ---------------------------------------------------------------------------
-- Core logic (called from chained export callbacks)
-- ---------------------------------------------------------------------------
local function ufcStart()
    ufcTcpServer = socket.tcp()
    ufcTcpServer:setsockname("127.0.0.1", UFC_TCP_PORT)
    ufcTcpServer:listen(1)
    ufcTcpServer:settimeout(0)

    ufcUdpTelemetry = socket.udp()
    ufcUdpTelemetry:setpeername("127.0.0.1", UFC_UDP_TELEMETRY_PORT)
    ufcUdpTelemetry:settimeout(0)

    ufcCommandQueue = {}
    ufcQueueIndex = 0
    ufcPendingDepress = nil
end

local function ufcBeforeNextFrame()
    if not ufcTcpServer then return end

    local now = LoGetModelTime() or 0

    -- Handle pending button depress (release)
    if ufcPendingDepress and now >= ufcPendingDepress.time then
        pcall(function()
            GetDevice(ufcPendingDepress.device):performClickableAction(
                ufcPendingDepress.code, 0
            )
        end)
        ufcPendingDepress = nil
    end

    -- Process command queue
    if ufcQueueIndex > 0 and ufcQueueIndex <= #ufcCommandQueue and ufcPendingDepress == nil then
        local cmd = ufcCommandQueue[ufcQueueIndex]
        local delay = (cmd.delay or 100) / 1000

        if (now - ufcLastCommandTime) >= delay then
            pcall(function()
                GetDevice(cmd.device):performClickableAction(
                    cmd.code, cmd.activate or 1
                )
            end)

            if cmd.addDepress == "true" or cmd.addDepress == true then
                ufcPendingDepress = {
                    device = cmd.device,
                    code = cmd.code,
                    time = now + 0.04,
                }
            end

            ufcLastCommandTime = now
            ufcQueueIndex = ufcQueueIndex + 1

            if ufcQueueIndex > #ufcCommandQueue then
                ufcCommandQueue = {}
                ufcQueueIndex = 0
            end
        end
    end

    -- Accept new TCP connections
    local client = ufcTcpServer:accept()
    if client then
        if ufcTcpClient then
            pcall(function() ufcTcpClient:close() end)
        end
        ufcTcpClient = client
        ufcTcpClient:settimeout(0)
    end

    -- Read data from connected client
    if ufcTcpClient then
        local data, err = ufcTcpClient:receive("*l")
        if data then
            local msg = ufcParseJSON(data)
            if msg and msg.type == "commands" and msg.payload then
                ufcCommandQueue = msg.payload
                ufcQueueIndex = 1
                ufcLastCommandTime = now
            end
        elseif err == "closed" then
            pcall(function() ufcTcpClient:close() end)
            ufcTcpClient = nil
        end
    end
end

local function ufcAfterNextFrame()
    if not ufcUdpTelemetry then return end

    local now = LoGetModelTime() or 0

    -- ── Telemetry (1 Hz) ─────────────────────────────────────────────
    if (now - ufcLastTelemetryTime) >= UFC_TELEMETRY_INTERVAL then
        ufcLastTelemetryTime = now

        local selfData = LoGetSelfData()
        if selfData then
            local model = selfData.Name or "unknown"
            local lat = 0
            local lon = 0
            local alt = 0

            pcall(function()
                if selfData.LatLongAlt then
                    lat = selfData.LatLongAlt.Lat or 0
                    lon = selfData.LatLongAlt.Long or 0
                    alt = selfData.LatLongAlt.Alt or 0
                end
            end)

            local telemetry = string.format(
                '{"type":"telemetry","model":"%s","lat":%.8f,"lon":%.8f,"alt":%.1f}',
                ufcJsonEscape(model), lat, lon, alt
            )

            pcall(function()
                ufcUdpTelemetry:send(telemetry)
            end)
        end
    end

    -- ── UFC Display (5 Hz) ───────────────────────────────────────────
    if (now - ufcLastDisplayTime) >= UFC_DISPLAY_INTERVAL then
        ufcLastDisplayTime = now

        -- One-time indicator dump for field-name discovery
        pcall(ufcDumpIndicators)

        -- Read UFC display via list_indication
        local ok, display = pcall(ufcParseIndication, UFC_DISPLAY_INDICATOR)
        if ok and display then
            local parts = {}
            for k, v in pairs(display) do
                parts[#parts + 1] = string.format('"%s":"%s"', ufcJsonEscape(k), ufcJsonEscape(v))
            end
            if #parts > 0 then
                local json = '{"type":"ufc_display",' .. table.concat(parts, ',') .. '}'
                pcall(function() ufcUdpTelemetry:send(json) end)
            end
        end
    end
end

local function ufcStop()
    if ufcTcpClient then pcall(function() ufcTcpClient:close() end); ufcTcpClient = nil end
    if ufcTcpServer then pcall(function() ufcTcpServer:close() end); ufcTcpServer = nil end
    if ufcUdpTelemetry then pcall(function() ufcUdpTelemetry:close() end); ufcUdpTelemetry = nil end
    ufcCommandQueue = {}
    ufcQueueIndex = 0
    ufcPendingDepress = nil
end

-- ---------------------------------------------------------------------------
-- Chain with existing export callbacks (preserves TheWay, Tacview, SRS, etc.)
-- ---------------------------------------------------------------------------
local ufcPrevExportStart = LuaExportStart
local ufcPrevExportBeforeNextFrame = LuaExportBeforeNextFrame
local ufcPrevExportAfterNextFrame = LuaExportAfterNextFrame
local ufcPrevExportStop = LuaExportStop

function LuaExportStart()
    if ufcPrevExportStart then pcall(ufcPrevExportStart) end
    pcall(ufcStart)
end

function LuaExportBeforeNextFrame()
    if ufcPrevExportBeforeNextFrame then pcall(ufcPrevExportBeforeNextFrame) end
    pcall(ufcBeforeNextFrame)
end

function LuaExportAfterNextFrame()
    if ufcPrevExportAfterNextFrame then pcall(ufcPrevExportAfterNextFrame) end
    pcall(ufcAfterNextFrame)
end

function LuaExportStop()
    if ufcPrevExportStop then pcall(ufcPrevExportStop) end
    pcall(ufcStop)
end
