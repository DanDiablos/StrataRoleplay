local withinPedShop = false

function CreateSpecificPolyzoneType(type, id, data)
	if data.type == "poly" then
		exports['st_zones']:CreatePoly(id, data.points, {
			minZ = data.minZ,
			maxZ = data.maxZ,
		}, {
			pedShop = type,
		})
	elseif data.type == "box" then
		exports['st_zones']:CreateBox(id, data.center, data.length, data.width, {
			heading = data.heading,
			minZ = data.minZ,
			maxZ = data.maxZ,
		}, {
			pedShop = type,
		})
	end
end

function CreateShops()
	for k, v in ipairs(_clothingStores) do
		CreateSpecificPolyzoneType("clothing", "clothing_store_" .. k, v)
	end

	for k, v in ipairs(_barberShops) do
		CreateSpecificPolyzoneType("barber", "barber_shop_" .. k, v)
	end

	for k, v in ipairs(_tattooShops) do
		CreateSpecificPolyzoneType("tattoo", "tattoo_shop_" .. k, v)
	end

	CreateSpecificPolyzoneType("surgery", "plastic_surgery", _plasticSurgery)
end

function CreateShopsBlips()
	for k, v in ipairs(_clothingStores) do
		if v.blip then
			exports["strata"]:Add("clothing_store_" .. k, "Clothing Store", v.blip, 73, 81)
		end
	end

	for k, v in ipairs(_barberShops) do
		exports["strata"]:Add("barber_shop_" .. k, "Barbershop", v.center, 71, 17)
	end

	for k, v in ipairs(_tattooShops) do
		exports["strata"]:Add("tattoo_shop_" .. k, "Tattoo Parlor", v.center, 75, 72)
	end

	exports["strata"]:Add("plastic_surgery", "Plastic Surgeon", _plasticSurgery.center, 362, 4)
end

function GetPedShopCost(t)
	if t == "clothing" then
		return GlobalState["Ped:Pricing"]["SHOP"]
	else
		return GlobalState["Ped:Pricing"][string.upper(t)]
	end
end

AddEventHandler("Polyzone:Enter", function(id, point, insideZone, data)
	if data.pedShop then
		withinPedShop = data.pedShop
		local action =
		"{keybind}primary_action{/keybind} Clothing Store ($%s) | {keybind}secondary_action{/keybind} Wardrobe"
		if withinPedShop == "barber" then
			action = "{keybind}primary_action{/keybind} Barber Shop ($%s)"
		elseif withinPedShop == "tattoo" then
			action = "{keybind}primary_action{/keybind} Tattoo Parlor ($%s)"
		elseif withinPedShop == "surgery" then
			action = "{keybind}primary_action{/keybind} Plastic Surgery ($%s)"
		end

		exports['st_ui']:ActionShow("pedshop", string.format(action, GetPedShopCost(withinPedShop)))
	end
end)

AddEventHandler("Polyzone:Exit", function(id, point, insideZone, data)
	if withinPedShop and data and data.pedShop then
		withinPedShop = false
		exports['st_ui']:ActionHide("pedshop")
	end
end)

AddEventHandler("Keybinds:Client:KeyUp:primary_action", function()
	if withinPedShop and LocalPlayer.state.loggedIn then
		local shopType = "SHOP"
		if withinPedShop ~= "clothing" then
			shopType = string.upper(withinPedShop)
		end

		local playerPed = PlayerPedId()
		local x, y, z = table.unpack(GetEntityCoords(playerPed))

		exports['st_appearance']:CustomizationShow(shopType, {
			x = x,
			y = y,
			z = z,
			h = 326.637,
		})
	end
end)

RegisterNetEvent("Peds:Customization:Client:AdminAbuse", function(shopType)
	local playerPed = PlayerPedId()
	local x, y, z = table.unpack(GetEntityCoords(playerPed))
	local h = GetEntityHeading(playerPed)
	local _type = "creator"

	if shopType <= 0 or shopType > 3 then
		_type = "creator"
	end
	if shopType == 1 then
		_type = "surgery"
	end
	if shopType == 2 then
		_type = "barber"
	end
	if shopType == 3 then
		_type = "tattoo"
	end

	exports['st_appearance']:CustomizationShow(string.upper(_type), {
		x = x,
		y = y,
		z = z,
		h = h,
	})
end)

AddEventHandler("Keybinds:Client:KeyUp:secondary_action", function()
	if withinPedShop and LocalPlayer.state.loggedIn then
		local shopType = "SHOP"
		if withinPedShop ~= "clothing" then
			shopType = string.upper(withinPedShop)
		end

		exports['st_appearance']:WardrobeShow()
	end
end)
