local Alert = Strata.Alert

local KIND_TO_TYPE = {
    info = "primary",
    ok   = "success",
    warn = "warning",
    bad  = "error",
}

---Show a notification. Prefers st_ui's Notify; falls back to ox_lib's lib.notify.
---@param msg string
---@param kind? "info" | "ok" | "warn" | "bad"
---@param durationMs? integer  default 4000
function Alert.Show(msg, kind, durationMs)
    kind = kind or "info"
    durationMs = durationMs or 4000

    if GetResourceState("st_ui") == "started" then
        local ok = pcall(function()
            exports["st_ui"]:Notify(msg, KIND_TO_TYPE[kind] or "primary", durationMs)
        end)
        if ok then return end
    end

    if GetResourceState("ox_lib") == "started" then
        exports.ox_lib:notify({
            description = msg,
            type = (kind == "bad") and "error" or (kind == "ok" and "success" or kind),
            duration = durationMs,
        })
    end
end

---Show a progress bar (delegates to st_ui if present).
---@param label string
---@param durationMs integer
---@param opts? table
---@return boolean completed (true if it ran without cancel)
function Alert.Progress(label, durationMs, opts)
    if GetResourceState("st_ui") == "started" then
        local ok, res = pcall(function()
            return exports["st_ui"]:Progress(label, durationMs, opts or {})
        end)
        if ok then return res ~= false end
    end
    Wait(durationMs)
    return true
end
