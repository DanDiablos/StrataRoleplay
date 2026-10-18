local Kit = Strata.Kit

---@param t table
---@param value any
---@return boolean
function Kit.Has(t, value)
    if type(t) ~= "table" then return false end
    for _, v in pairs(t) do
        if v == value then return true end
    end
    return false
end

---@param t table
---@return table
function Kit.Clone(t)
    if type(t) ~= "table" then return t end
    local out = {}
    for k, v in pairs(t) do
        out[k] = (type(v) == "table") and Kit.Clone(v) or v
    end
    return out
end

---@param a table
---@param b table
---@return table
function Kit.Merge(a, b)
    local out = Kit.Clone(a)
    if type(b) == "table" then
        for k, v in pairs(b) do
            if type(v) == "table" and type(out[k]) == "table" then
                out[k] = Kit.Merge(out[k], v)
            else
                out[k] = v
            end
        end
    end
    return out
end

---@param t table
---@return table
function Kit.Shuffle(t)
    local out = Kit.Clone(t)
    for i = #out, 2, -1 do
        local j = math.random(i)
        out[i], out[j] = out[j], out[i]
    end
    return out
end

---@param s string
---@param sep string
---@return string[]
function Kit.Split(s, sep)
    local out = {}
    if type(s) ~= "string" then return out end
    sep = sep or " "
    local pattern = "([^" .. sep .. "]+)"
    for part in string.gmatch(s, pattern) do
        out[#out + 1] = part
    end
    return out
end

---@param s string
---@return string
function Kit.Trim(s)
    if type(s) ~= "string" then return "" end
    return (s:gsub("^%s+", ""):gsub("%s+$", ""))
end

local CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

---@param length? integer  default 8
---@return string
function Kit.Random(length)
    length = length or 8
    local buf = {}
    for i = 1, length do
        local idx = math.random(1, #CHARS)
        buf[i] = CHARS:sub(idx, idx)
    end
    return table.concat(buf)
end

---@param min integer
---@param max integer
---@return integer
function Kit.RandomInt(min, max)
    return math.random(min, max)
end

---@param chance number  0..1 probability, or 0..100 if >1
---@return boolean
function Kit.Roll(chance)
    if chance > 1 then chance = chance / 100 end
    return math.random() < chance
end

---@param n number
---@param lo number
---@param hi number
---@return number
function Kit.Clamp(n, lo, hi)
    if n < lo then return lo end
    if n > hi then return hi end
    return n
end

---@param n number
---@param dp? integer
---@return number
function Kit.Round(n, dp)
    if dp then
        local m = 10 ^ dp
        return math.floor((n * m) + 0.5) / m
    end
    return math.floor(n + 0.5)
end

---@param name string
---@return boolean
function Kit.DepRunning(name)
    return GetResourceState(name) == "started"
end
