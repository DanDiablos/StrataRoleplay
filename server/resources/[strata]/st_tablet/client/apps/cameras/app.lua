RegisterNUICallback("GetCameras", function(_, cb)
    local total = GlobalState["CCTV:Camera:Total"] or 0
    local list = {}
    for i = 1, total do
        local cam = GlobalState[("CCTV:Camera:%d"):format(i)]
        if cam then
            list[#list + 1] = {
                id       = i,
                label    = cam.label,
                group    = cam.group,
                isOnline = cam.isOnline,
                quality  = cam.quality,
                canRotate = cam.canRotate,
            }
        end
    end
    cb(list)
end)

local _reopenAfterExit = false

RegisterNUICallback("ViewCamera", function(data, cb)
    local camId = tonumber(data and data.camId)
    if not camId then
        cb({ ok = false })
        return
    end
    _reopenAfterExit = true
    exports['st_tablet']:Close()
    exports["strata"]:ServerCallback("Tablet:Cameras:View", { camId = camId }, function(res)
        cb(res or { ok = false })
    end)
end)

CreateThread(function()
    local wasIn = false
    while true do
        local inCam = LocalPlayer.state.inCCTVCam and true or false
        if wasIn and not inCam and _reopenAfterExit then
            _reopenAfterExit = false
            if
                _loggedIn
                and not exports['st_ui']:IsDisabled()
                and not exports['st_jail']:IsJailed()
                and exports.st_inventory:Search('count', 'tablet') > 0
                and not LocalPlayer.state.tabletOpen
            then
                exports['st_tablet']:Open()
                Wait(120)
                SendNUIMessage({ type = "UNLOCK" })
                SendNUIMessage({ type = "NAV", data = "cameras" })
            end
        end
        wasIn = inCam
        Wait(200)
    end
end)
