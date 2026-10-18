local hasMenu = false
local menuOpen = false

---@param txt string
local function copyClipboard(txt)
    SendNUIMessage({
        type = "COPY",
        data = {
            data = txt,
        },
    })
end

local function openMenu()
    if not menuOpen and hasMenu then
        menuOpen = true
        SendNUIMessage({ type = "APP_SHOW" })
        SetNuiFocus(true, true)
    end
end

local function closeMenu()
    if menuOpen then
        SendNUIMessage({ type = "APP_HIDE" })
        SetNuiFocus(false, false)
        menuOpen = false
    end
end

---@param route string
local function openMenuToRoute(route)
    if not menuOpen and hasMenu then
        menuOpen = true
        SendNUIMessage({ type = "APP_SHOW" })
        SetNuiFocus(true, true)
        Wait(100)
        SendNUIMessage({ type = "SET_ROUTE", data = { route = route } })
    end
end

exports("OpenMenu", openMenu)
exports("CloseMenu", closeMenu)
exports("CopyClipboard", copyClipboard)
exports("OpenMenuToRoute", openMenuToRoute)

RegisterNetEvent("Admin:Client:CopyClipboard", function(data)
    copyClipboard(data)
end)

RegisterNetEvent("Admin:Client:Menu:RecievePermissionData", function(userData, permission, permissionName, permissionLevel)
    if not hasMenu then
        hasMenu = true

        SendNUIMessage({
            type = "SET_USERDATA",
            data = {
                user = userData,
                permission = permission,
                permissionName = permissionName,
                permissionLevel = permissionLevel,
            },
        })
    end
end)

RegisterNetEvent("Admin:Client:Menu:Open", function()
    openMenu()
end)

RegisterNetEvent("Admin:Client:Menu:Close", function()
    closeMenu()
end)

RegisterNetEvent("UI:Client:Reset", function()
    closeMenu()
end)

RegisterNUICallback("Close", function(_, cb)
    cb("OK")
    closeMenu()
end)

RegisterNUICallback("GetPlayerList", function(data, cb)
    if data and data.disconnected then
        exports["strata"]:ServerCallback("Admin:GetDisconnectedPlayerList", data, cb)
    else
        exports["strata"]:ServerCallback("Admin:GetPlayerList", data, cb)
    end
end)

RegisterNUICallback("GetPlayer", function(data, cb)
    exports["strata"]:ServerCallback("Admin:GetPlayer", data, cb)
end)

RegisterNUICallback("Admin:GetItemDatabase", function(_, cb)
    cb(GlobalState.AdminItemDatabase or {})
end)

RegisterNUICallback("Admin:GiveItem", function(data, cb)
    exports["strata"]:ServerCallback("Admin:GiveItem", data, cb)
end)

RegisterNUICallback("Admin:GetJobDatabase", function(data, cb)
    exports["strata"]:ServerCallback("Admin:GetJobDatabase", data, cb)
end)

RegisterNUICallback("Admin:GiveJob", function(data, cb)
    exports["strata"]:ServerCallback("Admin:GiveJob", data, cb)
end)

RegisterNUICallback("GetCurrentVehicle", function(_, cb)
    local insideVehicle = GetVehiclePedIsIn(LocalPlayer.state.ped, true)
    if insideVehicle and insideVehicle > 0 and DoesEntityExist(insideVehicle) then
        local vehState = Entity(insideVehicle).state
        local vehicleCoords = GetEntityCoords(insideVehicle)
        local vehicleHeading = GetEntityHeading(insideVehicle)
        local currentSeat = "Not In Vehicle"
        for i = -1, 14 do
            if GetPedInVehicleSeat(insideVehicle, i) == LocalPlayer.state.ped then
                currentSeat = i
                break
            end
        end

        cb({
            Make = vehState.Make,
            Model = vehState.Model,
            VIN = vehState.VIN,
            Owned = vehState.Owned,
            Owner = vehState.Owner,
            Plate = vehState.Plate,
            Value = vehState.Value,
            EntityModel = GetEntityModel(insideVehicle),
            Coords = {
                x = vehicleCoords.x,
                y = vehicleCoords.y,
                z = vehicleCoords.z,
            },
            Heading = vehicleHeading,
            Seat = currentSeat,
            Fuel = vehState.Fuel,
            Damage = vehState.Damage,
            DamagedParts = vehState.DamagedParts,
        })
    else
        cb(false)
    end
end)

RegisterNUICallback("ActionPlayer", function(data, cb)
    exports["strata"]:ServerCallback("Admin:ActionPlayer", data, cb)
end)

RegisterNUICallback("KickPlayer", function(data, cb)
    exports["strata"]:ServerCallback("Admin:KickPlayer", data, cb)
end)

RegisterNUICallback("BanPlayer", function(data, cb)
    exports["strata"]:ServerCallback("Admin:BanPlayer", data, cb)
end)

RegisterNUICallback("GetVehicleList", function(data, cb)
    exports["strata"]:ServerCallback("Admin:GetVehicleList", data, cb)
end)

RegisterNUICallback("GetVehicle", function(data, cb)
    exports["strata"]:ServerCallback("Admin:GetVehicle", data, cb)
end)

RegisterNUICallback("ActionVehicle", function(data, cb)
    if data and data.model then
        data.numSeats = GetVehicleModelNumberOfSeats(data.model)
    end
    exports["strata"]:ServerCallback("Admin:VehicleAction", data, cb)
end)

RegisterNUICallback("GetAllPlayersByCharacter", function(data, cb)
    exports["strata"]:ServerCallback("Admin:GetAllPlayersByCharacter", data, cb)
end)

RegisterNUICallback("CurrentVehicleAction", function(data, cb)
    local insideVehicle = GetVehiclePedIsIn(LocalPlayer.state.ped, true)
    if insideVehicle and insideVehicle > 0 and DoesEntityExist(insideVehicle) then
        exports["strata"]:ServerCallback("Admin:CurrentVehicleAction", data, function(canDo)
            if canDo then
                if data.action == "repair" then
                    if exports["st_veh"]:RepairNormal(insideVehicle) then
                        return cb({ success = true, message = "Vehicle Repaired" })
                    end
                elseif data.action == "repair_full" then
                    if exports["st_veh"]:RepairFull(insideVehicle) then
                        return cb({ success = true, message = "Vehicle Repaired Fully" })
                    end
                elseif data.action == "repair_engine" then
                    if exports["st_veh"]:RepairEngine(insideVehicle) then
                        return cb({ success = true, message = "Engine Repaired" })
                    end
                elseif data.action == "explode" then
                    exports["strata"]:NetworkExplodeVehicle(insideVehicle, 1, 0)
                    return cb({ success = true, message = "Vehicle Exploded" })
                elseif data.action == "alarm" then
                    if IsVehicleAlarmSet(insideVehicle) then
                        SetVehicleAlarm(insideVehicle, false)
                    else
                        SetVehicleAlarm(insideVehicle, true)
                        SetVehicleAlarmTimeLeft(insideVehicle, 25000)
                    end
                    return cb({ success = true, message = "Vehicle Alarm Activated" })
                elseif data.action == "fuel" then
                    Entity(insideVehicle).state:set("Fuel", 100, true)
                    return cb({ success = true, message = "Vehicle Refueled" })
                elseif data.action == "customs" then
                    TriggerEvent("VehicleCustoms:Client:Admin", true, 0.0)
                    SetTimeout(1000, function()
                        closeMenu()
                    end)
                    return cb({ success = true, message = "Opened" })
                end

                cb(false)
            else
                cb(false)
            end
        end)
    else
        cb({ success = false, message = "No Longer In Vehicle Control" })
    end
end)

RegisterNUICallback("StopAllAttach", function(_, cb)
    cb("OK")
    exports["st_admin"]:AdminStopAttach()
end)

RegisterNUICallback("GetPlayerHistory", function(_, cb)
    cb({
        current = GlobalState.PlayerCount or 0,
        max = GlobalState.MaxPlayers or 1,
        queue = GlobalState.QueueCount or 0,
        history = GlobalState.AdminPlayerHistory,
    })
end)

RegisterNUICallback("ToggleNoClip", function(_, cb)
    cb("OK")
    if LocalPlayer.state.isStaff then
        exports["strata"]:ServerCallback("Admin:NoClip", {
            active = not exports["st_admin"]:NoClipIsActive(),
        }, function(isAdmin)
            if isAdmin then
                exports["st_admin"]:NoClipToggle()
            end
        end)
    end
end)

RegisterNUICallback("ToggleInvisible", function(data, cb)
    exports["strata"]:ServerCallback("Admin:ToggleInvisible", data, cb)
end)

RegisterNUICallback("ToggleIDs", function(_, cb)
    cb("OK")
    if LocalPlayer.state.isStaff then
        exports["st_admin"]:ToggleAdminPlayerIDs()
    end
end)
