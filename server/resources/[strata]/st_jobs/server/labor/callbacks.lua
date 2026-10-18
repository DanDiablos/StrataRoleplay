function RegisterCallbacks()
	exports["strata"]:RegisterServerCallback("Labor:GetJobs", function(source, data, cb)
		cb(exports['st_jobs']:GetJobs())
	end)
	exports["strata"]:RegisterServerCallback("Labor:GetGroups", function(source, data, cb)
		cb(exports['st_jobs']:GetGroups())
	end)

	exports["strata"]:RegisterServerCallback("Labor:GetReputations", function(source, data, cb)
		cb(exports['st_chars']:RepView(source))
	end)

	exports["strata"]:RegisterServerCallback("Labor:AcceptRequest", function(source, data, cb)
		if _pendingInvites[data.source] ~= nil then
			local state = exports['st_jobs']:JoinWorkgroup(_pendingInvites[data.source], data.source)

			if state then
				exports['st_phone']:NotificationAdd(
					data.source,
					"Job Activity",
					"You Joined A Workgroup",
					os.time(),
					6000,
					"labor",
					{}
				)
			end

			_pendingInvites[data.source] = nil
			cb(state)
		else
			cb(false)
		end
	end)

	exports["strata"]:RegisterServerCallback("Labor:DeclineRequest", function(source, data, cb)
		if _pendingInvites[data.source] ~= nil then
			_pendingInvites[data.source] = nil

			exports['st_phone']:NotificationAdd(
				data.source,
				"Job Activity",
				"Your Group Request Was Denied",
				os.time(),
				6000,
				"labor",
				{}
			)

			exports['st_phone']:NotificationAdd(
				source,
				"Labor Activity",
				"You Denied A Group Request",
				os.time(),
				6000,
				"labor",
				{}
			)

			cb(true)
		else
			cb(false)
		end
	end)
end
