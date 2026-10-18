RegisterNetEvent("Admin:Client:Marker", function(x, y)
    SetNewWaypoint(x, y)
end)

RegisterNetEvent("Admin:Client:CopyCoords", function(action)
    local ped = PlayerPedId()
    local pedCoords = GetEntityCoords(ped)
    local pedHeading = GetEntityHeading(ped)
    local pedRotation = GetEntityRotation(ped)

    if action == "vec4" then
        exports["st_admin"]:CopyClipboard(string.format("vector4(%.3f, %.3f, %.3f, %.3f)", pedCoords.x, pedCoords.y, pedCoords.z, pedHeading))
    elseif action == "vec2" then
        exports["st_admin"]:CopyClipboard(string.format("vector2(%.3f, %.3f)", pedCoords.x, pedCoords.y))
    elseif action == "z" then
        exports["st_admin"]:CopyClipboard(string.format("%.3f", pedCoords.z))
    elseif action == "h" then
        exports["st_admin"]:CopyClipboard(string.format("%.3f", pedHeading))
    elseif action == "table" then
        exports["st_admin"]:CopyClipboard(string.format(
            "x = %.3f,\ny = %.3f,\nz = %.3f,\nh = %.3f,",
            pedCoords.x, pedCoords.y, pedCoords.z, pedHeading
        ))
    elseif action == "rot" then
        exports["st_admin"]:CopyClipboard(string.format("vector3(%.3f, %.3f, %.3f)", pedRotation.x, pedRotation.y, pedRotation.z))
    elseif action == "cctv" then
        exports["st_admin"]:CopyClipboard(string.format(
            "x = %.3f, y = %.3f, z = %.3f, r = { x = %.3f, y = %.3f, z = %.3f }",
            pedCoords.x, pedCoords.y, pedCoords.z, pedRotation.x, pedRotation.y, pedRotation.z
        ))
    else
        exports["st_admin"]:CopyClipboard(string.format("vector3(%.3f, %.3f, %.3f)", pedCoords.x, pedCoords.y, pedCoords.z))
    end
end)

RegisterNetEvent("Admin:Client:Recording", function(action)
    if action == "record" then
        StartRecording(1)
    elseif action == "stop" then
        StopRecordingAndSaveClip()
    elseif action == "delete" then
        StopRecordingAndDiscardClip()
    elseif action == "editor" then
        NetworkSessionLeaveSinglePlayer()
        ActivateRockstarEditor()
    end
end)

RegisterNetEvent("Admin:Client:ChangePed", function(model)
    local hash = GetHashKey(model)
    if IsModelValid(hash) then
        if not HasModelLoaded(hash) then
            RequestModel(hash)
            while not HasModelLoaded(hash) do
                Wait(100)
            end
        end

        SetPlayerModel(PlayerId(), hash)
        SetPedDefaultComponentVariation(PlayerPedId())
        SetModelAsNoLongerNeeded(hash)
    end
end)

RegisterNetEvent("Admin:Client:SetArmor", function(percent)
    local value = math.min(100, math.max(0, math.floor((tonumber(percent) or 0) + 0.0)))
    SetPedArmour(PlayerPedId(), value)
end)

RegisterNetEvent("Admin:Client:SetHealth", function(percent)
    local value = math.min(100, math.max(0, math.floor((tonumber(percent) or 0) + 0.0)))
    local ped = PlayerPedId()
    local maxHealth = GetEntityMaxHealth(ped)

    if value <= 0 then
        SetEntityHealth(ped, 0)
        return
    end

    local targetHealth = math.floor(100 + ((maxHealth - 100) * (value / 100.0)))
    SetEntityHealth(ped, targetHealth)
end)

---@param action string
local function doAdminVehicleAction(action)
    local insideVehicle = GetVehiclePedIsIn(LocalPlayer.state.ped, false)
    if
        LocalPlayer.state.isDev
        and insideVehicle
        and insideVehicle > 0
        and DoesEntityExist(insideVehicle)
        and NetworkHasControlOfEntity(insideVehicle)
    then
        exports["strata"]:ServerCallback("Admin:CurrentVehicleAction", { action = action }, function(canDo)
            if canDo then
                if action == "repair" then
                    exports["st_veh"]:RepairNormal(insideVehicle)
                elseif action == "repair_full" then
                    exports["st_veh"]:RepairFull(insideVehicle)
                elseif action == "repair_engine" then
                    exports["st_veh"]:RepairEngine(insideVehicle)
                end
            end
        end)
    end
end

local stateBagLog = nil
RegisterNetEvent("Admin:Client:StateBagLog", function()
    if stateBagLog then
        RemoveStateBagChangeHandler(stateBagLog)
        stateBagLog = nil
    else
        stateBagLog = AddStateBagChangeHandler(nil, nil, function(bagName, key, value, _, replicated)
            local player = GetPlayerFromStateBagName(bagName)
            if replicated or bagName == "global" or (player and PlayerId() ~= player) then
                print(bagName, key, value, replicated, #json.encode(value), json.encode(value))
            end
        end)
    end
end)

AddEventHandler("onClientResourceStart", function(resource)
    if resource ~= GetCurrentResourceName() then return end

    exports["st_binds"]:Add("admin_menu", "HOME", "keyboard", "[Admin] Open Admin Menu", function()
        exports["st_admin"]:OpenMenu()
    end)

    exports["st_binds"]:Add("admin_noclip", "END", "keyboard", "[Admin] Toggle NoClip", function()
        if LocalPlayer.state.isStaff then
            exports["strata"]:ServerCallback("Admin:NoClip", {
                active = not exports["st_admin"]:NoClipIsActive(),
            }, function(isAdmin)
                if isAdmin then
                    exports["st_admin"]:NoClipToggle()
                end
            end)
        end
    end)

    exports["st_binds"]:Add("admin_debug1", "", "keyboard", "[Admin] Debug 1", function()
        doAdminVehicleAction("repair_engine")
    end)

    exports["st_binds"]:Add("admin_debug2", "", "keyboard", "[Admin] Debug 2", function()
        doAdminVehicleAction("repair")
    end)

    exports["st_binds"]:Add("admin_debug3", "", "keyboard", "[Admin] Debug IDs", function()
        if LocalPlayer.state.isStaff then
            exports["st_admin"]:ToggleAdminPlayerIDs()
        end
    end)
end)
