local Number = Strata.Number
local Cash   = Strata.Cash

---Format an integer with thousands separators.
---@param n number
---@return string
function Number.Stringify(n)
    n = math.floor(tonumber(n) or 0)
    local sign = n < 0 and "-" or ""
    local s = tostring(math.abs(n))
    local with_commas = s:reverse():gsub("(%d%d%d)", "%1,"):reverse()
    with_commas = with_commas:gsub("^,", "")
    return sign .. with_commas
end

---Pad a number to a fixed width with leading zeros.
---@param n number
---@param width integer
---@return string
function Number.Pad(n, width)
    return string.format("%0" .. width .. "d", math.floor(tonumber(n) or 0))
end

---@param n number
---@return string  e.g. 1->"1st", 22->"22nd", 113->"113th"
function Number.Ordinal(n)
    n = math.floor(tonumber(n) or 0)
    local mod100 = n % 100
    if mod100 >= 11 and mod100 <= 13 then return n .. "th" end
    local mod10 = n % 10
    if mod10 == 1 then return n .. "st" end
    if mod10 == 2 then return n .. "nd" end
    if mod10 == 3 then return n .. "rd" end
    return n .. "th"
end

-- Cash.Stringify lives here so Number/Cash share the formatter.
---@param n number
---@param currency? string  default "$"
---@return string
function Cash.Stringify(n, currency)
    return (currency or "$") .. Number.Stringify(n)
end
