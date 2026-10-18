local _JOB = "Prison"

local _joiners = {}
local _Prisoners = {}

AddEventHandler("Labor:Server:Startup", function()
	exports['strata']:WaitListCreate("prison", "individual_time", {
		event = "Labor:Server:Prison:Queue",
		delay = 30000,
	})

	exports["strata"]:RegisterServerCallback("Prison:Action", function(source, data, cb)
		if _joiners[source] ~= nil and _Prisoners[_joiners[source]] ~= nil then
			local char = Strata.User.Find(source)
			if
				exports['st_jobs']:UpdateOffer(_joiners[source], _JOB, 1, true, {
					title = "Prison Labor",
					label = "Prison",
					icon = "link",
					color = "transparent",
				})
			then
				_Prisoners[_joiners[source]].state = 0
				exports['st_finance']:WalletModify(source, 150)
				exports['st_jobs']:SendWorkgroupEvent(
					_joiners[source],
					string.format("Prison:Client:%s:Cleanup", _joiners[source])
				)
				exports['st_jobs']:TaskOffer(_joiners[source], _JOB, "Wait For Work", {
					title = "Prison Labor",
					label = "Prison",
					icon = "link",
					color = "transparent",
				})

				if not exports['st_jail']:IsReleaseEligible(source) then
					local char = Strata.User.Find(source)
					local jailed = char:GetData("Jailed")
					jailed.Release = jailed.Release - _Prisoners[_joiners[source]].nodes.timeReduce
					char:SetData("Jailed", jailed)
					exports['st_ui']:Notification(source, "info",
						string.format(
							"Your Sentence Has Been Reduced By %s Months",
							math.ceil(_Prisoners[_joiners[source]].nodes.timeReduce / 60)
						)
					)
				end

				exports['strata']:WaitListInteractInactive("prison", _joiners[source])
			end
			cb(false)
		end
	end)

	exports["strata"]:RegisterServerCallback("Prison:TurnIn", function(source, data, cb)
		if _joiners[source] ~= nil and _Prisoners[_joiners[source]].tasks >= 3 then
			local char = Strata.User.Find(source)
			if char:GetData("TempJob") == _JOB then
				exports['st_jobs']:ManualFinishOffer(_joiners[source], _JOB)
				cb(true)
			else
				exports['st_ui']:Notification(source, "error", "Unable To Finish Job")
				cb(false)
			end
		else
			exports['st_ui']:Notification(source, "error", "You've Not Completed All Routes")
			cb(false)
		end
	end)
end)

AddEventHandler("Labor:Server:Prison:Queue", function(source, data)
	if _joiners[source] ~= nil and _Prisoners[_joiners[source]] ~= nil and _Prisoners[_joiners[source]].state == 0 then
		local f = math.random(#_prisonJobs)

		while f == _Prisoners[_joiners[source]].jobIndex do
			f = math.random(#_prisonJobs)
			Wait(1)
		end

		_Prisoners[_joiners[source]].state = 1
		_Prisoners[_joiners[source]].jobIndex = f
		_Prisoners[_joiners[source]].nodes = deepcopy(_prisonJobs[f])

		exports['st_jobs']:SendWorkgroupEvent(
			_joiners[source],
			string.format("Prison:Client:%s:Receive", _joiners[source]),
			_Prisoners[_joiners[source]].nodes
		)
		exports['st_jobs']:StartOffer(
			_joiners[source],
			_JOB,
			_Prisoners[_joiners[source]].nodes.action,
			#_Prisoners[_joiners[source]].nodes.locations,
			{
				title = "Prison Labor",
				label = "Prison",
				icon = "link",
				color = "transparent",
			}
		)
	end
end)

AddEventHandler("Prison:Server:OnDuty", function(joiner, members, isWorkgroup)
	_joiners[joiner] = joiner

	_Prisoners[joiner] = {
		joiner = joiner,
		isWorkgroup = false,
		started = os.time(),
		state = 0,
	}

	local char = Strata.User.Find(joiner)
	char:SetData("TempJob", _JOB)

	TriggerClientEvent("Prison:Client:OnDuty", joiner, joiner, os.time())
	exports['st_jobs']:TaskOffer(joiner, _JOB, "Wait For Work", {
		title = "Prison Labor",
		label = "Prison",
		icon = "link",
		color = "transparent",
	})

	exports['strata']:WaitListInteractAdd("prison", joiner, {
		joiner = joiner,
	})
end)

AddEventHandler("Prison:Server:OffDuty", function(source, joiner)
	_joiners[source] = nil
	TriggerClientEvent("Prison:Client:OffDuty", source)
	exports['strata']:WaitListInteractRemove("prison", source)
end)

AddEventHandler("Prison:Server:FinishJob", function(joiner)
	_Prisoners[joiner] = nil
end)
