_licenses = {
	drivers = { key = "Drivers", price = 1000 },
	weapons = { key = "Weapons", price = 2000 },
	hunting = { key = "Hunting", price = 800 },
	fishing = { key = "Fishing", price = 800 },
}

AddEventHandler('onResourceStart', function(resource)
	if resource == GetCurrentResourceName() then
		Wait(1000)
		exports["strata"]:RegisterServerCallback("Government:BuyID", function(source, data, cb)
			local char = Strata.User.Find(source)
			if exports['st_finance']:WalletModify(source, -500) then
				exports.st_inventory:AddItem(char:GetData("SID"), "govid", 1, {}, 1)
			else
				exports['st_ui']:Notification(source, "error", "Not Enough Cash")
			end
		end)

		exports["strata"]:RegisterServerCallback("Government:BuyLicense", function(source, data, cb)
			if _licenses[data] ~= nil then
				local char = Strata.User.Find(source)
				local licenses = char:GetData("Licenses")
				if exports['st_finance']:WalletModify(source, -_licenses[data].price) then
					if licenses[_licenses[data].key] ~= nil and not licenses[_licenses[data].key].Active then
						licenses[_licenses[data].key].Active = true
						char:SetData("Licenses", licenses)

						exports['strata']:MiddlewareTriggerEvent("Characters:ForceStore", source)
					else
						exports['st_ui']:Notification(source, "error",
							"Unable To Purchase License")
					end
				else
					exports['st_ui']:Notification(source, "error", "Not Enough Cash")
				end
			else
				Strata.Log.Error(
					"Government",
					string.format("%s Tried To Buy Invalid License Type %s", char:GetData("SID"), data),
					{
						console = true,
						discord = true,
					}
				)
				exports['st_ui']:Notification(source, "error", "Unable To Purchase License")
			end
		end)

		exports["strata"]:RegisterServerCallback("Government:Client:DoWeaponsLicenseBuyPolice",
			function(source, data, cb)
				local char = Strata.User.Find(source)
				if exports['st_jobs']:HasJob(source, "police") and char then
					local licenses = char:GetData("Licenses")
					if exports['st_finance']:WalletModify(source, -20) then
						licenses["Weapons"].Active = true
						char:SetData("Licenses", licenses)
						exports['strata']:MiddlewareTriggerEvent("Characters:ForceStore", source)
					else
						exports['st_ui']:Notification(source, "error", "Not Enough Cash")
					end
				else
					exports['st_ui']:Notification(source, "error", "You are Not PD")
				end
			end)
	end
end)

RegisterNetEvent("Government:Server:Gavel", function()
	TriggerClientEvent("Government:Client:Gavel", -1)
end)
