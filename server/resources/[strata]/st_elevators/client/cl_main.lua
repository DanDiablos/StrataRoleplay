---@type table<integer, ElevatorConfig>|nil
local _state = nil

-- ── Permissions ───────────────────────────────────────────────────────────────

---@param rules ElevatorPermission[]|any
---@return boolean
local function CheckPermissions(rules)
	if type(rules) ~= "table" then return true end

	local char = LocalPlayer.state.Character
	if not char then return false end

	local sid = char:GetData("SID")

	for _, rule in ipairs(rules) do
		if rule.type == "character" then
			if sid == rule.SID then return true end
		elseif rule.type == "job" then
			if rule.job and exports['st_jobs']:HasJob(rule.job, rule.workplace, rule.grade, rule.gradeLevel, rule.reqDuty, rule.jobPermission) then
				return true
			elseif rule.jobPermission and exports['st_jobs']:HasPermission(rule.jobPermission) then
				return true
			end
		end
	end

	return false
end

-- ── Zones ─────────────────────────────────────────────────────────────────────

---@param zone       ElevatorZone
---@param elevatorId integer
---@param floorId    integer
---@param zoneIndex  integer
local function CreateZone(zone, elevatorId, floorId, zoneIndex)
	exports['st_target']:addBoxZone({
		id       = ("elevator_%d_floor_%d_%d"):format(elevatorId, floorId, zoneIndex),
		coords   = zone.center,
		size     = vector3(zone.length, zone.width, 2.0),
		rotation = zone.heading,
		minZ     = zone.minZ,
		maxZ     = zone.maxZ,
		options  = {
			{
				icon     = "elevator",
				label    = "Use Elevator",
				distance = 3.0,
				canInteract = function()
					local char = LocalPlayer.state.Character
					local icu  = char and char:GetData("ICU")
					return not LocalPlayer.state.isCuffed
						and (not icu or icu.Released)
				end,
				onSelect = function()
					TriggerEvent("Elevators:Open", elevatorId, floorId)
				end,
			},
		},
	})
end

local function CreateZones()
	for elevatorId, elevator in ipairs(_state) do
		for floorId, floor in pairs(elevator.floors) do
			-- #zone > 0 means it's an array of zones; otherwise it's a single zone table
			if #floor.zone > 0 then
				for i, zone in ipairs(floor.zone) do
					CreateZone(zone, elevatorId, floorId, i)
				end
			else
				CreateZone(floor.zone, elevatorId, floorId, 1)
			end
		end
	end
end

-- ── Open elevator menu ────────────────────────────────────────────────────────

AddEventHandler("Elevators:Open", function(elevatorId, currentFloor)
	if not _state or not LocalPlayer.state.loggedIn then return end

	local elevator = _state[elevatorId]
	if not elevator then return end

	local canLock = CheckPermissions(elevator.canLock)
	local items   = {}

	for floorId, floor in pairs(elevator.floors) do
		local disabled    = floorId == currentFloor
		local description = disabled and "You are currently on this level" or nil

		if floor.locked and not disabled then
			if not CheckPermissions(floor.bypassLock) and not canLock then
				disabled    = true
				description = "Authorized Access Only"
			end
		end

		items[#items + 1] = {
			level       = floorId,
			label       = floor.name,
			disabled    = disabled,
			description = description,
			event       = "Elevators:Use",
			data        = { elevatorId = elevatorId, floorId = floorId },
			submenu     = canLock and ("lock_%d_%d"):format(elevatorId, floorId) or false,
		}
	end

	table.sort(items, function(a, b) return a.level < b.level end)

	local menu = { main = { label = elevator.name, items = items } }

	if canLock then
		for floorId, floor in pairs(elevator.floors) do
			menu[("lock_%d_%d"):format(elevatorId, floorId)] = {
				label = floor.name,
				items = {
					{
						label    = "Visit Floor",
						disabled = floorId == currentFloor,
						description = floorId == currentFloor and "You are currently on this level" or nil,
						event    = "Elevators:Use",
						data     = { elevatorId = elevatorId, floorId = floorId },
					},
					{
						label = floor.locked and "Unlock Floor" or "Lock Floor",
						event = "Elevators:ToggleLock",
						data  = { elevatorId = elevatorId, floorId = floorId },
					},
				},
			}
		end
	end

	exports['st_ui']:ListMenuShow(menu)
end)

-- ── Use elevator ──────────────────────────────────────────────────────────────

AddEventHandler("Elevators:Use", function(data)
	if not _state or not LocalPlayer.state.loggedIn then return end

	local elevator = _state[data.elevatorId]
	local floor    = elevator and elevator.floors[data.floorId]
	if not floor or not floor.coords then return end

	exports["strata"]:ServerCallback("Elevators:Validate", {}, function()
		exports['st_ui']:ProgressWithTickEvent({
			name           = "elevator_ride",
			duration       = 2000,
			label          = "Awaiting Elevator",
			useWhileDead   = false,
			canCancel      = true,
			ignoreModifier = true,
			tickrate       = 100,
			controlDisables = {
				disableMovement    = true,
				disableCarMovement = false,
				disableMouse       = false,
				disableCombat      = true,
			},
		}, function()
			if LocalPlayer.state.isCuffed then
				exports['st_ui']:ProgressCancel()
			end
		end, function(cancelled)
			if cancelled then return end

			local c = floor.coords
			DoScreenFadeOut(500)
			while not IsScreenFadedOut() do Wait(10) end

			SetEntityCoords(cache.ped, c.x, c.y, c.z, false, false, false, false)
			SetEntityHeading(cache.ped, c.w)
			exports["st_sound"]:PlayDistance(5.0, "elevator-bell.ogg", 0.4)

			Wait(250)
			DoScreenFadeIn(500)
		end)
	end)
end)

-- ── Lock / unlock ─────────────────────────────────────────────────────────────

AddEventHandler("Elevators:ToggleLock", function(data)
	if not _state or not LocalPlayer.state.loggedIn then return end

	exports["strata"]:ServerCallback("Elevators:ToggleLock", data, function(success, newState)
		if not success then return end
		exports["st_ui"]:Notification(newState and "error" or "success",
			newState and "Floor Locked" or "Floor Unlocked")
	end)
end)

-- ── Server sync ───────────────────────────────────────────────────────────────

RegisterNetEvent("Elevators:UpdateFloor", function(elevatorId, floorId, locked)
	if not _state or not _state[elevatorId] then return end
	local floor = _state[elevatorId].floors[floorId]
	if floor then floor.locked = locked end
end)

-- ── Init ──────────────────────────────────────────────────────────────────────
-- Wait for the player to fully spawn before fetching elevator state.
-- Fetching during character select fires a latent event that collides with the
-- character select callbacks (GetServerData / GetCharacters) and causes
-- SendNetPacket multi-thread errors that drop one of the responses.

RegisterNetEvent("Characters:Client:Spawned", function()
	exports["strata"]:ServerCallback("Elevators:Fetch", {}, function(serverCache)
		_state = {}
		for i, elevator in ipairs(Elevators) do
			_state[i] = elevator
			for floorId, floor in pairs(elevator.floors) do
				local cached = serverCache[i] and serverCache[i].floors[floorId]
				floor.locked = cached and cached.locked or false
			end
		end
		CreateZones()
	end)
end)
