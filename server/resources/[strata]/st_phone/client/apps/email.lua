RegisterNetEvent("Phone:Client:Email:Receive", function(email)
	SendNUIMessage({
		type = "ADD_DATA",
		data = {
			type = "emails",
			data = email,
		},
	})
	Wait(1e3)
	exports['st_phone']:NotificationAdd(email.sender, email.subject, email.time, 6000, "email", {
		view = "view/" .. email.id,
	}, nil)
end)

RegisterNetEvent("Phone:Client:Email:Delete", function(email)
	SendNUIMessage({
		type = "REMOVE_DATA",
		data = {
			type = "emails",
			id = email,
		},
	})
end)

RegisterNUICallback("ReadEmail", function(data, cb)
	cb("OK")
	exports["strata"]:ServerCallback("Phone:Email:Read", data, function() end)
end)

RegisterNUICallback("DeleteEmail", function(data, cb)
	cb("OK")
	exports["strata"]:ServerCallback("Phone:Email:Delete", data, function(res)
		cb(res)
	end)
end)

RegisterNUICallback("GPSRoute", function(data, cb)
	cb("OK")
	SetNewWaypoint(data.location.x, data.location.y)
end)

RegisterNUICallback("Hyperlink", function(data, cb)
	cb("OK")
	TriggerServerEvent(data.hyperlink.event, data.hyperlink.data, data.id)
end)
