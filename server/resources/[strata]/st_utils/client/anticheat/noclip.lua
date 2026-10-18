AddEventHandler("Characters:Client:Spawn", function()
    if not Config.Components.NoClip.Enabled then return end

    CreateThread(function()
        while LocalPlayer.state.loggedIn do
            Wait(3000)
            if LocalPlayer.state.isAdmin then goto continue end
            if GetEntityCollisionDisabled(PlayerPedId()) then
                exports["strata"]:ServerCallback("Anticheat:Trigger", { check = "NoClip", match = "CollisionDisabled" }, function() end)
            end
            ::continue::
        end
    end)
end)
