function RequestNetSync(method, entity, ...)
	TriggerServerEvent(
		"NetSync:Server:Request",
		GetInvokingResource(),
		GetPlayerServerId(NetworkGetEntityOwner(entity)),
		method,
		NetworkGetNetworkIdFromEntity(entity),
		...
	)
end

RegisterNetEvent("NetSync:Client:Execute", function(method, netId, ...)
	local entity = NetworkGetEntityFromNetworkId(netId)

	if DoesEntityExist(entity) then
		if method == "DeleteVehicle" then
			exports["strata"]:DeleteVehicle(entity)
		elseif method == "DeletePed" then
			exports["strata"]:DeletePed(entity)
		elseif method == "DeleteObject" then
			exports["strata"]:DeleteObject(entity)
		elseif method == "DeleteEntity" then
			exports["strata"]:DeleteEntity(entity)
		elseif method == "SetVehicleTyreBurst" then
			exports["strata"]:SetVehicleTyreBurst(entity, ...)
		elseif method == "SetVehicleDoorShut" then
			exports["strata"]:SetVehicleDoorShut(entity, ...)
		elseif method == "SetVehicleDoorOpen" then
			exports["strata"]:SetVehicleDoorOpen(entity, ...)
		elseif method == "SetVehicleDoorBroken" then
			exports["strata"]:SetVehicleDoorBroken(entity, ...)
		elseif method == "SetVehicleTyreFixed" then
			exports["strata"]:SetVehicleTyreFixed(entity, ...)
		elseif method == "SetVehicleEngineHealth" then
			exports["strata"]:SetVehicleEngineHealth(entity, ...)
		elseif method == "SetVehicleBodyHealth" then
			exports["strata"]:SetVehicleBodyHealth(entity, ...)
		elseif method == "SetVehicleDeformationFixed" then
			exports["strata"]:SetVehicleDeformationFixed(entity)
		elseif method == "SetVehicleFixed" then
			exports["strata"]:SetVehicleFixed(entity)
		elseif method == "NetworkExplodeVehicle" then
			exports["strata"]:NetworkExplodeVehicle(entity, ...)
		elseif method == "TaskWanderInArea" then
			exports["strata"]:TaskWanderInArea(entity, ...)
		elseif method == "TaskFollowNavMeshToCoord" then
			exports["strata"]:TaskFollowNavMeshToCoord(entity, ...)
		elseif method == "TaskGoToCoordAnyMeans" then
			exports["strata"]:TaskGoToCoordAnyMeans(entity, ...)
		elseif method == "SetEntityAsNoLongerNeeded" then
			exports["strata"]:SetEntityAsNoLongerNeeded(entity)
		elseif method == "SetPedKeepTask" then
			exports["strata"]:SetPedKeepTask(entity, ...)
		end
	end
end)

exports("DeleteVehicle", function(vehicle)
	if NetworkHasControlOfEntity(vehicle) then
		DeleteVehicle(vehicle)
	else
		RequestNetSync("DeleteVehicle", vehicle)
	end
end)

exports("DeletePed", function(ped)
	if NetworkHasControlOfEntity(ped) then
		DeletePed(ped)
	else
		RequestNetSync("DeletePed", ped)
	end
end)

exports("DeleteObject", function(object)
	if NetworkHasControlOfEntity(object) then
		DeleteObject(object)
	else
		RequestNetSync("DeleteObject", object)
	end
end)

exports("DeleteEntity", function(entity)
	if NetworkHasControlOfEntity(entity) then
		DeleteEntity(entity)
	else
		RequestNetSync("DeleteEntity", entity)
	end
end)

exports("SetVehicleTyreBurst", function(vehicle, index, onRim, dmg)
	if NetworkHasControlOfEntity(vehicle) then
		SetVehicleTyreBurst(vehicle, index, onRim, dmg)
	else
		RequestNetSync("SetVehicleTyreBurst", vehicle, index, onRim, dmg)
	end
end)

exports("SetVehicleDoorShut", function(vehicle, doorIndex, closeInstantly)
	if NetworkHasControlOfEntity(vehicle) then
		SetVehicleDoorShut(vehicle, doorIndex, closeInstantly)
	else
		RequestNetSync("SetVehicleDoorShut", vehicle, doorIndex, closeInstantly)
	end
end)

exports("SetVehicleDoorOpen", function(vehicle, doorIndex, loose, openInstantly)
	if NetworkHasControlOfEntity(vehicle) then
		SetVehicleDoorOpen(vehicle, doorIndex, loose, openInstantly)
	else
		RequestNetSync("SetVehicleDoorOpen", vehicle, doorIndex, loose, openInstantly)
	end
end)

exports("SetVehicleDoorBroken", function(vehicle, doorIndex, deleteDoor)
	if NetworkHasControlOfEntity(vehicle) then
		SetVehicleDoorBroken(vehicle, doorIndex, deleteDoor)
	else
		RequestNetSync("SetVehicleDoorBroken", vehicle, doorIndex, deleteDoor)
	end
end)

exports("SetVehicleTyreFixed", function(vehicle, wheelIndex)
	if NetworkHasControlOfEntity(vehicle) then
		SetVehicleTyreFixed(vehicle, wheelIndex)
	else
		RequestNetSync("SetVehicleTyreFixed", vehicle, wheelIndex)
	end
end)

exports("SetVehicleEngineHealth", function(vehicle, health)
	if NetworkHasControlOfEntity(vehicle) then
		SetVehicleEngineHealth(vehicle, health * 1.0)
	else
		RequestNetSync("SetVehicleEngineHealth", vehicle, health * 1.0)
	end
end)

exports("SetVehicleBodyHealth", function(vehicle, health)
	if NetworkHasControlOfEntity(vehicle) then
		SetVehicleBodyHealth(vehicle, health * 1.0)
	else
		RequestNetSync("SetVehicleBodyHealth", vehicle, health * 1.0)
	end
end)

exports("SetVehicleDeformationFixed", function(vehicle)
	if NetworkHasControlOfEntity(vehicle) then
		SetVehicleDeformationFixed(vehicle)
	else
		RequestNetSync("SetVehicleDeformationFixed", vehicle)
	end
end)

exports("SetVehicleFixed", function(vehicle)
	if NetworkHasControlOfEntity(vehicle) then
		SetVehicleFixed(vehicle)
	else
		RequestNetSync("SetVehicleFixed", vehicle)
	end
end)

exports("NetworkExplodeVehicle", function(vehicle, isAudible, isInvisible)
	if NetworkHasControlOfEntity(vehicle) then
		NetworkExplodeVehicle(vehicle, isAudible, isInvisible, 0)
	else
		RequestNetSync("NetworkExplodeVehicle", vehicle, isAudible, isInvisible, 0)
	end
end)

exports("TaskWanderInArea", function(ped, x, y, z, radius, minimalLength, timeBetweenWalks)
	if NetworkHasControlOfEntity(ped) then
		ClearPedTasksImmediately(ped)
		TaskWanderInArea(ped, x, y, z, radius, minimalLength, timeBetweenWalks)
	else
		RequestNetSync("TaskWanderInArea", ped, x, y, z, radius, minimalLength, timeBetweenWalks)
	end
end)

exports("TaskFollowNavMeshToCoord", function(ped, x, y, z, speed, timeout, stoppingRange, persistFollowing, unk)
	if NetworkHasControlOfEntity(ped) then
		ClearPedTasksImmediately(ped)
		TaskFollowNavMeshToCoord(ped, x, y, z, speed, timeout, stoppingRange, persistFollowing, unk)
	else
		RequestNetSync("TaskFollowNavMeshToCoord", ped, x, y, z, speed, timeout, stoppingRange, persistFollowing, unk)
	end
end)

exports("TaskGoToCoordAnyMeans", function(ped, x, y, z, speed, p5, p6, walkingStyle, p8)
	if NetworkHasControlOfEntity(ped) then
		ClearPedTasksImmediately(ped)
		TaskGoToCoordAnyMeans(ped, x, y, z, speed, p5, p6, walkingStyle, p8)
	else
		RequestNetSync("TaskGoToCoordAnyMeans", ped, x, y, z, speed, p5, p6, walkingStyle, p8)
	end
end)

exports("SetEntityAsNoLongerNeeded", function(ped)
	if NetworkHasControlOfEntity(ped) then
		SetEntityAsNoLongerNeeded(ped)
	else
		RequestNetSync("SetEntityAsNoLongerNeeded", ped)
	end
end)

exports("SetPedKeepTask", function(ped, state)
	if NetworkHasControlOfEntity(ped) then
		SetPedKeepTask(ped, state)
	else
		RequestNetSync("SetPedKeepTask", ped, state)
	end
end)
