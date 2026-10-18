AddEventHandler("Tablet:Server:RegisterCallbacks", function()
    exports["strata"]:RegisterServerCallback("Tablet:Cameras:View", function(source, data, cb)
        local camId = tonumber(data and data.camId)
        if not camId then
            cb({ ok = false })
            return
        end
        exports['st_cameras']:View(source, camId)
        cb({ ok = true })
    end)
end)
