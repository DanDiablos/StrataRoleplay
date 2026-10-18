local currentlyShowing = nil

AddEventHandler("Businesses:Client:PayContactlessPayment", function(data)
    if data and data.id then
        exports["strata"]:ServerCallback("Contactless:Pay", {
            terminalId = data.id,
        }, function(success)
            if success then
                exports["st_sound"]:PlayDistance(4.0, 'payment_success.ogg', 0.2)
            end
        end)
    end
end)

AddEventHandler("Businesses:Client:CreateContactlessPayment", function(data)
    if data and data.job and data.id then
        local input = GetContactlessInput(data)

        if input?.amount and input?.description then
            local amount = tonumber(input.amount)
            if amount and amount > 0 and amount <= 25000 then
                exports["strata"]:ServerCallback("Contactless:Create", {
                    job = data.job,
                    terminalId = data.id,
                    payment = amount,
                    description = input.description
                }, function(success, res)
                    if success then
                        exports["st_ui"]:Notification("success", "Contactless Terminal Set, Now Get Them to Pay!")
                    else
                        exports["st_ui"]:Notification("error", res or "Error")
                    end
                end)
            else
                exports["st_ui"]:Notification("error", "Maximum Contactless Amount is $25,000")
            end
        end
    end
end)

AddEventHandler("Businesses:Client:ClearContactlessPayment", function(data)
    if data and data.job and data.id then
        exports["strata"]:ServerCallback("Contactless:Clear", {
            job = data.job,
            terminalId = data.id,
        }, function(success, res)
            if success then
                exports["st_ui"]:Notification("success", "Contactless Terminal Cleared")
            else
                exports["st_ui"]:Notification("error", res or "Error")
            end
        end)
    end
end)

local promptPromise
function GetContactlessInput(data)
    promptPromise = promise.new()
    currentlyShowing = GetGameTimer()
    local showingAtTime = GetGameTimer()
    exports['st_ui']:InputShow(
        string.format("Create Contactless Payment - %s Terminal #%s", data.jobName, data.num), "Amount", {
            {
                id = "amount",
                type = "number",
                options = {
                    inputProps = {
                        defaultValue = "100",
                        min = 0,
                        max = 25000,
                    },
                    label = "Amount",
                },
            },
            {
                id = "description",
                type = "text",
                options = {
                    inputProps = {
                        maxlength = 100,
                    },
                    label = "Description",
                },
            },
        }, "Contactless:Client:RecieveInput", {})

    SetTimeout(30000, function()
        if promptPromise and currentlyShowing == showingAtTime then
            exports['st_ui']:InputClose()
            promptPromise:resolve(false)
            promptPromise = nil
        end
    end)

    return Citizen.Await(promptPromise)
end

AddEventHandler("Contactless:Client:RecieveInput", function(values)
    if promptPromise then
        promptPromise:resolve(values)
        promptPromise = nil
    end
end)
