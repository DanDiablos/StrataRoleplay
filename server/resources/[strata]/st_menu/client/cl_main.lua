---@alias MenuItemType "BUTTON"|"ADVANCED"|"CHECKBOX"|"SLIDER"|"TICKER"|"COLORPICKER"|"COLORLIST"|"INPUT"|"NUMBER"|"SELECT"|"TEXT"|"SUBMENU"|"GOBACK"

---@class MenuItemOptions
---@field disabled?       boolean
---@field selected?       boolean
---@field min?            number
---@field max?            number
---@field current?        any
---@field secondaryLabel? string
---@field colors?         table
---@field list?           table
---@field classes?        string[]

---@class MenuItem
---@field type    MenuItemType
---@field id      string
---@field label?  string
---@field menu?   string
---@field options MenuItemOptions

---@class MenuData
---@field id    string
---@field label string
---@field items MenuItem[]?

---@class Menu
---@field data    MenuData
---@field Add     table
---@field Remove  fun(self: Menu, id: string)
---@field Update  table
---@field Show    fun(self: Menu, back?: boolean)
---@field SubMenu fun(self: Menu, id: string, back?: boolean)
---@field Close   fun(self: Menu)

local _cbs        = {}  ---@type table<string, function>
local _items      = {}  ---@type table<string, MenuItem[]>
local _submenus   = {}  ---@type table<string, MenuData>
local _unfocus    = {}  ---@type table<string, boolean>
local _focusLost  = false
local _openId     = false ---@type string|false

-- ── Required options per item type ───────────────────────────────────────────

local REQUIRED = {
	BUTTON      = {},
	ADVANCED    = { "secondaryLabel" },
	CHECKBOX    = { "selected" },
	SLIDER      = { "min", "max", "current" },
	TICKER      = { "min", "max", "current" },
	COLORPICKER = { "current" },
	COLORLIST   = { "current", "colors" },
	INPUT       = { "max" },
	NUMBER      = {},
	SELECT      = { "current", "list" },
	TEXT        = {},
	SUBMENU     = {},
	GOBACK      = {},
}

local SOUNDS = {
	SELECT   = { id = -1, sound = "SELECT",      library = "HUD_FRONTEND_DEFAULT_SOUNDSET" },
	BACK     = { id = -1, sound = "CANCEL",      library = "HUD_FRONTEND_DEFAULT_SOUNDSET" },
	UPDOWN   = { id = -1, sound = "NAV_UP_DOWN", library = "HUD_FRONTEND_DEFAULT_SOUNDSET" },
	DISABLED = { id = -1, sound = "ERROR",       library = "HUD_FRONTEND_DEFAULT_SOUNDSET" },
}

-- ── Helpers ───────────────────────────────────────────────────────────────────

---@param itemType MenuItemType
---@param options  MenuItemOptions
---@return boolean
local function ValidateOptions(itemType, options)
	local req = REQUIRED[itemType]
	if not req then return false end
	for _, attr in ipairs(req) do
		if options[attr] == nil then return false end
	end
	return true
end

---@param menuId string
---@param itemId string
---@param key    string
---@param value  any
local function UpdateValue(menuId, itemId, key, value)
	for _, item in ipairs(_items[menuId] or {}) do
		if item.id == itemId and item.options then
			item.options[key] = value
			return
		end
	end
end

local function CloseAll()
	SendNUIMessage({ type = "APP_HIDE" })
	SetNuiFocus(false, false)
	for k, v in pairs(_cbs) do
		if k:find("-close$") then v() end
	end
	_cbs      = {}
	_items    = {}
	_submenus = {}
	_openId   = false
	_focusLost = false
end

-- ── Exports ───────────────────────────────────────────────────────────────────

exports("Create", function(mId, mLabel, openCb, closeCb, canFocusBeLost)
	_items[mId]   = {}
	_unfocus[mId] = canFocusBeLost == true

	---@type Menu
	local menu = {
		data = { id = mId, label = mLabel },
	}

	-- ── Show / SubMenu / Close ────────────────────────────────────────────────

	function menu:Show(back)
		if not back and openCb then openCb() end
		self.data.items = _items[mId]
		SendNUIMessage({ type = "SETUP_MENU", data = { data = self.data } })
		SendNUIMessage({ type = "APP_SHOW" })
		SetNuiFocus(true, true)
		_openId = mId
	end

	function menu:SubMenu(id, back)
		local data = _submenus[id]
		data.items = _items[id]
		SendNUIMessage({ type = "SUBMENU_OPEN", data = { data = data, addHistroy = not back } })
	end

	function menu:Close()
		SendNUIMessage({ type = "APP_HIDE" })
		SetNuiFocus(false, false)
		SendNUIMessage({ type = "CLEAR_MENU" })
		if closeCb then closeCb() end
		_cbs      = {}
		_items    = {}
		_submenus = {}
		_openId   = false
		_focusLost = false
	end

	-- ── Remove ────────────────────────────────────────────────────────────────

	function menu:Remove(id)
		for k, item in ipairs(_items[mId]) do
			if item.id == id then
				table.remove(_items[mId], k)
				_cbs[id] = nil
				return
			end
		end
	end

	-- ── Update ────────────────────────────────────────────────────────────────

	menu.Update = {}

	function menu.Update:Item(id, label, data, dontPush)
		for _, item in ipairs(_items[mId]) do
			if item.id == id then
				for k, v in pairs(data) do item.options[k] = v end
				item.label = label
				menu.data.items = _items[mId]
				if not dontPush then
					SendNUIMessage({ type = "UPDATE_MENU", data = { data = menu.data } })
				end
				return
			end
		end
	end

	function menu.Update:Submenu(id, data)
		_submenus[id] = data
	end

	-- ── Add ───────────────────────────────────────────────────────────────────

	menu.Add = {}

	local function nextId()
		return mId .. "-item" .. #_items[mId]
	end

	local function defOpts(options)
		if not options then options = {} end
		if options.disabled == nil then options.disabled = false end
		return options
	end

	function menu.Add:Button(label, options, cb)
		options = defOpts(options)
		if not ValidateOptions("BUTTON", options) then return end
		local id = nextId()
		_cbs[id] = cb
		table.insert(_items[mId], { type = "BUTTON", id = id, label = label, options = options })
		return id
	end

	function menu.Add:AdvButton(label, options, cb)
		options = defOpts(options)
		if not ValidateOptions("ADVANCED", options) then return end
		local id = nextId()
		_cbs[id] = cb
		table.insert(_items[mId], { type = "ADVANCED", id = id, label = label, options = options })
		return id
	end

	function menu.Add:Slider(label, options, cb)
		options = defOpts(options)
		if not ValidateOptions("SLIDER", options) then return end
		local id = nextId()
		_cbs[id] = function(data) UpdateValue(mId, data.id, "current", data.data.value) cb(data) end
		table.insert(_items[mId], { type = "SLIDER", id = id, label = label, options = options })
		return id
	end

	function menu.Add:Ticker(label, options, cb)
		options = defOpts(options)
		if not ValidateOptions("TICKER", options) then return end
		local id = nextId()
		_cbs[id] = function(data) UpdateValue(mId, data.id, "current", data.data.value) cb(data) end
		table.insert(_items[mId], { type = "TICKER", id = id, label = label, options = options })
		return id
	end

	function menu.Add:CheckBox(label, options, cb)
		options = defOpts(options)
		if not ValidateOptions("CHECKBOX", options) then return end
		local id = nextId()
		_cbs[id] = function(data) UpdateValue(mId, data.id, "selected", data.data.selected) cb(data) end
		table.insert(_items[mId], { type = "CHECKBOX", id = id, label = label, options = options })
		return id
	end

	function menu.Add:ColorPicker(options, cb)
		options = defOpts(options)
		if not ValidateOptions("COLORPICKER", options) then return end
		local id = nextId()
		_cbs[id] = function(data) UpdateValue(mId, data.id, "current", data.data.color) cb(data) end
		table.insert(_items[mId], { type = "COLORPICKER", id = id, options = options })
		return id
	end

	function menu.Add:ColorList(options, cb)
		options = defOpts(options)
		if not ValidateOptions("COLORLIST", options) then return end
		local id = nextId()
		_cbs[id] = function(data) UpdateValue(mId, data.id, "current", data.data.color) cb(data) end
		table.insert(_items[mId], { type = "COLORLIST", id = id, options = options })
		return id
	end

	function menu.Add:Input(label, options, cb)
		options = defOpts(options)
		if not ValidateOptions("INPUT", options) then return end
		local id = nextId()
		_cbs[id] = function(data) UpdateValue(mId, data.id, "current", data.data.value) cb(data) end
		table.insert(_items[mId], { type = "INPUT", id = id, label = label, options = options })
		return id
	end

	function menu.Add:Number(label, options, cb)
		options = defOpts(options)
		if not ValidateOptions("NUMBER", options) then return end
		local id = nextId()
		_cbs[id] = function(data) UpdateValue(mId, data.id, "current", data.data.value) cb(data) end
		table.insert(_items[mId], { type = "NUMBER", id = id, label = label, options = options })
		return id
	end

	function menu.Add:Select(label, options, cb)
		options = defOpts(options)
		if not ValidateOptions("SELECT", options) then return end
		local id = nextId()
		_cbs[id] = function(data) UpdateValue(mId, data.id, "current", data.data.value) cb(data) end
		table.insert(_items[mId], { type = "SELECT", id = id, label = label, options = options })
		return id
	end

	function menu.Add:Text(text, classes)
		local id = nextId()
		table.insert(_items[mId], { type = "TEXT", id = id, label = text, options = { classes = classes } })
		return id
	end

	function menu.Add:SubMenu(label, submenu, options, openCb, closeCb)
		options = defOpts(options)
		if not ValidateOptions("SUBMENU", options) then return end
		local subId = submenu.data.id
		if not openCb then
			openCb = function(id, back) menu:SubMenu(id, back) end
		end
		_cbs[subId .. "-open"]  = openCb
		if closeCb then _cbs[subId .. "-close"] = closeCb end
		table.insert(_items[mId], { type = "SUBMENU", id = subId, label = label, menu = subId, options = options })
		_submenus[subId] = submenu.data
	end

	function menu.Add:SubMenuBack(label, options, cb)
		options = defOpts(options)
		if not ValidateOptions("GOBACK", options) then return end
		local id = nextId()
		_cbs[id] = cb
		table.insert(_items[mId], { type = "GOBACK", id = id, label = label, options = options })
	end

	-- ── Register open/close callbacks ─────────────────────────────────────────

	_cbs[mId .. "-open"] = function(id, back) menu:Show(back) end
	if closeCb then _cbs[mId .. "-close"] = closeCb end

	return menu
end)

exports("IsOpen", function()
	return _openId ~= false
end)

-- ── NUI callbacks ─────────────────────────────────────────────────────────────

RegisterNUICallback("MenuOpen", function(data, cb)
	cb("OK")
	if _cbs[data.id .. "-open"] then
		_cbs[data.id .. "-open"](data.id, data.back)
	end
end)

RegisterNUICallback("MenuClose", function(data, cb)
	cb("OK")
	if _cbs[data.id .. "-close"] then
		_cbs[data.id .. "-close"]()
	end
end)

RegisterNUICallback("Close", function(data, cb)
	cb("OK")
	CloseAll()
end)

RegisterNUICallback("Selected", function(data, cb)
	cb("OK")
	if _cbs[data.id] then
		_cbs[data.id](data)
	end
end)

RegisterNUICallback("FrontEndSound", function(data, cb)
	cb("ok")
	local s = SOUNDS[data.sound]
	if s then
		exports['st_sound']:UISoundsPlayFrontEnd(s.id, s.sound, s.library)
	end
end)

RegisterNUICallback("ToggleFocusLoss", function(data, cb)
	cb("ok")
	if _focusLost or not _unfocus[_openId] then return end
	_focusLost = true
	SetNuiFocus(false, false)
	CreateThread(function()
		while _focusLost do
			if IsControlJustReleased(0, 21) then
				SetNuiFocus(true, true)
				SetCursorLocation(0.2, 0.5)
				_focusLost = false
			end
			Wait(5)
		end
	end)
end)

-- ── Net events ────────────────────────────────────────────────────────────────

RegisterNetEvent("Characters:Client:Logout", function()
	CloseAll()
end)

RegisterNetEvent("UI:Client:Reset", function(force)
	if force then CloseAll() end
end)
