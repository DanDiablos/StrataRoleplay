RegisterNUICallback("Services:GetServices", function(data, cb)
	exports["strata"]:ServerCallback("Phone:Services:GetServices", data, function(servicesData)
		cb(servicesData)
	end)
end)

RegisterNUICallback("Services:SetGPS", function(data, cb)
	if data.location then
		DeleteWaypoint()
		SetNewWaypoint(data.location.x, data.location.y)
		exports["st_ui"]:Notification("success", "GPS route set")
		cb("OK")
	else
		cb(false)
		exports["st_ui"]:Notification("error", "Error setting waypoint.")
	end
end)
