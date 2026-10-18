local _breached = {}
local _swabCounter = 1

local _generatedNames = {}
local _canUseRootNameGenerator = nil

local _fallbackFirstNames = {
	"Alex", "Jordan", "Taylor", "Avery", "Morgan", "Cameron", "Casey", "Parker", "Riley", "Quinn",
	"Drew", "Reese", "Hayden", "Rowan", "Kai", "Skyler", "Shawn", "Logan", "Kendall", "Blake",
}

local _fallbackLastNames = {
	"Walker", "Bennett", "Carter", "Hayes", "Parker", "Brooks", "Morgan", "Sullivan", "Reed", "Harper",
	"Wright", "Campbell", "Foster", "Hunter", "Griffin", "Bishop", "Morris", "Knight", "Steele", "Hayward",
}

local function GeneratePlateOwnerName()
	if _canUseRootNameGenerator ~= false then
		local firstOk, firstName = pcall(function()
			return exports['strata']:GeneratorNameFirst()
		end)
		local lastOk, lastName = pcall(function()
			return exports['strata']:GeneratorNameLast()
		end)

		if firstOk and lastOk and firstName and lastName and firstName ~= "" and lastName ~= "" then
			_canUseRootNameGenerator = true
			return string.format("%s %s", firstName, lastName)
		end

		_canUseRootNameGenerator = false
	end

	return string.format(
		"%s %s",
		_fallbackFirstNames[math.random(#_fallbackFirstNames)],
		_fallbackLastNames[math.random(#_fallbackLastNames)]
	)
end

AddEventHandler('onResourceStart', function(resource)
	if resource == GetCurrentResourceName() then
		Wait(1000)
		PoliceItems()
		RegisterCommands()
		RegisterItems()

		GlobalState["PrisonLockdown"] = false
		GlobalState["PrisonCellsLocked"] = false
		GlobalState["PoliceCars"] = Config.PoliceCars
		GlobalState["EMSCars"] = Config.EMSCars

		exports["strata"]:RegisterServerCallback("Police:GSRTest", function(source, data, cb)
			local char = Strata.User.Find(source)

			local pState = Player(source).state
			if pState.onDuty == "police" or pState.onDuty == "ems" then
				local target = Player(data)
				if target ~= nil then
					if target.state?.GSR ~= nil and (os.time() - target.state.GSR) <= (60 * 60) then
						exports["st_chat"]:SendSystemSingle(source, "GSR: Positive")
					else
						exports["st_chat"]:SendSystemSingle(source, "GSR: Negative")
					end
				else
					exports['st_ui']:Notification(source, "error", "Invalid Target")
				end
			end
		end)

		exports["strata"]:RegisterServerCallback("Prison:SetLockdown", function(source, data, cb)
			local char = Strata.User.Find(source)
			local pState = Player(source).state
			-- add PD Alert
			if char and (pState.onDuty == "prison" or pState.onDuty == "police") then
				GlobalState["PrisonLockdown"] = not GlobalState["PrisonLockdown"]
				GlobalState["PrisonCellsLocked"] = GlobalState["PrisonLockdown"]
				for i = 1, 27 do
					exports['st_doors']:SetLock(string.format("prison_cell_%s", i), GlobalState
						["PrisonCellsLocked"])
				end
				exports['st_ui']:Notification(source, "info",
					string.format("Cell Door State: %s", GlobalState["PrisonCellsLocked"]),
					GlobalState["PrisonCellsLocked"] and "Locked" or "Unlocked")
				cb(true, GlobalState["PrisonLockdown"])
			else
				cb(false)
			end
		end)

		exports["strata"]:RegisterServerCallback("Prison:SetCellState", function(source, data, cb)
			local char = Strata.User.Find(source)
			local pState = Player(source).state

			if char and (pState.onDuty == "prison" or pState.onDuty == "police") then
				GlobalState["PrisonCellsLocked"] = not GlobalState["PrisonCellsLocked"]
				for i = 1, 27 do
					exports['st_doors']:SetLock(string.format("prison_cell_%s", i), GlobalState
						["PrisonCellsLocked"])
				end
				exports['st_ui']:Notification(source, "info",
					string.format("Cell Door State: %s", GlobalState["PrisonCellsLocked"]),
					GlobalState["PrisonCellsLocked"] and "Locked" or "Unlocked")
				cb(true, GlobalState["PrisonCellsLocked"])
			else
				cb(false)
			end
		end)

		exports["strata"]:RegisterServerCallback("Police:BACTest", function(source, data, cb)
			local char = Strata.User.Find(source)

			local pState = Player(source).state
			if pState.onDuty == "police" or pState.onDuty == "ems" then
				local target = Player(data)
				if target ~= nil then
					-- Great Code Kapp
					if target.state.isDrunk and target.state.isDrunk > 0 then
						if target.state.isDrunk >= 70 then
							exports["st_chat"]:SendSystemSingle(source, "BAC: 0.22% - Above Limit")
						elseif target.state.isDrunk >= 40 then
							exports["st_chat"]:SendSystemSingle(source, "BAC: 0.13% - Above Limit")
						elseif target.state.isDrunk >= 30 then
							exports["st_chat"]:SendSystemSingle(source, "BAC: 0.1% - Above Limit")
						elseif target.state.isDrunk >= 25 then
							exports["st_chat"]:SendSystemSingle(source, "BAC: 0.085% - Above Limit")
						elseif target.state.isDrunk >= 15 then
							exports["st_chat"]:SendSystemSingle(source, "BAC: 0.04% - Below Limit")
						else
							exports["st_chat"]:SendSystemSingle(source, "BAC: 0.025% - Below Limit")
						end
					else
						exports["st_chat"]:SendSystemSingle(source, "BAC: Not Drunk")
					end
				else
					exports['st_ui']:Notification(source, "error", "Invalid Target")
				end
			end

			cb(true)
		end)

		exports["strata"]:RegisterServerCallback("Police:DNASwab", function(source, data, cb)
			local char = Strata.User.Find(source)

			local pState = Player(source).state
			if char and pState.onDuty == "police" or pState.onDuty == "ems" then
				local tChar = Strata.User.Find(data)
				if tChar ~= nil then
					local coords = GetEntityCoords(GetPlayerPed(data))
					_swabCounter += 1

					exports.st_inventory:AddItem(char:GetData('SID'), 'evidence-dna', 1, {
						EvidenceType = 'blood',
						EvidenceId = string.format('%s-%s', os.date('%d%m%y-%H%M%S', os.time()), 950000 + _swabCounter),
						EvidenceCoords = { x = coords.x, y = coords.y, z = coords.z },
						EvidenceDNA = tChar:GetData("SID"),
						EvidenceSwab = true,
						EvidenceDegraded = false,
					}, 1)

					return
				end

				exports['st_ui']:Notification(source, "error", "Invalid Target")
			end
		end)

		exports["strata"]:RegisterServerCallback("Police:Breach", function(source, data, cb)
			local char = Strata.User.Find(source)

			if (data?.type == nil or data?.property == nil) then
				cb(false)
				return
			end

			if Player(source).state.onDuty == "police" then
				_breached[data.type] = _breached[data.type] or {}

				if data.type == "property" then
					if (_breached[data.type][data.property] or 0) > os.time() then
						cb(true)
						exports['st_housing']:ClientEnter(source, data.property)
					else
						exports["strata"]:ClientCallback(source, "Police:Breach", {}, function(s)
							if s then
								_breached[data.type][data.property] = os.time() + (60 * 10)
								exports['st_housing']:ClientEnter(source, data.property)
								cb(true)
							else
								cb(false)
							end
						end)
					end
				elseif data.type == "robbery" then
					if (_breached[data.type][data.property] or 0) > os.time() then
						TriggerEvent("Labor:Server:HouseRobbery:Breach", source, data.property)

						cb(true)
					else
						exports["strata"]:ClientCallback(source, "Police:Breach", {}, function(s)
							if s then
								TriggerEvent("Labor:Server:HouseRobbery:Breach", source, data.property)

								cb(true)
							else
								cb(false)
							end
						end)
					end
				elseif data.type == "apartment" then
					local aptTier = exports['st_chars']:FetchGetOfflineData(data.property, "Apartment")

					if aptTier ~= nil then
						local id = aptTier or 1
						if id == aptTier then
							if (_breached[data.type][data.property] or 0) > os.time() then
								exports['st_apartment']:ClientEnter(aptTier, data.property)

								return cb(data.property)
							else
								exports["strata"]:ClientCallback(source, "Police:Breach", {}, function(s)
									if s then
										_breached[data.type][data.property] = os.time() + (60 * 10)
										exports['st_apartment']:ClientEnter(aptTier, data.property)

										return cb(data.property)
									else
										cb(false)
									end
								end)
							end
						else
							exports['st_ui']:Notification(source, "error",
								"Target Does Not Reside Here")
							return cb(false)
						end
					else
						exports['st_ui']:Notification(source, "error", "Target Not Online")
						return cb(false)
					end
				end
			else
				cb(false)
			end
		end)

		exports["strata"]:RegisterServerCallback("Police:AccessRifleRack", function(source, data, cb)
		    local char = Strata.User.Find(source)
		    if char == nil then return end
		    local myDuty = Player(source).state.onDuty
		    if myDuty ~= 'police' and myDuty ~= 'prison' then return end
		    local ped = GetPlayerPed(source)
		    local veh = GetVehiclePedIsIn(ped)
		    if veh == 0 then
		        exports['st_ui']:Notification(source, "error", "Not In A Vehicle")
		        return
		    end
		    if not Config.PoliceCars[GetEntityModel(veh)] then
		        exports['st_ui']:Notification(source, "error", "Vehicle Not Outfitted With A Secured Compartment")
		        return
		    end
		    local entState = Entity(veh).state
		    local jobType = myDuty
		    if not exports['st_veh']:KeysHas(source, entState.VIN, jobType) then
		        exports['st_ui']:Notification(source, "error", "Can't Access The Locked Compartment")
		        return
		    end
    		local stashId = ("pdrack:%s"):format(entState.VIN)
    		exports.st_inventory:RegisterStash(stashId, "Secured Compartment", 10, 150000, nil, {
    		    [jobType] = 0
    		})
		
    		SetTimeout(100, function()
    		    exports.st_inventory:forceOpenInventory(source, 'stash', stashId)
    		end)
		
    		if cb then cb(true) end
		end)

		exports["strata"]:RegisterServerCallback("Police:RemoveMask", function(source, data, cb)
			local char = Strata.User.Find(source)
			if char ~= nil and Player(source).state.onDuty == "police" then
				local tChar = Strata.User.Find(data)
				if tChar ~= nil then
					exports['st_appearance']:MaskUnequip(data)
				end
			end
		end)

		exports["strata"]:RegisterServerCallback("Police:GetRadioChannel", function(source, data, cb)
			local char = Strata.User.Find(source)
			if char ~= nil and Player(source).state.onDuty == "police" then
				local tState = Player(tonumber(data)).state
				if tState and tState?.onRadio then
					exports["st_chat"]:SendSystemSingle(source, string.format("Radio Frequency: %s", tState.onRadio))
				else
					exports["st_chat"]:SendSystemSingle(source, string.format("Not On Radio"))
				end
			end
		end)
	end
end)

function RegisterItems()
	exports.st_inventory:RegisterUse("spikes", "Police", function(source, slot, itemData)
		if GetVehiclePedIsIn(GetPlayerPed(source)) == 0 then
			exports["strata"]:ClientCallback(source, "Police:DeploySpikes", {}, function(data)
				if data ~= nil then
					TriggerClientEvent("Police:Client:AddDeployedSpike", -1, data.positions, data.h, source)

					local newValue = slot.CreateDate - math.ceil(itemData.durability / 4)
					if (os.time() - itemData.durability >= newValue) then
						exports.st_inventory:RemoveId(slot.Owner, slot.invType, slot)
					else
						exports.st_inventory:SetItemCreateDate(
							slot.id,
							newValue
						)
					end

					exports['st_ui']:Notification(source, "success",
						"You Deployed Spikes (Despawn In 20s)")
				end
			end)
		end
	end)
end

RegisterNetEvent('st_inventory:ready', function()
	if GetResourceState(GetCurrentResourceName()) == 'started' then
		RegisterItems()
	end
end)

RegisterNetEvent("Police:Server:Cuff", function()
	local src = source
	local char = Strata.User.Find(src)
	local pState = Player(src).state
	if char ~= nil and (pState.onDuty == "police" or pState.onDuty == "prison") then
		exports['st_police']:HardCuff(src)
	end
end)

RegisterNetEvent("Police:Server:Uncuff", function()
	local src = source
	local char = Strata.User.Find(src)
	local pState = Player(src).state
	if char ~= nil and (pState.onDuty == "police" or pState.onDuty == "prison") then
		exports['st_police']:Uncuff(src)
	end
end)

RegisterNetEvent("Police:Server:RunPlate", function(plate, VIN, model, class)
	local src = source
	local char = Strata.User.Find(src)
	if char ~= nil then
		local myDuty = Player(src).state.onDuty
		if myDuty and myDuty == "police" then
			exports['st_police']:RunPlate(src, plate, {
				VIN = VIN,
				model = model,
				class = class,
			})
		end
	end
end)

RegisterNetEvent("Police:Server:Panic", function(isAlpha)
	local src = source
	local char = Strata.User.Find(src)
	local pState = Player(src).state
	if pState.onDuty == "police" then
		local coords = GetEntityCoords(GetPlayerPed(src))
		exports["strata"]:ClientCallback(src, "EmergencyAlerts:GetStreetName", coords, function(location)
			if isAlpha then
				exports['st_mdt']:EmergencyAlertsCreate("13-A", "Officer Down", { "police_alerts", "ems_alerts" },
					location, {
						icon = "circle-exclamation",
						details = string.format(
							"%s - %s %s | %s",
							char:GetData("Callsign"),
							char:GetData("First"),
							char:GetData("Last"),
							pState?.onRadio and string.format("Radio Freq: %s", pState.onRadio) or "Not On Radio"
						)
					}, true, {
						icon = 303,
						size = 1.2,
						color = 26,
						duration = (60 * 10),
					}, 1)
			else
				exports['st_mdt']:EmergencyAlertsCreate("13-B", "Officer Down", { "police_alerts", "ems_alerts" },
					location, {
						icon = "circle-exclamation",
						details = string.format(
							"%s - %s %s",
							char:GetData("Callsign"),
							char:GetData("First"),
							char:GetData("Last"),
							pState?.onRadio and string.format("Radio Freq: %s", pState.onRadio) or "Not On Radio"
						)
					}, false, {
						icon = 303,
						size = 0.9,
						color = 26,
						duration = (60 * 10),
					}, 1)
			end
		end)
	elseif Player(src).state.onDuty == "prison" then
		local coords = GetEntityCoords(GetPlayerPed(src))
		exports["strata"]:ClientCallback(src, "EmergencyAlerts:GetStreetName", coords, function(location)
			if isAlpha then
				exports['st_mdt']:EmergencyAlertsCreate("13-A", "Corrections Officer Down",
					{ "police_alerts", "doc_alerts", "ems_alerts" },
					location, {
						icon = "circle-exclamation",
						details = string.format(
							"%s - %s %s | %s",
							char:GetData("Callsign"),
							char:GetData("First"),
							char:GetData("Last"),
							pState?.onRadio and string.format("Radio Freq: %s", pState.onRadio) or "Not On Radio"
						)
					}, true, {
						icon = 303,
						size = 1.2,
						color = 26,
						duration = (60 * 10),
					}, 1)
			else
				exports['st_mdt']:EmergencyAlertsCreate("13-B", "Corrections Officer Down",
					{ "police_alerts", "doc_alerts", "ems_alerts" },
					location, {
						icon = "circle-exclamation",
						details = string.format(
							"%s - %s %s | %s",
							char:GetData("Callsign"),
							char:GetData("First"),
							char:GetData("Last"),
							pState?.onRadio and string.format("Radio Freq: %s", pState.onRadio) or "Not On Radio"
						)
					}, false, {
						icon = 303,
						size = 0.9,
						color = 26,
						duration = (60 * 10),
					}, 1)
			end
		end)
	end
end)

RegisterNetEvent('Police:Server:Tackle', function(target)
	local src = source
	if #(GetEntityCoords(GetPlayerPed(src)) - GetEntityCoords(GetPlayerPed(target))) < 5.0 then
		TriggerClientEvent('Police:Client:GetTackled', target)
	end
end)

RegisterNetEvent("Prison:Server:Lockdown:AlertPolice", function(state)
	local src = source
	if state then
		exports['st_crime']:TriggerPDAlert(src, GetEntityCoords(GetPlayerPed(src)), "10-98",
			"Bolingbroke Penitentiary Lockdown", {
				icon = 526,
				size = 0.9,
				color = 1,
				duration = (60 * 5),
			})
	end
	TriggerClientEvent("Prison:Client:JailAlarm", -1, state)
end)

exports('IsInBreach', function(source, type, id, extraCheck)
	if Player(source)?.state?.onDuty == "police" and (not extraCheck or exports['st_jobs']:HasPermissionInJob(source, 'police', 'PD_RAID')) then
		if _breached[type] and _breached[type][id] and ((_breached[type][id] or 0) > os.time()) then
			if extraCheck then
				local char = Strata.User.Find(source)
				if char then
					Strata.Log.Warn(
						"Police",
						string.format(
							"Police Raid - Character %s %s (%s) - Accessing Property %s (%s)",
							char:GetData("First"),
							char:GetData("Last"),
							char:GetData("SID"),
							id,
							type
						),
						{
							console = true,
							discord = {
								embed = true,
								type = 'info',
							}
						}
					)
				end
			end

			return true
		end
	end

	return false
end)

exports('RunPlate', function(source, plate, wasEntity)
	local results = MySQL.query.await(
		"SELECT VIN, Type, Make, Model, RegisteredPlate, OwnerType, OwnerId, OwnerWorkplace, Class, Properties FROM vehicles WHERE RegisteredPlate = ? OR JSON_EXTRACT(Properties, '$.FakePlate') = ?",
		{ plate, plate }
	)

	if not results or #results == 0 then
		local stolen = exports['st_police']:CheckPlate(plate)
		local entityClass = (wasEntity and wasEntity.class) or "Unknown"
		if stolen then
			if not _generatedNames[plate] then
				_generatedNames[plate] = GeneratePlateOwnerName()
			end

			if wasEntity then
				exports["st_chat"]:SendDispatch(
					source,
					string.format(
						"<b>Owner</b>: %s<br /><b>VIN</b>: %s<br /><b>Make & Model</b>: %s<br /><b>Plate</b>: %s<br /><b>Class</b>: %s<br /><br />%s",
						_generatedNames[plate],
						wasEntity.VIN,
						wasEntity.model,
						plate,
							entityClass,
						stolen
					)
				)
			else
				exports["st_chat"]:SendDispatch(
					source,
					string.format(
						"<b>Owner</b>: %s<br /><b>VIN</b>: Unknown<br /><b>Make & Model</b>: Unknown<br /><b>Plate</b>: %s<br /><b>Class</b>: Unknown<br /><br />%s",
						_generatedNames[plate],
						plate,
						stolen
					)
				)
			end
		elseif wasEntity then
			if not _generatedNames[plate] then
				_generatedNames[plate] = GeneratePlateOwnerName()
			end

			exports["st_chat"]:SendDispatch(
				source,
				string.format(
					"<b>Owner</b>: %s<br /><b>VIN</b>: %s<br /><b>Make & Model</b>: %s<br /><b>Plate</b>: %s<br /><b>Class</b>: %s",
					_generatedNames[plate],
					wasEntity.VIN,
					wasEntity.model,
					plate,
					entityClass
				)
			)
		else
			exports["st_chat"]:SendDispatch(source, "No Plate Match")
		end
		return
	end

	if #results > 1 then
		exports["st_chat"]:SendDispatch(source, "Multiple Matches, Please Use MDT")
	else
		local vehicle = results[1]

		local properties = {}
		if vehicle.Properties then
			properties = json.decode(vehicle.Properties) or {}
		end

		if properties.FakePlate and plate == properties.FakePlate then
			local stolen = exports['st_police']:CheckPlate(plate)

			local ownerName = "Unknown"
			local vin = vehicle.VIN or "Unknown"
			local makeModel = string.format("%s %s", vehicle.Make or "Unknown", vehicle.Model or "Unknown")
			local fakePlate = properties.FakePlate
			local vehicleClass = vehicle.Class or "Unknown"

			if properties.FakePlateData then
				ownerName = string.format("%s (%s)", properties.FakePlateData.OwnerName or "Unknown", properties.FakePlateData.SID or "Unknown")
				vin = properties.FakePlateData.VIN or vin
				makeModel = properties.FakePlateData.Vehicle or makeModel
			end

			if stolen then
				exports["st_chat"]:SendDispatch(
					source,
					string.format(
						"<b>Owner</b>: %s<br /><b>VIN</b>: %s<br /><b>Make & Model</b>: %s<br /><b>Plate</b>: %s<br /><b>Class</b>: %s<br /><br />%s",
						ownerName,
						vin,
						makeModel,
						fakePlate,
						vehicleClass,
						stolen
					)
				)
			else
				exports["st_chat"]:SendDispatch(
					source,
					string.format(
						"<b>Owner</b>: %s<br /><b>VIN</b>: %s<br /><b>Make & Model</b>: %s<br /><b>Plate</b>: %s<br /><b>Class</b>: %s",
						ownerName,
						vin,
						makeModel,
						fakePlate,
						vehicleClass
					)
				)
			end

			return
		end

		local ownerName = "Unknown"
		if vehicle.OwnerType == 0 then
			local owner = exports['st_mdt']:PeopleView(vehicle.OwnerId)
			if owner then
				ownerName = string.format("%s %s", owner.First, owner.Last)
			end
		elseif vehicle.OwnerType == 1 then
			local jobData = exports['st_jobs']:DoesExist(vehicle.OwnerId, vehicle.OwnerWorkplace)
			if jobData then
				if jobData.Workplace then
					ownerName = string.format('%s (%s)', jobData.Name, jobData.Workplace.Name)
				else
					ownerName = jobData.Name
				end
			end
		end

		local stolen = false
		if properties.Flags then
			for k, v in ipairs(properties.Flags) do
				if v.Type == "stolen" then
					stolen = v.Description
					break
				end
			end
		end

		if stolen then
			exports["st_chat"]:SendDispatch(
				source,
				string.format(
					"<b>Owner</b>: %s (%s)<br /><b>VIN</b>: %s<br /><b>Make & Model</b>: %s %s<br /><b>Plate</b>: %s<br /><b>Class</b>: %s<br /><br /><b>Vehicle Reported Stolen</b>: %s",
					ownerName,
					vehicle.OwnerId,
					vehicle.VIN,
					vehicle.Make,
					vehicle.Model,
					vehicle.RegisteredPlate,
					vehicle.Class,
					stolen
				)
			)
		else
			exports["st_chat"]:SendDispatch(
				source,
				string.format(
					"Owner: %s (%s)\nVIN: %s\nMake & Model: %s %s\nPlate: %s\nClass: %s",
					ownerName,
					vehicle.OwnerId,
					vehicle.VIN,
					vehicle.Make,
					vehicle.Model,
					vehicle.RegisteredPlate,
					vehicle.Class
				)
			)
		end
	end
end)

exports('IsPdCar', function(model)
	return Config.PoliceCars[model]
end)

exports('IsEMSCar', function(model)
	return Config.EMSCars[model]
end)

RegisterNetEvent("Police:Server:RemoveSpikes", function()
	TriggerClientEvent("Police:Client:RemoveSpikes", -1, source)
end)

RegisterNetEvent("Police:Server:Slimjim", function()
	local src = source

	if Player(src).state.onDuty == "police" then
		exports["strata"]:ClientCallback(src, "Vehicles:Slimjim", true, function()

		end)
	end
end)
