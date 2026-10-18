local function RegisterMenuItems()
    exports['st_ui']:InteractionRegisterMenu("storage-units", "Storage Unit", "warehouse", function(data)
        exports['st_ui']:InteractionShowMenu({
            {
                icon = "warehouse",
                label = "Access Storage",
                action = function()
                    exports['st_ui']:InteractionHide()
                    exports['st_business']:StorageUnitsAccess()
                end,
                shouldShow = function()
                    return true
                end,
            },
            {
                icon = "bomb",
                label = "Raid Storage",
                action = function()
                    exports['st_ui']:InteractionHide()
                    local nearUnit = exports['st_business']:StorageUnitsGetNearUnit()
                    if nearUnit and nearUnit?.unitId then
                        local unit = GlobalState[string.format("StorageUnit:%s", nearUnit.unitId)]

                        exports["strata"]:ServerCallback("StorageUnits:PoliceRaid", {
                            unit = nearUnit.unitId
                        }, function(success)
                            if not success then
                                exports["st_ui"]:Notification("error", "Error!")
                            else
                                exports["st_sound"]:PlayLocation(LocalPlayer.state.myPos, 10, "breach.ogg", 0.15)
                            end
                        end)
                    end
                end,
                shouldShow = function()
                    return LocalPlayer.state.onDuty == "police"
                end,
            },
            {
                icon = "gear",
                label = "Manage",
                action = function()
                    exports['st_ui']:InteractionHide()
                    exports['st_business']:StorageUnitsManage()
                end,
                shouldShow = function()
                    local nearUnit = exports['st_business']:StorageUnitsGetNearUnit()
                    if nearUnit and nearUnit?.unitId then
                        local unit = GlobalState[string.format("StorageUnit:%s", nearUnit.unitId)]

                        return (unit.owner and type(unit.owner) == "table" and unit.owner.SID == LocalPlayer.state.Character:GetData("SID")) or
                            exports['st_jobs']:HasJob(unit.managedBy)
                    end
                end,
            },
            {
                icon = "gears",
                label = "Manage All",
                action = function()
                    exports['st_ui']:InteractionHide()
                    local nearUnit = exports['st_business']:StorageUnitsGetNearUnit()
                    if nearUnit and nearUnit?.unitId then
                        local unit = GlobalState[string.format("StorageUnit:%s", nearUnit.unitId)]

                        exports['st_business']:StorageUnitsManageAll(unit.managedBy)
                    end
                end,
                shouldShow = function()
                    local nearUnit = exports['st_business']:StorageUnitsGetNearUnit()
                    if nearUnit and nearUnit?.unitId then
                        local unit = GlobalState[string.format("StorageUnit:%s", nearUnit.unitId)]

                        return exports['st_jobs']:HasJob(unit.managedBy)
                    end
                end,
            },
        })
    end, function()
        return exports['st_business']:StorageUnitsGetNearUnit() and LocalPlayer.state.Character
    end)
end

AddEventHandler("Businesses:Client:Startup", function()
    RegisterMenuItems()

    exports["strata"]:RegisterClientCallback("StorageUnits:Passcode", function(code, cb)
        exports['st_minigames']:MinigamePlayKeypad(code, false, 10000, true, {
            onSuccess = function(data)
                Wait(2000)
                cb(true, data)
            end,
            onFail = function(data)
                cb(false)
            end,
        }, {
            useWhileDead = false,
            vehicle = false,
            controlDisables = {
                disableMovement = true,
                disableCarMovement = true,
                disableMouse = false,
                disableCombat = true,
            },
            animation = {
                animDict = "amb@prop_human_atm@male@idle_a",
                anim = "idle_b",
                flags = 49,
            },
        })
    end)
end)

AddEventHandler('st_ui:RegisterMenuItems', function()
    RegisterMenuItems()
end)

exports('StorageUnitsAccess', function()
    local nearUnit = exports['st_business']:StorageUnitsGetNearUnit()
    if nearUnit and nearUnit?.unitId then
        exports["strata"]:ServerCallback("StorageUnits:Access", nearUnit?.unitId)
    end
end)

RegisterNetEvent("StorageUnits:OpenStash", function(unitId)
    local SID = LocalPlayer.state.Character:GetData("SID")
    if SID then
        exports.st_inventory:openInventory('stash', {
            id = string.format("storage_unit_%s", unitId),
            owner = SID
        })
    end
end)

exports('StorageUnitsManage', function(specificUnit)
    local nearUnit = exports['st_business']:StorageUnitsGetNearUnit()

    if specificUnit then
        nearUnit = { unitId = specificUnit }
    end

    if nearUnit and nearUnit?.unitId then
        local unit = GlobalState[string.format("StorageUnit:%s", nearUnit.unitId)]
        if unit then
            local menu = {
                main = {
                    label = "Manage " .. unit.label,
                    items = {
                        {
                            label = "Storage Last Accessed",
                            description = unit.lastAccessed and
                                string.format("Unit Last Accessed %s ago.",
                                    Strata.Clock.Human(GetCloudTimeAsInt() - unit.lastAccessed)) or "Never",
                        },
                    }
                },
            }

            if unit.owner and type(unit.owner) == "table" and LocalPlayer.state.Character and LocalPlayer.state.Character:GetData("SID") == unit.owner.SID then
                table.insert(menu.main.items, {
                    label = "Set Passcode",
                    description = "Change the passcode for your storage unit",
                    data = { unit = nearUnit.unitId },
                    event = "StorageUnits:ChangePasscode",
                })
            end

            if exports['st_jobs']:HasJob(unit.managedBy) then
                if unit.owner and type(unit.owner) == "table" then
                    table.insert(menu.main.items, {
                        label = "Current Unit Owner",
                        description = string.format("Owned By %s %s (State ID: %s)", unit.owner.First,
                            unit.owner.Last, unit.owner.SID),
                    })

                    table.insert(menu.main.items, {
                        label = "Unit Sold By",
                        description = string.format("Sold By %s %s (State ID: %s) %s ago.", unit.soldBy.First,
                            unit.soldBy.Last, unit.soldBy.SID,
                            Strata.Clock.Human(GetCloudTimeAsInt() - unit.soldAt)),
                    })
                end
            end

            if exports['st_jobs']:HasJob(unit.managedBy, false, false, false, false, "UNIT_SELL") then
                table.insert(menu.main.items, {
                    label = "Sell Storage Unit",
                    description = "Set the new owner of the storage unit",
                    data = { unit = nearUnit.unitId },
                    event = "StorageUnits:StartSell",
                })
            end

            exports['st_ui']:ListMenuShow(menu)
        end
    end
end)

exports('StorageUnitsManageAll', function(managedBy)
    local menu = {
        main = {
            label = "Manage All Storage Units",
            items = {}
        },
    }

    if GlobalState["StorageUnits"] then
        for k, v in ipairs(GlobalState["StorageUnits"]) do
            local unit = GlobalState[string.format("StorageUnit:%s", v)]
            if unit and unit.managedBy == managedBy then
                table.insert(menu.main.items, {
                    label = unit.label,
                    description = unit.owner and type(unit.owner) == "table" and
                        string.format("Owned By %s %s", unit.owner.First, unit.owner.Last) or
                        "Not Owned",
                    data = { unit = unit.id },
                    event = "StorageUnits:Manage",
                })
            end
        end
    end

    exports['st_ui']:ListMenuShow(menu)
end)

exports('StorageUnitsGetNearUnit', function()
    if LocalPlayer.state.currentRoute ~= 0 then
        return false
    end

    local myCoords = GetEntityCoords(LocalPlayer.state.ped)

    if GlobalState["StorageUnits"] == nil then
        return false
    else
        local closest = nil
        for k, v in ipairs(GlobalState["StorageUnits"]) do
            local unit = GlobalState[string.format("StorageUnit:%s", v)]
            if unit then
                local dist = #(myCoords - unit.location)
                if dist < 3.0 and (not closest or dist < closest.dist) then
                    closest = {
                        dist = dist,
                        unitId = unit.id,
                    }
                end
            end
        end
        return closest
    end
end)

AddEventHandler("StorageUnits:ChangePasscode", function(data)
    exports['st_ui']:InputShow("Change Unit Passcode", "New Passcode", {
        {
            id = "passcode",
            type = "text",
            options = {
                helperText = "Numbers Only - Minimum Length of 4 and a Maximum Length of 8",
                inputProps = {
                    pattern = "[0-9]+",
                    minlength = 4,
                    maxlength = 8,
                },
            },
        },
    }, "StorageUnits:Client:NewPasscode", data)
end)

AddEventHandler("StorageUnits:Client:NewPasscode", function(values, data)
    if values and values.passcode and #values.passcode >= 4 then
        exports["strata"]:ServerCallback("StorageUnits:ChangePasscode", {
            unit = data.unit,
            passcode = values.passcode,
        }, function(success)
            if success then
                exports["st_ui"]:Notification("success", "Updated Passcode")
            else
                exports["st_ui"]:Notification("error", "Failed to Update Passcode")
            end
        end)
    end
end)

AddEventHandler("StorageUnits:StartSell", function(data)
    exports['st_ui']:InputShow("Set Storage Unit Owner", "State ID", {
        {
            id = "SID",
            type = "number",
            options = {
                --helperText = "Numbers Only - Minimum Length of 4 and a Maximum Length of 8",
                inputProps = {},
            },
        },
    }, "StorageUnits:Client:SellUnit", data)
end)

AddEventHandler("StorageUnits:Client:SellUnit", function(values, data)
    if values and values.SID then
        local stateId = tonumber(values.SID)
        if stateId and stateId > 0 then
            exports["strata"]:ServerCallback("StorageUnits:SellUnit", {
                unit = data.unit,
                SID = stateId,
            }, function(success)
                if success then
                    exports["st_ui"]:Notification("success", "Storage Unit Sold")
                else
                    exports["st_ui"]:Notification("error", "Failed to Sell Storage Unit")
                end
            end)
        else
            exports["st_ui"]:Notification("error", "Invalid State ID")
        end
    end
end)

AddEventHandler("StorageUnits:Manage", function(data)
    if data?.unit then
        exports['st_business']:StorageUnitsManage(data.unit)
    end
end)
