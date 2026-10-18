---@type table<integer, { floors: table<integer, { locked: boolean }> }>
local _cache = {}

-- ── Helpers ───────────────────────────────────────────────────────────────────

---@param source number
---@param rules  ElevatorPermission[]|any
---@return boolean
local function CheckPermissions(source, rules)
	if type(rules) ~= "table" then return true end

	local char = Strata.User.Find(source)
	if not char then return false end

	local sid = char:GetData("SID")

	for _, rule in ipairs(rules) do
		if rule.type == "character" then
			if sid == rule.SID then return true end
		elseif rule.type == "job" then
			if rule.job and exports['st_jobs']:HasJob(source, rule.job, rule.workplace, rule.grade, rule.gradeLevel, rule.reqDuty, rule.jobPermission) then
				return true
			elseif rule.jobPermission and exports['st_jobs']:HasPermission(source, rule.jobPermission) then
				return true
			end
		elseif rule.type == "propertyData" then
			if exports['st_housing']:HasAccessWithData(source, rule.key, rule.value) then
				return true
			end
		end
	end

	return false
end

---@param elevatorId integer
---@param floorId    integer
---@param state?     boolean  -- nil = toggle
---@return boolean|nil        -- new state, or nil if invalid
local function SetFloorLock(elevatorId, floorId, state)
	if not Elevators[elevatorId] or not _cache[elevatorId] then return nil end

	local floorCache = _cache[elevatorId].floors[floorId]
	if not floorCache then return nil end

	local newState = state ~= nil and state or (not floorCache.locked)
	if newState == floorCache.locked then return newState end

	floorCache.locked = newState
	TriggerClientEvent("Elevators:UpdateFloor", -1, elevatorId, floorId, newState)
	return newState
end

-- ── Init ──────────────────────────────────────────────────────────────────────

local function BuildCache()
	for i, elevator in ipairs(Elevators) do
		_cache[i] = { floors = {} }
		for floorId, floor in pairs(elevator.floors) do
			_cache[i].floors[floorId] = { locked = floor.defaultLocked or false }
		end
	end
	Strata.Log.Trace("Elevators", ("Loaded ^2%d^7 elevators"):format(#Elevators))
end

local function RegisterCallbacks()
	exports["strata"]:RegisterServerCallback("Elevators:Fetch", function(source, data, cb)
		cb(_cache)
	end)

	exports["strata"]:RegisterServerCallback("Elevators:ToggleLock", function(source, data, cb)
		local elevator = Elevators[data.elevatorId]
		if not elevator then cb(false) return end

		if not CheckPermissions(source, elevator.canLock) then
			cb(false)
			return
		end

		local newState = SetFloorLock(data.elevatorId, data.floorId)
		cb(newState ~= nil, newState)
	end)

	exports["strata"]:RegisterServerCallback("Elevators:Validate", function(source, data, cb)
		exports['st_utils']:TempPosIgnore(source)
		cb()
	end)
end

-- ── Exports ───────────────────────────────────────────────────────────────────

exports("SetFloorLock", SetFloorLock)

-- ── Bootstrap ─────────────────────────────────────────────────────────────────

AddEventHandler("onResourceStart", function(resource)
	if resource ~= GetCurrentResourceName() then return end
	BuildCache()
	RegisterCallbacks()
end)
