AddEventHandler('Finance:Server:Startup', function()
    exports["st_chat"]:RegisterCommand('fine', function(src, args, raw)
        local player = Strata.User.BySID(tonumber(args[1]))
        if player ~= nil then
            local targetSource, fineAmount = table.unpack(args)
            local fine = tonumber(fineAmount)
            if fine and fine > 0 and fine <= 100000 then
                local success = exports['st_finance']:BillingFine(src, player:GetData("Source"), fine)
                if success then
                    exports["st_chat"]:SendSystemSingle(src,
                        string.format("You Successfully Fined State ID %s For $%s. You earned $%s.", args[1],
                            success.amount, success.cut))
                else
                    exports["st_chat"]:SendSystemSingle(src, "Fine Failed")
                end
            else
                exports["st_chat"]:SendSystemSingle(src, "Fine Amount Too High!")
            end
        else
            exports["st_chat"]:SendSystemSingle(src, "Invalid Target")
        end
    end, {
        help = '[Government] Fine Someone',
        params = {
            { name = 'State ID', help = 'The State ID of the person you want to fine.' },
            { name = 'Amount',   help = 'The amount of money you are fining them.' },
        },
    }, 2, {
        { Id = 'police' },
    })

    exports["st_chat"]:RegisterAdminCommand('testbilling', function(source, args, rawCommand)
        exports['st_ui']:Notification(source, "info", 'Bill Created')
        exports['st_finance']:BillingCreate(source, 'Some Random Business', 1500,
            'This is a description of a test bill.',
            function(wasPayed)
                if wasPayed then
                    exports['st_ui']:Notification(src, "success", 'Bill Accepted')
                else
                    exports['st_ui']:Notification(src, "error", 'Bill Declined')
                end
            end)
    end, {
        help = 'Test Billing'
    }, 0)
end)
