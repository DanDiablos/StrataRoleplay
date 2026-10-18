local Sounds = {
	["SELECT"] = { id = -1, sound = "SELECT", library = "HUD_FRONTEND_DEFAULT_SOUNDSET" },
	["BACK"] = { id = -1, sound = "CANCEL", library = "HUD_FRONTEND_DEFAULT_SOUNDSET" },
	["UPDOWN"] = { id = -1, sound = "NAV_UP_DOWN", library = "HUD_FRONTEND_DEFAULT_SOUNDSET" },
	["DISABLED"] = { id = -1, sound = "ERROR", library = "HUD_FRONTEND_DEFAULT_SOUNDSET" },
}

LocalPlayer.state.isNaked = false

---@return boolean
local function IsPedReady()
	return LocalPed ~= nil and LocalPed.customization ~= nil
end

RegisterNetEvent("UI:Client:Reset", function(apps)
	SetNuiFocus(false, false)
	SendNUIMessage({
		type = "UI_RESET",
		data = {},
	})

	SendNUIMessage({
		type = "SET_TATTOOS_DATA",
		data = {
			data = PedTattoos
		},
	})
end)

RegisterNUICallback("FrontEndSound", function(data, cb)
	cb("ok")
	if Sounds[data.sound] ~= nil then
		exports['st_sound']:UISoundsPlayFrontEnd(Sounds[data.sound].id, Sounds[data.sound].sound,
			Sounds[data.sound].library)
	end
end)

RegisterNUICallback("Save", function(data, cb)
	if _currentState ~= nil then
		exports['st_appearance']:CustomizationSave(cb)
	else
		cb(false)
	end
end)

RegisterNUICallback("Cancel", function(data, cb)
	cb(exports['st_appearance']:CustomizationCancel())
end)

function deepcopy(orig)
	local orig_type = type(orig)
	local copy
	if orig_type == "table" then
		copy = {}
		for orig_key, orig_value in next, orig, nil do
			copy[deepcopy(orig_key)] = deepcopy(orig_value)
		end
		setmetatable(copy, deepcopy(getmetatable(orig)))
	else -- number, string, boolean, etc
		copy = orig
	end
	return copy
end

local nakedPed = nil
function ToggleNekked(data)
	if data then
		LocalPlayer.state.isNaked = true
		nakedPed = deepcopy(LocalPed)
		local isMale = LocalPlayer.state.Character:GetData("Gender") == 0
		if isMale then
			local randTxture = GetRandomIntInRange(0, 13)
			nakedPed.customization.components.torso.drawableId = 15
			nakedPed.customization.components.torso2.drawableId = 15
			nakedPed.customization.components.undershirt.drawableId = 15
			nakedPed.customization.components.leg.drawableId = 61
			nakedPed.customization.components.leg.textureId = randTxture
			nakedPed.customization.components.kevlar.drawableId = 0
			nakedPed.customization.components.shoes.drawableId = 34
		else
			local randTxture = GetRandomIntInRange(0, 11)
			local randTxture2 = GetRandomIntInRange(0, 15)
			nakedPed.customization.components.torso.drawableId = 15
			nakedPed.customization.components.torso2.drawableId = 18
			nakedPed.customization.components.torso2.textureId = randTxture
			nakedPed.customization.components.undershirt.drawableId = 14
			nakedPed.customization.components.leg.drawableId = 15
			nakedPed.customization.components.leg.textureId = randTxture2
			nakedPed.customization.components.kevlar.drawableId = 0
			nakedPed.customization.components.shoes.drawableId = 35
		end

		nakedPed.customization.components.mask.drawableId = 0
		nakedPed.customization.components.bag.drawableId = 0
		nakedPed.customization.components.badge.drawableId = 0
		nakedPed.customization.components.accessory.drawableId = 0
		nakedPed.customization.props.hat.disabled = true
		nakedPed.customization.props.glass.disabled = true
		nakedPed.customization.props.ear.disabled = true
		exports['st_appearance']:ApplyToPed(nakedPed)
	else
		LocalPlayer.state.isNaked = false
		exports['st_appearance']:ApplyToPed(LocalPed)
		nakedPed = nil
	end
end

RegisterNUICallback("ToggleNekked", function(data, cb)
	ToggleNekked(data)
	cb("ok")
end)

RegisterNUICallback("ChangeCamera", function(data, cb)
	cb("ok")
	SetEntityHeading(PlayerPedId(), _creatorLocation.h)
	Camera.SetView(_camOffsets[data])
end)

RegisterNUICallback("RotateLeft", function(data, cb)
	cb("ok")
	local playerPed = PlayerPedId()
	local heading = GetEntityHeading(playerPed)
	SetEntityHeading(playerPed, heading - 5)
end)

RegisterNUICallback("RotateRight", function(data, cb)
	cb("ok")
	local playerPed = PlayerPedId()
	local heading = GetEntityHeading(playerPed)
	SetEntityHeading(playerPed, heading + 5)
end)

RegisterNUICallback("RotateDelta", function(data, cb)
	cb("ok")
	local playerPed = PlayerPedId()
	local heading = GetEntityHeading(playerPed)
	SetEntityHeading(playerPed, heading + tonumber(data.delta))
end)

RegisterNUICallback("Zoom", function(data, cb)
	cb("ok")
	Camera.radius = Camera.radius + (tonumber(data.zoom))
	Camera.updateZoom = true
end)

RegisterNUICallback("Animation", function(data, cb)
	cb("ok")
	if _playingIdle then
		ClearPedTasks(PlayerPedId())
		_playingIdle = false
	else
		PlayIdleAnimation()
	end
end)

RegisterNUICallback("SetPedHeadBlendData", function(data, cb)
	cb("OK")
	if not IsPedReady() then return end
	LocalPed.customization.face[data.face][data.type] = data.value
	if LocalPlayer.state.isNaked then
		nakedPed.customization.face[data.face][data.type] = data.value
		exports['st_appearance']:ApplyToPed(nakedPed)
	else
		exports['st_appearance']:ApplyToPed(LocalPed)
	end
end)

RegisterNUICallback("SetPed", function(data, cb)
	local model = GetHashKey(data.value)
	RequestModel(model)
	local c = 0
	while not HasModelLoaded(model) do
		Wait(1)
		c = c + 1
		if c >= 2000 then
			cb(false)
			return
		end
	end
	cb(true)

	LocalPed.model = data.value
	if LocalPlayer.state.isNaked then
		nakedPed.model = data.value
	end
	if _data ~= nil then
		_data.Ped.model = data.value
	end

	SetPlayerModel(PlayerId(), model)
	player = PlayerPedId()
	SetEntityMaxHealth(player, 200)
	SetEntityHealth(player, GetEntityMaxHealth(player))
	LocalPlayer.state.ped = player
	SetPedDefaultComponentVariation(player)
	SetEntityAsMissionEntity(player, true, true)
	SetModelAsNoLongerNeeded(model)

	if data.value == "mp_f_freemode_01" or data.value == "mp_m_freemode_01" then
		if LocalPlayer.state.isNaked then
			exports['st_appearance']:ApplyToPed(nakedPed)
		else
			exports['st_appearance']:ApplyToPed(LocalPed)
		end
	end
end)

RegisterNUICallback("SetPedFaceFeature", function(data, cb)
	cb("OK")
	if not IsPedReady() then return end
	LocalPed.customization.face.features[data.index] = data.value
	if LocalPlayer.state.isNaked then
		nakedPed.customization.face.features[data.index] = data.value
		exports['st_appearance']:ApplyToPed(nakedPed)
	else
		exports['st_appearance']:ApplyToPed(LocalPed)
	end
end)

RegisterNUICallback("SetPedHeadOverlay", function(data, cb)
	cb("OK")
	if not IsPedReady() then return end
	if not LocalPed.customization.overlay[data.type] then return end
	if data.extraType == "opacity" then
		LocalPed.customization.overlay[data.type].opacity = data.value
	elseif data.extraType == "index" then
		LocalPed.customization.overlay[data.type].index = data.value
		LocalPed.customization.overlay[data.type].disabled = false
	else
		LocalPed.customization.overlay[data.type][data.extraType] = data.value
	end
	if LocalPlayer.state.isNaked then
		if data.extraType == "opacity" then
			nakedPed.customization.overlay[data.type].opacity = data.value
		elseif data.extraType == "index" then
			nakedPed.customization.overlay[data.type].index = data.value
			nakedPed.customization.overlay[data.type].disabled = false
		else
			nakedPed.customization.overlay[data.type][data.extraType] = data.value
		end
		exports['st_appearance']:ApplyToPed(nakedPed)
	else
		exports['st_appearance']:ApplyToPed(LocalPed)
	end
end)

RegisterNUICallback("SetPedComponentVariation", function(data, cb)
	cb("OK")
	if not IsPedReady() then return end
	if not LocalPed.customization.components[data.name] then return end
	LocalPed.customization.components[data.name][data.type] = data.value
	if not LocalPlayer.state.isNaked then
		exports['st_appearance']:ApplyToPed(LocalPed)
	else
		if data.name == "hair" then
			nakedPed.customization.components[data.name][data.type] = data.value
			exports['st_appearance']:ApplyToPed(nakedPed)
		end
	end
end)

RegisterNUICallback("SetPedPropIndex", function(data, cb)
	cb("OK")
	if not IsPedReady() then return end
	if not LocalPed.customization.props[data.name] then return end
	LocalPed.customization.props[data.name][data.type] = data.value
	if data.type == "drawableId" then
		LocalPed.customization.props[data.name].disabled = (data.value < 0)
	end
	if not LocalPlayer.state.isNaked then
		exports['st_appearance']:ApplyToPed(LocalPed)
	end
end)

RegisterNUICallback("SetPedHairColor", function(data, cb)
	cb("OK")
	if not IsPedReady() then return end
	LocalPed.customization.colors[data.name][data.type].index = data.value
	if LocalPlayer.state.isNaked then
		nakedPed.customization.colors[data.name][data.type].index = data.value
		exports['st_appearance']:ApplyToPed(nakedPed)
	else
		exports['st_appearance']:ApplyToPed(LocalPed)
	end
end)

RegisterNUICallback("SetPedHairOverlay", function(data, cb)
	cb("OK")
	if not IsPedReady() then return end
	LocalPed.customization.hairOverlay = data.value
	if LocalPlayer.state.isNaked then
		nakedPed.customization.hairOverlay = data.value
		exports['st_appearance']:ApplyToPed(nakedPed)
	else
		exports['st_appearance']:ApplyToPed(LocalPed)
	end
end)

RegisterNUICallback("SetPedEyeColor", function(data, cb)
	cb("OK")
	if not IsPedReady() then return end
	LocalPed.customization.eyeColor = data.value
	if LocalPlayer.state.isNaked then
		nakedPed.customization.eyeColor = data.value
		exports['st_appearance']:ApplyToPed(nakedPed)
	else
		exports['st_appearance']:ApplyToPed(LocalPed)
	end
end)

RegisterNUICallback("AddPedTattoo", function(data, cb)
	cb("OK")
	if not IsPedReady() then return end
	table.insert(LocalPed.customization.tattoos, {
		Name = "",
		Collection = "",
		Hash = "",
		Zone = data.type,
	})
	if LocalPlayer.state.isNaked then
		table.insert(nakedPed.customization.tattoos, {
			Name = "",
			Collection = "",
			Hash = "",
			Zone = data.type,
		})
		exports['st_appearance']:ApplyToPed(nakedPed, true)
	else
		exports['st_appearance']:ApplyToPed(LocalPed, true)
	end
end)

RegisterNUICallback("RemovePedTattoo", function(data, cb)
	cb("OK")
	if not IsPedReady() then return end
	table.remove(LocalPed.customization.tattoos, data.index + 1)
	if LocalPlayer.state.isNaked then
		table.remove(nakedPed.customization.tattoos, data.index + 1)
		exports['st_appearance']:ApplyToPed(nakedPed, true)
	else
		exports['st_appearance']:ApplyToPed(LocalPed, true)
	end
end)

RegisterNUICallback("SetPedTattoo", function(data, cb)
	cb("OK")
	if not IsPedReady() then return end
	LocalPed.customization.tattoos[data.index + 1] = data.data
	if LocalPlayer.state.isNaked then
		nakedPed.customization.tattoos[data.index + 1] = data.data
		exports['st_appearance']:ApplyToPed(nakedPed, true)
	else
		exports['st_appearance']:ApplyToPed(LocalPed, true)
	end
end)

RegisterNUICallback("ImportOutfitCode", function(data, cb)
	if not IsPedReady() then cb(false) return end

	if data.components then
		LocalPed.customization.components = data.components
	end
	if data.props then
		LocalPed.customization.props = data.props
	end
	if data.colors then
		LocalPed.customization.colors = data.colors
	end
	if data.overlay then
		LocalPed.customization.overlay = data.overlay
	end

	if LocalPlayer.state.isNaked then
		nakedPed = deepcopy(LocalPed)
		exports['st_appearance']:ApplyToPed(nakedPed)
	else
		exports['st_appearance']:ApplyToPed(LocalPed)
	end

	SendNUIMessage({
		type = "SET_PED_DATA",
		data = {
			ped = LocalPed,
			gender = LocalPlayer.state.Character:GetData("Gender"),
		},
	})

	cb(true)
end)

RegisterNUICallback("GetNumHairColors", function(data, cb)
	cb("OK")
	SendNUIMessage({
		type = "SET_HAIR_COLORS_MAX",
		data = {
			max = GetNumHairColors(),
			maxOverlays = #Config.CustomHairOverlays
		},
	})
end)

RegisterNUICallback("GetPedHairRgbColor", function(data, cb)
	cb("OK")
	local red, green, blue = GetPedHairRgbColor(data.colorId)
	SendNUIMessage({
		type = "SET_HAIR_COLOR_RGB",
		data = {
			type = data.type,
			name = data.name,
			rgb = "rgb(" .. red .. ", " .. green .. ", " .. blue .. ")",
		},
	})
end)

RegisterNUICallback("GetNumberOfPedDrawableVariations", function(data, cb)
	cb("OK")

	local gender = LocalPlayer.state.Character:GetData("Gender")
	local comps = {}
	for i = 0, GetNumberOfPedDrawableVariations(PlayerPedId(), data.componentId) do
		if
			GlobalState["ClothingStoreHidden"].components[data.componentId] == nil
			or GlobalState["ClothingStoreHidden"].props[data.componentId][gender] == nil
			or not GlobalState["ClothingStoreHidden"].components[data.componentId][gender][tostring(i)]
		then
			table.insert(comps, i)
		end
	end
	SendNUIMessage({
		type = "SET_MAX_DRAWABLE",
		data = {
			id = data.componentId,
			type = "components",
			max = comps,
		},
	})
end)

RegisterNUICallback("GetNumberOfPedTextureVariations", function(data, cb)
	cb("OK")
	SendNUIMessage({
		type = "SET_MAX_TEXTURE",
		data = {
			id = data.componentId,
			textureId = data.textureId,
			type = "components",
			max = GetNumberOfPedTextureVariations(PlayerPedId(), data.componentId, data.drawableId),
		},
	})
end)

RegisterNUICallback("GetNumberOfPedPropDrawableVariations", function(data, cb)
	cb("OK")

	local gender = LocalPlayer.state.Character:GetData("Gender")
	local comps = {}
	for i = 0, GetNumberOfPedPropDrawableVariations(PlayerPedId(), data.componentId) do
		if
			GlobalState["ClothingStoreHidden"].components[data.componentId] == nil
			or GlobalState["ClothingStoreHidden"].props[data.componentId][gender] == nil
			or not GlobalState["ClothingStoreHidden"].components[data.componentId][gender][tostring(i)]
		then
			table.insert(comps, i)
		end
	end
	SendNUIMessage({
		type = "SET_MAX_DRAWABLE",
		data = {
			id = data.componentId,
			type = "props",
			max = comps,
		},
	})
end)

RegisterNUICallback("GetNumberOfPedPropTextureVariations", function(data, cb)
	cb("OK")
	SendNUIMessage({
		type = "SET_MAX_TEXTURE",
		data = {
			id = data.componentId,
			textureId = data.textureId,
			type = "props",
			max = GetNumberOfPedPropTextureVariations(PlayerPedId(), data.componentId, data.drawableId),
		},
	})
end)

-- Batch callback: returns all component + prop drawable counts in one message
-- so React only re-renders once instead of once per component (20+ renders → 1)
RegisterNUICallback("GetAllDrawableVariations", function(data, cb)
	cb("OK")
	local gender = LocalPlayer.state.Character:GetData("Gender")
	local playerPed = PlayerPedId()
	local hidden = GlobalState["ClothingStoreHidden"]

	local components = {}
	for _, compId in ipairs(data.componentIds) do
		local comps = {}
		for i = 0, GetNumberOfPedDrawableVariations(playerPed, compId) do
			if
				hidden.components[compId] == nil
				or hidden.props[compId][gender] == nil
				or not hidden.components[compId][gender][tostring(i)]
			then
				table.insert(comps, i)
			end
		end
		components[tostring(compId)] = comps
	end

	local props = {}
	for _, propId in ipairs(data.propIds) do
		local comps = {}
		for i = 0, GetNumberOfPedPropDrawableVariations(playerPed, propId) do
			if
				hidden.components[propId] == nil
				or hidden.props[propId][gender] == nil
				or not hidden.props[propId][gender][tostring(i)]
			then
				table.insert(comps, i)
			end
		end
		props[tostring(propId)] = comps
	end

	SendNUIMessage({
		type = "SET_ALL_DRAWABLES",
		data = {
			components = components,
			props = props,
			hairColorsMax = GetNumHairColors(),
			hairOverlaysMax = #Config.CustomHairOverlays,
		},
	})
end)

---@type table<string, number>
local COMP_MAP = {
	torso2 = 11, torso = 3, undershirt = 8, leg = 4,
	shoes = 6, bag = 5, badge = 10, kevlar = 9,
	mask = 1, accessory = 7,
}

---@type table<string, number>
local PROP_MAP = {
	hat = 0, glass = 1, ear = 2, watch = 6, bracelet = 7,
}

RegisterNUICallback("RandomizeOutfit", function(data, cb)
	cb("OK")
	if not IsPedReady() then return end

	local playerPed = PlayerPedId()
	local gender = LocalPlayer.state.Character:GetData("Gender")
	local hidden = GlobalState["ClothingStoreHidden"]

	local lockedComps = {}
	for _, name in ipairs(data.lockedComponents or {}) do lockedComps[name] = true end
	local lockedProps = {}
	for _, name in ipairs(data.lockedProps or {}) do lockedProps[name] = true end

	-- Randomize unlocked components
	for name, compId in pairs(COMP_MAP) do
		if not lockedComps[name] then
			local valid = {}
			for i = 0, GetNumberOfPedDrawableVariations(playerPed, compId) - 1 do
				if
					hidden.components[compId] == nil
					or hidden.components[compId][gender] == nil
					or not hidden.components[compId][gender][tostring(i)]
				then
					table.insert(valid, i)
				end
			end
			if #valid > 0 then
				local drawId = valid[GetRandomIntInRange(1, #valid + 1)]
				local maxTex = GetNumberOfPedTextureVariations(playerPed, compId, drawId)
				local texId = maxTex > 0 and GetRandomIntInRange(0, maxTex) or 0
				LocalPed.customization.components[name].drawableId = drawId
				LocalPed.customization.components[name].textureId = texId
			end
		end
	end

	-- Randomize unlocked props (-1 = none is a valid option)
	for name, propId in pairs(PROP_MAP) do
		if not lockedProps[name] then
			local valid = { -1 }
			for i = 0, GetNumberOfPedPropDrawableVariations(playerPed, propId) - 1 do
				if
					hidden.props[propId] == nil
					or hidden.props[propId][gender] == nil
					or not hidden.props[propId][gender][tostring(i)]
				then
					table.insert(valid, i)
				end
			end
			local drawId = valid[GetRandomIntInRange(1, #valid + 1)]
			local texId = 0
			if drawId >= 0 then
				local maxTex = GetNumberOfPedPropTextureVariations(playerPed, propId, drawId)
				texId = maxTex > 0 and GetRandomIntInRange(0, maxTex) or 0
			end
			LocalPed.customization.props[name].drawableId = drawId
			LocalPed.customization.props[name].textureId = texId
			LocalPed.customization.props[name].disabled = (drawId < 0)
		end
	end

	if LocalPlayer.state.isNaked then
		nakedPed = deepcopy(LocalPed)
		exports['st_appearance']:ApplyToPed(nakedPed)
	else
		exports['st_appearance']:ApplyToPed(LocalPed)
	end

	SendNUIMessage({
		type = "SET_RANDOMIZED_PED",
		data = {
			components = LocalPed.customization.components,
			props = LocalPed.customization.props,
		},
	})
end)

RegisterNUICallback("PlayAnimation", function(data, cb)
	cb("OK")
	local ped = PlayerPedId()
	ClearPedTasks(ped)

	if data.type == "scenario" then
		_playingIdle = true
		TaskStartScenarioInPlace(ped, data.scenario, 0, false)
	elseif data.type == "anim" then
		_playingIdle = true
		local dict = data.dict
		RequestAnimDict(dict)
		local c = 0
		while not HasAnimDictLoaded(dict) do
			Wait(1)
			c = c + 1
			if c > 2000 then return end
		end
		TaskPlayAnim(ped, dict, data.clip, 8.0, -8.0, -1, 1, 0, false, false, false)
	end
end)

RegisterNUICallback("StopAnimation", function(data, cb)
	cb("OK")
	ClearPedTasks(PlayerPedId())
	_playingIdle = false
end)
