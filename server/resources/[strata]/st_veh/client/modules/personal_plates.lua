AddEventHandler("Vehicles:Client:StartUp", function()
    exports["strata"]:RegisterClientCallback("Vehicles:GetPersonalPlate", function(data, cb)
        local coords = GetEntityCoords(PlayerPedId())
        local maxDistance = 2.0
        local includePlayerVehicle = false
        local target = lib.getClosestVehicle(coords, maxDistance, includePlayerVehicle)

        if target and DoesEntityExist(target) and IsEntityAVehicle(target) then
            if exports['st_veh']:HasAccess(target) and (exports['st_veh']:UtilsIsCloseToRearOfVehicle(target) or exports['st_veh']:UtilsIsCloseToFrontOfVehicle(target)) then
                local settingPlate = GetNewPersonalPlate()

                if settingPlate then
                    cb(VehToNet(target.entity), settingPlate)
                else
                    cb(false)
                end
            else
                cb(false)
            end
        else
            cb(false)
        end
    end)

    exports['st_utils']:Add("donor_plates", `u_f_m_debbie_01`, vector3(-504.405, -182.683, 36.691), 290.319,
        25.0, {
            {
                icon = "rectangle-wide",
                text = "Donator License Plate Claim",
                event = "Vehicles:Client:DonatorLicensePlateClaim",
            },
        }, "comment-dollar")
end)

local platePromise
function GetNewPersonalPlate()
    platePromise = promise.new()
    exports['st_ui']:InputShow("New Personal Plate", "Personal Plate", {
        {
            id = "plate",
            type = "text",
            options = {
                inputProps = {
                    pattern = "[A-HJ-NPR-Z0-9 ]+",
                    maxlength = 8,
                },
                helperText =
                "Plates cannot include the letters O, Q, I and must include at least 3 characters. SPACES FOR PADDING ARE ADDED AUTOMATICALLY!"
            },
        },
    }, "Vehicles:Client:RecievePersonalPlateInput", {})

    return Citizen.Await(platePromise)
end

AddEventHandler("Vehicles:Client:RecievePersonalPlateInput", function(values)
    if platePromise then
        platePromise:resolve(values?.plate)
        platePromise = nil
    end
end)

AddEventHandler("Input:Closed", function()
    if platePromise then
        platePromise:resolve(false)
        platePromise = nil
    end
end)

AddEventHandler("Vehicles:Client:DonatorLicensePlateClaim", function()
    exports["strata"]:ServerCallback("Vehicles:CheckDonatorPersonalPlates", {}, function(data)
        if data and data > 0 then
            local menu = {
                main = {
                    label = "Claim Donator License Plates",
                    items = {
                        {
                            label = "Information",
                            description =
                            "Please make sure that there is enough space in your inventory for your new license plates.<br>"
                        },
                    }
                }
            }

            if data == 1 then
                table.insert(menu.main.items, {
                    label = "Claim 1 Plate",
                    event = "Vehicles:Client:DonatorLicensePlateClaimConfirm",
                    data = 1,
                })
            else
                table.insert(menu.main.items, {
                    label = "Claim 1 Plate",
                    event = "Vehicles:Client:DonatorLicensePlateClaimConfirm",
                    data = 1,
                })

                table.insert(menu.main.items, {
                    label = string.format("Claim %s Plates", data),
                    event = "Vehicles:Client:DonatorLicensePlateClaimConfirm",
                    data = data,
                })
            end


            exports['st_ui']:ListMenuShow(menu)
        else
            exports["st_ui"]:Notification("error", "No Plates to Claim")
        end
    end)
end)

AddEventHandler("Vehicles:Client:DonatorLicensePlateClaimConfirm", function(data)
    exports["strata"]:ServerCallback("Vehicles:ClaimDonatorPersonalPlates", data, function(success)
        if not success then
            exports["st_ui"]:Notification("error", "Unable to Claim Plates")
        end
    end)
end)
