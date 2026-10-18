RegisterNUICallback("CloseAlerts", function(data, cb)
	cb("OK")
	exports['st_mdt']:EmergencyAlertsClose()
end)

RegisterNUICallback("ReceiveAlert", function(data, cb)
	if data and data.id then
		if data.panic then
			exports["st_sound"]:PlayDistance(15, "panic.ogg", 0.5)
		else
			exports["st_sound"]:PlayOne("alert_normal.ogg", 0.5)
		end

		if data.blip and type(data.blip) == "table" and data.location ~= nil then
			data.blip.id = string.format("emrg-%s", data.id)
			data.blip.title = string.format("%s", data.title)

			local eB = exports["strata"]:Add(data.blip.id, data.blip.title, data.location, data.blip.icon,
				data.blip.color,
				data.blip.size, 2, false, data.blip.flashing)
			SetBlipFlashes(eB, isPanic)
			table.insert(_alertBlips, {
				id = data.blip.id,
				time = GetCloudTimeAsInt() + data.blip.duration,
				blip = eB,
			})

			if isArea then
				local eAB = AddBlipForRadius(data.location.x, data.location.y, data.location.z, 100.0)
				SetBlipColour(eAB, data.blip.color)
				SetBlipAlpha(eAB, 90)
				table.insert(_alertBlips, {
					id = data.blip.id,
					time = GetCloudTimeAsInt() + data.blip.duration,
					blip = eAB,
				})
			end
		end
	end
	cb("OK")
end)

RegisterNUICallback("RemoveAlert", function(data, cb)
	if data and data.id then
		local id = string.format("emrg-%s", data.id)
		exports["strata"]:Remove(id)

		for k, v in ipairs(_alertBlips) do
			if v.id == id then
				RemoveBlip(v.blip)
			end
		end
	end

	cb("OK")
end)

RegisterNUICallback("AssignedToAlert", function(data, cb)
	exports['st_sound']:UISoundsPlayFrontEnd(-1, "Menu_Accept", "Phone_SoundSet_Default")
	cb("OK")
end)

RegisterNUICallback("RouteAlert", function(data, cb)
	cb("OK")
	if data.location then
		exports['st_sound']:UISoundsPlayFrontEnd(-1, "SELECT", "HUD_FRONTEND_DEFAULT_SOUNDSET")
		exports['st_mdt']:EmergencyAlertsClose()

		if data.blip then
			local f = false
			for k, v in ipairs(_alertBlips) do
				if v.id == string.format("emrg-%s", data.id) then
					v.time = GetCloudTimeAsInt() + data.blip.duration
					f = true
					break
				end
			end

			if not f then
				local eB = exports["strata"]:Add(
					string.format("emrg-%s", data.id),
					data.title,
					data.location,
					data.blip.icon,
					data.blip.color,
					data.blip.size,
					2
				)
				table.insert(_alertBlips, {
					id = string.format("emrg-%s", data.id),
					time = GetCloudTimeAsInt() + data.blip.duration,
					blip = eB,
				})
				SetBlipFlashes(eB, data.panic)
			end
		end

		ClearGpsPlayerWaypoint()
		SetNewWaypoint(data.location.x, data.location.y)
		exports["st_ui"]:Notification("info", "Alert Location Marked")
	end
end)

RegisterNUICallback("ViewCamera", function(data, cb)
	cb('OK')
	if data.camera then
		exports['st_sound']:UISoundsPlayFrontEnd(-1, "SELECT", "HUD_FRONTEND_DEFAULT_SOUNDSET")
		exports['st_mdt']:EmergencyAlertsClose()
		exports["strata"]:ServerCallback("CCTV:ViewGroup", data.camera)
	end
end)

RegisterNUICallback("SwapToRadio", function(data, cb)
	cb("OK")
	exports['st_sound']:UISoundsPlayFrontEnd(-1, "SELECT", "HUD_FRONTEND_DEFAULT_SOUNDSET")
	TriggerEvent("Radio:Client:SetChannelFromInput", data.radio)
end)
