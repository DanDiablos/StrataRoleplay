exports('Notification', function(notifType, message, duration, icon, style, id)
    if duration == nil then
        duration = 2500
    end

    local notification = {
        type = notifType,
        message = message,
        duration = duration,
        icon = icon,
    }

    if style then
        notification.style = style
    end

    if duration == -1 then -- If duration = -1, the notification will be persistent
        if id == nil then
            return
        end
        notification._id = id
    end

    if notification.type == "remove" then
        SendNUIMessage({
            type = "HIDE_ALERT",
            data = {
                id = id,
            },
        })
        return
    end

    if notification.type == "clear" then
        SendNUIMessage({
            type = "CLEAR_ALERTS",
        })
        return
    end

    SendNUIMessage({
        type = "ADD_ALERT",
        data = {
            notification = notification,
        },
    })
end)

RegisterNetEvent("HUD:Client:NotificationClear", function()
    exports['st_ui']:Notification("clear")
end)

RegisterNetEvent("HUD:Client:NotificationRemove", function(id)
    exports['st_ui']:Notification("remove", id)
end)

RegisterNetEvent("HUD:Client:Notification", function(notification)
    exports['st_ui']:Notification(notification.type, notification.message, notification.duration, notification
        .icon, notification.style, notification._id)
end)
