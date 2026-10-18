local disabledContracts = {}

RegisterNetEvent("Tablet:Client:Spawn", function(data)

end)

RegisterNetEvent("Characters:Client:Spawn")
AddEventHandler("Characters:Client:Spawn", function()
    while not GlobalState.LSUPickupLocation do
        Wait(100)
    end

    exports['st_utils']:Add("lsu-pickup-guy", `s_m_y_dockwork_01`, GlobalState.LSUPickupLocation.coords,
        GlobalState.LSUPickupLocation.heading, 50.0, {
            {
                icon = "box-taped",
                text = "Collect Order",
                event = "Tablet:Client:LSUnderground:Collect",
            },
        }, 'box-taped', 'WORLD_HUMAN_SMOKING', true)
end)

RegisterNUICallback("GetLSUDetails", function(data, cb)
    exports["strata"]:ServerCallback("Tablet:LSUnderground:GetDetails", {}, function(data)
        cb(data)
    end)
end)

RegisterNUICallback("LSUNDG:Market:Checkout", function(data, cb)
    exports["strata"]:ServerCallback("Tablet:LSUnderground:Market:Checkout", data, function(data)
        cb(data)

        if data?.success and data.coords then
            exports["strata"]:Add(
                "lsu-pickup-location",
                "LSUNDG Pickup Location",
                data.coords,
                478,
                17,
                0.7,
                2,
                false,
                false
            )

            ClearGpsPlayerWaypoint()
            SetNewWaypoint(data.coords.x, data.coords.y)
        end
    end)
end)

RegisterNUICallback("Boosting:EnterQueue", function(data, cb)
    exports["strata"]:ServerCallback("Tablet:LSUnderground:Boosting:EnterQueue", {}, cb)
end)

RegisterNUICallback("Boosting:ExitQueue", function(data, cb)
    exports["strata"]:ServerCallback("Tablet:LSUnderground:Boosting:ExitQueue", {}, cb)
end)

RegisterNUICallback("Boosting:AcceptContract", function(data, cb)
    exports["strata"]:ServerCallback("Tablet:LSUnderground:Boosting:AcceptContract", data, function(res)
        if res?.success then
            exports['st_tablet']:AddData("disabledBoostingContracts", data.id)

            SetTimeout(120000, function()
                exports['st_tablet']:RemoveData("disabledBoostingContracts", data.id)
            end)
        end

        cb(res)
    end)
end)

RegisterNUICallback("Boosting:TransferContract", function(data, cb)
    exports["strata"]:ServerCallback("Tablet:LSUnderground:Boosting:TransferContract", data, cb)
end)

RegisterNUICallback("Boosting:DeclineContract", function(data, cb)
    exports["strata"]:ServerCallback("Tablet:LSUnderground:Boosting:DeclineContract", data, cb)
end)

AddEventHandler("Tablet:Client:LSUnderground:Collect", function()
    exports["strata"]:ServerCallback("Tablet:LSUnderground:Market:Collect", {})
end)

RegisterNUICallback("Boosting:Admin:CreateContract", function(data, cb)
    if data?.vehicle then
        local h = GetHashKey(data.vehicle)
        if not IsModelValid(h) or not IsModelAVehicle(h) then
            cb({
                success = false,
                message = 'Invalid Vehicle (Doesn\'t Exist)'
            })
            return
        end
    end

    exports["strata"]:ServerCallback("Tablet:LSUnderground:Boosting:Admin:CreateContract", data, cb)
end)

RegisterNUICallback("Boosting:Admin:GetBans", function(data, cb)
    exports["strata"]:ServerCallback("Tablet:LSUnderground:Boosting:Admin:GetBans", data, cb)
end)

RegisterNUICallback("Boosting:Admin:Ban", function(data, cb)
    exports["strata"]:ServerCallback("Tablet:LSUnderground:Boosting:Admin:Ban", data, cb)
end)

RegisterNUICallback("Boosting:Admin:Unban", function(data, cb)
    exports["strata"]:ServerCallback("Tablet:LSUnderground:Boosting:Admin:Unban", data, cb)
end)
