local _satInChair = nil

local SITTING_SCENE = nil
local CREATED_OBJECTS = {}

local _pauseAnim = false

local slotObjects = {}

local _spinningReels = false

local _sessionSpent = 0
local _sessionWinnings = 0

AddEventHandler("Casino:Client:Startup", function()
    for k, v in ipairs(_slotMachineObjects) do
        exports['st_target']:addModel(v, {
            {
                icon = "fas fa-crown",
                label = "Use Machine",
                event = "Casino:Client:UseSlotMachine",
                distance = 2.0,
                canInteract = function()
                    return not _satInChair and GlobalState["CasinoOpen"]
                end,
            },
            {
                icon = "fas fa-crown",
                label = "Leave Machine",
                event = "Casino:Client:LeaveSlotMachine",
                distance = 2.0,
                canInteract = function()
                    return _satInChair
                end,
            },
            {
                icon = "fas fa-play",
                label = "Place $100 Bet",
                onSelect = function()
                    TriggerEvent("Casino:Client:PlaySlotMachine", { bet = 100 })
                end,
                distance = 2.0,
                canInteract = function()
                    return _satInChair and not _spinningReels and GlobalState["CasinoOpen"]
                end,
            },
            {
                icon = "fas fa-play",
                label = "Place $250 Bet",
                onSelect = function()
                    TriggerEvent("Casino:Client:PlaySlotMachine", { bet = 250 })
                end,
                distance = 2.0,
                canInteract = function()
                    return _satInChair and not _spinningReels and GlobalState["CasinoOpen"]
                end,
            },
            {
                icon = "fas fa-play",
                label = "Place $500 Bet",
                onSelect = function()
                    TriggerEvent("Casino:Client:PlaySlotMachine", { bet = 500 })
                end,
                distance = 2.0,
                canInteract = function()
                    return _satInChair and not _spinningReels and GlobalState["CasinoOpen"]
                end,
            },
            {
                icon = "fas fa-play",
                label = "Place $1,000 Bet",
                onSelect = function()
                    TriggerEvent("Casino:Client:PlaySlotMachine", { bet = 1000 })
                end,
                distance = 2.0,
                canInteract = function()
                    return _satInChair and not _spinningReels and GlobalState["CasinoOpen"]
                end,
            },
            {
                icon = "fas fa-play",
                label = "Place $2,500 Bet",
                onSelect = function()
                    TriggerEvent("Casino:Client:PlaySlotMachine", { bet = 2500 })
                end,
                distance = 2.0,
                canInteract = function()
                    return _satInChair and not _spinningReels and GlobalState["CasinoOpen"]
                end,
            },
        })
    end
end)

AddEventHandler("Casino:Client:UseSlotMachine", function(data)
    local tableObj = data and data.entity and data.entity ~= 0 and data.entity or nil
    local tableId = tableObj and GetSlotMachineIdForEntity(tableObj) or nil

    if not tableId then
        exports["st_ui"]:Notification("error", "Not Close Enough to Machine")
        return
    end

    exports["strata"]:ServerCallback("Casino:SlotMachineSit", tableId, function(success)
            if success then
                _satInChair = GetChairObjFromTable(tableId, tableObj)
                _sessionSpent = 0
                _sessionWinnings = 0

                LocalPlayer.state.playingCasino = true

                exports['st_emotes']:EmotesForceCancel()
                TriggerEvent('st_inventory:disarm', LocalPlayer.state.ped, true)

                Strata.World.StageAnim("anim_casino_b@amb@casino@games@shared@player@")

                SITTING_SCENE = NetworkCreateSynchronisedScene(_satInChair.position, _satInChair.rotation, 2, 1, 0,
                    1065353216, 0, 1065353216)
                local randomSit = ({ 'sit_enter_left', 'sit_enter_right' })[math.random(1, 2)]
                NetworkAddPedToSynchronisedScene(LocalPlayer.state.ped, SITTING_SCENE,
                    "anim_casino_b@amb@casino@games@shared@player@", randomSit, 2.0, -2.0, 13, 16, 2.0, 0)
                NetworkStartSynchronisedScene(SITTING_SCENE)

                SITTING_SCENE = NetworkConvertSynchronisedSceneToSynchronizedScene(SITTING_SCENE)

                repeat Wait(0) until GetSynchronizedScenePhase(SITTING_SCENE) >= 0.99 or HasAnimEventFired(LocalPlayer.state.ped, 2038294702) or HasAnimEventFired(LocalPlayer.state.ped, -1424880317)

                Wait(300)
                Strata.World.StageAnim("anim_casino_a@amb@casino@games@slots@male")
                FreezeEntityPosition(LocalPlayer.state.ped, true)
                TaskPlayAnim(LocalPlayer.state.ped, "anim_casino_a@amb@casino@games@slots@male", "betidle_idle_a", 2.0,
                    -1.0, -1, 1)
                local loc = GetOffsetFromEntityInWorldCoords(tableObj, 0.0, -0.85, 0.0)
                SetEntityCoords(LocalPlayer.state.ped, loc.x, loc.y, _satInChair.position.z - 0.34)

                TaskPlayAnim(LocalPlayer.state.ped, "anim_casino_a@amb@casino@games@slots@male", "betidle_idle_a", 2.0,
                    -1.0, -1, 1)

                CreateThread(function()
                    PlaySlotMachineSound("welcome_stinger")
                end)

                ShowSlotStateUI()

                CreateThread(function()
                    while _satInChair do
                        if not _pauseAnim and not IsEntityPlayingAnim(LocalPlayer.state.ped, "anim_casino_a@amb@casino@games@slots@male", "betidle_idle_a", 3) then
                            TaskPlayAnim(LocalPlayer.state.ped, "anim_casino_a@amb@casino@games@slots@male",
                                "betidle_idle_a", 2.0, -1.0, -1, 1)
                        end
                        Wait(500)
                    end
                end)

                SetupSlotMachine()
            else
                exports["st_ui"]:Notification("error", "Seat Taken")
            end
        end)
end)

function SetupSlotMachine()
    if _satInChair then
        CleanupSlots()

        local tableData = _slotMachines[_satInChair.tableId]
        local tableRotation = GetEntityHeading(_satInChair.tableObj)

        local rot = vector3(0.0, 0.0, tableRotation + 0.0)
        local Offset = GetObjectOffsetFromCoords(_satInChair.tableCoords, GetEntityHeading(_satInChair.tableObj), 0.0,
            -0.5, 0.6)
        local CamOffset = GetObjectOffsetFromCoords(_satInChair.tableCoords, GetEntityHeading(_satInChair.tableObj), 0.0,
            -0.5, 0.6)

        Strata.World.StageModel(tableData.prop1)

        local offset = GetOffsetFromEntityInWorldCoords(_satInChair.tableObj, 0.003, 0.050, 1.1)
        local reel1 = CreateObjectNoOffset(tableData.prop1, offset.x, offset.y, offset.z, false, false, false)

        offset = GetOffsetFromEntityInWorldCoords(_satInChair.tableObj, 0.003 + 0.124, 0.050, 1.1)
        local reel2 = CreateObjectNoOffset(tableData.prop1, offset.x, offset.y, offset.z, false, false)

        offset = GetOffsetFromEntityInWorldCoords(_satInChair.tableObj, 0.003 - 0.12, 0.050, 1.1)
        local reel3 = CreateObjectNoOffset(tableData.prop1, offset.x, offset.y, offset.z, false, false)

        table.insert(slotObjects, { obj = reel3, rot = 90.0 })
        table.insert(slotObjects, { obj = reel1, rot = 0 })
        table.insert(slotObjects, { obj = reel2, rot = 270.0 })

        for k, v in ipairs(slotObjects) do
            SetEntityHeading(v.obj, tableRotation)
            SetEntityCollision(v.obj, false)
            FreezeEntityPosition(v.obj, true)
        end

        UpdateReelRotations()

        StartSpinThread()
    end
end

AddEventHandler("Casino:Client:PlaySlotMachine", function(data)
    if _satInChair then
        _pauseAnim = true

        TaskPlayAnim(LocalPlayer.state.ped, "anim_casino_a@amb@casino@games@slots@male", "betidle_press_betmax_a", 3.0,
            11.0, -1, 48, 0, false, false, false)
        Wait(500)
        TaskPlayAnim(LocalPlayer.state.ped, "anim_casino_a@amb@casino@games@slots@male", "pull_spin_a", 3.0, 11.0, -1, 48,
            0, false, false, false)
        PlayEntityAnim(_satInChair.tableObj, "pull_spin_a_slotmachine", "anim_casino_a@amb@casino@games@slots@male",
            1000.0, false, true, true, 0, 136704)

        Wait(1000)

        exports["strata"]:ServerCallback("Casino:SlotMachinePlay", data,
            function(success, reelRotations, timeOut, sound, wonAmount)
                if success then
                    _sessionSpent += data.bet
                    ShowSlotStateUI()

                    CreateThread(function()
                        PlaySlotMachineSound("spinning")
                    end)

                    _spinningReels = true
                    Wait(timeOut)
                    _spinningReels = false

                    for k, v in ipairs(reelRotations) do
                        slotObjects[k].rot = GetReelRotation(v)
                    end

                    UpdateReelRotations()
                    PlaySlotMachineSound(sound)

                    if wonAmount and wonAmount > 0 then
                        _sessionWinnings += wonAmount
                        ShowSlotStateUI()
                    end
                else

                end
            end)

        Wait(1500)
        _pauseAnim = false
    end
end)

function StartSpinThread()
    CreateThread(function()
        while _satInChair do
            if _spinningReels then
                for k, v in ipairs(slotObjects) do
                    if v.rot >= 360.0 then
                        v.rot = 0.0
                    end

                    v.rot = v.rot + 11.25
                    SetEntityRotation(v.obj, v.rot, 0.0, GetEntityHeading(_satInChair.tableObj), 2, true)
                end
            else
                Wait(250)
            end
            Wait(1)
        end
    end)
end

AddEventHandler("Casino:Client:LeaveSlotMachine", function()
    if _satInChair then
        exports["strata"]:ServerCallback("Casino:SlotMachineLeave", {}, function(success)
            if success then
                exports['st_ui']:InfoOverlayClose()

                LocalPlayer.state.playingCasino = false

                _pauseAnim = true

                -- Snap to the real floor Z (captured when the ped was standing before sitting)
                local sitLoc = GetOffsetFromEntityInWorldCoords(_satInChair.tableObj, 0.0, -0.85, 0.0)
                SetEntityCoords(LocalPlayer.state.ped, sitLoc.x, sitLoc.y, _satInChair.floorZ)
                SetEntityHeading(LocalPlayer.state.ped, GetEntityHeading(_satInChair.tableObj))

                -- Instantly stop the sitting idle so there's no blend transition into exit_left
                ClearPedTasksImmediately(LocalPlayer.state.ped)
                Wait(0)

                Strata.World.StageAnim("anim_casino_a@amb@casino@games@slots@male")

                local animMs = math.floor(GetAnimDuration("anim_casino_a@amb@casino@games@slots@male", "exit_left") * 1000)
                TaskPlayAnim(LocalPlayer.state.ped, "anim_casino_a@amb@casino@games@slots@male", "exit_left",
                    1.0, 1.0, animMs, 0, 0.0, true, true, true)
                Wait(50)
                FreezeEntityPosition(LocalPlayer.state.ped, false)
                Wait(math.floor(animMs * 0.72) - 50)

                ClearPedTasks(LocalPlayer.state.ped)

                _satInChair = false

                CleanupSlots()
            end
        end)
    end
end)

local _slotReelsMap = {
    [`vw_prop_casino_slot_01a`] = `vw_prop_casino_slot_01a_reels`,
    [`vw_prop_casino_slot_02a`] = `vw_prop_casino_slot_02a_reels`,
    [`vw_prop_casino_slot_03a`] = `vw_prop_casino_slot_03a_reels`,
    [`vw_prop_casino_slot_04a`] = `vw_prop_casino_slot_04a_reels`,
    [`vw_prop_casino_slot_05a`] = `vw_prop_casino_slot_05a_reels`,
    [`vw_prop_casino_slot_06a`] = `vw_prop_casino_slot_06a_reels`,
    [`vw_prop_casino_slot_07a`] = `vw_prop_casino_slot_07a_reels`,
    [`vw_prop_casino_slot_08a`] = `vw_prop_casino_slot_08a_reels`,
}

-- Given the entity st_target already identified, find its config index and sync prop/prop1
function GetSlotMachineIdForEntity(entity)
    local entityCoords = GetEntityCoords(entity)
    local entityModel = GetEntityModel(entity)
    local closestId = nil
    local closestDist = 1000.0

    for k, v in ipairs(_slotMachines) do
        local dist = #(entityCoords - v.pos)
        if dist < closestDist then
            closestDist = dist
            closestId = k
        end
    end

    if closestId then
        -- Sync prop/prop1 to the actual model in world
        _slotMachines[closestId].prop = entityModel
        _slotMachines[closestId].prop1 = _slotReelsMap[entityModel]
    end

    return closestId
end

function GetChairObjFromTable(tableId, tableObj)
    return {
        tableId = tableId,
        tableObj = tableObj,
        tableModel = _slotMachines[tableId].prop,
        tableCoords = GetEntityCoords(tableObj),
        tableOffset = GetObjectOffsetFromCoords(GetEntityCoords(tableObj), GetEntityHeading(tableObj), 0.0, 0.05, 0.0),
        position = GetWorldPositionOfEntityBone(tableObj, GetEntityBoneIndexByName(tableObj, 'Chair_Base_01')),
        rotation = GetWorldRotationOfEntityBone(tableObj, GetEntityBoneIndexByName(tableObj, 'Chair_Base_01')),
        floorZ = GetEntityCoords(LocalPlayer.state.ped).z, -- ped is still standing at this point
        chairId = 1,
    }
end

function PlaySlotMachineSound(sound)
    if _satInChair then
        local soundRef = _slotMachineSounds[_satInChair.tableModel]
        local soundID = GetSoundId()

        PlaySoundFromEntity(soundID, sound, _satInChair.tableObj, soundRef, false, 20, 0)

        while not HasSoundFinished(soundID) do
            Wait(10)
        end

        ReleaseSoundId(soundID)
    end
end

function UpdateReelRotations()
    for k, v in ipairs(slotObjects) do
        SetEntityRotation(v.obj, v.rot, 0.0, GetEntityHeading(_satInChair.tableObj), 2, true)
    end
end

function CleanupSlots()
    for k, v in ipairs(slotObjects) do
        DeleteEntity(v.obj)
    end

    slotObjects = {}
end

AddEventHandler("Casino:Client:Exit", function()
    CleanupSlots()

    LocalPlayer.state.playingCasino = false
end)

AddEventHandler("onResourceStop", function(resource)
    if resource == GetCurrentResourceName() then
        Wait(1000)
        CleanupSlots()
    end
end)

function GetReelRotation(r)
    return r * 22.5 - 180 + 0.0
end

function ShowSlotStateUI()
    if _satInChair then
        local machineName = _slotMachineNames[_satInChair.tableModel]
        local myBalance = math.floor(exports['st_gamble']:ChipsGet())

        local overlay = string.format("Chip Balance: $%s<br>Session Spent: $%s<br>Session Winnings: $%s",
            formatNumberToCurrency(myBalance), formatNumberToCurrency(math.floor(_sessionSpent)),
            formatNumberToCurrency(math.floor(_sessionWinnings)))

        exports['st_ui']:InfoOverlayShow(machineName, overlay)
    end
end
