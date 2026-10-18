local Net = Strata.Net

---Register a server-side handler for a client → server callback.
---@param name string
---@param fn fun(source: integer, data: any, reply: fun(...: any))
function Net.Listen(name, fn)
    exports["strata"]:RegisterServerCallback(name, fn)
end

---Alias of Listen — semantic for "this responds to a request".
Net.Reply = Net.Listen

---Send a request to a specific client. The optional callback is invoked once they reply.
---@param target integer  client server id
---@param name string
---@param data any
---@param cb? fun(...: any)
---@param extraId? string
function Net.Send(target, name, data, cb, extraId)
    exports["strata"]:ClientCallback(target, name, data or {}, cb or function() end, extraId)
end
