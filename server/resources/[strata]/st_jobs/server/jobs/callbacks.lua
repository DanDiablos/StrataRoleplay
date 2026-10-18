function RegisterJobCallbacks()
	exports["strata"]:RegisterServerCallback("Jobs:OnDuty", function(source, jobId, cb)
		cb(exports['st_jobs']:DutyOn(source, jobId))
	end)

	exports["strata"]:RegisterServerCallback("Jobs:OffDuty", function(source, jobId, cb)
		cb(exports['st_jobs']:DutyOff(source, jobId))
	end)
	exports["strata"]:RegisterServerCallback("MetalDetector:Server:Sync", function(source, data, cb)
		TriggerClientEvent("MetalDetector:Client:Sync", -1, data)
		cb(true)
	end)
end
