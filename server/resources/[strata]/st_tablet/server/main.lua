function defaultApps()
	-- local defApps = {}
	-- for k, v in pairs(LAPTOP_APPS) do
	-- 	if not v.canUninstall then
	-- 		table.insert(defApps, v.name)
	-- 	end
	-- end
	-- return {
	-- 	installed = defApps,
	-- 	home = defApps,
	-- }

	return {
		installed = {
			"settings",
			"files",
			"internet",
			"bizwiz",
			"teams",
			"lsunderground",
			"racing",
			"boosting",
		},
		home = {
			"settings",
			"files",
			"internet",
			"bizwiz",
			"teams",
			"lsunderground",
			"racing",
			"boosting",
		},
	}
end

function hasValue(tbl, value)
	for k, v in ipairs(tbl) do
		if v == value or (type(v) == "table" and hasValue(v, value)) then
			return true
		end
	end
	return false
end

function table.copy(t)
	local u = {}
	for k, v in pairs(t) do
		u[k] = v
	end
	return setmetatable(u, getmetatable(t))
end

function defaultSettings()
	return {
		wallpaper = "wallpaper",
		texttone = "notification.ogg",
		colors = {
			accent = "#1a7cc1",
		},
		zoom = 75,
		volume = 100,
		notifications = true,
		appNotifications = {},
	}
end

local defaultPermissions = {
	redline = {
		create = false,
	},
	lsunderground = {
		admin = false,
	},
}

AddEventHandler("onResourceStart", function(resource)
	if resource == GetCurrentResourceName() then
		Wait(1000)
		TriggerClientEvent("Tablet:Client:SetApps", -1, LAPTOP_APPS)
	end
end)

AddEventHandler('onResourceStart', function(resource)
	if resource == GetCurrentResourceName() then
		Wait(1000)
		Startup()
		RegisterChatCommands()
		TriggerEvent("Tablet:Server:RegisterMiddleware")
		TriggerEvent("Tablet:Server:RegisterCallbacks")

		exports['st_chars']:RepCreate("Chopping", "Vehicle Chopping", {
			{ label = "Rank 1",  value = 1000 },
			{ label = "Rank 2",  value = 2500 },
			{ label = "Rank 3",  value = 5000 },
			{ label = "Rank 4",  value = 10000 },
			{ label = "Rank 5",  value = 25000 },
			{ label = "Rank 6",  value = 50000 },
			{ label = "Rank 7",  value = 100000 },
			{ label = "Rank 8",  value = 250000 },
			{ label = "Rank 9",  value = 500000 },
			{ label = "Rank 10", value = 1000000 },
		}, true)

		exports['st_chars']:RepCreate("Boosting", "Boosting", {
			{ label = "D",  value = 0 },
			{ label = "C",  value = 6000 },
			{ label = "B",  value = 15000 },
			{ label = "A",  value = 50000 },
			{ label = "A+", value = 120000 }, -- Get Scratching
			{ label = "S+", value = 150000 },
		}, true)
	end
end)

AddEventHandler("Tablet:Server:RegisterMiddleware", function()
	exports['strata']:MiddlewareAdd("Characters:Spawning", function(source)
		exports['st_tablet']:UpdateJobData(source)
		TriggerClientEvent("Tablet:Client:SetApps", source, LAPTOP_APPS)

		local char = Strata.User.Find(source)
		local myPerms = char:GetData("LaptopPermissions") or {}
		local modified = false
		for app, perms in pairs(defaultPermissions) do
			if myPerms[app] == nil then
				myPerms[app] = perms
				modified = true
			else
				for perm, state in pairs(perms) do
					if myPerms[app][perm] == nil then
						myPerms[app][perm] = state
						modified = true
					end
				end
			end
		end

		if modified then
			char:SetData("LaptopPermissions", myPerms)
		end

		if not char:GetData("LaptopSettings") then
			char:SetData("LaptopSettings", defaultSettings())
		end

		if not char:GetData("LaptopApps") then
			char:SetData("LaptopApps", defaultApps())
		end
	end, 1)
	exports['strata']:MiddlewareAdd("Tablet:UIReset", function(source)
		exports['st_tablet']:UpdateJobData(source)
		TriggerClientEvent("Tablet:Client:SetApps", source, LAPTOP_APPS)
	end)
	exports['strata']:MiddlewareAdd("Characters:Creating", function(source, cData)
		local t = exports['strata']:MiddlewareTriggerEventWithData("Tablet:CharacterCreated", source, cData)

		return {
			{
				LaptopApps = defaultApps(),
				LaptopSettings = defaultSettings(),
				LaptopPermissions = defaultPermissions,
			},
		}
	end)
end)

RegisterNetEvent("Tablet:Server:UIReset", function()
	exports['strata']:MiddlewareTriggerEvent("Tablet:UIReset", source)
end)

AddEventHandler("Tablet:Server:RegisterCallbacks", function()
	exports["strata"]:RegisterServerCallback("Tablet:Permissions", function(src, data, cb)
		local char = Strata.User.Find(src)

		if char ~= nil then
			local perms = char:GetData("LaptopPermissions")

			for k, v in pairs(data) do
				for k2, v2 in ipairs(v) do
					if not perms[k][v2] then
						cb(false)
						return
					end
				end
			end
			cb(true)
		else
			cb(false)
		end
	end)
end)
