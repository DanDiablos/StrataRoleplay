RegisterNetEvent("MDT:Client:SetData")
AddEventHandler("MDT:Client:SetData", function(type, data, options)
	exports['st_mdt']:DataSet(type, data)
end)

RegisterNetEvent("MDT:Client:SetMultipleData", function(data)
	if data then
		for k, v in pairs(data) do
			exports['st_mdt']:DataSet(k, v)
		end
	end
end)

RegisterNetEvent("MDT:Client:AddData")
AddEventHandler("MDT:Client:AddData", function(type, data, id)
	exports['st_mdt']:DataAdd(type, data, id)
end)

RegisterNetEvent("MDT:Client:UpdateData")
AddEventHandler("MDT:Client:UpdateData", function(type, id, data)
	exports['st_mdt']:DataUpdate(type, id, data)
end)

RegisterNetEvent("MDT:Client:RemoveData")
AddEventHandler("MDT:Client:RemoveData", function(type, id)
	exports['st_mdt']:DataRemove(type, id)
end)

RegisterNetEvent("MDT:Client:ResetData")
AddEventHandler("MDT:Client:ResetData", function()
	exports['st_phone']:DataReset()
end)

RegisterNetEvent("Characters:Client:Logout")
AddEventHandler("Characters:Client:Logout", function()
	exports['st_mdt']:DataReset()
end)
