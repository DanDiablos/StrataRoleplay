AddEventHandler("Phone:Server:RegisterMiddleware", function()
	exports['strata']:MiddlewareAdd("Phone:Spawning", function(source, char)
		return {
			{
				type = "jobs",
				data = exports['st_jobs']:GetJobs(),
			},
			{
				type = "workGroups",
				data = exports['st_jobs']:GetGroups(),
			},
		}
	end)
end)

AddEventHandler("Phone:Server:RegisterCallbacks", function()
	exports["strata"]:RegisterServerCallback("Phone:Labor:CreateWorkgroup", function(source, data, cb)
		local char = Strata.User.Find(source)
		local myDuty = Player(source).state.onDuty

		if myDuty and (myDuty == "police" or myDuty == "ems") then
			Strata.Log.Trace(
				"Labor",
				string.format(
					"%s %s (%s) Attempted To Create Workgroup (%s)",
					char:GetData("First"),
					char:GetData("Last"),
					char:GetData("SID"),
					myDuty
				)
			)
			-- DropPlayer(
			-- 	source,
			-- 	string.format("%s", "Double dipping jobs is not allowed. Don't do it again - instead, go off duty.")
			-- )
			exports['st_ui']:Notification(source, "error",
				'Double dipping jobs is not allowed. Instead, go off duty.')
			cb(false)
		else
			if char:GetData("ICU") ~= nil and not char:GetData("ICU").Released then
				cb(false)
			else
				cb(exports['st_jobs']:CreateWorkgroup(source))
			end
		end
	end)

	exports["strata"]:RegisterServerCallback("Phone:Labor:DisbandWorkgroup", function(source, data, cb)
		local char = Strata.User.Find(source)
		if char:GetData("ICU") ~= nil and not char:GetData("ICU").Released then
			cb(false)
		else
			cb(exports['st_jobs']:DisbandWorkgroup(source, true))
		end
	end)

	exports["strata"]:RegisterServerCallback("Phone:Labor:JoinWorkgroup", function(source, data, cb)
		local char = Strata.User.Find(source)
		local myDuty = Player(source).state.onDuty
		if myDuty and (myDuty == "police" or myDuty == "ems") then
			Strata.Log.Trace(
				"Labor",
				string.format(
					"%s %s (%s) Attempted To Join Workgroup (%s)",
					char:GetData("First"),
					char:GetData("Last"),
					char:GetData("SID"),
					myDuty
				)
			)
			-- DropPlayer(
			-- 	source,
			-- 	string.format("%s", "Double dipping jobs is not allowed. Don't do it again - instead, go off duty.")
			-- )
			exports['st_ui']:Notification(source, "error",
				'Double dipping jobs is not allowed. Instead, go off duty.')
			cb(false)
		else
			if char:GetData("ICU") ~= nil and not char:GetData("ICU").Released then
				cb(false)
			else
				cb(exports['st_jobs']:RequestWorkgroup(data, source))
			end
		end
	end)

	exports["strata"]:RegisterServerCallback("Phone:Labor:LeaveWorkgroup", function(source, data, cb)
		local char = Strata.User.Find(source)
		if char:GetData("ICU") ~= nil and not char:GetData("ICU").Released then
			cb(false)
		else
			cb(exports['st_jobs']:LeaveWorkgroup(data, source))
		end
	end)

	exports["strata"]:RegisterServerCallback("Phone:Labor:StartLaborJob", function(source, data, cb)
		local char = Strata.User.Find(source)
		local myDuty = Player(source).state.onDuty
		if myDuty and (myDuty == "police" or myDuty == "ems") then
			Strata.Log.Trace(
				"Labor",
				string.format(
					"%s %s (%s) Attempted To Double Dip Jobs (%s and %s)",
					char:GetData("First"),
					char:GetData("Last"),
					char:GetData("SID"),
					myDuty,
					data.job
				)
			)
			-- DropPlayer(
			-- 	source,
			-- 	string.format("%s", "Double dipping jobs is not allowed. Don't do it again - instead, go off duty.")
			-- )
			exports['st_ui']:Notification(source, "error",
				'Double dipping jobs is not allowed. Instead, go off duty.')
			cb(false)
		else
			if char:GetData("ICU") ~= nil and not char:GetData("ICU").Released then
				cb(false)
			else
				cb(exports['st_jobs']:OnDuty(data.job, source, data.isWorkgroup))
			end
		end
	end)

	exports["strata"]:RegisterServerCallback("Phone:Labor:QuitLaborJob", function(source, data, cb)
		local char = Strata.User.Find(source)
		if char:GetData("ICU") ~= nil and not char:GetData("ICU").Released then
			cb(false)
		else
			cb(exports['st_jobs']:OffDuty(data.job or data, source))
		end
	end)
end)
