-- ========================================================================
-- DUI Component Management
-- ========================================================================

local duiCounter = 0
local duiObjects = {}

---@class DUIRef
---@field id number
---@field dictionary string
---@field texture string

---@param url string
---@param width? number
---@param height? number
---@return DUIRef
local function createDUI(url, width, height)
    width = width or 512
    height = height or 512

    duiCounter += 1

    local dictName = string.format("billboard-%s-dict", duiCounter)
    local txtName = string.format("billboard-%s-txt", duiCounter)

    local duiObject = CreateDui(url, width, height)
    local dictObject = CreateRuntimeTxd(dictName)
    local duiHandle = GetDuiHandle(duiObject)
    local txdObject = CreateRuntimeTextureFromDuiHandle(dictObject, txtName, duiHandle)

    duiObjects[duiCounter] = {
        duiObject = duiObject,
        duiHandle = duiHandle,
        dictObject = dictObject,
        txtObject = txdObject,
    }

    return {
        id = duiCounter,
        dictionary = dictName,
        texture = txtName,
    }
end

---@param id number
---@param url string
local function updateDUI(id, url)
    if not duiObjects[id] then return end
    SetDuiUrl(duiObjects[id].duiObject, url)
end

---@param id number
local function releaseDUI(id)
    if not duiObjects[id] then return end
    DestroyDui(duiObjects[id].duiObject)
    duiObjects[id] = nil
end

-- ========================================================================
-- Billboard Streaming
-- ========================================================================

local activeDUIs = {}

---@param id string
---@param entry BillboardEntry
local function loadBillboard(id, entry)
    if activeDUIs[id] or not entry.url then return end

    local ref = createDUI(entry.url, entry.width, entry.height)
    AddReplaceTexture(entry.originalDictionary, entry.originalTexture, ref.dictionary, ref.texture)
    activeDUIs[id] = ref
end

---@param id string
---@param entry BillboardEntry
local function unloadBillboard(id, entry)
    if not activeDUIs[id] then return end

    releaseDUI(activeDUIs[id].id)
    RemoveReplaceTexture(entry.originalDictionary, entry.originalTexture)
    activeDUIs[id] = nil
end

-- ========================================================================
-- URL Input
-- ========================================================================

local linkPromise = nil

---@param id string
---@return string?
local function getNewLink(id)
    local width = 512
    local height = 512
    if id and Config[id] then
        width = Config[id].width
        height = Config[id].height
    end

    linkPromise = promise.new()
    exports["st_ui"]:InputShow("Set Link", "Allowed URLS: Imgur, ImgBB, Postimages, Fivemanage", {
        {
            id = "name",
            type = "text",
            options = {
                helperText = string.format("Leave Blank to Reset - Resolution: %s x %s", width, height),
                inputProps = {},
            },
        },
    }, "Billboards:Client:RecieveInput", {})

    return Citizen.Await(linkPromise)
end

AddEventHandler("Billboards:Client:RecieveInput", function(values)
    if linkPromise then
        linkPromise:resolve(values?.name)
        linkPromise = nil
    end
end)

AddEventHandler("Billboards:Client:SetLink", function(data)
    local tvLink = getNewLink(data.id)
    exports["strata"]:ServerCallback("Billboards:UpdateURL", {
        id = data.id,
        link = tvLink,
    }, function(success, invalidUrl)
        if success then
            exports["st_ui"]:Notification("success", "Updated Link!", 5000)
        else
            if invalidUrl then
                exports["st_ui"]:Notification("error", "Invalid URL - Check the image host/url", 5000)
            else
                exports["st_ui"]:Notification("error", "Unable to Update Link", 5000)
            end
        end
    end)
end)

-- ========================================================================
-- Events
-- ========================================================================

RegisterNetEvent("Billboards:Client:UpdateBoardURL", function(id, url)
    if not Config[id] then return end

    if activeDUIs[id] then
        if url then
            updateDUI(activeDUIs[id].id, url)
            AddReplaceTexture(
                Config[id].originalDictionary,
                Config[id].originalTexture,
                activeDUIs[id].dictionary,
                activeDUIs[id].texture
            )
        else
            unloadBillboard(id, Config[id])
        end
    end

    Config[id].url = url
end)

RegisterNetEvent("Characters:Client:Spawn", function()
    CreateThread(function()
        Wait(5000)

        while LocalPlayer.state.loggedIn do
            local ped = PlayerPedId()
            local pedCoords = GetEntityCoords(ped)

            for id, entry in pairs(Config) do
                local dist = #(pedCoords - entry.coords)
                if dist <= entry.range then
                    loadBillboard(id, entry)
                else
                    unloadBillboard(id, entry)
                end
            end

            Wait(1500)
        end
    end)
end)

RegisterNetEvent("Characters:Client:Logout", function()
    for id, entry in pairs(Config) do
        unloadBillboard(id, entry)
    end
end)

AddEventHandler("onClientResourceStart", function(resource)
    if resource ~= GetCurrentResourceName() then return end

    for id in pairs(Config) do
        Config[id].url = GlobalState[string.format("Billboards:%s", id)]
    end
end)
