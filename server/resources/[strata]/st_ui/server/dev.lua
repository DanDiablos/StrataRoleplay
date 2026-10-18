-- If you are adding on to this, make sure you validate permission / distance / whatever you are using it for.

RegisterNetEvent('dev:deleteVehicle', function(netId)
    local player = Strata.User.Account(source)
    if player.Permissions:IsStaff() or player.Permissions:IsAdmin() then
        local entity = NetworkGetEntityFromNetworkId(netId)
        if not DoesEntityExist(entity) then return end

        exports['st_veh']:Delete(entity, function() end)
    else
        Strata.Log.Info(
            "Anticheat",
            string.format(
                "%s (%s) Attempted To Use Debug Function: %s. Network ID: %s, potentially a cheater?",
                player:GetData("Name"),
                player:GetData("AccountID"),
                "dev:deleteVehicle",
                netId
            )
        )
        return exports['st_ui']:Notification(source, "error", "How are you doing this?")
    end
end)

RegisterNetEvent('dev:getKeys', function(netId)
    local player = Strata.User.Account(source)
    if player.Permissions:IsStaff() or player.Permissions:IsAdmin() then
        local entity = NetworkGetEntityFromNetworkId(netId)
        if not DoesEntityExist(entity) then return end

        local vehicleState = Entity(entity).state
        if vehicleState.VIN then
            exports['st_veh']:KeysAdd(source, vehicleState.VIN)
            exports['st_ui']:Notification(source, "success", "Keys added for vehicle VIN: " .. vehicleState.VIN)
        end
    else
        Strata.Log.Info(
            "Anticheat",
            string.format(
                "%s (%s) Attempted To Use Debug Function: %s. Network ID: %s, potentially a cheater?",
                player:GetData("Name"),
                player:GetData("AccountID"),
                "dev:getKeys"
            )
        )
        return exports['st_ui']:Notification(source, "error", "How are you doing this?")
    end
end)

RegisterNetEvent('dev:deleteObject', function(netId)
    local player = Strata.User.Account(source)
    if player.Permissions:IsStaff() or player.Permissions:IsAdmin() then
        local entity = NetworkGetEntityFromNetworkId(netId)
        if not DoesEntityExist(entity) then return end

        DeleteEntity(entity)
        exports['st_ui']:Notification(source, "success", "Object deleted successfully")
    else
        Strata.Log.Info(
            "Anticheat",
            string.format(
                "%s (%s) Attempted To Use Debug Function: %s. Network ID: %s, potentially a cheater?",
                player:GetData("Name"),
                player:GetData("AccountID"),
                "dev:deleteObject",
                netId
            )
        )
        return exports['st_ui']:Notification(source, "error", "How are you doing this?")
    end
end)
