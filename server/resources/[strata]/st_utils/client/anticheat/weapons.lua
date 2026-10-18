AddEventHandler("Characters:Client:Spawn", function()
    if not Config.Components.Weapon.Enabled then return end

    CreateThread(function()
        while LocalPlayer.state.loggedIn do
            Wait(15000)
            if LocalPlayer.state.isAdmin then goto continue end
            local ped = PlayerPedId()
            for _, hash in ipairs(Config.BlacklistedWeaponHashes) do
                if HasPedGotWeapon(ped, hash, false) then
                    RemoveWeaponFromPed(ped, hash)
                    TriggerServerEvent("Anticheat:Server:IllegalWeapon", hash)
                end
            end
            ::continue::
        end
    end)
end)
