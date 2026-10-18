local User = Strata.User

---Character store for a connected source.
---@param src integer
---@return StrataCharacter | nil
function User.Find(src)
    if GetResourceState("st_chars") ~= "started" then return nil end
    return exports["st_chars"]:FetchCharacterSource(src)
end

---Account / player object (groups, perms) for a connected source.
---@param src integer
---@return StrataAccount | nil
function User.Account(src)
    return exports["strata"]:FetchSource(src)
end

---Return true when the player carries the given staff/admin permission.
---Maps the legacy `HasPermission` style call onto Strata's IsStaff/IsAdmin/level model.
---@param src integer
---@param permission string  one of: "staff", "admin", or "level:<n>"
---@return boolean
function User.Allows(src, permission)
    local p = User.Account(src)
    if not p or not p.Permissions then return false end

    if permission == "staff" then return p.Permissions:IsStaff() end
    if permission == "admin" then return p.Permissions:IsAdmin() end

    local lvl = permission:match("^level:(%d+)$")
    if lvl then return p.Permissions:GetLevel() >= tonumber(lvl) end

    -- Unknown permission keys conservatively fall back to IsAdmin.
    return p.Permissions:IsAdmin()
end

---@param src integer
---@param clanName string
---@return boolean
function User.InClan(src, clanName)
    local p = User.Account(src)
    if not p then return false end
    local groups = p:GetData("Groups") or {}
    for _, g in ipairs(groups) do
        if g == clanName then return true end
    end
    return false
end

---@param src integer
---@return string[]
function User.Clans(src)
    local p = User.Account(src)
    if not p then return {} end
    return p:GetData("Groups") or {}
end

---@param src integer
---@return integer
function User.Rank(src)
    local p = User.Account(src)
    if not p or not p.Permissions then return 0 end
    return p.Permissions:GetLevel()
end

---All connected players keyed by source.
---@return table<integer, StrataAccount>
function User.Roster()
    return exports["strata"]:FetchAll() or {}
end

---@return integer
function User.Count()
    return exports["strata"]:FetchCount() or 0
end

---@param sid string | integer
---@return StrataCharacter | nil
function User.BySID(sid)
    if GetResourceState("st_chars") ~= "started" then return nil end
    return exports["st_chars"]:FetchBySID(sid)
end

---@param id integer
---@return StrataCharacter | nil
function User.ByID(id)
    if GetResourceState("st_chars") ~= "started" then return nil end
    return exports["st_chars"]:FetchByID(id)
end
