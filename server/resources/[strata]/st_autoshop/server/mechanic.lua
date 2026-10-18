AddEventHandler('onResourceStart', function(resource)
	if resource == GetCurrentResourceName() then
		Wait(1000)
		RegisterCallbacks()

		RegisterMechanicItems()

		-- Mechanic crafting benches are now handled by st_inventory crafting.lua, No need to register them here anymore
	end
end)
