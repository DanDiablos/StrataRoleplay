RegisterNUICallback("UpdateSetting", function(data, cb)
	cb("OK")
	_settings[data.type] = data.val
	exports["strata"]:ServerCallback("Phone:Settings:Update", data, function() end)
end)

local testingSound = nil
RegisterNUICallback("TestSound", function(data, cb)
	cb("OK")

	if testingSound ~= nil then
		exports["st_sound"]:StopOne(testingSound)
		testingSound = nil
	end

	testingSound = data.val
	exports["st_sound"]:PlayOne(data.val, 0.1 * (_settings.volume / 100))
end)
