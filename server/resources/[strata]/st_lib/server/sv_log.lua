local Log = Strata.Log

---@param level "Trace" | "Info" | "Warn" | "Error" | "Critical"
local function emit(level, tag, msg, opts)
    local fn = "Logger" .. level
    exports["strata"][fn](exports["strata"], tag, msg, opts or { console = true })
end

function Log.Trace(tag, msg, opts)    emit("Trace",    tag, msg, opts) end
function Log.Info(tag, msg, opts)     emit("Info",     tag, msg, opts) end
function Log.Warn(tag, msg, opts)     emit("Warn",     tag, msg, opts) end
function Log.Error(tag, msg, opts)    emit("Error",    tag, msg, opts) end
function Log.Critical(tag, msg, opts) emit("Critical", tag, msg, opts) end
