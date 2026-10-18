AddEventHandler('onClientResourceStart', function(resource)
	if resource == GetCurrentResourceName() then
		Wait(1000)
		TriggerEvent("Labor:Client:Setup")
	end
end)

function PedFaceCoord(pPed, pCoords)
	TaskTurnPedToFaceCoord(pPed, pCoords.x, pCoords.y, pCoords.z)

	Wait(100)

	while GetScriptTaskStatus(pPed, 0x574bb8f5) == 1 do
		Wait(0)
	end
end

AddEventHandler("Labor:Client:AcceptRequest", function(data)
	exports["strata"]:ServerCallback("Labor:AcceptRequest", data)
end)

AddEventHandler("Labor:Client:DeclineRequest", function(data)
	exports["strata"]:ServerCallback("Labor:DeclineRequest", data)
end)

exports('GetJobs', function()
	local p = promise.new()
	exports["strata"]:ServerCallback("Labor:GetJobs", {}, function(jobs)
		p:resolve(jobs)
	end)
	return Citizen.Await(p)
end)

exports('GetGroups', function()
	local p = promise.new()
	exports["strata"]:ServerCallback("Labor:GetGroups", {}, function(groups)
		p:resolve(groups)
	end)
	return Citizen.Await(p)
end)

exports('GetReputations', function()
	local p = promise.new()
	exports["strata"]:ServerCallback("Labor:GetReputations", {}, function(jobs)
		p:resolve(jobs)
	end)
	return Citizen.Await(p)
end)
