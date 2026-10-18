local _timeout = false

AddEventHandler('onClientResourceStart', function(resource)
	if resource == GetCurrentResourceName() then
		Wait(1000)
		exports["st_binds"]:Add("escort", "k", "keyboard", "Escort", function()
			if _timeout then
				--exports["st_ui"]:Notification("error", "Stop spamming you pepega.")
				return
			end
			_timeout = true
			DoEscort()
			SetTimeout(1000, function()
				_timeout = false
			end)
		end)

		exports["strata"]:RegisterClientCallback("Escort:StopEscort", function(data, cb)
			DetachEntity(LocalPlayer.state.ped, true, true)
			cb(true)
		end)
	end
end)

exports("DoEscort", function(target, tPlayer)
	if target ~= nil then
		if LocalPlayer.state.AllowEscorting == false then
			exports["st_ui"]:Notification("error", "Unable to escort in this location.")
			return
		end
		exports["strata"]:ServerCallback("Escort:DoEscort", {
			target = target,
			inVeh = IsPedInAnyVehicle(GetPlayerPed(tPlayer)),
			isSwimming = IsPedSwimming(LocalPlayer.state.ped),
		}, function(state)
			if state then
				StartEscortThread(tPlayer)
			end
		end)
	end
end)

exports("StopEscort", function()
	exports["strata"]:ServerCallback("Escort:StopEscort", function() end)
end)

AddEventHandler("Interiors:Exit", function()
	if LocalPlayer.state.isEscorting ~= nil then
		exports['st_utils']:EscortStopEscort()
	end
end)

--[[ TODO
Add Dragging When Dead
Place In vehicle while Dead Slump Animation
Police Drag Maybe Cuff Also
Get In Trunk or Place in trunk???
]]
