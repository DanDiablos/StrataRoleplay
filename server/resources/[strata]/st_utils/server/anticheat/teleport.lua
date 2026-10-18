local _lastPos = {}
local _teleportIgnore = {}

exports('TeleportIgnore', function(source)
    _teleportIgnore[source] = os.time() + 30
end)

AddEventHandler("playerDropped", function()
    local src = source
    _lastPos[src] = nil
    _teleportIgnore[src] = nil
end)

CreateThread(function()
    while true do
        Wait(3000)
        for _, src in ipairs(GetPlayers()) do
            src = tonumber(src)

            -- Skip if not logged in
            local char = Strata.User.Find(src)
            if not char then goto continue end

            -- Skip if admin
            local player = Strata.User.Account(src)
            if player and player.Permissions:IsAdmin() then goto continue end

            -- Skip if recently teleported via ignore table
            if _teleportIgnore[src] and os.time() < _teleportIgnore[src] then goto continue end

            -- Skip if TempPosIgnore (check IsIgnored export)
            if exports['st_utils']:IsIgnored(src) then goto continue end

            local ped = GetPlayerPed(src)
            if not ped or ped == 0 then goto continue end

            -- Skip players in vehicles — fast vehicles will naturally cross 500m in 3s
            local veh = GetVehiclePedIsIn(ped, false)
            if veh and veh ~= 0 then goto continue end

            local coords = GetEntityCoords(ped)
            local last = _lastPos[src]

            if last then
                local dx = coords.x - last.x
                local dy = coords.y - last.y
                local dz = coords.z - last.z
                local dist = math.sqrt(dx * dx + dy * dy + dz * dz)

                if dist > 500 then
                    Strata.Log.Warn("Anticheat",
                        string.format("%s %s (%s) [Teleport]: Potential Teleport Detected: %.1fm in 3s (%.1f, %.1f, %.1f) -> (%.1f, %.1f, %.1f)",
                            char:GetData("First"), char:GetData("Last"), char:GetData("SID"),
                            dist,
                            last.x, last.y, last.z,
                            coords.x, coords.y, coords.z),
                        { console = true, database = true, discord = { embed = true, type = 'error', webhook = GetConvar('discord_anticheat_webhook', '') } })
                    exports['st_utils']:Screenshot(char:GetData("SID"),
                        string.format("Teleport Detected: %.1fm", dist))
                end
            end

            _lastPos[src] = coords

            ::continue::
        end
    end
end)
