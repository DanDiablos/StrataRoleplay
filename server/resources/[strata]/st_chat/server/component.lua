AddEventHandler('onResourceStart', function(resource)
	if resource == GetCurrentResourceName() then
		Wait(1000)
		RegisterMiddleware()
		RegisterCallbacks()
		RegisterChatCommands()

		exports["st_chat"]:RegisterCommand("me", function(source, args, rawCommand)
			if #args > 0 then
				local message = table.concat(args, " ")
				TriggerClientEvent("Chat:Client:ReceiveMe", -1, source, GetGameTimer(), message)
			else
				exports["st_chat"]:SendServerSingle(source, "Invalid Number Of Arguments")
			end
		end, {
			help = "Let People Know What You are Doing",
			params = {},
		}, -1)

		exports["st_chat"]:RegisterStaffCommand("clearall", function(source, args, rawCommand)
			exports["st_chat"]:ClearAll()
		end, {
			help = "[Staff] Clear chat for everyone",
		}, 0)
	end
end)

function RegisterMiddleware()
	exports['strata']:MiddlewareAdd("Characters:Spawning", function(source)
		exports["st_chat"]:RefreshCommands(source)
	end, 3)
end

AddEventHandler("Job:Server:DutyRemove", function(dutyData, source)
	exports["st_chat"]:RefreshCommands(source)
end)

AddEventHandler("Job:Server:DutyAdd", function(dutyData, source)
	exports["st_chat"]:RefreshCommands(source)
end)

exports("RefreshCommands", function(source)
	local player = Strata.User.Account(source)
	local char = Strata.User.Find(source)
	if char ~= nil and player ~= nil then
		local myDuty = Player(source).state.onDuty
		TriggerClientEvent("chat:resetSuggestions", source)
		local allowedCommands = {}
		local removeCommands = {}

		for k, command in pairs(commandSuggestions) do
			local commandString = ("/" .. k)
			--TriggerClientEvent('chat:addSuggestion', source, commandString, '')
			if IsPlayerAceAllowed(source, ("command.%s"):format(k)) then
				if commands[k] ~= nil then
					if commands[k].admin then
						if player.Permissions:IsAdmin() then
							table.insert(allowedCommands, {
								name = commandString,
								help = command.help,
								params = command.params,
							})
						else
							table.insert(removeCommands, commandString)
						end
					elseif commands[k].staff then
						if player.Permissions:IsStaff() then
							table.insert(allowedCommands, {
								name = commandString,
								help = command.help,
								params = command.params,
							})
						else
							table.insert(removeCommands, commandString)
						end
					elseif commands[k].job ~= nil then
						local canUse = false
						for k2, v2 in pairs(commands[k].job) do
							if
								v2.Id == nil
								or (
									myDuty
									and myDuty == v2.Id
									and exports['st_jobs']:HasJob(
										source,
										v2.Id,
										v2.Workplace or false,
										v2.Grade or false,
										v2.Level or false
									)
								)
							then
								canUse = true
							end
						end

						if canUse then
							table.insert(allowedCommands, {
								name = commandString,
								help = command.help,
								params = command.params,
							})
						else
							table.insert(removeCommands, commandString)
						end
					else
						table.insert(allowedCommands, {
							name = commandString,
							help = command.help,
							params = command.params,
						})
					end
				else
					table.insert(allowedCommands, {
						name = commandString,
						help = "",
					})
				end
			end
		end

		TriggerClientEvent("chat:addSuggestions", source, allowedCommands)
		TriggerClientEvent("chat:removeSuggestions", source, removeCommands)
	end
end)

exports("ClearAll", function()
	TriggerClientEvent("chat:clearChat", -1)
end)

exports("SendOOC", function(source, message)
	local char = Strata.User.Find(source)
	if char ~= nil then
		TriggerClientEvent("chat:addMessage", -1, {
			time = os.time(),
			type = "ooc",
			message = message,
			author = {
				First = char:GetData("First"),
				Last = char:GetData("Last"),
				SID = char:GetData("SID"),
			},
		})
	end
end)

exports("SendServerAll", function(message)
	TriggerClientEvent("chat:addMessage", -1, {
		time = os.time(),
		type = "server",
		message = message,
	})
end)

exports("SendServerSingle", function(source, message)
	TriggerClientEvent("chat:addMessage", source, {
		time = os.time(),
		type = "server",
		message = message,
	})
end)

exports("SendBroadcastAll", function(author, message)
	TriggerClientEvent("chat:addMessage", -1, {
		time = os.time(),
		type = "broadcast",
		message = message,
	})
end)

exports("SendSystemAll", function(message)
	TriggerClientEvent("chat:addMessage", -1, {
		time = os.time(),
		type = "system",
		message = message,
	})
end)

exports("SendSystemSingle", function(source, message)
	TriggerClientEvent("chat:addMessage", source, {
		time = os.time(),
		type = "system",
		message = message,
	})
end)

exports("SendSystemBroadcast", function(message)
	TriggerClientEvent("chat:addMessage", -1, {
		time = os.time(),
		type = "broadcast",
		message = message,
	})
end)

exports("SendEmergency", function(source, message)
	local char = Strata.User.Find(source)
	TriggerEvent("EmergencyAlerts:Server:ServerDoPredefined", source, "call911", {
		details = string.format("%s | %s", char:GetData("SID"), char:GetData("Phone")),
		message = message,
	})

	for k, v in ipairs(GetPlayers()) do
		local duty = Player(v).state.onDuty

		if tonumber(v) == source or (duty == "police" or duty == "prison" or duty == "ems") then
			TriggerClientEvent("chat:addMessage", v, {
				time = os.time(),
				type = "911",
				message = message,
				author = {
					First = char:GetData("First"),
					Last = char:GetData("Last"),
					Phone = char:GetData("Phone"),
					SID = char:GetData("SID"),
				},
			})
		end
	end
end)

exports("SendEmergencyAnonymous", function(source, message)
	local char = Strata.User.Find(source)

	TriggerEvent("EmergencyAlerts:Server:ServerDoPredefined", source, "call911anon", {
		message = message,
	})
	for k, v in ipairs(GetPlayers()) do
		local duty = Player(v).state.onDuty
		if tonumber(v) == source or (duty == "police" or duty == "prison" or duty == "ems") then
			TriggerClientEvent("chat:addMessage", v, {
				time = os.time(),
				type = "911",
				message = message,
				author = {
					Anonymous = true,
				},
			})
		end
	end
end)

exports("SendEmergencyRespond", function(source, target, message)
	local char = Strata.User.Find(source)
	local tChar = Strata.User.Find(target)
	if tChar ~= nil then
		local name = string.format("%s %s", char:GetData("First"), char:GetData("Last"))
		local str = string.format("%s -> %s", name, tChar:GetData("SID"))

		for k, v in ipairs(GetPlayers()) do
			local duty = Player(v).state.onDuty
			if tonumber(v) == target or (duty == "police" or duty == "prison" or duty == "ems") then
				TriggerClientEvent("chat:addMessage", v, {
					time = os.time(),
					type = "911",
					message = message,
					author = {
						First = char:GetData("First"),
						Last = char:GetData("Last"),
						Phone = char:GetData("Phone"),
						SID = char:GetData("SID"),
						Reply = tChar:GetData("SID"),
					},
				})
			end
		end
	end
end)

exports("SendNonEmergency", function(source, message)
	local char = Strata.User.Find(source)
	if char ~= nil then
		TriggerEvent("EmergencyAlerts:Server:ServerDoPredefined", source, "call311", {
			details = string.format("%s | %s", char:GetData("SID"), char:GetData("Phone")),
			message = message,
		})

		local name = string.format("%s %s", char:GetData("First"), char:GetData("Last"))
		local str = string.format("(%s) %s | %s", char:GetData("SID"), name, char:GetData("Phone"))
		for k, v in ipairs(GetPlayers()) do
			local duty = Player(v).state.onDuty
			if tonumber(v) == source or (duty == "police" or duty == "ems" or duty == "prison") then
				TriggerClientEvent("chat:addMessage", v, {
					time = os.time(),
					type = "311",
					message = message,
					author = {
						First = char:GetData("First"),
						Last = char:GetData("Last"),
						Phone = char:GetData("Phone"),
						SID = char:GetData("SID"),
					},
				})
			end
		end
	end
end)

exports("SendNonEmergencyAnonymous", function(source, message)
	local char = Strata.User.Find(source)
	if char ~= nil then
		TriggerEvent("EmergencyAlerts:Server:ServerDoPredefined", source, "call311anon", {
			message = message,
		})
		for k, v in ipairs(GetPlayers()) do
			local duty = Player(v).state.onDuty
			if tonumber(v) == source or (duty == "police" or duty == "ems" or duty == "prison") then
				TriggerClientEvent("chat:addMessage", v, {
					time = os.time(),
					type = "311",
					message = message,
					author = {
						Anonymous = true,
					},
				})
			end
		end
	end
end)

exports("SendNonEmergencyRespond", function(source, target, message)
	local char = Strata.User.Find(source)
	local tChar = Strata.User.Find(target)
	if tChar ~= nil then
		local name = string.format("%s %s", char:GetData("First"), char:GetData("Last"))
		local str = string.format("%s -> %s", name, tChar:GetData("SID"))
		for k, v in ipairs(GetPlayers()) do
			local duty = Player(v).state.onDuty
			if tonumber(v) == target or (duty == "police" or duty == "ems" or duty == "prison") then
				TriggerClientEvent("chat:addMessage", v, {
					time = os.time(),
					type = "311",
					message = message,
					author = {
						First = char:GetData("First"),
						Last = char:GetData("Last"),
						Phone = char:GetData("Phone"),
						SID = char:GetData("SID"),
						Reply = tChar:GetData("SID"),
					},
				})
			end
		end
	end
end)

exports("SendDispatch411", function(message)
	for k, v in ipairs(GetPlayers()) do
		local duty = Player(v).state.onDuty
		if duty == "police" or duty == "prison" then
			TriggerClientEvent("chat:addMessage", v, {
				time = os.time(),
				type = "411",
				message = message,
			})
		end
	end
end)

exports("SendDispatchDOC", function(message)
	for k, v in ipairs(GetPlayers()) do
		local duty = Player(v).state.onDuty
		if duty == "prison" then
			TriggerClientEvent("chat:addMessage", v, {
				time = os.time(),
				type = "411A",
				message = message,
			})
		end
	end
end)

exports("SendDispatch", function(source, message)
	TriggerClientEvent("chat:addMessage", source, {
		time = os.time(),
		type = "dispatch",
		message = message,
	})
end)

exports("SendTestResult", function(source, message)
	TriggerClientEvent("chat:addMessage", source, {
		time = os.time(),
		type = "tests",
		message = message,
	})
end)

AddEventHandler("chatMessage", function(source, n, message)
	if starts_with(message, "/") then
		local command_args = stringsplit(message, " ")
		command_args[1] = string.gsub(command_args[1], "/", "")

		local commandName = command_args[1]
		if not commands[commandName] then
			-- print("Invalid Command: " .. commandName)
			--exports["st_chat"]:SendServerSingle(source, "Invalid Command: " .. commandName)
		end
	end
	CancelEvent()
end)

function stringsplit(inputstr, sep)
	if sep == nil then
		sep = "%s"
	end
	local t = {}
	i = 1
	for str in string.gmatch(inputstr, "([^" .. sep .. "]+)") do
		t[i] = str
		i = i + 1
	end
	return t
end

-- ─────────────────────────────────────────────────────────────────────────────
-- Callbacks
-- ─────────────────────────────────────────────────────────────────────────────

function RegisterCallbacks()
	Strata.Net.Listen("Commands:ValidateAdmin", function(source, data, cb)
		local player = Strata.User.Account(source)
		if player.Permissions:IsAdmin() then
			cb(true)
		else
			Strata.Log.Error("Commands",
				string.format("%s attempted to use an admin command but failed Admin Validation.",
					player:GetData("Identifier")
				),
				{ console = true, file = true, database = true, discord = { embed = true, type = "error" } }
			)
		end
	end)
end

RegisterNetEvent("Commands:Server:CaptureScreenshot", function(webhookId, callback)
	local source = source
	local webhookUrl = string.format("https://discord.com/api/webhooks/%s", webhookId)

	exports["st_utils"]:remoteUpload(
		source,
		webhookUrl,
		{ encoding = "webp", formField = "files[]" },
		function(data)
			local image = json.decode(data)
			callback(json.encode({ url = image.attachments[1].proxy_url }))
		end,
		"blob"
	)
end)

-- ─────────────────────────────────────────────────────────────────────────────
-- Chat commands
-- ─────────────────────────────────────────────────────────────────────────────

function RegisterChatCommands()
	exports["st_chat"]:RegisterCommand("clear", function(source, args, rawCommand)
		TriggerClientEvent("chat:clearChat", source)
	end, {
		help = "Clear The Chat",
	})

	exports["st_chat"]:RegisterCommand("ooc", function(source, args, rawCommand)
		if #rawCommand:sub(4) > 0 then
			exports["st_chat"]:SendOOC(source, rawCommand:sub(4))
		end
	end, {
		help = "Out of Character Chat, THIS IS NOT A SUPPORT CHAT",
		params = {
			{ name = "Message", help = "The Message You Want To Send To The OOC Channel" },
		},
	}, -1)

	exports["st_chat"]:RegisterCommand("dice", function(source, args, rawCommand)
		local weight = tonumber(args[1]) or 6
		local times  = tonumber(args[2]) or 1

		if weight > 1 and times > 0 then
			if weight > 100 then weight = 100 end
			if times  > 5   then times  = 5   end

			local str = ""
			for i = 1, times do
				str = str .. string.format("Dice Roll: %s/%s~n~", math.random(weight), weight)
			end

			TriggerClientEvent("Animations:Client:DiceRoll", source)
			Wait(1000)
			TriggerClientEvent("Chat:Client:ReceiveMe", -1, source, GetGameTimer(), str, true)
		else
			exports["st_chat"]:SendSystemSingle(source, "Invalid Arguments")
		end
	end, {
		help = "Roll a Dice",
		params = {
			{ name = "Weight", help = "What number does the dice go up to?" },
			{ name = "Times",  help = "How many times do you want to roll?"  },
		},
	}, -1)

	exports["st_chat"]:RegisterCommand("streamermode", function(source, args, rawCommand)
		TriggerClientEvent("Commands:Client:StreamerMode", source)
	end, {
		help = "Toggle Streamer Mode (Disables Any Music Playing)",
	})

	exports["st_chat"]:RegisterStaffCommand("screenshot", function(source, args, rawCommand)
		exports['st_utils']:Screenshot(tonumber(args[1]), "Requested With Command")
	end, {
		help = "Screenshot Specified Player",
		params = {
			{ name = "State ID", help = "State ID of the player to screenshot" },
		},
	}, 1)

	exports["st_chat"]:RegisterStaffCommand("checkradio", function(source, args, rawCommand)
		local char = Strata.User.BySID(tonumber(args[1]))
		if char ~= nil then
			local pState = Player(char:GetData("Source")).state
			exports["st_chat"]:SendSystemSingle(source,
				pState?.onRadio
					and string.format("Radio Frequency: %s", pState.onRadio)
					or "Not On Radio"
			)
		else
			exports["st_chat"]:SendSystemSingle(source, "Not Logged In")
		end
	end, {
		help = "Check Radio Channel Player Is On",
		params = {
			{ name = "State ID", help = "State ID to check" },
		},
	}, 1)

	exports["st_chat"]:RegisterStaffCommand("viewfreq", function(source, args, rawCommand)
		local str  = string.format("Players On Frequency %s:<br />", args[1])
		local plyrs = {}
		for k, v in ipairs(GetPlayers()) do
			local pState = Player(v).state
			if pState?.onRadio and pState.onRadio == args[1] then
				local char = Strata.User.Find(tonumber(v))
				if char ~= nil then
					table.insert(plyrs, string.format("%s %s (%s)",
						char:GetData("First"), char:GetData("Last"), char:GetData("SID")))
				end
			end
		end
		exports["st_chat"]:SendSystemSingle(source, str .. table.concat(plyrs, ", "))
	end, {
		help = "Prints All Players On Specified Frequency",
		params = {
			{ name = "Radio Frequency", help = "Frequency to check" },
		},
	}, 1)

	exports["st_chat"]:RegisterAdminCommand("printqueue", function(source, args, rawCommand)
		exports['strata']:WaitListPrintQueue(args[1])
	end, {
		help = "Prints Players In Specified Waitlist",
		params = {
			{ name = "ID", help = "ID of the Waitlist to print" },
		},
	}, 1)

	exports["st_chat"]:RegisterAdminCommand("debug", function(source, args, rawCommand)
		TriggerClientEvent("HUD:Client:Debug", source)
	end, {
		help = "Toggle debugger",
	})

	exports["st_chat"]:RegisterAdminCommand("dev", function(source, args, rawCommand)
		TriggerClientEvent("HUD:Client:DevMode", source)
	end, {
		help = "Toggle Dev Mode",
	})

	exports["st_chat"]:RegisterAdminCommand("server", function(source, args, rawCommand)
		exports["st_chat"]:SendServerAll(rawCommand:sub(8))
	end, {
		help = "Send Server Message To All Players",
		params = {
			{ name = "Message", help = "The Message You Want To Send To Server Channel" },
		},
	}, -1)

	exports["st_chat"]:RegisterAdminCommand("system", function(source, args, rawCommand)
		exports["st_chat"]:SendSystemAll(rawCommand:sub(8))
	end, {
		help = "Send System Message To All Players",
		params = {
			{ name = "Message", help = "The Message You Want To Send To System Channel" },
		},
	}, -1)

	exports["st_chat"]:RegisterAdminCommand("broadcast", function(source, args, rawCommand)
		local auth = Strata.User.Account(source)
		exports["st_chat"]:SendBroadcastAll(auth:GetData("Name"), rawCommand:sub(10))
	end, {
		help = "Make A Broadcast To All Players",
		params = {
			{ name = "Message", help = "The Message You Want To Broadcast" },
		},
	}, -1)

	exports["st_chat"]:RegisterAdminCommand("tpm", function(source, args, rawCommand)
		TriggerClientEvent("Commands:Client:TeleportToMarker", source)
	end, {
		help = "Teleport to Marker",
	})

	exports["st_chat"]:RegisterAdminCommand("tp", function(source, args, rawCommand)
		local coolArgs = stringsplit(rawCommand:sub(4):gsub(",", ""), " ")
		if tonumber(coolArgs[1]) ~= nil and tonumber(coolArgs[2]) ~= nil and tonumber(coolArgs[3]) ~= nil then
			SetEntityCoords(GetPlayerPed(source),
				tonumber(coolArgs[1]) + 0.0,
				tonumber(coolArgs[2]) + 0.0,
				tonumber(coolArgs[3]) + 0.0,
				0, 0, 0, false
			)
		else
			exports["st_chat"]:SendSystemSingle(source, "Not All Numbers")
		end
	end, {
		help = "Teleport To Given Coords",
		params = {
			{ name = "X", help = "X Coord" },
			{ name = "Y", help = "Y Coord" },
			{ name = "Z", help = "Z Coord" },
		},
	}, 3)

	exports["st_chat"]:RegisterAdminCommand("saveall", function(source, args, rawCommand)
		TriggerEvent("Core:Server:ForceAllSave")
	end, {
		help = "Drop all players and force any saves to prep for restart",
	}, 0)

	exports["st_chat"]:RegisterAdminCommand("forceunload", function(source, args, rawCommand)
		if tonumber(args[1]) then
			TriggerEvent("Core:Server:ForceUnload", tonumber(args[1]))
		else
			exports["st_chat"]:SendSystemSingle(source, "Invalid Argument")
		end
	end, {
		help = "Forcefully Unloads Target Source",
		params = {
			{ name = "State", help = "The State You Want To Force Unload" },
		},
	}, 1)

	exports["st_chat"]:RegisterAdminCommand("payphone", function(source, args, rawCommand)
		TriggerClientEvent("Execute:Client:Component", source, "Phone", "OpenLimited")
	end, {
		help = "Open Phone In Payphone Mode",
	}, 0)

	exports["st_chat"]:RegisterAdminCommand("addstate", function(source, args, rawCommand)
		local char = Strata.User.Find(source)
		if char ~= nil then
			local states = char:GetData("States") or {}
			for k, v in ipairs(states) do
				if v == args[1] then
					exports["st_chat"]:SendSystemSingle(source, "Already Have That State")
					return
				end
			end
			table.insert(states, args[1])
			char:SetData("States", states)
			exports["st_chat"]:SendSystemSingle(source, "State Added")
		else
			exports["st_chat"]:SendSystemSingle(source, "Not Logged In")
		end
	end, {
		help = "Add A State To Yourself",
		params = {
			{ name = "State", help = "The State You Want To Add" },
		},
	}, 1)

	exports["st_chat"]:RegisterAdminCommand("addstatetarget", function(source, args, rawCommand)
		local sid, state = tonumber(args[1]), args[2]
		local char = Strata.User.BySID(sid)
		if char ~= nil then
			local states = char:GetData("States") or {}
			for k, v in ipairs(states) do
				if v == state then
					exports["st_chat"]:SendSystemSingle(source, "Already Have That State")
					return
				end
			end
			table.insert(states, state)
			char:SetData("States", states)
			exports["st_chat"]:SendSystemSingle(source, "State Added")
		else
			exports["st_chat"]:SendSystemSingle(source, "Not Logged In")
		end
	end, {
		help = "Add A State To Target Player",
		params = {
			{ name = "Target State ID", help = "Target State ID To Add State To" },
			{ name = "State",           help = "The State You Want To Add"        },
		},
	}, 2)
end
