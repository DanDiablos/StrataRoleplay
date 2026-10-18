AddEventHandler("Characters:Client:Spawn", function()
    if not Config.Components.Spectator.Enabled then return end

    CreateThread(function()
        while LocalPlayer.state.loggedIn do
            Wait(5000)
            if LocalPlayer.state.isAdmin then goto continue end
            if NetworkIsInSpectatorMode() then
                exports["strata"]:ServerCallback("Anticheat:Trigger", { check = "Spectator", match = "SpectatorMode" }, function() end)
            end
            ::continue::
        end
    end)
end)
