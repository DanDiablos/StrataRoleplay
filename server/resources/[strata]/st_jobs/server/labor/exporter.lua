local _items = {
	perishable = {
		{ section = "perishable", item = "lettuce",  price = 1 },
		{ section = "perishable", item = "cucumber", price = 1 },
		{ section = "perishable", item = "tomato",   price = 1 },
		{ section = "perishable", item = "potato",   price = 1 },
		{ section = "perishable", item = "orange",   price = 1 },
		{ section = "perishable", item = "peas",     price = 1 },
	},
	crafting = {
		{ section = "crafting", item = "rubber",           price = 1 },
		{ section = "crafting", item = "plastic",          price = 1 },
		{ section = "crafting", item = "copperwire",       price = 1 },
		{ section = "crafting", item = "glue",             price = 1 },
		{ section = "crafting", item = "heavy_glue",       price = 1 },
		{ section = "crafting", item = "scrapmetal",       price = 1 },
		{ section = "crafting", item = "ironbar",          price = 1 },
		{ section = "crafting", item = "electronic_parts", price = 1 },
	},
}

local function getItemData(itemName)
	local ok, data = pcall(function()
		return exports.st_inventory:ItemsGetData(itemName)
	end)

	if ok and data then
		return data
	end

	ok, data = pcall(function()
		return exports.st_inventory:Items(itemName)
	end)

	if ok and data then
		return data
	end

	ok, data = pcall(function()
		return exports.st_inventory:ItemList(itemName)
	end)

	if ok and data then
		return data
	end

	return {
		label = itemName,
	}
end

local function getItemCount(inventoryId, itemName)
	local ok, count = pcall(function()
		return exports.st_inventory:ItemsGetCount(inventoryId, 1, itemName)
	end)

	if ok and type(count) == 'number' then
		return count
	end

	ok, count = pcall(function()
		return exports.st_inventory:Search(inventoryId, 'count', itemName)
	end)

	if ok and type(count) == 'number' then
		return count
	end

	ok, count = pcall(function()
		return exports.st_inventory:GetItem(inventoryId, itemName, nil, true)
	end)

	if ok and type(count) == 'number' then
		return count
	end

	return 0
end

local function removeItem(inventoryId, itemName, count)
	local ok, removed = pcall(function()
		return exports.st_inventory:Remove(inventoryId, 1, itemName, count)
	end)

	if ok and removed then
		return true
	end

	ok, removed = pcall(function()
		return exports.st_inventory:RemoveItem(inventoryId, itemName, count)
	end)

	return ok and removed and true or false
end

AddEventHandler("Labor:Server:Startup", function()
	Wait(10000)
	local menu = {
		main = {
			label = "Goods Exporter",
			items = {
				{
					label = "Perishable Goods",
					submenu = "perishable",
				},
				{
					label = "Crafting Goods",
					submenu = "crafting",
				},
			},
		},
	}

	menu.perishable = {
		label = "Perishable Goods",
		items = {},
	}

	for k, v in ipairs(_items.perishable) do
		local itemData = getItemData(v.item)
		table.insert(menu.perishable.items, {
			label = itemData.label,
			description = string.format("Export Price: $%s/unit", v.price),
			event = "Labor:Client:Export:Sell",
			data = v,
		})
	end

	menu.crafting = {
		label = "Crafting Goods",
		items = {},
	}

	for k, v in ipairs(_items.crafting) do
		local itemData = getItemData(v.item)
		table.insert(menu.crafting.items, {
			label = itemData.label,
			description = string.format("Export Price: $%s/unit", v.price),
			event = "Labor:Client:Export:Sell",
			data = v,
		})
	end

	GlobalState["LaborExporter"] = menu

	exports["strata"]:RegisterServerCallback("Labor:Exporter:Sell", function(source, data, cb)
		local char = Strata.User.Find(source)
		if char ~= nil then
			if _items[data.section] ~= nil then
				for k, v in ipairs(_items[data.section]) do
					if data.item == v.item then
						local itemData = getItemData(v.item)
						local count = getItemCount(char:GetData("SID"), v.item)
						if (count or 0) > 0 then
							if removeItem(char:GetData("SID"), v.item, count) then
								exports['st_finance']:BalanceDeposit(
									exports['st_finance']:AccountsGetPersonal(char:GetData("SID")).Account,
									count * v.price,
									{
										type = "deposit",
										title = "Goods Export",
										description = string.format(
											"Sold %s x%s at $%s/unit",
											itemData.label,
											count,
											v.price
										),
									},
									false
								)
							else
								Strata.Log.Info(
									"Labor",
									string.format(
										"%s %s (%s) Failed to Sell %s (%s) at Goods Exporter",
										char:GetData("First"),
										char:GetData("Last"),
										char:GetData("SID"),
										v.item,
										count
									),
									{
										console = true,
										file = true,
										database = true,
										discord = {
											embed = true,
										},
									}
								)
								exports['st_ui']:Notification(source, "error",
									string.format("Unable To Remove %s", itemData.label)
								)
							end
						else
							exports['st_ui']:Notification(source, "error",
								string.format("You Have No %s", itemData.label)
							)
						end
						return
					end
				end
			end
		end
	end)
end)
