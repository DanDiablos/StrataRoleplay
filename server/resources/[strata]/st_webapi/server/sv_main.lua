---@diagnostic disable: undefined-global

local TAG = "WebAPI"

---@param level string
---@param msg string
local function log(level, msg)
    local fn = ({ INFO = "LoggerInfo", WARN = "LoggerWarn", ERROR = "LoggerError", TRACE = "LoggerTrace" })[level] or "LoggerInfo"
    exports['strata'][fn](exports['strata'], TAG, msg)
end

-- ── Auth Verification ────────────────────────────────────────────────────────

---@param body string Raw request body
---@param signature string|nil X-Strata-Signature header value
---@return boolean
local function verifyAuth(body, signature)
    if not Config.HmacSecret or Config.HmacSecret == "" then
        log("WARN", "HMAC secret not configured — accepting all requests (dev mode)")
        return true
    end

    if not signature then return false end

    -- Bearer token: X-Strata-Signature: bearer=<secret>
    if signature:find("^bearer=") then
        local token = signature:sub(8)
        if #token ~= #Config.HmacSecret then return false end
        -- Constant-time compare
        local diff = 0
        for i = 1, #token do
            diff = diff | (token:byte(i) ~ Config.HmacSecret:byte(i))
        end
        return diff == 0
    end

    return false
end

-- ── Player Lookup ────────────────────────────────────────────────────────────

---@param license string Steam license identifier (e.g. "license:abc123")
---@return number|nil source Player server ID if online, nil if offline
local function findPlayerByLicense(license)
    local players = GetPlayers()
    for _, playerId in ipairs(players) do
        local src = tonumber(playerId)
        if src then
            for i = 0, GetNumPlayerIdentifiers(src) - 1 do
                local id = GetPlayerIdentifier(src, i)
                if id == license then
                    return src
                end
            end
        end
    end
    return nil
end

-- ── Response Helpers ─────────────────────────────────────────────────────────

---@param res table HTTP response object
---@param status number HTTP status code
---@param data table Response body
local function sendJson(res, status, data)
    res.writeHead(status, {
        ["Content-Type"] = "application/json",
        ["Access-Control-Allow-Origin"] = Config.WebsiteOrigin ~= "" and Config.WebsiteOrigin or "*",
        ["Access-Control-Allow-Headers"] = "Content-Type, X-Strata-Signature",
        ["Access-Control-Allow-Methods"] = "POST, OPTIONS",
    })
    res.send(json.encode(data))
end

-- ── Route Handlers ───────────────────────────────────────────────────────────

---@type table<string, fun(req: table, res: table, body: table)>
local routes = {}

--- POST /screenshot — Capture a player's screen and return the Discord CDN URL
routes["screenshot"] = function(req, res, body)
    local license = body.license
    if not license or license == "" then
        sendJson(res, 400, { ok = false, error = "missing license" })
        return
    end

    local requestedBy = body.requestedBy or "Website"

    local source = findPlayerByLicense(license)
    if not source then
        sendJson(res, 404, { ok = false, error = "player not online" })
        return
    end

    local playerName = GetPlayerName(source) or "Unknown"

    log("INFO", ("Web screenshot request: %s (source %s) by %s"):format(
        playerName, source, requestedBy
    ))

    exports["st_utils"]:CaptureAndUpload(source, playerName, requestedBy, function(success, attachmentUrl)
        if success and attachmentUrl then
            sendJson(res, 200, {
                ok = true,
                url = attachmentUrl,
                playerName = playerName,
            })
        else
            sendJson(res, 500, {
                ok = false,
                error = "capture or upload failed",
            })
        end
    end)
end

--- POST /status — Health check / server info
routes["status"] = function(req, res, body)
    local count = #GetPlayers()
    sendJson(res, 200, {
        ok = true,
        players = count,
        maxPlayers = GetConvarInt("sv_maxclients", 48),
        uptime = os.time(),
    })
end

-- ── HTTP Handler ─────────────────────────────────────────────────────────────

SetHttpHandler(function(req, res)
    -- Handle CORS preflight
    if req.method == "OPTIONS" then
        sendJson(res, 204, {})
        return
    end

    -- Only accept POST
    if req.method ~= "POST" then
        sendJson(res, 405, { ok = false, error = "method not allowed" })
        return
    end

    -- Read body
    req.setDataHandler(function(rawBody)
        -- Verify authentication
        local signature = req.headers["X-Strata-Signature"] or req.headers["x-strata-signature"]
        if not verifyAuth(rawBody, signature) then
            log("WARN", ("Rejected request: invalid signature from %s"):format(
                req.headers["x-forwarded-for"] or "unknown"
            ))
            sendJson(res, 401, { ok = false, error = "unauthorized" })
            return
        end

        -- Parse JSON body
        local ok, body = pcall(json.decode, rawBody)
        if not ok or type(body) ~= "table" then
            sendJson(res, 400, { ok = false, error = "invalid json" })
            return
        end

        -- Route to handler
        local path = req.path:gsub("^/", ""):gsub("/$", "")
        local handler = routes[path]
        if not handler then
            sendJson(res, 404, { ok = false, error = "not found: " .. path })
            return
        end

        handler(req, res, body)
    end)
end)

log("INFO", "Web API bridge ready — HTTP handler registered")
