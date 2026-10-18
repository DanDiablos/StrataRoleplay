local Net = Strata.Net

---Register a client-side handler for a server → client callback.
---@param name string
---@param fn fun(data: any, reply: fun(...: any))
function Net.Listen(name, fn)
    exports["strata"]:RegisterClientCallback(name, fn)
end

---Alias of Listen — semantic for "this responds to a request".
Net.Reply = Net.Listen

---Send a request to the server. The optional callback is invoked once the server replies.
---@param name string
---@param data any
---@param cb? fun(...: any)
---@param extraId? string
function Net.Send(name, data, cb, extraId)
    exports["strata"]:ServerCallback(name, data or {}, cb or function() end, extraId)
end
