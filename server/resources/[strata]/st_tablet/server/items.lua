local function RegisterItemUses()
	exports.st_inventory:RegisterUse('tablet', 'Tablet', function(owner)
		-- inventory.id is the character SID, not the numeric server source
		local src = owner
		if tonumber(owner) then
			local char = Strata.User.BySID(tonumber(owner))
			if char then
				src = char:GetData("Source")
			end
		end
		TriggerClientEvent('Tablet:Client:Open', src)
	end)
end

-- Register immediately if st_inventory is already running when this resource starts
AddEventHandler('onResourceStart', function(resource)
	if resource == GetCurrentResourceName() then
		Wait(1000)
		RegisterItemUses()
	end
end)

-- Re-register if st_inventory itself restarts
AddEventHandler('st_inventory:ready', function()
	if GetResourceState(GetCurrentResourceName()) == 'started' then
		RegisterItemUses()
	end
end)
