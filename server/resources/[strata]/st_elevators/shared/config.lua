---@class ElevatorPermission
---@field type "character"|"job"|"propertyData"
---@field SID?           string
---@field job?           string
---@field workplace?     string|boolean
---@field grade?         number|boolean
---@field gradeLevel?    number|boolean
---@field reqDuty?       boolean
---@field jobPermission? string|boolean
---@field key?           string
---@field value?         any

---@class ElevatorZone
---@field center  vector3
---@field length  number
---@field width   number
---@field heading number
---@field minZ    number
---@field maxZ    number

---@class ElevatorFloor
---@field name          string
---@field coords        vector4
---@field zone          ElevatorZone|ElevatorZone[]
---@field locked?       boolean
---@field defaultLocked? boolean
---@field bypassLock?   ElevatorPermission[]

---@class ElevatorConfig
---@field name    string
---@field canLock? ElevatorPermission[]
---@field floors  table<integer, ElevatorFloor>

---@type ElevatorConfig[]
Elevators = {}

---@param list ElevatorConfig[]
function AddElevators(list)
	for _, elevator in ipairs(list) do
		Elevators[#Elevators + 1] = elevator
	end
end
