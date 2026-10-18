AddEventHandler("Tablet:Server:RegisterCallbacks", function()
    exports["strata"]:RegisterServerCallback("Tablet:Settings:Update", function(source, data, cb)
        local char = Strata.User.Find(source)
        if char then
            local settings = char:GetData("LaptopSettings")
            settings[data.type] = data.val
            char:SetData("LaptopSettings", settings)
        end
    end)
end)
