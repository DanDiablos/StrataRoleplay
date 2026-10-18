local awaitingNuke = false

local function showNukeSprite()
    CreateThread(function()
        RequestStreamedTextureDict("Biohazard", true)
        while not HasStreamedTextureDictLoaded("Biohazard") do
            RequestStreamedTextureDict("Biohazard", true)
            Wait(10)
        end

        local alpha = 255
        local dir = true

        while awaitingNuke do
            if dir then
                if alpha > 0 then
                    alpha -= 10
                else
                    dir = not dir
                end
            else
                if alpha < 255 then
                    alpha += 10
                else
                    dir = not dir
                end
            end

            DrawSprite("Biohazard", "nukeilluminated", 0.80, 0.80, 0.1205, 0.20, 0.00, 255, 255, 255, alpha)
            Wait(1)
        end
    end)
end

RegisterNetEvent("Admin:Client:NukeCountdown", function()
    if not LocalPlayer.state.loggedIn then return end

    awaitingNuke = true
    showNukeSprite()
    exports["st_sound"]:PlayOne("nukeincome.ogg", 0.5)

    Wait(3000)

    for _ = 1, 10 do
        exports["st_sound"]:PlayOne("countbeep.ogg", 0.5)
        Wait(2000)
    end
end)

RegisterNetEvent("Admin:Client:Nuke", function()
    if not LocalPlayer.state.loggedIn then return end

    exports["st_sound"]:PlayOne("nukeboom.ogg", 0.3)
    Wait(500)

    StartScreenEffect("PeyoteIn", 1000, false)
    SetCamEffect(1)
    StartEntityFire(LocalPlayer.state.ped)

    local veh = GetVehiclePedIsIn(LocalPlayer.state.ped, false)

    if IsPedOnFoot(LocalPlayer.state.ped) then
        SetPedToRagdoll(LocalPlayer.state.ped, 5000, 5000, 0, true, true, false)
        for _ = 1, 6 do
            Wait(250)
            ApplyForceToEntityCenterOfMass(LocalPlayer.state.ped, 1, 0.00, 0.00, 5000.00, true, false, false, true)
        end
    elseif IsPedInAnyVehicle(LocalPlayer.state.ped) then
        for i = 1, 6 do
            Wait(250)
            local fy = i < 6 and 10000.00 or -10000.00
            local fz = i < 6 and 10000.00 or -10000.00
            ApplyForceToEntityCenterOfMass(veh, 1, 0.00, fy, fz, true, true, true, true)
        end
    end

    StopScreenEffect("PeyoteIn")
    StartScreenEffect("Damage", 60000, false)
    StartScreenEffect("RaceTurbo", 60000, false)

    Wait(60000)

    SetCamEffect(0)
    StopAllScreenEffects()
    awaitingNuke = false
end)
