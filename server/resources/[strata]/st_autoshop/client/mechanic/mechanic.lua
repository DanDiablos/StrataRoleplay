_repairingVehicle = false

AddEventHandler('onClientResourceStart', function(resource)
	if resource == GetCurrentResourceName() then
		Wait(1000)
		CreateMechanicZones()
		CreateMechanicDutyPoints()

		exports["strata"]:RegisterClientCallback("Mechanic:StartInstall", function(data, cb)
			local part = data.part
			local quantity = data.quantity
			if part and quantity and LocalPlayer.state.loggedIn and not _repairingVehicle and type(quantity) == "number" and quantity > 0 then
				local duty = LocalPlayer.state.onDuty
				if duty and _mechanicJobs[duty] then
					local installingPartData = _mechanicItemsToParts[part]
					local playerCoords = GetEntityCoords(PlayerPedId())
					local maxDistance = 5.0
					local includePlayerVehicle = false

					local vehicle = lib.getClosestVehicle(playerCoords, maxDistance, includePlayerVehicle)
					if
						installingPartData
						and vehicle
						and DoesEntityExist(vehicle)
						and IsEntityAVehicle(vehicle)
						and (
							(#(GetEntityCoords(vehicle) - LocalPlayer.state.myPos) <= 5.0)
							or exports['st_veh']:UtilsIsCloseToRearOfVehicle(vehicle)
							or exports['st_veh']:UtilsIsCloseToFrontOfVehicle(vehicle)
						)
					then
						local vehEnt = Entity(vehicle)
						local vehClass = vehEnt.state.Class
						local vehDamage = vehEnt.state.DamagedParts

						if not vehDamage or vehDamage[installingPartData.part] >= 99 then
							exports["st_ui"]:Notification("error", "Vehicle Part Doesn't Need Repairing")
							return cb(false)
						end

						local requiresHighGradeParts = false
						if vehClass then
							requiresHighGradeParts = _highPerformanceClasses[vehClass]
						end

						if
							(not requiresHighGradeParts and installingPartData.regular)
							or (requiresHighGradeParts and installingPartData.hperformance)
						then
							if GetIsVehicleEngineRunning(vehicle) then
								exports["st_ui"]:Notification("error", "Turn Off the Engine")
								return cb(false)
							end

							if IsPedInAnyVehicle(LocalPlayer.state.ped, false) then
								exports["st_ui"]:Notification("error", "Can't Repair Whilst in a Vehicle")
								return cb(false)
							end

							TaskTurnPedToFaceEntity(LocalPlayer.state.ped, vehicle, 1.0)
							Wait(750)

							local repairLength = (installingPartData.time or 15) * quantity

							exports['st_ui']:ProgressWithStartAndTick({
								name = "veh_mech_repair",
								duration = repairLength * 1000,
								label = "Repairing Vehicle",
								canCancel = true,
								tickrate = 1000,
								controlDisables = {
									disableMovement = true,
									disableCarMovement = true,
									disableMouse = false,
									disableCombat = true,
								},
								animation = {
									anim = installingPartData.anim or "mechanic",
								},
								disarm = true,
							}, function()
								_repairingVehicle = true
							end, function()
								if
									not DoesEntityExist(vehicle)
									or not (
										exports['st_veh']:UtilsIsCloseToRearOfVehicle(vehicle)
										or exports['st_veh']:UtilsIsCloseToFrontOfVehicle(vehicle)
										or (#(GetEntityCoords(vehicle) - LocalPlayer.state.myPos) <= 5.0)
									)
								then
									exports['st_ui']:ProgressCancel()
								end
							end, function(wasCancelled)
								_repairingVehicle = false
								if not wasCancelled then
									if
										exports['st_veh']:RepairPart(
											vehicle,
											installingPartData.part,
											(installingPartData.amount * quantity)
										)
									then
										cb(true)
										exports["st_ui"]:Notification("success", "Part Repaired")
									else
										cb(false)
										exports["st_ui"]:Notification("error", "Failed to Repair Part")
									end
								else
									cb(false)
								end
							end)

							return
						else
							exports["st_ui"]:Notification("error", "This Part Doesn't Fit! Stupid Mechanic!")
						end
					end
				end
			end
			cb(false)
		end)

		exports["strata"]:RegisterClientCallback("Mechanic:StartUpgradeInstall", function(part, cb)
			if LocalPlayer.state.loggedIn and not _repairingVehicle then
				local duty = LocalPlayer.state.onDuty
				if duty and _mechanicJobs[duty] then
					local playerCoords = GetEntityCoords(PlayerPedId())
					local maxDistance = 5.0
					local includePlayerVehicle = false

					local vehicle = lib.getClosestVehicle(playerCoords, maxDistance, includePlayerVehicle)
					if
						vehicle
						and DoesEntityExist(vehicle)
						and IsEntityAVehicle(vehicle)
						and (
							(#(GetEntityCoords(vehicle) - LocalPlayer.state.myPos) <= 5.0)
							or exports['st_veh']:UtilsIsCloseToRearOfVehicle(vehicle)
							or exports['st_veh']:UtilsIsCloseToFrontOfVehicle(vehicle)
						)
					then
						if
							GlobalState["PoliceCars"][GetEntityModel(vehicle)]
							or GlobalState["EMSCars"][GetEntityModel(vehicle)]
						then
							exports["st_ui"]:Notification("error", "Vehicle cannot be modified.")
							return
						end
						if GetIsVehicleEngineRunning(vehicle) then
							exports["st_ui"]:Notification("error", "Turn Off the Engine")
							return cb(false)
						end

						SetVehicleModKit(vehicle, 0)

						if part.toggleMod and IsToggleModOn(vehicle, part.modType) then
							exports["st_ui"]:Notification("error", "Vehicle Already Has Upgrade of That Level")
							return cb(false)
						end

						if not part.toggleMod then
							local maxUpgradable = GetNumVehicleMods(vehicle, part.modType) - 1
							local currentUpgrade = GetVehicleMod(vehicle, part.modType)
							if part.modIndex > maxUpgradable then
								exports["st_ui"]:Notification("error", "Vehicle Does Not Support That Upgrade")
								return cb(false)
							end

							if currentUpgrade >= part.modIndex then
								exports["st_ui"]:Notification("error", "Vehicle Already Has Upgrade of That Level")
								return cb(false)
							end
						end

						if IsPedInAnyVehicle(LocalPlayer.state.ped, false) then
							exports["st_ui"]:Notification("error", "Can't Repair Whilst in a Vehicle")
							return cb(false)
						end

						TaskTurnPedToFaceEntity(LocalPlayer.state.ped, vehicle, 1.0)
						Wait(750)

						local repairLength = part.time or 25

						exports['st_ui']:ProgressWithStartAndTick({
							name = "veh_mech_install",
							duration = repairLength * 1000,
							label = "Installing " .. part.part .. " Upgrade",
							canCancel = true,
							tickrate = 1000,
							controlDisables = {
								disableMovement = true,
								disableCarMovement = true,
								disableMouse = false,
								disableCombat = true,
							},
							animation = {
								anim = part.anim or "mechanic",
							},
							disarm = true,
						}, function()
							_repairingVehicle = true
						end, function()
							if
								not DoesEntityExist(vehicle)
								or not (
									exports['st_veh']:UtilsIsCloseToRearOfVehicle(vehicle)
									or exports['st_veh']:UtilsIsCloseToFrontOfVehicle(vehicle)
									or (#(GetEntityCoords(vehicle) - LocalPlayer.state.myPos) <= 5.0)
								)
							then
								exports['st_ui']:ProgressCancel()
							end
						end, function(wasCancelled)
							_repairingVehicle = false
							if not wasCancelled then
								if part.toggleMod then
									ToggleVehicleMod(vehicle, part.modType, true)
								else
									SetVehicleMod(vehicle, part.modType, part.modIndex, false)
								end

								cb(true, VehToNet(vehicle))
								exports["st_ui"]:Notification("success", "Part Installed")
							else
								cb(false)
							end
						end)
						return
					end
				end
			end
			cb(false)
		end)

		exports["strata"]:RegisterClientCallback("Mechanic:StartUpgradeRemoval", function(part, cb)
			if LocalPlayer.state.loggedIn and not _repairingVehicle then
				local duty = LocalPlayer.state.onDuty
				if duty and _mechanicJobs[duty] then
					local playerCoords = GetEntityCoords(PlayerPedId())
					local maxDistance = 5.0
					local includePlayerVehicle = false

					local vehicle = lib.getClosestVehicle(playerCoords, maxDistance, includePlayerVehicle)
					if
						vehicle
						and DoesEntityExist(vehicle)
						and IsEntityAVehicle(vehicle)
						and (
							(#(GetEntityCoords(vehicle) - LocalPlayer.state.myPos) <= 5.0)
							or exports['st_veh']:UtilsIsCloseToRearOfVehicle(vehicle)
							or exports['st_veh']:UtilsIsCloseToFrontOfVehicle(vehicle)
						)
					then
						if
							GlobalState["PoliceCars"][GetEntityModel(vehicle)]
							or GlobalState["EMSCars"][GetEntityModel(vehicle)]
						then
							exports["st_ui"]:Notification("error", "Vehicle cannot be modified.")
							return
						end
						if GetIsVehicleEngineRunning(vehicle) then
							exports["st_ui"]:Notification("error", "Turn Off the Engine")
							return cb(false)
						end

						SetVehicleModKit(vehicle, 0)

						local currentUpgrade = GetVehicleMod(vehicle, part.partType)

						if currentUpgrade == -1 then
							exports["st_ui"]:Notification("error", "This vehicle part cannot be removed.")
							return cb(false)
						end

						if IsPedInAnyVehicle(LocalPlayer.state.ped, false) then
							exports["st_ui"]:Notification("error", "Can't Repair Whilst in a Vehicle")
							return cb(false)
						end

						TaskTurnPedToFaceEntity(LocalPlayer.state.ped, vehicle, 1.0)
						Wait(750)

						local repairLength = part.time or 25

						exports['st_ui']:ProgressWithStartAndTick({
							name = "veh_mech_removal",
							duration = repairLength * 1000,
							label = "Removing " .. part.partName .. " Upgrade",
							canCancel = true,
							tickrate = 1000,
							controlDisables = {
								disableMovement = true,
								disableCarMovement = true,
								disableMouse = false,
								disableCombat = true,
							},
							animation = {
								anim = part.anim or "mechanic",
							},
							disarm = true,
						}, function()
							_repairingVehicle = true
						end, function()
							if
								not DoesEntityExist(vehicle)
								or not (
									exports['st_veh']:UtilsIsCloseToRearOfVehicle(vehicle)
									or exports['st_veh']:UtilsIsCloseToFrontOfVehicle(vehicle)
									or (#(GetEntityCoords(vehicle) - LocalPlayer.state.myPos) <= 5.0)
								)
							then
								exports['st_ui']:ProgressCancel()
							end
						end, function(wasCancelled)
							_repairingVehicle = false
							if not wasCancelled then
								SetVehicleMod(vehicle, part.partType, -1, false)

								cb(true, VehToNet(vehicle))
								exports["st_ui"]:Notification("success", "Part Uninstalled")
							else
								cb(false)
							end
						end)
						return
					end
				end
			end
			cb(false)
		end)
	end
end)

RegisterNetEvent("Mechanic:Client:ForcePerformanceProperty", function(vehicle, modType, modIndex)
	if NetworkDoesEntityExistWithNetworkId(vehicle) then
		local veh = NetToVeh(vehicle)
		if DoesEntityExist(veh) then
			SetVehicleModKit(veh, 0)

			if type(modIndex) == "boolean" then
				ToggleVehicleMod(veh, modType, modIndex)
			else
				SetVehicleMod(veh, modType, modIndex, false)
			end
		end
	end
end)

exports("CanAccessVehicleAsMechanic", function(vehicle)
	local vehCoords = GetEntityCoords(vehicle)
	local myDuty = LocalPlayer.state.onDuty
	if myDuty and _mechanicJobs[myDuty] then
		local inMechanicZone, mechanicZone = GetMechanicZoneAtCoords(vehCoords)
		if inMechanicZone and mechanicZone == myDuty then
			return true
		end
	end
	return false
end)

-- Regular Engine/Body Repair

AddEventHandler("Mechanic:Client:StartRegularRepair", function(entityData)
	if entityData and entityData.entity and DoesEntityExist(entityData.entity) and not _repairingVehicle then
		if GetIsVehicleEngineRunning(entityData.entity) then
			return exports["st_ui"]:Notification("error", "Turn Off the Engine")
		end

		if IsPedInAnyVehicle(LocalPlayer.state.ped, false) then
			return exports["st_ui"]:Notification("error", "Can't Repair Whilst in a Vehicle")
		end

		TaskTurnPedToFaceEntity(LocalPlayer.state.ped, entityData.entity, 1.0)
		Wait(750)

		local repairLength = 20
		exports['st_emotes']:EmotesPlay("mechanic", false, repairLength * 1000, true)
		exports['st_ui']:ProgressWithStartAndTick({
			name = "veh_mech_repair",
			duration = repairLength * 1000,
			label = "Repairing Vehicle",
			canCancel = true,
			tickrate = 1000,
			controlDisables = {
				disableMovement = true,
				disableCarMovement = true,
				disableMouse = false,
				disableCombat = true,
			},
			disarm = true,
		}, function()
			_repairingVehicle = true
		end, function()
			if
				not DoesEntityExist(entityData.entity)
				or not (
					exports['st_veh']:UtilsIsCloseToRearOfVehicle(entityData.entity)
					or exports['st_veh']:UtilsIsCloseToFrontOfVehicle(entityData.entity)
				)
			then
				exports['st_ui']:ProgressCancel()
			end
		end, function(wasCancelled)
			_repairingVehicle = false
			exports['st_emotes']:EmotesForceCancel()
			if not wasCancelled then
				if exports['st_veh']:RepairNormal(entityData.entity) then
					exports["st_ui"]:Notification("success", "Regular Repair Complete")
				else
					exports["st_ui"]:Notification("error", "Regular Repair Failed")
				end
			end
		end)
	end
end)

-- CreateThread(function()
--     local fridge = `v_res_fridgemoda`

--     loadModel(fridge)
--     local lol = CreateObject(fridge, -578.07, -911.8, 22.89, false, false)
--     FreezeEntityPosition(lol, true)
--     SetEntityLodDist(lol, 50)
-- end)

