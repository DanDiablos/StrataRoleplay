RegisterNetEvent("Phone:Client:SetData", function(type, data, options)
	exports['st_phone']:DataSet(type, data)
end)

RegisterNetEvent("Phone:Client:SetDataMulti", function(data)
	for k, v in ipairs(data) do
		exports['st_phone']:DataSet(v.type, v.data)
	end
end)

RegisterNetEvent("Phone:Client:AddData", function(type, data, id)
	exports['st_phone']:DataAdd(type, data, id)
end)

RegisterNetEvent("Phone:Client:UpdateData", function(type, id, data)
	exports['st_phone']:DataUpdate(type, id, data)
end)

RegisterNetEvent("Phone:Client:RemoveData", function(type, id)
	exports['st_phone']:DataRemove(type, id)
end)

RegisterNetEvent("Phone:Client:ResetData", function()
	exports['st_phone']:DataReset()
end)

RegisterNetEvent("Characters:Client:Logout", function()
	SendNUIMessage({ type = "PHONE_NOT_VISIBLE" })
	exports['st_phone']:DataReset()
	exports['st_phone']:NotificationReset()
	exports['st_phone']:ResetRoute()
end)
