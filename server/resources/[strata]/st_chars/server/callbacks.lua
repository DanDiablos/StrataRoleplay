local Config = require('shared.config')
_tempLastLocation = {}
_lastSpawnLocations = {}

_SID = {}
_ID = {}

_afkPlayers = {}

AddEventHandler("Player:Server:Connected", function(source)
	_afkPlayers[source] = os.time()
end)

function RegisterCallbacks()
	CreateThread(function()
		while true do
			if not (GlobalState["DisableAFK"] or false) then
				for k, v in pairs(_afkPlayers) do
					if v < (os.time() - (60 * 10)) then
						local pState = Player(k).state
						if not pState.isDev and not pState.isAdmin and not pState.isStaff then
							exports['strata']:PunishmentKick(k, "You Were Kicked For Being AFK On Character Select",
								"Anticheat", true)
						else
							Strata.Log.Warn("Characters",
								"Staff or Admin Was AFK, Removing From Checks")
							_afkPlayers[k] = nil
						end
					elseif v < (os.time() - (60 * 5)) then
						-- TODO: Implement better alert when at this stage when we have someway to do it
						exports['st_ui']:Notification("warning", k, "You Will Be Kicked Soon For Being AFK", 58000)
					end
				end
			end
			Wait(60000)
		end
	end)

	exports["strata"]:RegisterServerCallback("Characters:GetServerData", function(source, data, cb)
		while exports['strata']:FetchSource(source) == nil do
			Wait(1000)
		end

		local motd = GetConvar("motd", "Welcome to strataRP")
		local query = 'SELECT * FROM `changelogs` ORDER BY `date` DESC LIMIT 1'

		MySQL.Async.fetchAll(query, {}, function(results)
			if not results then
				cb({ changelog = nil, motd = "" })
				return
			end

			if #results > 0 then
				cb({ changelog = results[1], motd = motd })
			else
				cb({ changelog = nil, motd = motd })
			end
		end)
	end)

	exports["strata"]:RegisterServerCallback("Characters:GetCharacters", function(source, data, cb)
		local player = exports['strata']:FetchSource(source)
		local license = exports['strata']:GetPlayerLicense(source)
		local myCharacters = MySQL.query.await('SELECT * FROM `characters` WHERE `License` = @License AND `Deleted` = 0',
			{
				["@License"] = license,
			})
		if #myCharacters == 0 then
			return cb({})
		end

		local cData = {}
		for k, v in ipairs(myCharacters) do
			local pedData = MySQL.single.await(
				[[
			  SELECT * FROM `peds` WHERE `Char` = @Char
			]],
				{
					["@Char"] = v.SID,
				}
			)
			table.insert(cData, {
				License = v.License,
				ID = v.SID,
				First = v.First,
				Last = v.Last,
				Phone = v.Phone,
				DOB = v.DOB,
				Gender = v.Gender,
				LastPlayed = v.LastPlayed,
				Cash = v.Cash,
				Jobs = json.decode(v.Jobs),
				SID = v.SID,
				GangChain = json.decode(v.GangChain),
				Preview = pedData and json.decode(pedData.ped) or false
			})
		end

		player:SetData("Characters", cData)
		cb(cData)
	end)

	exports["strata"]:RegisterServerCallback("Characters:CreateCharacter", function(source, data, cb)
		local player = exports['strata']:FetchSource(source)

		local pNumber = exports['st_phone']:GeneratePhoneNumber()
		local playerIdentifiers = GetPlayerIdentifiers(source)
		local prioritizedIdentifier = nil -- If Steam ID is available, save that as character license because it's short and simple

		for _, id in ipairs(playerIdentifiers) do
			if string.sub(id, 1, string.len("steam:")) == "steam:" then
				prioritizedIdentifier = id
				break
			end
		end

		if not prioritizedIdentifier then
			for _, id in ipairs(playerIdentifiers) do
				if string.sub(id, 1, string.len("license:")) == "license:" then
					prioritizedIdentifier = id
					break
				end
			end
		end

		if not prioritizedIdentifier then
			prioritizedIdentifier = player:GetData("Identifier")
		end

		local doc = {
			License = prioritizedIdentifier,
			User = player:GetData("AccountID"),
			First = data.first,
			Last = data.last,
			Phone = pNumber,
			Gender = tonumber(data.gender),
			Bio = data.bio,
			Origin = data.origin,
			DOB = string.match(data.dob, "(%d%d%d%d%-%d%d%-%d%d)"),
			LastPlayed = -1,
			Jobs = {},
			SID = exports['strata']:SequenceGet("Character"),
			Cash = 1000,
			New = true,
			Licenses = {
				Drivers = {
					Active = true,
					Points = 0,
					Suspended = false,
				},
				Weapons = {
					Active = false,
					Suspended = false,
				},
				Hunting = {
					Active = false,
					Suspended = false,
				},
				Fishing = {
					Active = false,
					Suspended = false,
				},
				Pilot = {
					Active = false,
					Suspended = false,
				},
				Drift = {
					Active = false,
					Suspended = false,
				},
			},
		}

		local extra = exports['strata']:MiddlewareTriggerEventWithData("Characters:Creating", source, doc) or {}
		for k, v in ipairs(extra) do
			for k2, v2 in pairs(v) do
				if k2 ~= "ID" then
					doc[k2] = v2
				end
			end
		end

		local dbData = exports['strata']:CloneDeep(doc)
		for k, v in pairs(dbData) do
			if type(v) == 'table' then
				dbData[k] = json.encode(v)
			end
		end

		local insertedCharacter = MySQL.insert.await('INSERT INTO `characters` SET ?', { dbData })
		if insertedCharacter <= 0 then
			return cb(nil)
		end

		doc.ID = insertedCharacter

		TriggerEvent("Characters:Server:CharacterCreated", doc)
		local success, result = pcall(function()
			exports['strata']:MiddlewareTriggerEvent("Characters:Created", source, doc)
		end)

		if not success then
			Strata.Log.Error(
				"Characters",
				string.format("Error in Characters:Created middleware: %s", result)
			)
		end

		Strata.Log.Info(
			"Characters",
			string.format(
				"%s [%s] Created a New Character %s %s (%s)",
				player:GetData("Name"),
				player:GetData("AccountID"),
				doc.First,
				doc.Last,
				doc.SID
			),
			{
				console = true,
				file = true,
				database = true,
			}
		)
		return cb(doc)
	end)

	exports["strata"]:RegisterServerCallback("Characters:DeleteCharacter", function(source, data, cb)
		local player = exports['strata']:FetchSource(source)
		local license = exports['strata']:GetPlayerLicense(source)
		local myCharacter = MySQL.single.await(
			[[
			SELECT * FROM `characters` WHERE `License` = @License AND `SID` = @ID
		  ]],
			{
				["@License"] = license,
				["@ID"] = data,
			}
		)

		if myCharacter == nil then
			return cb(nil)
		end

		local deletingChar = exports['strata']:CloneDeep(myCharacter)
		local deletedCharacter = MySQL.update.await(
			[[
			UPDATE `characters` SET `Deleted` = 1 WHERE `License` = @License AND `SID` = @ID
		  ]],
			{
				["@License"] = license,
				["@ID"] = data,
			}
		)

		if deletedCharacter then
			MySQL.query.await("DELETE FROM `peds` WHERE `char` = ?", { data })

			TriggerEvent("Characters:Server:CharacterDeleted", data)
			cb(true)

			Strata.Log.Warn(
				"Characters",
				string.format(
					"%s [%s] Deleted Character %s %s (%s)",
					player:GetData("Name"),
					player:GetData("AccountID"),
					deletingChar.First,
					deletingChar.Last,
					deletingChar.SID
				),
				{
					console = true,
					file = true,
					database = true,
					discord = {
						embed = true,
					},
				}
			)
		else
			cb(false)
		end
	end)

	exports["strata"]:RegisterServerCallback("Characters:GetSpawnPoints", function(source, data, cb)
		local player = exports['strata']:FetchSource(source)
		local license = exports['strata']:GetPlayerLicense(source)
		local myCharacter = MySQL.single.await(
			[[
			SELECT * FROM `characters` WHERE `License` = @License AND `SID` = @ID
		  ]],
			{
				["@License"] = license,
				["@ID"] = data,
			}
		)
		if myCharacter == nil then
			return cb(nil)
		end
		myCharacter.Jobs = json.decode(myCharacter.Jobs)
		if myCharacter.New then
			return cb({
				{
					id = 1,
					label = "Character Creation",
					location = exports['st_apartment']:GetInteriorLocation(myCharacter.Apartment or 1),
				},
			})
		elseif myCharacter.Jailed then
			local JailedData = json.decode(myCharacter.JailedData)
			-- and not myCharacter.Jailed.Released ~= nil
			if not JailedData.Released then
				return cb({ Config.PrisonSpawn })
			end
		elseif myCharacter.ICU then
			local ICUData = json.decode(myCharacter.ICU)
			if not ICUData.Released then
				return cb({ Config.ICUSpawn })
			end
		end

		local spawns = exports['strata']:MiddlewareTriggerEventWithData("Characters:GetSpawnPoints", source, data,
			myCharacter)
		cb(spawns)
	end)

	exports["strata"]:RegisterServerCallback("Characters:GetCharacterData", function(source, data, cb)
		local player = exports['strata']:FetchSource(source)
		local license = exports['strata']:GetPlayerLicense(source)
		local myCharacter = MySQL.single.await([[
			SELECT * FROM `characters` WHERE `License` = @License AND `SID` = @ID
			]],
			{
				["@License"] = license,
				["@ID"] = data,
			}
		)

		if myCharacter == nil then
			return cb(nil)
		end

		local cData = myCharacter

		for k, v in ipairs(TablesToDecode) do
			if cData[v] then
				cData[v] = json.decode(cData[v])
			end
		end

		cData.Source = source
		cData.ID = myCharacter.SID

		player:SetData("Character", {
			SID = cData.SID,
			First = cData.First,
			Last = cData.Last,
		})

		local store = exports['strata']:CreateStore(source, "Character", cData)
		ONLINE_CHARACTERS[source] = store

		_SID[cData.SID] = source
		_ID[cData.ID] = source

		GlobalState[string.format("SID:%s", source)] = cData.SID
		GlobalState[string.format("CHAR_NAME:%s", source)] = string.format("%s %s", cData.First, cData.Last)

		exports['strata']:MiddlewareTriggerEvent("Characters:CharacterSelected", source)

		cb(cData)
	end)

	exports["strata"]:RegisterServerCallback("Characters:Logout", function(source, data, cb)
		_afkPlayers[source] = os.time()
		local c = exports['st_chars']:FetchCharacterSource(source)
		if c ~= nil then
			local cData = c:GetData()
			if cData.SID and cData.ID then
				_SID[cData.SID] = nil
				_ID[cData.ID] = nil
			end

			TriggerEvent("Characters:Server:PlayerLoggedOut", source, cData)

			exports['strata']:MiddlewareTriggerEvent("Characters:Logout", source)
			ONLINE_CHARACTERS[source] = nil
			GlobalState[string.format("SID:%s", source)] = nil
			GlobalState[string.format("CHAR_NAME:%s", source)] = nil
			TriggerClientEvent("Characters:Client:Logout", source)
			exports["strata"]:RoutePlayerToHiddenRoute(source)
			exports["strata"]:DeleteStore(source, "Character")
		end
		cb("ok")
	end)

	exports["strata"]:RegisterServerCallback("Characters:GlobalSpawn", function(source, data, cb)
		exports["strata"]:RoutePlayerToGlobalRoute(source)
		cb()
	end)
end

AddEventHandler("Characters:Server:DropCleanup", function(source, cData)
	_afkPlayers[source] = nil
	ONLINE_CHARACTERS[source] = nil

	GlobalState[string.format("SID:%s", source)] = nil
	GlobalState[string.format("CHAR_NAME:%s", source)] = nil

	if cData and cData.SID and cData.ID then
		_SID[cData.SID] = nil
		_ID[cData.ID] = nil
	end
end)

function HandleLastLocation(source)
	local char = exports['st_chars']:FetchCharacterSource(source)

	if char ~= nil then
		local lastLocation = _tempLastLocation[source]
		if lastLocation and type(lastLocation) == "vector3" then
			_lastSpawnLocations[char:GetData("ID")] = {
				coords = lastLocation,
				time = os.time(),
			}
		end
	end

	_tempLastLocation[source] = nil
end

AddEventHandler("Characters:Server:PlayerLoggedOut", function(source, cData)
	local lastLocation = _tempLastLocation[source]
	if lastLocation and type(lastLocation) == "vector3" then
		_lastSpawnLocations[cData.ID] = {
			coords = lastLocation,
			time = os.time(),
		}
	end
end)

function RegisterMiddleware()
	local function CharacterHasJob(characterData, jobId)
		if not characterData or type(characterData.Jobs) ~= "table" or not jobId then
			return false
		end

		for key, job in pairs(characterData.Jobs) do
			if type(job) == "string" and job == jobId then
				return true
			elseif type(job) == "table" then
				if job.Id == jobId or job.id == jobId or job.Name == jobId or job.name == jobId then
					return true
				end
			elseif key == jobId and job then
				return true
			end
		end

		return false
	end

	local function CharacterHasRequiredJobs(characterData, requiredJobs)
		if type(requiredJobs) ~= "table" or #requiredJobs == 0 then
			return true
		end

		for _, requiredJob in ipairs(requiredJobs) do
			if CharacterHasJob(characterData, requiredJob) then
				return true
			end
		end

		return false
	end

	exports['strata']:MiddlewareAdd("Characters:Spawning", function(source)
		_afkPlayers[source] = nil
		exports['st_utils']:TeleportIgnore(source)
		TriggerClientEvent("Characters:Client:Spawned", source)
	end, 100000)
	exports['strata']:MiddlewareAdd("Characters:ForceStore", function(source)
		local char = exports['st_chars']:FetchCharacterSource(source)
		if char ~= nil then
			StoreData(source)
		end
	end, 100000)
	exports['strata']:MiddlewareAdd("Characters:Logout", function(source)
		local char = exports['st_chars']:FetchCharacterSource(source)
		if char ~= nil then
			StoreData(source)
		end
	end, 10000)

	exports['strata']:MiddlewareAdd("Characters:GetSpawnPoints", function(source, id)
		if id then
			local hasLastLocation = _lastSpawnLocations[id]
			if hasLastLocation and hasLastLocation.time and (os.time() - hasLastLocation.time) <= (60 * 5) then
				return {
					{
						id = "LastLocation",
						label = "Last Location",
						loggedOffTime = hasLastLocation.time,
						location = {
							x = hasLastLocation.coords.x,
							y = hasLastLocation.coords.y,
							z = hasLastLocation.coords.z,
							h = 0.0,
						},
						icon = "location-dot",
						event = "Characters:GlobalSpawn",
					},
				}
			end
		end
		return {}
	end, 1)

	exports['strata']:MiddlewareAdd("Characters:GetSpawnPoints", function(source, id, characterData)
		local spawns = {}
		for k, v in ipairs(Spawns) do
			if CharacterHasRequiredJobs(characterData, v.requiredJobs) then
				local spawnCopy = {
					id = v.id,
					label = v.label,
					location = { x = v.location.x, y = v.location.y, z = v.location.z, h = v.location.h },
					event = "Characters:GlobalSpawn",
				}
				table.insert(spawns, spawnCopy)
			end
		end
		return spawns
	end, 5)

	exports['strata']:MiddlewareAdd("playerDropped", function(source, message)
		local char = exports['st_chars']:FetchCharacterSource(source)
		if char ~= nil then
			StoreData(source)
		end
	end, 10000)

	exports['strata']:MiddlewareAdd("Characters:Logout", function(source)
		local pState = Player(source).state
		if pState.tpLocation then
			_tempLastLocation[source] = pState.tpLocation
		else
			_tempLastLocation[source] = GetEntityCoords(GetPlayerPed(source))
		end
		HandleLastLocation(source)
	end, 1)

	exports['strata']:MiddlewareAdd("playerDropped", HandleLastLocation, 6)
end

AddEventHandler("playerDropped", function()
	local src = source
	if DoesEntityExist(GetPlayerPed(src)) then
		local pState = Player(src).state
		if pState.tpLocation then
			_tempLastLocation[src] = pState.tpLocation
		else
			_tempLastLocation[src] = GetEntityCoords(GetPlayerPed(src))
		end
	end
end)

RegisterNetEvent("Characters:Server:LastLocation", function(coords)
	local src = source
	_tempLastLocation[src] = coords
end)
