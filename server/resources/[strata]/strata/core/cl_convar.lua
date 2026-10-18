exports("GetDiscordApp", function()
	return GetConvar("discord_app", "")
end)

exports("GetMaxClients", function()
	return tonumber(GetConvar("sv_maxclients", "32"))
end)

exports("GetLogging", function()
	return tonumber(GetConvar("log_level", 0))
end)

exports("GetSbfwVersion", function()
	return GetConvar("sbfw_version", "UNKNOWN")
end)
