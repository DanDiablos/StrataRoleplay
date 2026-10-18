AddEventHandler("onResourceStart", function(resource)
    if resource ~= GetCurrentResourceName() then return end

    CreateThread(function()
        GlobalState.AdminPlayerHistory = {}
        while true do
            local t = GlobalState.AdminPlayerHistory or {}
            if #t >= 60 then
                table.remove(t, 1)
            end

            table.insert(t, {
                count = exports["strata"]:FetchCount(),
                time = os.time(),
            })

            GlobalState.AdminPlayerHistory = t
            Wait(1000 * 60 * 5)
        end
    end)
end)
