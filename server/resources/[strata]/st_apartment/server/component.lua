_requests  = {}  -- [targetSID] → list of requestor info
_requestors = {} -- [source]    → targetSID they are requesting entry to

AddEventHandler('onResourceStart', function(resource)
	if resource == GetCurrentResourceName() then
		Wait(1000)
		RegisterCallbacks()
		RegisterMiddleware()
		Startup()
	end
end)

-- ────────────────────────────────────────────────────────────────────────────
-- Door access helpers (st_doors via direct DB + reload)
-- ────────────────────────────────────────────────────────────────────────────

function EnsureCharacterDoorAccess(characterSID, aptId)
	local room   = _aptData[aptId]
	if not room then return end

	local doorId = _doorIds[room.roomId]
	if not doorId then return end

	CreateThread(function()
		local row = MySQL.single.await(
			'SELECT `data` FROM `doors` WHERE `id` = @id',
			{ ["@id"] = doorId }
		)
		if not row then return end

		local data       = json.decode(row.data)
		data.characters  = data.characters or {}

		-- Add SID if not already present
		for _, sid in ipairs(data.characters) do
			if sid == characterSID then return end
		end
		table.insert(data.characters, characterSID)

		MySQL.update.await(
			'UPDATE `doors` SET `data` = @data WHERE `id` = @id',
			{ ["@data"] = json.encode(data), ["@id"] = doorId }
		)
		TriggerEvent('st_doors:reloadDoor', doorId)
	end)
end

function RemoveCharacterDoorAccess(characterSID, aptId)
	local room   = _aptData[aptId]
	if not room then return end

	local doorId = _doorIds[room.roomId]
	if not doorId then return end

	CreateThread(function()
		local row = MySQL.single.await(
			'SELECT `data` FROM `doors` WHERE `id` = @id',
			{ ["@id"] = doorId }
		)
		if not row then return end

		local data      = json.decode(row.data)
		data.characters = data.characters or {}

		local newChars = {}
		for _, sid in ipairs(data.characters) do
			if sid ~= characterSID then
				table.insert(newChars, sid)
			end
		end
		data.characters = newChars

		MySQL.update.await(
			'UPDATE `doors` SET `data` = @data WHERE `id` = @id',
			{ ["@data"] = json.encode(data), ["@id"] = doorId }
		)
		TriggerEvent('st_doors:reloadDoor', doorId)
	end)
end

function SetDoorState(aptId, state)
	local room = _aptData[aptId]
	if not room then return end

	local doorId = _doorIds[room.roomId]
	if not doorId then return end

	CreateThread(function()
		local row = MySQL.single.await(
			'SELECT `data` FROM `doors` WHERE `id` = @id',
			{ ["@id"] = doorId }
		)
		if not row then return end

		local data  = json.decode(row.data)
		data.state  = state  -- 1 = locked, 0 = unlocked

		MySQL.update.await(
			'UPDATE `doors` SET `data` = @data WHERE `id` = @id',
			{ ["@data"] = json.encode(data), ["@id"] = doorId }
		)
		TriggerEvent('st_doors:reloadDoor', doorId)
	end)
end

-- ────────────────────────────────────────────────────────────────────────────
-- Raid helpers
-- ────────────────────────────────────────────────────────────────────────────

function StartApartmentRaid(aptId)
	SetDoorState(aptId, 0)  -- unlock door
	GlobalState[string.format("Apartment:Raid:%s", aptId)] = true
	TriggerClientEvent("Apartment:Client:RaidStarted", -1, aptId)
end

function EndApartmentRaid(aptId)
	SetDoorState(aptId, 1)  -- relock door
	GlobalState[string.format("Apartment:Raid:%s", aptId)] = nil
	TriggerClientEvent("Apartment:Client:RaidEnded", -1, aptId)
end

-- ────────────────────────────────────────────────────────────────────────────
-- Core exports
-- ────────────────────────────────────────────────────────────────────────────

exports("Enter", function(source, aptId, targetSID, wakeUp)
	local resolvedSID = targetSID

	-- -1 means enter own apartment
	if resolvedSID == -1 then
		local char    = Strata.User.Find(source)
		resolvedSID   = char:GetData("SID")
	end

	-- Check authorization: own apartment, approved visitor, or active breach
	local authorized = false

	local char = Strata.User.Find(source)
	if char and char:GetData("SID") == resolvedSID then
		authorized = true
	end

	if not authorized and _requestors[source] ~= nil then
		local reqs = _requests[_requestors[source]] or {}
		for _, req in ipairs(reqs) do
			if req.source == source then
				authorized = true
				break
			end
		end
	end

	if not authorized then
		if exports['st_police']:IsInBreach(source, "apartment", resolvedSID) then
			authorized = true
		end
	end

	if not authorized then return false end

	Player(source).state.inApartment = { type = aptId, id = resolvedSID }
	exports['st_utils']:TempPosIgnore(source)
	GlobalState[string.format("%s:", source)] = resolvedSID

	-- Store entry location for anticheat / position tracking
	local apt = GlobalState[string.format("Apartment:%s", aptId)]
	if apt then
		Player(source).state.tpLocation = {
			x = apt.interior.entry.x,
			y = apt.interior.entry.y,
			z = apt.interior.entry.z,
		}
	end

	TriggerClientEvent("Apartment:Client:InnerStuff", source, aptId, resolvedSID, wakeUp)

	return aptId
end)

exports("Exit", function(source)
	GlobalState[string.format("%s:", source)] = nil
	exports['st_utils']:TempPosIgnore(source)
	exports['st_utils']:TeleportIgnore(source)
	Player(source).state.inApartment = nil
	Player(source).state.tpLocation  = nil
	return true
end)

exports("GetInteriorLocation", function(aptId)
	local apt = GlobalState[string.format("Apartment:%s", aptId)]
	if apt and apt.interior and apt.interior.entry then
		return apt.interior.entry
	end
	return nil
end)

exports("ClientEnter", function(source, aptId, target, wakeUp)
	exports['st_utils']:TeleportIgnore(source)
	TriggerClientEvent("Apartment:Client:Enter", source, aptId, target, wakeUp)
end)

exports("RequestsGet", function(source)
	local sid = GlobalState[string.format("%s:", source)]
	if sid then return _requests[sid] or {} end
	return {}
end)

exports("RequestsCreate", function(source, targetSID, inZone)
	if source == targetSID then return end

	local char  = Strata.User.Find(source)
	local tChar = Strata.User.BySID(targetSID)

	if tChar and tChar:GetData("Apartment") then
		_requests[targetSID]  = _requests[targetSID] or {}
		_requestors[source]   = targetSID

		for _, req in ipairs(_requests[targetSID]) do
			if req.source == source then return end
		end

		table.insert(_requests[targetSID], {
			source = source,
			SID    = char:GetData("SID"),
			First  = char:GetData("First"),
			Last   = char:GetData("Last"),
		})
	end
end)
