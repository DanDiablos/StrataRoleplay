-- ── Zone event proxy ──────────────────────────────────────────────────────────

local EVENT_PREFIX = "__PolyZone__:"

local function TriggerZoneEvent(eventName, ...)
	TriggerClientEvent(EVENT_PREFIX .. eventName, -1, ...)
end

RegisterNetEvent("PolyZone:TriggerZoneEvent", TriggerZoneEvent)

exports("TriggerZoneEvent", TriggerZoneEvent)

-- ── Zone output helpers ───────────────────────────────────────────────────────

local function Round(num, decimals)
	local mult = 10 ^ (decimals or 0)
	return math.floor(num * mult + 0.5) / mult
end

local function Header(name)
	return "--Name: " .. name .. " | " .. os.date("!%Y-%m-%dT%H:%M:%SZ\n")
end

local function ParsePoly(zone)
	local out = Header(zone.name) .. "PolyZone:Create({\n"
	for i, p in ipairs(zone.points) do
		out = out .. "  vector2(" .. tostring(p.x) .. ", " .. tostring(p.y) .. ")" .. (i < #zone.points and ",\n" or "\n")
	end
	return out .. "}, {\n  name = \"" .. zone.name .. "\",\n  --minZ = " .. zone.minZ .. ",\n  --maxZ = " .. zone.maxZ .. "\n})\n\n"
end

local function ParseCircle(zone)
	local c = zone.center
	return Header(zone.name)
		.. "CircleZone:Create("
		.. "vector3(" .. tostring(Round(c.x, 2)) .. ", " .. tostring(Round(c.y, 2)) .. ", " .. tostring(Round(c.z, 2)) .. "), "
		.. tostring(zone.radius) .. ", "
		.. "{\n  name = \"" .. zone.name .. "\",\n  useZ = " .. tostring(zone.useZ) .. ",\n  --debugPoly = true\n})\n\n"
end

local function ParseBox(zone)
	local c = zone.center
	local out = Header(zone.name)
		.. "BoxZone:Create("
		.. "vector3(" .. tostring(Round(c.x, 2)) .. ", " .. tostring(Round(c.y, 2)) .. ", " .. tostring(Round(c.z, 2)) .. "), "
		.. tostring(zone.length) .. ", " .. tostring(zone.width) .. ", "
		.. "{\n  name = \"" .. zone.name .. "\",\n  heading = " .. zone.heading .. ",\n  --debugPoly = true"
	if zone.minZ then out = out .. ",\n  minZ = " .. tostring(Round(zone.minZ, 2)) end
	if zone.maxZ then out = out .. ",\n  maxZ = " .. tostring(Round(zone.maxZ, 2)) end
	return out .. "\n})\n\n"
end

local function AppendToFile(content)
	local existing = LoadResourceFile(GetCurrentResourceName(), "polyzone_created_zones.txt") or ""
	SaveResourceFile(GetCurrentResourceName(), "polyzone_created_zones.txt", existing .. content, -1)
end

local function IsAdmin(src)
	local player = Strata.User.Account(src)
	return player ~= nil and player.Permissions:IsAdmin()
end

-- ── Net events (zone creation output) ────────────────────────────────────────

RegisterNetEvent("polyzone:printPoly", function(zone)
	if not IsAdmin(source) then return end
	AppendToFile(ParsePoly(zone))
end)

RegisterNetEvent("polyzone:printCircle", function(zone)
	if not IsAdmin(source) then return end
	AppendToFile(ParseCircle(zone))
end)

RegisterNetEvent("polyzone:printBox", function(zone)
	if not IsAdmin(source) then return end
	AppendToFile(ParseBox(zone))
end)

-- ── Bootstrap ─────────────────────────────────────────────────────────────────

AddEventHandler("onResourceStart", function(resource)
	if resource ~= GetCurrentResourceName() then return end

	exports["st_chat"]:RegisterAdminCommand("pzcreate", function(src, args)
		TriggerClientEvent("polyzone:createcommand", src, args)
	end, {
		help   = "Starts creation of a zone for PolyZone",
		params = { { name = "zoneType", help = "Zone Type (circle, box, poly)" } },
	})

	exports["st_chat"]:RegisterAdminCommand("pzadd", function(src)
		TriggerClientEvent("polyzone:pzadd", src)
	end, { help = "Adds point to a zone" })

	exports["st_chat"]:RegisterAdminCommand("pzundo", function(src)
		TriggerClientEvent("polyzone:pzundo", src)
	end, { help = "Undoes the last point added" })

	exports["st_chat"]:RegisterAdminCommand("pzfinish", function(src)
		TriggerClientEvent("polyzone:pzfinish", src)
	end, { help = "Finishes and prints zone" })

	exports["st_chat"]:RegisterAdminCommand("pzlast", function(src)
		TriggerClientEvent("polyzone:pzlast", src)
	end, { help = "Starts creation of the last zone you finished (BoxZone and CircleZone only)" })

	exports["st_chat"]:RegisterAdminCommand("pzcancel", function(src)
		TriggerClientEvent("polyzone:pzcancel", src)
	end, { help = "Cancel zone creation" })

	exports["st_chat"]:RegisterAdminCommand("pzcomboinfo", function(src)
		TriggerClientEvent("polyzone:pzcomboinfo", src)
	end, { help = "Prints info for all created ComboZones" })

	exports["st_chat"]:RegisterAdminCommand("pzdebug", function(src)
		TriggerClientEvent("Polyzone:Client:ToggleDebug", src)
	end, { help = "Toggle Polyzone debug mode" })
end)
