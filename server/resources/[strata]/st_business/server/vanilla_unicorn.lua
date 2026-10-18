AddEventHandler('Businesses:Server:Startup', function()
    exports["strata"]:RegisterServerCallback('VU:MakeItRain', function(source, data, cb)
        local char = Strata.User.Find(source)
        local targetChar = Strata.User.Find(data?.target)

        if char and targetChar and data?.type and Player(targetChar:GetData('Source')).state.onDuty == 'unicorn' then
            local itemData = exports.st_inventory:ItemsGetData(data.type)
            if data.type == 'cash' then
                if exports['st_finance']:WalletModify(char:GetData('Source'), -100) then
                    exports['st_finance']:WalletModify(targetChar:GetData('Source'), 100)
                    return cb(true)
                end
            elseif itemData then
                if exports.st_inventory:ItemsHas(char:GetData('SID'), 1, data.type, 1) then
                    if exports.st_inventory:Remove(char:GetData('SID'), 1, data.type, 1) then
                        exports['st_finance']:WalletModify(targetChar:GetData('Source'),
                            math.floor(itemData.price * 0.1))
                        exports['st_finance']:WalletModify(char:GetData('Source'), math.floor(itemData.price * 0.8))

                        local f = exports['st_finance']:AccountsGetOrganization("unicorn")
                        exports['st_finance']:BalanceDeposit(f.Account, math.floor(itemData.price * 0.05), {
                            type = "deposit",
                            title = "Private Dances",
                            description = string.format("5%% Tax On %s Private Dances", math.floor(itemData.price)),
                            data = data,
                        }, true)

                        return cb(true)
                    end
                end
            end
        end

        cb(false)
    end)
end)
