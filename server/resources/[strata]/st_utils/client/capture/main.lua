---@diagnostic disable: undefined-global

RegisterNetEvent("st_utils:requestCapture", function(requestId, options)
    local opts = options or { encoding = "webp" }

    exports["st_utils"]:requestScreenshot(opts, function(data)
        if data and data ~= "" then
            TriggerServerEvent("st_utils:captureResult", requestId, data)
        else
            TriggerServerEvent("st_utils:captureResult", requestId, nil)
        end
    end)
end)
