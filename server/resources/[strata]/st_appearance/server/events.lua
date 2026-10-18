RegisterServerEvent("Ped:EnterCreator", function()
	local routeId = exports["strata"]:RequestRouteId("ped:" .. source)
	exports["strata"]:AddPlayerToRoute(source, routeId)
end)

RegisterServerEvent("Ped:LeaveCreator", function()
	exports["strata"]:RoutePlayerToGlobalRoute(source)
end)
