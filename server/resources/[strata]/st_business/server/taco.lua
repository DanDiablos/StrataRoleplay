local _currentCookItem = nil
local _deliveryCounter = 0
local _itemCount = 1
local _dropOffItem = "taco_bag"
local _maxRolls = 10
local _maxBands = 3

AddEventHandler("Businesses:Server:Startup", function()
	-- Init cook stuff
	_currentCookItem = math.random(#_tacoFoodItems)
	GlobalState["TacoShop:Counter"] = _deliveryCounter
	GlobalState["TacoShop:CurrentItem"] = _currentCookItem
	TriggerClientEvent("Taco:SetQueue", -1, { counter = _deliveryCounter, item = _currentCookItem })

	exports['st_chars']:RepCreate("TacoDelivery", "Taco Delivery", {
		{ label = "Rank 1",   value = 500 },
		{ label = "Rank 2",   value = 1000 },
		{ label = "Rank 3",   value = 2500 },
		{ label = "Rank 4",   value = 4000 },
		{ label = "Rank 5",   value = 5000 },
		{ label = "Pls Stop", value = 7500 },
	}, false) -- hidden rep

	exports['st_chars']:RepCreate("TacoCrafter", "Taco Artist", {
		{ label = "Rank 1",   value = 500 },
		{ label = "Rank 2",   value = 1000 },
		{ label = "Rank 3",   value = 2500 },
		{ label = "Rank 4",   value = 4000 },
		{ label = "Rank 5",   value = 5000 },
		{ label = "Pls Stop", value = 7500 },
	}, false) -- hidden rep

	exports["strata"]:RegisterServerCallback("Taco:GetNewQueueItem", function(source, data, cb)
		_currentCookItem = math.random(#_tacoFoodItems)
		GlobalState["TacoShop:Counter"] = _deliveryCounter
		GlobalState["TacoShop:CurrentItem"] = _currentCookItem
		TriggerClientEvent("Taco:SetQueue", -1, { counter = _deliveryCounter, item = _currentCookItem })
		cb(true)
	end)

	exports["strata"]:RegisterServerCallback("Taco:SetState", function(source, data, cb)
		TriggerClientEvent("Taco:PickupState", -1, data)
		cb(true)
	end)

	exports["strata"]:RegisterServerCallback("Tacos:AddToQueue", function(source, data, cb)
		local char = Strata.User.Find(source)
		if char then
			local count = exports.st_inventory:ItemsGetCount(char:GetData("SID"), 1, data.item) or 0
			if count > 0 then
				local itemData = exports.st_inventory:ItemsGetData(data.item)

				if itemData and exports.st_inventory:Remove(char:GetData("SID"), 1, data.item, _itemCount) then
					_deliveryCounter = _deliveryCounter + 1
					if _deliveryCounter > _tacoQueue.maxQueue then
						_deliveryCounter = _tacoQueue.maxQueue
					end

					local _tacoArtistCash = math.random(15, 30)
					local repLevel = exports['st_chars']:RepGetLevel(source, "TacoCrafter") or 0
					if repLevel > 0 then
						_tacoArtistCash = math.floor(_tacoArtistCash * repLevel)
					end
					exports['st_finance']:WalletModify(source, _tacoArtistCash)
					exports['st_chars']:RepAdd(source, "TacoCrafter", 1)

					cb(true)
				end
			else
				cb(false)
			end
		end
	end)

	exports["strata"]:RegisterServerCallback("Tacos:Pickup", function(source, data, cb)
		local char = Strata.User.Find(source)
		if char then
			_deliveryCounter = _deliveryCounter - 1
			if _deliveryCounter < 0 then
				_deliveryCounter = 0
			end
			exports.st_inventory:AddItem(char:GetData("SID"), _dropOffItem, 1, {}, 1)
			GlobalState["TacoShop:Counter"] = _deliveryCounter
			GlobalState["TacoShop:CurrentItem"] = _currentCookItem
			TriggerClientEvent("Taco:SetQueue", -1, { counter = _deliveryCounter, item = _currentCookItem })
			cb(true)
		end
	end)

	exports["strata"]:RegisterServerCallback("Tacos:Dropoff", function(source, data, cb)
		local char = Strata.User.Find(source)
		if char then
			local count = exports.st_inventory:ItemsGetCount(char:GetData("SID"), 1, _dropOffItem) or 0
			if count > 0 then
				local itemData = exports.st_inventory:ItemsGetData(_dropOffItem)

				if itemData and exports.st_inventory:Remove(char:GetData("SID"), 1, _dropOffItem, _itemCount) then
					local repLevel = exports['st_chars']:RepGetLevel(source, "TacoDelivery") or 0
					local repGained = 1
					local _tacoDeliveryCash = math.random(15, 30)
					if repLevel > 0 then
						_tacoDeliveryCash = math.floor(_tacoDeliveryCash * repLevel)
					end

					if exports.st_inventory:ItemsHas(char:GetData("SID"), 1, "moneyroll", 1) then
						local _moneyRollCount = exports.st_inventory:ItemsGetCount(char:GetData("SID"), 1,
							"moneyroll")
						local itemDataMoneyRoll = exports.st_inventory:ItemsGetData("moneyroll")
						if _moneyRollCount >= _maxRolls then
							if
								itemDataMoneyRoll
								and exports.st_inventory:Remove(char:GetData("SID"), 1, "moneyroll", _maxRolls)
							then
								local _moneyRollOutput = math.floor(
									((_tacoConfig.tacoPricing[repLevel] / 100) * itemDataMoneyRoll.price) * _maxRolls
								)
								_tacoDeliveryCash = _tacoDeliveryCash + _moneyRollOutput
								repGained = repGained + math.random(3)
							end
						end
					elseif exports.st_inventory:ItemsHas(char:GetData("SID"), 1, "moneyband", 1) then
						local _moneyBandCount = exports.st_inventory:ItemsGetCount(char:GetData("SID"), 1,
							"moneyband")
						local itemDataMoneyBand = exports.st_inventory:ItemsGetData("moneyband")
						if _moneyBandCount >= _maxBands then
							if
								itemDataMoneyBand
								and exports.st_inventory:Remove(char:GetData("SID"), 1, "moneyband", _maxBands)
							then
								local _moneyBandOutput = math.floor(
									((_tacoConfig.tacoPricing[repLevel] / 100) * itemDataMoneyBand.price) * _maxBands
								)
								_tacoDeliveryCash = _tacoDeliveryCash + _moneyBandOutput
								repGained = repGained + math.random(3)
							end
						end
					end

					exports['st_finance']:WalletModify(source, _tacoDeliveryCash)
					exports['st_chars']:RepAdd(source, "TacoDelivery", repGained)

					cb(true)
				end
			else
				cb(false)
			end
		end
	end)
end)
