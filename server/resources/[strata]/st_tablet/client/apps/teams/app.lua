_myTeam = nil

RegisterNetEvent("Tablet:Client:Teams:Set", function(teamData)
	_myTeam = teamData

	exports['st_tablet']:SetData("myGroup", _myTeam)
end)

RegisterNUICallback("GetTeams", function(data, cb)
	exports["strata"]:ServerCallback("Tablet:Teams:Get", {}, cb)
end)

RegisterNUICallback("GetTeamRequests", function(data, cb)
	exports["strata"]:ServerCallback("Tablet:Teams:GetRequests", {}, cb)
end)

RegisterNUICallback("CreateTeam", function(data, cb)
	exports["strata"]:ServerCallback("Tablet:Teams:Create", data, cb)
end)

RegisterNUICallback("InviteTeamMember", function(data, cb)
	exports["strata"]:ServerCallback("Tablet:Teams:Members:Invite", data, cb)
end)

RegisterNUICallback("RemoveTeamMember", function(data, cb)
	exports["strata"]:ServerCallback("Tablet:Teams:Members:Remove", data, cb)
end)

RegisterNUICallback("RequestTeamInvite", function(data, cb)
	exports["strata"]:ServerCallback("Tablet:Teams:RequestInvite", data, cb)
end)

RegisterNUICallback("DeleteTeam", function(data, cb)
	exports["strata"]:ServerCallback("Tablet:Teams:Delete", data, cb)
end)

RegisterNUICallback("TeamRequest", function(data, cb)
	exports["strata"]:ServerCallback("Tablet:Teams:ActionRequest", data, function()
		cb('OK')
	end)
end)

AddEventHandler("Tablet:Client:Teams:RequestNotifAccept", function(data)
	if not data.request then
		return
	end

	exports["strata"]:ServerCallback("Tablet:Teams:ActionRequest", {
		id = data.request,
		action = "accept",
	})
end)

AddEventHandler("Tablet:Client:Teams:RequestNotifDeny", function(data)
	if not data.request then
		return
	end

	exports["strata"]:ServerCallback("Tablet:Teams:ActionRequest", {
		id = data.request,
		action = "deny",
	})
end)
