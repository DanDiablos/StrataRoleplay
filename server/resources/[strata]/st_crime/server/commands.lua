function RegisterCommands()
	exports["st_chat"]:RegisterAdminCommand("resetheist", function(source, args, rawCommand)
		if args[1] == "mazebank" then
			ResetMazeBank()
			exports['st_ui']:Notification(source, "success", "Maze Bank Heist Reset")
		elseif args[1] == "lombank" then
			ResetLombank()
			exports['st_ui']:Notification(source, "success", "Lombank Heist Reset")
		elseif args[1] == "paleto" then
			ResetPaleto()
			exports['st_ui']:Notification(source, "success", "Paleto Bank Heist Reset")
		elseif args[1] == "bobcat" then
			ResetBobcat()
		elseif args[1]:find("fleeca") and FLEECA_LOCATIONS[args[1]] ~= nil then
			ResetFleeca(args[1])
			exports['st_ui']:Notification(source, "success",
				string.format("Fleeca %s Reset", FLEECA_LOCATIONS[args[1]].label)
			)
		else
			exports['st_ui']:Notification(source, "error", "Invalid Bank ID")
		end
	end, {
		help = "Force Reset Heist",
		params = {
			{
				name = "Heist ID",
				help = "ID of what heist to reset (paleto, lombank, mazebank, bobcat, fleeca_*)",
			},
		},
	}, 1)

	exports["st_chat"]:RegisterAdminCommand("disablepower", function(source, args, rawCommand)
		if args[1] == "mazebank" then
			MazeBankDisablePower(source)
		elseif args[1] == "lombank" then
			LombankDisablePower(source)
		elseif args[1] == "paleto" then
			DisablePaletoPower(source)
		else
			exports['st_ui']:Notification(source, "error", "Invalid Bank ID")
		end
	end, {
		help = "Force Disable Power For Heist",
		params = {
			{
				name = "Heist ID",
				help = "ID of heist to disable power for (mazebank, lombank, paleto)",
			},
		},
	}, 1)

	exports["st_chat"]:RegisterAdminCommand("checkheist", function(source, args, rawCommand)
		if args[1] ~= nil then
			if args[1] == "mazebank" then
				if not _mbGlobalReset then
					exports["st_chat"]:SendSystemSingle(source, "<b>Maze Bank</b>: Not Yet Hit")
				else
					if os.time() > _mbGlobalReset then
						exports["st_chat"]:SendSystemSingle(
							source,
							string.format(
								"<b>Maze Bank</b>: Expired (%s)",
								Strata.Clock.Human(_mbGlobalReset - os.time())
							)
						)
					else
						exports["st_chat"]:SendSystemSingle(
							source,
							string.format(
								"<b>Maze Bank</b>: On Cooldown (%s)",
								Strata.Clock.Human(_mbGlobalReset - os.time())
							)
						)
					end
				end
			elseif args[1] == "lombank" then
				if not _lbGlobalReset then
					exports["st_chat"]:SendSystemSingle(source, "<b>Lombank</b>: Not Yet Hit")
				else
					if os.time() > _lbGlobalReset then
						exports["st_chat"]:SendSystemSingle(
							source,
							string.format(
								"<b>Lombank</b>: Expired (%s)",
								Strata.Clock.Human(_lbGlobalReset - os.time())
							)
						)
					else
						exports["st_chat"]:SendSystemSingle(
							source,
							string.format(
								"<b>Lombank</b>: On Cooldown (%s)",
								Strata.Clock.Human(_lbGlobalReset - os.time())
							)
						)
					end
				end
			elseif args[1] == "paleto" then
				if not _pbGlobalReset then
					exports["st_chat"]:SendSystemSingle(source, "<b>Paleto</b>: Not Yet Hit")
				else
					if os.time() > _pbGlobalReset then
						exports["st_chat"]:SendSystemSingle(
							source,
							string.format(
								"<b>Paleto</b>: Expired (%s)",
								Strata.Clock.Human(_pbGlobalReset - os.time())
							)
						)
					else
						exports["st_chat"]:SendSystemSingle(
							source,
							string.format(
								"<b>Paleto</b>: On Cooldown (%s)",
								Strata.Clock.Human(_pbGlobalReset - os.time())
							)
						)
					end
				end
			elseif args[1] == "bobcat" then
				if not _bcGlobalReset then
					exports["st_chat"]:SendSystemSingle(source, "<b>Bobcat</b>: Not Yet Hit")
				else
					if os.time() > _bcGlobalReset then
						exports["st_chat"]:SendSystemSingle(
							source,
							string.format(
								"<b>Bobcat</b>: Expired (%s)",
								Strata.Clock.Human(_bcGlobalReset - os.time())
							)
						)
					else
						exports["st_chat"]:SendSystemSingle(
							source,
							string.format(
								"<b>Bobcat</b>: On Cooldown (%s)",
								Strata.Clock.Human(_bcGlobalReset - os.time())
							)
						)
					end
				end
			elseif args[1] == "fleeca" then
				local str = "<b>Fleeca Cooldowns</b>:<ul>"
				for k, v in pairs(FLEECA_LOCATIONS) do
					if not _fcGlobalReset[k] then
						str = str .. string.format("<li><b>%s</b>: Not Yet Hit</li>", v.label)
					else
						if os.time() > _fcGlobalReset[k] then
							str = str
								.. string.format(
									"<li><b>%s</b>: Expired (%s)</li>",
									v.label,
									Strata.Clock.Human(_fcGlobalReset[k] - os.time())
								)
						else
							str = str
								.. string.format(
									"<li><b>%s</b>: On Cooldown (%s)</li>",
									v.label,
									Strata.Clock.Human(_fcGlobalReset[k] - os.time())
								)
						end
					end
				end
				local str = str .. "</ul>"
				exports["st_chat"]:SendSystemSingle(source, str)
			elseif args[1]:find("fleeca") and FLEECA_LOCATIONS[args[1]] ~= nil then
				local fleecaData = FLEECA_LOCATIONS[args[1]]
				if not _fcGlobalReset[args[1]] then
					exports["st_chat"]:SendSystemSingle(source,
						string.format("Fleeca - %s: Not Yet Hit", fleecaData.label))
				else
					if os.time() > _fcGlobalReset[args[1]] then
						exports["st_chat"]:SendSystemSingle(
							source,
							string.format(
								"Fleeca - %s: Expired (%s)",
								fleecaData.label,
								Strata.Clock.Human(_fcGlobalReset[args[1]] - os.time())
							)
						)
					else
						exports["st_chat"]:SendSystemSingle(
							source,
							string.format(
								"Fleeca - %s: On Cooldown (%s)",
								fleecaData.label,
								Strata.Clock.Human(_fcGlobalReset[args[1]] - os.time())
							)
						)
					end
				end
			else
				exports['st_ui']:Notification(source, "error", "Invalid Heist ID")
			end
		else
			local str = "<ul>"

			for k, v in pairs(FLEECA_LOCATIONS) do
				if not _fcGlobalReset[k] then
					str = str .. string.format("<li><b>Fleeca %s</b>: Not Yet Hit</li>", v.label)
				else
					if os.time() > _fcGlobalReset[k] then
						str = str
							.. string.format(
								"<li><b>Fleeca %s</b>: Expired (%s)</li>",
								v.label,
								Strata.Clock.Human(_fcGlobalReset[k] - os.time())
							)
					else
						str = str
							.. string.format(
								"<li><b>Fleeca %s</b>: On Cooldown (%s)</li>",
								v.label,
								Strata.Clock.Human(_fcGlobalReset[k] - os.time())
							)
					end
				end
			end

			if not _bcGlobalReset then
				str = str .. "<li><b>Bobcat</b>: Not Yet Hit</li>"
			else
				if os.time() > _bcGlobalReset then
					str = str
						.. string.format(
							"<li><b>Bobcat</b>: Expired (%s)</li>",
							Strata.Clock.Human(_bcGlobalReset - os.time())
						)
				else
					str = str
						.. string.format(
							"<li><b>Bobcat</b>: On Cooldown (%s)</li>",
							Strata.Clock.Human(_bcGlobalReset - os.time())
						)
				end
			end

			if not _mbGlobalReset then
				str = str .. "<li><b>Maze Bank</b>: Not Yet Hit</li>"
			else
				if os.time() > _mbGlobalReset then
					str = str
						.. string.format(
							"<li><b>Maze Bank</b>: Expired (%s)</li>",
							Strata.Clock.Human(_mbGlobalReset - os.time())
						)
				else
					str = str
						.. string.format(
							"<li><b>Maze Bank</b>: On Cooldown (%s)</li>",
							Strata.Clock.Human(_mbGlobalReset - os.time())
						)
				end
			end

			if not _lbGlobalReset then
				str = str .. "<li><b>Lombank</b>: Not Yet Hit</li>"
			else
				if os.time() > _lbGlobalReset then
					str = str
						.. string.format(
							"<li><b>Lombank</b>: Expired (%s)</li>",
							Strata.Clock.Human(_lbGlobalReset - os.time())
						)
				else
					str = str
						.. string.format(
							"<li><b>Lombank</b>: On Cooldown (%s)</li>",
							Strata.Clock.Human(_lbGlobalReset - os.time())
						)
				end
			end

			if not _pbGlobalReset then
				str = str .. "<li><b>Paleto</b>: Not Yet Hit</li>"
			else
				if os.time() > _pbGlobalReset then
					str = str
						.. string.format(
							"<li><b>Paleto</b>: Expired (%s)</li>",
							Strata.Clock.Human(_pbGlobalReset - os.time())
						)
				else
					str = str
						.. string.format(
							"<li><b>Paleto</b>: On Cooldown (%s)</li>",
							Strata.Clock.Human(_pbGlobalReset - os.time())
						)
				end
			end

			local str = str .. "</ul>"
			exports["st_chat"]:SendSystemSingle(source, str)
		end
	end, {
		help = "Check Heist Cooldown",
		params = {
			{
				name = "(Optional) Heist ID",
				help = "ID of heist to check cooldown timer (paleto, lombank, mazebank, bobcat, fleeca_*)",
			},
		},
	}, -1)

	exports["st_chat"]:RegisterAdminCommand("checkshitlord", function(source, args, rawCommand)
		if GlobalState["AntiShitlord"] ~= nil then
			if os.time() > GlobalState["AntiShitlord"] then
				exports["st_chat"]:SendSystemSingle(
					source,
					string.format(
						"AntiShitlord: Expired (%s)",
						Strata.Clock.Human(GlobalState["AntiShitlord"] - os.time())
					)
				)
			else
				exports["st_chat"]:SendSystemSingle(
					source,
					string.format(
						"AntiShitlord: On Cooldown (%s)",
						Strata.Clock.Human(GlobalState["AntiShitlord"] - os.time())
					)
				)
			end
		else
			exports["st_chat"]:SendSystemSingle(source, "AntiShitlord: Not Yet Triggered")
		end
	end, {
		help = "Display AnitShitlord Cooldown Timer",
	})

	exports["st_chat"]:RegisterAdminCommand("resetshitlord", function(source, args, rawCommand)
		GlobalState["AntiShitlord"] = false
		exports["st_chat"]:SendSystemSingle(source, "<b>AntiShitlord</b>: Reset")
	end, {
		help = "Reset AnitShitlord Cooldown Timer",
	})

	exports["st_chat"]:RegisterAdminCommand("checkstoreshitlord", function(source, args, rawCommand)
		if GlobalState["StoreAntiShitlord"] ~= nil then
			if os.time() > GlobalState["StoreAntiShitlord"] then
				exports["st_chat"]:SendSystemSingle(
					source,
					string.format(
						"StoreAntiShitlord: Expired (%s)",
						Strata.Clock.Human(GlobalState["StoreAntiShitlord"] - os.time())
					)
				)
			else
				exports["st_chat"]:SendSystemSingle(
					source,
					string.format(
						"StoreAntiShitlord: On Cooldown (%s)",
						Strata.Clock.Human(GlobalState["StoreAntiShitlord"] - os.time())
					)
				)
			end
		else
			exports["st_chat"]:SendSystemSingle(source, "StoreAntiShitlord: Not Yet Triggered")
		end
	end, {
		help = "Display AnitShitlord Cooldown Timer",
	})

	exports["st_chat"]:RegisterAdminCommand("resetstoreshitlord", function(source, args, rawCommand)
		GlobalState["StoreAntiShitlord"] = false
		exports["st_chat"]:SendSystemSingle(source, "<b>StoreAntiShitlord</b>: Reset")
	end, {
		help = "Reset StoreAntiShitlord Cooldown Timer",
	})

	exports["st_chat"]:RegisterAdminCommand("togglerobbery", function(source, args, rawCommand)
		GlobalState["RobberiesDisabled"] = not GlobalState["RobberiesDisabled"]
		local str = "ENABLED"
		if GlobalState["RobberiesDisabled"] then
			str = "DISABLED"
		end
		exports["st_chat"]:SendSystemSingle(source, string.format("<b>Robberies</b>: %s", str))
	end, {
		help = "Enabled/Disables Robbries",
	})

	exports["st_chat"]:RegisterAdminCommand("robstatus", function(source, args, rawCommand)
		local str = "ENABLED"
		if GlobalState["RobberiesDisabled"] then
			str = "DISABLED"
		end
		exports["st_chat"]:SendSystemSingle(source, string.format("<b>Robbery State</b>: %s", str))
	end, {
		help = "Enabled/Disables Robbries",
	})

	exports["st_chat"]:RegisterAdminCommand("disablelockdown", function(source, args, rawCommand)
		GlobalState["RestartLockdown"] = false
		exports["st_chat"]:SendSystemSingle(source, "<b>Restart Lockdown</b>: Disabled")
	end, {
		help = "Disable Restart Lockdown",
	})

	exports["st_chat"]:RegisterAdminCommand("heiststate", function(source, args, rawCommand)
		TriggerClientEvent("Robbery:Client:PrintState", source, args[1])
	end, {
		help = "Reset StoreAntiShitlord Cooldown Timer",
		params = {
			{
				name = "(Optional) Heist ID",
				help = "ID of heist to check cooldown timer (paleto, lombank, mazebank, bobcat, fleeca_*)",
			},
		},
	})
end
