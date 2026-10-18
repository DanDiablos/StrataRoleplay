AddEventHandler("Characters:Client:Spawn", function()
    if not Config.Components.GodMode.Enabled then return end

    CreateThread(function()
        while LocalPlayer.state.loggedIn do
            Wait(2000)
            if LocalPlayer.state.isAdmin then goto continue end

            local ped = PlayerPedId()
            if IsPedInAnyVehicle(ped, false) then goto continue end
            if IsPedRagdoll(ped) then goto continue end

            local vx, vy, _ = table.unpack(GetEntityVelocity(ped))
            local speed = math.sqrt(vx * vx + vy * vy)

            if speed > 25.0 then
                TriggerServerEvent("Anticheat:Server:SpeedHack", math.floor(speed * 10) / 10)
            end

            ::continue::
        end
    end)
end)
