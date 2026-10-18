local bizWizJobs = {}

function CheckBusinessPermissions(source, permission)
	local onDuty = exports['st_jobs']:DutyGet(source)
	if onDuty and onDuty.Id and bizWizJobs[onDuty.Id] then
		if (not permission) or exports['st_jobs']:HasPermissionInJob(source, onDuty.Id, permission) then
			return onDuty.Id
		end
	end
	return false
end

AddEventHandler('Job:Server:DutyAdd', function(dutyData, source)
	local job = exports['st_jobs']:HasJob(source, dutyData.Id)
	if job then
		local hasConfig = _bizWizConfig[job.Id]
		local bizWiz = exports['st_jobs']:DataGet(job.Id, "bizWiz")

		if hasConfig then
			bizWiz = hasConfig.type
		end

		if job and bizWiz and _bizWizTypes[bizWiz] then
			local bizWizLogo = exports['st_jobs']:DataGet(job.Id, "bizWizLogo")

			if not bizWizLogo and hasConfig then
				bizWizLogo = hasConfig.logo
			end

			bizWizJobs[job.Id] = true

			exports['st_tablet']:UpdateJobData(source)
			TriggerClientEvent("Tablet:Client:BizWiz:Login", source, bizWizLogo or "https://i.imgur.com/ORHSuSM.png",
				_bizWizTypes[bizWiz], GetBusinessNotices(job.Id))
		end
	end
end)

AddEventHandler('Job:Server:DutyRemove', function(dutyData, source, SID)
	if bizWizJobs[dutyData.Id] then
		TriggerClientEvent("Tablet:Client:BizWiz:Logout", source)
	end
end)

function GetBusinessNotices(job)
	local notices = {}
	for k, v in ipairs(_businessNotices) do
		if v.job == job then
			table.insert(notices, v)
		end
	end

	return notices
end

AddEventHandler("Tablet:Server:RegisterCallbacks", function()
	exports["strata"]:RegisterServerCallback("Tablet:BizWiz:EmployeeSearch", function(source, data, cb)
		local job = CheckBusinessPermissions(source)
		if job then
			local query = [[
                SELECT SID, First, Last, Jobs
                FROM characters
                WHERE (First LIKE @term OR Last LIKE @term OR SID LIKE @term)
                LIMIT 4
            ]]
			local params = {
				['@term'] = '%' .. (data.term or '') .. '%'
			}

			MySQL.Async.fetchAll(query, params, function(results)
				if not results then
					cb({})
					return
				end

				local filteredResults = {}
				for _, v in ipairs(results) do
					local jobs = json.decode(v.Jobs)
					for _, j in ipairs(jobs) do
						if j.Id == job then
							table.insert(filteredResults, {
								SID = v.SID,
								First = v.First,
								Last = v.Last
							})
							break
						end
					end
				end

				cb(filteredResults)
			end)
		else
			cb(false)
		end
	end)

	exports["strata"]:RegisterServerCallback("Tablet:BizWiz:GetTwitterProfile", function(source, data, cb)
		local job = CheckBusinessPermissions(source, "JOB_MANAGEMENT")
		if job then
			cb({
				success = true,
				pfp = exports['st_jobs']:DataGet(job, "TwitterAvatar")
			})
		else
			cb(false)
		end
	end)

	exports["strata"]:RegisterServerCallback("Tablet:BizWiz:SetTwitterProfile", function(source, data, cb)
		local job = CheckBusinessPermissions(source, "JOB_MANAGEMENT")
		if job then
			local success = exports['st_jobs']:DataSet(job, "TwitterAvatar", data.profile)
			if success then
				cb(data.profile)
			else
				cb(false)
			end
		else
			cb(false)
		end
	end)

	exports["strata"]:RegisterServerCallback("Tablet:BizWiz:SendTweet", function(source, data, cb)
		local job = CheckBusinessPermissions(source, "TABLET_TWEET")
		if job then
			local jobData = exports['st_jobs']:Get(job)
			local avatar = exports['st_jobs']:DataGet(job, "TwitterAvatar")

			exports['st_phone']:TwitterPost(
				-1,
				-1,
				{
					name = jobData.Name,
					picture = avatar,
				},
				data.content,
				data.image,
				false,
				"business"
			)

			cb(true)
		else
			cb(false)
		end
	end)

	exports["st_chat"]:RegisterAdminCommand("bizwizset", function(source, args, rawCommand)
		local setting = args[2]
		if setting == "false" then
			setting = false
		end

		local res = exports['st_jobs']:DataSet(args[1], "bizWiz", setting)

		if res?.success then
			exports["st_chat"]:SendSystemSingle(source, "Success")
		else
			exports["st_chat"]:SendSystemSingle(source, "Failed")
		end
	end, {
		help = "[Admin] Grant a Business Access to BizWiz App",
		params = {
			{
				name = "Job ID",
				help = "Job ID",
			},
			{
				name = "BizWiz Type",
				help = "e.g. default, mechanic (false to remove)",
			},
		}
	}, 2)

	exports["st_chat"]:RegisterAdminCommand("bizwizlogo", function(source, args, rawCommand)
		local setting = args[2]
		if setting == "false" then
			setting = false
		end

		local res = exports['st_jobs']:DataSet(args[1], "bizWizLogo", setting)

		if res?.success then
			exports["st_chat"]:SendSystemSingle(source, "Success")
		else
			exports["st_chat"]:SendSystemSingle(source, "Failed")
		end
	end, {
		help = "[Admin] Set BizWiz Logo",
		params = {
			{
				name = "Job ID",
				help = "Job ID",
			},
			{
				name = "BizWiz Logo Link (imgur)",
				help = "(false to remove)",
			},
		}
	}, 2)

	exports["strata"]:RegisterServerCallback("Tablet:BizWiz:ViewVehicleFleet", function(source, data, cb)
		local job = CheckBusinessPermissions(source, "FLEET_MANAGEMENT")
		if job then
			exports['st_veh']:OwnedGetAll(nil, 1, job, function(vehicles)
				for k, v in ipairs(vehicles) do
					if v.Storage then
						if v.Storage.Type == 0 then
							v.Storage.Name = exports['st_veh']:GaragesImpound().name
						elseif v.Storage.Type == 1 then
							v.Storage.Name = exports['st_veh']:GaragesGet(v.Storage.Id).name
						elseif v.Storage.Type == 2 then
							local prop = exports['st_housing']:Get(v.Storage.Id)
							v.Storage.Name = prop?.label
						end
					end
				end

				cb(vehicles)
			end)
		else
			cb(false)
		end
	end)

	exports["strata"]:RegisterServerCallback("Tablet:BizWiz:TrackFleetVehicle", function(source, data, cb)
		local job = CheckBusinessPermissions(source, "FLEET_MANAGEMENT")
		if job then
			cb(exports['st_veh']:OwnedTrack(data.vehicle))
		else
			cb(false)
		end
	end)
end)
