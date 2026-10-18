local function GetSource(source)
	return exports["strata"]:GetPlayer(source)
end

local function GetPlayerData(key, value)
	for k, v in pairs(exports["strata"]:GetAllPlayers()) do
		if v:GetData(key) == value then
			return v
		end
	end
	return nil
end

local function GetWebsite(type, id)
	if type == "account" then
		local data = exports['strata']:WebAPIGetMemberAccountID(id)
		if data ~= nil then
			return exports["strata"]:CreateStore('Fetch', data.id, {
				ID = data.id,
				AccountID = data.id,
				Identifier = data.identifier,
				Name = data.name,
				Roles = data.roles,
			})
		end
	elseif type == "identifier" then
		local data = exports['strata']:WebAPIGetMemberIdentifier(id)
		if data ~= nil then
			return exports["strata"]:CreateStore('Fetch', data.id, {
				ID = data.id,
				AccountID = data.id,
				Identifier = data.identifier,
				Name = data.name,
				Roles = data.roles,
			})
		end
	end
	return nil
end

local function GetAll()
	return exports["strata"]:GetAllPlayers()
end

local function GetCount()
	local c = 0
	for k, v in pairs(exports["strata"]:GetAllPlayers()) do
		if v ~= nil then
			c = c + 1
		end
	end
	return c
end

exports('FetchSource', GetSource)
exports('FetchPlayerData', GetPlayerData)
exports('FetchWebsite', GetWebsite)
exports('FetchAll', GetAll)
exports('FetchCount', GetCount)
