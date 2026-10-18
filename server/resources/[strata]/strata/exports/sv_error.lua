RegisterServerEvent("Error:Server:Report", function(resource, ...)
	local details = table.concat({ ... }, " ")
	exports['strata']:LoggerError("Client Error", string.format("Script Error In %s: %s", resource, details), {
		console = true,
		file = false,
		database = true,
		discord = {
			type = "error",
			webhook = GetConvar("discord_error_webhook", ''),
			content = string.format("```%s```", details)
		},
	})
end)
