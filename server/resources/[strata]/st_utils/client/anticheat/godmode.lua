AddEventHandler("Characters:Client:Spawn", function()
    local _lastHpReport = 0
    local _lastArmorReport = 0

    if Config.Components.GodMode.Enabled then
        CreateThread(function()
            while LocalPlayer.state.loggedIn do
                Wait(5000)
                if LocalPlayer.state.isAdmin then goto continue end
                local ped = PlayerPedId()
                if IsEntityInvincible(ped) then
                    exports["strata"]:ServerCallback("Anticheat:Trigger", { check = "GodMode", match = "EntityInvincible" }, function() end)
                end
                ::continue::
            end
        end)
    end

    if Config.Components.Hp.Enabled then
        CreateThread(function()
            while LocalPlayer.state.loggedIn do
                Wait(3000)
                local ped = PlayerPedId()
                local hp = GetEntityHealth(ped)
                local maxHp = GetPedMaxHealth(ped)
                if hp > maxHp + 5 then
                    SetEntityHealth(ped, maxHp)
                    local now = GetGameTimer()
                    if now - _lastHpReport > 15000 then
                        _lastHpReport = now
                        TriggerServerEvent("Anticheat:Server:HealthHack", hp, maxHp)
                    end
                end
            end
        end)
    end

    if Config.Components.Armor.Enabled then
        CreateThread(function()
            while LocalPlayer.state.loggedIn do
                Wait(3000)
                local ped = PlayerPedId()
                local armor = GetPedArmour(ped)
                if armor > 100 then
                    SetPedArmour(ped, 100)
                    local now = GetGameTimer()
                    if now - _lastArmorReport > 15000 then
                        _lastArmorReport = now
                        TriggerServerEvent("Anticheat:Server:ArmorHack", armor)
                    end
                end
            end
        end)
    end

    if Config.Components.Invis.Enabled then
        CreateThread(function()
            while LocalPlayer.state.loggedIn do
                Wait(5000)
                if LocalPlayer.state.isAdmin then goto continue end
                local ped = PlayerPedId()
                local alpha = GetEntityAlpha(ped)
                if alpha < 50 then
                    ResetEntityAlpha(ped)
                    TriggerServerEvent("Anticheat:Server:Invisibility", alpha)
                end
                ::continue::
            end
        end)
    end
end)
