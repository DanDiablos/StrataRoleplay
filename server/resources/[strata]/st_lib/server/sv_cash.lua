local Cash = Strata.Cash

-- Strata characters carry a flat `Cash` field on their character store
-- (see st_chars). Account/banking operations belong in st_finance.
-- Cash.* here covers the on-hand cash slot only.

---@param src integer
---@param account "cash"  reserved for future expansion
---@return integer
function Cash.Read(src, account)
    account = account or "cash"
    if account ~= "cash" then return 0 end
    local char = Strata.User.Find(src)
    if not char then return 0 end
    return tonumber(char:GetData("Cash") or 0) or 0
end

---@param src integer
---@param account "cash"
---@param amount number
---@param reason? string
---@return boolean ok
function Cash.Add(src, account, amount, reason)
    account = account or "cash"
    if account ~= "cash" then return false end
    if type(amount) ~= "number" or amount <= 0 then return false end
    local char = Strata.User.Find(src)
    if not char then return false end
    local cur = tonumber(char:GetData("Cash") or 0) or 0
    char:SetData("Cash", cur + math.floor(amount))
    Strata.Log.Info("Cash", ("Add %d to %s — %s"):format(amount, src, reason or "no reason"))
    return true
end

---@param src integer
---@param account "cash"
---@param amount number
---@param reason? string
---@return boolean ok
function Cash.Take(src, account, amount, reason)
    account = account or "cash"
    if account ~= "cash" then return false end
    if type(amount) ~= "number" or amount <= 0 then return false end
    local char = Strata.User.Find(src)
    if not char then return false end
    local cur = tonumber(char:GetData("Cash") or 0) or 0
    if cur < amount then return false end
    char:SetData("Cash", cur - math.floor(amount))
    Strata.Log.Info("Cash", ("Take %d from %s — %s"):format(amount, src, reason or "no reason"))
    return true
end
