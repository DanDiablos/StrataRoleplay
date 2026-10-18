---@param cb fun()? Called when cutscene finishes (screen will be faded out)
function PlayLandingCutscene(cb)
    CreateThread(function()
        if IsCutsceneActive() then
            StopCutsceneImmediately()
        end

        local cutscene = "hs4_lsa_land_nimb"
        RequestCutscene(cutscene, 8)

        local timeout = GetGameTimer() + 10000
        while not HasCutsceneLoaded() and GetGameTimer() < timeout do
            Wait(0)
        end

        if not HasCutsceneLoaded() then
            if cb then cb() end
            return
        end

        -- Ensure screen is faded out before starting
        if not IsScreenFadedOut() then
            DoScreenFadeOut(1000)
            while IsScreenFadingOut() do
                Wait(0)
            end
        end

        StartCutscene(0)
        DoScreenFadeIn(1000)

        -- Pre-load scene around the cutscene camera
        CreateThread(function()
            Wait(100)
            if IsCutsceneActive() then
                local x, y, z = GetWorldCoordFromScreenCoord(0.5, 0.5)
                NewLoadSceneStartSphere(x, y, z, 2000.0, 0)
            end
        end)

        -- Fade out near the end of the cutscene so it blends into the next screen
        local fadeStarted = false
        while IsCutsceneActive() do
            if not fadeStarted then
                local duration = GetCutsceneTotalDuration()
                local current = GetCutsceneTime()
                if duration > 0 and current >= duration - 1000 then
                    DoScreenFadeOut(1000)
                    fadeStarted = true
                end
            end
            Wait(0)
        end

        -- Ensure screen is fully black before proceeding
        while not IsScreenFadedOut() do
            Wait(0)
        end

        if cb then cb() end
    end)
end
