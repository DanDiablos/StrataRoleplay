local PER_PAGE = 10

---@return table
local function getOxItemList()
    local ok, result = pcall(function()
        return exports.st_inventory:Items()
    end)

    if ok and type(result) == "table" then
        return result
    end

    ok, result = pcall(function()
        return exports.st_inventory:ItemList()
    end)

    if ok and type(result) == "table" then
        return result
    end

    return {}
end

local cachedItems = nil

---@return table
local function getProcessedItems()
    if cachedItems then return cachedItems end

    local itemList = getOxItemList()
    local items = {}

    for name, item in pairs(itemList) do
        table.insert(items, {
            name = name,
            label = item.label or name,
            weapon = item.weapon or false,
            ammo = item.ammo or false,
            type = item.type or false,
            stack = item.stack,
        })
    end

    table.sort(items, function(a, b)
        return tostring(a.label):lower() < tostring(b.label):lower()
    end)

    cachedItems = items
    return cachedItems
end

AddEventHandler("onResourceStart", function(resource)
    if resource ~= GetCurrentResourceName() then return end

    CreateThread(function()
        GlobalState.AdminItemDatabase = getProcessedItems()
    end)

    exports["strata"]:RegisterServerCallback("Admin:GetPlayerList", function(source, _, cb)
    CreateThread(function()
        local player = Strata.User.Account(source)
        if player and player.Permissions:IsStaff() then
            local data = {}
            local activePlayers = exports["strata"]:FetchAll()

            for _, v in pairs(activePlayers) do
                if v ~= nil and v:GetData("AccountID") then
                    table.insert(data, {
                        Source = v:GetData("Source"),
                        Name = v:GetData("Name"),
                        AccountID = v:GetData("AccountID"),
                        Character = v:GetData("Character"),
                    })
                end
            end
            cb(data)
        else
            cb(false)
        end
    end)
end)

exports["strata"]:RegisterServerCallback("Admin:GetDisconnectedPlayerList", function(source, _, cb)
    local player = Strata.User.Account(source)
    if player and player.Permissions:IsStaff() then
        cb(exports["strata"]:GetRecentDisconnects())
    else
        cb(false)
    end
end)

exports["strata"]:RegisterServerCallback("Admin:GetPlayer", function(source, data, cb)
    local player = Strata.User.Account(source)
    if not player or not player.Permissions:IsStaff() then
        return cb(false)
    end

    local target = Strata.User.Account(data)

    if target then
        local staffGroupName = false
        if target.Permissions:IsStaff() then
            local highestLevel = 0
            for _, v in ipairs(target:GetData("Groups")) do
                local group = exports["strata"]:ConfigGetGroupById(tostring(v))
                if group and (type(group.Permission) == "table") then
                    if group.Permission.Level > highestLevel then
                        highestLevel = group.Permission.Level
                        staffGroupName = group.Name
                    end
                end
            end
        end

        local pPed = GetPlayerPed(target:GetData("Source"))
        local coords = GetEntityCoords(pPed)
        local heading = GetEntityHeading(pPed)
        local inVehicle = nil
        local rawVehicle = GetVehiclePedIsIn(pPed, false)
        if rawVehicle > 0 then
            local ent = Entity(rawVehicle)
            local isDriver = GetPedInVehicleSeat(rawVehicle, -1) == pPed

            inVehicle = {
                Entity = rawVehicle,
                VIN = ent.state.VIN,
                Plate = GetVehicleNumberPlateText(rawVehicle),
                Make = ent.state.Make,
                Model = ent.state.Model,
                Driver = isDriver,
            }
        end

        local char = Strata.User.Find(data)

        local p = promise.new()
        local targetLicense = exports["strata"]:GetPlayerLicense(data)
        MySQL.Async.fetchAll("SELECT * FROM characters WHERE License = @license AND SID != @sid", {
            ["@license"] = targetLicense,
            ["@sid"] = char and char:GetData("SID") or nil,
        }, function(results)
            if results and #results > 0 then
                p:resolve(results)
            else
                p:resolve({})
            end
        end)

        local chars = Citizen.Await(p)

        for i, c in ipairs(chars) do
            if c.Jobs then
                local success, parsed = pcall(json.decode, c.Jobs)
                if success then
                    chars[i].Jobs = parsed
                else
                    chars[i].Jobs = {}
                end
            else
                chars[i].Jobs = {}
            end
        end

        cb({
            Source = target:GetData("Source"),
            Name = target:GetData("Name"),
            GameName = target:GetData("GameName"),
            AccountID = target:GetData("AccountID"),
            Identifier = target:GetData("Identifier"),
            Discord = target:GetData("Discord"),
            Mention = target:GetData("Mention"),
            Avatar = target:GetData("Avatar"),
            Level = target.Permissions:GetLevel(),
            Groups = target:GetData("Groups"),
            StaffGroup = staffGroupName,
            Character = char and {
                First = char:GetData("First"),
                Last = char:GetData("Last"),
                SID = char:GetData("SID"),
                DOB = char:GetData("DOB"),
                Phone = char:GetData("Phone"),
                Jobs = char:GetData("Jobs"),
                Coords = {
                    x = coords.x,
                    y = coords.y,
                    z = coords.z,
                    h = heading,
                },
            } or false,
            Characters = chars,
            Vehicle = inVehicle,
        })
    else
        local rDs = exports["strata"]:GetRecentDisconnects()
        for _, v in ipairs(rDs) do
            if v.Source == data then
                local tData = v

                if tData.IsStaff then
                    local highestLevel = 0
                    for _, g in ipairs(tData.Groups) do
                        local group = exports["strata"]:ConfigGetGroupById(tostring(g))
                        if group and (type(group.Permission) == "table") then
                            if group.Permission.Level > highestLevel then
                                highestLevel = group.Permission.Level
                                tData.StaffGroup = group.Name
                            end
                        end
                    end
                end

                tData.Disconnected = true
                tData.Reconnected = false

                for k, ap in pairs(exports["strata"]:FetchAll()) do
                    if ap:GetData("AccountID") == tData.AccountID then
                        tData.Reconnected = k
                    end
                end

                return cb(tData)
            end
        end

        cb(false)
    end
end)

exports["strata"]:RegisterServerCallback("Admin:GetAllPlayersByCharacter", function(source, data, cb)
    local player = Strata.User.Account(source)
    if not player or not player.Permissions:IsStaff() then
        return cb(false)
    end

    local matchQuery = "User IS NOT NULL"
    local params = {}

    if #data.term > 0 then
        matchQuery = matchQuery .. ' AND (SID = @term OR CONCAT(First, " ", Last) LIKE @term)'
        params["@term"] = "%" .. data.term .. "%"
    end

    local query = string.format([[
        SELECT * FROM characters
        WHERE %s
        ORDER BY SID DESC
        LIMIT @limit OFFSET @offset
    ]], matchQuery)

    params["@limit"] = PER_PAGE
    params["@offset"] = (data.page - 1) * PER_PAGE

    MySQL.Async.fetchAll(query, params, function(results)
        if results and #results > 0 then
            local totalQuery = string.format([[
                SELECT COUNT(*) as total FROM characters
                WHERE %s
            ]], matchQuery)

            MySQL.Async.fetchAll(totalQuery, params, function(totalResults)
                local totalPages = math.ceil((totalResults[1].total or 1) / PER_PAGE)
                local resultData = {}

                for _, v in ipairs(results) do
                    local isOnline = Strata.User.ByID(v.User)
                    if isOnline then
                        v.Online = isOnline:GetData("Source")
                    end
                    table.insert(resultData, v)
                end

                cb({
                    players = resultData,
                    pages = totalPages,
                })
            end)
        else
            cb(false)
        end
    end)
end)

exports["strata"]:RegisterServerCallback("Admin:GetItemDatabase", function(source, _, cb)
    local player = Strata.User.Account(source)
    if not player or not player.Permissions:IsStaff() then
        return cb(false)
    end

    cb(getProcessedItems())
end)

exports["strata"]:RegisterServerCallback("Admin:GiveItem", function(source, data, cb)
    local player = Strata.User.Account(source)
    if not player or not player.Permissions:IsAdmin() then
        return cb({ success = false, message = "Insufficient Permission" })
    end

    local itemName = data and data.itemName and tostring(data.itemName) or nil
    local count = tonumber(data and data.quantity) or 1
    local ammo = tonumber(data and data.ammo) or 0
    local targetSid = tonumber(data and data.targetSid)

    if not itemName or itemName == "" then
        return cb({ success = false, message = "Invalid Item" })
    end

    count = math.floor(count)
    ammo = math.floor(ammo)

    if count < 1 then
        return cb({ success = false, message = "Quantity Must Be 1 Or More" })
    end

    local itemData = exports.st_inventory:Items(itemName)
    if not itemData then
        return cb({ success = false, message = "Item Not Found" })
    end

    local targetChar = nil
    if targetSid then
        targetChar = Strata.User.BySID(targetSid)
    else
        targetChar = Strata.User.Find(source)
    end

    if not targetChar then
        return cb({ success = false, message = "Target Character Not Online" })
    end

    local metadata = nil
    if itemData.weapon then
        metadata = { ammo = math.max(0, ammo) }
    end

    local didAdd = exports.st_inventory:AddItem(targetChar:GetData("SID"), itemName, count, metadata, 1)
    if not didAdd then
        return cb({ success = false, message = "Unable To Add Item" })
    end

    Strata.Log.Warn(
        "Admin",
        string.format(
            "%s [%s] Gave Item %s x%s To %s %s (%s)",
            player:GetData("Name"),
            player:GetData("AccountID"),
            itemName,
            count,
            targetChar:GetData("First") or "Unknown",
            targetChar:GetData("Last") or "Character",
            targetChar:GetData("SID") or "Unknown"
        ),
        {
            console = true,
            file = false,
            database = true,
            discord = {
                embed = true,
                type = "error",
                webhook = GetConvar("discord_admin_webhook", ""),
            },
        }
    )

    cb({ success = true, message = string.format("Gave %s x%s", itemName, count) })
end)

exports["strata"]:RegisterServerCallback("Admin:GetJobDatabase", function(source, _, cb)
    local player = Strata.User.Account(source)
    if not player or not player.Permissions:IsAdmin() then
        return cb(false)
    end

    local allJobs = exports["st_jobs"]:GetAll() or {}
    local jobs = {}

    for jobId, job in pairs(allJobs) do
        if job and not job.Hidden then
            local grades = {}

            if job.Grades and #job.Grades > 0 then
                for _, grade in ipairs(job.Grades) do
                    if grade and grade.Id then
                        table.insert(grades, {
                            id = tostring(grade.Id),
                            name = tostring(grade.Name or grade.Id),
                            level = tonumber(grade.Level) or 0,
                            workplaceId = false,
                            workplaceName = false,
                        })
                    end
                end
            end

            if job.Workplaces and #job.Workplaces > 0 then
                for _, workplace in ipairs(job.Workplaces) do
                    if workplace and workplace.Grades then
                        for _, grade in ipairs(workplace.Grades) do
                            if grade and grade.Id then
                                table.insert(grades, {
                                    id = tostring(grade.Id),
                                    name = tostring(grade.Name or grade.Id),
                                    level = tonumber(grade.Level) or 0,
                                    workplaceId = tostring(workplace.Id),
                                    workplaceName = tostring(workplace.Name or workplace.Id),
                                })
                            end
                        end
                    end
                end
            end

            table.sort(grades, function(a, b)
                if a.level == b.level then
                    return tostring(a.name):lower() < tostring(b.name):lower()
                end
                return a.level < b.level
            end)

            if #grades > 0 then
                table.insert(jobs, {
                    id = tostring(jobId),
                    name = tostring(job.Name or jobId),
                    grades = grades,
                })
            end
        end
    end

    table.sort(jobs, function(a, b)
        return tostring(a.name):lower() < tostring(b.name):lower()
    end)

    cb(jobs)
end)

exports["strata"]:RegisterServerCallback("Admin:GiveJob", function(source, data, cb)
    local player = Strata.User.Account(source)
    if not player or not player.Permissions:IsAdmin() then
        return cb({ success = false, message = "Insufficient Permission" })
    end

    local targetSource = tonumber(data and data.targetSource)
    local jobId = data and data.jobId and tostring(data.jobId) or nil
    local gradeId = data and data.gradeId and tostring(data.gradeId) or nil
    local workplaceId = data and data.workplaceId and tostring(data.workplaceId) or false

    if workplaceId == "" then
        workplaceId = false
    end

    if not targetSource or not jobId or jobId == "" or not gradeId or gradeId == "" then
        return cb({ success = false, message = "Missing Required Job Data" })
    end

    local target = Strata.User.Account(targetSource)
    if not target then
        return cb({ success = false, message = "Target Player Not Online" })
    end

    if target.Permissions:IsStaff() and player.Permissions:GetLevel() <= target.Permissions:GetLevel() and source ~= targetSource then
        return cb({ success = false, message = "Insufficient Permission For Target" })
    end

    local targetChar = Strata.User.Find(targetSource)
    if not targetChar then
        return cb({ success = false, message = "Target Character Not Loaded" })
    end

    local jobData = exports["st_jobs"]:DoesExist(jobId, workplaceId, gradeId)
    if not jobData or not jobData.Grade then
        return cb({ success = false, message = "Invalid Job/Grade Selection" })
    end

    local didSet = exports["st_jobs"]:GiveJob(targetChar:GetData("SID"), jobId, workplaceId, gradeId)
    if not didSet then
        return cb({ success = false, message = "Unable To Set Job" })
    end

    local workplaceName = jobData.Workplace and jobData.Workplace.Name and (" @ " .. jobData.Workplace.Name) or ""
    exports["st_ui"]:Notification(
        "success",
        targetSource,
        string.format("Job Updated: %s%s - %s", jobData.Name, workplaceName, jobData.Grade.Name),
        7000,
        "briefcase"
    )

    Strata.Log.Warn(
        "Admin",
        string.format(
            "%s [%s] Set Job For %s [%s] => %s%s (%s)",
            player:GetData("Name"),
            player:GetData("AccountID"),
            target:GetData("Name"),
            target:GetData("AccountID"),
            jobData.Name,
            workplaceName,
            jobData.Grade.Name
        ),
        {
            console = true,
            file = false,
            database = true,
            discord = {
                embed = true,
                type = "error",
                webhook = GetConvar("discord_admin_webhook", ""),
            },
        }
    )

    cb({ success = true, message = string.format("Set Job: %s%s (%s)", jobData.Name, workplaceName, jobData.Grade.Name) })
end)

exports["strata"]:RegisterServerCallback("Admin:BanPlayer", function(source, data, cb)
    local player = Strata.User.Account(source)
    if player and data.targetSource and type(data.length) == "number" and type(data.reason) == "string" and data.length >= -1 and data.length <= 90 then
        if player.Permissions:IsAdmin() or (player.Permissions:IsStaff() and data.length > 0 and data.length <= 7) then
            cb(exports["strata"]:PunishmentBanSource(data.targetSource, data.length, data.reason, source))
        else
            cb(false)
        end
    else
        cb(false)
    end
end)

exports["strata"]:RegisterServerCallback("Admin:KickPlayer", function(source, data, cb)
    local player = Strata.User.Account(source)
    if player and data.targetSource and type(data.reason) == "string" and player.Permissions:IsStaff() then
        cb(exports["strata"]:PunishmentKick(data.targetSource, data.reason, source))
    else
        cb(false)
    end
end)

exports["strata"]:RegisterServerCallback("Admin:ActionPlayer", function(source, data, cb)
    local player = Strata.User.Account(source)
    if not player or not data.action or not data.targetSource or not player.Permissions:IsStaff() then
        return cb(false)
    end

    local target = Strata.User.Account(data.targetSource)
    if not target then
        return cb(false)
    end

    local havePerms = player.Permissions:GetLevel() > target.Permissions:GetLevel()
    local notMe = player:GetData("Source") ~= target:GetData("Source")
    local wasSuccessful = false

    local targetChar = Strata.User.Find(data.targetSource)
    if not targetChar then
        return cb(false)
    end

    local playerPed = GetPlayerPed(player:GetData("Source"))
    local targetPed = GetPlayerPed(target:GetData("Source"))

    if data.action == "bring" and havePerms and notMe then
        local playerCoords = GetEntityCoords(playerPed)
        exports["st_utils"]:TempPosIgnore(target:GetData("Source"))
        SetEntityCoords(targetPed, playerCoords.x, playerCoords.y, playerCoords.z + 1.0)
        cb({ success = true, message = "Brought Successfully" })
        wasSuccessful = true
    elseif data.action == "goto" then
        local targetCoords = GetEntityCoords(targetPed)
        exports["st_utils"]:TeleportIgnore(player:GetData("Source"))
        SetEntityCoords(playerPed, targetCoords.x, targetCoords.y, targetCoords.z + 1.0)
        cb({ success = true, message = "Teleported To Successfully" })
        wasSuccessful = true
    elseif data.action == "heal" then
        if notMe or player.Permissions:IsAdmin() then
            exports["strata"]:ClientCallback(targetChar:GetData("Source"), "Damage:Heal", true)
            cb({ success = true, message = "Healed Successfully" })
            wasSuccessful = true
        else
            cb({ success = false, message = "Can't Heal Yourself" })
        end
    elseif data.action == "attach" and (havePerms or player.Permissions:GetLevel() == 100) and notMe then
        TriggerClientEvent("Admin:Client:Attach", source, target:GetData("Source"),
            GetEntityCoords(targetPed), {
                First = targetChar:GetData("First"),
                Last = targetChar:GetData("Last"),
                SID = targetChar:GetData("SID"),
                Account = target:GetData("AccountID"),
            })
        cb({ success = true, message = "Attached Successfully" })
        wasSuccessful = true
    elseif data.action == "marker" and (havePerms or player.Permissions:GetLevel() == 100) then
        local targetCoords = GetEntityCoords(targetPed)
        TriggerClientEvent("Admin:Client:Marker", source, targetCoords.x, targetCoords.y)
    elseif data.action == "givekeys" and ((havePerms or not target.Permissions:IsStaff() or player.Permissions:GetLevel() == 100) or notMe == false) then
        local currentVehicle = GetVehiclePedIsIn(targetPed, false)
        if currentVehicle and currentVehicle > 0 and DoesEntityExist(currentVehicle) then
            local vehState = Entity(currentVehicle).state
            if vehState and vehState.VIN then
                exports["st_veh"]:KeysAdd(target:GetData("Source"), vehState.VIN)
                cb({ success = true, message = "Gave Vehicle Keys Successfully" })
                wasSuccessful = true
            else
                cb({ success = false, message = "Vehicle Has No VIN" })
            end
        else
            cb({ success = false, message = "Target Is Not In A Vehicle" })
        end
    elseif data.action == "clothingmenu" and (havePerms or player.Permissions:GetLevel() == 100 or notMe == false) then
        if notMe == false then
            TriggerClientEvent("Admin:Client:Menu:Close", target:GetData("Source"))
            Wait(150)
        end
        TriggerClientEvent("Peds:Customization:Client:AdminAbuse", target:GetData("Source"), 0)
        cb({ success = true, message = "Opened Clothing Menu" })
        wasSuccessful = true
    elseif data.action == "giveownedvehicle" and (havePerms or player.Permissions:GetLevel() == 100) then
        local targetSource = target:GetData("Source")
        local targetSID = targetChar:GetData("SID")
        local vehicleModel = data and data.vehicleModel and string.lower(tostring(data.vehicleModel)) or nil

        if not vehicleModel or #vehicleModel < 2 then
            return cb({ success = false, message = "Invalid Vehicle Model" })
        end

        local pdmVehicleData = exports["st_showroom"]:StockFetchDealerVehicle("pdm", vehicleModel)
        if not pdmVehicleData or not pdmVehicleData.data then
            return cb({ success = false, message = "Vehicle Not Found In PDM Stock" })
        end

        local vehicleHash = GetHashKey(vehicleModel)
        if type(vehicleHash) ~= "number" or vehicleHash == 0 then
            return cb({ success = false, message = "Invalid Vehicle Spawn Code" })
        end

        local modelType = pdmVehicleData.modelType or "automobile"
        local vehicleType = 0
        if modelType == "boat" then
            vehicleType = 1
        elseif modelType == "heli" or modelType == "plane" then
            vehicleType = 2
        end

        exports["st_veh"]:OwnedAddToCharacter(
            targetSID,
            vehicleHash,
            vehicleType,
            modelType,
            {
                make = pdmVehicleData.data.make,
                model = pdmVehicleData.data.model,
                class = pdmVehicleData.data.class,
                value = pdmVehicleData.data.price,
            },
            function(success, vehicleData)
                if success and vehicleData then
                    exports["st_ui"]:Notification("success", targetSource,
                        string.format("You Received a %s %s (%s) in White Garage Parking",
                            pdmVehicleData.data.make or "Unknown",
                            pdmVehicleData.data.model or vehicleModel,
                            vehicleData.RegisteredPlate or "No Plate"
                        ),
                        7000,
                        "car")

                    cb({
                        success = true,
                        message = string.format("Given Owned Vehicle: %s (%s)",
                            vehicleModel,
                            vehicleData.VIN or "No VIN"
                        ),
                    })

                    wasSuccessful = true
                else
                    cb({ success = false, message = "Failed To Add Owned Vehicle" })
                end
            end,
            false,
            {
                Type = 1,
                Id = "alta_parking",
            }
        )

        return
    elseif data.action == "repairvehicle" and (havePerms or player.Permissions:GetLevel() == 100) then
        local currentVehicle = GetVehiclePedIsIn(targetPed, false)
        if currentVehicle and currentVehicle > 0 and DoesEntityExist(currentVehicle) then
            local netOwner = NetworkGetEntityOwner(currentVehicle)
            if netOwner and netOwner > 0 then
                TriggerClientEvent("Vehicles:Client:Repair:Normal", netOwner,
                    NetworkGetNetworkIdFromEntity(currentVehicle))
                cb({ success = true, message = "Vehicle Repaired Successfully" })
                wasSuccessful = true
            else
                cb({ success = false, message = "Vehicle Network Owner Not Available" })
            end
        else
            cb({ success = false, message = "Target Is Not In A Vehicle" })
        end
    else
        cb({ success = false, message = "An error has occured due to similar permissions." })
    end

    if wasSuccessful then
        Strata.Log.Warn(
            "Admin",
            string.format(
                "%s [%s] Used Staff Action %s On %s [%s] - Character %s %s (%s)",
                player:GetData("Name"),
                player:GetData("AccountID"),
                string.upper(data.action),
                target:GetData("Name"),
                target:GetData("AccountID"),
                targetChar:GetData("First"),
                targetChar:GetData("Last"),
                targetChar:GetData("SID")
            ),
            {
                console = true,
                file = false,
                database = true,
                discord = {
                    embed = true,
                    type = "error",
                    webhook = GetConvar("discord_admin_webhook", ""),
                },
            }
        )
    end
end)

exports["strata"]:RegisterServerCallback("Admin:GetVehicleList", function(source, _, cb)
    local player = Strata.User.Account(source)
    if not player or not player.Permissions:IsStaff() then
        return cb(false)
    end

    local tData = {}
    local allVehicles = exports["st_veh"]:OwnedGetAllActive()
    for _, v in pairs(allVehicles) do
        local entityId = v:GetData("EntityId")
        local ent = Entity(entityId)
        if ent then
            table.insert(tData, {
                Entity = entityId,
                VIN = ent.state.VIN,
                Plate = GetVehicleNumberPlateText(entityId),
                Make = ent.state.Make,
                Model = ent.state.Model,
                OwnerId = ent.state.Owner?.Id,
            })
        end
    end
    cb(tData)
end)

exports["strata"]:RegisterServerCallback("Admin:GetVehicle", function(source, data, cb)
    local player = Strata.User.Account(source)
    if not player or not player.Permissions:IsStaff() or not data or not DoesEntityExist(data) then
        return cb(false)
    end

    local ent = Entity(data)
    local vehicleCoords = GetEntityCoords(data)
    local vehicleHeading = GetEntityHeading(data)

    cb({
        Make = ent.state.Make,
        Model = ent.state.Model,
        VIN = ent.state.VIN,
        Owned = ent.state.Owned,
        Owner = ent.state.Owner,
        Plate = ent.state.Plate,
        Value = ent.state.Value,
        Entity = data,
        EntityModel = GetEntityModel(data),
        Coords = {
            x = vehicleCoords.x,
            y = vehicleCoords.y,
            z = vehicleCoords.z,
        },
        Heading = vehicleHeading,
        Fuel = ent.state.Fuel,
        Damage = ent.state.Damage,
        DamagedParts = ent.state.DamagedParts,
    })
end)

exports["strata"]:RegisterServerCallback("Admin:VehicleAction", function(source, data, cb)
    local player = Strata.User.Account(source)
    if not player or not data.action or not player.Permissions:IsAdmin() or not data.target or not DoesEntityExist(data.target) then
        return cb(false)
    end

    local veh = Entity(data.target)
    local netOwner = NetworkGetEntityOwner(data.target)

    if data.action == "fuel" then
        veh.state.Fuel = 100
    elseif data.action == "delete" then
        exports["st_veh"]:Delete(data.target, function() end)
    elseif data.action == "locks" then
        veh.state.Locked = not veh.state.Locked
        SetVehicleDoorsLocked(data.target, veh.state.Locked and 2 or 1)
        cb({
            success = true,
            message = veh.state.Locked and "Vehicle Locked" or "Vehicle Unlocked",
        })
        return
    elseif data.action == "sitinside" then
        local pPed = GetPlayerPed(source)
        local currentVehicle = GetVehiclePedIsIn(pPed, false)
        if currentVehicle == data.target then
            return cb({ success = false, message = "Already In Vehicle!" })
        end

        for i = -1, (data.numSeats - 2) do
            if GetPedInVehicleSeat(data.target, i) <= 0 then
                local vehCoords = GetEntityCoords(data.target)
                SetEntityCoords(pPed, vehCoords.x, vehCoords.y, vehCoords.z - 25.0, true, false, false, false)
                Wait(300)
                SetPedIntoVehicle(pPed, data.target, i)
                break
            end
        end
    else
        if netOwner > 0 then
            if data.action == "explode" then
                TriggerClientEvent("NetSync:Client:Execute", netOwner, "NetworkExplodeVehicle",
                    NetworkGetNetworkIdFromEntity(data.target), 1, 0)
            elseif data.action == "repair" then
                TriggerClientEvent("Vehicles:Client:Repair:Normal", netOwner,
                    NetworkGetNetworkIdFromEntity(data.target))
            elseif data.action == "repair_full" then
                TriggerClientEvent("Vehicles:Client:Repair:Full", netOwner,
                    NetworkGetNetworkIdFromEntity(data.target))
            elseif data.action == "repair_engine" then
                TriggerClientEvent("Vehicles:Client:Repair:Engine", netOwner,
                    NetworkGetNetworkIdFromEntity(data.target))
            elseif data.action == "stall" then
                TriggerClientEvent("Admin:Client:Stall", netOwner, NetworkGetNetworkIdFromEntity(data.target))
            else
                return cb({ success = false, message = "Unknown Action" })
            end
        else
            return cb({ success = false, message = "Cannot Execute RPC Action on This Vehicle At This Time!" })
        end
    end

    Strata.Log.Warn(
        "Admin",
        string.format(
            "%s [%s] Used Vehicle Action %s on %s",
            player:GetData("Name"),
            player:GetData("AccountID"),
            string.upper(data.action),
            veh.state.VIN or "Unknown"
        ),
        {
            console = true,
            file = false,
            database = true,
            discord = {
                embed = true,
                type = "error",
                webhook = GetConvar("discord_admin_webhook", ""),
            },
        }
    )
    cb({ success = true, message = "Success" })
end)

exports["strata"]:RegisterServerCallback("Admin:CurrentVehicleAction", function(source, data, cb)
    local player = Strata.User.Account(source)
    if not player or not data.action or not player.Permissions:IsAdmin() or player.Permissions:GetLevel() < 90 then
        return cb(false)
    end

    Strata.Log.Warn(
        "Admin",
        string.format(
            "%s [%s] Used Vehicle Action %s",
            player:GetData("Name"),
            player:GetData("AccountID"),
            string.upper(data.action)
        ),
        {
            console = (player.Permissions:GetLevel() < 100),
            file = false,
            database = true,
            discord = (player.Permissions:GetLevel() < 100) and {
                embed = true,
                type = "error",
                webhook = GetConvar("discord_admin_webhook", ""),
            } or false,
        }
    )
    cb(true)
end)

exports["strata"]:RegisterServerCallback("Admin:NoClip", function(source, data, cb)
    local player = Strata.User.Account(source)
    if not player or not player.Permissions:IsStaff() then
        return cb(false)
    end

    Strata.Log.Warn(
        "Admin",
        string.format(
            "%s [%s] Used NoClip (State: %s)",
            player:GetData("Name"),
            player:GetData("AccountID"),
            data?.active and "On" or "Off"
        ),
        {
            console = true,
            file = false,
            database = true,
            discord = {
                embed = true,
                type = "error",
                webhook = GetConvar("discord_admin_webhook", ""),
            },
        }
    )
    cb(true)
end)

exports["strata"]:RegisterServerCallback("Admin:UpdatePhonePerms", function(source, data, cb)
    local player = Strata.User.Account(source)
    if not player.Permissions:IsAdmin() then
        return cb(false)
    end

    local char = Strata.User.Find(data.target)
    if char ~= nil then
        local cPerms = char:GetData("PhonePermissions")
        cPerms[data.app][data.perm] = data.state
        char:SetData("PhonePermissions", cPerms)
        cb(true)
    else
        cb(false)
    end
end)

exports["strata"]:RegisterServerCallback("Admin:ToggleInvisible", function(source, _, cb)
    local player = Strata.User.Account(source)
    if not player or not player.Permissions:IsAdmin() then
        return cb(false)
    end

    Strata.Log.Warn(
        "Admin",
        string.format(
            "%s [%s] Used Invisibility",
            player:GetData("Name"),
            player:GetData("AccountID")
        ),
        {
            console = true,
            file = false,
            database = true,
            discord = {
                embed = true,
                type = "error",
                webhook = GetConvar("discord_admin_webhook", ""),
            },
        }
    )

    TriggerClientEvent("Admin:Client:Invisible", source)
    cb(true)
end)

end)
