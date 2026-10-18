local _activeTowVehicles = {}
local maxActive = 10

_activeTowers = {}

AddEventHandler('onResourceStart', function(resource)
	if resource == GetCurrentResourceName() then
		Wait(1000)
		exports["strata"]:RegisterServerCallback("Tow:RequestJob", function(source, data, cb)
			local char = Strata.User.Find(source)
			if not exports['st_jobs']:HasJob(source, "tow") and char then
				cb(exports['st_jobs']:GiveJob(char:GetData("SID"), "tow", false, "employee"))
			else
				cb(false)
			end
		end)

		exports["strata"]:RegisterServerCallback("Tow:QuitJob", function(source, data, cb)
			local char = Strata.User.Find(source)
			if exports['st_jobs']:HasJob(source, "tow") and char then
				_activeTowers[source] = nil
				cb(exports['st_jobs']:RemoveJob(char:GetData("SID"), "tow"))
			else
				cb(false)
			end
		end)

		exports["strata"]:RegisterServerCallback("Tow:OnDuty", function(source, data, cb)
			local char = Strata.User.Find(source)
			local dutyData = exports['st_jobs']:DutyGetDutyData("tow")
			if exports['st_jobs']:HasJob(source, "tow") and char then
				if not dutyData or (dutyData and dutyData.Count < maxActive) then
					if exports['st_jobs']:DutyOn(source, "tow", true) then
						_activeTowers[source] = {
							next = os.time() + (math.random(1, 3) * 60),
						}
						exports['st_ui']:Notification(source, "info",
							[[
                                You are now on Duty as a Tow Truck Driver.<br><br>
                                Get a Tow Truck from Jerry in the Tow Lot.<br>
                                To Impound Vehicles, Bring them to the Tow Lot and
                                Fill out the Paperwork.
                            ]],
							10000,
							"truck-tow"
						)
					else
						exports['st_ui']:Notification(source, "error", "Failed to Go On Duty",
							5000, "truck-tow")
					end
				else
					exports['st_ui']:Notification(source, "error",
						"Too Many Tow Employees on Duty", 5000, "truck-tow")
				end
			else
				exports['st_ui']:Notification(source, "error", "Failed to Go On Duty", 5000,
					"truck-tow")
			end
		end)

		exports["strata"]:RegisterServerCallback("Tow:OffDuty", function(source, data, cb)
			local char = Strata.User.Find(source)
			if char and exports['st_jobs']:DutyGet(source, "tow") then
				local stateId = char:GetData("SID")
				if not _activeTowVehicles[stateId] then
					exports['st_jobs']:DutyOff(source, "tow")
					exports['st_jobs']:CleanupPickup(source)
					_activeTowers[source] = nil
					exports['st_phone']:NotificationRemoveById(source, "TOW_OBJ")
				else
					exports['st_ui']:Notification(source, "error",
						"Return the Tow Truck Before Going Off Duty",
						5000,
						"truck-tow"
					)
				end
			else
				exports['st_ui']:Notification(source, "error", "Failed to Go Off Duty", 5000,
					"truck-tow")
			end
		end)

		exports["strata"]:RegisterServerCallback("Tow:RequestTruck", function(source, spaceCoords, cb)
			local char = Strata.User.Find(source)
			if char and Player(source).state.onDuty == "tow" then
				local stateId = char:GetData("SID")
				if not _activeTowVehicles[stateId] then
					exports['st_veh']:SpawnTemp(
						source,
						`flatbed`,
						'automobile',
						spaceCoords.xyz,
						spaceCoords.w,
						function(spawnedVehicle, VIN, plate)
							if spawnedVehicle then
								exports['st_veh']:KeysAdd(source, VIN)

								_activeTowVehicles[stateId] = {
									SID = stateId,
									veh = spawnedVehicle,
									net = NetworkGetNetworkIdFromEntity(spawnedVehicle),
									VIN = VIN,
									plate = plate,
								}

								GlobalState[string.format("TowTrucks:%s", stateId)] =
									NetworkGetNetworkIdFromEntity(spawnedVehicle)

								exports['st_ui']:Notification(source, "success",
									"Your Tow Truck Was Provided",
									5000,
									"truck-tow"
								)
								cb(spawnedVehicle)
							else
								exports['st_ui']:Notification(source, "error",
									"Truck Spawn Failed", 5000, "truck-tow")
								cb(nil)
							end
						end,
						{
							Make = "MTL",
							Model = "Flatbed",
							Value = 50000,
						}
					)
				else
					exports['st_ui']:Notification(source, "error", "We Already Gave You a Truck",
						5000, "truck-tow")
					cb(nil)
				end
			end
		end)

		exports["strata"]:RegisterServerCallback("Tow:ReturnTruck", function(source, data, cb)
			local char = Strata.User.Find(source)
			if char then
				local stateId = char:GetData("SID")
				local hasTruck = _activeTowVehicles[stateId]
				if hasTruck and hasTruck.veh and DoesEntityExist(hasTruck.veh) then
					local truckCoords = GetEntityCoords(hasTruck.veh)
					if #(truckCoords - _towSpaces[1].xyz) <= 20.0 then
						exports['st_veh']:Delete(hasTruck.veh, function(success)
							if success then
								_activeTowVehicles[stateId] = nil
								GlobalState[string.format("TowTrucks:%s", stateId)] = false
								exports['st_ui']:Notification(source, "success",
									"Thanks for Returning Your Tow Truck",
									5000,
									"truck-tow"
								)
							else
								exports['st_ui']:Notification(source, "error",
									"Error Returning Truck",
									5000,
									"truck-tow"
								)
							end
						end)
					else
						exports['st_ui']:Notification(source, "error",
							"Your Tow Truck Isn't Nearby",
							5000,
							"truck-tow"
						)
					end
				else
					exports['st_ui']:Notification(source, "error",
						"You Don't Have a Truck to Return",
						5000,
						"truck-tow"
					)
				end
			end
		end)
	end
end)

AddEventHandler("Vehicles:Server:Deleted", function(veh, VIN)
	for k, v in pairs(_activeTowVehicles) do
		if v.veh == veh then
			GlobalState[string.format('TowTrucks:%s', v.SID)] = false
			_activeTowVehicles[v.SID] = nil
		end
	end
end)

exports('PayoutPickup', function(source)
	if _activeTowers[source] ~= nil then
		local char = Strata.User.Find(source)
		exports['st_finance']:BalanceDeposit(
			exports['st_finance']:AccountsGetPersonal(char:GetData("SID")).Account, 300, {
				type = "paycheck",
				title = "Tow Fee",
				description = "Your Fee For A Vehicle Pickup",
				data = 300,
			})
		exports['st_phone']:NotificationRemoveById(source, "TOW_OBJ")
		exports['st_phone']:NotificationAdd(
			source,
			"Yard Manager",
			"Good work, I've sent your fee to your account. I'll let you know when I got another job for you",
			os.time(),
			10000,
			{
				color = "#247919",
				label = "Los Santos Tow",
				icon = "truck-tow",
			},
			{},
			nil
		)

		exports['st_jobs']:CleanupPickup(source)
	end
end)

exports('CleanupPickup', function(source)
	if _activeTowers[source] ~= nil then
		if _activeTowers[source].veh ~= nil and DoesEntityExist(_activeTowers[source].veh) then
			exports['st_veh']:Delete(veh, function(success) end)
			_activeTowers[source].veh = nil
		end

		if _activeTowers[source].location ~= nil then
			_inuse[_activeTowers[source].location] = false
			_activeTowers[source].location = nil
		end

		_activeTowers[source].next = os.time() + (math.random(3, 6) * 60)
		_activeTowers[source].onTask = false
		TriggerClientEvent("Tow:Client:CleanupPickup", source)
	end
end)

AddEventHandler("Characters:Server:PlayerLoggedOut", function(source)
	exports['st_jobs']:CleanupPickup(source)
	_activeTowers[source] = nil
end)
AddEventHandler("Characters:Server:PlayerDropped", function(source)
	exports['st_jobs']:CleanupPickup(source)
	_activeTowers[source] = nil
end)
