function RegisterCallbacks()

	-- Validate access to wardrobe / logout (must be in own apartment)
	exports["strata"]:RegisterServerCallback("Apartment:Validate", function(source, data, cb)
		local char   = Strata.User.Find(source)
		local pState = Player(source).state

		local isMyApartment = pState.inApartment
			and pState.inApartment.id == char:GetData("SID")

		if data.type == "wardrobe" and isMyApartment then
			cb(true)
		elseif data.type == "logout" and isMyApartment then
			cb(true)
		elseif data.type == "stash" then
			-- Owner OR police in active breach may access stash
			if isMyApartment then
				cb(true)
			elseif pState.inApartment and GlobalState[string.format("Apartment:Raid:%s", pState.inApartment.type)] then
				cb(true)
			else
				cb(false)
			end
		else
			cb(false)
		end
	end)

	-- Called from character spawn screen when player picks "Apartment" spawn point
	exports["strata"]:RegisterServerCallback("Apartment:SpawnInside", function(source, data, cb)
		local char = Strata.User.Find(source)
		if not char then cb(false) return end

		local aptId = char:GetData("Apartment") or 0

		-- Assign a random apartment if this character has none
		if aptId == 0 then
			aptId = GetRandomAvailableApartment()
			if not aptId then
				exports['st_ui']:Notification(source, "error", "No apartments available at this time.", 5000)
				cb(false)
				return
			end
			AssignApartment(aptId, char:GetData("SID"))
			char:SetData("Apartment", aptId)
		end

		-- Move to global bucket — same as Characters:GlobalSpawn does for every other
		-- spawn path. Without this the player stays in the hidden bucket (1) from
		-- Characters:Logout and can't see anything in the main world.
		exports["strata"]:RoutePlayerToGlobalRoute(source)

		EnsureCharacterDoorAccess(char:GetData("SID"), aptId)
		cb(exports['st_apartment']:Enter(source, aptId, -1, true))
	end)

	-- Called when player presses E near the building entrance
	exports["strata"]:RegisterServerCallback("Apartment:Enter", function(source, data, cb)
		cb(exports['st_apartment']:Enter(source, data.aptId, data.id))
	end)

	-- Called when player uses the Exit zone inside their apartment
	exports["strata"]:RegisterServerCallback("Apartment:Exit", function(source, data, cb)
		cb(exports['st_apartment']:Exit(source))
	end)

	-- Returns the player's current room info (building, room label, floor)
	exports["strata"]:RegisterServerCallback("Apartment:GetMyRoom", function(source, data, cb)
		local char  = Strata.User.Find(source)
		if not char then cb(nil) return end

		local aptId = char:GetData("Apartment") or 0
		local room  = _aptData[aptId]
		if not room then cb(nil) return end

		cb({
			building = Config.Building.name,
			label    = room.label,
			floor    = room.floor,
			aptId    = aptId,
		})
	end)

	-- Returns all rooms on a given floor with occupancy info (for police/admin)
	exports["strata"]:RegisterServerCallback("Apartment:GetFloorApartments", function(source, data, cb)
		local floor   = data.floor
		local results = {}

		for i, room in ipairs(_aptData) do
			if room.floor == floor then
				local assignment = _assignedApartments[i]
				table.insert(results, {
					aptId        = i,
					roomId       = room.roomId,
					label        = room.label,
					occupied     = assignment ~= nil,
					characterSID = assignment and assignment.characterSID or nil,
				})
			end
		end

		cb(results)
	end)

	-- Visitor request entry to another player's apartment
	exports["strata"]:RegisterServerCallback("Apartment:RequestEntry", function(source, data, cb)
		exports['st_apartment']:RequestsCreate(source, data.target, data.inZone)
		cb(true)
	end)

	-- Owner grants a visitor entry
	exports["strata"]:RegisterServerCallback("Apartment:Visit", function(source, data, cb)
		cb(exports['st_apartment']:Enter(source, data.aptId, data.targetSID))
	end)

end
