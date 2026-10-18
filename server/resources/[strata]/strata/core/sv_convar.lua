exports("GetEnvironment", function()
	return GetConvar("sv_environment", "DEV")
end)

exports("GetAccessRole", function()
	return GetConvar("sv_access_role", 0)
end)

exports("GetApiAddress", function()
	return GetConvar('api_address', 'CONVAR_DEFAULT')
end)

exports("GetApiId", function()
	return GetConvar('api_id', 'CONVAR_DEFAULT')
end)

exports("GetApiSecret", function()
	return GetConvar('api_secret', 'CONVAR_DEFAULT')
end)

exports("GetLogging", function()
	return tonumber(GetConvar("log_level", 0))
end)

exports("GetSbfwVersion", function()
	return GetConvar("sbfw_version", "UNKNOWN")
end)

-- exports("GetDiscordBotToken", function()
-- 	return GetConvar('discord_bot_token', 'CONVAR_DEFAULT')
-- end)

CreateThread(function()
	ENVIRONMENT = GetConvar("sv_environment", "DEV")
	ACCESS_ROLE = GetConvar("sv_access_role", 0)

	API_ADDRESS = GetConvar('api_address', 'CONVAR_DEFAULT')
	API_ID = GetConvar('api_id', 'CONVAR_DEFAULT')
	API_SECRET = GetConvar('api_secret', 'CONVAR_DEFAULT')

	--BOT_TOKEN = GetConvar('discord_bot_token', 'CONVAR_DEFAULT')
	LOGGING = tonumber(GetConvar("log_level", 0))
	SBFW_VERSION = GetConvar("sbfw_version", "UNKNOWN")
end)

AddEventHandler("Core:Shared:Watermark", function()
	GlobalState.IsProduction = (exports["strata"]:GetEnvironment():upper()) ~= "DEV"

	local convarChecks = {
		{ key = "sv_environment", value = exports["strata"]:GetEnvironment(),       stop = true },
		{ key = "sv_access_role", value = exports["strata"]:GetAccessRole(),        stop = false },
		{ key = "api_address",    value = exports["strata"]:GetApiAddress(),        stop = true },
		{ key = "api_id",         value = exports["strata"]:GetApiId(),             stop = true },
		{ key = "api_secret",     value = exports["strata"]:GetApiSecret(),         stop = true },
		--{ key = "discord_bot_token",     value = exports["strata"]:GetDiscordBotToken(),   stop = true },
		{ key = "log_level",      value = tostring(exports["strata"]:GetLogging()), stop = false },
		{ key = "SBFW_VERSION",   value = exports["strata"]:GetSbfwVersion(),       stop = false },
	}

	for k, v in pairs(convarChecks) do
		if v.value == "CONVAR_DEFAULT" then
			exports['strata']:LoggerError("Convar", "Missing Convar " .. v.key, {
				console = true,
				file = true,
			})

			if v.stop then
				exports["strata"]:Shutdown("Missing Convar " .. v.key)
				return
			end
		end
	end

	TriggerEvent("Core:Server:StartupReady")
end)
