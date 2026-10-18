local Field = Strata.Field

---Create a box-shaped zone via st_zones.
---@param id string
---@param center vector3
---@param length number
---@param width number
---@param options? table
---@param data? table
function Field.Box(id, center, length, width, options, data)
    return exports["st_zones"]:CreateBox(id, center, length, width, options, data)
end

---Create a circular zone via st_zones.
---@param id string
---@param center vector3
---@param radius number
---@param options? table
---@param data? table
function Field.Ring(id, center, radius, options, data)
    return exports["st_zones"]:CreateCircle(id, center, radius, options, data)
end

---Create a polygon zone via st_zones.
---@param id string
---@param points vector3[]
---@param options? table
---@param data? table
function Field.Poly(id, points, options, data)
    return exports["st_zones"]:CreatePoly(id, points, options, data)
end

---Remove a zone by id.
---@param id string
function Field.Drop(id)
    return exports["st_zones"]:Remove(id)
end

---@param coords vector3
---@return any
function Field.At(coords)
    return exports["st_zones"]:GetZoneAtCoords(coords)
end
