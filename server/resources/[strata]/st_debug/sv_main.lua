AddEventHandler("onResourceStart", function(resource)
	if resource ~= GetCurrentResourceName() then return end

	exports['st_chat']:RegisterAdminCommand("debug", function(source)
		TriggerClientEvent("Debug:Toggle", source)
	end, {
		help = "[Dev] Toggle debug overlay",
	}, 0)
end)
