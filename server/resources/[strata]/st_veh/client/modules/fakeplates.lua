AddEventHandler('Vehicles:Client:StartUp', function()
    exports["strata"]:RegisterClientCallback('Vehicles:GetFakePlateAddingVehicle', function(data, cb)
        local coords = GetEntityCoords(PlayerPedId())
        local maxDistance = 5.0
        local includePlayerVehicle = false
        local vehicle = lib.getClosestVehicle(coords, maxDistance, includePlayerVehicle)

        if vehicle and DoesEntityExist(vehicle) and IsEntityAVehicle(vehicle) and CanModelHaveFakePlate(GetEntityModel(vehicle)) then
            if exports['st_veh']:HasAccess(vehicle, false, true) and (exports['st_veh']:UtilsIsCloseToRearOfVehicle(vehicle) or exports['st_veh']:UtilsIsCloseToFrontOfVehicle(vehicle)) then
                exports['st_ui']:Progress({
                    name = "vehicle_adding_plate",
                    duration = 5000,
                    label = "Installing Plate",
                    useWhileDead = false,
                    canCancel = true,
                    ignoreModifier = true,
                    controlDisables = {
                        disableMovement = true,
                        disableCarMovement = true,
                        disableMouse = false,
                        disableCombat = false,
                    },
                    animation = {
                        animDict = "anim@amb@clubhouse@tutorial@bkr_tut_ig3@",
                        anim = "machinic_loop_mechandplayer",
                        --flags = 15,
                    },
                }, function(cancelled)
                    if not cancelled and exports['st_veh']:HasAccess(vehicle, true, true) and (exports['st_veh']:UtilsIsCloseToRearOfVehicle(vehicle) or exports['st_veh']:UtilsIsCloseToFrontOfVehicle(vehicle)) then
                        cb(VehToNet(vehicle))
                    else
                        cb(false)
                    end
                end)
            else
                cb(false)
            end
        else
            cb(false)
        end
    end)
end)

AddEventHandler('Vehicles:Client:RemoveFakePlate', function(entityData)
    if entityData and DoesEntityExist(entityData.entity) and CanModelHaveFakePlate(GetEntityModel(entityData.entity)) then
        exports['st_ui']:Progress({
            name = "vehicle_removing_plate",
            duration = 5000,
            label = "Removing Plate",
            useWhileDead = false,
            canCancel = true,
            ignoreModifier = true,
            controlDisables = {
                disableMovement = true,
                disableCarMovement = true,
                disableMouse = false,
                disableCombat = false,
            },
            animation = {
                animDict = "anim@amb@clubhouse@tutorial@bkr_tut_ig3@",
                anim = "machinic_loop_mechandplayer",
                --flags = 15,
            },
        }, function(cancelled)
            if not cancelled and exports['st_veh']:HasAccess(entityData.entity) and (exports['st_veh']:UtilsIsCloseToRearOfVehicle(entityData.entity) or exports['st_veh']:UtilsIsCloseToFrontOfVehicle(entityData.entity)) then
                exports["strata"]:ServerCallback('Vehicles:RemoveFakePlate', VehToNet(entityData.entity),
                    function(success, plate)
                        if success then
                            exports["st_ui"]:Notification("success", 'Removed Plate Successfully')
                            SetVehicleNumberPlateText(entityData.entity, plate)
                        else
                            exports["st_ui"]:Notification("error", 'Could not Remove Plate')
                        end
                    end)
            else
                exports["st_ui"]:Notification("error", 'Could not Remove Plate')
            end
        end)
    end
end)

AddEventHandler('Vehicles:Client:RemoveHarness', function(entityData)
    if entityData and DoesEntityExist(entityData.entity) then
        exports['st_ui']:Progress({
            name = "vehicle_removing_harness",
            duration = 5000,
            label = "Removing Harness",
            useWhileDead = false,
            canCancel = true,
            ignoreModifier = true,
            controlDisables = {
                disableMovement = true,
                disableCarMovement = true,
                disableMouse = false,
                disableCombat = false,
            },
            animation = {
                animDict = "anim@amb@clubhouse@tutorial@bkr_tut_ig3@",
                anim = "machinic_loop_mechandplayer",
                --flags = 15,
            },
        }, function(cancelled)
            if not cancelled and exports['st_veh']:HasAccess(entityData.entity, true) then
                exports["strata"]:ServerCallback('Vehicles:RemoveHarness', VehToNet(entityData.entity),
                    function(success)
                        if success then
                            exports["st_ui"]:Notification("success", 'Removed Harness Successfully')
                        else
                            exports["st_ui"]:Notification("error", 'Could not Remove Harness')
                        end
                    end)
            else
                exports["st_ui"]:Notification("error", 'Could not Remove Harness')
            end
        end)
    end
end)
