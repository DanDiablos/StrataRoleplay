local Clock = Strata.Clock

local function plural(n, word) return n == 1 and (n .. " " .. word) or (n .. " " .. word .. "s") end

---Canonical formatter — replaces every GetFormattedTimeFromSeconds
---scattered across resources.
---@param seconds integer
---@param opts? StrataClockOpts
---@return string
function Clock.Stringify(seconds, opts)
    seconds = math.floor(tonumber(seconds) or 0)
    if seconds < 0 then seconds = 0 end

    local style = opts and opts.style or "hms"

    -- Cooldown / duration display style: "3 days and 5 hours", "2 hours", "5 minutes".
    -- Always at least "1 minute" for tiny positive values, matching the legacy contract.
    if style == "human" then
        local days  = math.floor(seconds / 86400)
        local hours = math.floor((seconds % 86400) / 3600)
        local mins  = math.floor((seconds % 3600) / 60 + 0.5) -- round half-up

        if days > 0 then
            if hours > 0 then return string.format("%s and %s", plural(days, "day"), plural(hours, "hour")) end
            return plural(days, "day")
        end
        if hours > 0 then return plural(hours, "hour") end
        if mins < 1 then mins = 1 end
        return plural(mins, "minute")
    end

    local h = math.floor(seconds / 3600)
    local m = math.floor((seconds % 3600) / 60)
    local s = seconds % 60

    if style == "compact" then
        if h > 0 then return string.format("%dh %dm %ds", h, m, s) end
        if m > 0 then return string.format("%dm %ds", m, s) end
        return string.format("%ds", s)
    end

    if style == "long" then
        local parts = {}
        if h > 0 then parts[#parts + 1] = plural(h, "hour") end
        if m > 0 then parts[#parts + 1] = plural(m, "minute") end
        if s > 0 or #parts == 0 then parts[#parts + 1] = plural(s, "second") end
        return table.concat(parts, ", ")
    end

    -- default: hms zero-padded
    return string.format("%02d:%02d:%02d", h, m, s)
end

---Shorthand for the human-readable style — what every legacy
---GetFormattedTimeFromSeconds callsite expected.
---@param seconds integer
---@return string
function Clock.Human(seconds)
    return Clock.Stringify(seconds, { style = "human" })
end

---Format a unix-second timestamp.
---@param unixSeconds integer
---@param format? string  os.date format string (default "%Y-%m-%d %H:%M")
---@return string
function Clock.Stamp(unixSeconds, format)
    return os.date(format or "%Y-%m-%d %H:%M", tonumber(unixSeconds) or 0) --[[@as string]]
end

---Parse "HH:MM:SS", "MM:SS", or a bare seconds string into seconds.
---@param str string
---@return integer
function Clock.Parse(str)
    if type(str) ~= "string" then return 0 end
    local h, m, s = str:match("^(%d+):(%d+):(%d+)$")
    if h then return tonumber(h) * 3600 + tonumber(m) * 60 + tonumber(s) end
    local mm, ss = str:match("^(%d+):(%d+)$")
    if mm then return tonumber(mm) * 60 + tonumber(ss) end
    return tonumber(str) or 0
end
