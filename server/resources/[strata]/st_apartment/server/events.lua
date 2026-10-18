-- Clean up visitor request list when a player leaves the building entrance zone
RegisterNetEvent("Apartment:Server:LeavePoly", function()
	local src = source
	if _requestors[src] then
		local targetSID = _requestors[src]
		if _requests[targetSID] then
			for k, req in ipairs(_requests[targetSID]) do
				if req.source == src then
					table.remove(_requests[targetSID], k)
					break
				end
			end
		end
		_requestors[src] = nil
	end
end)

-- Sync shower steam particles to nearby players
RegisterNetEvent("Apartment:Server:ShowerSync", function(aptId, toggle)
	local src = source
	TriggerClientEvent("Apartment:Client:ShowerSync", -1, aptId, toggle)
end)

-- Release apartment when a character is deleted
AddEventHandler("Characters:Server:CharacterDeleted", function(sid)
	local aptId = _apartmentAssignments[sid]
	if aptId then
		ReleaseApartmentAssignment(aptId)
		Strata.Log.Info("Apartments", string.format(
			"Released apartment %d from deleted character %s.", aptId, sid
		))
	end
end)

-- Cleanup when a player logs out
AddEventHandler("Characters:Server:PlayerLoggedOut", function(source, cData)
	-- Clear GlobalState apartment tracking for this source
	if GlobalState[string.format("%s:", source)] ~= nil then
		GlobalState[string.format("%s:", source)] = nil
	end

	-- Clear apartment state
	if Player(source).state.inApartment then
		Player(source).state.inApartment = nil
		Player(source).state.tpLocation  = nil
	end

	-- Remove from visitor request lists
	if _requestors[source] then
		local targetSID = _requestors[source]
		if _requests[targetSID] then
			for k, req in ipairs(_requests[targetSID]) do
				if req.source == source then
					table.remove(_requests[targetSID], k)
					break
				end
			end
		end
		_requestors[source] = nil
	end
end)
