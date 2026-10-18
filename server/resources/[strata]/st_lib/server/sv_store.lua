local Store = Strata.Store

---Run a SELECT and await all rows.
---@param sql string
---@param params? any[]
---@return table[]
function Store.Fetch(sql, params)
    return MySQL.query.await(sql, params or {})
end

---Run a SELECT and await the first row only.
---@param sql string
---@param params? any[]
---@return table | nil
function Store.One(sql, params)
    return MySQL.single.await(sql, params or {})
end

---Run an INSERT and return the new id.
---@param sql string
---@param params? any[]
---@return integer
function Store.Insert(sql, params)
    return MySQL.insert.await(sql, params or {})
end

---Run an UPDATE/DELETE and return affected row count.
---@param sql string
---@param params? any[]
---@return integer
function Store.Update(sql, params)
    return MySQL.update.await(sql, params or {})
end

---Fire-and-forget query — convenience for non-awaiting callsites.
---@param sql string
---@param params? any[]
function Store.Run(sql, params)
    MySQL.query(sql, params or {})
end
