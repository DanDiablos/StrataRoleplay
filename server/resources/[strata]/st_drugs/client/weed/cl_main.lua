---@class WeedPlantData
---@field plant { isMale: boolean, location: { x: number, y: number, z: number }, growth: number, output: number, material: number, planted: number, water: number, fertilizer: { type: string, value: number, time: number }|nil, _id: number }
---@field stage? number

-- ─── State ───────────────────────────────────────────────────────────────────

local _activePlants  = {} ---@type table<number, WeedPlantData>
local _nearbyPlants  = {} ---@type table<number, boolean>
local _spawnedPlants = {} ---@type table<number, number>

local _smokingJointInProgress = false
local _smokeDebug = WeedConfig.DebugSmokeProgress

-- ─── Helpers ─────────────────────────────────────────────────────────────────

---@param pct number
---@return number
local function getStageByPct(pct)
	local stagePct = 100 / (#Plants - 1)
	return math.floor((pct / stagePct) + 1.5)
end

---@param tbl table
---@param value any
---@return boolean
local function hasValue(tbl, value)
	for _, v in ipairs(tbl) do
		if v == value or (type(v) == "table" and hasValue(v, value)) then
			return true
		end
	end
	return false
end

---@param entity number
---@return number|nil
function GetWeedPlant(entity)
	for id, ent in pairs(_spawnedPlants) do
		if ent == entity then
			return id
		end
	end
end

---@param id number
---@param data WeedPlantData
---@return number
local function createPlantEntity(id, data)
	local stage = getStageByPct(data.plant.growth)
	local x, y, z = data.plant.location.x, data.plant.location.y, data.plant.location.z + Plants[stage].offset
	local obj = CreateObject(Plants[stage].model, x, y, z, false, true)
	FreezeEntityPosition(obj, true)
	SetEntityCoords(obj, x, y, z)
	return obj
end

local function logSmoke(msg)
	if not _smokeDebug then return end
	print(("[st_drugs][smoke-debug] %s"):format(msg))
end

-- ─── Smoke joint ─────────────────────────────────────────────────────────────

local function clearActiveAction()
	local currentAction = exports['st_ui']:ProgressCurrentAction()
	logSmoke(("clearActiveAction: doingAction=%s currentAction=%s"):format(
		tostring(LocalPlayer.state.doingAction), tostring(currentAction)))

	exports['st_emotes']:EmotesForceCancel()

	if LocalPlayer.state.doingAction and currentAction == "smoking_weed" then
		logSmoke("clearActiveAction: cancelling existing smoking_weed action")
		exports['st_ui']:ProgressCancel(true)
		local timeout = GetGameTimer() + 1500
		while LocalPlayer.state.doingAction and GetGameTimer() < timeout do
			Wait(10)
		end
	end
end

---@param onFinish fun(cancelled: boolean)
local function startSmokeJointProgress(onFinish)
	logSmoke(("start: inProgress=%s doingAction=%s currentAction=%s"):format(
		tostring(_smokingJointInProgress),
		tostring(LocalPlayer.state.doingAction),
		tostring(exports['st_ui']:ProgressCurrentAction())
	))

	if _smokingJointInProgress then
		logSmoke("start: blocked by _smokingJointInProgress")
		onFinish(true)
		return
	end

	clearActiveAction()

	if LocalPlayer.state.doingAction then
		logSmoke(("start: blocked by active action=%s"):format(tostring(exports['st_ui']:ProgressCurrentAction())))
		exports['st_ui']:Notification("error", "Already Doing An Action", 3000)
		onFinish(true)
		return
	end

	_smokingJointInProgress = true
	logSmoke("start: ProgressWithTickEvent begin")

	exports['st_ui']:ProgressWithTickEvent({
		name     = "smoking_weed",
		duration = 8000,
		tickrate = 1000,
		label    = "Smoking",
		canCancel    = false,
		ignoreModifier = true,
		controlDisables = {
			disableMovement    = false,
			disableCarMovement = false,
			disableMouse       = false,
			disableCombat      = true,
		},
		animation = { anim = "smokeweed" },
	}, function() end, function(cancelled)
		_smokingJointInProgress = false
		logSmoke(("finish: cancelled=%s"):format(tostring(cancelled)))
		exports['st_emotes']:EmotesForceCancel()
		onFinish(cancelled)
	end)
end

-- ─── Client callbacks ─────────────────────────────────────────────────────────

local function registerCallbacks()
	exports["strata"]:RegisterClientCallback("Weed:PlantingAnim", function(data, cb)
		local x, y, z = table.unpack(GetOffsetFromEntityInWorldCoords(PlayerPedId(), 0.0, 0.3, 0))
		local foundGround, zPos = GetGroundZFor_3dCoord(x, y, z - 0.5, 0)
		if foundGround then z = zPos end

		local rayHandle = StartExpensiveSynchronousShapeTestLosProbe(x, y, z + 4, x, y, z - 2, 1, 0, 4)
		local _, hit, _, _, materialHash, _ = GetShapeTestResultIncludingMaterial(rayHandle)

		local tooClose = false
		for _, v in pairs(_activePlants) do
			if v and v.plant and #(vector3(x, y, z) - vector3(v.plant.location.x, v.plant.location.y, v.plant.location.z)) <= 0.8 then
				tooClose = true
				break
			end
		end

		if not hit then
			cb({ error = 1 })
			return
		end

		if Materials[materialHash] == nil
			or exports['st_zones']:IsCoordsInZone(vector3(x, y, z), "cayo_perico")
			or exports['st_zones']:IsCoordsInZone(vector3(x, y, z), "casino_roof_weed_blocker")
		then
			cb({ error = 2 })
			return
		end

		if tooClose then
			cb({ error = 3 })
			return
		end

		exports['st_ui']:Progress({
			name     = "plant_weed",
			duration = 15000,
			label    = "Planting",
			canCancel = true,
			controlDisables = {
				disableMovement    = true,
				disableCarMovement = true,
				disableMouse       = false,
				disableCombat      = true,
			},
			animation = { task = "WORLD_HUMAN_GARDENER_PLANT" },
		}, function(cancelled)
			if not cancelled then
				cb({ coords = { x = x, y = y, z = z }, material = materialHash })
			else
				cb({ error = 3 })
			end
		end)
	end)

	exports["strata"]:RegisterClientCallback("Weed:RollingAnim", function(data, cb)
		exports['st_ui']:Progress({
			name     = "rolling_weed",
			duration = 3000,
			label    = "Rolling Joints",
			canCancel    = true,
			ignoreModifier = true,
			controlDisables = {
				disableMovement    = true,
				disableCarMovement = true,
				disableMouse       = false,
				disableCombat      = true,
			},
			animation = {
				animDict = "amb@world_human_clipboard@male@idle_a",
				anim     = "idle_c",
				flags    = 49,
			},
		}, function(cancelled) cb(not cancelled) end)
	end)

	exports["strata"]:RegisterClientCallback("Weed:MakingBrick", function(data, cb)
		exports['st_ui']:Progress({
			name     = "making_brick",
			duration = data.time * 1000,
			label    = data.label,
			canCancel    = true,
			ignoreModifier = true,
			controlDisables = {
				disableMovement    = true,
				disableCarMovement = true,
				disableMouse       = false,
				disableCombat      = true,
			},
			animation = {
				animDict = "amb@world_human_clipboard@male@idle_a",
				anim     = "idle_c",
				flags    = 49,
			},
		}, function(cancelled) cb(not cancelled) end)
	end)

	exports["strata"]:RegisterClientCallback("Weed:SmokingAnim", function(data, cb)
		startSmokeJointProgress(function(cancelled)
			if not cancelled then
				local armor = GetPedArmour(LocalPlayer.state.ped)
				if armor < 50 then
					SetPedArmour(LocalPlayer.state.ped, math.min(50, armor + 10))
				end
			end
			cb(not cancelled)
		end)
	end)

	RegisterNetEvent("Weed:Client:SmokeJoint", function(slot, actionId)
		logSmoke(("event: Weed:Client:SmokeJoint slot=%s actionId=%s"):format(tostring(slot), tostring(actionId)))
		startSmokeJointProgress(function(cancelled)
			if cancelled then
				logSmoke("event: smoke cancelled")
				return
			end
			local armor = GetPedArmour(LocalPlayer.state.ped)
			if armor < 50 then
				SetPedArmour(LocalPlayer.state.ped, math.min(50, armor + 10))
			end
			TriggerServerEvent("Weed:Server:SmokeJointComplete", slot, actionId)
			logSmoke(("event: sent Weed:Server:SmokeJointComplete slot=%s actionId=%s"):format(tostring(slot), tostring(actionId)))
		end)
	end)
end

-- ─── Plant objects ───────────────────────────────────────────────────────────

RegisterNetEvent("Weed:Client:Objects:Init", function(plants)
	if not plants or type(plants) ~= "table" then
		Strata.Log.Error("Weed", "Failed to Load Weed Objects")
		return
	end

	for k, v in pairs(plants) do
		_activePlants[k] = v
	end
	_spawnedPlants = {}
	_nearbyPlants  = {}

	while not LocalPlayer.state.loggedIn do
		Wait(100)
	end

	-- Manage nearby set (500 unit radius, slow tick)
	CreateThread(function()
		while LocalPlayer.state.loggedIn do
			Wait(3000)
			local pedCoords = GetEntityCoords(LocalPlayer.state.ped)
			for k, v in pairs(_activePlants) do
				local dist = #(pedCoords - vector3(v.plant.location.x, v.plant.location.y, v.plant.location.z))
				if dist <= 500.0 then
					_nearbyPlants[k] = true
				elseif _nearbyPlants[k] then
					_nearbyPlants[k] = nil
					if _spawnedPlants[k] and DoesEntityExist(_spawnedPlants[k]) then
						DeleteEntity(_spawnedPlants[k])
						_spawnedPlants[k] = nil
					end
				end
			end
		end
	end)

	-- Spawn/despawn entities within 50 units (fast tick)
	CreateThread(function()
		while LocalPlayer.state.loggedIn do
			Wait(350)
			local pedCoords = GetEntityCoords(LocalPlayer.state.ped)
			for k in pairs(_nearbyPlants) do
				local weed = _activePlants[k]
				if weed then
					local dist = #(pedCoords - vector3(weed.plant.location.x, weed.plant.location.y, weed.plant.location.z))
					if dist <= 50.0 then
						if not _spawnedPlants[k] then
							_spawnedPlants[k] = createPlantEntity(k, weed)
						end
					elseif _spawnedPlants[k] and DoesEntityExist(_spawnedPlants[k]) then
						DeleteEntity(_spawnedPlants[k])
						_spawnedPlants[k] = nil
					end
				end
			end
		end
	end)
end)

RegisterNetEvent("Weed:Client:Objects:Update", function(plantId, data, isUpdate)
	_activePlants[plantId] = data
	if isUpdate and _spawnedPlants[plantId] then
		DeleteEntity(_spawnedPlants[plantId])
		_spawnedPlants[plantId] = nil
	end
end)

RegisterNetEvent("Weed:Client:Objects:UpdateMany", function(data)
	for _, v in ipairs(data) do
		_activePlants[v.id] = v.plant
		if v.update and _spawnedPlants[v.id] then
			DeleteEntity(_spawnedPlants[v.id])
			_spawnedPlants[v.id] = nil
		end
	end
end)

RegisterNetEvent("Weed:Client:Objects:Delete", function(plantId)
	_activePlants[plantId] = nil
	_nearbyPlants[plantId] = nil
	if _spawnedPlants[plantId] then
		DeleteEntity(_spawnedPlants[plantId])
		_spawnedPlants[plantId] = nil
	end
end)

-- ─── Dealer setup ────────────────────────────────────────────────────────────

RegisterNetEvent("Weed:Client:Login", function(l)
	exports['st_utils']:Add("weed-dealer", `s_m_y_dealer_01`,
		vector3(l.coords.x, l.coords.y, l.coords.z), l.heading, 50.0, {
			{
				icon  = "cannabis",
				text  = "Buy Package",
				event = "Weed:Client:Package",
			},
			{
				icon    = "clock-nine",
				text    = "Sign In",
				event   = "WeedRun:Client:Enable",
				data    = {},
				isEnabled = function()
					return not hasValue(LocalPlayer.state.Character:GetData("States") or {}, "SCRIPT_WEED_RUN")
						and LocalPlayer.state.onDuty ~= "police"
				end,
			},
			{
				icon    = "clock-nine",
				text    = "Sign Out",
				event   = "WeedRun:Client:Disabled",
				data    = {},
				isEnabled = function()
					return hasValue(LocalPlayer.state.Character:GetData("States") or {}, "SCRIPT_WEED_RUN")
						and LocalPlayer.state.onDuty ~= "police"
				end,
			},
		}, "sack-dollar", "WORLD_HUMAN_DRUG_DEALER", true)
end)

-- ─── Plant interactions ───────────────────────────────────────────────────────

local function progressAnim(opts, cb)
	exports['st_ui']:Progress({
		canCancel = true,
		controlDisables = {
			disableMovement    = true,
			disableCarMovement = true,
			disableMouse       = false,
			disableCombat      = true,
		},
		animation = {
			animDict = "anim@amb@clubhouse@tutorial@bkr_tut_ig3@",
			anim     = "machinic_loop_mechandplayer",
			flags    = 49,
		},
	}, cb, table.unpack(opts or {}))
end

AddEventHandler("Weed:Client:Check", function(entity, data)
	local pid = GetWeedPlant(entity.entity)
	exports["strata"]:ServerCallback("Weed:CheckPlant", pid, function(res)
		if not res then return end

		local stageId = getStageByPct(res.plant.growth)
		local stage   = Plants[stageId]
		local gender  = res.plant.isMale and "Male" or "Female"

		local items = {
			{ label = "Plant Information", description = gender },
			{ label = "Plant Growth",      description = string.format("Growth: %.2f%%", res.plant.growth) },
			{
				label = "Soil Information",
				description = string.format(
					"<ul><li>Ground Type: %s</li><li>Water: %s</li><li>Nitrogen: %s</li><li>Phosphorus: %s</li><li>Potassium: %s</li></ul>",
					res.ground.label, res.ground.water, res.ground.nitrogen, res.ground.phosphorus, res.ground.potassium
				),
			},
		}

		if res.plant.growth < 100 then
			if res.plant.fertilizer then
				table.insert(items, {
					label = "Fertilized",
					description = string.format("Type: %s (+%s) Time Left: %s Minutes",
						res.plant.fertilizer.type, res.plant.fertilizer.value, res.plant.fertilizer.time),
				})
			else
				table.insert(items, {
					label       = "Not Fertilized",
					description = "Click to fertilize plant",
					submenu     = "fertilizer",
				})
			end

			if res.plant.water < 95 then
				table.insert(items, {
					label       = string.format("Water: %.2f%%", res.plant.water),
					description = "Requires 1x Bottle of Water",
					event       = "Weed:Client:Water",
					data        = pid,
				})
			else
				table.insert(items, {
					label       = string.format("Water: %.2f%%", res.plant.water),
					description = "Does Not Need Water",
				})
			end
		end

		if stage.harvestable then
			table.insert(items, {
				label = "Harvest Plant",
				event = "Weed:Client:Harvest2",
				data  = pid,
			})
		end

		-- Build fertilizer submenu
		local fertilizers = {
			{
				label = "About Fertilizer",
				description = "Various fertilizers do different things.<br />Nitrogen: Increases possible output of plant.<br />Phosphorus: Increases Growth Per Tick.<br />Potassium: Increases Water Duration.",
			},
		}
		local hasNitro = exports.st_inventory:ItemsHas("fertilizer_nitrogen",   1)
		local hasPhos  = exports.st_inventory:ItemsHas("fertilizer_phosphorus",  1)
		local hasPotas = exports.st_inventory:ItemsHas("fertilizer_potassium",   1)

		if hasNitro or hasPhos or hasPotas then
			if hasNitro then table.insert(fertilizers, { label = "Fertilize Plant (Nitrogen)",   description = "Requires 1x Fertilizer (Nitrogen)",   event = "Weed:Client:Fertilize", data = { id = pid, type = "nitrogen"   } }) end
			if hasPhos  then table.insert(fertilizers, { label = "Fertilize Plant (Phosphorus)", description = "Requires 1x Fertilizer (Phosphorus)", event = "Weed:Client:Fertilize", data = { id = pid, type = "phosphorus" } }) end
			if hasPotas then table.insert(fertilizers, { label = "Fertilize Plant (Potassium)",  description = "Requires 1x Fertilizer (Potassium)",  event = "Weed:Client:Fertilize", data = { id = pid, type = "potassium"  } }) end
		else
			table.insert(fertilizers, { label = "You Don't Have Any Fertilizer" })
		end

		table.insert(items, {
			label       = "Destroy Plant",
			description = "Destroy the plant, you will not receive anything from doing this",
			submenu     = "deleteConfirm",
		})

		exports['st_ui']:ListMenuShow({
			main = {
				label = string.format("Weed Plant Stage: %s", stageId),
				items = items,
			},
			fertilizer = {
				label = "Fertilize Plant",
				items = fertilizers,
			},
			deleteConfirm = {
				label = "Destroy Plant?",
				items = {
					{
						label       = "Are You Sure?",
						description = "Destroying this plant is irreversible and you will not receive anything from this plant. Are you absolutely sure you want to do this?",
					},
					{
						label       = "Yes",
						description = "Destroy This Plant",
						event       = "Weed:Client:Destroy",
						data        = pid,
					},
					{
						label       = "No",
						description = "Do Not Destroy This Plant",
						submenu     = "main",
					},
				},
			},
		})
	end)
end)

AddEventHandler("Weed:Client:Fertilize", function(data)
	if not exports.st_inventory:ItemsHas(string.format("fertilizer_%s", data.type), 1) then
		exports["st_ui"]:Notification("error", "You Don't Have Fertilizer")
		return
	end
	exports['st_ui']:ListMenuClose()
	exports['st_ui']:Progress({
		name     = "fertilize_weed",
		duration = 15000,
		label    = "Fertilizing",
		canCancel = true,
		controlDisables = {
			disableMovement    = true,
			disableCarMovement = true,
			disableMouse       = false,
			disableCombat      = true,
		},
		animation = {
			animDict = "anim@amb@clubhouse@tutorial@bkr_tut_ig3@",
			anim     = "machinic_loop_mechandplayer",
			flags    = 49,
		},
	}, function(cancelled)
		if not cancelled then
			exports["strata"]:ServerCallback("Weed:FertilizePlant", data, function() end)
		end
	end)
end)

AddEventHandler("Weed:Client:Water", function(pId)
	if not exports.st_inventory:ItemsHas("water", 1) then return end
	exports['st_ui']:ListMenuClose()
	exports['st_ui']:Progress({
		name     = "water_weed",
		duration = 6000,
		label    = "Watering",
		canCancel = true,
		controlDisables = {
			disableMovement    = true,
			disableCarMovement = true,
			disableMouse       = false,
			disableCombat      = true,
		},
		animation = { anim = "wateringcan" },
	}, function(cancelled)
		if not cancelled then
			exports["strata"]:ServerCallback("Weed:WaterPlant", pId, function() end)
		end
	end)
end)

AddEventHandler("Weed:Client:Harvest", function(entity, data)
	exports['st_ui']:Progress({
		name     = "harvest_weed",
		duration = 6000,
		label    = "Harvesting",
		canCancel = true,
		controlDisables = {
			disableMovement    = true,
			disableCarMovement = true,
			disableMouse       = false,
			disableCombat      = true,
		},
		animation = {
			animDict = "anim@amb@clubhouse@tutorial@bkr_tut_ig3@",
			anim     = "machinic_loop_mechandplayer",
			flags    = 49,
		},
	}, function(cancelled)
		if not cancelled then
			exports["strata"]:ServerCallback("Weed:HarvestPlant", GetWeedPlant(entity.entity), function() end)
		end
	end)
end)

AddEventHandler("Weed:Client:Harvest2", function(nId)
	exports['st_ui']:ListMenuClose()
	exports['st_ui']:Progress({
		name     = "harvest_weed",
		duration = 6000,
		label    = "Harvesting",
		canCancel = true,
		controlDisables = {
			disableMovement    = true,
			disableCarMovement = true,
			disableMouse       = false,
			disableCombat      = true,
		},
		animation = {
			animDict = "anim@amb@clubhouse@tutorial@bkr_tut_ig3@",
			anim     = "machinic_loop_mechandplayer",
			flags    = 49,
		},
	}, function(cancelled)
		if not cancelled then
			exports["strata"]:ServerCallback("Weed:HarvestPlant", nId, function() end)
		end
	end)
end)

AddEventHandler("Weed:Client:Destroy", function(nId)
	exports['st_ui']:Progress({
		name     = "destroy_weed",
		duration = 8000,
		label    = "Destroying",
		canCancel = true,
		controlDisables = {
			disableMovement    = true,
			disableCarMovement = true,
			disableMouse       = false,
			disableCombat      = true,
		},
		animation = {
			animDict = "anim@amb@clubhouse@tutorial@bkr_tut_ig3@",
			anim     = "machinic_loop_mechandplayer",
			flags    = 49,
		},
	}, function(cancelled)
		if not cancelled then
			exports["strata"]:ServerCallback("Weed:DestroyPlant", nId, function() end)
		end
	end)
end)

AddEventHandler("Weed:Client:PDDestroy", function(entity)
	exports['st_ui']:Progress({
		name     = "harvest_weed",
		duration = 4000,
		label    = "Destroying",
		canCancel = true,
		controlDisables = {
			disableMovement    = true,
			disableCarMovement = true,
			disableMouse       = false,
			disableCombat      = true,
		},
		animation = {
			animDict = "anim@amb@clubhouse@tutorial@bkr_tut_ig3@",
			anim     = "machinic_loop_mechandplayer",
			flags    = 49,
		},
	}, function(cancelled)
		if not cancelled then
			exports["strata"]:ServerCallback("Weed:PDDestroyPlant", GetWeedPlant(entity.entity), function() end)
		end
	end)
end)

AddEventHandler("Weed:Client:Package", function()
	exports["strata"]:ServerCallback("Weed:BuyPackage", {}, function() end)
end)

-- ─── Logout ──────────────────────────────────────────────────────────────────

RegisterNetEvent("Characters:Client:Logout", function()
	for _, ent in pairs(_spawnedPlants) do
		DeleteEntity(ent)
	end
	_activePlants  = {}
	_spawnedPlants = {}
	_nearbyPlants  = {}
	collectgarbage()
end)

-- ─── Resource start ───────────────────────────────────────────────────────────

AddEventHandler("onClientResourceStart", function(resource)
	if resource ~= GetCurrentResourceName() then return end

	for _, v in ipairs(Plants) do
		exports['st_target']:addModel(v.model, v.targeting)
	end

	registerCallbacks()

	exports['st_zones']:CreatePoly("casino_roof_weed_blocker", {
		vector2(909.12774658203,  68.336456298828),
		vector2(892.63311767578,  34.766555786133),
		vector2(904.96075439453,  22.200096130371),
		vector2(894.90655517578,   1.1801514625549),
		vector2(922.87658691406, -17.753396987915),
		vector2(932.50738525391,  -8.3494606018066),
		vector2(958.59307861328, -23.690893173218),
		vector2(1018.4107055664,  62.70947265625),
		vector2(984.884765625,    89.045021057129),
		vector2(970.19580078125,  90.825546264648),
		vector2(948.73913574219,  85.602745056152),
	}, { minZ = 105.0, maxZ = 145.0 }, {})

	CreateThread(function()
		for _, v in ipairs(Plants) do
			Strata.World.StageModel(v.model)
		end
	end)
end)
