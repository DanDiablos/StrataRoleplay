local playerChannels = {}
local channelMembers = {}
local channelTalkingMembers = {}
local STORAGE_FILE = "radio_channel_data.json"

local channelNames = {}
local playerChannelAliases = {}
local fixedChannelNames = {
	[1] = "EMS Radio",
	[2] = "Prison Dipsatch Radio",
	[3] = "Police Radio",
}

local characterIdentityCache = {}
local getCharacterSID

local function getCharacterObject(src)
	local okSource, sourceChar = pcall(function()
		return Strata.User.Find(src)
	end)
	if okSource and sourceChar then
		return sourceChar
	end

	local player = Player(src)
	if player and player.state and player.state.Character then
		return player.state.Character
	end

	return nil
end

local function getCharacterData(src, key)
	local char = getCharacterObject(src)
	if char then
		if type(char) == "table" then
			if char.GetData then
				local ok, val = pcall(char.GetData, char, key)
				if ok and val ~= nil then
					return val
				end
			end

			if char[key] ~= nil then
				return char[key]
			end
		end
	end

	local player = Player(src)
	if player and player.state and player.state[key] ~= nil then
		return player.state[key]
	end

	return nil
end

local function getFirstAvailableCharacterData(src, keys)
	for _, key in ipairs(keys) do
		local value = getCharacterData(src, key)
		if value ~= nil then
			if type(value) == "string" then
				if value ~= "" then
					return value
				end
			else
				return value
			end
		end
	end

	return nil
end

local function getPrimaryPlayerIdentifier(src)
	for _, identifier in ipairs(GetPlayerIdentifiers(src)) do
		if string.find(identifier, "steam:", 1, true) == 1 then
			return identifier
		end
	end

	for _, identifier in ipairs(GetPlayerIdentifiers(src)) do
		if string.find(identifier, "license:", 1, true) == 1 then
			return identifier
		end
	end

	return GetPlayerIdentifier(src, 0)
end

local function getCharacterLicenseCandidates(src)
	local candidates = {}
	local seen = {}

	local function addCandidate(value)
		if value == nil then
			return
		end

		local normalized = tostring(value)
		if normalized == "" or seen[normalized] then
			return
		end

		seen[normalized] = true
		candidates[#candidates + 1] = normalized
	end

	local okLicense, rootLicense = pcall(function()
		return exports["strata"]:GetPlayerLicense(src)
	end)
	if okLicense then
		addCandidate(rootLicense)
	end

	addCandidate(getPrimaryPlayerIdentifier(src))

	for _, identifier in ipairs(GetPlayerIdentifiers(src)) do
		addCandidate(identifier)
	end

	return candidates
end

local function getCharacterIdentityByLicenseCandidates(src, callsignOnly)
	if not MySQL or not MySQL.single or not MySQL.single.await then
		return nil
	end

	local candidates = getCharacterLicenseCandidates(src)
	for _, license in ipairs(candidates) do
		local cacheKey = "license:" .. license .. (callsignOnly and ":callsign" or ":any")
		if characterIdentityCache[cacheKey] ~= nil then
			local cached = characterIdentityCache[cacheKey]
			if cached and cached ~= false then
				return cached
			end
		else
			local query = callsignOnly
				and "SELECT SID, First, Last, Callsign FROM characters WHERE License = ? AND Callsign IS NOT NULL AND Callsign != '' AND Callsign != 'false' AND (Deleted = 0 OR Deleted IS NULL) ORDER BY LastPlayed DESC, SID DESC LIMIT 1"
				or "SELECT SID, First, Last, Callsign FROM characters WHERE License = ? AND (Deleted = 0 OR Deleted IS NULL) ORDER BY LastPlayed DESC, SID DESC LIMIT 1"

			local record = MySQL.single.await(query, { license })
			characterIdentityCache[cacheKey] = record or false

			if record then
				return record
			end
		end
	end

	return nil
end

local function getCharacterIdentityByIdentifier(src)
	local identifier = getPrimaryPlayerIdentifier(src)
	if not identifier or not MySQL or not MySQL.single or not MySQL.single.await then
		return nil
	end

	local cacheKey = "identifier:" .. tostring(identifier)
	if characterIdentityCache[cacheKey] ~= nil then
		return characterIdentityCache[cacheKey] or nil
	end

	local record = MySQL.single.await(
		"SELECT SID, First, Last, Callsign FROM characters WHERE License = ? AND (Deleted = 0 OR Deleted IS NULL) ORDER BY LastPlayed DESC, SID DESC LIMIT 1",
		{ identifier }
	)

	characterIdentityCache[cacheKey] = record or false

	return record
end

local function getCharacterAccountId(src)
	local char = getCharacterObject(src)
	if char then
		if char.GetData then
			local okUser, user = pcall(char.GetData, char, "User")
			if okUser and user ~= nil and tostring(user) ~= "" then
				return tonumber(user) or user
			end

			local okAccount, account = pcall(char.GetData, char, "AccountID")
			if okAccount and account ~= nil and tostring(account) ~= "" then
				return tonumber(account) or account
			end
		end

		if char.User ~= nil and tostring(char.User) ~= "" then
			return tonumber(char.User) or char.User
		end

		if char.AccountID ~= nil and tostring(char.AccountID) ~= "" then
			return tonumber(char.AccountID) or char.AccountID
		end
	end

	local player = Player(src)
	if player and player.state and player.state.AccountID ~= nil and tostring(player.state.AccountID) ~= "" then
		return tonumber(player.state.AccountID) or player.state.AccountID
	end

	local okRoot, rootPlayer = pcall(function()
		return Strata.User.Account(src)
	end)
	if okRoot and rootPlayer and rootPlayer.GetData then
		local ok, account = pcall(rootPlayer.GetData, rootPlayer, "AccountID")
		if ok and account ~= nil and tostring(account) ~= "" then
			return tonumber(account) or account
		end
	end

	return nil
end

local function getCharacterIdentityByAccount(src)
	if not MySQL or not MySQL.single or not MySQL.single.await then
		return nil
	end

	local accountId = getCharacterAccountId(src)

	if not accountId then
		return nil
	end

	local cacheKey = "account:" .. tostring(accountId)
	if characterIdentityCache[cacheKey] ~= nil then
		return characterIdentityCache[cacheKey] or nil
	end

	local record = MySQL.single.await(
		"SELECT SID, First, Last, Callsign FROM characters WHERE User = ? AND Callsign IS NOT NULL AND Callsign != '' AND Callsign != 'false' AND (Deleted = 0 OR Deleted IS NULL) ORDER BY LastPlayed DESC, SID DESC LIMIT 1",
		{ accountId }
	)

	characterIdentityCache[cacheKey] = record or false

	return record
end

getCharacterSID = function(src)
	local char = getCharacterObject(src)
	if char then
		if char.GetData then
			local ok, sid = pcall(char.GetData, char, "SID")
			if ok and sid ~= nil and tostring(sid) ~= "" then
				return tonumber(sid) or sid
			end
		end

		local directSid = char.SID or char.sid
		if directSid ~= nil and tostring(directSid) ~= "" then
			return tonumber(directSid) or directSid
		end
	end

	local player = Player(src)
	if player and player.state then
		local stateSid = player.state.SID or player.state.sid
		if stateSid ~= nil and tostring(stateSid) ~= "" then
			return tonumber(stateSid) or stateSid
		end
	end

	local okSid, sidChar = pcall(function()
		local sid = player and player.state and (player.state.SID or player.state.sid)
		if sid ~= nil and tostring(sid) ~= "" then
			return Strata.User.BySID(tonumber(sid) or sid)
		end
		return nil
	end)
	if okSid and sidChar then
		if sidChar.GetData then
			local ok, sid = pcall(sidChar.GetData, sidChar, "SID")
			if ok and sid ~= nil and tostring(sid) ~= "" then
				return tonumber(sid) or sid
			end
		end

		local directSid = sidChar.SID or sidChar.sid
		if directSid ~= nil and tostring(directSid) ~= "" then
			return tonumber(directSid) or directSid
		end
	end

	local globalSid = GlobalState[string.format("SID:%s", src)]
	if globalSid ~= nil and tostring(globalSid) ~= "" then
		return tonumber(globalSid) or globalSid
	end

	local licenseIdentity = getCharacterIdentityByLicenseCandidates(src, false)
	if licenseIdentity and licenseIdentity.SID ~= nil and tostring(licenseIdentity.SID) ~= "" then
		return tonumber(licenseIdentity.SID) or licenseIdentity.SID
	end

	local identity = getCharacterIdentityByIdentifier(src)
	if identity and identity.SID ~= nil and tostring(identity.SID) ~= "" then
		return tonumber(identity.SID) or identity.SID
	end

	return nil
end

local function getCharacterIdentityRecord(src)
	local sid = getCharacterSID(src)
	if not MySQL or not MySQL.single or not MySQL.single.await then
		return nil
	end

	if not sid then
		return getCharacterIdentityByIdentifier(src)
	end

	local cacheKey = tostring(sid)
	if characterIdentityCache[cacheKey] ~= nil then
		return characterIdentityCache[cacheKey] or nil
	end

	local record = MySQL.single.await(
		"SELECT SID, First, Last, Callsign FROM characters WHERE SID = ? AND (Deleted = 0 OR Deleted IS NULL)",
		{ sid }
	)

	characterIdentityCache[cacheKey] = record or false

	return record
end

local function getMDTPeopleView(src)
	local sid = getCharacterSID(src)
	if not sid then
		return nil
	end

	local ok, people = pcall(function()
		return exports["st_mdt"]:PeopleView(sid)
	end)
	if ok and people then
		return people
	end

	return nil
end

local function getMDTJobInfo(src)
	local people = getMDTPeopleView(src)
	if not people or type(people.Jobs) ~= "table" then
		return nil, nil
	end

	local onDuty = Player(src) and Player(src).state and Player(src).state.onDuty or nil
	local fallbackJob = nil

	for _, job in ipairs(people.Jobs) do
		if type(job) == "table" then
			if onDuty and job.Id == onDuty then
				return job, people
			end

			if not fallbackJob then
				fallbackJob = job
			end
		end
	end

	return fallbackJob, people
end

local function isPoliceJob(job)
	if type(job) ~= "table" then
		return false
	end

	local jobId = job.Id and string.lower(tostring(job.Id)) or ""
	local jobName = job.Name and string.lower(tostring(job.Name)) or ""
	local haystack = jobId .. " " .. jobName

	return string.find(haystack, "police", 1, true)
		or string.find(haystack, "lspd", 1, true)
		or string.find(haystack, "bcso", 1, true)
		or string.find(haystack, "bsco", 1, true)
		or string.find(haystack, "sheriff", 1, true)
		or string.find(haystack, "sasp", 1, true)
		or string.find(haystack, "trooper", 1, true)
		or string.find(haystack, "state", 1, true)
end

local function getPoliceMDTJobInfo(src)
	local people = getMDTPeopleView(src)
	if not people or type(people.Jobs) ~= "table" then
		return nil, people
	end

	for _, job in ipairs(people.Jobs) do
		if isPoliceJob(job) then
			return job, people
		end
	end

	return nil, people
end

local function getPlayerStorageKey(src)
	local sid = getCharacterData(src, "SID")
	if sid then
		return "sid:" .. tostring(sid)
	end

	for _, identifier in ipairs(GetPlayerIdentifiers(src)) do
		if string.find(identifier, "license:", 1, true) == 1 then
			return identifier
		end
	end

	local firstId = GetPlayerIdentifier(src, 0)
	if firstId then
		return firstId
	end

	return "src:" .. tostring(src)
end

local function normalizeChannel(rawChannel)
	local channel = tonumber(rawChannel)
	if not channel then
		return nil
	end

	channel = math.floor(channel)
	if channel <= 0 or channel > 2000 then
		return nil
	end

	return channel
end

local function saveStorage()
	local payload = {
		channelNames = channelNames,
		playerChannelAliases = playerChannelAliases,
	}

	SaveResourceFile(GetCurrentResourceName(), STORAGE_FILE, json.encode(payload), -1)
end

local function loadStorage()
	local raw = LoadResourceFile(GetCurrentResourceName(), STORAGE_FILE)
	if not raw or raw == "" then
		return
	end

	local ok, parsed = pcall(json.decode, raw)
	if not ok or type(parsed) ~= "table" then
		return
	end

	if type(parsed.channelNames) == "table" then
		channelNames = parsed.channelNames
	end

	if type(parsed.playerChannelAliases) == "table" then
		playerChannelAliases = parsed.playerChannelAliases
	end
end

local function getCharacterFullName(src)
	local people = getMDTPeopleView(src)
	if people then
		if people.First and people.Last then
			return string.format("%s %s", tostring(people.First), tostring(people.Last))
		end

		if people.First then
			return tostring(people.First)
		end

		if people.Last then
			return tostring(people.Last)
		end
	end

	local identity = getCharacterIdentityRecord(src)
	if identity then
		if identity.First and identity.Last then
			return string.format("%s %s", tostring(identity.First), tostring(identity.Last))
		end

		if identity.First then
			return tostring(identity.First)
		end

		if identity.Last then
			return tostring(identity.Last)
		end
	end

	local first = getFirstAvailableCharacterData(src, {
		"First",
		"FirstName",
		"firstname",
		"first_name",
		"first",
	})
	local last = getFirstAvailableCharacterData(src, {
		"Last",
		"LastName",
		"lastname",
		"last_name",
		"last",
	})

	if first and last then
		return tostring(first) .. " " .. tostring(last)
	end

	local singleName = getFirstAvailableCharacterData(src, {
		"Name",
		"name",
		"FullName",
		"fullName",
		"full_name",
		"charname",
		"characterName",
		"CharacterName",
	})
	if singleName then
		if type(singleName) == "table" then
			local tableFirst = singleName.First or singleName.first or singleName.firstname or singleName.FirstName
			local tableLast = singleName.Last or singleName.last or singleName.lastname or singleName.LastName
			if tableFirst and tableLast then
				return tostring(tableFirst) .. " " .. tostring(tableLast)
			end
		end

		return tostring(singleName)
	end

	return GetPlayerName(src) or ("Player " .. src)
end

local function getCharacterNameParts(src)
	local first = getFirstAvailableCharacterData(src, {
		"First",
		"FirstName",
		"firstname",
		"first_name",
		"first",
	})
	local last = getFirstAvailableCharacterData(src, {
		"Last",
		"LastName",
		"lastname",
		"last_name",
		"last",
	})

	if first or last then
		return first and tostring(first) or nil, last and tostring(last) or nil
	end

	local fullName = getCharacterFullName(src)
	if not fullName then
		return nil, nil
	end

	local firstPart, lastPart = string.match(tostring(fullName), "^(%S+)%s+(.+)$")
	if firstPart and lastPart then
		return firstPart, lastPart
	end

	return nil, tostring(fullName)
end

local function getDutyData(src, jobId)
	local ok, dutyData = pcall(function()
		return exports["st_jobs"]:DutyGet(src, jobId)
	end)

	if ok and dutyData then
		return dutyData
	end

	return nil
end

local function getDutyGradeName(dutyData)
	if not dutyData or not dutyData.Id or not dutyData.GradeId then
		return nil
	end

	local ok, jobData = pcall(function()
		return exports["st_jobs"]:DoesExist(dutyData.Id, dutyData.WorkplaceId, dutyData.GradeId)
	end)

	if ok and jobData and jobData.Grade and jobData.Grade.Name and jobData.Grade.Name ~= "" then
		return tostring(jobData.Grade.Name)
	end

	return nil
end

local function getDutyFullName(dutyData)
	if not dutyData then
		return nil
	end

	if dutyData.First and dutyData.Last then
		return string.format("%s %s", tostring(dutyData.First), tostring(dutyData.Last))
	end

	if dutyData.First then
		return tostring(dutyData.First)
	end

	if dutyData.Last then
		return tostring(dutyData.Last)
	end

	return nil
end

local function getCharacterIdentityByPoliceName(src)
	if not MySQL or not MySQL.single or not MySQL.single.await then
		return nil
	end

	local first, last = getCharacterNameParts(src)
	local dutyData = getDutyData(src, "police") or getDutyData(src)
	if dutyData then
		if not first and dutyData.First then
			first = tostring(dutyData.First)
		end

		if not last and dutyData.Last then
			last = tostring(dutyData.Last)
		end
	end

	if not first or not last then
		return nil
	end

	local cacheKey = ("police-name:%s:%s"):format(string.lower(tostring(first)), string.lower(tostring(last)))
	if characterIdentityCache[cacheKey] ~= nil then
		return characterIdentityCache[cacheKey] or nil
	end

	local record = MySQL.single.await(
		"SELECT SID, First, Last, Callsign FROM characters WHERE First = ? AND Last = ? AND Jobs LIKE ? AND Callsign IS NOT NULL AND Callsign != '' AND Callsign != 'false' AND (Deleted = 0 OR Deleted IS NULL) ORDER BY LastPlayed DESC, SID DESC LIMIT 1",
		{ tostring(first), tostring(last), '%\"Id\":\"police\"%' }
	)

	if not record then
		record = MySQL.single.await(
			"SELECT SID, First, Last, Callsign FROM characters WHERE First = ? AND Last = ? AND Callsign IS NOT NULL AND Callsign != '' AND Callsign != 'false' AND (Deleted = 0 OR Deleted IS NULL) ORDER BY LastPlayed DESC, SID DESC LIMIT 1",
			{ tostring(first), tostring(last) }
		)
	end

	characterIdentityCache[cacheKey] = record or false

	return record
end

local function getCharacterCallsign(src)
	local dutyData = getDutyData(src, "police") or getDutyData(src)
	if dutyData and dutyData.Callsign and tostring(dutyData.Callsign) ~= "" and tostring(dutyData.Callsign) ~= "false" then
		return tostring(dutyData.Callsign)
	end

	local char = getCharacterObject(src)
	if char and char.GetData then
		local ok, callsign = pcall(char.GetData, char, "Callsign")
		if ok and callsign ~= nil and tostring(callsign) ~= "" and tostring(callsign) ~= "false" then
			return tostring(callsign)
		end
	end

	local people = getMDTPeopleView(src)
	if people and people.Callsign and tostring(people.Callsign) ~= "" then
		return tostring(people.Callsign)
	end

	local identity = getCharacterIdentityRecord(src)
	if identity and identity.Callsign and tostring(identity.Callsign) ~= "" then
		return tostring(identity.Callsign)
	end

	local accountIdentity = getCharacterIdentityByAccount(src)
	if accountIdentity and accountIdentity.Callsign and tostring(accountIdentity.Callsign) ~= "" then
		return tostring(accountIdentity.Callsign)
	end

	local policeNameIdentity = getCharacterIdentityByPoliceName(src)
	if policeNameIdentity and policeNameIdentity.Callsign and tostring(policeNameIdentity.Callsign) ~= "" then
		return tostring(policeNameIdentity.Callsign)
	end

	local licenseIdentity = getCharacterIdentityByLicenseCandidates(src, true)
	if licenseIdentity and licenseIdentity.Callsign and tostring(licenseIdentity.Callsign) ~= "" then
		return tostring(licenseIdentity.Callsign)
	end

	local callsign = getFirstAvailableCharacterData(src, {
		"Callsign",
		"callsign",
		"CallSign",
		"callsign",
		"RadioCallsign",
		"radioCallsign",
		"radio_callsign",
		"Unit",
		"unit",
	})
	if callsign and tostring(callsign) ~= "" then
		return tostring(callsign)
	end

	return nil
end

local function getCharacterRank(src)
	local dutyData = getDutyData(src, "police") or getDutyData(src)
	local dutyGradeName = getDutyGradeName(dutyData)
	if dutyGradeName then
		return dutyGradeName
	end

	local job = getMDTJobInfo(src)
	if job and job.Grade and job.Grade.Name and job.Grade.Name ~= "" then
		return tostring(job.Grade.Name)
	end

	local rank = getCharacterData(src, "Rank") or getCharacterData(src, "rank")
	if rank and tostring(rank) ~= "" then
		return tostring(rank)
	end

	local onDuty = Player(src) and Player(src).state and Player(src).state.onDuty or nil
	if onDuty and exports["st_jobs"] and exports["st_jobs"].GetJobs then
		local ok, jobs = pcall(exports["st_jobs"].GetJobs, src)
		if ok and type(jobs) == "table" then
			for _, job in ipairs(jobs) do
				if job.Id == onDuty and job.Grade and job.Grade.Name and job.Grade.Name ~= "" then
					return tostring(job.Grade.Name)
				end
			end
		end
	end

	return nil
end

local function getCharacterDepartment(src)
	local job = getMDTJobInfo(src)
	if job then
		if job.Name and tostring(job.Name) ~= "" then
			return tostring(job.Name)
		end

		if job.Id and tostring(job.Id) ~= "" then
			return tostring(job.Id)
		end
	end

	local department = getCharacterData(src, "Department")
		or getCharacterData(src, "department")
		or getCharacterData(src, "Dept")
		or getCharacterData(src, "dept")

	if department and tostring(department) ~= "" then
		return tostring(department)
	end

	local onDuty = Player(src) and Player(src).state and Player(src).state.onDuty or nil
	if onDuty and tostring(onDuty) ~= "" then
		return tostring(onDuty)
	end

	return nil
end

local function isPoliceDepartment(department)
	if not department then
		return false
	end

	local normalized = string.lower(tostring(department))

	return string.find(normalized, "police", 1, true)
		or string.find(normalized, "pd", 1, true)
		or string.find(normalized, "sheriff", 1, true)
		or string.find(normalized, "bcso", 1, true)
		or string.find(normalized, "trooper", 1, true)
		or string.find(normalized, "state", 1, true)
end

local function formatPoliceRank(rank)
	if not rank or rank == "" then
		return nil
	end

	local normalized = string.lower(tostring(rank))
	local rankMap = {
		["commissioner"] = "Commish",
		["assistant commissioner"] = "Asst. Commish",
		["deputy commissioner"] = "Dep. Commish",
		["chief"] = "Chief",
		["captain"] = "Cpt",
		["lieutenant"] = "Lt.",
		["sergeant"] = "Sgt.",
		["corporal"] = "Cpl.",
		["officer"] = "Ofc.",
		["deputy"] = "Dep.",
		["trooper"] = "Tpr.",
		["cadet"] = "Cdt.",
		["detective"] = "Det.",
		["undersheriff"] = "Undersh.",
	}

	return rankMap[normalized] or tostring(rank)
end

local function formatPoliceName(src)
	local first, last = getCharacterNameParts(src)

	if first and last then
		return string.format("%s.%s", string.sub(first, 1, 1), last)
	end

	if last then
		return tostring(last)
	end

	return getCharacterFullName(src)
end

local function getDisplayNameForChannel(src, channel)
	local fullName = getCharacterFullName(src)
	local department = getCharacterDepartment(src)
	local isPolice = channel == 3 or isPoliceDepartment(department)

	if isPolice then
		local policeDutyData = getDutyData(src, "police")
		if channel == 3 and policeDutyData then
			local dutyName = getDutyFullName(policeDutyData) or fullName
			local dutyRank = formatPoliceRank(getDutyGradeName(policeDutyData))
			local dutyCallsign = policeDutyData.Callsign and tostring(policeDutyData.Callsign) ~= "false"
				and tostring(policeDutyData.Callsign)
				or getCharacterCallsign(src)

			if dutyRank and dutyCallsign and dutyCallsign ~= "" then
				return string.format("%s %s [%s]", dutyRank, dutyName, dutyCallsign)
			elseif dutyRank then
				return string.format("%s %s", dutyRank, dutyName)
			elseif dutyCallsign and dutyCallsign ~= "" then
				return string.format("%s [%s]", dutyName, dutyCallsign)
			end
		end

		local policeJob = nil
		if channel == 3 then
			policeJob = getPoliceMDTJobInfo(src)
		end

		local rank = policeJob and policeJob.Grade and policeJob.Grade.Name
			and tostring(policeJob.Grade.Name)
			or getCharacterRank(src)
		rank = formatPoliceRank(rank)
		local callsign = getCharacterCallsign(src)

		if rank and callsign then
			return string.format("%s %s [%s]", rank, fullName, callsign)
		elseif rank then
			return string.format("%s %s", rank, fullName)
		elseif callsign then
			return string.format("%s [%s]", fullName, callsign)
		end

		return fullName
	end

	return fullName
end

local function getChannelHeaderForPlayer(src, channel)
	if fixedChannelNames[channel] then
		return fixedChannelNames[channel]
	end

	local key = getPlayerStorageKey(src)
	local aliasBucket = playerChannelAliases[key]

	if aliasBucket and aliasBucket[tostring(channel)] and aliasBucket[tostring(channel)] ~= "" then
		return aliasBucket[tostring(channel)]
	end

	return channelNames[tostring(channel)] or ""
end

local function getSortedChannelMembers(channel)
	local members = {}
	local bucket = channelMembers[channel]

	if not bucket then
		return members
	end

	for src, _ in pairs(bucket) do
		local department = getCharacterDepartment(src)
		members[#members + 1] = {
			id = src,
			name = getDisplayNameForChannel(src, channel),
			department = department,
		}
	end

	table.sort(members, function(a, b)
		if a.name == b.name then
			return a.id < b.id
		end

		return a.name < b.name
	end)

	return members
end

local function sendChannelUpdate(channel)
	if not channel or channel <= 0 then
		return
	end

	local bucket = channelMembers[channel]
	if not bucket then
		return
	end

	local members = getSortedChannelMembers(channel)
	local talkingMembers = {}
	local talkingBucket = channelTalkingMembers[channel] or {}

	for memberSrc, isTalking in pairs(talkingBucket) do
		if isTalking and bucket[memberSrc] then
			talkingMembers[#talkingMembers + 1] = memberSrc
		end
	end

	table.sort(talkingMembers)

	for src, _ in pairs(bucket) do
		TriggerClientEvent("Radio:Client:MemberListUpdate", src, {
			members = members,
			channelName = getChannelHeaderForPlayer(src, channel),
			talkingMembers = talkingMembers,
		})
	end
end

local function removePlayerFromChannel(src, channel)
	if not channel or channel <= 0 then
		return
	end

	local bucket = channelMembers[channel]
	if not bucket then
		return
	end

	bucket[src] = nil
	if channelTalkingMembers[channel] then
		channelTalkingMembers[channel][src] = nil
	end

	if next(bucket) == nil then
		channelMembers[channel] = nil
		channelTalkingMembers[channel] = nil
	else
		sendChannelUpdate(channel)
	end
end

RegisterNetEvent("VOIP:Radio:Server:SetChannel", function(channel)
	local src = source
	local newChannel = tonumber(channel) or 0
	local oldChannel = playerChannels[src] or 0

	if oldChannel == newChannel then
		if newChannel > 0 then
			sendChannelUpdate(newChannel)
		else
			TriggerClientEvent("Radio:Client:MemberListUpdate", src, {
				members = {},
				channelName = "",
			})
		end
		return
	end

	if oldChannel > 0 then
		removePlayerFromChannel(src, oldChannel)
	end

	if newChannel > 0 then
		channelMembers[newChannel] = channelMembers[newChannel] or {}
		channelTalkingMembers[newChannel] = channelTalkingMembers[newChannel] or {}
		channelMembers[newChannel][src] = true
		channelTalkingMembers[newChannel][src] = false
		playerChannels[src] = newChannel
		sendChannelUpdate(newChannel)
	else
		playerChannels[src] = nil
		TriggerClientEvent("Radio:Client:MemberListUpdate", src, {
			members = {},
			channelName = "",
			talkingMembers = {},
		})
	end
end)

RegisterNetEvent("VOIP:Radio:Server:SetTalking", function(isTalking)
	local src = source
	local channel = playerChannels[src]
	if not channel or channel <= 0 then
		return
	end

	local bucket = channelMembers[channel]
	if not bucket then
		return
	end

	channelTalkingMembers[channel] = channelTalkingMembers[channel] or {}
	channelTalkingMembers[channel][src] = isTalking == true

	for memberSrc, _ in pairs(bucket) do
		TriggerClientEvent("Radio:Client:MemberTalkState", memberSrc, src, isTalking == true)
	end

	-- Keep member display data current when duty/callsign changes after joining.
	sendChannelUpdate(channel)
end)

AddEventHandler("Job:Server:DutyAdd", function(dutyData, source)
	local channel = playerChannels[source]
	if channel and channel > 0 then
		sendChannelUpdate(channel)
	end
end)

AddEventHandler("Job:Server:DutyRemove", function(dutyData, source)
	local channel = playerChannels[source]
	if channel and channel > 0 then
		sendChannelUpdate(channel)
	end
end)

local function isRadioAdmin(src)
	if src == 0 then
		return true
	end

	return IsPlayerAceAllowed(src, "strata.admin") or IsPlayerAceAllowed(src, "strata.staff") or IsPlayerAceAllowed(src, "command")
end

RegisterCommand("setradiochannelname", function(src, args)
	if not isRadioAdmin(src) then
		return
	end

	local channel = normalizeChannel(args[1])
	if not channel then
		return
	end

	table.remove(args, 1)
	local name = table.concat(args, " ")

	if name == "" then
		channelNames[tostring(channel)] = nil
	else
		channelNames[tostring(channel)] = name
	end

	saveStorage()
	sendChannelUpdate(channel)
end, false)

RegisterCommand("setradioalias", function(src, args)
	if src == 0 then
		return
	end

	local channel = normalizeChannel(args[1])
	if not channel then
		channel = playerChannels[src]
		if not channel or channel <= 0 then
			return
		end
	else
		table.remove(args, 1)
	end

	local alias = table.concat(args, " ")
	local key = getPlayerStorageKey(src)

	playerChannelAliases[key] = playerChannelAliases[key] or {}

	if alias == "" then
		playerChannelAliases[key][tostring(channel)] = nil
		if next(playerChannelAliases[key]) == nil then
			playerChannelAliases[key] = nil
		end
	else
		playerChannelAliases[key][tostring(channel)] = alias
	end

	saveStorage()

	if playerChannels[src] == channel then
		sendChannelUpdate(channel)
	end
end, false)

AddEventHandler("onResourceStart", function(resource)
	if resource == GetCurrentResourceName() then
		loadStorage()
	end
end)

AddEventHandler("playerDropped", function()
	local src = source
	local channel = playerChannels[src]

	if channel and channel > 0 then
		removePlayerFromChannel(src, channel)
	end

	playerChannels[src] = nil
end)
