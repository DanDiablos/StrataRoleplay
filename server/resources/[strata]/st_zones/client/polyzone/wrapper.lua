local _characterLoaded = false
local _zones           = {}  ---@type table<string, table>
local _combo           = nil
local _debug           = false

-- ── Helpers ───────────────────────────────────────────────────────────────────

---@param id   string
---@param data table
---@return table
local function BuildZone(id, data)
	local options    = data.options or {}
	options.name     = id
	options.data     = type(data.data) == "table" and data.data or {}
	options.data.id  = id

	if data.type == "circle" then
		return CircleZone:Create(data.center, data.radius, options)
	elseif data.type == "poly" then
		return PolyZone:Create(data.points, options)
	elseif data.type == "box" then
		return BoxZone:Create(data.center, data.length, data.width, options)
	end
end

local function InitCombo()
	if _combo then return end

	local zones = {}
	for id, data in pairs(_zones) do
		zones[#zones + 1] = BuildZone(id, data)
	end

	Strata.Log.Trace("Polyzone", string.format("Initialized %d Simple Polyzones", #zones))

	_combo = ComboZone:Create(zones, { name = "wrapper_combo" })

	_combo:onPlayerInOutExhaustive(function(isPointInside, testedPoint, insideZones, enteredZones, leftZones)
		if not _characterLoaded then return end

		if enteredZones then
			for _, zone in ipairs(enteredZones) do
				if zone.data and zone.data.id then
					TriggerEvent("Polyzone:Enter", zone.data.id, testedPoint, insideZones, zone.data)
				end
			end
		end

		if leftZones then
			for _, zone in ipairs(leftZones) do
				if zone.data and zone.data.id then
					TriggerEvent("Polyzone:Exit", zone.data.id, testedPoint, insideZones, zone.data)
				end
			end
		end
	end)
end

local function AddToCombo(id, data)
	if not _combo then return end
	_combo:AddZone(BuildZone(id, data))
end

-- ── Exports ───────────────────────────────────────────────────────────────────

exports("CreateBox", function(id, center, length, width, options, data)
	if _zones[id] and _combo then
		exports['st_zones']:Remove(id)
		Wait(100)
	end
	_zones[id] = { id = id, type = "box", center = center, width = width, length = length, options = options, data = data }
	AddToCombo(id, _zones[id])
end)

exports("CreatePoly", function(id, points, options, data)
	if _zones[id] and _combo then
		exports['st_zones']:Remove(id)
		Wait(100)
	end
	_zones[id] = { id = id, type = "poly", points = points, options = options, data = data }
	AddToCombo(id, _zones[id])
end)

exports("CreateCircle", function(id, center, radius, options, data)
	if _zones[id] and _combo then
		exports['st_zones']:Remove(id)
		Wait(100)
	end
	_zones[id] = { id = id, type = "circle", center = center, radius = radius, options = options, data = data }
	AddToCombo(id, _zones[id])
end)

exports("Remove", function(id)
	if _zones[id] then
		if _combo then
			_combo:RemoveZone(id)
			TriggerEvent("Polyzone:Exit", id, false, false, _zones[id].data or {})
		end
		_zones[id] = nil
	end
	return false
end)

exports("Get", function(id)
	return _zones[id]
end)

-- !! WARNING: won't work for overlapping zones !!
exports("GetZoneAtCoords", function(coords)
	if not _combo then return false end
	local isInside, insideZone = _combo:isPointInside(coords)
	if isInside and insideZone and insideZone.data then return insideZone.data end
	return false
end)

exports("GetAllZonesAtCoords", function(coords)
	if not _combo then return {} end
	local result = {}
	local isInside, insideZones = _combo:isPointInsideExhaustive(coords)
	if isInside and insideZones then
		for _, z in ipairs(insideZones) do result[#result + 1] = z.data end
	end
	return result
end)

exports("IsCoordsInZone", function(coords, id, key, val)
	if not _combo then return false end
	local isInside, insideZones = _combo:isPointInsideExhaustive(coords)
	if isInside and insideZones then
		for _, z in ipairs(insideZones) do
			if (not id or z.data.id == id)
			and (not key or (val == nil and z.data[key]) or (val ~= nil and z.data[key] == val)) then
				return z.data
			end
		end
	end
	return false
end)

-- ── Net events ────────────────────────────────────────────────────────────────

RegisterNetEvent("Characters:Client:Spawned", function()
	_characterLoaded = true
	InitCombo()
end)

RegisterNetEvent("Characters:Client:Logout", function()
	_characterLoaded = false
	for id, data in pairs(_zones) do
		TriggerEvent("Polyzone:Exit", id, false, false, data.data or {})
	end
	_debug = false
	TriggerEvent("Targeting:Client:PolyzoneDebug", false)
	if _combo then
		_combo:destroy()
		_combo = nil
		Strata.Log.Trace("Polyzone", "Destroyed All Polyzones (Character Logout)")
	end
end)

RegisterNetEvent("Polyzone:Client:ToggleDebug", function()
	_debug = not _debug
	TriggerEvent("Targeting:Client:PolyzoneDebug", _debug)
	if _debug and LocalPlayer.state.isAdmin then
		Strata.Log.Warn("Polyzone", "Polyzone Debug Enabled")
		CreateThread(function()
			while _debug do
				if _combo then _combo:draw() else Wait(500) end
				Wait(0)
			end
		end)
	end
end)

-- ── Bootstrap ─────────────────────────────────────────────────────────────────

AddEventHandler("onClientResourceStart", function(resource)
	if resource ~= GetCurrentResourceName() then return end

	exports["strata"]:RegisterClientCallback("Polyzone:GetZoneAtCoords", function(data, cb)
		cb(exports['st_zones']:GetZoneAtCoords(data))
	end)
	exports["strata"]:RegisterClientCallback("Polyzone:GetZonePlayerIn", function(data, cb)
		local c = GetEntityCoords(LocalPlayer.state.ped)
		cb(exports['st_zones']:GetZoneAtCoords(vector3(c.x, c.y, c.z)))
	end)
	exports["strata"]:RegisterClientCallback("Polyzone:GetAllZonesAtCoords", function(data, cb)
		cb(exports['st_zones']:GetAllZonesAtCoords(data))
	end)
	exports["strata"]:RegisterClientCallback("Polyzone:GetAllZonesPlayerIn", function(data, cb)
		local c = GetEntityCoords(LocalPlayer.state.ped)
		cb(exports['st_zones']:GetAllZonesAtCoords(vector3(c.x, c.y, c.z)))
	end)
	exports["strata"]:RegisterClientCallback("Polyzone:IsCoordsInZone", function(data, cb)
		cb(exports['st_zones']:IsCoordsInZone(data.coords, data.id, data.key, data.val))
	end)
end)
