local Self = Strata.Self

---Returns true once the strata player object has been received on this client.
---@return boolean
function Self.Loaded()
    local p = exports["strata"]:FetchPlayer()
    return p ~= nil and next(p) ~= nil
end

---Returns true once a character has been spawned for this client.
---@return boolean
function Self.Spawned()
    local c = exports["strata"]:FetchCharacter()
    return c ~= nil and next(c) ~= nil
end

---@return integer
function Self.Source()
    return GetPlayerServerId(PlayerId())
end

---@return vector3
function Self.Coords()
    return GetEntityCoords(PlayerPedId())
end

---@return number
function Self.Heading()
    return GetEntityHeading(PlayerPedId())
end

---Returns the vehicle the player is currently in, or 0.
---@return integer
function Self.Vehicle()
    local ped = PlayerPedId()
    local veh = GetVehiclePedIsIn(ped, false)
    if veh and veh > 0 then return veh end
    return 0
end
