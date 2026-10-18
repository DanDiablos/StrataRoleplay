local _JOB = "Hunting"
local _joiners = {}
local _hunting = {}

local _baitCds = {}

local _saleData = {
	[1] = { rep = 4, price = 750, item = "hide_tier1" },
	[2] = { rep = 5, price = 1500, item = "hide_tier2" },
	[3] = { rep = 6, price = 2000, item = "hide_tier3" },
	[4] = { rep = 7, price = 3500, item = "hide_tier4" },
}

AddEventHandler("Labor:Server:Startup", function()
	RegisterHuntingItems()

	exports['strata']:MiddlewareAdd("Characters:Spawning", function(source)
		TriggerClientEvent("Hunting:Client:Polys", source, HuntingConfig)
	end)

	exports['st_utils']:VendorCreate("HuntingBaits", false, "Hunting", false, {}, {
		{ id = 1, item = "cow_bait",     price = 250,  qty = -1, vpn = false, rep = "Hunting", repLvl = 2, },
		{ id = 2, item = "chicken_bait", price = 250,  qty = -1, vpn = false, rep = "Hunting", repLvl = 2, },
		{ id = 3, item = "rabbit_bait",  price = 250,  qty = -1, vpn = false, rep = "Hunting", repLvl = 2, },
		{ id = 4, item = "pig_bait",     price = 250,  qty = -1, vpn = false, rep = "Hunting", repLvl = 2, },
		{ id = 5, item = "boar_bait",    price = 250,  qty = -1, vpn = false, rep = "Hunting", repLvl = 4, },
		{ id = 6, item = "deer_bait",    price = 250,  qty = -1, vpn = false, rep = "Hunting", repLvl = 4, },
		{ id = 7, item = "exotic_bait",  price = 1000, qty = -1, vpn = false, rep = "Hunting", repLvl = 7, },
	}, "badge-dollar", "Hunting")

	exports["strata"]:RegisterServerCallback("Hunting:StartJob", function(source, data, cb)
		if _hunting[data] ~= nil and _hunting[data].state == 0 then
			_hunting[_joiners[source]].state = 1
			exports['st_jobs']:StartOffer(_joiners[source], _JOB, "Harvest Animals", 6)
			TriggerClientEvent(string.format("Hunting:Client:%s:Startup", data), -1)
			cb(true)
		else
			cb(false)
		end
	end)

	exports["strata"]:RegisterServerCallback("Hunting:FinishJob", function(source, data, cb)
		if _joiners[source] ~= nil and _hunting[_joiners[source]].state == 2 then
			_hunting[_joiners[source]].state = 3
			exports['st_jobs']:SendWorkgroupEvent(_joiners[source],
				string.format("Hunting:Client:%s:FinishJob", _joiners[source]))
			exports['st_jobs']:ManualFinishOffer(_joiners[source], _JOB)
			cb(true)
		else
			cb(false)
		end
	end)

	exports["strata"]:RegisterServerCallback("Hunting:HarvestAnimal", function(source, data, cb)
		local char = Strata.User.Find(source)
		local luck = math.random(100)
		local animal = data.animal
		local isSpawned = data.isSpawned
		if
			char:GetData("TempJob") ~= _JOB
			or _joiners[source] == nil
			or (_joiners[source] ~= nil and _hunting[_joiners[source]]) ~= nil
		then
			luck = luck - 25
		end

		if isSpawned then -- Only Allow Hides for Baited Animals
			if luck >= 90 then
				exports.st_inventory:AddItem(char:GetData("SID"), "hide_tier4", 1, {}, 1)
			elseif luck >= 80 then
				exports.st_inventory:AddItem(char:GetData("SID"), "hide_tier3", 1, {}, 1)
			elseif luck >= 70 then
				exports.st_inventory:AddItem(char:GetData("SID"), "hide_tier2", 1, {}, 1)
			elseif luck >= 50 then
				exports.st_inventory:AddItem(char:GetData("SID"), "hide_tier1", 1, {}, 1)
			end
		end

		if #HuntingSrvConfig.Loot[animal] > 0 then
			exports.st_inventory:LootCustomSetWithCount(HuntingSrvConfig.Loot[animal], char:GetData("SID"), 1)
		end

		if char:GetData("TempJob") == _JOB and _joiners[source] ~= nil and _hunting[_joiners[source]] ~= nil then
			if exports['st_jobs']:UpdateOffer(_joiners[source], _JOB, 1, true) then
				_hunting[_joiners[source]].state = 2
				exports['st_jobs']:TaskOffer(_joiners[source], _JOB, "Talk To The Shop Owner")
				exports['st_jobs']:SendWorkgroupEvent(_joiners[source],
					string.format("Hunting:Client:%s:Finish", _joiners[source]))
			end
		end
	end)

	exports["strata"]:RegisterServerCallback("Hunting:GenerateAnimal", function(source, data, cb)
		exports["strata"]:ClientCallback(source, "Polyzone:GetAllZonesPlayerIn", {}, function(zones)
			local found = false
			for _, zone in ipairs(zones) do
				if zone and string.sub(zone.id, 1, string.len("hunting")) == "hunting" then
					local zoneId = tonumber(string.sub(zone.id, string.len("hunting") + 1))
					if HuntingConfig.Zones[zoneId] ~= nil then
						local anims = {}
						for k, v in ipairs(HuntingConfig.Baits[data].animals) do
							local animData = HuntingConfig.Animals[v]
							if not animData.Illegal or (animData.Illegal and HuntingConfig.Zones[zoneId].illegal) then
								table.insert(anims, animData)
							end
						end
						local animal = anims[math.random(#anims)]
						cb({
							animal = animal,
							isIllegal = HuntingConfig.Zones[zoneId].illegal,
						})

						found = true
						break
					end
				end
			end

			if not found then
				exports['st_ui']:Notification(source, "error", "Not Allowed To Hunt Here")
			end
		end)
	end)

	exports["strata"]:RegisterServerCallback("Hunting:Sell", function(source, data, cb)
		local char = Strata.User.Find(source)
		local repLvl = exports['st_chars']:RepGetLevel(source, _JOB)

		if _saleData[data] ~= nil then
			if repLvl >= _saleData[data].rep then
				local count = exports.st_inventory:ItemsGetCount(char:GetData("SID"), 1, _saleData[data].item) or
					0
				if count > 0 then
					if exports.st_inventory:Remove(char:GetData("SID"), 1, _saleData[data].item, count) then
						exports['st_finance']:WalletModify(source, _saleData[data].price * count)
					end
				else
					exports['st_ui']:Notification(source, "error",
						"You Have No Hides Of That Tier")
				end
			else
				exports['st_ui']:Notification(source, "error", "You Must Prove Yourself First")
			end
		end
	end)
end)

function RegisterHuntingItems()
	exports.st_inventory:RegisterUse("hunting_map_dark", "HuntingMap", function(source, itemData)
		if itemData then
			exports["strata"]:ClientCallback(source, "Hunting:Client:CanShowMap", itemData, function(canShow)
				TriggerClientEvent("Hunting:Client:ShowMap", source, itemData)
			end)
		end
	end)
	exports.st_inventory:RegisterUse("hunting_map_light", "HuntingMap", function(source, itemData)
		if itemData then
			exports["strata"]:ClientCallback(source, "Hunting:Client:CanShowMap", itemData, function(canShow)
				TriggerClientEvent("Hunting:Client:ShowMap", source, itemData)
			end)
		end
	end)

	for k, v in pairs(HuntingConfig.Baits) do
		exports.st_inventory:RegisterUse(k, "Hunting", function(source, item)
			if
				_baitCds[source] == nil
				or (os.time() - _baitCds[source]) >= HuntingConfig.Baits[item.Name].cooldown * 60
			then
				local char = Strata.User.Find(source)
				exports["strata"]:ClientCallback(source, "Polyzone:GetAllZonesPlayerIn", {}, function(zones)
					local found = false
					for _, zone in ipairs(zones) do
						if zone and string.sub(zone.id, 1, string.len("hunting")) == "hunting" then
							local zoneId = tonumber(string.sub(zone.id, string.len("hunting") + 1))
							if HuntingConfig.Zones[zoneId] ~= nil then
								exports["strata"]:ClientCallback(source, "Hunting:PlaceTrap", item.Name,
									function(successful)
										if successful then
											_baitCds[source] = os.time()
											exports.st_inventory:RemoveSlot(item.Owner, item.Name, 1, item.Slot,
												1)
										end
									end)

								found = true
								break
							end
						end
					end

					if not found then
						exports['st_ui']:Notification(source, "error", "Not Allowed To Hunt Here")
					end
				end)
			else
				exports['st_ui']:Notification(source, "error", "You Cannot Use Bait Yet")
			end
		end)
	end
end

RegisterNetEvent('st_inventory:ready', function()
	if GetResourceState(GetCurrentResourceName()) == 'started' then
		RegisterHuntingItems()
	end
end)

AddEventHandler("Hunting:Server:OnDuty", function(joiner, members, isWorkgroup)
	_joiners[joiner] = joiner
	_hunting[joiner] = {
		joiner = joiner,
		isWorkgroup = isWorkgroup,
		started = os.time(),
		state = 0,
	}

	local char = Strata.User.Find(joiner)
	char:SetData("TempJob", _JOB)
	exports['st_phone']:NotificationAdd(joiner, "Job Activity", "You started a job", os.time(), 6000, "labor",
		{})
	TriggerClientEvent("Hunting:Client:OnDuty", joiner, joiner, os.time())

	exports['st_jobs']:TaskOffer(joiner, _JOB, "Talk To The Shop Owner")
	if #members > 0 then
		for k, v in ipairs(members) do
			_joiners[v.ID] = joiner
			local member = Strata.User.Find(v.ID)
			member:SetData("TempJob", _JOB)
			exports['st_phone']:NotificationAdd(v.ID, "Job Activity", "You started a job", os.time(), 6000,
				"labor", {})
			TriggerClientEvent("Hunting:Client:OnDuty", v.ID, joiner, os.time())
		end
	end
end)

AddEventHandler("Hunting:Server:OffDuty", function(source, joiner)
	_joiners[source] = nil
	TriggerClientEvent("Hunting:Client:OffDuty", source)
end)

AddEventHandler("Hunting:Server:FinishJob", function(joiner)
	_hunting[joiner] = nil
end)
