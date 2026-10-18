function RegisterCallbacks()
	exports["strata"]:RegisterServerCallback("Jail:SpawnJailed", function(source, data, cb)
		exports["strata"]:RoutePlayerToGlobalRoute(source)
		local char = Strata.User.Find(source)
		exports['st_utils']:TeleportIgnore(source)
		TriggerClientEvent("Jail:Client:EnterJail", source)
		cb(true)
	end)

	exports["strata"]:RegisterServerCallback("Jail:Validate", function(source, data, cb)
		if not exports['st_jail']:IsJailed(source) then
			cb(false)
		else
			if data.type == "logout" then
				cb(true)
			else
				cb(false)
			end
		end
	end)

	exports["strata"]:RegisterServerCallback("Jail:RetreiveItems", function(source, data, cb)
		exports.st_inventory:HoldingTake(source)
	end)

	exports["strata"]:RegisterServerCallback("Jail:Release", function(source, data, cb)
		cb(exports['st_jail']:Release(source))
	end)

	exports["strata"]:RegisterServerCallback("Jail:StartWork", function(source, data, cb)
		exports['st_jobs']:OnDuty("Prison", source, false)
	end)

	exports["strata"]:RegisterServerCallback("Jail:QuitWork", function(source, data, cb)
		exports['st_jobs']:OffDuty("Prison", source, false, false)
	end)

	exports["strata"]:RegisterServerCallback("Jail:MakeItem", function(source, data, cb)
		local char = Strata.User.Find(source)
		if data == "food" or data == "drink" then
			exports.st_inventory:AddItem(char:GetData("SID"), string.format("prison_%s", data), 1, {}, 1)
		end
	end)

	exports["strata"]:RegisterServerCallback("Jail:MakeJuice", function(source, data, cb)
		local char = Strata.User.Find(source)
		if char and data then
			exports.st_inventory:AddItem(char:GetData("SID"), data, 1, {}, 1)
		end
	end)

	exports["strata"]:RegisterServerCallback("Jail:Server:ExploitAttempt", function(source, data, cb)
		local char = Strata.User.Find(source)
		if char then
			if data == 1 then
				Strata.Log.Info(
					"Jail",
					string.format(
						"%s %s (%s) attempted to exploit out of prison in a trunk",
						char:GetData("First"),
						char:GetData("Last"),
						char:GetData("SID")
					),
					{
						console = true,
						file = true,
						database = true,
						discord = {
							embed = true,
							type = "info",
							webhook = GetConvar("discord_log_webhook", ""),
						},
					}
				)
			elseif data == 2 then
				Strata.Log.Info(
					"Jail",
					string.format(
						"%s %s (%s) attempted to exploit out of prison by being escorted out",
						char:GetData("First"),
						char:GetData("Last"),
						char:GetData("SID")
					),
					{
						console = true,
						file = true,
						database = true,
						discord = {
							embed = true,
							type = "info",
							webhook = GetConvar("discord_log_webhook", ""),
						},
					}
				)
			end
		end
	end)
end
