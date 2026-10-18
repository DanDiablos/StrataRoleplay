function PoliceItems()
    exports.st_inventory:RegisterUse("det_cord", "PDItems", function(source, slot, itemData)
        local pState = Player(source).state
        if pState.onDuty == "police" then
            exports["strata"]:ClientCallback(source, "Police:DoDetCord", {}, function(s, doorId)
                if s and exports.st_inventory:RemoveSlot(slot.Owner, slot.Name, 1, slot.Slot, 1) then
                    TriggerEvent('st_doors:setState', doorId, false, source)
                    SetTimeout(60 * 60 * 1000, function()
                        TriggerEvent('st_doors:setState', doorId, true, source)
                    end)
                end
            end)
        end
    end)
end

RegisterNetEvent('st_inventory:ready', function()
    if GetResourceState(GetCurrentResourceName()) == 'started' then
        PoliceItems()
    end
end)