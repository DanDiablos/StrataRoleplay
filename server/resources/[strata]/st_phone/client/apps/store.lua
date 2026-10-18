RegisterNUICallback("Install", function(data, cb)
	if data.check then
		exports["strata"]:ServerCallback("Phone:Store:Install:Check", data.app, cb, data.app)
	else
		exports["strata"]:ServerCallback("Phone:Store:Install:Do", data.app, function(status, app, time)
			if status then
				exports['st_phone']:NotificationAdd("App Installed", nil, time, 6000, data.app, {
					view = "",
				}, nil)
			end
			cb(status)
		end, data.app)
	end
end)
RegisterNUICallback("Uninstall", function(data, cb)
	if data.check then
		exports["strata"]:ServerCallback("Phone:Store:Uninstall:Check", data.app, cb, data.app)
	else
		exports["strata"]:ServerCallback("Phone:Store:Uninstall:Do", data.app, cb, data.app)
	end
end)
