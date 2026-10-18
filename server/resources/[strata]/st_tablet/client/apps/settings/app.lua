RegisterNUICallback("UpdateSetting", function(data, cb)
	cb("OK")
	_settings[data.type] = data.val
	exports["strata"]:ServerCallback("Tablet:Settings:Update", data)
end)
