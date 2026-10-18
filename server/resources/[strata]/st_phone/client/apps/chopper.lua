RegisterNUICallback("GetChopperDetails", function(data, cb)
    exports["strata"]:ServerCallback("Tablet:LSUnderground:GetDetails", {
        phone = true
    }, function(data)
        cb(data)
    end)
end)
