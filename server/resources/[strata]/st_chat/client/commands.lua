AddEventHandler('onClientResourceStart', function(resource)
	if resource == GetCurrentResourceName() then
		Wait(1000)
		Strata.Net.Listen("Commands:SS", function(d, cb)
			TriggerServerEvent("Commands:Server:CaptureScreenshot", d, cb)
		end)
	end
end)

RegisterNetEvent("Commands:Client:TeleportToMarker", function()
	local WaypointHandle = GetFirstBlipInfoId(8)
	if DoesBlipExist(WaypointHandle) then
		local waypointCoords = GetBlipInfoIdCoord(WaypointHandle)
		for height = 1, 1000 do
			SetPedCoordsKeepVehicle(PlayerPedId(), waypointCoords["x"], waypointCoords["y"], height + 0.0)

			local foundGround, zPos = GetGroundZFor_3dCoord(waypointCoords["x"], waypointCoords["y"], height + 0.0)

			if foundGround then
				SetPedCoordsKeepVehicle(PlayerPedId(), waypointCoords["x"], waypointCoords["y"], height + 0.0)
				break
			end

			Wait(5)
		end
		exports["st_ui"]:Notification("success", "Teleported")
	else
		exports["st_ui"]:Notification("error", "Please place your waypoint.")
	end
end)
