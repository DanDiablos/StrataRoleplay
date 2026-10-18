-- ========================================================================
-- Database
-- ========================================================================

---@param billboardId string
---@param url string|false
---@return boolean
local function setBillboardURL(billboardId, url)
    local result = MySQL.query.await(
        "INSERT INTO billboards (billboardId, billboardUrl) VALUES (?, ?) ON DUPLICATE KEY UPDATE billboardUrl = ?",
        { billboardId, url, url }
    )
    return result and result.affectedRows > 0
end

local function fetchBillboardsData()
    local result = MySQL.query.await("SELECT billboardId, billboardUrl FROM billboards")

    local fetched = {}
    if result and #result > 0 then
        for _, v in ipairs(result) do
            if v.billboardId and v.billboardUrl then
                fetched[v.billboardId] = v.billboardUrl
            end
        end
    end

    for id in pairs(Config) do
        GlobalState[string.format("Billboards:%s", id)] = fetched[id]
    end
end

-- ========================================================================
-- Exports
-- ========================================================================

---@param id string
---@param url string|false
---@return boolean
local function setBillboard(id, url)
    if id and Config[id] then
        local updated = setBillboardURL(id, url)
        if updated then
            GlobalState[string.format("Billboards:%s", id)] = url
            TriggerClientEvent("Billboards:Client:UpdateBoardURL", -1, id, url)
            return true
        end
    end
    return false
end

exports("Set", setBillboard)

exports("Get", function(id)
    return GlobalState[string.format("Billboards:%s", id)]
end)

exports("GetCategory", function(cat)
    local ids = {}
    for id, entry in pairs(Config) do
        if entry.category == cat then
            table.insert(ids, id)
        end
    end
    return ids
end)

-- ========================================================================
-- Initialization
-- ========================================================================

AddEventHandler("onResourceStart", function(resource)
    if resource ~= GetCurrentResourceName() then return end

    fetchBillboardsData()

    Wait(1000)

    exports["st_chat"]:RegisterAdminCommand("setbillboard", function(_, args)
        local billboardId, billboardUrl = args[1], args[2]

        if not billboardUrl or #billboardUrl <= 10 then
            billboardUrl = false
        end

        setBillboard(billboardId, billboardUrl)
    end, {
        help = "Set a Billboard URL",
        params = {
            { name = "ID", help = "Billboard ID" },
            { name = "URL", help = "Billboard URL" },
        },
    }, 2)

    exports["strata"]:RegisterServerCallback("Billboards:UpdateURL", function(source, data, cb)
        local entry = Config[data and data.id]
        if not entry or not entry.job or Player(source).state.onDuty ~= entry.job then
            return cb(false)
        end

        local billboardUrl = data.link
        if not billboardUrl or #billboardUrl <= 5 then
            billboardUrl = false
        end

        if not billboardUrl or exports["strata"]:RegexTest(ConfigUrlRegex, billboardUrl, "gim") then
            cb(setBillboard(data.id, billboardUrl))
        else
            cb(false, true)
        end
    end)
end)
