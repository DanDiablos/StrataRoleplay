AddEventHandler('onResourceStart', function(resource)
	if resource == GetCurrentResourceName() then
		Wait(1000)
		RegisterChatCommands()
	end
end)

exports("VisualsToggle", function(source)
	TriggerClientEvent("Visuals:Client:Toggle", source)
end)

function RegisterChatCommands()
	exports["st_chat"]:RegisterCommand("visuals", function(source, args, rawCommand)
		exports['st_ui']:VisualsToggle(source)
	end, {
		help =
		"THIS WILL CAUSE FRAME LAG FOR A FEW SECONDS.\n\nToggle Brighter Emergency Lights. NOTE: This will also make some other lights brighter, IE: interior dash lights, taxi roof advert lights, etc.",
	}, -1)
end
