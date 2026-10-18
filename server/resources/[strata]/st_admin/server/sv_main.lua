---@param source number
---@param args table
---@param commandName string
---@return number?
local function parsePercentArg(source, args, commandName)
    local value = tonumber(args[1])
    if not value then
        exports["st_ui"]:Notification(source, "error", ("Usage: /%s 0-100"):format(commandName))
        return nil
    end

    value = math.floor(value + 0.0)
    if value < 0 or value > 100 then
        exports["st_ui"]:Notification(source, "error", "Value must be between 0 and 100")
        return nil
    end

    return value
end

local function registerChatCommands()
    exports["st_chat"]:RegisterAdminCommand("weptest", function(source, args)
        if GlobalState.IsProduction then
            exports["st_ui"]:Notification(source, "error", "Cannot Use This On Production Servers")
            return
        end
        TriggerClientEvent("Admin:Client:DamageTest", source, args[1] == "1")
    end, {
        help = "[Admin] Start Weapon Damage Testing",
        params = {
            { name = "Mode", help = "0 = Body Shots, 1 = Headshots" },
        },
    }, 1)

    exports["st_chat"]:RegisterAdminCommand("statebaglog", function(source)
        TriggerClientEvent("Admin:Client:StateBagLog", source)
    end, {
        help = "[Admin] Toggle Console State Bag Logging",
    }, 0)

    exports["st_chat"]:RegisterAdminCommand("voiptargetlog", function(source)
        TriggerClientEvent("VOIP:Client:ToggleDebugMode", source)
    end, {
        help = "[Admin] Toggle Console VOIP Target Logging",
    }, 0)

    exports["st_chat"]:RegisterAdminCommand("admin", function(source)
        TriggerClientEvent("Admin:Client:Menu:Open", source)
    end, {
        help = "[Admin] Open Admin Menu",
    }, 0)

    exports["st_chat"]:RegisterStaffCommand("staff", function(source)
        TriggerClientEvent("Admin:Client:Menu:Open", source)
    end, {
        help = "[Staff] Open Staff Menu",
    }, 0)

    exports["st_chat"]:RegisterStaffCommand("noclip", function(source)
        TriggerClientEvent("Admin:Client:NoClip", source, false)
    end, {
        help = "[Admin] Toggle NoClip",
    }, 0)

    exports["st_chat"]:RegisterAdminCommand("noclip:dev", function(source)
        TriggerClientEvent("Admin:Client:NoClip", source, true)
    end, {
        help = "[Developer] Toggle Developer Mode NoClip",
    }, 0)

    exports["st_chat"]:RegisterAdminCommand("noclip:info", function(source)
        TriggerClientEvent("Admin:Client:NoClipInfo", source)
    end, {
        help = "[Developer] Get NoClip Camera Info",
    }, 0)

    exports["st_chat"]:RegisterAdminCommand("marker", function(source, args)
        TriggerClientEvent("Admin:Client:Marker", source, tonumber(args[1]) + 0.0, tonumber(args[2]) + 0.0)
    end, {
        help = "Place Marker at Coordinates",
        params = {
            { name = "X", help = "X Coordinate" },
            { name = "Y", help = "Y Coordinate" },
        },
    }, 2)

    exports["st_chat"]:RegisterStaffCommand("cpcoords", function(source, args)
        TriggerClientEvent("Admin:Client:CopyCoords", source, args[1])
        exports["st_ui"]:Notification(source, "success", "Copied Coordinates")
    end, {
        help = "[Dev] Copy Coords",
        params = {
            { name = "Type", help = "Type of Coordinate (vec3, vec4, vec2, table, z, h, rot)" },
        },
    }, -1)

    exports["st_chat"]:RegisterAdminCommand("cpproperty", function(source)
        local nearProperty = exports["st_housing"]:IsNearProperty(source)
        if nearProperty.propertyId then
            TriggerClientEvent("Admin:Client:CopyClipboard", source, nearProperty.propertyId)
            exports["st_ui"]:Notification(source, "success", "Copied Property ID")
        end
    end, {
        help = "[Dev] Copy Property ID of Closest Property",
    }, 0)

    exports["st_chat"]:RegisterAdminCommand("property", function(source)
        local nearProperty = exports["st_housing"]:IsNearProperty(source)
        if nearProperty.propertyId then
            local prop = exports["st_housing"]:Get(nearProperty.propertyId)
            if prop then
                exports["st_chat"]:SendSystemSingle(
                    source,
                    string.format(
                        "Property ID: %s<br>Property: %s<br>Interior: %s<br>Owner: %s<br>Price: $%s<br>Type: %s",
                        prop.id,
                        prop.label,
                        prop.upgrades?.interior,
                        prop.owner and prop.owner.SID or "N/A",
                        prop.price,
                        prop.type
                    )
                )
            end
        end
    end, {
        help = "[Dev] Get Closest Property Data",
    }, 0)

    exports["st_chat"]:RegisterCommand("record", function(source)
        TriggerClientEvent("Admin:Client:Recording", source, "record")
    end, {
        help = "Record With R* Editor",
    }, 0)

    exports["st_chat"]:RegisterCommand("recordstop", function(source)
        TriggerClientEvent("Admin:Client:Recording", source, "stop")
    end, {
        help = "Record With R* Editor",
    }, 0)

    exports["st_chat"]:RegisterAdminCommand("setped", function(source, args)
        TriggerClientEvent("Admin:Client:ChangePed", source, args[1])
    end, {
        help = "[Admin] Set Ped",
        params = {
            { name = "Ped", help = "Ped Model" },
        },
    }, 1)

    exports["st_chat"]:RegisterAdminCommand("setarmor", function(source, args)
        local value = parsePercentArg(source, args, "setarmor")
        if value == nil then return end

        TriggerClientEvent("Admin:Client:SetArmor", source, value)
        exports["st_ui"]:Notification(source, "success", ("Armor set to %s%%"):format(value))
    end, {
        help = "[Admin] Set Your Armor (0-100)",
        params = {
            { name = "Value", help = "Armor Value (0-100)" },
        },
    }, 1)

    exports["st_chat"]:RegisterAdminCommand("sethealth", function(source, args)
        local value = parsePercentArg(source, args, "sethealth")
        if value == nil then return end

        TriggerClientEvent("Admin:Client:SetHealth", source, value)
        exports["st_ui"]:Notification(source, "success", ("Health set to %s%%"):format(value))
    end, {
        help = "[Admin] Set Your Health (0-100)",
        params = {
            { name = "Value", help = "Health Value (0-100)" },
        },
    }, 1)

    exports["st_chat"]:RegisterAdminCommand("sethunger", function(source, args)
        local value = parsePercentArg(source, args, "sethunger")
        if value == nil then return end

        exports["st_utils"]:Set(source, "PLAYER_HUNGER", value)
        exports["st_ui"]:Notification(source, "success", ("Hunger set to %s%%"):format(value))
    end, {
        help = "[Admin] Set Your Hunger (0-100)",
        params = {
            { name = "Value", help = "Hunger Value (0-100)" },
        },
    }, 1)

    exports["st_chat"]:RegisterAdminCommand("setthirst", function(source, args)
        local value = parsePercentArg(source, args, "setthirst")
        if value == nil then return end

        exports["st_utils"]:Set(source, "PLAYER_THIRST", value)
        exports["st_ui"]:Notification(source, "success", ("Thirst set to %s%%"):format(value))
    end, {
        help = "[Admin] Set Your Thirst (0-100)",
        params = {
            { name = "Value", help = "Thirst Value (0-100)" },
        },
    }, 1)

    exports["st_chat"]:RegisterAdminCommand("setstress", function(source, args)
        local value = parsePercentArg(source, args, "setstress")
        if value == nil then return end

        exports["st_utils"]:Set(source, "PLAYER_STRESS", value)
        exports["st_ui"]:Notification(source, "success", ("Stress set to %s%%"):format(value))
    end, {
        help = "[Admin] Set Your Stress (0-100)",
        params = {
            { name = "Value", help = "Stress Value (0-100)" },
        },
    }, 1)

    exports["st_chat"]:RegisterAdminCommand("staffcam", function(source)
        TriggerClientEvent("Admin:Client:NoClip", source, true)
    end, {
        help = "[Staff] Camera Mode",
    }, 0)

    exports["st_chat"]:RegisterAdminCommand("zsetped", function(source, args)
        TriggerClientEvent("Admin:Client:ChangePed", tonumber(args[1]), args[2])
    end, {
        help = "[Admin] Set Ped",
        params = {
            { name = "Source (Lazy)", help = "Source" },
            { name = "Ped", help = "Ped Model" },
        },
    }, 2)

    exports["st_chat"]:RegisterAdminCommand("nuke", function()
        TriggerClientEvent("Admin:Client:NukeCountdown", -1)
        Wait(23000)
        TriggerClientEvent("Admin:Client:Nuke", -1)
    end, {
        help = "DO NOT USE",
    }, 0)
end

AddEventHandler("onResourceStart", function(resource)
    if resource ~= GetCurrentResourceName() then return end

    registerChatCommands()

    Wait(1000)

    exports["strata"]:MiddlewareAdd("Characters:Spawning", function(source)
        local player = Strata.User.Account(source)

        if player and player.Permissions:IsStaff() then
            local highestLevel, highestGroup, highestGroupName = 0, nil, nil
            for _, v in ipairs(player:GetData("Groups")) do
                local group = exports["strata"]:ConfigGetGroupById(tostring(v))
                if group and (type(group.Permission) == "table") then
                    if group.Permission.Level > highestLevel then
                        highestLevel = group.Permission.Level
                        highestGroup = v
                        highestGroupName = group.Name
                    end
                end
            end

            TriggerClientEvent("Admin:Client:Menu:RecievePermissionData", source, {
                Source = source,
                Name = player:GetData("Name"),
                AccountID = player:GetData("AccountID"),
                Identifier = player:GetData("Identifier"),
                Groups = player:GetData("Groups"),
                Discord = player:GetData("Discord"),
                Mention = player:GetData("Mention"),
                Avatar = player:GetData("Avatar"),
            }, highestGroup, highestGroupName, highestLevel)
        end
    end, 5)
end)
