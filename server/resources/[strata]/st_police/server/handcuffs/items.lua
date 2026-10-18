function HandcuffItems()
	-- exports.st_inventory:RegisterUse("pdhandcuffs", "Handcuffs", function(source, item)
	-- 	exports["strata"]:ClientCallback(source, "Handcuffs:VehCheck", {}, function(inVeh)
	-- 		if not inVeh then
	-- 			exports['st_police']:ToggleCuffs(source)
	-- 		end
	-- 	end)
	-- end)

	-- exports.st_inventory:RegisterUse("handcuffs", "Handcuffs", function(source, item)
	-- 	exports["strata"]:ClientCallback(source, "Handcuffs:VehCheck", {}, function(inVeh)
	-- 		if not inVeh then
	-- 			exports['st_police']:ToggleCuffs(source)
	-- 		end
	-- 	end)
	-- end)

	-- exports.st_inventory:RegisterUse("fluffyhandcuffs", "Handcuffs", function(source, item)
	-- 	exports["strata"]:ClientCallback(source, "Handcuffs:VehCheck", {}, function(inVeh)
	-- 		if not inVeh then
	-- 			exports['st_police']:ToggleCuffs(source)
	-- 		end
	-- 	end)
	-- end)
end

RegisterNetEvent('st_inventory:ready', function()
	if GetResourceState(GetCurrentResourceName()) == 'started' then
		HandcuffItems()
	end
end)
