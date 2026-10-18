local trackerJobs = {
	police = true,
	ems = true,
	prison = true
}

function RegisterEACallbacks()
	exports["strata"]:RegisterServerCallback("EmergencyAlerts:DisablePDTracker", function(source, target, cb)
		local char = Strata.User.Find(source)
		if char then
			local tState = Player(target).state
			local targetChar = Strata.User.Find(target)
			if targetChar and tState and trackerJobs[tState.onDuty] and not tState.trackerDisabled then
				tState.trackerDisabled = true
				exports['st_mdt']:EmergencyAlertsDisableTracker(target, true)


				local coords = GetEntityCoords(GetPlayerPed(target))
				exports["strata"]:ClientCallback(target, "EmergencyAlerts:GetStreetName", coords,
					function(location)
						local radioFreq = "Unknown Radio Frequency"
						if tState?.onRadio then
							radioFreq = string.format("Radio Freq: %s", tState.onRadio)
						else
							radioFreq = "Not On Radio"
						end


						if tState.onDuty == "police" then
							exports['st_mdt']:EmergencyAlertsCreate("13-C", "Officer Tracker Disabled",
								"police_alerts", location, {
									icon = "circle-exclamation",
									details = string.format(
										"%s - %s %s | %s",
										targetChar:GetData("Callsign") or "UNKN",
										targetChar:GetData("First"),
										targetChar:GetData("Last"),
										radioFreq
									)
								}, false, {
									icon = 303,
									size = 1.2,
									color = 26,
									duration = (60 * 10),
								}, 1)
						elseif tState.onDuty == "prison" then
							exports['st_mdt']:EmergencyAlertsCreate("13-C", "DOC Officer Tracker Disabled",
								{ "police_alerts", "doc_alerts" },
								location, {
									icon = "circle-exclamation",
									details = string.format(
										"%s - %s %s | %s",
										targetChar:GetData("Callsign") or "UNKN",
										targetChar:GetData("First"),
										targetChar:GetData("Last"),
										radioFreq
									)
								}, false, {
									icon = 303,
									size = 1.2,
									color = 26,
									duration = (60 * 10),
								}, 1)
						elseif tState.onDuty == "ems" then
							exports['st_mdt']:EmergencyAlertsCreate("13-C", "Medic Tracker Disabled",
								{ "police_alerts", "ems_alerts" },
								location, {
									icon = "circle-exclamation",
									details = string.format(
										"%s - %s %s | %s",
										targetChar:GetData("Callsign") or "UNKN",
										targetChar:GetData("First"),
										targetChar:GetData("Last"),
										radioFreq
									)
								}, false, {
									icon = 303,
									size = 1.2,
									color = 48,
									duration = (60 * 10),
								}, 2)
						end
					end)

				exports['st_ui']:Notification("info", target, "Your Tracker Has Been Disabled")
				cb(true)
				return
			end
		end
		cb(false)
	end)

	-- PD re-enabling their own tracker
	exports["strata"]:RegisterServerCallback("EmergencyAlerts:EnablePDTracker", function(source, target, cb)
		local char = Strata.User.Find(source)
		local pState = Player(source).state
		if char and trackerJobs[pState.onDuty] and pState.trackerDisabled then
			pState.trackerDisabled = false
			exports['st_mdt']:EmergencyAlertsDisableTracker(source, false)

			local job = Player(source).state.onDuty

			exports['st_jobs']:DutyOff(source, false, true)
			Wait(250)
			exports['st_jobs']:DutyOn(source, job, true)

			cb(true)
		else
			cb(false)
		end
	end)
end
