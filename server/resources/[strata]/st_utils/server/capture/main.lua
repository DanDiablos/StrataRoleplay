---@diagnostic disable: undefined-global

local TAG = "Capture"

---@param level string
---@param msg string
local function log(level, msg)
    local fn = ({ INFO = "LoggerInfo", WARN = "LoggerWarn", ERROR = "LoggerError", TRACE = "LoggerTrace" })[level] or "LoggerInfo"
    exports['strata'][fn](exports['strata'], TAG, msg)
end

-- ── Pending capture requests ─────────────────────────────────────────────────

---@type table<string, fun(data: string|nil)>
local pendingCaptures = {}
local requestCounter = 0

---@return string requestId
local function nextRequestId()
    requestCounter = requestCounter + 1
    return ("cap_%s_%s"):format(os.time(), requestCounter)
end

-- Client sends capture result back here
RegisterNetEvent("st_utils:captureResult", function(requestId, data)
    local cb = pendingCaptures[requestId]
    if not cb then return end
    pendingCaptures[requestId] = nil
    cb(data)
end)

-- ── Helpers ──────────────────────────────────────────────────────────────────

---@param source number Player server ID
---@param options? table Capture options override
---@param cb fun(success: boolean, data: string|nil, error: string|nil)
local function capturePlayer(source, options, cb)
    if not GetPlayerName(source) then
        cb(false, nil, "invalid player source")
        return
    end

    local requestId = nextRequestId()
    local responded = false

    -- Timeout after 20 seconds
    SetTimeout(20000, function()
        if not responded then
            responded = true
            pendingCaptures[requestId] = nil
            cb(false, nil, "capture timed out")
        end
    end)

    pendingCaptures[requestId] = function(data)
        if responded then return end
        responded = true
        if data and data ~= "" then
            cb(true, data, nil)
        else
            cb(false, nil, "empty capture data")
        end
    end

    local opts = {
        encoding = options and options.encoding or CaptureConfig.Encoding,
    }

    TriggerClientEvent("st_utils:requestCapture", source, requestId, opts)
end

---@param base64Data string Base64-encoded image (data URI or raw)
---@param playerName string Player name for the Discord embed
---@param requestedBy string Who requested the screenshot
---@param cb fun(success: boolean, attachmentUrl: string|nil)
local function uploadToDiscord(base64Data, playerName, requestedBy, cb)
    if not CaptureConfig.DiscordWebhook or CaptureConfig.DiscordWebhook == "" then
        log("WARN", "Discord webhook not configured, skipping upload")
        cb(false, nil)
        return
    end

    -- Strip data URI prefix if present
    local raw = base64Data
    if raw:find("^data:") then
        raw = raw:gsub("^data:[^;]+;base64,", "")
    end

    -- Determine file extension from encoding
    local ext = CaptureConfig.Encoding == "png" and "png" or CaptureConfig.Encoding == "jpg" and "jpg" or "webp"
    local filename = ("screenshot_%s_%s.%s"):format(
        tostring(os.time()),
        playerName:gsub("[^%w]", "_"),
        ext
    )

    -- Build multipart form body
    local boundary = "----StrataCapture" .. tostring(os.time()) .. tostring(math.random(100000, 999999))

    local embedPayload = json.encode({
        embeds = {
            {
                title = "Player Screenshot",
                color = 16734266, -- #FF5C3A
                fields = {
                    { name = "Player", value = playerName, inline = true },
                    { name = "Requested By", value = requestedBy, inline = true },
                    { name = "Time", value = os.date("!%Y-%m-%d %H:%M:%S UTC"), inline = false },
                },
                image = { url = "attachment://" .. filename },
            },
        },
    })

    -- Decode base64 to binary
    local b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"
    local lookup = {}
    for i = 1, #b64 do lookup[b64:sub(i, i)] = i - 1 end
    lookup["="] = 0

    local bytes = {}
    local cleaned = raw:gsub("[^%w%+%/%=]", "")
    for i = 1, #cleaned, 4 do
        local a = lookup[cleaned:sub(i, i)] or 0
        local b2 = lookup[cleaned:sub(i + 1, i + 1)] or 0
        local c = lookup[cleaned:sub(i + 2, i + 2)] or 0
        local d = lookup[cleaned:sub(i + 3, i + 3)] or 0
        local n = a * 262144 + b2 * 4096 + c * 64 + d
        bytes[#bytes + 1] = string.char(math.floor(n / 65536) % 256)
        if cleaned:sub(i + 2, i + 2) ~= "=" then
            bytes[#bytes + 1] = string.char(math.floor(n / 256) % 256)
        end
        if cleaned:sub(i + 3, i + 3) ~= "=" then
            bytes[#bytes + 1] = string.char(n % 256)
        end
    end
    local binaryData = table.concat(bytes)

    local mimeType = ext == "png" and "image/png" or ext == "jpg" and "image/jpeg" or "image/webp"

    local body = "--" .. boundary .. "\r\n"
        .. 'Content-Disposition: form-data; name="payload_json"\r\n'
        .. "Content-Type: application/json\r\n\r\n"
        .. embedPayload .. "\r\n"
        .. "--" .. boundary .. "\r\n"
        .. ('Content-Disposition: form-data; name="file"; filename="%s"\r\n'):format(filename)
        .. ("Content-Type: %s\r\n\r\n"):format(mimeType)
        .. binaryData .. "\r\n"
        .. "--" .. boundary .. "--\r\n"

    PerformHttpRequest(CaptureConfig.DiscordWebhook .. "?wait=true", function(statusCode, responseBody)
        if statusCode >= 200 and statusCode < 300 then
            local response = json.decode(responseBody)
            local attachmentUrl = nil
            if response and response.attachments and response.attachments[1] then
                attachmentUrl = response.attachments[1].url
            end
            log("INFO", ("Screenshot uploaded to Discord for %s"):format(playerName))
            cb(true, attachmentUrl)
        else
            log("ERROR", ("Discord upload failed: HTTP %s — %s"):format(
                tostring(statusCode), tostring(responseBody)
            ))
            cb(false, nil)
        end
    end, "POST", body, {
        ["Content-Type"] = "multipart/form-data; boundary=" .. boundary,
    })
end

-- ── Chat Command ─────────────────────────────────────────────────────────────

if CaptureConfig.CommandName and CaptureConfig.CommandName ~= "" then
    RegisterCommand(CaptureConfig.CommandName, function(source, args)
        if source == 0 then
            local targetId = tonumber(args[1])
            if not targetId then
                print(("[%s] Usage: /%s <player_id>"):format(TAG, CaptureConfig.CommandName))
                return
            end
            if not GetPlayerName(targetId) then
                print(("[%s] Player %s not found"):format(TAG, targetId))
                return
            end
            local playerName = GetPlayerName(targetId) or "Unknown"
            capturePlayer(targetId, nil, function(ok, data, err)
                if not ok then
                    print(("[%s] Capture failed: %s"):format(TAG, err))
                    return
                end
                uploadToDiscord(data, playerName, "Console", function(uploadOk, url)
                    if uploadOk then
                        print(("[%s] Screenshot uploaded: %s"):format(TAG, url or "OK"))
                    else
                        print(("[%s] Discord upload failed"):format(TAG))
                    end
                end)
            end)
        else
            local targetId = tonumber(args[1])
            if not targetId or not GetPlayerName(targetId) then
                TriggerClientEvent("chat:addMessage", source, {
                    args = { "^1System", ("Usage: /%s <player_id>"):format(CaptureConfig.CommandName) },
                })
                return
            end
            local playerName = GetPlayerName(targetId) or "Unknown"
            local staffName = GetPlayerName(source) or "Staff"
            capturePlayer(targetId, nil, function(ok, data, err)
                if not ok then
                    TriggerClientEvent("chat:addMessage", source, {
                        args = { "^1System", "Screenshot capture failed: " .. (err or "unknown") },
                    })
                    return
                end
                uploadToDiscord(data, playerName, staffName, function(uploadOk)
                    TriggerClientEvent("chat:addMessage", source, {
                        args = { "^2System", uploadOk and "Screenshot uploaded to Discord" or "^1Discord upload failed" },
                    })
                end)
            end)
        end
    end, true)
end

-- ── Exports for other resources ──────────────────────────────────────────────

---@param targetSource number Player server ID to capture
---@param options? table { encoding?: string, quality?: number, maxWidth?: number, maxHeight?: number }
---@param cb fun(success: boolean, data: string|nil, error: string|nil)
exports("CapturePlayer", function(targetSource, options, cb)
    capturePlayer(targetSource, options, cb)
end)

---@param targetSource number Player server ID to capture
---@param playerName string Player name for the embed
---@param requestedBy string Who requested it
---@param cb fun(success: boolean, attachmentUrl: string|nil)
exports("CaptureAndUpload", function(targetSource, playerName, requestedBy, cb)
    capturePlayer(targetSource, nil, function(ok, data, err)
        if not ok then
            cb(false, nil)
            return
        end
        uploadToDiscord(data, playerName, requestedBy, cb)
    end)
end)

log("INFO", "Screenshot capture + Discord upload ready")
