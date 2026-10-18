AddEventHandler('onResourceStart', function(resource)
	if resource == GetCurrentResourceName() then
		Wait(1000)
		EMSCallbacks()
		EMSItems()
	end
end)

RegisterNetEvent("EMS:Server:CheckICUPatients", function()
	local src = source
	local count = 0
	for k, v in ipairs(Strata.User.Roster()) do
		if v ~= nil then
			if v:GetData("ICU") ~= nil and not v:GetData("ICU").Released then
				count = count + 1
			end
		end
	end

	if count > 0 then
		if count == 1 then
			exports['st_ui']:Notification(src, "info", "There Is 1 Patient In ICU")
		else
			exports['st_ui']:Notification(src, "info",
				string.format("There Are %s Patients In ICU", count))
		end
	else
		exports['st_ui']:Notification(src, "info", "There Are No Patients In ICU")
	end
end)

RegisterNetEvent("EMS:Server:RequestHelp", function()
	local src = source
	TriggerEvent("EmergencyAlerts:Server:ServerDoPredefined", src, "injuredPerson")
end)

function EMSCallbacks()
	exports["strata"]:RegisterServerCallback("EMS:Stabilize", function(source, data, cb)
		local myChar = Strata.User.Find(source)
		local char = Strata.User.Find(tonumber(data))
		if char ~= nil then
			if exports.st_inventory:ItemsHas(myChar:GetData("SID"), 1, "traumakit", 1) then
				if exports['st_jobs']:HasJob(source, "ems") then
					Strata.Log.Info(
						"EMS",
						string.format(
							"%s %s (%s) Stabilized %s %s (%s)",
							myChar:GetData("First"),
							myChar:GetData("Last"),
							myChar:GetData("SID"),
							char:GetData("First"),
							char:GetData("Last"),
							char:GetData("SID")
						),
						{
							console = true,
							file = true,
							database = true,
						}
					)
					exports["strata"]:ClientCallback(data, "Damage:FieldStabalize")
					cb({ error = false })
				else
					cb({ error = true, code = 3 })
				end
			else
				cb({ error = true, code = 2 })
			end
		else
			cb({ error = true, code = 1 })
		end
	end)

	exports["strata"]:RegisterServerCallback("EMS:FieldTreatWounds", function(source, data, cb)
		local myChar = Strata.User.Find(source)
		if exports['st_jobs']:HasJob(source, "ems") then
			if exports.st_inventory:ItemsHas(myChar:GetData("SID"), 1, "traumakit", 1) then
				exports['st_ui']:Notification("success", data, "Your Wounds Were Treated")
				cb({ error = false })
			else
				cb({ error = true, code = 2 })
			end
		else
			cb({ error = true, code = 1 })
		end
	end)

	-- exports["strata"]:RegisterServerCallback("EMS:ApplyGauze", function(source, data, cb)
	-- 	local myChar = Strata.User.Find(source)
	-- 	if exports['st_jobs']:HasJob(source, "ems") then
	-- 		if exports.st_inventory:Remove(myChar:GetData("SID"), 1, "gauze", 1) then
	-- 			local target = Strata.User.Account(data)
	-- 			if target ~= nil then
	-- 				local tChar = target:GetData("Character")
	-- 				if tChar ~= nil then
	-- 					local dmg = tChar:GetData("Damage")
	-- 					if dmg.Bleed > 1 then
	-- 						dmg.Bleed = dmg.Bleed - 1
	-- 						tChar:SetData("Damage", dmg)
	-- 					else
	-- 						exports['st_ui']:Notification("error", data, "You continue bleeding through the gauze")
	-- 					end
	-- 					cb({ error = false })
	-- 				else
	-- 					cb({ error = true, code = 4 })
	-- 				end
	-- 			else
	-- 				cb({ error = true, code = 3 })
	-- 			end
	-- 		else
	-- 			cb({ error = true, code = 2 })
	-- 		end
	-- 	else
	-- 		cb({ error = true, code = 1 })
	-- 	end
	-- end)

	exports["strata"]:RegisterServerCallback("EMS:ApplyBandage", function(source, data, cb)
		local myChar = Strata.User.Find(source)
		if exports['st_jobs']:HasJob(source, "ems") then
			if exports.st_inventory:Remove(myChar:GetData("SID"), "bandage", 1) then
				local ped = GetPlayerPed(data)
				local currHp = GetEntityHealth(ped)
				if currHp < (GetEntityMaxHealth(ped) * 0.75) then
					local p = promise.new()

					exports["strata"]:ClientCallback(data, "EMS:ApplyBandage", {}, function(s)
						p:resolve(s)
					end)

					Citizen.Await(p)
					exports['st_ui']:Notification("success", data, "A Bandage Was Applied To You")
					cb({ error = false })
				else
					cb({ error = true, code = 3 })
				end
			else
				cb({ error = true, code = 2 })
			end
		else
			cb({ error = true, code = 1 })
		end
	end)

	exports["strata"]:RegisterServerCallback("EMS:ApplyMorphine", function(source, data, cb)
		local myChar = Strata.User.Find(source)
		if exports['st_jobs']:HasJob(source, "ems") then
			if exports.st_inventory:Remove(myChar:GetData("SID"), 1, "morphine", 1) then
				exports['st_injury']:EffectsPainkiller(tonumber(data), 3)
				exports['st_ui']:Notification("success", data, "You Received A Morphine Shot")
				cb({ error = false })
			else
				cb({ error = true, code = 2 })
			end
		else
			cb({ error = true, code = 1 })
		end
	end)

	exports["strata"]:RegisterServerCallback("EMS:TreatWounds", function(source, data, cb)
		local myChar = Strata.User.Find(source)
		if exports['st_jobs']:HasJob(source, "ems") then
			exports["strata"]:ClientCallback(data, "Damage:Heal", true)
			--TriggerClientEvent("Hospital:Client:GetOut", data)
			exports['st_ui']:Notification(source, "success", "Patient Has Been Treated")
			exports['st_ui']:Notification("success", data, "You've Been Treated")
			cb({ error = false })
		else
			cb({ error = true, code = 1 })
		end
	end)

	exports["strata"]:RegisterServerCallback("EMS:CheckDamage", function(source, data, cb)
		local myChar = Strata.User.Find(source)
		if exports['st_jobs']:HasJob(source, "ems") or exports['st_jobs']:HasJob(source, "police") then
			local tChar = Strata.User.Find(data)
			if tChar ~= nil then
				cb(tChar:GetData("Damage"))
			else
				cb(nil)
			end
		else
			cb(nil)
		end
	end)

	exports["strata"]:RegisterServerCallback("EMS:DrugTest", function(source, data, cb)
		local char = Strata.User.Find(source)
		if char ~= nil then
			local pState = Player(source).state
			if pState.onDuty == "ems" then
				local tarChar = Strata.User.Find(data)
				if tarChar ~= nil then
					local tarStates = tarChar:GetData("DrugStates") or {}
					local output = {}
					for k, v in pairs(tarStates) do
						if v.expires > os.time() then
							local item = exports.st_inventory:ItemsGetData(v.item)
							if item and item.drugState ~= nil then
								local pct = ((v.expires - os.time()) / item.drugState.duration) * 100
								if pct <= 25 and pct >= 5 then
									table.insert(
										output,
										string.format("Low Presence of %s", Config.Drugs[item.drugState.type])
									)
								elseif pct <= 50 then
									table.insert(
										output,
										string.format("Moderate Presence of %s", Config.Drugs[item.drugState.type])
									)
								elseif pct <= 75 then
									table.insert(
										output,
										string.format("High Presence of %s", Config.Drugs[item.drugState.type])
									)
								elseif pct > 5 then
									table.insert(
										output,
										string.format("Very High Presence of %s", Config.Drugs[item.drugState.type])
									)
								end
							end
						end
					end

					if #output > 0 then
						local str = string.format(
							"Drug Test Results For %s %s:<br/><ul>",
							tarChar:GetData("First"),
							tarChar:GetData("Last")
						)
						for k, v in ipairs(output) do
							str = str .. string.format("<li>%s</li>", v)
						end
						str = str .. "</ul>"
						exports["st_chat"]:SendTestResult(source, str)
					else
						exports["st_chat"]:SendTestResult(
							source,
							"Drug Test Results:<br/><ul><li>All Results Are Negative</li></ul>"
						)
					end
				end
			end
		end

		cb(true)
	end)
end

RegisterNetEvent("EMS:Server:Panic", function(isAlpha)
	local src = source
	local char = Strata.User.Find(src)
	local pState = Player(src).state
	if pState.onDuty == "ems" then
		local coords = GetEntityCoords(GetPlayerPed(src))
		exports["strata"]:ClientCallback(src, "EmergencyAlerts:GetStreetName", coords, function(location)
			if isAlpha then
				exports['st_mdt']:EmergencyAlertsCreate(
					"13-A",
					"Medic Down",
					{ "police_alerts", "ems_alerts" },
					location,
					{
						icon = "circle-exclamation",
						details = string.format(
							"%s - %s %s",
							char:GetData("Callsign"),
							char:GetData("First"),
							char:GetData("Last"),
							pState?.onRadio and string.format("Radio Freq: %s", pState.onRadio) or "Not On Radio"
						)
					},
					true,
					{
						icon = 303,
						size = 1.2,
						color = 48,
						duration = (60 * 10),
					},
					2
				)
			else
				exports['st_mdt']:EmergencyAlertsCreate(
					"13-B",
					"Medic Down",
					{ "police_alerts", "ems_alerts" },
					location,
					{
						icon = "circle-exclamation",
						details = string.format(
							"%s - %s %s",
							char:GetData("Callsign"),
							char:GetData("First"),
							char:GetData("Last"),
							pState?.onRadio and string.format("Radio Freq: %s", pState.onRadio) or "Not On Radio"
						)
					},
					false,
					{
						icon = 303,
						size = 0.9,
						color = 48,
						duration = (60 * 10),
					},
					2
				)
			end
		end)
	end
end)
