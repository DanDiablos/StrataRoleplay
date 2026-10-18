local alcoholItems = {
	wine_glass = "wine",
	beer = "beer",
	whiskey = "whiskey",
	vodka = "vodka",
	tequila = "tequila",
	rum = "rum",
	whiskey_glass = "whiskey_glass",
	vodka_shot = "vodka_shot",
	tequila_shot = "tequila_shot",
	tequila_sunrise = "tequila_sunrise",
	pina_colada = "cocktail",
	raspberry_mimosa = "cocktail",
	bahama_mamas = "cocktail",
	bloody_mary = "cocktail",
	jaeger_bomb = "jaeger_bomb",
	diamond_drink = "diamond_drink",
	pint_mcdougles = "pint_mcdougles",
}

function registerUsables()
	exports.st_inventory:RegisterUse("wine_bottle", "Status", function(source, itemData)
		local currentMeta = itemData.MetaData or {}
		if not currentMeta.GlassesRemaining then
			currentMeta.GlassesRemaining = 4
		end

		if currentMeta.GlassesRemaining >= 1 then
			currentMeta.GlassesRemaining -= 1
			currentMeta = exports.st_inventory:UpdateMetaData(itemData.id, currentMeta)
			exports.st_inventory:AddItem(itemData.Owner, "wine_glass", 1, {}, 1)
		else
			exports['st_ui']:Notification(source, "error", "Bottle is Empty!")
		end
	end)

	for k, v in pairs(alcoholItems) do
		exports.st_inventory:RegisterUse(k, "Status", function(source, itemData)
			exports["strata"]:ClientCallback(source, "Status:DrinkAlcohol", v, function(success)
				if success then
					exports.st_inventory:RemoveSlot(itemData.Owner, itemData.Name, 1, itemData.Slot,
						itemData.invType)
				end
			end)
		end)
	end

	exports.st_inventory:RegisterUse("scuba_gear", "Status", function(source, slot, itemData)
		exports["strata"]:ClientCallback(source, "Status:UseScubaGear", {}, function(success)
			if success then
				local newValue = slot.CreateDate - (60 * 60 * 24 * 20)
				if os.time() - itemData.durability >= newValue then
					exports.st_inventory:RemoveId(slot.Owner, slot.invType, slot)
				else
					exports.st_inventory:SetItemCreateDate(slot.id, newValue)
				end
			end
		end)
	end)
end

RegisterNetEvent('st_inventory:ready', function()
	if GetResourceState(GetCurrentResourceName()) == 'started' then
		registerUsables()
	end
end)
