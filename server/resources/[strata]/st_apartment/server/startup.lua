-- ────────────────────────────────────────────────────────────────────────────
-- Data tables (globals, accessible across all server scripts)
-- ────────────────────────────────────────────────────────────────────────────
_aptData            = {}  -- [aptId]      → room config
_aptDataByRoomId    = {}  -- [roomId str] → room config
_availableApartments = {} -- list of unassigned aptIds
_assignedApartments  = {} -- [aptId]      → { characterSID }
_apartmentAssignments = {} -- [characterSID] → aptId
_doorIds            = {}  -- [roomId str] → st_doors DB row id

-- ────────────────────────────────────────────────────────────────────────────

function Startup()
	-- Build _aptData from shared config
	local aptIds = {}
	for i, room in ipairs(Config.Rooms) do
		room.id      = i
		-- Expose building exit coords on the room so client Exit() can use p.coords/p.heading
		room.coords  = vector3(Config.Building.exit.x, Config.Building.exit.y, Config.Building.exit.z)
		room.heading = Config.Building.exit.h

		_aptData[i]                 = room
		_aptDataByRoomId[room.roomId] = room
		table.insert(aptIds, i)

		GlobalState[string.format("Apartment:%s", i)] = room
		table.insert(_availableApartments, i)

		-- Register per-apartment stash with st_inventory
		exports.st_inventory:RegisterStash(
			string.format("apartment_%s", i),
			string.format("La Puerta %s", room.label),
			50,
			100000,
			true
		)
	end

	GlobalState["Apartments"] = aptIds

	-- Initialize physical doors in st_doors DB then load DB assignments
	InitializeDoors(function()
		LoadApartmentAssignments()
	end)
end

-- ────────────────────────────────────────────────────────────────────────────
-- Door initialization
-- Ensures every room has a corresponding row in st_doors.
-- Caches the row id in _doorIds[roomId] for fast later access.
-- ────────────────────────────────────────────────────────────────────────────
function InitializeDoors(cb)
	CreateThread(function()
		for i, room in ipairs(_aptData) do
			local existing = MySQL.single.await(
				'SELECT `id` FROM `doors` WHERE `name` = @name',
				{ ["@name"] = room.roomId }
			)

			if existing then
				_doorIds[room.roomId] = existing.id
			else
				local data = json.encode({
					name        = room.roomId,
					coords      = { x = room.door.x, y = room.door.y, z = room.door.z },
					heading     = room.door.heading,
					model       = Config.DoorModel,
					state       = 1,    -- locked by default
					auto        = true, -- auto-lock/unlock on proximity
					maxDistance = 2.5,
					lockSound   = "button-remote",
					doorRate    = 1.0,
					characters  = {},
					groups      = {},
				})
				local insertId = MySQL.insert.await(
					'INSERT INTO `doors` (`name`, `data`) VALUES (@name, @data)',
					{ ["@name"] = room.roomId, ["@data"] = data }
				)
				_doorIds[room.roomId] = insertId
				TriggerEvent('st_doors:reloadDoor', insertId)
			end
		end

		Strata.Log.Info("Apartments", string.format("Initialized %d apartment doors.", #_aptData))
		if cb then cb() end
	end)
end

-- ────────────────────────────────────────────────────────────────────────────
-- DB assignment loading
-- Reads all characters with Apartment > 0 and rebuilds caches.
-- ────────────────────────────────────────────────────────────────────────────
function LoadApartmentAssignments()
	local rows = MySQL.query.await(
		'SELECT `SID`, `Apartment` FROM `characters` WHERE `Apartment` > 0 AND `Deleted` = 0',
		{}
	)

	if not rows then return end

	for _, row in ipairs(rows) do
		local aptId = row.Apartment
		local sid   = row.SID

		if aptId > 0 and _aptData[aptId] then
			_assignedApartments[aptId]   = { characterSID = sid }
			_apartmentAssignments[sid]   = aptId

			-- Remove from available list
			for k, v in ipairs(_availableApartments) do
				if v == aptId then
					table.remove(_availableApartments, k)
					break
				end
			end
		end
	end

	UpdateAvailableApartments()
	Strata.Log.Info("Apartments", string.format(
		"%d apartments assigned, %d available.",
		#rows, #_availableApartments
	))
end

-- ────────────────────────────────────────────────────────────────────────────
-- Helpers
-- ────────────────────────────────────────────────────────────────────────────
function GetRandomAvailableApartment()
	if #_availableApartments == 0 then return nil end
	return _availableApartments[math.random(#_availableApartments)]
end

function UpdateAvailableApartments()
	GlobalState["Apartments:Available"] = #_availableApartments
end

function AssignApartment(aptId, characterSID)
	-- Update DB
	MySQL.update.await(
		'UPDATE `characters` SET `Apartment` = @apt WHERE `SID` = @sid',
		{ ["@apt"] = aptId, ["@sid"] = characterSID }
	)

	-- Update caches
	_assignedApartments[aptId]          = { characterSID = characterSID }
	_apartmentAssignments[characterSID] = aptId

	for k, v in ipairs(_availableApartments) do
		if v == aptId then
			table.remove(_availableApartments, k)
			break
		end
	end

	UpdateAvailableApartments()
end

function ReleaseApartmentAssignment(aptId)
	local assignment = _assignedApartments[aptId]
	if not assignment then return end

	local sid = assignment.characterSID

	-- Reset character apartment field
	MySQL.update.await(
		'UPDATE `characters` SET `Apartment` = 0 WHERE `SID` = @sid',
		{ ["@sid"] = sid }
	)

	-- Clear door access for this character
	RemoveCharacterDoorAccess(sid, aptId)

	-- Remove caches
	_apartmentAssignments[sid]  = nil
	_assignedApartments[aptId]  = nil
	table.insert(_availableApartments, aptId)

	UpdateAvailableApartments()
end
