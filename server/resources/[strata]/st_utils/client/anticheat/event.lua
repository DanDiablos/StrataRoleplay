function RegisterEvents()
    CreateThread(function()
        exports["strata"]:ServerCallback('Anticheat:GetEvents', {}, function(e)
            for k, v in ipairs(e) do
                AddEventHandler(v, function()
                    exports["strata"]:ServerCallback('Anticheat:Trigger', {
                        check = v,
                        match = v,
                    }, function(s)
                        CancelEvent()
                        return
                    end)
                end)
            end
        end)
    end)
end
