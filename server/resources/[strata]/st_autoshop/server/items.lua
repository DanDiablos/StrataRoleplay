function RegisterMechanicItems()
    for k, v in pairs(_mechanicItemsToParts) do
        exports.st_inventory:RegisterUse(k, 'Mechanic', function(source, itemData)
            exports["strata"]:ClientCallback(source, 'Mechanic:StartInstall', {
                part = itemData.Name,
                quantity = 1,
            }, function(success)
                if success then
                    exports.st_inventory:RemoveSlot(itemData.Owner, itemData.Name, 1, itemData.Slot,
                        itemData.invType)
                end
            end)
        end)
    end

    for k, v in pairs(_mechanicItemsToUpgrades) do
        exports.st_inventory:RegisterUse(k, 'Mechanic', function(source, itemData)
            local partData = _mechanicItemsToUpgrades[itemData.Name]

            if partData then
                exports["strata"]:ClientCallback(source, 'Mechanic:StartUpgradeInstall', partData,
                    function(success, veh)
                        if success and veh then
                            exports.st_inventory:RemoveSlot(itemData.Owner, itemData.Name, 1, itemData.Slot,
                                itemData.invType)

                            local veh = NetworkGetEntityFromNetworkId(veh)
                            local vehState = Entity(veh)
                            if DoesEntityExist(veh) and vehState and vehState.state.VIN then
                                local vehicleData = exports['st_veh']:OwnedGetActive(vehState.state.VIN)
                                if vehicleData and vehicleData:GetData('Properties') then
                                    local currentProperties = vehicleData:GetData('Properties')

                                    if currentProperties.mods then
                                        if partData.toggleMod then
                                            currentProperties.mods[partData.mod] = true
                                        else
                                            currentProperties.mods[partData.mod] = partData.modIndex
                                        end
                                    end

                                    vehicleData:SetData('Properties', currentProperties)
                                    exports['st_veh']:OwnedForceSave(vehicleData:GetData('VIN'))
                                end
                            end

                            TriggerClientEvent('Mechanic:Client:ForcePerformanceProperty', -1,
                                NetworkGetNetworkIdFromEntity(veh), partData.modType,
                                partData.toggleMod or partData.modIndex)
                        end
                    end)
            end
        end)
    end
end

RegisterNetEvent('st_inventory:ready', function()
    if GetResourceState(GetCurrentResourceName()) == 'started' then
        RegisterMechanicItems()
    end
end)
