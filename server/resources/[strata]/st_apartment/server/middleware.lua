function RegisterMiddleware()

	-- If a player spawns inside their apartment via Last Location (or any non-Apartment:SpawnInside
	-- path), detect it by proximity and run the full apartment Enter setup so zones are created.
	exports['strata']:MiddlewareAdd("Characters:Spawning", function(source)
		-- Already set up by Apartment:SpawnInside — nothing to do
		if Player(source).state.inApartment then return end

		local char = Strata.User.Find(source)
		if not char then return end

		local aptId = char:GetData("Apartment") or 0
		if aptId <= 0 then return end

		local apt = GlobalState[string.format("Apartment:%s", aptId)]
		if not apt or not apt.interior then return end

		-- Use a tight radius checked against every known interior point rather than
		-- a loose sphere from interior.entry alone.  The entry point on floor 1 sits
		-- only ~20 units from the lobby exterior (same XY column, Z differs by ~19),
		-- so a 30-unit sphere was matching players who spawned near the building
		-- outside and incorrectly routing them into the apartment bucket.
		local playerCoords   = GetEntityCoords(GetPlayerPed(source))
		local interiorPoints = {
			apt.interior.entry,
			apt.interior.stash,
			apt.interior.wardrobe,
			apt.interior.shower,
			apt.interior.wakeup,
		}

		local insideApartment = false
		for _, pt in ipairs(interiorPoints) do
			if #(playerCoords - pt) <= 5.0 then
				insideApartment = true
				break
			end
		end

		if insideApartment then
			exports['st_apartment']:Enter(source, aptId, -1, false)
		end
	end, 5)

	-- Set Apartment = 0 on new character creation (assigned on first spawn)
	exports['strata']:MiddlewareAdd("Characters:Creating", function(source, cData)
		return { { Apartment = 0 } }
	end)

	-- Ensure door access is granted when character spawns
	exports['strata']:MiddlewareAdd("Characters:Spawning", function(source)
		local char = Strata.User.Find(source)
		if not char then return end

		local aptId = char:GetData("Apartment") or 0
		if aptId > 0 then
			EnsureCharacterDoorAccess(char:GetData("SID"), aptId)
		end
	end, 2)

	-- Add "La Puerta" as a spawn point option on the character select screen
	exports['strata']:MiddlewareAdd("Characters:GetSpawnPoints", function(source, charId, cData)
		local spawns = {}
		local aptId  = cData.Apartment or 0

		if aptId > 0 and _aptData[aptId] then
			local room = _aptData[aptId]
			table.insert(spawns, {
				id       = string.format("APT:%s:%s", aptId, cData.SID),
				label    = string.format("La Puerta - %s", room.label),
				location = {
					x = room.interior.wakeup.x,
					y = room.interior.wakeup.y,
					z = room.interior.wakeup.z,
					h = room.wakeupHeading,
				},
				icon     = "building",
				event    = "Apartment:SpawnInside",
			})
		else
			-- Character has no apartment yet; show option to receive one
			table.insert(spawns, {
				id       = string.format("APT:NEW:%s", cData.SID),
				label    = "La Puerta - Request Room",
				location = {
					x = Config.Building.exit.x,
					y = Config.Building.exit.y,
					z = Config.Building.exit.z,
					h = Config.Building.exit.h,
				},
				icon     = "building",
				event    = "Apartment:SpawnInside",
			})
		end

		return spawns
	end, 2)

	-- Revoke door access and clean up state when character logs out
	exports['strata']:MiddlewareAdd("Characters:Logout", function(source)
		local char = Strata.User.Find(source)
		if not char then return end

		local aptId = char:GetData("Apartment") or 0
		if aptId > 0 then
			RemoveCharacterDoorAccess(char:GetData("SID"), aptId)
		end

		if Player(source).state.inApartment then
			exports['st_apartment']:Exit(source)
		end

		TriggerClientEvent("Apartment:Client:Cleanup", source)
	end)

end
