local isPlayerIDActive = false
local playerGamerTags = {}
local distanceToCheck = 150

local gamerTagCompsEnum = {
    GamerName = 0,
    CrewTag = 1,
    HealthArmour = 2,
    BigText = 3,
    AudioIcon = 4,
    UsingMenu = 5,
    PassiveMode = 6,
    WantedStars = 7,
    Driver = 8,
    CoDriver = 9,
    Tagged = 12,
    GamerNameNearby = 13,
    Arrow = 14,
    Packages = 15,
    InvIfPedIsFollowing = 16,
    RankText = 17,
    Typing = 18,
}

---@param playerId number
---@param source number
---@return string?
local function getCharacterFullName(playerId, source)
    local replicatedName = GlobalState[string.format("CHAR_NAME:%s", source)]
    if replicatedName and type(replicatedName) == "string" and replicatedName ~= "" then
        return replicatedName
    end

    local stateBag = nil
    if playerId ~= nil then
        stateBag = Player(playerId) and Player(playerId).state or nil
    end

    if not stateBag then
        local serverPlayerId = GetPlayerFromServerId(source)
        if serverPlayerId and serverPlayerId ~= -1 then
            stateBag = Player(serverPlayerId) and Player(serverPlayerId).state or nil
        end
    end

    if stateBag then
        local char = stateBag.Character
        if type(char) == "table" then
            local first = char.First or char.first or char.FirstName or char.firstname
            local last = char.Last or char.last or char.LastName or char.lastname
            if first and last then
                return string.format("%s %s", first, last)
            end
        end

        local first = stateBag.First or stateBag.first or stateBag.FirstName or stateBag.firstname
        local last = stateBag.Last or stateBag.last or stateBag.LastName or stateBag.lastname
        if first and last then
            return string.format("%s %s", first, last)
        end
    end

    local sidState = GlobalState[string.format("SID:%s", source)]
    if sidState and type(sidState) == "string" and sidState ~= "" then
        return sidState
    end

    return nil
end

local function cleanUpGamerTags()
    for _, v in pairs(playerGamerTags) do
        if IsMpGamerTagActive(v.gamerTag) then
            RemoveMpGamerTag(v.gamerTag)
        end
    end
    playerGamerTags = {}
end

local function showGamerTags()
    local curCoords = GetEntityCoords(PlayerPedId())
    if exports["st_admin"]:NoClipIsActive() then
        curCoords = exports["st_admin"]:NoClipGetPos()
    end

    local allActivePlayers = GetActivePlayers()

    for _, i in ipairs(allActivePlayers) do
        local targetPed = GetPlayerPed(i)
        local source = GetPlayerServerId(i)
        local fullCharacterName = getCharacterFullName(i, source)
        local displayName = fullCharacterName or GetPlayerName(i)
        local playerStr = string.format("[%s] %s", source, displayName)

        if not playerGamerTags[i] or not IsMpGamerTagActive(playerGamerTags[i].gamerTag) then
            playerGamerTags[i] = {
                gamerTag = CreateFakeMpGamerTag(targetPed, playerStr, false, false, 0),
                ped = targetPed,
                currentLabel = playerStr,
            }
        elseif playerGamerTags[i].currentLabel ~= playerStr then
            RemoveMpGamerTag(playerGamerTags[i].gamerTag)
            playerGamerTags[i].gamerTag = CreateFakeMpGamerTag(targetPed, playerStr, false, false, 0)
            playerGamerTags[i].currentLabel = playerStr
        end

        local targetTag = playerGamerTags[i].gamerTag
        local targetPedCoords = GetEntityCoords(targetPed)

        if #(targetPedCoords - curCoords) <= distanceToCheck then
            SetMpGamerTagVisibility(targetTag, gamerTagCompsEnum.GamerName, 1)
            SetMpGamerTagAlpha(targetTag, gamerTagCompsEnum.AudioIcon, 255)
            SetMpGamerTagVisibility(targetTag, gamerTagCompsEnum.AudioIcon, NetworkIsPlayerTalking(i))
            SetMpGamerTagHealthBarColor(targetTag, 129)
            SetMpGamerTagAlpha(targetTag, gamerTagCompsEnum.HealthArmour, 255)
            SetMpGamerTagVisibility(targetTag, gamerTagCompsEnum.HealthArmour, 1)
        else
            SetMpGamerTagVisibility(targetTag, gamerTagCompsEnum.GamerName, 0)
            SetMpGamerTagVisibility(targetTag, gamerTagCompsEnum.HealthArmour, 0)
            SetMpGamerTagVisibility(targetTag, gamerTagCompsEnum.AudioIcon, 0)
        end
    end
end

local function toggleAdminPlayerIDs()
    isPlayerIDActive = not isPlayerIDActive
    if not isPlayerIDActive then
        exports["st_ui"]:Notification("info", "Player IDs Disabled")
        cleanUpGamerTags()
    else
        exports["st_ui"]:Notification("info", "Player IDs Enabled")
        CreateThread(function()
            while isPlayerIDActive do
                showGamerTags()
                Wait(50)
            end
        end)
    end
end

exports("ToggleAdminPlayerIDs", toggleAdminPlayerIDs)
