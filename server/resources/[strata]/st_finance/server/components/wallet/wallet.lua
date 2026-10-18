AddEventHandler("Finance:Server:Startup", function()
	exports["strata"]:RegisterServerCallback("Wallet:GetCash", function(source, data, cb)
		cb(exports['st_finance']:WalletGet(source))
	end)

	exports["strata"]:RegisterServerCallback("Wallet:GiveCash", function(source, data, cb)
		local char = Strata.User.Find(source)
		local targetChar = Strata.User.BySID(data.target)

		if char ~= nil and targetChar ~= nil then
			local playerCoords = GetEntityCoords(GetPlayerPed(source))
			local targetCoords = GetEntityCoords(GetPlayerPed(targetChar:GetData("Source")))

			if #(playerCoords - targetCoords) <= 5.0 then
				local amount = math.tointeger(data.amount)
				if amount and amount > 0 then
					if exports['st_finance']:WalletModify(source, -amount, true) then
						if exports['st_finance']:WalletModify(targetChar:GetData("Source"), amount, true) then
							TriggerClientEvent('Finance:Client:HandOffCash', source)
							exports['st_ui']:Notification(source, "success",
								"You Gave $" .. formatNumberToCurrency(amount) .. " in Cash"
							)
							exports['st_ui']:Notification("success", targetChar:GetData("Source"),
								"You Just Received $" .. formatNumberToCurrency(amount) .. " in Cash"
							)
							return
						else
							return exports["st_chat"]:SendSystemSingle(source, "Error")
						end
					else
						return exports["st_chat"]:SendSystemSingle(source, "Not Enough Cash")
					end
				else
					return exports["st_chat"]:SendSystemSingle(source, "Invalid Amount")
				end
			else
				return exports["st_chat"]:SendSystemSingle(source, "Target Not Nearby")
			end
		else
			cb(false)
		end
	end)

	exports["st_chat"]:RegisterCommand("cash", function(source, args, rawCommand)
		ShowCash(source)
	end, {
		help = "Show Current Cash",
	})

	exports["st_chat"]:RegisterAdminCommand("addcash", function(source, args, rawCommand)
		exports.st_inventory:addCash(source, tonumber(args[1]))
	end, {
		help = "Give Cash To Yourself",
		params = {
			{
				name = "Amount",
				help = "Amount of cash to give",
			},
		},
	}, 1)

	exports["st_chat"]:RegisterCommand("givecash", function(source, args, rawCommand)
		local target = tonumber(args[1])
		if target and target > 0 then
			local char = Strata.User.Find(source)
			local targetChar = Strata.User.BySID(target)

			if char and targetChar and targetChar:GetData("Source") ~= char:GetData("Source") then
				local playerCoords = GetEntityCoords(GetPlayerPed(source))
				local targetCoords = GetEntityCoords(GetPlayerPed(targetChar:GetData("Source")))

				if #(playerCoords - targetCoords) <= 5.0 then
					local amount = math.tointeger(args[2])
					if amount and amount > 0 then
						if exports['st_finance']:WalletModify(source, -amount, true) then
							if exports['st_finance']:WalletModify(targetChar:GetData("Source"), amount, true) then
								TriggerClientEvent('Finance:Client:HandOffCash', source)
								exports['st_ui']:Notification(source, "success",
									"You Gave $" .. formatNumberToCurrency(amount) .. " in Cash"
								)
								exports['st_ui']:Notification("success", targetChar:GetData("Source"),
									"You Just Received $" .. formatNumberToCurrency(amount) .. " in Cash"
								)
								return
							else
								return exports["st_chat"]:SendSystemSingle(source, "Error")
							end
						else
							return exports["st_chat"]:SendSystemSingle(source, "Not Enough Cash")
						end
					else
						return exports["st_chat"]:SendSystemSingle(source, "Invalid Amount")
					end
				else
					return exports["st_chat"]:SendSystemSingle(source, "Target Not Nearby")
				end
			end
		end
		exports["st_chat"]:SendSystemSingle(source, "Invalid State ID")
	end, {
		help = "Give Your Cash to a Person",
		params = {
			{
				name = "State ID",
				help = "The person you want to give the cash to has to be nearby",
			},
			{
				name = "Amount",
				help = "The amount of money to give",
			},
		},
	}, 2)
end)

function ShowCash(source)
	exports['st_ui']:Notification(source, "success",
		"You have $" .. formatNumberToCurrency(exports['st_finance']:WalletGet(source)),
		2500,
		"money-bill-wave"
	)
end

RegisterServerEvent("Wallet:ShowCash", function()
	local source = source
	ShowCash(source)
end)
