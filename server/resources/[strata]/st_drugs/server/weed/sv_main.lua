---@class WeedPlant
---@field isMale boolean
---@field location { x: number, y: number, z: number }
---@field growth number   0-100
---@field output number   accumulates quality
---@field material number joaat hash of ground material
---@field planted number  os.time() of plant creation
---@field water number    percentage; plant dies below -25
---@field fertilizer { type: string, value: number, time: number }|nil
---@field _id number      DB row id

---@class WeedPlantEntry
---@field plant WeedPlant
---@field stage number    1-indexed into Plants[]

-- ─── State ───────────────────────────────────────────────────────────────────

local _plants           = {} ---@type table<number, WeedPlantEntry>
local _packagesAvailable = 5
local _weedBuyers       = {} ---@type table<number, boolean>  keyed by char ID
local _pendingJointUse  = {} ---@type table<number, string>   src → actionId
local _weedDealer       = Locations[tostring(os.date("%w"))]

-- ─── Helpers ─────────────────────────────────────────────────────────────────

---@param pct number
---@return number
local function getStageByPct(pct)
	local stagePct = 100 / (#Plants - 1)
	return math.floor((pct / stagePct) + 1.5)
end

---@param source number
---@param id number
---@return boolean
local function checkNearPlant(source, id)
	if not _plants[id] then return false end
	local coords = GetEntityCoords(GetPlayerPed(source))
	return #(
		vector3(coords.x, coords.y, coords.z)
		- vector3(_plants[id].plant.location.x, _plants[id].plant.location.y, _plants[id].plant.location.z)
	) <= 5
end

local saveQuery = 'INSERT INTO weed (id, is_male, x, y, z, growth, output, material, planted, water, fertilizer_type, fertilizer_value, fertilizer_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE is_male=VALUES(is_male), x=VALUES(x), y=VALUES(y), z=VALUES(z), growth=VALUES(growth), output=VALUES(output), material=VALUES(material), planted=VALUES(planted), water=VALUES(water), fertilizer_type=VALUES(fertilizer_type), fertilizer_value=VALUES(fertilizer_value), fertilizer_time=VALUES(fertilizer_time)'

---@param plant WeedPlant
---@return table
local function buildSaveValues(plant)
	return {
		plant._id,
		plant.isMale and 1 or 0,
		plant.location.x, plant.location.y, plant.location.z,
		plant.growth, plant.output, plant.material, plant.planted, plant.water,
		plant.fertilizer and plant.fertilizer.type  or nil,
		plant.fertilizer and plant.fertilizer.value or nil,
		plant.fertilizer and plant.fertilizer.time  or nil,
	}
end

local function saveAllPlants()
	local queries = {}
	for _, v in pairs(_plants) do
		if v and v.plant then
			table.insert(queries, { query = saveQuery, values = buildSaveValues(v.plant) })
		end
	end
	if #queries > 0 then
		Strata.Log.Info("Weed", string.format("Saving ^2%s^7 Plants", #queries))
		MySQL.transaction(queries)
	end
end

-- ─── Exports ─────────────────────────────────────────────────────────────────

---Update a plant's cached stage and broadcast to clients.
---@param id number
---@param isUpdate boolean  true triggers a client entity respawn
---@param skipEvent? boolean  if true, return the update payload instead of broadcasting
---@return { id: number, plant: WeedPlantEntry, update: boolean }|nil
exports('PlantingSet', function(id, isUpdate, skipEvent)
	if not _plants[id] then return end
	_plants[id].stage = getStageByPct(_plants[id].plant.growth)
	if skipEvent then
		return { id = id, plant = _plants[id], update = isUpdate }
	end
	TriggerClientEvent("Weed:Client:Objects:Update", -1, id, _plants[id], isUpdate)
end)

---Remove a plant from memory and notify clients.
---@param id number
exports('PlantingDelete', function(id)
	if not _plants[id] then return end
	_plants[id] = nil
	TriggerClientEvent("Weed:Client:Objects:Delete", -1, id)
end)

---Insert a new plant into the DB and return the hydrated plant object.
---@param isMale boolean
---@param location { x: number, y: number, z: number }
---@param material number
---@return WeedPlant|nil
exports('PlantingCreate', function(isMale, location, material)
	local p = promise.new()
	local weed = {
		isMale   = isMale,
		location = location,
		growth   = 0,
		output   = 1,
		material = material,
		planted  = os.time(),
		water    = 100.0,
	} ---@type WeedPlant
	MySQL.insert(
		'INSERT INTO weed (is_male, x, y, z, growth, output, material, planted, water) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
		{ isMale and 1 or 0, location.x, location.y, location.z, 0, 1, material, weed.planted, 100.0 },
		function(insertId)
			if not insertId then return p:resolve(nil) end
			weed._id = insertId
			p:resolve(weed)
		end)
	return Citizen.Await(p)
end)

-- ─── Startup ──────────────────────────────────────────────────────────────────

local function startup()
	MySQL.query('SELECT * FROM weed', {}, function(results)
		local count = 0
		for _, v in ipairs(results) do
			local plant = {
				isMale   = v.is_male == 1,
				location = { x = v.x, y = v.y, z = v.z },
				growth   = v.growth,
				output   = v.output,
				material = v.material,
				planted  = v.planted,
				water    = v.water,
				fertilizer = v.fertilizer_type and
					{ type = v.fertilizer_type, value = v.fertilizer_value, time = v.fertilizer_time } or nil,
				_id = v.id,
			} ---@type WeedPlant
			if os.time() - plant.planted <= WeedConfig.Lifetime then
				_plants[plant._id] = { plant = plant, stage = getStageByPct(plant.growth) }
				count = count + 1
			end
		end
		Strata.Log.Trace("Weed", string.format("Loaded ^2%s^7 Weed Plants", count), { console = true })
	end)

	exports['st_chars']:RepCreate("weed", "Weed", {
		{ label = "Rank 1", value = 3000  },
		{ label = "Rank 2", value = 6000  },
		{ label = "Rank 3", value = 12000 },
		{ label = "Rank 4", value = 21000 },
		{ label = "Rank 5", value = 50000 },
	}, true)
end

-- ─── Callbacks ───────────────────────────────────────────────────────────────

local function registerCallbacks()
	exports["strata"]:RegisterServerCallback("Weed:CheckPlant", function(source, pid, cb)
		if not pid or not _plants[pid] then return cb(nil) end
		if not checkNearPlant(source, pid) then return cb(nil) end
		cb({
			plant  = _plants[pid].plant,
			ground = GroundTypes[Materials[_plants[pid].plant.material].groundType],
		})
	end)

	exports["strata"]:RegisterServerCallback("Weed:WaterPlant", function(source, pid, cb)
		if not pid or not _plants[pid] then return cb(nil) end
		if not checkNearPlant(source, pid) then return cb(nil) end
		local char = Strata.User.Find(source)
		if not char then return cb(nil) end

		if _plants[pid].plant.water >= 100 then
			exports['st_ui']:Notification(source, "error", "Plant Is Already Watered")
			return cb(nil)
		end
		if not exports.st_inventory:ItemsHas(char:GetData("SID"), 1, "water", 1) then
			exports['st_ui']:Notification(source, "error", "You Don't Have Water")
			return cb(nil)
		end

		exports.st_inventory:Remove(char:GetData("SID"), 1, "water", 1)
		local amt = math.min(10.0, 100 - _plants[pid].plant.water)
		_plants[pid].plant.water = _plants[pid].plant.water + amt
		cb(true)
	end)

	exports["strata"]:RegisterServerCallback("Weed:FertilizePlant", function(source, data, cb)
		if not data or not data.id or not _plants[data.id] then return cb(nil) end
		if not checkNearPlant(source, data.id) then return cb(nil) end
		local char = Strata.User.Find(source)
		if not char then return cb(nil) end

		if _plants[data.id].plant.fertilizer then
			exports['st_ui']:Notification(source, "error", "Plant Is Already Fertilized")
			return cb(nil)
		end
		local itemName = string.format("fertilizer_%s", data.type)
		if not exports.st_inventory:ItemsHas(char:GetData("SID"), 1, itemName, 1) then
			exports['st_ui']:Notification(source, "error", "You Don't Have Fertilizer")
			return cb(nil)
		end

		exports.st_inventory:Remove(char:GetData("SID"), 1, itemName, 1)
		_plants[data.id].plant.fertilizer = {
			type  = data.type,
			time  = WeedConfig.Fertilizer[data.type].time,
			value = WeedConfig.Fertilizer[data.type].value,
		}
		cb(true)
	end)

	exports["strata"]:RegisterServerCallback("Weed:HarvestPlant", function(source, pid, cb)
		if not pid or not _plants[pid] then return cb(nil) end
		if not checkNearPlant(source, pid) then return cb(nil) end
		local char = Strata.User.Find(source)
		if not char then return cb(nil) end

		local stage = Plants[getStageByPct(_plants[pid].plant.growth)]
		if not stage.harvestable then return cb(nil) end

		if _plants[pid].plant.isMale then
			local luck   = math.random(100)
			local giving = luck >= (100 - WeedConfig.FemSeedChance) and "weedseed_female" or "weedseed_male"
			local count  = math.random(math.ceil(_plants[pid].plant.output / 16))
			if exports.st_inventory:AddItem(char:GetData("SID"), giving, count, {}, 1) then
				exports['st_drugs']:PlantingDelete(pid)
				Strata.Log.Info("Weed", string.format("%s %s (%s) Harvested A Weed Plant",
					char:GetData("First"), char:GetData("Last"), char:GetData("SID")))
				cb(true)
			else
				cb(false)
			end
		else
			local count = math.max(3, math.random(math.ceil(_plants[pid].plant.output / 4)))
			if exports.st_inventory:AddItem(char:GetData("SID"), "weed_bud", count, {}, 1) then
				exports['st_drugs']:PlantingDelete(pid)
				cb(true)
			else
				cb(false)
			end
		end
	end)

	exports["strata"]:RegisterServerCallback("Weed:DestroyPlant", function(source, pid, cb)
		if not pid or not _plants[pid] then return cb(nil) end
		if not checkNearPlant(source, pid) then return cb(nil) end
		local char = Strata.User.Find(source)
		if not char then return cb(nil) end

		exports['st_drugs']:PlantingDelete(pid)
		Strata.Log.Info("Weed", string.format("%s %s (%s) Destroyed A Weed Plant",
			char:GetData("First"), char:GetData("Last"), char:GetData("SID")))
		exports['st_ui']:Notification(source, "success", "Plant Has Been Destroyed")
		cb(true)
	end)

	exports["strata"]:RegisterServerCallback("Weed:PDDestroyPlant", function(source, pid, cb)
		if not pid or not _plants[pid] then return cb(nil) end
		if not checkNearPlant(source, pid) then return cb(nil) end
		if Player(source).state.onDuty ~= "police" then return cb(nil) end
		local char = Strata.User.Find(source)
		if not char then return cb(nil) end

		exports['st_drugs']:PlantingDelete(pid)
		Strata.Log.Info("Weed", string.format("%s %s (%s) PD Destroyed A Weed Plant",
			char:GetData("First"), char:GetData("Last"), char:GetData("SID")))
		exports['st_ui']:Notification(source, "success", "Plant Has Been Destroyed")
		cb(true)
	end)

	exports["strata"]:RegisterServerCallback("Weed:BuyPackage", function(source, data, cb)
		local char = Strata.User.Find(source)
		if not char then return cb(false) end

		if _packagesAvailable <= 0 then
			exports['st_ui']:Notification(source, "error", "No Packages Available")
			return cb(false)
		end
		if _weedBuyers[char:GetData("ID")] then
			exports['st_ui']:Notification(source, "error", "You've Already Bought A Package")
			return cb(false)
		end
		if not exports['st_finance']:WalletModify(source, -WeedConfig.PackagePrice) then
			exports['st_ui']:Notification(source, "error", "Dont Have Enough Cash")
			return cb(false)
		end

		_packagesAvailable -= 1
		_weedBuyers[char:GetData("ID")] = true

		local luck    = math.random(100)
		local seed    = luck >= 95 and "weedseed_female" or "weedseed_male"
		local fertil  = luck >= 66 and "fertilizer_phosphorus" or (luck >= 33 and "fertilizer_potassium" or "fertilizer_nitrogen")

		exports.st_inventory:AddItem(char:GetData("SID"), seed,   2, {}, 1)
		exports.st_inventory:AddItem(char:GetData("SID"), fertil, 2, {}, 1)

		Strata.Log.Info("Weed", string.format("%s %s (%s) Bought Weed Package",
			char:GetData("First"), char:GetData("Last"), char:GetData("SID")))
		cb(true)
	end)
end

-- ─── Items ───────────────────────────────────────────────────────────────────

local function registerItems()
	local function plantSeed(source, isMale)
		if GlobalState[string.format("%s:House", source)] ~= nil then
			exports['st_ui']:Notification(source, "error", "Plant Needs Natural Light")
			return
		end
		if GetVehiclePedIsIn(GetPlayerPed(source)) ~= 0 then
			exports['st_ui']:Notification(source, "error", "Can't Plant While In A Vehicle")
			return
		end
		local char = Strata.User.Find(source)
		if not char then return end

		exports["strata"]:ClientCallback(source, "Weed:PlantingAnim", {}, function(data)
			if data.error then
				if data.error == 2 then
					exports['st_ui']:Notification(source, "error", "Need Better Soil")
				elseif data.error == 3 then
					exports['st_ui']:Notification(source, "error", "Too Close")
				end
				return
			end

			local itemName = isMale and "weedseed_male" or "weedseed_female"
			exports.st_inventory:RemoveList(char:GetData("SID"), 1, { { name = itemName, count = 1 } })

			local plant = exports['st_drugs']:PlantingCreate(
				isMale,
				{ x = data.coords.x, y = data.coords.y, z = data.coords.z },
				data.material
			)
			if not plant then return end

			_plants[plant._id] = { plant = plant }
			exports['st_drugs']:PlantingSet(plant._id, false)
		end)
	end

	exports.st_inventory:RegisterUse("weedseed_male",   "Weed", function(source) plantSeed(source, true)  end)
	exports.st_inventory:RegisterUse("weedseed_female", "Weed", function(source) plantSeed(source, false) end)

	exports.st_inventory:RegisterUse("rolling_paper", "Weed", function(source)
		local char = Strata.User.Find(source)
		if not char then return end
		if not exports.st_inventory:ItemsHas(char:GetData("SID"), 1, "weed_bud", 1) then
			exports['st_ui']:Notification(source, "error", "You need bud to do this")
			return
		end
		exports["strata"]:ClientCallback(source, "Weed:RollingAnim", {}, function(success)
			if not success then return end
			exports.st_inventory:RemoveList(char:GetData("SID"), 1,
				{ { name = "rolling_paper", count = 1 }, { name = "weed_bud", count = 1 } })
			exports.st_inventory:AddItem(char:GetData("SID"), "weed_joint", 2, {}, 1)
		end)
	end)

	exports.st_inventory:RegisterUse("weed_joint", "Weed", function(source, item)
		local src = tonumber(source)
		if not src then return end
		local actionId = ("%s:%s"):format(src, GetGameTimer())
		_pendingJointUse[src] = actionId
		TriggerClientEvent("Weed:Client:SmokeJoint", src, item and (item.slot or item.Slot), actionId)
	end)

	RegisterNetEvent("Weed:Server:SmokeJointComplete", function(slot, actionId)
		local src = source
		if not actionId or _pendingJointUse[src] ~= actionId then return end
		_pendingJointUse[src] = nil

		local removed = exports.st_inventory:RemoveItem(src, "weed_joint", 1, nil, slot)
		if not removed then
			removed = exports.st_inventory:RemoveItem(src, "weed_joint", 1)
		end
		if not removed then
			exports['st_ui']:Notification(src, "error", "Joint not found")
			return
		end

		exports['st_utils']:Remove(src, "PLAYER_STRESS", 50)
		exports['st_ui']:Notification(src, "success", "You feel relaxed")
	end)

	exports.st_inventory:RegisterUse("weed_brick", "Weed", function(source, item)
		local char = Strata.User.Find(source)
		if not char then return end
		exports["strata"]:ClientCallback(source, "Weed:MakingBrick", { label = "Unpacking Brick", time = 10 }, function(success)
			if not success then return end
			exports.st_inventory:RemoveList(char:GetData("SID"), 1, { { name = "weed_brick", count = 1 } })
			exports.st_inventory:AddItem(char:GetData("SID"), "weed_bud", 200, {}, 1)
		end)
	end)

	exports.st_inventory:RegisterUse("weed_baggy", "Weed", function(source, item)
		local char = Strata.User.Find(source)
		if not char then return end
		exports["strata"]:ClientCallback(source, "Weed:MakingBrick", { label = "Removing Bud", time = 3 }, function(success)
			if not success then return end
			exports.st_inventory:RemoveList(char:GetData("SID"), 1, { { name = "weed_baggy", count = 1 } })
			exports.st_inventory:AddItem(char:GetData("SID"), "weed_bud", 2, {}, 1)
		end)
	end)
end

-- ─── Middleware ───────────────────────────────────────────────────────────────

local function registerMiddleware()
	exports['strata']:MiddlewareAdd("Characters:Spawning", function(source)
		TriggerClientEvent("Weed:Client:Login", source, _weedDealer)
		TriggerLatentClientEvent("Weed:Client:Objects:Init", source, 10000, _plants)
	end)
end

AddEventHandler("Characters:Server:PlayerLoggedOut", function(source)
	Player(source).state.WeedZone = nil
end)

-- ─── Background tasks ─────────────────────────────────────────────────────────

local function startTasks()
	-- Save every 10 minutes
	CreateThread(function()
		while true do
			Wait((1000 * 60) * 10)
			saveAllPlants()
		end
	end)

	-- Save on server save event
	AddEventHandler("Core:Server:ForceSave", saveAllPlants)

	-- Grow plants every 10 minutes
	CreateThread(function()
		while true do
			Wait((1000 * 60) * 10)
			Strata.Log.Trace("Weed", "Growing Plants")
			local updatingStuff = {}

			for k, v in pairs(_plants) do
				if (os.time() - v.plant.planted) >= WeedConfig.Lifetime then
					Strata.Log.Trace("Weed", "Deleting expired weed plant")
					exports['st_drugs']:PlantingDelete(k)
				elseif v.plant.growth < 100 then
					local mat = Materials[v.plant.material]
					local gt  = mat and GroundTypes[mat.groundType]
					if not gt then
						exports['st_drugs']:PlantingDelete(k)
					else
						local phosphorus = gt.phosphorus
						if v.plant.fertilizer and v.plant.fertilizer.type == "phosphorus" then
							phosphorus = phosphorus + v.plant.fertilizer.value
						end
						v.plant.growth = v.plant.growth + (1 + phosphorus)
						if v.stage ~= getStageByPct(v.plant.growth) then
							local res = exports['st_drugs']:PlantingSet(k, true, true)
							if res then table.insert(updatingStuff, res) end
						end
					end
				end
			end

			if #updatingStuff > 0 then
				TriggerLatentClientEvent("Weed:Client:Objects:UpdateMany", -1, 30000, updatingStuff)
			end
		end
	end)

	-- Increase output every 20 minutes
	CreateThread(function()
		while true do
			Wait((1000 * 60) * 20)
			Strata.Log.Trace("Weed", "Increasing Plant Outputs")
			for _, v in pairs(_plants) do
				if v.plant.growth < 100 then
					local mat = Materials[v.plant.material]
					local gt  = mat and GroundTypes[mat.groundType]
					if gt then
						local nitrogen = gt.nitrogen
						if v.plant.fertilizer and v.plant.fertilizer.type == "nitrogen" then
							nitrogen = nitrogen + v.plant.fertilizer.value
						end
						v.plant.output = (v.plant.output or 0) + (1 * (1 + nitrogen))
					end
				end
			end
		end
	end)

	-- Degrade water every 10 minutes
	CreateThread(function()
		while true do
			Wait((1000 * 60) * 10)
			Strata.Log.Trace("Weed", "Degrading Water")
			for k, v in pairs(_plants) do
				if v.plant.water <= -25 then
					Strata.Log.Trace("Weed", "Deleting dehydrated weed plant")
					exports['st_drugs']:PlantingDelete(k)
				else
					local mat = Materials[v.plant.material]
					local gt  = mat and GroundTypes[mat.groundType]
					if not gt then
						exports['st_drugs']:PlantingDelete(k)
					else
						local potassium = gt.potassium
						if v.plant.fertilizer and v.plant.fertilizer.type == "potassium" then
							potassium = potassium + v.plant.fertilizer.value
						end
						v.plant.water = v.plant.water - ((1.0 * (1.0 + (1.0 - potassium))) - gt.water)
					end
				end
			end
		end
	end)

	-- Tick down fertilizer every minute
	CreateThread(function()
		while true do
			Wait(1000 * 60)
			for _, v in pairs(_plants) do
				if v.plant.fertilizer then
					if v.plant.fertilizer.time > 0 then
						v.plant.fertilizer.time = v.plant.fertilizer.time - 1
					else
						v.plant.fertilizer = nil
					end
				end
			end
		end
	end)
end

-- ─── Resource start ───────────────────────────────────────────────────────────

AddEventHandler("onResourceStart", function(resource)
	if resource ~= GetCurrentResourceName() then return end
	startup()
	Wait(1000)
	registerMiddleware()
	registerCallbacks()
	startTasks()
	registerItems()
end)

-- Register items when st_inventory starts after this resource
RegisterNetEvent("st_inventory:ready", function()
	if GetResourceState(GetCurrentResourceName()) == "started" then
		registerItems()
	end
end)
