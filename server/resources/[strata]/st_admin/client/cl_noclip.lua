-- ========================================================================
-- Freecam System
-- ========================================================================

local INPUT_SPRINT = 21
local INPUT_CHARACTER_WHEEL = 19
local INPUT_LOOK_LR = 1
local INPUT_LOOK_UD = 2
local INPUT_COVER = 44
local INPUT_MULTIPLAYER_INFO = 20
local INPUT_MOVE_UD = 31
local INPUT_MOVE_LR = 30

local freecamCamera = nil
local freecamFrozen = false
local freecamPos = nil
local freecamRot = nil
local freecamFov = nil
local freecamVecX = nil
local freecamVecY = nil
local freecamVecZ = nil
local freecamIsNoclip = false

local freecamSettings = {
    fov = 45.0,
    mouseSensitivityX = 5,
    mouseSensitivityY = 5,
    normalMoveMultiplier = 1,
    fastMoveMultiplier = 10,
    slowMoveMultiplier = 0.1,
    enableEasing = true,
    easingDuration = 1000,
}

---@param x number
---@param min number
---@param max number
---@return number
local function Clamp(x, min, max)
    return math.min(math.max(x, min), max)
end

---@param inputGroup number
---@param control1 number
---@param control2 number
---@return number
local function GetDisabledControlNormalBetween(inputGroup, control1, control2)
    return GetDisabledControlNormal(inputGroup, control1) - GetDisabledControlNormal(inputGroup, control2)
end

---@param rotX number
---@param rotY number
---@param rotZ number
---@return vector3 vecX
---@return vector3 vecY
---@return vector3 vecZ
local function EulerToMatrix(rotX, rotY, rotZ)
    local radX = math.rad(rotX)
    local radY = math.rad(rotY)
    local radZ = math.rad(rotZ)

    local sinX = math.sin(radX)
    local sinY = math.sin(radY)
    local sinZ = math.sin(radZ)
    local cosX = math.cos(radX)
    local cosY = math.cos(radY)
    local cosZ = math.cos(radZ)

    local vecX = vector3(
        cosY * cosZ,
        cosY * sinZ,
        -sinY
    )

    local vecY = vector3(
        cosZ * sinX * sinY - cosX * sinZ,
        cosX * cosZ - sinX * sinY * sinZ,
        cosY * sinX
    )

    local vecZ = vector3(
        -cosX * cosZ * sinY + sinX * sinZ,
        -cosZ * sinX + cosX * sinY * sinZ,
        cosX * cosY
    )

    return vecX, vecY, vecZ
end

---@return boolean
local function IsFreecamFrozen()
    return freecamFrozen
end

---@return vector3?
local function GetFreecamPosition()
    return freecamPos
end

---@param x number
---@param y number
---@param z number
local function SetFreecamPosition(x, y, z)
    local pos = vector3(x, y, z)
    local int = GetInteriorAtCoords(pos)

    LoadInterior(int)
    if not freecamIsNoclip then
        SetFocusArea(pos)
    end
    LockMinimapPosition(x, y)
    SetCamCoord(freecamCamera, pos)

    freecamPos = pos
end

---@return vector3?
local function GetFreecamRotation()
    return freecamRot
end

---@param x number
---@param y number
---@param z number
local function SetFreecamRotation(x, y, z)
    local rx = Clamp(x, -90.0, 90.0)
    local ry = y % 360
    local rz = z % 360
    local rot = vector3(rx, ry, rz)
    local vecX, vecY, vecZ = EulerToMatrix(rx, ry, rz)

    LockMinimapAngle(math.floor(rz))
    SetCamRot(freecamCamera, rot)

    freecamRot = rot
    freecamVecX = vecX
    freecamVecY = vecY
    freecamVecZ = vecZ
end

---@param fov number
local function SetFreecamFov(fov)
    local clamped = Clamp(fov, 0.0, 90.0)
    SetCamFov(freecamCamera, clamped)
    freecamFov = clamped
end

---@return vector3? vecX
---@return vector3? vecY
---@return vector3? vecZ
---@return vector3? pos
local function GetFreecamMatrix()
    return freecamVecX, freecamVecY, freecamVecZ, freecamPos
end

---@return boolean
local function IsFreecamEnabled()
    return IsCamActive(freecamCamera) == 1
end

---@return number
local function GetSpeedMultiplier()
    if IsDisabledControlPressed(0, INPUT_SPRINT) then
        return freecamSettings.fastMoveMultiplier
    elseif IsDisabledControlPressed(0, INPUT_CHARACTER_WHEEL) then
        return freecamSettings.slowMoveMultiplier
    end
    return freecamSettings.normalMoveMultiplier
end

local function CameraLoop()
    if not IsFreecamEnabled() or IsPauseMenuActive() then
        return
    end

    if not IsFreecamFrozen() then
        local vecX, vecY = GetFreecamMatrix()
        local vecZ = vector3(0, 0, 1)
        local pos = GetFreecamPosition()
        local rot = GetFreecamRotation()

        local frameMultiplier = GetFrameTime() * 60
        local speedMultiplier = GetSpeedMultiplier() * frameMultiplier

        local mouseX = GetDisabledControlNormal(0, INPUT_LOOK_LR)
        local mouseY = GetDisabledControlNormal(0, INPUT_LOOK_UD)
        local moveWS = GetDisabledControlNormal(0, INPUT_MOVE_UD)
        local moveAD = GetDisabledControlNormal(0, INPUT_MOVE_LR)
        local moveQZ = GetDisabledControlNormalBetween(0, INPUT_COVER, INPUT_MULTIPLAYER_INFO)

        local rotX = rot.x + (-mouseY * freecamSettings.mouseSensitivityY)
        local rotZ = rot.z + (-mouseX * freecamSettings.mouseSensitivityX)

        pos = pos + (vecX * moveAD * speedMultiplier)
        pos = pos + (vecY * -moveWS * speedMultiplier)
        pos = pos + (vecZ * moveQZ * speedMultiplier)

        SetFreecamPosition(pos.x, pos.y, pos.z)
        SetFreecamRotation(rotX, 0.0, rotZ)
    end

    TriggerEvent("FreeCam:Update")
end

---@param enable boolean
---@param isNoclip? boolean
local function SetFreecamEnabled(enable, isNoclip)
    if enable == IsFreecamEnabled() then
        return
    end

    freecamIsNoclip = isNoclip or false

    if enable then
        local pos = GetGameplayCamCoord()
        local rot = GetGameplayCamRot()

        freecamCamera = CreateCam("DEFAULT_SCRIPTED_CAMERA", true)

        SetFreecamFov(freecamSettings.fov)
        SetFreecamPosition(pos.x, pos.y, pos.z)
        SetFreecamRotation(rot.x, rot.y, rot.z)

        CreateThread(function()
            while IsFreecamEnabled() do
                Wait(5)
                CameraLoop()
            end
        end)
    else
        DestroyCam(freecamCamera)
        if not freecamIsNoclip then
            ClearFocus()
        end
        UnlockMinimapPosition()
        UnlockMinimapAngle()
    end

    RenderScriptCams(enable, freecamSettings.enableEasing, freecamSettings.easingDuration)
end

AddEventHandler("onResourceStop", function(resourceName)
    if resourceName == GetCurrentResourceName() then
        SetFreecamEnabled(false)
    end
end)

-- ========================================================================
-- NoClip System
-- ========================================================================

local noclipActive = false
local noclipEntity = false
local noclipMode = false
local noclipAlphaEntity = false
local noclipAlphaValue = 155
local noclipPedCameraOffset = 2.75

---@param mode? boolean
local function noclipToggle(mode)
    noclipMode = mode or false

    if noclipActive then
        exports["st_admin"]:NoClipStop()
    else
        exports["st_admin"]:NoClipStart()
    end
end

local function noclipStart()
    if noclipActive then return end

    noclipEntity = PlayerPedId()
    if IsPedInAnyVehicle(noclipEntity) then
        noclipEntity = GetVehiclePedIsIn(noclipEntity, false)
    end

    if not NetworkHasControlOfEntity(noclipEntity) then
        noclipEntity = false
        return
    end

    SetEntityInvincible(noclipEntity, true)
    FreezeEntityPosition(noclipEntity, true)
    SetEntityCollision(noclipEntity, false, false)
    SetEntityVisible(noclipEntity, true, false)
    SetEntityAlpha(noclipEntity, noclipAlphaValue, false)
    noclipAlphaEntity = noclipEntity

    local entityCoords = GetEntityCoords(noclipEntity)
    local gameplayCamCoords = GetGameplayCamCoord()

    SetFreecamEnabled(true, true)
    if IsEntityAPed(noclipEntity) then
        SetFreecamPosition(gameplayCamCoords.x, gameplayCamCoords.y, gameplayCamCoords.z)
    else
        SetFreecamPosition(entityCoords.x, entityCoords.y, entityCoords.z)
    end
    noclipActive = true
end

local function noclipStop()
    if not noclipActive then return end

    local playerPed = PlayerPedId()

    if noclipEntity and DoesEntityExist(noclipEntity) then
        FreezeEntityPosition(noclipEntity, false)
        if not LocalPlayer.state.isAdmin or not LocalPlayer.state.isGodmode then
            SetEntityInvincible(noclipEntity, false)
        end
        SetEntityCollision(noclipEntity, true, true)
        SetEntityVisible(noclipEntity, true, false)
    end

    if noclipAlphaEntity and DoesEntityExist(noclipAlphaEntity) then
        ResetEntityAlpha(noclipAlphaEntity)
    end
    noclipAlphaEntity = false

    FreezeEntityPosition(playerPed, false)
    if not LocalPlayer.state.isAdmin or not LocalPlayer.state.isGodmode then
        SetEntityInvincible(playerPed, false)
    end
    SetEntityCollision(playerPed, true, true)
    SetEntityVisible(playerPed, true, false)

    noclipEntity = false
    SetFreecamEnabled(false)
    noclipEntity = PlayerPedId()
    noclipActive = false
end

---@return boolean
local function noclipIsActive()
    return noclipActive
end

---@return vector3?
local function noclipGetPos()
    if noclipActive then
        return GetFreecamPosition()
    end
end

exports("NoClipToggle", noclipToggle)
exports("NoClipStart", noclipStart)
exports("NoClipStop", noclipStop)
exports("NoClipIsActive", noclipIsActive)
exports("NoClipGetPos", noclipGetPos)

AddEventHandler("FreeCam:Update", function()
    local position = GetFreecamPosition()
    local rotation = GetFreecamRotation()

    if noclipActive and noclipEntity and DoesEntityExist(noclipEntity) and not noclipMode then
        if IsEntityAPed(noclipEntity) then
            local _, camForward = GetFreecamMatrix()
            local pedPosition = position + (camForward * noclipPedCameraOffset) + vector3(0.0, 0.0, -0.6)
            SetEntityCoordsNoOffset(noclipEntity, pedPosition, true, true, true)
            SetEntityHeading(noclipEntity, rotation.z)
        else
            SetEntityCoordsNoOffset(noclipEntity, position, false, false, false)
            SetEntityRotation(noclipEntity, rotation, 0, true)
        end
    end
end)

RegisterNetEvent("Admin:Client:NoClip", function(mode)
    exports["strata"]:ServerCallback("Admin:NoClip", {
        active = not noclipIsActive(),
    }, function(isAdmin)
        if isAdmin then
            noclipToggle(mode)
        end
    end)
end)

RegisterNetEvent("Admin:Client:NoClipInfo", function()
    if noclipActive then
        local position = GetFreecamPosition()
        local rotation = GetFreecamRotation()
        Strata.Log.Trace("NoClip", "Rotation: " .. rotation)
        Strata.Log.Trace("NoClip", "Position: " .. position)
    end
end)

RegisterNetEvent("Characters:Client:Logout", function()
    noclipStop()
end)
