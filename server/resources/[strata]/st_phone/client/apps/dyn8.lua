RegisterNUICallback("Dyn8:SearchProperty", function(data, cb)
	exports["strata"]:ServerCallback("Phone:Dyn8:Search", data, cb)
end)

RegisterNUICallback("Dyn8:MarkProperty", function(data, cb)
	cb("OK")
	local prop = GlobalState[string.format("Property:%s", data.id)]
	if prop ~= nil and prop.location and prop.location.front then
		ClearGpsPlayerWaypoint()
		SetNewWaypoint(prop.location.front.x, prop.location.front.y)
	end
end)

RegisterNUICallback("Dyn8:SellProperty", function(data, cb)
	cb('OK')
	--exports["strata"]:ServerCallback("Phone:Dyn8:Sell", data, cb)
end)

RegisterNUICallback("Dyn8:CheckCredit", function(data, cb)
	cb('OK')
	--exports["strata"]:ServerCallback("Phone:Dyn8:CheckCredit", data, cb)
end)
