---@class SimRecord
---@field id number DB row id (used as SimId)
---@field phone_number string Phone number this SIM is linked to
---@field owner_sid number Character SID who owns the number
---@field active boolean Whether the SIM is currently active

--- Cache of active SIMs: phoneNumber -> simId
---@type table<string, number>
local _activeSimCache = {}

--- Populate cache on startup
---@return nil
local function PopulateSimCache()
    local rows = MySQL.query.await("SELECT id, phone_number FROM phone_sims WHERE active = 1")
    if rows then
        for _, row in ipairs(rows) do
            _activeSimCache[row.phone_number] = row.id
        end
        Strata.Log.Info("SIM", string.format("Loaded %d active SIMs into cache", #rows))
    end
end

--- Check if a given SIM id is currently active
---@param simId number
---@return boolean
local function IsSimActive(simId)
    for _, cachedId in pairs(_activeSimCache) do
        if cachedId == simId then
            return true
        end
    end

    local row = MySQL.single.await("SELECT active FROM phone_sims WHERE id = ?", { simId })
    return row ~= nil and row.active == 1
end

--- Get the SIM card inserted in a player's phone container (utility slot 8)
---@param source number Player server id
---@return table|nil simItem The SIM item inside the phone container, or nil
local function GetInsertedSim(source)
    local container = exports.st_inventory:GetContainerFromSlot(source, 8)
    if not container or not container.items then return nil end

    for _, item in pairs(container.items) do
        if item and item.name == "simcard" then
            return item
        end
    end

    return nil
end

--- Check if a player has an active SIM inserted in their phone
---@param source number Player server id
---@return boolean
local function HasActiveSim(source)
    local sim = GetInsertedSim(source)
    if not sim or not sim.metadata then return false end

    local simId = sim.metadata.SimId
    local phoneNumber = sim.metadata.PhoneNumber
    if not simId or not phoneNumber then return false end

    -- Check the SIM is still active
    if _activeSimCache[phoneNumber] == simId then
        return true
    end

    return IsSimActive(simId)
end

--- Create a new SIM record and give the simcard item to the player's inventory
---@param source number Player server id
---@param sid number Character SID
---@param phoneNumber string Phone number to assign
---@return number|false simId or false on failure
local function CreateSim(source, sid, phoneNumber)
    local simId = MySQL.insert.await(
        "INSERT INTO phone_sims (phone_number, owner_sid, active) VALUES (?, ?, 1)",
        { phoneNumber, sid }
    )

    if not simId then
        Strata.Log.Error("SIM", string.format("Failed to create SIM for SID %d, number %s", sid, phoneNumber))
        return false
    end

    _activeSimCache[phoneNumber] = simId

    exports.st_inventory:AddItem(source, "simcard", 1, {
        SimId = simId,
        PhoneNumber = phoneNumber,
        description = "Phone Number: " .. phoneNumber,
    })

    Strata.Log.Info("SIM", string.format("Created SIM #%d for SID %d (%s)", simId, sid, phoneNumber))
    return simId
end

--- Insert a SIM directly into the player's phone container (used for migration)
---@param source number Player server id
---@param simId number SIM database id
---@param phoneNumber string Phone number
---@return boolean success
local function InsertSimIntoPhone(source, simId, phoneNumber)
    local container = exports.st_inventory:GetContainerFromSlot(source, 8)
    if not container then return false end

    -- Add the simcard item directly into the phone container
    local success = exports.st_inventory:AddItem(container, "simcard", 1, {
        SimId = simId,
        PhoneNumber = phoneNumber,
        description = "Phone Number: " .. phoneNumber,
    })

    return success ~= false
end

--- Deactivate ALL SIMs for a given phone number and notify online holders
---@param phoneNumber string
---@return boolean success
local function DeactivateSimsForNumber(phoneNumber)
    MySQL.update.await(
        "UPDATE phone_sims SET active = 0, deactivated_at = NOW() WHERE phone_number = ? AND active = 1",
        { phoneNumber }
    )

    _activeSimCache[phoneNumber] = nil

    -- Notify any online player who has this SIM inserted in their phone
    local players = GetPlayers()
    for _, playerId in ipairs(players) do
        local src = tonumber(playerId)
        if src then
            local sim = GetInsertedSim(src)
            if sim and sim.metadata and sim.metadata.PhoneNumber == phoneNumber then
                TriggerClientEvent("Phone:Client:SimDeactivated", src)
            end
        end
    end

    -- Also update any loose simcard items in inventories
    for _, playerId in ipairs(players) do
        local src = tonumber(playerId)
        if src then
            local char = Strata.User.Find(src)
            if char then
                local simItems = exports.st_inventory:ItemsGetAll(char:GetData("SID"), "simcard")
                if simItems then
                    for _, item in ipairs(simItems) do
                        if item.MetaData and item.MetaData.PhoneNumber == phoneNumber then
                            exports.st_inventory:UpdateMetaData(src, item.Slot, {
                                description = "DEACTIVATED — " .. phoneNumber,
                            })
                        end
                    end
                end
            end
        end
    end

    Strata.Log.Info("SIM", string.format("Deactivated all SIMs for number %s", phoneNumber))
    return true
end

--- Remove all simcard items from a player's inventory (not from phone container)
---@param source number Player server id
---@param sid number Character SID
---@param phoneNumber string|nil Only remove SIMs matching this number (nil = remove all)
---@return number count Number of items removed
local function RemoveSimItems(source, sid, phoneNumber)
    local simItems = exports.st_inventory:ItemsGetAll(sid, "simcard")
    local count = 0

    if simItems then
        for _, item in ipairs(simItems) do
            if not phoneNumber or (item.MetaData and item.MetaData.PhoneNumber == phoneNumber) then
                exports.st_inventory:RemoveSlot(sid, "simcard", 1, item.Slot, 1)
                count = count + 1
            end
        end
    end

    return count
end

-- Exports
exports("CreateSim", CreateSim)
exports("InsertSimIntoPhone", InsertSimIntoPhone)
exports("DeactivateSimsForNumber", DeactivateSimsForNumber)
exports("IsSimActive", IsSimActive)
exports("GetInsertedSim", GetInsertedSim)
exports("HasActiveSim", HasActiveSim)
exports("RemoveSimItems", RemoveSimItems)

-- Populate cache on resource start
AddEventHandler("onResourceStart", function(resource)
    if resource == GetCurrentResourceName() then
        PopulateSimCache()
    end
end)
