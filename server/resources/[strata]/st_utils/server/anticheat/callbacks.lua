local _blacklistedClientEvents = {
	"esx:getSharedObject",
	"ambulancier:selfRespawn",
	"bank:transfer",
	"esx_ambulancejob:revive",
	"esx-qalle-jail:openJailMenu",
	"esx_jailer:wysylandoo",
	"esx_society:openBossMenu",
	"esx:spawnVehicle",
	"esx_status:set",
	"HCheat:TempDisableDetection",
	"UnJP",
}

local afkCodes = {}

local _blacklistedCommands = {
	"brutan",
	"chocolate",
	"haha",
	"killmenu",
	"KP",
	"lol",
	"lynx",
	"opk",
	--"panic",
	"panickey",
	"panik",
	-- "pk",
	"FunCtionOk",
	"porcodiooo",
	"demmerda",
	"puzzi",
	"jolmany",
}

local _retrieved = {}

function RegisterCallbacks()
	exports["st_chat"]:RegisterStaffCommand("toggleafk", function(source, args, rawCommand)
		local disabled = GlobalState["DisableAFK"] or false
		GlobalState["DisableAFK"] = not disabled

		exports["st_chat"]:SendSystemSingle(
			source,
			string.format("AFK Kicking %s", GlobalState["DisableAFK"] and "Disabled" or "Enabled")
		)
	end, {
		help = "Enabled/Disable AFK Kicks",
	}, 0)

	-- exports["st_chat"]:RegisterAdminCommand("pwnzorban", function(source, args, rawCommand)
	-- 	local player = Strata.User.BySID(tonumber(args[1]))
	-- 	if player ~= nil then
	-- 		exports['strata']:PunishmentBanSource(player:GetData("Source"), -1, args[2], "Anticheat")
	-- 	end
	-- end, {
	-- 	help = "Fake Anticheat Ban",
	-- 	params = {
	-- 		{
	-- 			name = "Target",
	-- 			help = "State ID of Who You Want To Ban",
	-- 		},
	-- 		{
	-- 			name = "Reason",
	-- 			help = "Reason For The Ban",
	-- 		},
	-- 	},
	-- }, 2)

	-- exports["st_chat"]:RegisterAdminCommand("pwnzorsource", function(source, args, rawCommand)
	-- 	local player = Strata.User.Account(tonumber(args[1]))
	-- 	if player ~= nil then
	-- 		exports['strata']:PunishmentBanSource(tonumber(args[1]), -1, args[2], "Anticheat")
	-- 	end
	-- end, {
	-- 	help = "Ban Player From Server",
	-- 	params = {
	-- 		{
	-- 			name = "Target",
	-- 			help = "Source of Who You Want To Ban",
	-- 		},
	-- 		{
	-- 			name = "Reason",
	-- 			help = "Reason For The Ban",
	-- 		},
	-- 	},
	-- }, 2)

	exports["strata"]:RegisterServerCallback("Anticheat:GetEvents", function(source, data, cb)
		if not exports['st_utils']:Get(source, "GetEvents") then
			exports['st_utils']:Set(source, "GetEvents")
			cb(_blacklistedClientEvents)
		else
			if not Strata.User.Account(source).Permissions:IsAdmin() then
				exports['strata']:PunishmentBanSource(source, -1, "Attempt To Recall GetEvents", "Anticheat")
			end
		end
	end)

	exports["strata"]:RegisterServerCallback("Anticheat:GetCommands", function(source, data, cb)
		if not exports['st_utils']:Get(source, "GetCommands") then
			exports['st_utils']:Set(source, "GetCommands")
			cb(_blacklistedCommands)
		else
			if not Strata.User.Account(source).Permissions:IsAdmin() then
				exports['strata']:PunishmentBanSource(source, -1, "Attempt To Recall GetCommands", "Anticheat")
			end
		end
	end)

	exports["strata"]:RegisterServerCallback("Anticheat:AFK", function(source, data, cb)
		if Config.Components.AFK.Enabled then
			exports['strata']:PunishmentKick(source, "You Were Kicked For Being AFK", "Anticheat", true)
		end
	end)

	local _fovScreenshotLast = {}

	exports["strata"]:RegisterServerCallback("Anticheat:FOV", function(source, data, cb)
		if Config.Components.FOV.Enabled then
			local char = Strata.User.Find(source)
			local fov = data.fov
			if char then
				if not _fovScreenshotLast[source] or (GetGameTimer() - _fovScreenshotLast[source]) > 30000 then
					_fovScreenshotLast[source] = GetGameTimer()
					exports['st_utils']:Screenshot(char:GetData("SID"),
						string.format("Detected Modified FOV: %s", fov))
				end

				Strata.Log.Warn(
					"Anticheat",
					string.format(
						"%s %s (%s) Detected Modified FOV: %s",
						char:GetData("First"),
						char:GetData("Last"),
						char:GetData("SID"),
						fov
					),
					{
						console = true,
						file = false,
						database = true,
						discord = {
							embed = true,
							type = "error",
							webhook = GetConvar("discord_anticheat_webhook", ""),
						},
					}
				)

				if Config.Components.FOV.Options.KickPlayer then
					Wait(5000) -- need time to process screenshot

					exports['strata']:PunishmentKick(src, string.format("Detected Modified FOV: %s", fov), "Anticheat",
						true)
				end
			end
		end
	end)

	exports["strata"]:RegisterServerCallback("Anticheat:AspectRatio", function(source, data, cb)
		if Config.Components.AspectRatio.Enabled then
			local src = source
			local char = Strata.User.Find(src)
			if char then
				exports['st_utils']:Screenshot(char:GetData("SID"), "Detected Unusual Resolution")

				Strata.Log.Warn(
					"Anticheat",
					string.format(
						"%s %s (%s) Detected Unusual Resolution",
						char:GetData("First"),
						char:GetData("Last"),
						char:GetData("SID")
					),
					{
						console = true,
						file = false,
						database = true,
						discord = {
							embed = true,
							type = "error",
							webhook = GetConvar("discord_anticheat_webhook", ""),
						},
					}
				)

				if Config.Components.AspectRatio.Options.KickPlayer then
					Wait(5000) -- need time to process screenshot

					exports['strata']:PunishmentKick(src, "Detected Unusual Resolution", "Anticheat", true)
				end
			end
		end
	end)

	exports["strata"]:RegisterServerCallback("Anticheat:Trigger", function(source, data, cb)
		cb("💙 From Anticheat 🙂")
		if not Strata.User.Account(source).Permissions:IsAdmin() then
			Strata.Log.Info(
				"Anticheat",
				string.format("Anticheat Trigger For %s: %s (check) %s (match)", source, data.check, data.match),
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
			exports['strata']:PunishmentBanSource(
				source,
				-1,
				string.format("Anticheat Trigger: %s (check) %s (match)", data.check, data.match),
				"Anticheat"
			)
		end
	end)

	exports["strata"]:RegisterServerCallback("Anticheat:GetCode", function(source, data, cb)
		afkCodes[source] = exports['strata']:GeneratorHackerIngVerb()
		cb(afkCodes[source])
	end)

	exports["strata"]:RegisterServerCallback("Anticheat:EnterCode", function(source, data, cb)
		if afkCodes[source] ~= nil then
			if afkCodes[source] == data then
				afkCodes[source] = nil
				cb(true)
			else
				exports['st_ui']:Notification(source, "error", "Incorrect AFK Code")
				cb(false)
			end
		else
			cb(false)
		end
	end)
end
