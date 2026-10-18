RegisterNetEvent("Tablet:Client:SetData", function(type, data, options)
	exports['st_tablet']:SetData(type, data)
end)

RegisterNetEvent("Tablet:Client:AddData", function(type, data, id)
	exports['st_tablet']:AddData(type, data, id)
end)

RegisterNetEvent("Tablet:Client:UpdateData", function(type, id, data)
	exports['st_tablet']:UpdateData(type, id, data)
end)

RegisterNetEvent("Tablet:Client:RemoveData", function(type, id)
	exports['st_tablet']:RemoveData(type, id)
end)

RegisterNetEvent("Tablet:Client:ResetData", function()
	exports['st_tablet']:ResetData()
end)

RegisterNetEvent("Characters:Client:Logout", function()
	SendNUIMessage({ type = "LAPTOP_NOT_VISIBLE" })
	exports['st_tablet']:ResetData()
	exports['st_tablet']:ResetNotifications()
	exports['st_tablet']:ResetRoute()
	SendNUIMessage({ type = "CLOSE_ALL_APPS" })
end)
