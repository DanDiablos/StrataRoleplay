CreateThread(function()
	while GetIsLoadingScreenActive() do
		Wait(0)
	end
	TriggerScreenblurFadeIn(500)
	SendNUIMessage({
		type = "APP_SHOW",
		data = {
			playerName = GetPlayerName(PlayerId()),
		},
	})
end)

local previews = {
	vector4(-2640.74, 1873.71, 159.88, 357.47),
	vector4(-2638.29, 1870.22, 160.13, 220.3),
	vector4(-2647.03, 1874.43, 160.52, 50.01),
}

local selectAnims = {
	[1] = { dict = "timetable@maid@couch@",                        anim = "base"   }, -- sitchair6
	[2] = { dict = "amb@prop_human_bum_shopping_cart@male@idle_a", anim = "idle_c" }, -- leanbar2
	[3] = { dict = "amb@world_human_sunbathe@male@back@base",      anim = "base"   }, -- sunbathe
}

local peds = {}
local ghostPeds = {}
local allPeds = {}
local ghostModels = {
	[1] = `mp_m_freemode_01`,
	[2] = `mp_f_freemode_01`,
	[3] = `mp_m_freemode_01`,
}
local showingCharSelect = false

-- Per-slot Z offset for label anchor (world space above head bone)
local labelZOffsets = {
	[1] = 0.20,   -- sitting (sitchair6)
	[2] = 0.55,   -- standing (leanbar2)
	[3] = -0.45,  -- lying down (sunbathe)
}

local function StartPedPositionTick()
	showingCharSelect = true
	CreateThread(function()
		while showingCharSelect do
			local positions = {}
			for slot = 1, #previews do
				local ped = allPeds[slot]
				if ped and DoesEntityExist(ped) then
					-- Re-enforce animation if the game cleared it
					if selectAnims[slot] then
						if not IsEntityPlayingAnim(ped, selectAnims[slot].dict, selectAnims[slot].anim, 3) then
							TaskPlayAnim(ped, selectAnims[slot].dict, selectAnims[slot].anim, 2.0, 2.0, -1, 1, 0, false, false, false)
						end
					end

					local coords = GetEntityCoords(ped)
					local headBone = GetEntityBoneIndexByName(ped, "head")
					local headPos
					if headBone ~= -1 then
						headPos = GetWorldPositionOfEntityBone(ped, headBone)
					else
						headPos = vector3(coords.x, coords.y, coords.z + 0.8)
					end
					local zOff = labelZOffsets[slot] or 0.55
					local headOnScreen, headX, headY = GetScreenCoordFromWorldCoord(headPos.x, headPos.y, headPos.z + zOff)
					local _, feetX, feetY = GetScreenCoordFromWorldCoord(coords.x, coords.y, coords.z - 0.1)
					positions[#positions + 1] = {
						slot = slot,
						visible = headOnScreen,
						headX = headX,
						headY = headY,
						feetX = feetX,
						feetY = feetY,
					}
				end
			end
			SendNUIMessage({
				type = "SET_PED_POSITIONS",
				data = { positions = positions },
			})
			Wait(50)
		end
		SendNUIMessage({
			type = "SET_PED_POSITIONS",
			data = { positions = {} },
		})
	end)
end

---@param beforeReveal fun()? Optional callback invoked after data is ready but before fade-in (used for cutscene)
local function loadCharacterSelect(beforeReveal)
	while LocalPlayer.state.ID == nil do
		Wait(1)
	end

	showingCharSelect = false

	for k, v in ipairs(peds) do
		DeleteEntity(v)
	end

	for k, v in ipairs(ghostPeds) do
		DeleteEntity(v)
	end

	peds = {}
	ghostPeds = {}
	allPeds = {}

	exports["strata"]:ServerCallback("Characters:GetServerData", {}, function(serverData)
		SendNUIMessage({
			type = "LOADING_SHOW",
			data = { message = "Getting Character Data" },
		})

		FadeOutWithTimeout(500)

		exports["strata"]:ServerCallback("Characters:GetCharacters", {}, function(characters)
			local ped = PlayerPedId()
			SetEntityCoords(ped, -2639.48, 1875.51, 160.79, 0.0, 0.0, 0.0, false)
			FreezeEntityPosition(ped, true)
			SetEntityVisible(ped, false)
			SetPlayerVisibleLocally(ped, false)

			Wait(250)

			local cam2 = CreateCamWithParams(
				"DEFAULT_SCRIPTED_CAMERA",
				-2639.48,
				1875.51,
				160.79,
				-12.335,
				0.000,
				149.00,
				100.00,
				false,
				0
			)
			SetCamActiveWithInterp(cam2, cam, 1000, true, true)
			RenderScriptCams(true, false, 1, true, true)

			TriggerScreenblurFadeOut(500)
			cam = cam2

			for k, v in ipairs(characters) do
				if previews[k] then
					if v.Preview then
						Strata.World.StageModel(GetHashKey(v.Preview.model))
						local ped = CreatePed(
							5,
							GetHashKey(v.Preview.model),
							previews[k][1],
							previews[k][2],
							previews[k][3],
							previews[k][4],
							false,
							true
						)

						while not DoesEntityExist(ped) do
							Wait(1)
						end

						SetBlockingOfNonTemporaryEvents(ped, true)
						SetPedCanRagdoll(ped, false)

						if selectAnims[k] then
							Strata.World.StageAnim(selectAnims[k].dict)
							TaskPlayAnim(ped, selectAnims[k].dict, selectAnims[k].anim, 2.0, 2.0, -1, 1, 0, false, false, false)
						end

						SetEntityCoordsNoOffset(ped, previews[k][1], previews[k][2], previews[k][3])
						SetEntityHeading(ped, previews[k][4])
						FreezeEntityPosition(ped, true)
						exports['st_appearance']:Preview(ped, tonumber(v.Gender), v.Preview, false, v.GangChain)

						table.insert(peds, ped)
						allPeds[k] = ped
					else
						Strata.World.StageModel(tonumber(v.Gender) == 0 and `mp_m_freemode_01` or `mp_f_freemode_01`)
						local ped = CreatePed(
							5,
							tonumber(v.Gender) == 0 and `mp_m_freemode_01` or `mp_f_freemode_01`,
							previews[k][1],
							previews[k][2],
							previews[k][3],
							previews[k][4],
							false,
							true
						)

						while not DoesEntityExist(ped) do
							Wait(1)
						end

						SetBlockingOfNonTemporaryEvents(ped, true)
						SetPedCanRagdoll(ped, false)

						if selectAnims[k] then
							Strata.World.StageAnim(selectAnims[k].dict)
							TaskPlayAnim(ped, selectAnims[k].dict, selectAnims[k].anim, 2.0, 2.0, -1, 1, 0, false, false, false)
						end

						SetEntityCoordsNoOffset(ped, previews[k][1], previews[k][2], previews[k][3])
						SetEntityHeading(ped, previews[k][4])
						FreezeEntityPosition(ped, true)

						table.insert(peds, ped)
						allPeds[k] = ped
					end
				end
			end

			-- Ghost peds for empty slots
			for slot = 1, #previews do
				if not allPeds[slot] and previews[slot] then
					Strata.World.StageModel(ghostModels[slot])
					local ghost = CreatePed(
						5,
						ghostModels[slot],
						previews[slot][1],
						previews[slot][2],
						previews[slot][3],
						previews[slot][4],
						false,
						true
					)

					while not DoesEntityExist(ghost) do
						Wait(1)
					end

					SetBlockingOfNonTemporaryEvents(ghost, true)
					SetPedCanRagdoll(ghost, false)

					if selectAnims[slot] then
						Strata.World.StageAnim(selectAnims[slot].dict)
						TaskPlayAnim(ghost, selectAnims[slot].dict, selectAnims[slot].anim, 2.0, 2.0, -1, 1, 0, false, false, false)
					end

					SetEntityCoordsNoOffset(ghost, previews[slot][1], previews[slot][2], previews[slot][3])
					SetEntityHeading(ghost, previews[slot][4])
					FreezeEntityPosition(ghost, true)
					SetPedDefaultComponentVariation(ghost)
					SetEntityAlpha(ghost, 80, false)

					table.insert(ghostPeds, ghost)
					allPeds[slot] = ghost
				end
			end

			-- Start head position tick
			StartPedPositionTick()

			local function showCharacterSelect()
				SendNUIMessage({
					type = "SET_DATA",
					data = {
						changelog = serverData.changelog,
						motd = serverData.motd,
						characters = characters,
						characterLimit = 3,
					},
				})
				SendNUIMessage({ type = "LOADING_HIDE" })
				SendNUIMessage({
					type = "SET_STATE",
					data = { state = "STATE_CHARACTERS" },
				})
				-- Unhide after state is set so splash never flashes
				SendNUIMessage({ type = "APP_UNHIDE" })
				FadeInWithTimeout(500)
			end

			-- If a beforeReveal callback was provided (cutscene), run it before showing UI
			if beforeReveal then
				beforeReveal(showCharacterSelect)
			else
				showCharacterSelect()
			end
		end)
	end)
end

RegisterNUICallback("GetData", function(data, cb)
	cb("ok")
	loadCharacterSelect()
end)

RegisterNUICallback("DismissSplash", function(data, cb)
	cb("ok")

	-- Remove cursor and blur so cutscene is visible
	SetNuiFocus(false, false)
	TriggerScreenblurFadeOut(0)

	-- Fetch data + setup peds first, then play cutscene, then reveal character select
	loadCharacterSelect(function(reveal)
		-- Hide NUI completely so nothing renders over the cutscene
		SendNUIMessage({ type = "APP_HIDE" })

		-- Everything is loaded and ready — play cutscene before showing character select
		PlayLandingCutscene(function()
			-- Cutscene done (screen faded out) — set data + state while still hidden, then unhide
			SetNuiFocus(true, true)
			reveal()
		end)
	end)
end)

RegisterNUICallback("CreateCharacter", function(data, cb)
	cb("ok")
	exports["strata"]:ServerCallback("Characters:CreateCharacter", data, function(character)
		if character ~= nil then
			SendNUIMessage({
				type = "CREATE_CHARACTER",
				data = { character = character },
			})
		end

		SendNUIMessage({
			type = "SET_STATE",
			data = { state = "STATE_CHARACTERS" },
		})
		SendNUIMessage({ type = "LOADING_HIDE" })
	end)
end)

RegisterNUICallback("DeleteCharacter", function(data, cb)
	cb("ok")
	exports["strata"]:ServerCallback("Characters:DeleteCharacter", data.id, function(status)
		if status then
			SendNUIMessage({
				type = "DELETE_CHARACTER",
				data = { id = data.id },
			})
		end
		SendNUIMessage({ type = "LOADING_HIDE" })
	end)
end)

RegisterNUICallback("SelectCharacter", function(data, cb)
	cb("ok")
	showingCharSelect = false
	exports["strata"]:ServerCallback("Characters:GetSpawnPoints", data.id, function(spawns)
		if spawns then
			SendNUIMessage({
				type = "SET_SPAWNS",
				data = { spawns = spawns },
			})
			SendNUIMessage({
				type = "SET_STATE",
				data = { state = "STATE_SPAWN" },
			})
		end

		SendNUIMessage({ type = "LOADING_HIDE" })
	end)
end)

RegisterNUICallback("CancelSpawn", function(data, cb)
	cb("ok")
	StartPedPositionTick()
end)

RegisterNUICallback("PlayCharacter", function(data, cb)
	cb("ok")

	showingCharSelect = false

	for k, v in ipairs(ghostPeds) do
		DeleteEntity(v)
	end
	ghostPeds = {}

	FadeOutWithTimeout(500)

	exports["strata"]:ServerCallback("Characters:GetCharacterData", data.character.ID, function(cData)
		cData.spawn = data.spawn
		TriggerEvent("Characters:Client:SetData", -1, cData, function()
			exports['st_appearance']:SpawnToWorld(cData, function()
				LocalPlayer.state.canUsePhone = true
				if data.spawn.event ~= nil then
					exports["strata"]:ServerCallback(data.spawn.event, data.spawn, function()
						LocalPlayer.state.Char = cData.ID
						LocalPlayer.state:set('SID', cData.SID, true)
						TriggerServerEvent("Characters:Server:Spawning")
						FadeInWithTimeout(500)
					end)
				else
					LocalPlayer.state:set('SID', cData.SID, true)
					TriggerServerEvent("Characters:Server:Spawning")

					FadeInWithTimeout(500)
				end
			end)
		end)

		for k, v in ipairs(peds) do
			DeleteEntity(v)
		end
	end)
end)

RegisterNetEvent("Characters:Client:Spawned", function()
	TriggerEvent("Characters:Client:Spawn")
	TriggerServerEvent("Characters:Server:Spawn")
	SetNuiFocus(false)
	SendNUIMessage({ type = "APP_HIDE" })
	SendNUIMessage({ type = "LOADING_HIDE" })
	LocalPlayer.state.loggedIn = true
end)
