AddEventHandler("Casino:Server:Startup", function()
    exports["st_chat"]:RegisterStaffCommand("setcasinovehicle", function(source, args, rawCommand)
        exports["strata"]:ClientCallback(source, "Vehicles:Admin:GetVehicleInsideData", false, function(vehData)
            if vehData and vehData.model then
                local newData = {
                    vehicle = vehData.model,
                    properties = vehData.properties,
                }

                if exports['st_gamble']:ConfigSet("vehicle", newData) then
                    GlobalState["Casino:Vehicle"] = newData
                end
            end
        end)
    end, {
        help = "Set the Casino Vehicle to a Copy of the Vehicle You Are In",
        params = {},
    }, 0)

    exports["st_chat"]:RegisterStaffCommand("clearcasinovehicle", function(source, args, rawCommand)
        if exports['st_gamble']:ConfigSet("vehicle", false) then
            GlobalState["Casino:Vehicle"] = false
        end
    end, {
        help = "Clear the Casino Vehicle",
        params = {},
    }, 0)

    while not _casinoConfigLoaded do
        Wait(250)
    end

    GlobalState["Casino:Vehicle"] = exports['st_gamble']:ConfigGet("vehicle")

    exports["st_chat"]:RegisterStaffCommand("refreshcasinoint", function(source, args, rawCommand)
        TriggerClientEvent("Casino:Client:RefreshInt", source)
    end, {
        help = "Refresh the Casino Interior",
        params = {},
    }, 0)
end)
