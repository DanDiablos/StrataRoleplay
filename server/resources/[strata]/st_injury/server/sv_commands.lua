exports["st_chat"]:RegisterStaffCommand("heal", function(source, args)
	if args[1] ~= nil then
		local admin = Strata.User.Account(source)
		local char  = Strata.User.BySID(tonumber(args[1]))
		if char ~= nil and ((char:GetData("Source") ~= admin:GetData("Source")) or admin.Permissions:IsAdmin()) then
			exports["strata"]:ClientCallback(char:GetData("Source"), "Damage:Heal", true)
			exports['st_utils']:Set(source, "PLAYER_STRESS", 0)
		else
			exports["st_chat"]:SendSystemSingle(source, "Invalid State ID")
		end
	else
		local char = Strata.User.Find(source)
		if char ~= nil then
			exports["strata"]:ClientCallback(source, "Damage:Heal", true)
			exports['st_utils']:Set(source, "PLAYER_STRESS", 0)
		end
	end
end, {
	help   = "Heals Player",
	params = { { name = "Target (Optional)", help = "State ID of Who You Want To Heal" } },
}, -1)

exports["st_chat"]:RegisterStaffCommand("healrange", function(source, args)
	local radius = args[1] and tonumber(args[1]) or 25.0
	local myPed  = GetPlayerPed(source)

	for _, char in pairs(Strata.User.Roster()) do
		if char ~= nil then
			local src = char:GetData("Source")
			if Player(src).state.isDead then
				if #(GetEntityCoords(GetPlayerPed(src)) - GetEntityCoords(myPed)) <= radius then
					exports["strata"]:ClientCallback(src, "Damage:Heal", true)
				end
			end
		end
	end

	exports["strata"]:ClientCallback(source, "Damage:Heal", true)
	exports['st_utils']:Set(source, "PLAYER_STRESS", 0)
end, {
	help   = "Heals players in radius",
	params = { { name = "Radius (Optional)", help = "Radius to heal (default 25m)" } },
}, -1)

exports["st_chat"]:RegisterAdminCommand("god", function(source)
	if Player(source).state.isGodmode then
		SetPlayerInvincible(source, false)
		Player(source).state.isGodmode = false
		exports['st_ui']:Notification(source, "info", "God Mode Disabled")
		exports["strata"]:ClientCallback(source, "Damage:Admin:Godmode", false)
	else
		SetPlayerInvincible(source, true)
		Player(source).state.isGodmode = true
		exports['st_ui']:Notification(source, "info", "God Mode Enabled")
		exports["strata"]:ClientCallback(source, "Damage:Admin:Godmode", true)
	end
end, { help = "Toggle God Mode" }, -1)

exports["st_chat"]:RegisterAdminCommand("die", function(source)
	if not Player(source).state.isDead then
		exports["strata"]:ClientCallback(source, "Damage:Kill")
	end
end, { help = "Kill Yourself" })
