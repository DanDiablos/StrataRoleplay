AddEventHandler("playerDropped", function()
    Player(source).state:set('backItems', false, true)
    TriggerClientEvent('backItems:clearPlayerItems', -1, source)
end)

AddEventHandler('playerJoining', function(source)
    Player(source).state:set('backItems', false, true)
end)


AddStateBagChangeHandler('flashlightState', '', function(bagName, _, state)
    local source = GetPlayerFromStateBagName(bagName)
    local currentWeapon = exports.st_inventory:GetCurrentWeapon(source)

    currentWeapon.metadata.flashlight = state
    exports.st_inventory:SetMetadata(source, currentWeapon.slot, currentWeapon.metadata)
end)