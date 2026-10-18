local _receptionPed    = nil
local _apartmentZones  = {}      -- st_target zone ids created inside the apartment
local _inApartment     = false   -- true while player is inside their apartment instance
local _currentAptId    = nil     -- aptId of the apartment the player is currently inside
local _nearWardrobe    = false   -- true when player is within range of closet

-- ────────────────────────────────────────────────────────────────────────────
-- Startup: create blip and elevator zones
-- ────────────────────────────────────────────────────────────────────────────
AddEventHandler('onClientResourceStart', function(resource)
	if resource ~= GetCurrentResourceName() then return end

	Wait(1000)

	exports["strata"]:Add(
		"la-putura",
		"La Puerta Residences",
		Config.Building.entrance.coords,
		475,
		57
	)

	CreateElevatorZones()
	SpawnReceptionPed()
end)

function SpawnReceptionPed()
	local model = GetHashKey(Config.ReceptionPed.model)
	RequestModel(model)
	local timeout = GetGameTimer() + 5000
	while not HasModelLoaded(model) and GetGameTimer() < timeout do
		Wait(100)
	end
	if not HasModelLoaded(model) then return end

	local c = Config.ReceptionPed.coords
	_receptionPed = CreatePed(4, model, c.x, c.y, c.z, c.w, false, true)
	SetEntityInvincible(_receptionPed, true)
	SetBlockingOfNonTemporaryEvents(_receptionPed, true)
	FreezeEntityPosition(_receptionPed, true)
	TaskStartScenarioInPlace(_receptionPed, Config.ReceptionPed.scenario, 0, true)
	SetModelAsNoLongerNeeded(model)

	exports['st_target']:addLocalEntity(_receptionPed, {
		{
			name     = "apt_reception_room",
			label    = "Where's My Room?",
			icon     = "fas fa-map-location-dot",
			distance = 2.5,
			onSelect = function()
				exports["strata"]:ServerCallback("Apartment:GetMyRoom", {}, function(result)
					if result then
						exports['st_ui']:Notification(
							"info",
							string.format("%s — %s, Floor %d", result.building, result.label, result.floor),
							6000
						)
					else
						exports['st_ui']:Notification("error", "You don't have an apartment assigned.", 4000)
					end
				end)
			end,
		},
	})
end

local _elevator2X = -452.02249
local _elevator2Y = -937.43914

-- Per-floor XY overrides for elevator 2 (floors where shaft position differs from default)
local _elevator2Overrides = {
	[2] = { x = -460.826, y = -928.009 }, -- Lobby
}

function CreateElevatorZones()
	for i, floorEntry in ipairs(Config.Elevators) do
		local floorZ = floorEntry.coords.z

		-- Elevator 1
		exports['st_target']:addBoxZone({
			name     = string.format("apt-elevator-floor-%d", i),
			coords   = vector3(floorEntry.coords.x, floorEntry.coords.y, floorZ),
			size     = vec3(3.5, 3.5, 2.5),
			rotation = 0,
			debug    = false,
			options  = {
				{
					name     = "apt_elevator",
					label    = "Use Elevator",
					icon     = "fas fa-elevator",
					distance = 3.0,
					onSelect = function()
						TriggerEvent("Apartments:Elevator:Open", i)
					end,
				},
			},
		})

		-- Elevator 2
		local e2 = _elevator2Overrides[i] or { x = _elevator2X, y = _elevator2Y }
		exports['st_target']:addBoxZone({
			name     = string.format("apt-elevator2-floor-%d", i),
			coords   = vector3(e2.x, e2.y, floorZ),
			size     = vec3(3.5, 3.5, 2.5),
			rotation = 0,
			debug    = false,
			options  = {
				{
					name     = "apt_elevator",
					label    = "Use Elevator",
					icon     = "fas fa-elevator",
					distance = 3.0,
					onSelect = function()
						TriggerEvent("Apartments:Elevator:Open", i)
					end,
				},
			},
		})
	end
end

AddEventHandler("Apartments:Elevator:Open", function(currentFloorIdx)
	local menu = {
		main = {
			label = "La Puerta — Elevator",
			items = {},
		},
	}

	for i, floorEntry in ipairs(Config.Elevators) do
		table.insert(menu.main.items, {
			label       = floorEntry.label,
			disabled    = (i == currentFloorIdx),
			description = (i == currentFloorIdx) and "You are on this floor" or nil,
			event       = "Apartments:Elevator:Use",
			data        = { floorIdx = i },
		})
	end

	exports['st_ui']:ListMenuShow(menu)
end)

AddEventHandler("Apartments:Elevator:Use", function(data)
	local floorEntry = Config.Elevators[data.floorIdx]
	if not floorEntry then return end

	exports['st_ui']:ProgressWithTickEvent({
		name           = "apt_elevator_ride",
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
			return exports['st_ui']:ProgressCancel()
		end
	end, function(cancelled)
		if not cancelled then
			DoScreenFadeOut(500)
			while not IsScreenFadedOut() do Wait(10) end
			local ped = PlayerPedId()
			SetEntityCoords(ped, floorEntry.coords.x, floorEntry.coords.y, floorEntry.coords.z, 0, 0, 0, false)
			SetEntityHeading(ped, floorEntry.coords.w)
			exports["st_sound"]:PlayDistance(5.0, "elevator-bell.ogg", 0.4)
			Wait(250)
			DoScreenFadeIn(500)
		end
	end)
end)

-- Re-add blip when character spawns (blips are cleared on logout)
RegisterNetEvent("Characters:Client:Spawn", function()
	exports["strata"]:Add(
		"la-putura",
		"La Puerta Residences",
		Config.Building.entrance.coords,
		475,
		57
	)
end)

-- ────────────────────────────────────────────────────────────────────────────
-- Primary action keybind – wardrobe only
-- ────────────────────────────────────────────────────────────────────────────
AddEventHandler("Keybinds:Client:KeyUp:primary_action", function()
	if LocalPlayer.state.isDead then return end

	if _nearWardrobe then
		exports['st_apartment']:ExtrasWardrobe()
	end
end)

-- ────────────────────────────────────────────────────────────────────────────
-- Enter export
-- Fires the server callback, then fades/teleports into the room
-- ────────────────────────────────────────────────────────────────────────────
exports("Enter", function(aptId, id)
	exports["strata"]:ServerCallback("Apartment:Enter", {
		aptId = aptId,
		id    = id or -1,
	}, function(returnedAptId)
		if not returnedAptId then return end

		local apt = GlobalState[string.format("Apartment:%s", returnedAptId)]
		if not apt or not apt.interior then
			print(string.format("[st_apartment] Missing apartment state for aptId %s", tostring(returnedAptId)))
			return
		end

		exports["st_sound"]:PlayOne("door_open.ogg", 0.15)

		DoScreenFadeOut(1000)
		while not IsScreenFadedOut() do Wait(10) end

		FreezeEntityPosition(PlayerPedId(), true)
		Wait(50)
		SetEntityCoords(PlayerPedId(),
			apt.interior.entry.x,
			apt.interior.entry.y,
			apt.interior.entry.z,
			0, 0, 0, false
		)
		Wait(100)
		SetEntityHeading(PlayerPedId(), apt.entryHeading or 270.0)

		local timeout = GetGameTimer() + 10000
		while not HasCollisionLoadedAroundEntity(PlayerPedId()) and GetGameTimer() < timeout do
			Wait(100)
		end
		FreezeEntityPosition(PlayerPedId(), false)

		DoScreenFadeIn(1000)
		while not IsScreenFadedIn() do Wait(10) end
	end)
end)

-- ────────────────────────────────────────────────────────────────────────────
-- ClientEnter export (called server-side via TriggerClientEvent)
-- Used when spawning inside the apartment on character select
-- ────────────────────────────────────────────────────────────────────────────
exports("ClientEnter", function(targetAptId, target, wakeUp)
	local apt = GlobalState[string.format("Apartment:%s", targetAptId)]
	if not apt or not apt.interior then
		print(string.format("[st_apartment] ClientEnter missing state for aptId %s", tostring(targetAptId)))
		return
	end

	exports["st_sound"]:PlayOne("door_open.ogg", 0.15)

	DoScreenFadeOut(1000)
	while not IsScreenFadedOut() do Wait(10) end

	FreezeEntityPosition(PlayerPedId(), true)
	Wait(50)
	SetEntityCoords(PlayerPedId(),
		apt.interior.entry.x,
		apt.interior.entry.y,
		apt.interior.entry.z,
		0, 0, 0, false
	)
	Wait(100)
	SetEntityHeading(PlayerPedId(), apt.entryHeading or 270.0)

	local timeout = GetGameTimer() + 10000
	while not HasCollisionLoadedAroundEntity(PlayerPedId()) and GetGameTimer() < timeout do
		Wait(100)
	end
	FreezeEntityPosition(PlayerPedId(), false)

	DoScreenFadeIn(1000)
	while not IsScreenFadedIn() do Wait(10) end

	TriggerEvent("Apartment:Client:InnerStuff", targetAptId, target, wakeUp)
end)

-- ────────────────────────────────────────────────────────────────────────────
-- InnerStuff: runs after entering the apartment
-- Creates st_target interaction zones for the room's interior features
-- ────────────────────────────────────────────────────────────────────────────
RegisterNetEvent("Apartment:Client:InnerStuff", function(aptId, unit, wakeUp)
	-- Wait until player state is ready
	local timeoutAt = GetGameTimer() + 5000
	while GlobalState[string.format("%s:", LocalPlayer.state.ID)] == nil and GetGameTimer() < timeoutAt do
		Wait(10)
	end

	-- Ensure the player is not frozen regardless of spawn path
	FreezeEntityPosition(PlayerPedId(), false)

	_inApartment  = true
	_currentAptId = aptId
	local apt     = GlobalState[string.format("Apartment:%s", aptId)]

	-- Tell the interior blocker system we're inside
	TriggerEvent("Interiors:Enter", apt.interior.wakeup)

	-- On spawn: play the wakeup emote at the bed position
	if wakeUp then
		SetTimeout(250, function()
			exports['st_emotes']:EmotesWakeUp({
				x = apt.interior.wakeup.x,
				y = apt.interior.wakeup.y,
				z = apt.interior.wakeup.z,
				h = apt.wakeupHeading,
			})
		end)
	end

	-- ── Stash zone ─────────────────────────────────────────────────────────
	_apartmentZones[string.format("apt-%s-stash", aptId)] = exports['st_target']:addBoxZone({
		name    = string.format("apt-%s-stash", aptId),
		coords  = apt.interior.stash,
		size    = vec3(2.0, 1.5, 2.5),
		rotation = 0,
		debug   = false,
		options = {
			{
				name     = "apt_stash",
				label    = "Stash",
				icon     = "fas fa-box",
				distance = 2.0,
				onSelect = function()
					TriggerEvent("Apartment:Client:Stash", aptId)
				end,
			},
		},
	})

	-- Note: there is no auto-exit by distance. There's no routing bucket
	-- separating apartments (each unit is just a unique MLO position in the
	-- global world), so there's nothing to "exit" — the interior zones live
	-- for the entire character session and only get torn down on logout.

	-- ── Shower zone ────────────────────────────────────────────────────────
	_apartmentZones[string.format("apt-%s-shower", aptId)] = exports['st_target']:addBoxZone({
		name    = string.format("apt-%s-shower", aptId),
		coords  = apt.interior.shower,
		size    = vec3(1.5, 1.5, 2.5),
		rotation = 0,
		debug   = false,
		options = {
			{
				name     = "apt_shower",
				label    = "Shower",
				icon     = "fas fa-shower",
				distance = 2.0,
				onSelect = function()
					TriggerEvent("Apartment:Client:Shower", aptId)
				end,
			},
		},
	})

	-- Check if owner so we show closet prompt + bed logout (owner only)
	local inApt   = LocalPlayer.state.inApartment
	local mySID   = LocalPlayer.state.Character and LocalPlayer.state.Character:GetData("SID")
	local isOwner = inApt and inApt.id == mySID

	if isOwner then
		-- ── Bed / Switch Characters zone ──────────────────────────────────────
		_apartmentZones[string.format("apt-%s-logout", aptId)] = exports['st_target']:addBoxZone({
			name     = string.format("apt-%s-logout", aptId),
			coords   = apt.interior.wakeup,
			size     = vec3(2.0, 2.0, 1.5),
			rotation = apt.wakeupHeading or 90.0,
			debug    = false,
			options  = {
				{
					name     = "apt_logout",
					label    = "Switch Characters",
					icon     = "fas fa-bed",
					distance = 2.5,
					onSelect = function()
						TriggerEvent("Apartment:Client:Logout", unit)
					end,
				},
			},
		})
	end

	if isOwner then
		CreateThread(function()
			while _inApartment do
				local dist = #(GetEntityCoords(PlayerPedId()) - apt.interior.wardrobe)
				if dist <= 2.5 then
					if not _nearWardrobe then
						_nearWardrobe = true
						exports['st_ui']:ActionShow("apt-closet", "{keybind}primary_action{/keybind} Wardrobe")
					end
				else
					if _nearWardrobe then
						_nearWardrobe = false
						exports['st_ui']:ActionHide("apt-closet")
					end
				end
				Wait(300)
			end
			_nearWardrobe = false
			exports['st_ui']:ActionHide("apt-closet")
		end)
	end

end)

-- ────────────────────────────────────────────────────────────────────────────
-- Exit export
-- Clears the routing bucket and cleans up interior zones.
-- No teleport — the player is already physically where they walked.
-- ────────────────────────────────────────────────────────────────────────────
exports("Exit", function()
	local aptId = _currentAptId

	exports["strata"]:ServerCallback("Apartment:Exit", {}, function()
		TriggerEvent("Interiors:Exit")
		if aptId then
			_CleanApartmentZones(aptId)
		else
			_CleanAllApartmentZones()
		end
		_inApartment  = false
		_currentAptId = nil
		_nearWardrobe = false
		exports['st_ui']:ActionHide("apt-closet")
	end)
end)

-- ────────────────────────────────────────────────────────────────────────────
-- Interaction feature exports
-- ────────────────────────────────────────────────────────────────────────────
exports("ExtrasStash", function()
	local aptId      = LocalPlayer.state.inApartment and LocalPlayer.state.inApartment.type
	local characterSID = LocalPlayer.state.Character and LocalPlayer.state.Character:GetData("SID")

	if characterSID and aptId then
		exports.st_inventory:openInventory('stash', {
			id    = string.format("apartment_%s", aptId),
			owner = characterSID,
		})
	end
end)

exports("ExtrasWardrobe", function()
	exports["strata"]:ServerCallback("Apartment:Validate", {
		id   = GlobalState[string.format("%s:", LocalPlayer.state.ID)],
		type = "wardrobe",
	}, function(state)
		if state then
			exports['st_appearance']:WardrobeShow()
		end
	end)
end)

exports("ExtrasLogout", function()
	exports["strata"]:ServerCallback("Apartment:Validate", {
		id   = GlobalState[string.format("%s:", LocalPlayer.state.ID)],
		type = "logout",
	}, function(state)
		if state then
			exports['st_chars']:Logout()
		end
	end)
end)

exports("ExtrasShower", function()
	exports['st_ui']:Progress({
		name      = "apt_shower",
		label     = "Showering...",
		duration  = 8000,
		animation = {
			animDict = "anim@mp_yacht@shower@male@",
			anim     = "shower_in_shower_loop",
			flags    = 1,
		},
		controlDisables = {
			disableMovement = true,
			disableCombat   = true,
		},
		canCancel = true,
	}, function(cancelled)
		if not cancelled then
			local ped = PlayerPedId()
			ClearPedBloodDamage(ped)
			ResetPedVisibleDamage(ped)
			SetPedWetness(ped, 0.0)
			local aptId = LocalPlayer.state.inApartment and LocalPlayer.state.inApartment.type
			TriggerServerEvent("Apartment:Server:ShowerSync", aptId, false)
			exports['st_ui']:Notification("success", "You feel refreshed.", 3000)
		end
	end)
end)

-- ────────────────────────────────────────────────────────────────────────────
-- Internal event handlers
-- ────────────────────────────────────────────────────────────────────────────
AddEventHandler("Apartment:Client:Stash", function(aptId)
	exports['st_apartment']:ExtrasStash()
end)

AddEventHandler("Apartment:Client:Wardrobe", function()
	exports['st_apartment']:ExtrasWardrobe()
end)

AddEventHandler("Apartment:Client:Logout", function()
	exports['st_apartment']:ExtrasLogout()
end)

AddEventHandler("Apartment:Client:Shower", function()
	exports['st_apartment']:ExtrasShower()
end)

-- Server triggers this when spawning the player inside (from character select)
RegisterNetEvent("Apartment:Client:Enter", function(aptId, target, wakeUp)
	exports['st_apartment']:ClientEnter(aptId, target, wakeUp)
end)

-- Shower particle sync
RegisterNetEvent("Apartment:Client:ShowerSync", function(aptId, toggle)
	-- No-op for now; add particle FX here if needed
end)

-- Raid events (notify clients in the same building)
RegisterNetEvent("Apartment:Client:RaidStarted", function(aptId)
	local myApt = LocalPlayer.state.inApartment
	if myApt and myApt.type == aptId then
		exports['st_ui']:Notification("error", "Police are breaching your apartment!", 6000)
	end
end)

RegisterNetEvent("Apartment:Client:RaidEnded", function(aptId)
	-- optional: notify residents the raid has ended
end)

-- Cleanup all zones on logout
RegisterNetEvent("Apartment:Client:Cleanup", function()
	_CleanAllApartmentZones()
	_inApartment  = false
	_currentAptId = nil
	_nearWardrobe = false
	exports['st_ui']:ActionHide("apt-closet")
end)

RegisterNetEvent("Characters:Client:Logout")
AddEventHandler("Characters:Client:Logout", function()
	_CleanAllApartmentZones()
	_inApartment  = false
	_currentAptId = nil
	_nearWardrobe = false
	exports['st_ui']:ActionHide("apt-closet")
end)

-- ────────────────────────────────────────────────────────────────────────────
-- Zone cleanup helpers
-- ────────────────────────────────────────────────────────────────────────────
function _CleanApartmentZones(aptId)
	local prefix = string.format("apt-%s-", aptId)
	for zoneName, zoneId in pairs(_apartmentZones) do
		if string.find(zoneName, prefix, 1, true) then
			if exports['st_target']:zoneExists(zoneId) then
				exports['st_target']:removeZone(zoneId)
			end
			_apartmentZones[zoneName] = nil
		end
	end
end

function _CleanAllApartmentZones()
	for zoneName, zoneId in pairs(_apartmentZones) do
		if exports['st_target']:zoneExists(zoneId) then
			exports['st_target']:removeZone(zoneId)
		end
		_apartmentZones[zoneName] = nil
	end
end
