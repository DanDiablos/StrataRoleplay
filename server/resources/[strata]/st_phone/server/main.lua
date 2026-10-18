function defaultApps()
	local defApps = {}
	local dock = { "contacts", "phone", "messages" }
	for k, v in pairs(PHONE_APPS) do
		if not v.canUninstall then
			table.insert(defApps, v.name)
		end
	end
	return {
		installed = defApps,
		home = defApps,
		dock = dock,
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

local defaultSettings = {
	wallpaper = "default",
	ringtone = "ringtone1.ogg",
	texttone = "text1.ogg",
	colors = {
		accent = "#1a7cc1",
	},
	zoom = 75,
	volume = 100,
	notifications = true,
	appNotifications = {},
	dnd = false,
}

local defaultPermissions = {
	redline = {
		create = false,
	},
}

AddEventHandler("onResourceStart", function(resource)
	if resource == GetCurrentResourceName() then
		Wait(1000)
		TriggerClientEvent("Phone:Client:SetApps", -1, PHONE_APPS)
	end
end)

AddEventHandler('onResourceStart', function(resource)
	if resource == GetCurrentResourceName() then
		Wait(1000)
		Startup()
		RegisterChatCommands()
		TriggerEvent("Phone:Server:RegisterMiddleware")
		TriggerEvent("Phone:Server:RegisterCallbacks")
		TriggerEvent("Phone:Server:Startup")

		exports['st_chars']:RepCreate("Racing", "LS Underground", {
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

		InitBizPhones()
	end
end)

AddEventHandler("Phone:Server:RegisterMiddleware", function()
	exports['strata']:MiddlewareAdd("Characters:Spawning", function(source)
		local char = Strata.User.Find(source)

		if char:GetData("PhonePosition") == nil then
			char:SetData("PhonePosition", { x = 1000, y = 250 })
		end
		TriggerClientEvent("Phone:Client:RestorePosition", source, char:GetData("PhonePosition"))

		local changed = false
		local apps = char:GetData("Apps")
		for k, v in pairs(apps) do
			for k2, v2 in ipairs(v) do
				if v2 == "irc" then
					table.remove(v, k2)
					changed = true
					break
				end
			end
		end
		if changed then
			char:SetData("Apps", apps)
		end
	end, -1)
	exports['strata']:MiddlewareAdd("Characters:Spawning", function(source)
		exports['st_phone']:UpdateJobData(source)
		TriggerClientEvent("Phone:Client:SetApps", source, PHONE_APPS)

		local char = Strata.User.Find(source)
		local myPerms = char:GetData("PhonePermissions")
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
			char:SetData("PhonePermissions", myPerms)
		end
	end, 1)
	exports['strata']:MiddlewareAdd("Characters:Spawning", function(source)
		local char = Strata.User.Find(source)
		local sid = char:GetData("SID")
		local phoneNumber = char:GetData("Phone")

		-- Patch legacy phone items that don't have container metadata
		local phoneSlot = exports.st_inventory:GetSlot(source, 8)
		if phoneSlot and phoneSlot.name == "phone" and (not phoneSlot.metadata or not phoneSlot.metadata.container) then
			exports.st_inventory:UpdateMetaData(source, 8, {
				container = ("sim%s%s"):format(sid, os.time()),
				size = { 1, 200 },
			})
		end

		-- SIM card migration: ensure player has an active SIM in their phone
		-- Check DB directly — container isn't loaded at spawn time so HasActiveSim would always return false
		local hasActiveSim = false
		if phoneNumber then
			local existingSim = MySQL.single.await(
				"SELECT id FROM phone_sims WHERE phone_number = ? AND owner_sid = ? AND active = 1",
				{ phoneNumber, sid }
			)
			if existingSim then
				hasActiveSim = true
			else
				-- Legacy character or no SIM — create one and insert into phone
				local simId = exports['st_phone']:CreateSim(source, sid, phoneNumber)
				if simId then
					exports['st_phone']:RemoveSimItems(source, sid, phoneNumber)
					exports['st_phone']:InsertSimIntoPhone(source, simId, phoneNumber)
					hasActiveSim = true
				end
			end
		end
		TriggerClientEvent("Phone:Client:SimState", source, hasActiveSim)

		local data = MySQL.rawExecute.await("SELECT app, name, picture, meta FROM character_app_profiles WHERE sid = ?",
			{
				sid,
			})

		if data then
			local profiles = {}
			for k, v in ipairs(data) do
				profiles[v.app] = {
					id = v.id,
					name = v.name,
					picture = v.picture,
					meta = json.decode(v.meta or "{}")
				}
			end
			char:SetData("Profiles", profiles)
		else
			char:SetData("Profiles", {})
		end

		local t = exports['strata']:MiddlewareTriggerEventWithData("Phone:Spawning", source, char)
		TriggerLatentClientEvent("Phone:Client:SetDataMulti", source, 50000, t)
	end, 1)
	exports['strata']:MiddlewareAdd("Phone:UIReset", function(source)
		local plyr = Strata.User.Find(source)
		if char ~= nil then
			exports['st_phone']:UpdateJobData(source)
			TriggerClientEvent("Phone:Client:SetApps", source, PHONE_APPS)

			local t = exports['strata']:MiddlewareTriggerEventWithData("Phone:Spawning", source, char)
			TriggerLatentClientEvent("Phone:Client:SetDataMulti", source, 50000, t)
		end
	end)
	exports['strata']:MiddlewareAdd("Characters:Creating", function(source, cData)
		local t = exports['strata']:MiddlewareTriggerEventWithData("Phone:CharacterCreated", source, cData) or {}
		local aliases = {}

		for k, v in ipairs(t) do
			if v ~= nil then
				aliases[v.app] = v.alias
			end
		end

		local p = exports['strata']:MiddlewareTriggerEventWithData("Phone:CreateProfiles", source, cData) or {}
		local profiles = {}

		for k, v in ipairs(p) do
			if v ~= nil then
				profiles[v.app] = v.profile
			end
		end

		return {
			{
				Alias = aliases,
				Apps = defaultApps(),
				PhoneSettings = defaultSettings,
				PhonePermissions = defaultPermissions,
			},
		}
	end)
end)

RegisterNetEvent("Phone:Server:UIReset", function()
	exports['strata']:MiddlewareTriggerEvent("Phone:UIReset", source)
end)

AddEventHandler("Phone:Server:RegisterCallbacks", function()
	exports["strata"]:RegisterServerCallback("Phone:CheckSim", function(source, data, cb)
		cb(exports['st_phone']:HasActiveSim(source))
	end)

	exports["strata"]:RegisterServerCallback("Phone:SavePosition", function(source, data, cb)
		local char = Strata.User.Find(source)
		if char ~= nil then
			char:SetData("PhonePosition", data)
		end
	end)

	exports["strata"]:RegisterServerCallback("Phone:Apps:Home", function(src, data, cb)
		local char = Strata.User.Find(src)
		local apps = char:GetData("Apps")
		if data.action == "add" then
			table.insert(apps.home, data.app)
		else
			local newHome = {}
			for k, v in ipairs(apps.home) do
				if v ~= data.app then
					table.insert(newHome, v)
				end
			end

			apps.home = newHome
		end
		char:SetData("Apps", apps)
	end)

	exports["strata"]:RegisterServerCallback("Phone:Apps:Dock", function(src, data, cb)
		local char = Strata.User.Find(src)
		local apps = char:GetData("Apps")
		if data.action == "add" then
			if #apps.dock < 4 then
				table.insert(apps.dock, data.app)
			end
		else
			local newDock = {}
			for k, v in ipairs(apps.dock) do
				if v ~= data.app then
					table.insert(newDock, v)
				end
			end

			apps.dock = newDock
		end
		char:SetData("Apps", apps)
	end)

	exports["strata"]:RegisterServerCallback("Phone:Apps:Reorder", function(src, data, cb)
		local char = Strata.User.Find(src)
		local apps = char:GetData("Apps")
		apps[data.type] = data.apps
		char:SetData("Apps", apps)
	end)

	exports["strata"]:RegisterServerCallback("Phone:UpdateAlias", function(src, data, cb)
		local char = Strata.User.Find(src)
		local alias = char:GetData("Alias") or {}
		if data.unique then
			local query = 'SELECT 1 FROM characters WHERE Alias LIKE ? AND Phone IS NOT NULL AND Deleted = 0 LIMIT 1'
			local params = { '%' .. data.alias .. '%', char:GetData("Phone") }

			if data.alias and data.alias.name then
				query = 'SELECT 1 FROM characters WHERE Alias LIKE ? AND Phone IS NOT NULL AND Deleted = 0 LIMIT 1'
				params = { '%' .. data.alias.name .. '%', char:GetData("Phone") }
			end

			MySQL.Async.fetchAll(query, params, function(results)
				if #results > 0 then
					cb(false)
				else
					local currentAlias = alias
					currentAlias[data.app] = data.alias

					MySQL.Async.execute('UPDATE characters SET Alias = ? WHERE _id = ?', {
						json.encode(currentAlias),
						char:GetData('ID')
					}, function(affectedRows)
						if affectedRows > 0 then
							alias[data.app] = data.alias
							char:SetData("Alias", alias)
							cb(true)

							--TriggerEvent("Phone:Server:AliasUpdated", src)
						else
							cb(false)
						end
					end)
				end
			end)
		else
			alias[data.app] = data.alias
			char:SetData("Alias", alias)
			cb(true)
			--TriggerEvent("Phone:Server:AliasUpdated", src)
		end
	end)

	exports["strata"]:RegisterServerCallback("Phone:UpdateProfile", function(src, data, cb)
		local char = Strata.User.Find(src)
		if char ~= nil then
			local sid = char:GetData("SID")
			local profiles = char:GetData("Profiles") or {}
			if profiles[data.app] ~= nil then
				MySQL.insert("INSERT INTO app_profile_history (sid, app, name, picture, meta) VALUES(?, ?, ?, ?, ?)", {
					char:GetData("SID"),
					data.app,
					profiles[data.app].name,
					profiles[data.app].picture,
					json.encode(profiles[data.app].meta),
				})
			end

			local count = MySQL.scalar.await(
				"SELECT COUNT(*) FROM character_app_profiles WHERE app = ? AND name = ? AND sid != ?", {
					data.app,
					data.name,
					sid
				})

			if count == 0 then
				MySQL.prepare.await(
					"INSERT INTO character_app_profiles (sid, app, name, picture, meta) VALUES(?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name), picture = VALUES(picture), meta = VALUES(meta)",
					{
						char:GetData("SID"),
						data.app,
						data.name,
						data.picture,
						json.encode(data.meta or {}),
					}
				)

				profiles[data.app] = {
					sid = char:GetData("SID"),
					app = data.app,
					name = data.name,
					picture = data.picture,
					meta = data.meta or {},
				}
				char:SetData("Profiles", profiles)

				--TriggerEvent("Phone:Server:UpdateProfile", src, data)
				cb(true)
			else
				exports['st_ui']:Notification(src, "error", "Alias already in use")
				cb(false)
			end
		else
			cb(false)
		end
	end)

	exports["strata"]:RegisterServerCallback("Phone:ShareMyContact", function(src, data, cb)
		local char = Strata.User.Find(src)
		local myPed = GetPlayerPed(src)
		local myCoords = GetEntityCoords(myPed)
		local myBucket = GetPlayerRoutingBucket(src)
		for k, v in ipairs(GetPlayers()) do
			local tsrc = tonumber(v)
			local tped = GetPlayerPed(tsrc)
			local coords = GetEntityCoords(tped)
			if tsrc ~= src and #(myCoords - coords) <= 5.0 and GetPlayerRoutingBucket(tsrc) == myBucket then
				TriggerClientEvent("Phone:Client:ReceiveShare", tsrc, {
					type = "contacts",
					data = {
						name = char:GetData("First") .. " " .. char:GetData("Last"),
						number = char:GetData("Phone"),
					},
				}, os.time())
			end
		end
	end)

	exports["strata"]:RegisterServerCallback("Phone:Permissions", function(src, data, cb)
		local char = Strata.User.Find(src)

		if char ~= nil then
			local perms = char:GetData("PhonePermissions")

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
