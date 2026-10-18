local Clan = Strata.Clan

---Read-only group lookup against the strata config.
---@param name string
---@return any | nil
function Clan.Find(name)
    return exports["strata"]:ConfigGetGroupById(name)
end

---Permissions table on the group definition (raw passthrough).
---@param name string
---@return table | nil
function Clan.Perks(name)
    local g = Clan.Find(name)
    return g and g.Permission or nil
end

---List the clans a player currently belongs to. Convenience over Strata.User.Clans.
---@param src integer
---@return string[]
function Clan.Of(src)
    return Strata.User.Clans(src)
end
