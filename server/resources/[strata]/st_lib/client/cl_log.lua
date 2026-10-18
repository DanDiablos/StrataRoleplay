local Log = Strata.Log

---@param level "Trace" | "Info" | "Warn" | "Error" | "Critical"
---@param tag string
---@param msg string
---@param opts? StrataLogOpts
local function emit(level, tag, msg, opts)
    -- Strata core only ships Trace/Info/Warn/Error/Critical client-side via exports.
    local fn = ("Logger" .. level)
    exports["strata"][fn](exports["strata"], tag, msg, opts or { console = true })
end

---@param tag string @param msg string @param opts? StrataLogOpts
function Log.Trace(tag, msg, opts)    emit("Trace",    tag, msg, opts) end
---@param tag string @param msg string @param opts? StrataLogOpts
function Log.Info(tag, msg, opts)     emit("Info",     tag, msg, opts) end
---@param tag string @param msg string @param opts? StrataLogOpts
function Log.Warn(tag, msg, opts)     emit("Warn",     tag, msg, opts) end
---@param tag string @param msg string @param opts? StrataLogOpts
function Log.Error(tag, msg, opts)    emit("Error",    tag, msg, opts) end
---@param tag string @param msg string @param opts? StrataLogOpts
function Log.Critical(tag, msg, opts) emit("Critical", tag, msg, opts) end
