---@class QueueEntry
---@field priority number
---@field joinedAt  number
---@field time      number

---@class QueuePlayer
---@field Source     number
---@field Groups     string[]
---@field Name       string
---@field Discord    string
---@field Mention    string
---@field AccountID  string
---@field Identifier string
---@field SteamName  string?
---@field Priority   number
---@field Message    string
---@field Deferrals  table
---@field Timer      table

-- ── State ─────────────────────────────────────────────────────────────────────

local _queueActive  = false
local _queueClosed  = false
local _dbReady      = false
local _dbReadyTime  = 0
local MAX_PLAYERS   = tonumber(GetConvar("sv_maxclients", "32"))

local _connectors   = {}  ---@type table<string, {source: number}>
local _connCount    = 0
local _crashPrio    = {}  ---@type {Identifier: string, Grace: number}[]
local _tempPrio     = {}  ---@type {Identifier: string, Priority: number}[]
local _connecting   = {}  ---@type table<string, QueuePlayer>

-- Local-mode only state
local _playersData  = {}  ---@type table<string, QueuePlayer>
local _players      = {}  ---@type table<string, QueueEntry>
local _sorted       = {}  ---@type string[]
local _history      = {}  ---@type table<string, {joinedAt: number, expires: number}>

GlobalState["MaxPlayers"] = MAX_PLAYERS

local function IsWebMode()
    return Config.QueueMode == "web"
end

-- ── Helpers ───────────────────────────────────────────────────────────────────

---@param msg string
local function Log(msg)
    Strata.Log.Info("Queue", msg, { console = true })
end

---@param source number
---@return string?
local function GetPlayerLicense(source)
    for _, id in ipairs(GetPlayerIdentifiers(source)) do
        if id:sub(1, 8) == "license:" then return id:sub(9) end
    end
end

---@param source number
---@return string?
local function GetPlayerSteam(source)
    for _, id in ipairs(GetPlayerIdentifiers(source)) do
        if id:sub(1, 6) == "steam:" then return id end
    end
end

---@param source number
---@return boolean
local function IsSteamRunning(source)
    return GetPlayerSteam(source) ~= nil
end

---@param source number
---@return string?
local function GetPlayerSteamName(source)
    if GetPlayerSteam(source) then
        local name = GetPlayerName(source)
        if name and name ~= "Unknown" then return name end
    end
end

-- ── Crash / temp priority ────────────────────────────────────────────────────

---@param identifier string
---@return boolean
local function HasCrashPriority(identifier)
    for _, v in ipairs(_crashPrio) do
        if v.Identifier == identifier and os.time() < v.Grace then return true end
    end
    return false
end

---@param identifier string
---@return {Identifier: string, Priority: number}?
local function HasTempPriority(identifier)
    for _, v in ipairs(_tempPrio) do
        if v.Identifier == identifier then return v end
    end
end

---@param identifier string
local function RemoveTempPriority(identifier)
    for k, v in ipairs(_tempPrio) do
        if v.Identifier == identifier then
            table.remove(_tempPrio, k)
            return
        end
    end
end

-- ── Local-mode queue helpers ─────────────────────────────────────────────────

local function SortedKeys(tbl, sortFn)
    local keys = {}
    for k in pairs(tbl) do keys[#keys + 1] = k end
    table.sort(keys, function(a, b) return sortFn(tbl[a], tbl[b]) end)
    return keys
end

local function SortQueue()
    _sorted = SortedKeys(_players, function(a, b)
        if a.priority ~= b.priority then return a.priority > b.priority end
        return a.joinedAt < b.joinedAt
    end)
end

local function PopFromQueue(identifier, disconnect)
    if not _players[identifier] then return end
    _players[identifier] = nil
    local ply = _playersData[identifier]
    if ply and disconnect then
        Log(string.format(Config.Strings.Disconnected, ply.Name, ply.SteamName or ply.AccountID, ply.Identifier))
    end
    _playersData[identifier] = nil
    SortQueue()
end

local function GetPosition(identifier)
    local found
    for k, v in ipairs(_sorted) do
        if v == identifier then found = k end
    end
    return found, #_sorted
end

local function Check(identifier)
    return _sorted[1] == identifier
end

local function GetCount()
    local n = 0
    for _ in pairs(_players) do n += 1 end
    return n
end

local function CheckGhosts()
    for k, v in pairs(_connectors) do
        if not GetPlayerEndpoint(v.source) then _connectors[k] = nil end
    end
    local n = 0
    for _ in pairs(_connectors) do n += 1 end
    _connCount = n
end

-- ── Player class (shared by both modes) ──────────────────────────────────────

---@param identifier string
---@param source     number
---@param deferrals  table
---@param steamName  string?
---@return QueuePlayer
local function PlayerClass(identifier, source, deferrals, steamName)
    local playerName = steamName or GetPlayerName(source) or "Unknown"
    local prio, msg = 0, ""

    if HasCrashPriority(identifier) then
        msg  = msg .. "\n💥 Crash Priority | +50"
        prio = prio + 50
    end

    local tempP = HasTempPriority(identifier)
    if tempP then
        msg  = msg .. string.format("\n🦖 Temporary Priority | +%s", tempP.Priority)
        prio = prio + tempP.Priority
    end

    local groups = { "whitelisted" }

    if GetConvar("danger_everyone_is_admin", "") == "1" then
        groups[#groups + 1] = "management"
    else
        local permissions = {
            ["queue.management"] = "management",
            ["queue.dev"]        = "dev",
            ["queue.admin"]      = "admin",
            ["queue.operations"] = "operations",
        }
        for permission, group in pairs(permissions) do
            if IsPlayerAceAllowed(source, permission) then
                groups[#groups + 1] = group
            end
        end
    end

    for _, group in ipairs(groups) do
        local groupData = exports['strata']:ConfigGetGroupById(group)
        if groupData and groupData.Queue and groupData.Queue.Priority > 0 then
            prio = prio + tonumber(groupData.Queue.Priority)
            msg  = msg .. "\n" .. string.format("%s | +%s", groupData.Queue.Message or groupData.Name, groupData.Queue.Priority)
        end
    end

    ---@type QueuePlayer
    local ply = {
        Source     = source,
        Groups     = groups,
        Name       = playerName,
        Discord    = "",
        Mention    = "",
        AccountID  = steamName or identifier,
        Identifier = identifier,
        SteamName  = steamName,
        Priority   = math.min(Config.MaxPrio, prio),
        Message    = msg,
        Deferrals  = deferrals,
        Timer = {
            Hour = 0, Minute = 0, Second = 0,
            Tick = function(self)
                if self.Second >= 59 then
                    if self.Minute >= 59 then
                        self.Second = 0; self.Minute = 0; self.Hour = self.Hour + 1
                    else
                        self.Second = 0; self.Minute = self.Minute + 1
                    end
                else
                    self.Second = self.Second + 5
                end
            end,
            Output = function(self)
                if self.Hour >= 1 then
                    return string.format("%d %s %d %s",
                        self.Hour, self.Hour > 1 and "Hours" or "Hour",
                        self.Minute, self.Minute == 1 and "Minute" or "Minutes")
                end
                return string.format("%d %s",
                    math.max(self.Minute, 1), self.Minute <= 1 and "Minute" or "Minutes")
            end,
        },
        IsWhitelisted = function() return true end,
    }

    return ply
end

-- ═════════════════════════════════════════════════════════════════════════════
-- LOCAL MODE — classic in-memory queue (no website required)
-- ═════════════════════════════════════════════════════════════════════════════

local function HandleConnectionLocal(source, identifier, deferrals)
    if not IsSteamRunning(source) then
        deferrals.done(Config.Strings.SteamRequired)
        return CancelEvent()
    end

    local steamName = GetPlayerSteamName(source)
    if not steamName then
        deferrals.done(Config.Strings.SteamNameError)
        return CancelEvent()
    end

    if GlobalState.IsProduction then
        local targetMs = _dbReadyTime + (Config.Settings.QueueDelay * 60000)
        while GetGameTimer() < targetMs do
            local remaining = math.floor((targetMs - GetGameTimer()) / 1000)
            local min       = math.floor(remaining / 60)
            local secs      = remaining - min * 60
            if min <= 0 then
                deferrals.update(string.format(Config.Strings.WaitingSeconds, secs, secs ~= 1 and "Seconds" or "Second"))
            else
                deferrals.update(string.format(Config.Strings.Waiting, min, min ~= 1 and "Minutes" or "Minute", secs, secs ~= 1 and "Seconds" or "Second"))
            end
            Wait(100)
        end
    end

    while not _queueActive do Wait(100) end

    PopFromQueue(identifier)

    local ply = PlayerClass(identifier, source, deferrals, steamName)

    local time     = GetGameTimer()
    local joinedAt = time
    local savedPos = false

    if _history[identifier] and _history[identifier].expires > time then
        joinedAt = _history[identifier].joinedAt
        savedPos = true
    end

    _playersData[identifier] = ply
    _players[identifier]     = { priority = ply.Priority, joinedAt = joinedAt, time = time }
    _history[identifier]     = { joinedAt = joinedAt, expires = time + (Config.Settings.SavePosition * 60000) }

    SortQueue()
    Wait(1000)

    local pos, total = GetPosition(identifier)
    Log(string.format(Config.Strings.Add, ply.Name, ply.SteamName or ply.AccountID, ply.Identifier, pos, total, GetNumPlayerIndices(), ply.Priority))

    while GetPlayerEndpoint(source) and not _queueClosed and (
        not Check(identifier) or
        GetNumPlayerIndices() == MAX_PLAYERS or
        (GetNumPlayerIndices() + _connCount + 1) > MAX_PLAYERS or
        (GetNumPlayerIndices() + _connCount) >= MAX_PLAYERS
    ) do
        ply.Timer:Tick()
        local p, t = GetPosition(identifier)
        local extra = ply.Priority > 0 and ("\n\nTotal Priority of " .. ply.Priority .. ": " .. ply.Message) or ""
        if savedPos then extra = extra .. "\n\n🥳 You Were Returned to Your Saved Queue Position" end
        ply.Deferrals.update(string.format(Config.Strings.Queued, p, t, ply.Timer:Output(), extra))
        if _history[identifier] then
            _history[identifier].expires = GetGameTimer() + (Config.Settings.SavePosition * 60000)
        end
        Wait(5000)
    end

    if _queueClosed then
        deferrals.done(Config.Strings.PendingRestart)
        PopFromQueue(identifier, true)
        return CancelEvent()
    end

    if GetPlayerEndpoint(source) then
        _connectors[identifier] = { source = source }
        _connCount += 1
        ply.Deferrals.update(Config.Strings.Joining)
        ply.Deferrals.handover({
            name            = ply.Name,
            priority        = ply.Priority,
            priorityMessage = ply.Message,
        })
        Wait(500)
        ply.Deferrals.done()
        Log(string.format(Config.Strings.Joined, ply.Name, ply.SteamName or ply.AccountID, ply.Identifier))
        _connecting[identifier] = ply
        PopFromQueue(identifier)
    else
        if _players[identifier] and _players[identifier].time == time then
            PopFromQueue(identifier, true)
        end
    end
end

-- ═════════════════════════════════════════════════════════════════════════════
-- WEB MODE — website-gated queue (players must join from strataroleplay.com)
-- ═════════════════════════════════════════════════════════════════════════════

local function HandleConnectionWeb(source, license, deferrals)
    if not IsSteamRunning(source) then
        deferrals.done(Config.Strings.SteamRequired)
        return CancelEvent()
    end

    local steamName = GetPlayerSteamName(source)
    if not steamName then
        deferrals.done(Config.Strings.SteamNameError)
        return CancelEvent()
    end

    local steamId = GetPlayerSteam(source)
    if not steamId then
        deferrals.done(Config.Strings.SteamRequired)
        return CancelEvent()
    end

    if GlobalState.IsProduction then
        local targetMs = _dbReadyTime + (Config.Settings.QueueDelay * 60000)
        while GetGameTimer() < targetMs do
            local remaining = math.floor((targetMs - GetGameTimer()) / 1000)
            local min       = math.floor(remaining / 60)
            local secs      = remaining - min * 60
            if min <= 0 then
                deferrals.update(string.format(Config.Strings.WaitingSeconds, secs, secs ~= 1 and "Seconds" or "Second"))
            else
                deferrals.update(string.format(Config.Strings.Waiting, min, min ~= 1 and "Minutes" or "Minute", secs, secs ~= 1 and "Seconds" or "Second"))
            end
            Wait(100)
        end
    end

    while not _queueActive do Wait(100) end

    -- Check for web_queue row (keyed by steam identifier)
    local row = MySQL.single.await(
        "SELECT id, status, priority, joined_at FROM web_queue WHERE license = ?",
        { steamId }
    )

    if not row then
        deferrals.done(Config.Strings.NotInWebQueue)
        return CancelEvent()
    end

    -- Upgrade priority with game-side ACE data
    local prio, msg, groups = 0, "", { "whitelisted" }
    do
        local p, m, g = 0, "", groups
        if HasCrashPriority(license) then
            m = m .. "\n💥 Crash Priority | +50"; p = p + 50
        end
        local tempP = HasTempPriority(license)
        if tempP then
            m = m .. string.format("\n🦖 Temporary Priority | +%s", tempP.Priority); p = p + tempP.Priority
        end
        if GetConvar("danger_everyone_is_admin", "") == "1" then
            g[#g + 1] = "management"
        else
            for perm, group in pairs({ ["queue.management"] = "management", ["queue.dev"] = "dev", ["queue.admin"] = "admin", ["queue.operations"] = "operations" }) do
                if IsPlayerAceAllowed(source, perm) then g[#g + 1] = group end
            end
        end
        for _, group in ipairs(g) do
            local gd = exports['strata']:ConfigGetGroupById(group)
            if gd and gd.Queue and gd.Queue.Priority > 0 then
                p = p + tonumber(gd.Queue.Priority)
                m = m .. "\n" .. string.format("%s | +%s", gd.Queue.Message or gd.Name, gd.Queue.Priority)
            end
        end
        prio = math.min(Config.MaxPrio, p)
        msg  = m

        if prio > row.priority then
            MySQL.query.await(
                "UPDATE web_queue SET priority = ?, priority_desc = ?, groups_json = ?, fivem_source = ?, steam_name = ?, heartbeat_at = NOW() WHERE license = ?",
                { prio, msg, json.encode(g), source, steamName, steamId }
            )
        else
            MySQL.query.await(
                "UPDATE web_queue SET fivem_source = ?, steam_name = ?, heartbeat_at = NOW() WHERE license = ?",
                { source, steamName, steamId }
            )
            prio = row.priority
        end
    end

    -- Helper: let the player into the server
    local function LetPlayerIn()
        MySQL.query.await("UPDATE web_queue SET status = 'connecting' WHERE license = ?", { steamId })
        _connectors[license] = { source = source }
        _connCount += 1
        deferrals.update(Config.Strings.Joining)
        deferrals.handover({ name = steamName, priority = prio, priorityMessage = msg })
        Wait(500)
        deferrals.done()
        MySQL.query.await("DELETE FROM web_queue WHERE license = ?", { steamId })
        Log(string.format(Config.Strings.Joined, steamName, steamName, license))
        _connecting[license] = {
            Source = source, Groups = groups, Name = steamName,
            Discord = "", Mention = "", AccountID = steamName,
            Identifier = license, SteamName = steamName,
            Priority = prio, Message = msg, Deferrals = deferrals,
        }
    end

    -- If already accepted, let them in now
    if row.status == "accepted" then
        if GetNumPlayerIndices() + _connCount < MAX_PLAYERS then
            LetPlayerIn()
            return
        end
        MySQL.query.await("UPDATE web_queue SET status = 'queued', accepted_at = NULL WHERE license = ?", { steamId })
    end

    -- Poll loop: hold in deferral until accepted
    local timer = {
        Hour = 0, Minute = 0, Second = 0,
        Tick = function(self)
            if self.Second >= 59 then
                if self.Minute >= 59 then self.Second = 0; self.Minute = 0; self.Hour = self.Hour + 1
                else self.Second = 0; self.Minute = self.Minute + 1 end
            else self.Second = self.Second + 5 end
        end,
        Output = function(self)
            if self.Hour >= 1 then
                return string.format("%d %s %d %s", self.Hour, self.Hour > 1 and "Hours" or "Hour", self.Minute, self.Minute == 1 and "Minute" or "Minutes")
            end
            return string.format("%d %s", math.max(self.Minute, 1), self.Minute <= 1 and "Minute" or "Minutes")
        end,
    }

    while GetPlayerEndpoint(source) and not _queueClosed do
        local status = MySQL.single.await("SELECT status FROM web_queue WHERE license = ?", { steamId })
        if not status then deferrals.done("Removed from queue") break end

        if status.status == "accepted" then
            if GetNumPlayerIndices() + _connCount < MAX_PLAYERS then
                LetPlayerIn()
                return
            end
        end

        local posRow = MySQL.single.await([[
            SELECT
                (SELECT COUNT(*) + 1 FROM web_queue WHERE status = 'queued' AND (priority > ? OR (priority = ? AND joined_at < ?))) AS position,
                (SELECT COUNT(*) FROM web_queue WHERE status = 'queued') AS total
        ]], { prio, prio, row.joined_at })

        timer:Tick()
        local extra = prio > 0 and ("\n\nTotal Priority of " .. prio .. ": " .. msg) or ""
        deferrals.update(string.format(Config.Strings.Queued, posRow and posRow.position or 0, posRow and posRow.total or 0, timer:Output(), extra))
        MySQL.query.await("UPDATE web_queue SET heartbeat_at = NOW() WHERE license = ?", { steamId })
        Wait(5000)
    end

    if not GetPlayerEndpoint(source) then
        MySQL.query.await("DELETE FROM web_queue WHERE license = ? AND status IN ('queued', 'accepted')", { steamId })
    end
    if _queueClosed and GetPlayerEndpoint(source) then
        deferrals.done(Config.Strings.PendingRestart)
        MySQL.query.await("DELETE FROM web_queue WHERE license = ?", { steamId })
        return CancelEvent()
    end
end

-- ── Exports ───────────────────────────────────────────────────────────────────

exports("CloseAndDrop", function()
    _queueClosed = true
    if IsWebMode() then
        MySQL.query.await("DELETE FROM web_queue WHERE 1")
    else
        for k in pairs(_players) do
            if _playersData[k] then _playersData[k].Deferrals.done("Deleted") end
            PopFromQueue(k, true)
        end
    end
end)

exports("AddTempPriority", function(identifier, prio)
    RemoveTempPriority(identifier)
    _tempPrio[#_tempPrio + 1] = { Identifier = identifier, Priority = prio }
    if IsWebMode() then
        MySQL.query.await(
            "UPDATE web_queue SET priority = priority + ?, priority_desc = CONCAT(IFNULL(priority_desc, ''), ?) WHERE license = ?",
            { prio, string.format("\n🦖 Temp Priority | +%s", prio), identifier }
        )
    end
end)

-- ── Events ────────────────────────────────────────────────────────────────────

AddEventHandler("playerConnecting", function(playerName, setKickReason, deferrals)
    local src = source
    deferrals.defer()
    Wait(1)
    deferrals.update(Config.Strings.Init)

    if not _dbReady or GlobalState.IsProduction == nil then
        deferrals.done(Config.Strings.NotReady)
        return CancelEvent()
    end
    if _queueClosed then
        deferrals.done(Config.Strings.PendingRestart)
        return CancelEvent()
    end

    local license = GetPlayerLicense(src)
    if not license or license == "" then
        deferrals.done(Config.Strings.NoIdentifier)
        return CancelEvent()
    end

    if IsWebMode() then
        HandleConnectionWeb(src, license, deferrals)
    else
        HandleConnectionLocal(src, license, deferrals)
    end
end)

AddEventHandler("playerDropped", function(message)
    local src     = source
    local license = GetPlayerLicense(src)
    if not license then return end

    if _connectors[license] then
        if _connCount >= 1 then _connCount -= 1 end
        _connectors[license] = nil
    end

    local excluded = false
    for _, v in ipairs(Config.ExcludeDrop) do
        if message:find(v, 1, true) then excluded = true break end
    end
    if not excluded then
        _crashPrio[#_crashPrio + 1] = { Identifier = license, Grace = os.time() + 1200 }
    end
end)

RegisterNetEvent("Core:Server:SessionStarted", function()
    local src     = source
    local license = GetPlayerLicense(src)
    if not license then
        DropPlayer(src, Config.Strings.NoIdentifier)
        return
    end

    if _connectors[license] then
        if _connCount >= 1 then _connCount -= 1 end
        _connectors[license] = nil
    end

    local ply = _connecting[license]
    if ply then
        TriggerClientEvent("Queue:Client:SessionActive", src)
        TriggerEvent("Queue:Server:SessionActive", src, {
            Groups     = ply.Groups,
            Name       = ply.Name,
            Discord    = ply.Discord,
            Mention    = ply.Mention,
            AccountID  = ply.SteamName or ply.AccountID,
            Avatar     = ply.Avatar,
            Identifier = ply.Identifier,
        })
        _connecting[license] = nil
        RemoveTempPriority(license)
        return
    end

    DropPlayer(src, Config.Strings.NoIdentifier)
end)

-- ── Bootstrap ─────────────────────────────────────────────────────────────────

AddEventHandler("onResourceStart", function(resource)
    if resource ~= GetCurrentResourceName() then return end

    Config.Server = exports['strata']:ConfigGetServer()
    Config.Groups = exports['strata']:ConfigGetGroups()
    _dbReadyTime  = GetGameTimer()
    _dbReady      = true
    _queueActive  = true

    if IsWebMode() then
        MySQL.query.await("DELETE FROM web_queue WHERE 1")
    end

    exports["st_chat"]:RegisterAdminCommand("queue", function(source)
        if IsWebMode() then
            local rows = MySQL.query.await("SELECT license, steam_name, priority, status FROM web_queue ORDER BY priority DESC, joined_at ASC")
            local msg = "Queue List"
            for k, v in ipairs(rows) do
                msg = msg .. string.format("<br>#%d - %s (%s) [prio: %d, %s]", k, v.steam_name, v.license, v.priority, v.status)
            end
            exports["st_chat"]:SendSystemSingle(source, msg)
        else
            local msg = "Queue List"
            for k, v in ipairs(_sorted) do
                local pd = _playersData[v]
                if pd then msg = msg .. string.format("<br>#%d - %s (%s)", k, pd.Name, v) end
            end
            exports["st_chat"]:SendSystemSingle(source, msg)
        end
    end, { help = "Print the Queue" })

    exports["st_chat"]:RegisterAdminCommand("yeetqueue", function(source)
        _queueClosed = true
        if IsWebMode() then
            MySQL.query.await("DELETE FROM web_queue WHERE 1")
        else
            for k in pairs(_players) do
                if _playersData[k] then _playersData[k].Deferrals.done("Deleted") end
                PopFromQueue(k, true)
            end
        end
        exports["st_chat"]:SendSystemSingle(source, "Done")
    end, { help = "Yeet the Queue [DANGER!]" })

    exports["st_chat"]:RegisterAdminCommand("maxplayers", function(source, args)
        local max = tonumber(args[1])
        if max and max > 0 and max < 500 then
            MAX_PLAYERS = max
            GlobalState["MaxPlayers"] = MAX_PLAYERS
            SetConvarServerInfo("sv_maxclients", MAX_PLAYERS)
            exports["st_chat"]:SendSystemSingle(source, "Max Players Set")
        end
    end, {
        help = "Set Max Players",
        params = { { name = "Max Player Count", help = "Number" } },
    })

    exports["st_chat"]:RegisterStaffCommand("tempprio", function(source, args)
        local ident = args[1]
        local prio  = tonumber(args[2])
        if ident and prio and prio > 0 and prio <= 200 then
            exports['st_queue']:AddTempPriority(ident, prio)
            exports["st_chat"]:SendSystemSingle(source, "Priority Added")
        else
            exports["st_chat"]:SendSystemSingle(source, "Error")
        end
    end, {
        help = "Add Temporary Priority",
        params = {
            { name = "Player Identifier", help = "Player's identifier" },
            { name = "Priority",          help = "Number (1-200)" },
        },
    })
end)

AddEventHandler("onResourceStop", function(resource)
    if resource ~= GetCurrentResourceName() then return end
    if IsWebMode() then
        MySQL.query.await("DELETE FROM web_queue WHERE 1")
    end
end)

-- ── Threads ───────────────────────────────────────────────────────────────────

CreateThread(function()
    while not _queueActive do Wait(1000) end
    Strata.Log.Info("Queue", "Queue enabled (" .. Config.QueueMode .. " mode)")

    while GetResourceState("hardcap") ~= "stopped" do
        local state = GetResourceState("hardcap")
        if state == "missing" then break end
        if state == "started" then StopResource("hardcap") break end
        Wait(5000)
    end
end)

-- Web-mode: background auto-accept
CreateThread(function()
    while not _queueActive do Wait(1000) end
    if not IsWebMode() then return end
    while true do
        if not _queueClosed and GetNumPlayerIndices() + _connCount < MAX_PLAYERS then
            MySQL.query.await([[
                UPDATE web_queue
                SET status = 'accepted', accepted_at = NOW()
                WHERE status = 'queued'
                ORDER BY priority DESC, joined_at ASC
                LIMIT 1
            ]])
        end
        Wait(5000)
    end
end)

-- Periodic maintenance
CreateThread(function()
    while true do
        if IsWebMode() then
            local countRow = MySQL.single.await("SELECT COUNT(*) AS n FROM web_queue WHERE status = 'queued'")
            GlobalState["QueueCount"] = countRow and countRow.n or 0
            -- Stale heartbeats (player connected to FiveM but Lua crashed)
            MySQL.query.await("DELETE FROM web_queue WHERE fivem_source > 0 AND heartbeat_at < NOW() - INTERVAL 120 SECOND AND status IN ('queued', 'accepted')")
            -- Expire accepted entries not connected within 5 minutes
            MySQL.query.await("DELETE FROM web_queue WHERE status = 'accepted' AND accepted_at < NOW() - INTERVAL 300 SECOND")
        else
            GlobalState["QueueCount"] = GetCount()
        end
        CheckGhosts()
        Wait(20000)
    end
end)

-- ── Debug commands ────────────────────────────────────────────────────────────

RegisterCommand("print_connect_count", function()
    print("Connector Count:", _connCount)
end, true)

RegisterCommand("print_queue", function()
    if IsWebMode() then
        local rows = MySQL.query.await("SELECT * FROM web_queue ORDER BY priority DESC, joined_at ASC")
        print("Queue:", json.encode(rows, { indent = true }))
    else
        print("Queue:", json.encode(_players, { indent = true }))
    end
end, true)
