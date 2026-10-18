local _uircd = {}

AddEventHandler('onResourceStart', function(resource)
	if resource == GetCurrentResourceName() then
		Wait(1000)
		RegisterItems()
		RegisterChatCommands()
		exports['strata']:MiddlewareAdd("Characters:Creating", function(source, cData)
			return {
				{
					HUDConfig = {
						layout = "default",
						statusType = "numbers",
						buffsAnchor = "compass",
						vehicle = "default",
						buffsAnchor2 = true,
						showRPM = true,
						hideCrossStreet = false,
						hideCompassBg = false,
						minimapAnchor = true,
						transparentBg = true,
					},
				},
			}
		end)
		exports['strata']:MiddlewareAdd("Characters:Spawning", function(source)
			local char = Strata.User.Find(source)
			local config = char:GetData("HUDConfig")
			if not config then
				char:SetData("HUDConfig", {
					layout = "default",
					statusType = "numbers",
					buffsAnchor = "compass",
					vehicle = "default",
					buffsAnchor2 = true,
					showRPM = true,
					hideCrossStreet = false,
					hideCompassBg = false,
					minimapAnchor = true,
					transparentBg = true,
				})
			end
		end, 1)

		exports["strata"]:RegisterServerCallback("HUD:SaveConfig", function(source, data, cb)
			local char = Strata.User.Find(source)
			if char ~= nil then
				char:SetData("HUDConfig", data)
				cb(true)
			else
				cb(false)
			end
		end)

		exports["strata"]:RegisterServerCallback("HUD:RemoveBlindfold", function(source, data, cb)
			local char = Strata.User.Find(source)
			if char ~= nil then
				local tarState = Player(data).state
				if tarState.isBlindfolded then
					exports["strata"]:ClientCallback(source, "HUD:PutOnBlindfold", "Removing Blindfold",
						function(isSuccess)
							if isSuccess then
								if exports.st_inventory:AddItem(char:GetData("SID"), "blindfold", 1, {}, 1) then
									tarState.isBlindfolded = false
									TriggerClientEvent("VOIP:Client:Gag:Use", data)
								else
									exports['st_ui']:Notification(source, "error",
										"Failed Adding Item")
									cb(false)
								end
							end
						end)
				else
					exports['st_ui']:Notification(source, "error", "Target Not Blindfolded")
					cb(false)
				end
			else
				cb(false)
			end
		end)
	end
end)

function RegisterItems()
	exports.st_inventory:RegisterUse("blindfold", "HUD", function(source, item, itemData)
		exports["strata"]:ClientCallback(source, "HUD:GetTargetInfront", {}, function(target)
			if target ~= nil then
				local tarState = Player(target).state
				if not tarState.isBlindfolded then
					exports["strata"]:ClientCallback(source, "HUD:PutOnBlindfold", "Blindfolding",
						function(isSuccess)
							if isSuccess then
								if tarState.isCuffed then
									if exports.st_inventory:RemoveSlot(item.Owner, item.Name, 1, item.Slot, 1) then
										tarState.isBlindfolded = true
										TriggerClientEvent("VOIP:Client:Gag:Use", target)
									else
										exports['st_ui']:Notification(source, "error",
											"Failed Removing Item")
									end
								else
									exports['st_ui']:Notification(source, "error",
										"Target Not Cuffed")
								end
							end
						end)
				else
					exports['st_ui']:Notification(source, "error",
						"Target Already Blindfolded")
				end
			else
				exports['st_ui']:Notification(source, "error", "Nobody Near To Blindfold")
			end
		end)
	end)
end

RegisterNetEvent('st_inventory:ready', function()
	if GetResourceState(GetCurrentResourceName()) == 'started' then
		RegisterItems()
	end
end)

function RegisterChatCommands()
	exports["st_chat"]:RegisterCommand("uir", function(source, args, rawCommand)
		if not _uircd[source] or os.time() > _uircd[source] then
			TriggerClientEvent("UI:Client:Reset", source, true)
			_uircd[source] = os.time() + (60 * 5)
		else
			exports["st_chat"]:SendSystemSingle(source, "You're Trying To Do This Too Much, Stop.")
		end
	end, {
		help = "Resets UI",
	})

	exports["st_chat"]:RegisterCommand("hud", function(source, args, rawCommand)
		TriggerClientEvent("UI:Client:Configure", source, true)
	end, {
		help = "Open HUD Config Menu",
	})

	exports["st_chat"]:RegisterAdminCommand("testblindfold", function(source, args, rawCommand)
		local char = Strata.User.Find(source)
		if char ~= nil then
			Player(source).state.isBlindfolded = not Player(source).state.isBlindfolded
		end
	end, {
		help = "Test Blindfold",
	})

	-- exports["st_chat"]:RegisterAdminCommand("notif", function(source, args, rawCommand)
	-- 	exports['st_ui']:Notification(source, "success", "This is a test, lul")
	-- end, {
	-- 	help = "Test Notification",
	-- })

	-- exports["st_chat"]:RegisterAdminCommand("list", function(source, args, rawCommand)
	-- 	TriggerClientEvent("ListMenu:Client:Test", source)
	-- end, {
	-- 	help = "Test List Menu",
	-- })

	-- exports["st_chat"]:RegisterAdminCommand("input", function(source, args, rawCommand)
	-- 	TriggerClientEvent("Input:Client:Test", source)
	-- end, {
	-- 	help = "Test Input",
	-- })

	-- exports["st_chat"]:RegisterAdminCommand("confirm", function(source, args, rawCommand)
	-- 	TriggerClientEvent("Confirm:Client:Test", source)
	-- end, {
	-- 	help = "Test Confirm Dialog",
	-- })

	-- exports["st_chat"]:RegisterAdminCommand("skill", function(source, args, rawCommand)
	-- 	TriggerClientEvent("Minigame:Client:Skillbar", source)
	-- end, {
	-- 	help = "Test Skill Bar",
	-- })

	-- exports["st_chat"]:RegisterAdminCommand("scan", function(source, args, rawCommand)
	-- 	TriggerClientEvent("Minigame:Client:Scanner", source)
	-- end, {
	-- 	help = "Test Scanner",
	-- })

	-- exports["st_chat"]:RegisterAdminCommand("sequencer", function(source, args, rawCommand)
	-- 	TriggerClientEvent("Minigame:Client:Sequencer", source)
	-- end, {
	-- 	help = "Test Sequencer",
	-- })

	-- exports["st_chat"]:RegisterAdminCommand("keypad", function(source, args, rawCommand)
	-- 	TriggerClientEvent("Minigame:Client:Keypad", source)
	-- end, {
	-- 	help = "Test Keypad",
	-- })

	-- exports["st_chat"]:RegisterAdminCommand("scrambler", function(source, args, rawCommand)
	-- 	TriggerClientEvent("Minigame:Client:Scrambler", source)
	-- end, {
	-- 	help = "Test Scrambler",
	-- })

	-- exports["st_chat"]:RegisterAdminCommand("memory", function(source, args, rawCommand)
	-- 	TriggerClientEvent("Minigame:Client:Memory", source)
	-- end, {
	-- 	help = "Test Memory",
	-- })
end
