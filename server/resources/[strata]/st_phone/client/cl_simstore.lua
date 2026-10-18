---@type number[]
local _storePeds = {}

---@type number[]
local _storeBlips = {}

--- Spawn store NPCs and blips
---@return nil
local function CreateStores()
    for i, loc in ipairs(Config.Sim.StoreLocations) do
        local model = Config.Sim.StorePedModel
        RequestModel(model)
        while not HasModelLoaded(model) do
            Wait(10)
        end

        local ped = CreatePed(0, model, loc.x, loc.y, loc.z - 1.0, loc.w, false, false)
        FreezeEntityPosition(ped, true)
        SetEntityInvincible(ped, true)
        SetBlockingOfNonTemporaryEvents(ped, true)
        TaskStartScenarioInPlace(ped, "WORLD_HUMAN_STAND_IMPATIENT", 0, true)
        _storePeds[i] = ped

        exports['st_target']:addLocalEntity(ped, {
            {
                icon = "fas fa-sim-card",
                label = "Phone Store",
                distance = 2.5,
                onSelect = function()
                    OpenSimStore()
                end,
            },
        })

    end
end

--- Cleanup store peds and blips
---@return nil
local function CleanupStores()
    for _, ped in ipairs(_storePeds) do
        if DoesEntityExist(ped) then
            DeleteEntity(ped)
        end
    end
    _storePeds = {}

    for _, blip in ipairs(_storeBlips) do
        if DoesBlipExist(blip) then
            RemoveBlip(blip)
        end
    end
    _storeBlips = {}
end

--- Open the SIM store menu
---@return nil
function OpenSimStore()
    exports["strata"]:ServerCallback("Phone:SimStore:GetInfo", {}, function(info)
        if not info then return end

        local menu = {
            main = {
                label = "Phone Store",
                items = {},
            },
            replace = {
                label = "Replace SIM Card",
                items = {},
            },
            burner = {
                label = "Buy Burner SIM",
                items = {},
            },
        }

        -- Main menu
        table.insert(menu.main.items, {
            label = "Your Number: " .. (info.PhoneNumber or "None"),
            description = info.HasActiveSim and "SIM Active" or "No Active SIM",
            event = false,
        })

        table.insert(menu.main.items, {
            label = "Replace My SIM — $" .. info.ReplaceCost,
            description = "Deactivates all stolen SIMs. You'll get a new SIM to insert into your phone via inventory.",
            submenu = "replace",
        })

        table.insert(menu.main.items, {
            label = "Buy Burner SIM — $" .. info.BurnerCost,
            description = "Brand new phone number with no history. Your old SIM will be ejected — insert the new one via inventory.",
            submenu = "burner",
        })

        -- Replace confirmation submenu
        table.insert(menu.replace.items, {
            label = "Your number: " .. (info.PhoneNumber or "None"),
            description = "All other SIMs with this number will be deactivated immediately.",
            event = false,
        })

        table.insert(menu.replace.items, {
            label = "Confirm — Pay $" .. info.ReplaceCost,
            event = "Phone:Client:SimStore:ConfirmReplace",
        })

        -- Burner confirmation submenu
        table.insert(menu.burner.items, {
            label = "A new phone number will be generated",
            description = "You will start fresh — no contacts, messages, or call history. Your old SIM will be returned to your inventory.",
            event = false,
        })

        table.insert(menu.burner.items, {
            label = "Confirm — Pay $" .. info.BurnerCost,
            event = "Phone:Client:SimStore:ConfirmBurner",
        })

        exports['st_ui']:ListMenuShow(menu)
    end)
end

--- Handle Replace SIM confirmation
AddEventHandler("Phone:Client:SimStore:ConfirmReplace", function()
    exports['st_ui']:ListMenuClose()
    exports["strata"]:ServerCallback("Phone:SimStore:ReplaceSim", {}, function(result)
        if result and result.success then
            exports["st_ui"]:Notification("success", result.message, 5000)
        else
            exports["st_ui"]:Notification("error", result and result.message or "Failed to replace SIM", 5000)
        end
    end)
end)

--- Handle Buy Burner confirmation
AddEventHandler("Phone:Client:SimStore:ConfirmBurner", function()
    exports['st_ui']:ListMenuClose()
    exports["strata"]:ServerCallback("Phone:SimStore:BuyBurner", {}, function(result)
        if result and result.success then
            exports["st_ui"]:Notification("success", result.message, 5000)
        else
            exports["st_ui"]:Notification("error", result and result.message or "Failed to buy burner SIM", 5000)
        end
    end)
end)

-- Lifecycle
AddEventHandler("Characters:Client:Spawn", function()
    CreateStores()
end)

RegisterNetEvent("Characters:Client:Logout", function()
    CleanupStores()
end)

AddEventHandler("onResourceStop", function(resource)
    if resource == GetCurrentResourceName() then
        CleanupStores()
    end
end)
