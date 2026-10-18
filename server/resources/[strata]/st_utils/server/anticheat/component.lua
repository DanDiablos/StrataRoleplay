local _players = {}
local _blockedExplosions = {}

local _tmpIgnores = {}

-- Dunno if global state is actually available right away or have to wait till first gametick
CreateThread(function()
	GlobalState["WeaponDrops"] = {
		`PICKUP_AMMO_BULLET_MP`,
		`PICKUP_AMMO_FIREWORK`,
		`PICKUP_AMMO_FLAREGUN`,
		`PICKUP_AMMO_GRENADELAUNCHER`,
		`PICKUP_AMMO_GRENADELAUNCHER_MP`,
		`PICKUP_AMMO_HOMINGLAUNCHER`,
		`PICKUP_AMMO_MG`,
		`PICKUP_AMMO_MINIGUN`,
		`PICKUP_AMMO_MISSILE_MP`,
		`PICKUP_AMMO_PISTOL`,
		`PICKUP_AMMO_RIFLE`,
		`PICKUP_AMMO_RPG`,
		`PICKUP_AMMO_SHOTGUN`,
		`PICKUP_AMMO_SMG`,
		`PICKUP_AMMO_SNIPER`,
		`PICKUP_ARMOUR_STANDARD`,
		`PICKUP_CAMERA`,
		`PICKUP_CUSTOM_SCRIPT`,
		`PICKUP_GANG_ATTACK_MONEY`,
		`PICKUP_HEALTH_SNACK`,
		`PICKUP_HEALTH_STANDARD`,
		`PICKUP_MONEY_CASE`,
		`PICKUP_MONEY_DEP_BAG`,
		`PICKUP_MONEY_MED_BAG`,
		`PICKUP_MONEY_PAPER_BAG`,
		`PICKUP_MONEY_PURSE`,
		`PICKUP_MONEY_SECURITY_CASE`,
		`PICKUP_MONEY_VARIABLE`,
		`PICKUP_MONEY_WALLET`,
		`PICKUP_PARACHUTE`,
		`PICKUP_PORTABLE_CRATE_FIXED_INCAR`,
		`PICKUP_PORTABLE_CRATE_UNFIXED`,
		`PICKUP_PORTABLE_CRATE_UNFIXED_INCAR`,
		`PICKUP_PORTABLE_CRATE_UNFIXED_INCAR_SMALL`,
		`PICKUP_PORTABLE_CRATE_UNFIXED_LOW_GLOW`,
		`PICKUP_PORTABLE_DLC_VEHICLE_PACKAGE`,
		`PICKUP_PORTABLE_PACKAGE`,
		`PICKUP_SUBMARINE`,
		`PICKUP_VEHICLE_ARMOUR_STANDARD`,
		`PICKUP_VEHICLE_CUSTOM_SCRIPT`,
		`PICKUP_VEHICLE_CUSTOM_SCRIPT_LOW_GLOW`,
		`PICKUP_VEHICLE_HEALTH_STANDARD`,
		`PICKUP_VEHICLE_HEALTH_STANDARD_LOW_GLOW`,
		`PICKUP_VEHICLE_MONEY_VARIABLE`,
		`PICKUP_VEHICLE_WEAPON_APPISTOL`,
		`PICKUP_VEHICLE_WEAPON_ASSAULTSMG`,
		`PICKUP_VEHICLE_WEAPON_COMBATPISTOL`,
		`PICKUP_VEHICLE_WEAPON_GRENADE`,
		`PICKUP_VEHICLE_WEAPON_MICROSMG`,
		`PICKUP_VEHICLE_WEAPON_MOLOTOV`,
		`PICKUP_VEHICLE_WEAPON_PISTOL`,
		`PICKUP_VEHICLE_WEAPON_PISTOL50`,
		`PICKUP_VEHICLE_WEAPON_SAWNOFF`,
		`PICKUP_VEHICLE_WEAPON_SMG`,
		`PICKUP_VEHICLE_WEAPON_SMOKEGRENADE`,
		`PICKUP_VEHICLE_WEAPON_STICKYBOMB`,
		`PICKUP_WEAPON_ADVANCEDRIFLE`,
		`PICKUP_WEAPON_APPISTOL`,
		`PICKUP_WEAPON_ASSAULTRIFLE`,
		`PICKUP_WEAPON_ASSAULTSHOTGUN`,
		`PICKUP_WEAPON_ASSAULTSMG`,
		`PICKUP_WEAPON_AUTOSHOTGUN`,
		`PICKUP_WEAPON_BAT`,
		`PICKUP_WEAPON_BATTLEAXE`,
		`PICKUP_WEAPON_BOTTLE`,
		`PICKUP_WEAPON_BULLPUPRIFLE`,
		`PICKUP_WEAPON_BULLPUPSHOTGUN`,
		`PICKUP_WEAPON_CARBINERIFLE`,
		`PICKUP_WEAPON_COMBATMG`,
		`PICKUP_WEAPON_COMBATPDW`,
		`PICKUP_WEAPON_COMBATPISTOL`,
		`PICKUP_WEAPON_COMPACTLAUNCHER`,
		`PICKUP_WEAPON_COMPACTRIFLE`,
		`PICKUP_WEAPON_CROWBAR`,
		`PICKUP_WEAPON_DAGGER`,
		`PICKUP_WEAPON_DBSHOTGUN`,
		`PICKUP_WEAPON_FIREWORK`,
		`PICKUP_WEAPON_FLAREGUN`,
		`PICKUP_WEAPON_FLASHLIGHT`,
		`PICKUP_WEAPON_GRENADE`,
		`PICKUP_WEAPON_GRENADELAUNCHER`,
		`PICKUP_WEAPON_GUSENBERG`,
		`PICKUP_WEAPON_GOLFCLUB`,
		`PICKUP_WEAPON_HAMMER`,
		`PICKUP_WEAPON_HATCHET`,
		`PICKUP_WEAPON_HEAVYPISTOL`,
		`PICKUP_WEAPON_HEAVYSHOTGUN`,
		`PICKUP_WEAPON_HEAVYSNIPER`,
		`PICKUP_WEAPON_HOMINGLAUNCHER`,
		`PICKUP_WEAPON_KNIFE`,
		`PICKUP_WEAPON_KNUCKLE`,
		`PICKUP_WEAPON_MACHETE`,
		`PICKUP_WEAPON_MACHINEPISTOL`,
		`PICKUP_WEAPON_MARKSMANPISTOL`,
		`PICKUP_WEAPON_MARKSMANRIFLE`,
		`PICKUP_WEAPON_MG`,
		`PICKUP_WEAPON_MICROSMG`,
		`PICKUP_WEAPON_MINIGUN`,
		`PICKUP_WEAPON_MINISMG`,
		`PICKUP_WEAPON_MOLOTOV`,
		`PICKUP_WEAPON_MUSKET`,
		`PICKUP_WEAPON_NIGHTSTICK`,
		`PICKUP_WEAPON_PETROLCAN`,
		`PICKUP_WEAPON_PIPEBOMB`,
		`PICKUP_WEAPON_PISTOL`,
		`PICKUP_WEAPON_PISTOL50`,
		`PICKUP_WEAPON_POOLCUE`,
		`PICKUP_WEAPON_PROXMINE`,
		`PICKUP_WEAPON_PUMPSHOTGUN`,
		`PICKUP_WEAPON_RAILGUN`,
		`PICKUP_WEAPON_REVOLVER`,
		`PICKUP_WEAPON_RPG`,
		`PICKUP_WEAPON_SAWNOFFSHOTGUN`,
		`PICKUP_WEAPON_SMG`,
		`PICKUP_WEAPON_SMOKEGRENADE`,
		`PICKUP_WEAPON_SNIPERRIFLE`,
		`PICKUP_WEAPON_SNSPISTOL`,
		`PICKUP_WEAPON_SPECIALCARBINE`,
		`PICKUP_WEAPON_STICKYBOMB`,
		`PICKUP_WEAPON_STUNGUN`,
		`PICKUP_WEAPON_SWITCHBLADE`,
		`PICKUP_WEAPON_VINTAGEPISTOL`,
		`PICKUP_WEAPON_WRENCH`,
	}
	GlobalState["RemoveWeaponDropsTimer"] = 25
	GlobalState["BlacklistedSceneTypes"] = Config.BlacklistedSceneTypes
	GlobalState["BlacklistedSceneGroups"] = Config.BlacklistedSceneGroups
	GlobalState["BlacklistedVehs"] = Config.BlacklistedVehs
	GlobalState["BlacklistedPeds"] = Config.BlacklistedPeds
	GlobalState["AFKTimer"] = Config.Components.AFK.Options.AFKTimer
end)

AddEventHandler('onResourceStart', function(resource)
	if resource == GetCurrentResourceName() then
		Wait(1000)
		RegisterCallbacks()
	end
end)

-- Periodic damage modifier check
CreateThread(function()
	while true do
		Wait(60000)
		for _, v in ipairs(GetPlayers()) do
			local src = tonumber(v)
			local mult = GetPlayerWeaponDamageModifier(src)
			if mult > 1.0 then
				local player = Strata.User.Account(src)
				if player and player:GetData("Character") and not player.Permissions:IsAdmin() then
					local char = Strata.User.Find(src)
					if char then
						Strata.Log.Warn(
							"Anticheat",
							string.format(
								"%s %s (%s) Has Unusual Damage Modifier: %.2f",
								char:GetData("First"), char:GetData("Last"), char:GetData("SID"), mult
							),
							{ console = true, database = true, discord = { embed = true, type = 'error', webhook = GetConvar('discord_anticheat_webhook', '') } }
						)
						exports['st_utils']:Screenshot(char:GetData("SID"), "Damage Modifier: " .. tostring(mult))
					end
				end
			end
		end
	end
end)

AddEventHandler("playerDropped", function()
	exports['st_utils']:Disconnected(source)
end)

AddEventHandler("removeWeaponEvent", function(sender, data)
	if Config.Components.RemoveWeapon.Enabled then
		CancelEvent()
	end
	-- Would only affect if you have scripts removing other people's weapons. (stops players removing other players weapons)
end)

AddEventHandler("giveWeaponEvent", function(sender, data)
	if Config.Components.GiveWeapon.Enabled then
		CancelEvent()
	end
	-- Stops other players giving people weapons (doesn't affect single people unless you have give weapons on menus and etc.)
end)

local _blacklistedDamageWeapons = {
	[GetHashKey("WEAPON_MINIGUN")] = "Minigun",
	[GetHashKey("WEAPON_RPG")] = "RPG",
	[GetHashKey("WEAPON_HOMINGLAUNCHER")] = "Homing Launcher",
	[GetHashKey("WEAPON_GRENADELAUNCHER")] = "Grenade Launcher",
	[GetHashKey("WEAPON_COMPACTLAUNCHER")] = "Compact Grenade Launcher",
	[GetHashKey("WEAPON_RAILGUN")] = "Railgun",
	[GetHashKey("WEAPON_EMPLAUNCHER")] = "EMP Launcher",
}

AddEventHandler("weaponDamageEvent", function(sender, data)
	if not Config.Components.Weapon.Enabled then return end
	local src = tonumber(sender)
	local weaponName = _blacklistedDamageWeapons[data.weaponType]
	if not weaponName then return end
	CancelEvent()
	local player = Strata.User.Account(src)
	if player and player.Permissions:IsAdmin() then return end
	local char = Strata.User.Find(src)
	if char then
		Strata.Log.Warn("Anticheat",
			string.format("%s %s (%s) Used Blacklisted Weapon In Damage Event: %s",
				char:GetData("First"), char:GetData("Last"), char:GetData("SID"), weaponName),
			{ console = true, database = true, discord = { embed = true, type = 'error', webhook = GetConvar('discord_anticheat_webhook', '') } })
		exports['st_utils']:Screenshot(char:GetData("SID"), "Blacklisted Weapon Damage: " .. weaponName)
	end
end)

AddEventHandler("explosionEvent", function(sender, ev)
	local src = tonumber(sender)
	local player = Strata.User.Account(src)
	for _, v in ipairs(Config.Components.Explosions.Options.Types) do
		if ev.explosionType == v then
			CancelEvent()

			if
				_blockedExplosions[src] ~= nil
				and #_blockedExplosions[src] >= Config.Components.Explosions.Options.Count
			then
				local char = Strata.User.Find(src)
				if char then
					Strata.Log.Warn("Anticheat",
						string.format("%s %s (%s) Triggered Explosion Detection With Explosion Type of %s",
							char:GetData("First"), char:GetData("Last"), char:GetData("SID"), ev.explosionType), {
							console = true,
							file = false,
							database = true,
							discord = {
								embed = true,
								type = 'error',
								webhook = GetConvar('discord_anticheat_webhook', ''),
							}
						})
					exports['st_utils']:Screenshot(char:GetData("SID"), "Potential Weapon Exploit")
				else
					Strata.Log.Warn("Anticheat",
						string.format("Source %s Triggered Explosion Detection With Explosion Type of %s", src,
							ev.explosionType), {
							console = true,
							file = false,
							database = true,
							discord = {
								embed = true,
								type = 'error',
								webhook = GetConvar('discord_anticheat_webhook', ''),
							}
						})
				end
			else
				if _blockedExplosions[src] == nil then
					_blockedExplosions[src] = {
						{ time = os.time(), type = ev.explosionType },
					}
				else
					table.insert(_blockedExplosions[src], { time = os.time(), type = ev.explosionType })
				end
			end
		end
	end
end)

AddEventHandler("entityCreating", function(entity)
	if Config.BlacklistedVehs[GetEntityModel(entity)] then
		CancelEvent()
	end
end)

RegisterNetEvent("Anticheat:Server:ResourceStarted", function(resource)
	local plyr = Strata.User.Account(source)
	Strata.Log.Info(
		"Anticheat",
		string.format("%s (%s) Started A Resource: %s", plyr:GetData("Name"), plyr:GetData("AccountID"), resource),
		{
			console = true,
			file = true,
			database = true,
			discord = {
				embed = true,
				type = "error",
				webhook = GetConvar("discord_anticheat_webhook", ""),
			},
		}
	)
end)

RegisterNetEvent("Anticheat:Server:ResourceStopped", function(resource)
	local plyr = Strata.User.Account(source)

	if Config.BanResources[resource] then
		exports['strata']:PunishmentBanSource(
			plyr:GetData("Source"),
			-1,
			string.format("Blacklisted Resource Stopped: %s", resource),
			"Anticheat"
		)
	else
		Strata.Log.Info(
			"Anticheat",
			string.format("%s (%s) Stopped A Resource: %s", plyr:GetData("Name"), plyr:GetData("AccountID"), resource),
			{
				console = true,
				file = true,
				database = true,
				discord = {
					embed = true,
					type = "error",
					webhook = GetConvar("discord_anticheat_webhook", ""),
				},
			}
		)
	end
end)

CreateThread(function()
	while true do
		for k, v in pairs(_blockedExplosions) do
			for k2, v2 in ipairs(v) do
				if os.time() - v2.time > 600 then
					table.remove(_blockedExplosions[k], k2)
				end
			end
		end
		Wait(5000)
	end
end)

exports('Disconnected', function(source)
	_players[source] = nil
end)

exports('Get', function(source, key)
	if _players[source] == nil then
		_players[source] = {}
	end

	return _players[source][key]
end)

exports('Set', function(source, key)
	_players[source][key] = true
end)

exports('Unset', function(source, key)
	_players[source][key] = nil
end)

exports('TempPosIgnore', function(source)
	_tmpIgnores[source] = os.time() + 60
end)

exports('IsIgnored', function(source)
	return _tmpIgnores[source] ~= nil and os.time() < _tmpIgnores[source]
end)

exports('Screenshot', function(stateId, desc)
	local char = Strata.User.BySID(stateId)
	if char ~= nil then
		local wh = GetConvar("discord_anticheat_webhook", "")
		if wh ~= nil and wh ~= "" then
			exports["strata-screenshot"]:requestCustomClientScreenshotUploadToDiscord(
				char:GetData("Source"),
				tostring(wh),
				{
					encoding = "webp",
					quality = 1,
				},
				{
					content = "",
					embeds = {
						{
							color = 3844857,
							title = string.format("Screenshot from %s %s (%s) | %s", char:GetData("First"),
								char:GetData("Last"), char:GetData("SID"), desc),
						}
					}
				},
				10000,
				function(error)
					if error then
						Strata.Log.Warn(
							"Anticheat",
							string.format("Failed to Screenshot SID %s", stateId),
							{
								console = true,
							}
						)
					end
				end
			)
		end
	end
end)
