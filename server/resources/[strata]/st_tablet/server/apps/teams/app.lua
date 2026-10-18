_teams = {}

_teamRequests = {}
_teamRequestIds = 0

exports('TeamsGetAll', function()
    return _teams
end)

exports('TeamsGet', function(id)
    for k, v in ipairs(_teams) do
        if v.ID == id then
            return v
        end
    end
end)

exports('TeamsGetByMember', function(SID)
    for k, v in ipairs(_teams) do
        for _, member in ipairs(v.Members) do
            if member.SID == SID then
                return v, member.Leader
            end
        end
    end

    return false
end)

exports('TeamsGetByMemberSource', function(source)
    for k, v in ipairs(_teams) do
        for _, member in ipairs(v.Members) do
            if member.Source == source then
                return v, member.Leader
            end
        end
    end

    return false
end)

exports('TeamsCreate', function(source, name)
    local char = Strata.User.Find(source)
    if char and not exports['st_tablet']:TeamsGetByMemberSource(source) then
        name = string.gsub(name, '%s+', '')

        for k, v in ipairs(_teams) do
            if v.Name == name then
                return {
                    message = "Name Already Taken"
                }
            end
        end

        local team = {
            State = 0,
            StateName = "Available",
            Name = name,
            ID = source,
            Members = {
                {
                    Leader = true,
                    Source = source,
                    SID = char:GetData("SID"),
                    First = char:GetData("First"),
                    Last = char:GetData("Last"),
                }
            }
        }

        table.insert(_teams, team)

        char:SetData("Team", source)
        TriggerClientEvent("Tablet:Client:Teams:Set", source, team)

        return {
            success = true,
            team = team,
        }
    end
    return false
end)

exports('TeamsDelete', function(id, leaderDropped)
    for k, v in ipairs(_teams) do
        if v.ID == id then
            for _, member in ipairs(v.Members) do
                exports['st_tablet']:AddNotification(
                    member.Source,
                    "Team Deleted",
                    "You are no longer a member of a team as the one you were in was just deleted.",
                    os.time() * 1000,
                    15000,
                    "teams",
                    {},
                    {}
                )

                local char = Strata.User.Find(member.Source)
                if char then
                    char:SetData("Team", nil)
                end

                TriggerClientEvent("Tablet:Client:Teams:Set", member.Source, nil)
            end

            TriggerEvent("Tablet:Server:Teams:Deleted", id)
            table.remove(_teams, k)
            return true
        end
    end

    return false
end)

exports('TeamsSetState', function(team, state, stateName)
    for k, v in ipairs(_teams) do
        if v.ID == team then
            v.State = state
            v.StateName = stateName

            for _, member in ipairs(v.Members) do
                TriggerClientEvent("Tablet:Client:Teams:Set", member.Source, v)
            end

            return true
        end
    end
    return false
end)

exports('TeamsResetState', function(team)
    for k, v in ipairs(_teams) do
        if v.ID == team then
            v.State = 0
            v.StateName = "Available"

            for _, member in ipairs(v.Members) do
                TriggerClientEvent("Tablet:Client:Teams:Set", member.Source, v)
            end

            return true
        end
    end
    return false
end)

exports('TeamsMembersAdd', function(source, team)
    local char = Strata.User.Find(source)

    if char then
        for k, v in ipairs(_teams) do
            if v.ID == team then
                if #v.Members < 5 then
                    local data = {
                        Leader = false,
                        Source = source,
                        SID = char:GetData("SID"),
                        First = char:GetData("First"),
                        Last = char:GetData("Last"),
                    }

                    table.insert(v.Members, data)
                    char:SetData("Team", team)

                    for _, member in ipairs(v.Members) do
                        TriggerClientEvent("Tablet:Client:Teams:Set", member.Source, v)
                    end

                    TriggerEvent("Tablet:Server:Teams:MemberAdded", v.ID, data)
                    return true
                end

                break
            end
        end
    end

    return false
end)

exports('TeamsMembersRemove', function(source, teamId, wasRemoved)
    if not teamId then
        local team = exports['st_tablet']:TeamsGetByMemberSource(source)

        teamId = team?.ID
    end

    if teamId then
        local removed = false
        local leader = false
        local info = nil

        for k, v in ipairs(_teams) do
            if v.ID == teamId then
                for i, j in ipairs(v.Members) do
                    if j.Source == source then
                        info = j
                        leader = j.Leader
                        table.remove(v.Members, i)
                        break
                    end
                end

                for _, member in ipairs(v.Members) do
                    TriggerClientEvent("Tablet:Client:Teams:Set", member.Source, v)

                    exports['st_tablet']:AddNotification(
                        member.Source,
                        wasRemoved and "Team Member Removed" or "Team Member Left",
                        string.format("%s %s is no longer in your team.", info.First, info.Last),
                        os.time() * 1000,
                        10000,
                        "teams",
                        {},
                        {}
                    )
                end

                if leader then
                    exports['st_tablet']:TeamsDelete(teamId, true)
                else
                    TriggerEvent("Tablet:Server:Teams:MemberRemoved", v.ID, info)
                end

                local char = Strata.User.Find(source)
                if char then
                    char:SetData("Team", false)
                end

                TriggerClientEvent("Tablet:Client:Teams:Set", source, nil)

                break
            end
        end
    end
end)

exports('TeamsMembersSendEvent', function(team, event, ...)
    for k, v in ipairs(_teams) do
        if v.ID == team then
            for _, member in ipairs(v.Members) do
                TriggerClientEvent(event, member.Source, ...)
            end

            break
        end
    end
end)

exports('TeamsMembersNotification', function(team, title, description, time, duration, app, actions, notifData)
    for k, v in ipairs(_teams) do
        if v.ID == team then
            for _, member in ipairs(v.Members) do
                exports['st_tablet']:AddNotification(member.Source, title, description, time, duration, app, actions,
                    notifData)
            end

            break
        end
    end
end)

exports('TeamsMembersNotificationAddWithId',
    function(team, id, title, description, time, duration, app, actions, notifData)
        for k, v in ipairs(_teams) do
            if v.ID == team then
                for _, member in ipairs(v.Members) do
                    exports['st_tablet']:AddNotificationWithId(member.Source, id, title, description, time, duration,
                        apctions,
                        notifData)
                end

                break
            end
        end
    end)

exports('TeamsMembersNotificationUpdate', function(team, id, title, description, skipSound)
    for k, v in ipairs(_teams) do
        if v.ID == team then
            for _, member in ipairs(v.Members) do
                exports['st_tablet']:UpdateNotification(member.Source, id, title, description, skipSound)
            end

            break
        end
    end
end)

exports('TeamsMembersNotificationRemoveById', function(team, id)
    for k, v in ipairs(_teams) do
        if v.ID == team then
            for _, member in ipairs(v.Members) do
                exports['st_tablet']:RemoveNotificationById(member.Source, id)
            end

            break
        end
    end
end)

exports('TeamsRequestsAdd', function(target, isTeam, event, label, description, data, time)
    if not time then
        time = 60 * 5
    end

    local id = _teamRequestIds + 1

    table.insert(_teamRequests, {
        id = id,
        time = os.time(),
        expires = os.time() + time,
        owner = target,
        team = isTeam,
        event = event,
        label = label,
        description = description,
        data = data or {}
    })

    return id
end)

exports('TeamsRequestsClear', function(id)
    for k, v in ipairs(_teamRequests) do
        if v.id == id then
            table.remove(_teamRequests, k)
        end
    end
end)

exports('TeamsRequestsGet', function(source)
    local char = Strata.User.Find(source)
    local r = {}

    if char then
        local team, leader = exports['st_tablet']:TeamsGetByMember(char:GetData("SID"))
        if team then
            for k, v in ipairs(_teamRequests) do
                if v.team and v.owner == team.ID then
                    table.insert(r, v)
                end
            end
        else
            for k, v in ipairs(_teamRequests) do
                if not v.team and v.owner == char:GetData("SID") then
                    table.insert(r, v)
                end
            end
        end
    end

    return r
end)

AddEventHandler("Tablet:Server:RegisterCallbacks", function()
    exports["strata"]:RegisterServerCallback("Tablet:Teams:Get", function(source, data, cb)
        cb(exports['st_tablet']:TeamsGetAll())
    end)

    exports["strata"]:RegisterServerCallback("Tablet:Teams:GetRequests", function(source, data, cb)
        cb(exports['st_tablet']:TeamsRequestsGet(source))
    end)

    exports["strata"]:RegisterServerCallback("Tablet:Teams:Create", function(source, data, cb)
        cb(exports['st_tablet']:TeamsCreate(source, data.Name))
    end)

    exports["strata"]:RegisterServerCallback("Tablet:Teams:Delete", function(source, data, cb)
        local char = Strata.User.Find(source)
        if char then
            local team, leader = exports['st_tablet']:TeamsGetByMemberSource(source)

            if team and leader and team.State == 0 then
                cb(exports['st_tablet']:TeamsDelete(team.ID))
            else
                cb(false)
            end
        else
            cb(false)
        end
    end)

    exports["strata"]:RegisterServerCallback("Tablet:Teams:Members:Invite", function(source, data, cb)
        local char = Strata.User.Find(source)
        local target = Strata.User.BySID(data?.SID)
        if char and target then
            local myTeam = exports['st_tablet']:TeamsGetByMember(char:GetData("SID"))

            if target:GetData("Team") or not myTeam or myTeam?.State ~= 0 then
                cb(false)
                return
            end

            for k, v in ipairs(_teamRequests) do
                if v.owner == target:GetData("SID") and v.data.invite and v.data.team == myTeam.ID then
                    cb(false)
                    return
                end
            end

            local req = exports['st_tablet']:TeamsRequestsAdd(
                target:GetData("SID"),
                false,
                "Tablet:Server:Teams:Invite",
                "New Team Invite",
                string.format("To Join %s", myTeam.Name),
                {
                    invite = true,
                    team = myTeam.ID,
                },
                60 * 2 -- 2 Minutes
            )

            exports['st_tablet']:AddNotification(target:GetData("Source"), "New Invitation",
                string.format("You have been invited to team: %s", myTeam.Name), os.time() * 1000, 10000, "teams", {
                    accept = "Tablet:Client:Teams:RequestNotifAccept",
                    cancel = "Tablet:Client:Teams:RequestNotifDeny",
                }, {
                    request = req,
                })

            cb({ success = true })
        else
            cb(false)
        end
    end)

    exports["strata"]:RegisterServerCallback("Tablet:Teams:Members:Remove", function(source, data, cb)
        local char = Strata.User.Find(source)
        if char and data?.SID and data?.Source then
            if data.SID == char:GetData("SID") then -- Leaving Group
                local team = exports['st_tablet']:TeamsGetByMemberSource(char:GetData("Source"))
                exports['st_tablet']:TeamsMembersRemove(char:GetData("Source"), team.ID)

                cb(true)
            else -- Kicking From Group
                local team = exports['st_tablet']:TeamsGetByMember(data.SID)

                if team and team.State == 0 and team.ID == char:GetData("Source") then -- Is Leader
                    exports['st_tablet']:TeamsMembersRemove(data.Source, team.ID, true)

                    cb(true)
                else
                    cb(false)
                end
            end
        else
            cb(false)
        end
    end)

    exports["strata"]:RegisterServerCallback("Tablet:Teams:ActionRequest", function(source, data, cb)
        local char = Strata.User.Find(source)
        if char and data.id then
            local team, leader = exports['st_tablet']:TeamsGetByMember(char:GetData("SID"))

            for k, v in ipairs(_teamRequests) do
                if v.id == data.id and ((not v.team and v.owner == char:GetData("SID")) or (v.team and team and v.owner == team.ID and leader)) then
                    TriggerEvent(v.event, source, v.data, data.action, data.id)

                    exports['st_tablet']:TeamsRequestsClear(data.id)
                    break
                end
            end
        end

        cb()
    end)

    exports["strata"]:RegisterServerCallback("Tablet:Teams:RequestInvite", function(source, data, cb)
        local char = Strata.User.Find(source)
        if char and data and not char:GetData("Team") then
            local team = exports['st_tablet']:TeamsGet(data)

            if team and team.State == 0 then
                for k, v in ipairs(_teamRequests) do
                    if v.owner == team.ID and v.data.request and v.data.team == team.ID then
                        cb(false)
                        return
                    end
                end

                local req = exports['st_tablet']:TeamsRequestsAdd(
                    team.ID,
                    true,
                    "Tablet:Server:Teams:InviteRequest",
                    "New Join Request",
                    string.format("Request to join your team from %s %s (%s).", char:GetData("First"),
                        char:GetData("Last"), char:GetData("SID")),
                    {
                        request = true,
                        team = team.ID,
                        joiner = source,
                    },
                    60 * 2 -- 2 Minutes
                )

                exports['st_tablet']:AddNotification(team.ID, "New Join Request",
                    string.format("%s %s (%s) requested to join your team.", char:GetData("First"), char:GetData("Last"),
                        char:GetData("SID")), os.time() * 1000, 10000, "teams", {
                        accept = "Tablet:Client:Teams:RequestNotifAccept",
                        cancel = "Tablet:Client:Teams:RequestNotifDeny",
                    }, {
                        request = req,
                    })

                cb(true)
            else
                cb(false)
            end
        else
            cb(false)
        end
    end)

    StartTeamsThread()
end)

local started = false
function StartTeamsThread()
    if started then return; end
    started = true

    CreateThread(function()
        while true do
            Wait(60 * 1000 * 0.5)

            for k, v in ipairs(_teamRequests) do
                if v.expires <= os.time() then
                    table.remove(_teamRequests, k)
                end
            end
        end
    end)
end

AddEventHandler("Characters:Server:PlayerLoggedOut", function(source, cData)
    exports['st_tablet']:TeamsMembersRemove(source)
end)

AddEventHandler("Characters:Server:PlayerDropped", function(source, cData)
    exports['st_tablet']:TeamsMembersRemove(source)
end)

AddEventHandler("Tablet:Server:Teams:Invite", function(source, data, action)
    if action == "accept" then
        exports['st_tablet']:TeamsMembersAdd(source, data.team)
    end
end)

AddEventHandler("Tablet:Server:Teams:InviteRequest", function(source, data, action)
    if action == "accept" then
        exports['st_tablet']:TeamsMembersAdd(data.joiner, data.team)
    end
end)
