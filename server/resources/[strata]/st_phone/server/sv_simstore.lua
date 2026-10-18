AddEventHandler("Phone:Server:RegisterCallbacks", function()

    --- Get player's current phone info for the store UI
    exports["strata"]:RegisterServerCallback("Phone:SimStore:GetInfo", function(source, data, cb)
        local char = Strata.User.Find(source)
        if not char then
            cb(false)
            return
        end

        local phoneNumber = char:GetData("Phone")
        local hasActiveSim = exports['st_phone']:HasActiveSim(source)

        cb({
            PhoneNumber = phoneNumber,
            HasActiveSim = hasActiveSim,
            ReplaceCost = Config.Sim.ReplaceCost,
            BurnerCost = Config.Sim.BurnerCost,
        })
    end)

    --- Replace SIM: deactivate all existing SIMs for the player's number, give a new one
    exports["strata"]:RegisterServerCallback("Phone:SimStore:ReplaceSim", function(source, data, cb)
        local char = Strata.User.Find(source)
        if not char then
            cb({ success = false, message = "Character not found" })
            return
        end

        local sid = char:GetData("SID")
        local phoneNumber = char:GetData("Phone")
        local cost = Config.Sim.ReplaceCost

        if not phoneNumber then
            cb({ success = false, message = "No phone number on record" })
            return
        end

        if not exports['st_finance']:WalletHas(source, cost) then
            cb({ success = false, message = "Not enough cash" })
            return
        end

        -- Deactivate all SIMs for this number (including any stolen ones)
        exports['st_phone']:DeactivateSimsForNumber(phoneNumber)

        -- Eject any SIM currently in the phone container
        local currentSim = exports['st_phone']:GetInsertedSim(source)
        if currentSim then
            local container = exports.st_inventory:GetContainerFromSlot(source, 8)
            if container then
                exports.st_inventory:RemoveItem(container, "simcard", 1)
            end
        end

        -- Remove any loose simcard items in inventory
        exports['st_phone']:RemoveSimItems(source, sid, nil)

        -- Create a fresh SIM with the same number
        local simId = exports['st_phone']:CreateSim(source, sid, phoneNumber)
        if not simId then
            cb({ success = false, message = "Failed to create SIM" })
            return
        end

        exports['st_finance']:WalletModify(source, -cost)
        TriggerClientEvent("Phone:Client:SimActivated", source)

        Strata.Log.Info("SIM", string.format("SID %d replaced SIM for number %s", sid, phoneNumber))
        cb({ success = true, message = "New SIM card received — open your phone in inventory to insert it" })
    end)

    --- Buy Burner: generate a new number, create a new SIM, give it to the player
    exports["strata"]:RegisterServerCallback("Phone:SimStore:BuyBurner", function(source, data, cb)
        local char = Strata.User.Find(source)
        if not char then
            cb({ success = false, message = "Character not found" })
            return
        end

        local sid = char:GetData("SID")
        local cost = Config.Sim.BurnerCost

        if not exports['st_finance']:WalletHas(source, cost) then
            cb({ success = false, message = "Not enough cash" })
            return
        end

        local newNumber = exports['st_phone']:GeneratePhoneNumber()
        if not newNumber then
            cb({ success = false, message = "Failed to generate number" })
            return
        end

        -- Create the burner SIM and give it to the player's inventory
        local simId = exports['st_phone']:CreateSim(source, sid, newNumber)
        if not simId then
            cb({ success = false, message = "Failed to create SIM" })
            return
        end

        exports['st_finance']:WalletModify(source, -cost)

        Strata.Log.Info("SIM", string.format("SID %d bought burner SIM, new number %s", sid, newNumber))
        cb({ success = true, message = "Burner SIM received — remove your current SIM and insert the new one via your phone in inventory", phoneNumber = newNumber })
    end)
end)
