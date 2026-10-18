local World = Strata.World

---Request and load a model. Returns the resolved hash on success, or false on failure.
---Note: the hash is a Lua integer, so `if Strata.World.StageModel(...) then` is safe
---(false short-circuits) — but never compare with `== 0` because 0 is a valid hash collision space.
---@param model string | integer
---@param timeoutMs? integer  default 5000
---@return integer | false
function World.StageModel(model, timeoutMs)
    local hash = (type(model) == "number") and model or GetHashKey(model)
    if not IsModelInCdimage(hash) then return false end
    RequestModel(hash)
    local deadline = GetGameTimer() + (timeoutMs or 5000)
    while not HasModelLoaded(hash) do
        if GetGameTimer() > deadline then return false end
        Wait(10)
    end
    return hash
end

---Request and load an animation dictionary. Returns true on success.
---@param dict string
---@param timeoutMs? integer  default 5000
---@return boolean
function World.StageAnim(dict, timeoutMs)
    if HasAnimDictLoaded(dict) then return true end
    RequestAnimDict(dict)
    local deadline = GetGameTimer() + (timeoutMs or 5000)
    while not HasAnimDictLoaded(dict) do
        if GetGameTimer() > deadline then return false end
        Wait(10)
    end
    return true
end

---@param entity? integer  defaults to local ped
---@return vector3
function World.Coords(entity)
    return GetEntityCoords(entity or PlayerPedId())
end

---Find the closest vehicle to a coord within a radius.
---@param coords? vector3  defaults to local ped position
---@param radius? number    default 5.0
---@return integer vehicle handle (0 if none)
---@return number  distance (math.huge if none)
function World.NearestVehicle(coords, radius)
    coords = coords or GetEntityCoords(PlayerPedId())
    radius = radius or 5.0
    local best, bestDist = 0, math.huge
    local handle, veh = FindFirstVehicle()
    local ok = handle and handle ~= -1
    if ok then
        repeat
            local pos = GetEntityCoords(veh)
            local d = #(pos - coords)
            if d < bestDist and d <= radius then
                best, bestDist = veh, d
            end
            ok, veh = FindNextVehicle(handle)
        until not ok
        EndFindVehicle(handle)
    end
    return best, bestDist
end

---Find the closest non-player ped to a coord within a radius.
---@param coords? vector3
---@param radius? number  default 5.0
---@return integer ped handle (0 if none)
---@return number  distance
function World.NearestPed(coords, radius)
    coords = coords or GetEntityCoords(PlayerPedId())
    radius = radius or 5.0
    local best, bestDist = 0, math.huge
    local handle, ped = FindFirstPed()
    local ok = handle and handle ~= -1
    if ok then
        repeat
            if not IsPedAPlayer(ped) then
                local pos = GetEntityCoords(ped)
                local d = #(pos - coords)
                if d < bestDist and d <= radius then
                    best, bestDist = ped, d
                end
            end
            ok, ped = FindNextPed(handle)
        until not ok
        EndFindPed(handle)
    end
    return best, bestDist
end

---Convert a rotation vector to a unit direction vector (matches GTA camera maths).
---@param rotation vector3
---@return vector3
function World.RotateToDir(rotation)
    local r = (math.pi / 180) * rotation
    return vector3(
        -math.sin(r.z) * math.abs(math.cos(r.x)),
        math.cos(r.z) * math.abs(math.cos(r.x)),
        math.sin(r.x)
    )
end

---Camera-forward swept-sphere raycast — what the player is looking at.
---Returns three values matching the legacy GetEntityPlayerIsLookingAt contract.
---@param distance? number     default 10.0
---@param ignored?  integer    entity to ignore (e.g. LocalPlayer.state.ped)
---@param flagOverride? integer  shape-test flags (default 287)
---@return boolean hit
---@return vector3 endCoords
---@return integer entity
function World.EyeTarget(distance, ignored, flagOverride)
    distance = distance or 10.0
    local origin    = GetGameplayCamCoord()
    local direction = World.RotateToDir(GetGameplayCamRot(2))
    local destination = origin + (direction * distance)
    local ray = StartShapeTestSweptSphere(origin, destination, 0.075, flagOverride or 287, ignored, 4)
    local _, hitting, endCoords, _, entity = GetShapeTestResult(ray)
    return (hitting == 1), endCoords, entity
end

local function setTextOpts(opts)
    SetTextFont(opts and opts.font or 4)
    SetTextScale(0.0, opts and opts.scale or 0.35)
    local c = opts and opts.color or { 255, 255, 255, 215 }
    SetTextColour(c[1], c[2], c[3], c[4] or 215)
    SetTextDropshadow(0, 0, 0, 0, 255)
    SetTextEdge(2, 0, 0, 0, 150)
    SetTextDropShadow()
    SetTextOutline()
    SetTextEntry("STRING")
    SetTextCentre(opts and opts.centre ~= false)
end

---Draw text at a 3D world coordinate this frame.
---@param x number @param y number @param z number @param text string
---@param opts? { font?: integer, scale?: number, color?: number[], centre?: boolean }
function World.Paint3D(x, y, z, text, opts)
    local onScreen, sx, sy = World3dToScreen2d(x, y, z)
    if not onScreen then return end
    setTextOpts(opts)
    AddTextComponentString(text)
    DrawText(sx, sy)
end

---Draw text at a 2D screen coordinate this frame.
---@param x number  0..1
---@param y number  0..1
---@param text string
---@param opts? { font?: integer, scale?: number, color?: number[], centre?: boolean }
function World.Paint2D(x, y, text, opts)
    setTextOpts(opts)
    AddTextComponentString(text)
    DrawText(x, y)
end
