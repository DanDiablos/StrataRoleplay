function FetchCharacterJobsFromDB(stateId)
    local p = promise.new()

    MySQL.Async.fetchAll('SELECT Jobs FROM characters WHERE SID = @stateId', {
        ['@stateId'] = stateId
    }, function(results)
        if results and #results > 0 then
            local jobs = results[1].Jobs
            local jobsdecode = json.decode(jobs) or {}
            p:resolve(jobsdecode)
        else
            p:resolve(false)
        end
    end)

    local res = Citizen.Await(p)
    return res
end

function RegisterJobChatCommands()
    exports["st_chat"]:RegisterAdminCommand('givejob', function(source, args, rawCommand)
        local target, jobId, gradeId, workplaceId = table.unpack(args)
        target = math.tointeger(target)
        if not workplaceId then workplaceId = false; end

        if target and jobId and gradeId then
            local jobExists = exports['st_jobs']:DoesExist(jobId, workplaceId, gradeId)
            if jobExists then
                local success = exports['st_jobs']:GiveJob(target, jobId, workplaceId, gradeId)
                if success then
                    if jobExists.Workplace then
                        exports["st_chat"]:SendSystemSingle(source,
                            string.format('Gave State ID: %s Job: %s - %s - %s', target, jobExists.Name,
                                jobExists.Workplace.Name, jobExists.Grade.Name))
                    else
                        exports["st_chat"]:SendSystemSingle(source,
                            string.format('Gave State ID: %s Job: %s - %s', target, jobExists.Name, jobExists.Grade.Name))
                    end
                else
                    exports["st_chat"]:SendSystemSingle(source,
                        'Error Giving Job - Maybe that State ID Doesn\'t Exist')
                end
            else
                exports["st_chat"]:SendSystemSingle(source, 'Job Doesn\'t Exist')
            end
            return
        else
            exports["st_chat"]:SendSystemSingle(source, 'Invalid Arguments')
        end
    end, {
        help = 'Give Player a Job',
        params = {
            { name = 'State ID',     help = 'Character State ID' },
            { name = 'Job ID',       help = 'Job (e.g. police)' },
            { name = 'Grade ID',     help = 'Grade (e.g. chief)' },
            { name = 'Workplace ID', help = 'Workplace (e.g lspd)' },
        }
    }, -1)

    exports["st_chat"]:RegisterAdminCommand('removejob', function(source, args, rawCommand)
        local target, jobId = math.tointeger(args[1]), args[2]
        local success = exports['st_jobs']:RemoveJob(target, jobId)
        if success then
            exports["st_chat"]:SendSystemSingle(source, 'Successfully Removed Job From State ID:' .. target)
        else
            exports["st_chat"]:SendSystemSingle(source,
                'Error Removing Job - State ID Doesn\'t Exist or Maybe They Don\'t that Job')
        end
    end, {
        help = 'Remove A Job From a Character',
        params = {
            { name = 'State ID', help = 'Character State ID' },
            { name = 'Job ID',   help = 'Job ID (e.g. Police)' },
        }
    }, 2)

    exports["st_chat"]:RegisterAdminCommand('setowner', function(source, args, rawCommand)
        local jobId, target = table.unpack(args)
        target = math.tointeger(target)

        if target and jobId then
            local jobExists = exports['st_jobs']:Get(jobId)
            if jobExists and jobExists.Type == 'Company' then
                local success = exports['st_jobs']:ManagementEdit(jobId, {
                    Owner = target
                })
                if success then
                    exports["st_chat"]:SendSystemSingle(source,
                        string.format('Set Owner of %s (%s) to State ID %s', jobExists.Name, jobExists.Id, target))
                else
                    exports["st_chat"]:SendSystemSingle(source, 'Error Setting Job Owner')
                end
            else
                exports["st_chat"]:SendSystemSingle(source, 'Job Doesn\'t Exist or Isn\'t a Company')
            end
        else
            exports["st_chat"]:SendSystemSingle(source, 'Invalid Job or State ID')
        end
    end, {
        help = 'Sets the Owner of a Company',
        params = {
            { name = 'Job ID',   help = 'Job (e.g. burgershot)' },
            { name = 'State ID', help = 'Owner\'s State ID' },
        }
    }, 2)

    exports["st_chat"]:RegisterAdminCommand('onduty', function(source, args, rawCommand)
        exports['st_jobs']:DutyOn(source, args[1])
    end, {
        help = 'Go On Duty',
        params = {
            { name = 'Job ID', help = 'The Job You Want to Go On Duty As' },
        }
    }, 1)

    exports["st_chat"]:RegisterAdminCommand('offduty', function(source, args, rawCommand)
        exports['st_jobs']:DutyOff(source)
    end, {
        help = 'Go Off Duty'
    })

    exports["st_chat"]:RegisterAdminCommand('checkjobs', function(source, args, rawCommand)
        local target = math.tointeger(args[1])
        local char
        if not args[1] then
            char = Strata.User.Find(source)
        else
            char = Strata.User.BySID(target)
        end

        local charJobs = false

        if char then
            stateId = char:GetData('SID')
            charJobs = char:GetData('Jobs') or {}
        elseif target and target > 0 then
            stateId = target
            charJobs = FetchCharacterJobsFromDB(target)
        end

        if charJobs then
            if #charJobs > 0 then
                for k, v in ipairs(charJobs) do
                    if v.Workplace then
                        exports["st_chat"]:SendSystemSingle(source,
                            string.format('State ID: %s - Job #%s: %s - %s - %s', stateId, k, v.Name, v.Workplace.Name,
                                v.Grade.Name))
                    else
                        exports["st_chat"]:SendSystemSingle(source,
                            string.format('State ID: %s - Job #%s: %s - %s', stateId, k, v.Name, v.Grade.Name))
                    end
                end
            else
                exports["st_chat"]:SendSystemSingle(source, string.format('State ID: %s -  Has No Jobs', stateId))
            end
        else
            exports["st_chat"]:SendSystemSingle(source, 'Invalid State ID')
        end
    end, {
        help = 'Shows the Jobs a Character Has',
        params = {
            { name = 'State ID', help = 'Optional - Character State ID' },
        }
    }, -1)

    exports["st_chat"]:RegisterAdminCommand('dutycount', function(source, args, rawCommand)
        local jobId = args[1]
        local jobExists = exports['st_jobs']:Get(jobId)
        if jobExists then
            local dutyData = exports['st_jobs']:DutyGetDutyData(jobId)
            exports["st_chat"]:SendSystemSingle(source,
                string.format('Job: %s -  %s On Duty', jobExists.Name, dutyData?.Count or 0))
        end
    end, {
        help = 'Shows how many are on duty for specific job',
        params = {
            { name = 'Job ID', help = 'The Job' },
        }
    }, 1)

    exports["st_chat"]:RegisterAdminCommand('dutytest', function(source, args, rawCommand)
        local jobId = args[1]
        local jobExists = exports['st_jobs']:Get(jobId)
        if jobExists then
            exports["st_chat"]:SendSystemSingle(source,
                string.format('Before Job: %s -  %s On Duty', jobExists.Name,
                    GlobalState[string.format('Duty:%s', jobId)]))
            exports['st_jobs']:DutyRefreshDutyData(jobId)
            exports["st_chat"]:SendSystemSingle(source,
                string.format('After Job: %s -  %s On Duty', jobExists.Name, GlobalState
                    [string.format('Duty:%s', jobId)]))
        end
    end, {
        help = 'Test',
        params = {
            { name = 'Job ID', help = 'The Job' },
        }
    }, 1)

    exports["st_chat"]:RegisterAdminCommand('changejobname', function(source, args, rawCommand)
        local jobId = args[1]
        local jobExists = exports['st_jobs']:Get(jobId)
        if jobExists and args[2] then
            exports['st_jobs']:ManagementEdit(jobId, {
                Name = args[2]
            })
            exports["st_chat"]:SendSystemSingle(source,
                string.format('Changed Name to %s (Id: %s)', args[2], jobExists.Id))
        end
    end, {
        help = 'Change the Name of the Job',
        params = {
            { name = 'Job ID',   help = 'The Job' },
            { name = 'New Name', help = 'New Name' },
        }
    }, 2)
end
