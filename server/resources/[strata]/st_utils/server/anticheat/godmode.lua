local _armorHits = {}
local _weaponHits = {}

AddEventHandler("playerDropped", function()
    local src = source
    _armorHits[src] = nil
    _weaponHits[src] = nil
end)

RegisterNetEvent("Anticheat:Server:HealthHack", function(hp, maxHp)
    local src = source
    local char = Strata.User.Find(src)
    if not char then return end
    Strata.Log.Warn("Anticheat",
        string.format("%s %s (%s) [HealthHack]: Health Overflow Detected: HP=%s MaxHP=%s",
            char:GetData("First"), char:GetData("Last"), char:GetData("SID"), hp, maxHp),
        { console = true, database = true, discord = { embed = true, type = 'error', webhook = GetConvar('discord_anticheat_webhook', '') } })
    exports['st_utils']:Screenshot(char:GetData("SID"), "Health Overflow Detected")
end)

RegisterNetEvent("Anticheat:Server:ArmorHack", function(armor)
    local src = source
    local char = Strata.User.Find(src)
    if not char then return end

    local now = os.time()
    if not _armorHits[src] then _armorHits[src] = {} end

    -- Clean old entries beyond 60s
    for i = #_armorHits[src], 1, -1 do
        if now - _armorHits[src][i] > 60 then
            table.remove(_armorHits[src], i)
        end
    end
    table.insert(_armorHits[src], now)

    Strata.Log.Warn("Anticheat",
        string.format("%s %s (%s) [ArmorHack]: Armor Overflow Detected: Armor=%s",
            char:GetData("First"), char:GetData("Last"), char:GetData("SID"), armor),
        { console = true, database = true, discord = { embed = true, type = 'error', webhook = GetConvar('discord_anticheat_webhook', '') } })
    exports['st_utils']:Screenshot(char:GetData("SID"), "Armor Overflow Detected")

    if #_armorHits[src] >= 3 then
        _armorHits[src] = {}
        exports['strata']:PunishmentKick(src,
            string.format("Armor Hack Detected (repeated offenses)"),
            "Anticheat", true)
    end
end)

RegisterNetEvent("Anticheat:Server:IllegalWeapon", function(weaponHash)
    local src = source
    local char = Strata.User.Find(src)
    if not char then return end

    local now = os.time()
    if not _weaponHits[src] then _weaponHits[src] = {} end
    table.insert(_weaponHits[src], now)

    Strata.Log.Warn("Anticheat",
        string.format("%s %s (%s) [IllegalWeapon]: Illegal Weapon Detected: Hash=%s",
            char:GetData("First"), char:GetData("Last"), char:GetData("SID"), weaponHash),
        { console = true, database = true, discord = { embed = true, type = 'error', webhook = GetConvar('discord_anticheat_webhook', '') } })
    exports['st_utils']:Screenshot(char:GetData("SID"), "Illegal Weapon: " .. tostring(weaponHash))

    if #_weaponHits[src] >= 2 then
        _weaponHits[src] = {}
        exports['strata']:PunishmentBanSource(src, -1,
            string.format("Illegal Weapon Detected: Hash=%s", weaponHash),
            "Anticheat")
    end
end)

RegisterNetEvent("Anticheat:Server:Invisibility", function(alpha)
    local src = source
    local char = Strata.User.Find(src)
    if not char then return end
    Strata.Log.Warn("Anticheat",
        string.format("%s %s (%s) [Invisibility]: Invisibility Detected: Alpha=%s",
            char:GetData("First"), char:GetData("Last"), char:GetData("SID"), alpha),
        { console = true, database = true, discord = { embed = true, type = 'error', webhook = GetConvar('discord_anticheat_webhook', '') } })
    exports['st_utils']:Screenshot(char:GetData("SID"), "Invisibility Detected: Alpha=" .. tostring(alpha))
end)

RegisterNetEvent("Anticheat:Server:SpeedHack", function(speed)
    local src = source
    local char = Strata.User.Find(src)
    if not char then return end
    Strata.Log.Warn("Anticheat",
        string.format("%s %s (%s) [SpeedHack]: Speed Hack Detected: Speed=%sm/s",
            char:GetData("First"), char:GetData("Last"), char:GetData("SID"), speed),
        { console = true, database = true, discord = { embed = true, type = 'error', webhook = GetConvar('discord_anticheat_webhook', '') } })
    exports['st_utils']:Screenshot(char:GetData("SID"), "Speed Hack Detected: " .. tostring(speed) .. "m/s")
    exports['strata']:PunishmentKick(src,
        string.format("Speed Hack Detected: %sm/s", speed),
        "Anticheat", true)
end)
