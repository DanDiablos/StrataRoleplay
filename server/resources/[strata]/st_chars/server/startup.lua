Spawns = {}

function Startup()
	exports['st_chars']:GetAllLocations("spawn", function(results)
		if not results then
			Strata.Log.Error("Characters", "Failed to load spawn locations")
			return
		end

		Strata.Log.Trace("Characters", "Loaded ^2" .. #results .. "^7 Spawn Locations",
			{ console = true })

		for k, v in ipairs(results) do
			local spawn = {
				id = v.id,
				label = v.label,
				location = { x = v.location.x, y = v.location.y, z = v.location.z, h = v.location.h },
				requiredJobs = v.requiredJobs,
			}
			table.insert(Spawns, spawn)
		end
	end)
end
