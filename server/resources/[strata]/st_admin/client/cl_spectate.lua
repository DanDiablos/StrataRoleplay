local lastSpectateLocation = nil
local isSpectateEnabled = false
local storedTargetPed = nil
local storedTargetPlayerId = nil
local storedGameTag = nil
local storedTargetData = nil
local isInvis = false

---@param controlButton string
---@param text string
local function InstructionalButton(controlButton, text)
    ScaleformMovieMethodAddParamPlayerNameString(controlButton)
    BeginTextCommandScaleformString("STRING")
    AddTextComponentScaleform(text)
    EndTextCommandScaleformString()
end

local function createScaleformThread()
    CreateThread(function()
        local scaleform = RequestScaleformMovie("instructional_buttons")
        while not HasScaleformMovieLoaded(scaleform) do
            Wait(1)
        end
        PushScaleformMovieFunction(scaleform, "CLEAR_ALL")
        PopScaleformMovieFunctionVoid()

        PushScaleformMovieFunction(scaleform, "SET_CLEAR_SPACE")
        PushScaleformMovieFunctionParameterInt(200)
        PopScaleformMovieFunctionVoid()

        PushScaleformMovieFunction(scaleform, "SET_DATA_SLOT")
        PushScaleformMovieFunctionParameterInt(1)
        InstructionalButton(GetControlInstructionalButton(0, GetHashKey("+cancel_action") | 0x80000000, 1), "Exit Spectate Mode")
        PopScaleformMovieFunctionVoid()

        PushScaleformMovieFunction(scaleform, "DRAW_INSTRUCTIONAL_BUTTONS")
        PopScaleformMovieFunctionVoid()

        PushScaleformMovieFunction(scaleform, "SET_BACKGROUND_COLOUR")
        PushScaleformMovieFunctionParameterInt(0)
        PushScaleformMovieFunctionParameterInt(0)
        PushScaleformMovieFunctionParameterInt(0)
        PushScaleformMovieFunctionParameterInt(80)
        PopScaleformMovieFunctionVoid()

        while isSpectateEnabled do
            DrawScaleformMovieFullscreen(scaleform, 255, 255, 255, 255, 0)
            Wait(0)
        end
        SetScaleformMovieAsNoLongerNeeded()
    end)
end

---@param coords vector3
---@return vector3
local function calculateSpectatorCoords(coords)
    return vec3(coords.x, coords.y, coords.z - 15.0)
end

local function createGamerTagInfo()
    if storedGameTag and IsMpGamerTagActive(storedGameTag) then
        SetMpGamerTagVisibility(storedGameTag, 4, NetworkIsPlayerTalking(storedTargetPlayerId))
        return
    end
    if not storedTargetData then return end

    local nameTag = ("%s %s (%s)"):format(storedTargetData?.First, storedTargetData?.Last, storedTargetData?.SID)
    storedGameTag = CreateFakeMpGamerTag(storedTargetPed, nameTag, false, false, "", 0, 0, 0, 0)
    SetMpGamerTagVisibility(storedGameTag, 2, 1)
    SetMpGamerTagAlpha(storedGameTag, 2, 255)
    SetMpGamerTagHealthBarColor(storedGameTag, 129)
    SetMpGamerTagAlpha(storedGameTag, 4, 255)
    SetMpGamerTagVisibility(storedGameTag, 4, NetworkIsPlayerTalking(storedTargetPlayerId))
end

local function clearGamerTagInfo()
    if not storedGameTag then return end
    RemoveMpGamerTag(storedGameTag)
    storedGameTag = nil
end

---@param bool boolean
local function preparePlayerForSpec(bool)
    local playerPed = PlayerPedId()
    FreezeEntityPosition(playerPed, bool)
    SetEntityVisible(playerPed, not bool, 0)
end

local function createSpectatorTeleportThread()
    CreateThread(function()
        while isSpectateEnabled do
            Wait(500)

            if not DoesEntityExist(storedTargetPed) then
                local ped = GetPlayerPed(storedTargetPlayerId)
                if ped > 0 then
                    storedTargetPed = ped
                else
                    toggleSpectate(storedTargetPed, storedTargetPlayerId)
                    break
                end
            end

            local newSpectateCoords = calculateSpectatorCoords(GetEntityCoords(storedTargetPed))
            SetEntityCoords(PlayerPedId(), newSpectateCoords.x, newSpectateCoords.y, newSpectateCoords.z, 0, 0, 0, false)
        end
    end)
end

---@param targetPed number
---@param targetPlayerId? number
local function toggleSpectate(targetPed, targetPlayerId)
    local playerPed = PlayerPedId()

    if isSpectateEnabled then
        isSpectateEnabled = false

        if not lastSpectateLocation then
            exports["st_ui"]:Notification("error", "Last location previous to spectate was not stored properly")
        end

        if not storedTargetPed then
            exports["st_ui"]:Notification("error", "Target ped was not stored to unspectate")
        end

        DoScreenFadeOut(500)
        while not IsScreenFadedOut() do Wait(5) end

        RequestCollisionAtCoord(lastSpectateLocation.x, lastSpectateLocation.y, lastSpectateLocation.z)
        SetEntityCoords(playerPed, lastSpectateLocation.x, lastSpectateLocation.y, lastSpectateLocation.z)
        local attempts = 0
        while not HasCollisionLoadedAroundEntity(playerPed) and attempts < 20 do
            Wait(50)
            attempts += 1
        end

        preparePlayerForSpec(false)
        NetworkSetInSpectatorMode(false, storedTargetPed)
        clearGamerTagInfo()
        DoScreenFadeIn(500)

        storedTargetPed = nil
    else
        storedTargetPed = targetPed
        storedTargetPlayerId = targetPlayerId
        local targetCoords = GetEntityCoords(targetPed)

        RequestCollisionAtCoord(targetCoords.x, targetCoords.y, targetCoords.z)
        while not HasCollisionLoadedAroundEntity(targetPed) do
            Wait(5)
        end

        NetworkSetInSpectatorMode(true, targetPed)
        DoScreenFadeIn(500)
        isSpectateEnabled = true
        createSpectatorTeleportThread()
        createScaleformThread()
    end
end

local function cleanupFailedResolve()
    local playerPed = PlayerPedId()

    RequestCollisionAtCoord(lastSpectateLocation.x, lastSpectateLocation.y, lastSpectateLocation.z)
    SetEntityCoords(playerPed, lastSpectateLocation.x, lastSpectateLocation.y, lastSpectateLocation.z)
    while not HasCollisionLoadedAroundEntity(playerPed) do
        Wait(5)
    end
    preparePlayerForSpec(false)
    DoScreenFadeIn(500)

    exports["st_ui"]:Notification("error", "Failed to Spectate")
end

local function adminStopAttach()
    if isSpectateEnabled then
        toggleSpectate(storedTargetPed)
        preparePlayerForSpec(false)
        exports["st_ui"]:Notification("info", "Detaching from Player")
    else
        exports["st_ui"]:Notification("info", "Not attached to anyone")
    end
end

exports("AdminStopAttach", adminStopAttach)

RegisterNetEvent("Admin:Client:Invisible", function()
    if isInvis then
        SetEntityVisible(LocalPlayer.state.ped, true)
        exports["st_ui"]:Notification("info", "Invisibility: Off")
        isInvis = false
    else
        SetEntityVisible(LocalPlayer.state.ped, false)
        exports["st_ui"]:Notification("info", "Invisibility: On")
        isInvis = true
    end
end)

RegisterNetEvent("Admin:Client:Attach", function(tSource, tCoord, tData)
    if tSource and tCoord then
        exports["st_admin"]:CloseMenu()
        lastSpectateLocation = GetEntityCoords(LocalPlayer.state.ped)

        local targetPlayerId = GetPlayerFromServerId(tSource)
        if targetPlayerId == PlayerId() then
            return
        end

        DoScreenFadeOut(500)
        while not IsScreenFadedOut() do Wait(0) end

        local tpCoords = calculateSpectatorCoords(tCoord)
        SetEntityCoords(LocalPlayer.state.ped, tpCoords.x, tpCoords.y, tpCoords.z, 0, 0, 0, false)
        preparePlayerForSpec(true)

        local resolvePlayerAttempts = 0
        local resolvePlayerFailed

        repeat
            if resolvePlayerAttempts > 100 then
                resolvePlayerFailed = true
                break
            end
            Wait(50)
            targetPlayerId = GetPlayerFromServerId(tSource)
            resolvePlayerAttempts = resolvePlayerAttempts + 1
        until (GetPlayerPed(targetPlayerId) > 0) and targetPlayerId ~= -1

        if resolvePlayerFailed then
            return cleanupFailedResolve()
        end

        storedTargetData = tData
        toggleSpectate(GetPlayerPed(targetPlayerId), targetPlayerId)

        CreateThread(function()
            while isSpectateEnabled do
                createGamerTagInfo()
                Wait(50)
            end
            clearGamerTagInfo()
        end)
    else
        if isSpectateEnabled then
            toggleSpectate(storedTargetPed)
            preparePlayerForSpec(false)
        end
    end
end)

RegisterNetEvent("Admin:Client:AdminStopAttach", function()
    adminStopAttach()
end)

AddEventHandler("Keybinds:Client:KeyDown:cancel_action", function()
    if isSpectateEnabled then
        toggleSpectate(storedTargetPed)
        preparePlayerForSpec(false)
    end
end)

RegisterNetEvent("Characters:Client:Logout")
AddEventHandler("Characters:Client:Logout", function()
    if isInvis then
        SetEntityVisible(LocalPlayer.state.ped, true)
        isInvis = false
    end

    if isSpectateEnabled then
        toggleSpectate(storedTargetPed)
        preparePlayerForSpec(false)
    end
end)
