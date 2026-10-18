local Surface = Strata.Surface

---Send an event payload to a NUI page.
---@param resource string
---@param event string
---@param data? table
function Surface.Push(resource, event, data)
    return PerformHttpRequest(("https://%s/%s"):format(resource, event), function() end,
        "POST", json.encode(data or {}), { ["Content-Type"] = "application/json" })
end

---Open a NUI page: take focus, show, optionally push an initial payload.
---@param resource string
---@param payload? { type?: string, data?: table, cursor?: boolean }
function Surface.Open(resource, payload)
    SetNuiFocus(true, payload and payload.cursor ~= false or true)
    if payload and payload.type then
        Surface.Push(resource, payload.type, payload.data or {})
    end
end

---Release NUI focus.
function Surface.Close()
    SetNuiFocus(false, false)
    SetNuiFocusKeepInput(false)
end
