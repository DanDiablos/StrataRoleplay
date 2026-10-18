function RegisterCallbacks()
    exports["strata"]:RegisterServerCallback('Status:Get', function(source, data, cb)
        local char = Strata.User.Find(source)
        if char ~= nil then
            local s = char:GetData('Status')
            cb(s)
        else
            cb({})
        end
    end)
end
