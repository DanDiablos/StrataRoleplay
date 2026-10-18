local boatModels = {
	police = `predator`,
	ems = `dinghy3`,
}

local boatCooldowns = {}

RegisterNetEvent("Vehicles:Server:RequestEmergencyBoat", function(parkingSpace)
	local src = source
	local char = Strata.User.Find(src)
	local onDuty = Player(src).state.onDuty
	if
		char
		and (onDuty == "police" or onDuty == "ems")
		and (not boatCooldowns[onDuty] or boatCooldowns[onDuty] <= os.time())
	then
		exports['st_veh']:SpawnTemp(
			source,
			boatModels[onDuty] or `predator`,
			"boat",
			parkingSpace.xyz,
			parkingSpace.w,
			function(veh, VIN)
				exports['st_veh']:KeysAdd(src, VIN)

				Entity(veh).state.GroupKeys = onDuty
				Entity(veh).state.EmergencyBoat = true

				boatCooldowns[onDuty] = os.time() + (60 * 0.25) -- Will do for now
			end
		)
	else
		exports['st_ui']:Notification(source, "error", "On Cooldown")
	end
end)

RegisterNetEvent("Vehicles:Server:DeleteEmergencyBoat", function(vNet)
	local src = source
	local char = Strata.User.Find(src)
	local onDuty = Player(src).state.onDuty
	if char and (onDuty == "police" or onDuty == "ems") then
		local veh = NetworkGetEntityFromNetworkId(vNet)
		if veh and DoesEntityExist(veh) and Entity(veh).state.EmergencyBoat then
			exports['st_veh']:Delete(veh, function() end)

			boatCooldowns[onDuty] = false
		end
	end
end)
