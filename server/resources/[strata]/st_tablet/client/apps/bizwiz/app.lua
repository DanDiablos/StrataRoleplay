RegisterNetEvent("Tablet:Client:BizWiz:Login", function(logo, links, notices)
	exports['st_tablet']:SetData("businessLogo", logo)
	exports['st_tablet']:SetData("businessPages", links)
	exports['st_tablet']:SetData("businessNotices", notices)
end)

RegisterNetEvent("Tablet:Client:BizWiz:Logout", function()
	exports['st_tablet']:SetData("businessLogo", nil)
	exports['st_tablet']:SetData("businessPages", nil)
	exports['st_tablet']:SetData("businessNotices", nil)
end)


-- Documents

RegisterNUICallback("BusinessDocumentSearch", function(data, cb)
	exports["strata"]:ServerCallback("Tablet:BizWiz:Document:Search", data, cb)
end)

RegisterNUICallback("BusinessDocumentCreate", function(data, cb)
	exports["strata"]:ServerCallback("Tablet:BizWiz:Document:Create", data, cb)
end)

RegisterNUICallback("BusinessDocumentUpdate", function(data, cb)
	exports["strata"]:ServerCallback("Tablet:BizWiz:Document:Update", data, cb)
end)

RegisterNUICallback("BusinessDocumentView", function(data, cb)
	exports["strata"]:ServerCallback("Tablet:BizWiz:Document:View", data.id, cb)
end)

RegisterNUICallback("BusinessDocumentDelete", function(data, cb)
	exports["strata"]:ServerCallback("Tablet:BizWiz:Document:Delete", data.id, cb)
end)

-- Receipts

RegisterNUICallback("BusinessReceiptSearch", function(data, cb)
	exports["strata"]:ServerCallback("Tablet:BizWiz:Receipt:Search", data, cb)
end)

RegisterNUICallback("BusinessReceiptCreate", function(data, cb)
	exports["strata"]:ServerCallback("Tablet:BizWiz:Receipt:Create", data, cb)
end)

RegisterNUICallback("BusinessReceiptUpdate", function(data, cb)
	exports["strata"]:ServerCallback("Tablet:BizWiz:Receipt:Update", data, cb)
end)

RegisterNUICallback("BusinessReceiptView", function(data, cb)
	exports["strata"]:ServerCallback("Tablet:BizWiz:Receipt:View", data.id, cb)
end)

RegisterNUICallback("BusinessReceiptDelete", function(data, cb)
	exports["strata"]:ServerCallback("Tablet:BizWiz:Receipt:Delete", data.id, cb)
end)

RegisterNUICallback("BusinessReceiptDeleteAll", function(data, cb)
	exports["strata"]:ServerCallback("Tablet:BizWiz:Receipt:DeleteAll", {}, cb)
end)

-- Notices

RegisterNUICallback("CreateBusinessNotice", function(data, cb)
	exports["strata"]:ServerCallback("Tablet:BizWiz:Notice:Create", data, cb)
end)

RegisterNUICallback("DeleteBusinessNotice", function(data, cb)
	exports["strata"]:ServerCallback("Tablet:BizWiz:Notice:Delete", data, cb)
end)

RegisterNUICallback("BizWizEmployeeSearch", function(data, cb)
	exports["strata"]:ServerCallback("Tablet:BizWiz:EmployeeSearch", data, cb)
end)

RegisterNUICallback("SetBusinessTwitter", function(data, cb)
	exports["strata"]:ServerCallback("Tablet:BizWiz:SetTwitterProfile", data, cb)
end)

RegisterNUICallback("GetBusinessTwitter", function(data, cb)
	exports["strata"]:ServerCallback("Tablet:BizWiz:GetTwitterProfile", data, cb)
end)

RegisterNUICallback("SendBusinessTweet", function(data, cb)
	exports["strata"]:ServerCallback("Tablet:BizWiz:SendTweet", data, cb)
end)

RegisterNUICallback("ViewVehicleFleet", function(data, cb)
	exports["strata"]:ServerCallback("Tablet:BizWiz:ViewVehicleFleet", data, cb)
end)

RegisterNUICallback("TrackFleetVehicle", function(data, cb)
	exports["strata"]:ServerCallback("Tablet:BizWiz:TrackFleetVehicle", data, function(data)
		if data then
			DeleteWaypoint()
			SetNewWaypoint(data.x, data.y)
			cb(true)
		else
			cb(false)
		end
	end)
end)
