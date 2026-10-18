RegisterNetEvent("Phone:Client:Labor:NotifyEnd", function(time)
	exports['st_phone']:NotificationAdd("Job Activity", "You finished a job", time, 6000, "labor", {}, nil)
end)

RegisterNUICallback("GetLaborDetails", function(data, cb)
	cb({
		jobs = exports['st_jobs']:GetJobs(),
		groups = exports['st_jobs']:GetGroups(),
		reputations = exports['st_jobs']:GetReputations(),
	})
end)

RegisterNUICallback("CreateWorkgroup", function(data, cb)
	exports["strata"]:ServerCallback("Phone:Labor:CreateWorkgroup", data, cb)
end)

RegisterNUICallback("JoinWorkgroup", function(data, cb)
	exports["strata"]:ServerCallback("Phone:Labor:JoinWorkgroup", data, cb)
end)

RegisterNUICallback("DisbandWorkgroup", function(data, cb)
	exports["strata"]:ServerCallback("Phone:Labor:DisbandWorkgroup", data, cb)
end)

RegisterNUICallback("LeaveWorkgroup", function(data, cb)
	exports["strata"]:ServerCallback("Phone:Labor:LeaveWorkgroup", data, cb)
end)

RegisterNUICallback("StartLaborJob", function(data, cb)
	exports["strata"]:ServerCallback("Phone:Labor:StartLaborJob", data, cb)
end)

RegisterNUICallback("QuitLaborJob", function(data, cb)
	exports["strata"]:ServerCallback("Phone:Labor:QuitLaborJob", data, cb)
end)
