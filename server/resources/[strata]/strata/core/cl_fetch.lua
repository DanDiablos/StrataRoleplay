local function GetPlayer()
    return exports["strata"]:GetLocalPlayer()
end

local function GetCharacter()
    return exports["strata"]:GetPlayerData('Character')
end

exports('FetchPlayer', GetPlayer)
exports('FetchCharacter', GetCharacter)
