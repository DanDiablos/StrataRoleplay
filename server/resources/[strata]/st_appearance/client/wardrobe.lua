-- Base64 encode/decode for outfit codes
local b64chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

---@param data string
---@return string
local function base64encode(data)
	return ((data:gsub('.', function(x)
		local r, b = '', x:byte()
		for i = 8, 1, -1 do r = r .. (b % 2 ^ i - b % 2 ^ (i - 1) > 0 and '1' or '0') end
		return r
	end) .. '0000'):gsub('%d%d%d?%d?%d?%d?', function(x)
		if #x < 6 then return '' end
		local c = 0
		for i = 1, 6 do c = c + (x:sub(i, i) == '1' and 2 ^ (6 - i) or 0) end
		return b64chars:sub(c + 1, c + 1)
	end) .. ({ '', '==', '=' })[#data % 3 + 1])
end

---@param data string
---@return string
local function base64decode(data)
	data = string.gsub(data, '[^' .. b64chars .. '=]', '')
	return (data:gsub('.', function(x)
		if x == '=' then return '' end
		local r, f = '', (b64chars:find(x)) - 1
		for i = 6, 1, -1 do r = r .. (f % 2 ^ i - f % 2 ^ (i - 1) > 0 and '1' or '0') end
		return r
	end):gsub('%d%d%d?%d?%d?%d?%d?%d?', function(x)
		if #x ~= 8 then return '' end
		local c = 0
		for i = 1, 8 do c = c + (x:sub(i, i) == '1' and 2 ^ (8 - i) or 0) end
		return string.char(c)
	end))
end

-- Save new outfit
AddEventHandler("Wardrobe:Client:SaveNew", function(data)
	exports['st_ui']:InputShow("Outfit Name", "Outfit Name", {
		{
			id = "name",
			type = "text",
			options = {
				inputProps = {
					maxLength = 24,
				},
			},
		},
	}, "Wardrobe:Client:DoSave", data)
end)

AddEventHandler("Wardrobe:Client:SaveExisting", function(data)
	exports["strata"]:ServerCallback("Wardrobe:SaveExisting", data.index, function(state)
		if state then
			exports["st_ui"]:Notification("success", "Outfit Saved")
			exports['st_appearance']:WardrobeShow()
		else
			exports["st_ui"]:Notification("error", "Unable to Save Outfit")
		end
	end)
end)

AddEventHandler("Wardrobe:Client:DoSave", function(values, data)
	exports["strata"]:ServerCallback("Wardrobe:Save", {
		index = data,
		name = values.name,
	}, function(state)
		if state then
			exports["st_ui"]:Notification("success", "Outfit Saved")
			exports['st_appearance']:WardrobeShow()
		else
			exports["st_ui"]:Notification("error", "Unable to Save Outfit")
		end
	end)
end)

-- Delete outfit
AddEventHandler("Wardrobe:Client:Delete", function(data)
	exports['st_ui']:ConfirmShow(string.format("Delete %s?", data.label), {
		yes = "Wardrobe:Client:Delete:Yes",
		no = "Wardrobe:Client:Delete:No",
	}, "", data.index)
end)

AddEventHandler("Wardrobe:Client:Delete:Yes", function(data)
	exports["strata"]:ServerCallback("Wardrobe:Delete", data, function(s)
		if s then
			exports["st_ui"]:Notification("success", "Outfit Deleted")
			exports['st_appearance']:WardrobeShow()
		end
	end)
end)

-- Equip outfit
AddEventHandler("Wardrobe:Client:Equip", function(data)
	exports["strata"]:ServerCallback("Wardrobe:Equip", data.index, function(state)
		if state then
			exports["st_sound"]:PlayOne("outfit_change.ogg", 0.3)
			exports["st_ui"]:Notification("success", "Outfit Equipped")
		else
			exports["st_ui"]:Notification("error", "Unable to Equip Outfit")
		end
	end)
end)

-- Export outfit code
AddEventHandler("Wardrobe:Client:Export", function(data)
	exports["strata"]:ServerCallback("Wardrobe:Export", data.index, function(outfitData)
		if outfitData then
			local jsonStr = json.encode(outfitData)
			local encoded = base64encode(jsonStr)
			SendNUIMessage({
				type = "COPY_OUTFIT_CODE",
				data = {
					code = encoded,
				},
			})
			exports["st_ui"]:Notification("success", "Outfit code copied to clipboard")
		else
			exports["st_ui"]:Notification("error", "Unable to export outfit")
		end
	end)
end)

-- Import outfit code
AddEventHandler("Wardrobe:Client:Import", function()
	exports['st_ui']:InputShow("Import Outfit", "Paste an outfit code", {
		{
			id = "code",
			type = "text",
			options = {
				inputProps = {
					maxLength = 10000,
				},
			},
		},
	}, "Wardrobe:Client:DoImport", {})
end)

AddEventHandler("Wardrobe:Client:DoImport", function(values, data)
	local code = values.code
	if not code or code == "" then
		exports["st_ui"]:Notification("error", "No code provided")
		return
	end

	local decoded = base64decode(code)
	if not decoded or decoded == "" then
		exports["st_ui"]:Notification("error", "Invalid outfit code")
		return
	end

	local ok, outfitData = pcall(json.decode, decoded)
	if not ok or not outfitData or (not outfitData.components and not outfitData.props) then
		exports["st_ui"]:Notification("error", "Invalid outfit code")
		return
	end

	exports['st_ui']:InputShow("Outfit Name", "Name this outfit", {
		{
			id = "name",
			type = "text",
			options = {
				inputProps = {
					maxLength = 24,
				},
			},
		},
	}, "Wardrobe:Client:DoImportSave", outfitData)
end)

AddEventHandler("Wardrobe:Client:DoImportSave", function(values, outfitData)
	exports["strata"]:ServerCallback("Wardrobe:Import", {
		name = values.name,
		data = outfitData,
	}, function(state)
		if state then
			exports["st_ui"]:Notification("success", "Outfit Imported")
			exports['st_appearance']:WardrobeShow()
		else
			exports["st_ui"]:Notification("error", "Unable to import outfit")
		end
	end)
end)

RegisterNetEvent("Wardrobe:Client:ShowBitch", function(eventRoutine)
	exports['st_appearance']:WardrobeShow()
end)

exports("WardrobeShow", function()
	exports["strata"]:ServerCallback("Wardrobe:GetAll", {}, function(data)
		local items = {}
		for k, v in pairs(data) do
			if v.label ~= nil then
				table.insert(items, {
					label = v.label,
					description = string.format("Outfit #%s", k),
					actions = {
						{
							icon = "floppy-disks",
							event = "Wardrobe:Client:SaveExisting",
						},
						{
							icon = "copy",
							event = "Wardrobe:Client:Export",
							tooltip = "Export Code",
						},
						{
							icon = "shirt",
							event = "Wardrobe:Client:Equip",
						},
						{
							icon = "x",
							event = "Wardrobe:Client:Delete",
						},
					},
					data = {
						index = k,
						label = v.label,
					},
				})
			end
		end

		table.insert(items, {
			label = "Save New Outfit",
			event = "Wardrobe:Client:SaveNew",
		})

		table.insert(items, {
			label = "Import Outfit Code",
			event = "Wardrobe:Client:Import",
		})

		exports['st_ui']:ListMenuShow({
			main = {
				label = "Wardrobe",
				items = items,
			},
		})
	end)
end)

exports("WardrobeClose", function()
	SetNuiFocus(false, false)
	SendNUIMessage({
		type = "CLOSE_LIST_MENU",
	})
end)
