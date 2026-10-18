AddEventHandler('onResourceStart', function(resource)
	if resource == GetCurrentResourceName() then
		Wait(1000)
		TriggerEvent("Finance:Server:Startup")
	end
end)
