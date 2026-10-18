AddEventHandler('onResourceStart', function(resource)
	if resource == GetCurrentResourceName() then
		Wait(1000)
		RegisterCallbacks()
		RegisterMiddleware()
		RegisterChatCommands()
		RegisterItems()
	end
end)

function RegisterMiddleware()
	exports['strata']:MiddlewareAdd("Characters:Spawning", function(source)
		local char = Strata.User.Find(source)
		if char:GetData("Animations") == nil then
			char:SetData("Animations", { walk = "default", expression = "default", emoteBinds = {} })
		end
	end, 10)
end

function RegisterChatCommands()
	exports["st_chat"]:RegisterCommand("e", function(source, args, rawCommand)
		local emote = args[1]
		if emote == "c" or emote == "cancel" then
			TriggerClientEvent("Animations:Client:CharacterCancelEmote", source)
		else
			TriggerClientEvent("Animations:Client:CharacterDoAnEmote", source, emote)
		end
	end, {
		help = "Do An Emote or Dance",
		params = { {
			name = "Emote",
			help = "Name of The Emote",
		} },
	})
	exports["st_chat"]:RegisterCommand("emotes", function(source, args, rawCommand)
		TriggerClientEvent("Animations:Client:OpenMainEmoteMenu", source)
	end, {
		help = "Open Emote Menu",
	})
	exports["st_chat"]:RegisterCommand("emotebinds", function(source, args, rawCommand)
		TriggerClientEvent("Animations:Client:OpenEmoteBinds", source)
	end, {
		help = "Edit Emote Binds",
	})
	exports["st_chat"]:RegisterCommand("walks", function(source, args, rawCommand)
		TriggerClientEvent("Animations:Client:OpenWalksMenu", source)
	end, {
		help = "Change Walk Style",
	})
	exports["st_chat"]:RegisterCommand("face", function(source, args, rawCommand)
		TriggerClientEvent("Animations:Client:OpenExpressionsMenu", source)
	end, {
		help = "Change Facial Expression",
	})
	exports["st_chat"]:RegisterCommand("selfie", function(source, args, rawCommand)
		if
			not Player(source).state.isCuffed
			and not Player(source).state.isDead
			and (function()
				local phoneItem = exports.st_inventory:getUtilitySlotItem(source, 8)
				return phoneItem ~= nil and phoneItem.metadata.durability > 0
			end)()
		then
			TriggerClientEvent("Animations:Client:Selfie", source)
		else
			exports['st_ui']:Notification(source, "error", "You do not have a phone.")
		end
	end, {
		help = "Open Selfie Mode",
	})
end

function RegisterCallbacks()
	exports["strata"]:RegisterServerCallback("Animations:UpdatePedFeatures", function(source, data, cb)
		local char = Strata.User.Find(source)
		if char then
			cb(exports['st_emotes']:PedFeaturesUpdateFeatureInfo(char, data.type, data.data))
		else
			cb(false)
		end
	end)

	exports["strata"]:RegisterServerCallback("Animations:UpdateEmoteBinds", function(source, data, cb)
		local char = Strata.User.Find(source)
		if char then
			cb(exports['st_emotes']:EmoteBindsUpdate(char, data), data)
		else
			cb(false)
		end
	end)
end

exports("PedFeaturesUpdateFeatureInfo", function(char, type, data, cb)
	if type == "walk" then
		local currentData = char:GetData("Animations")
		char:SetData(
			"Animations",
			{ walk = data, expression = currentData.expression, emoteBinds = currentData.emoteBinds }
		)
		return true
	elseif type == "expression" then
		local currentData = char:GetData("Animations")
		char:SetData(
			"Animations",
			{ walk = currentData.walk, expression = data, emoteBinds = currentData.emoteBinds }
		)
		return true
	end
	return false
end)

exports("EmoteBindsUpdate", function(char, data, cb)
	local currentData = char:GetData("Animations")
	char:SetData(
		"Animations",
		{ walk = currentData.walk, expression = currentData.expression, emoteBinds = data }
	)
	return true
end)

RegisterServerEvent("Animations:Server:ClearAttached", function(propsToDelete)
	local src = source
	local ped = GetPlayerPed(src)

	if ped then
		for k, v in ipairs(GetAllObjects()) do
			if DoesEntityExist(v) and GetEntityAttachedTo(v) == ped and propsToDelete[GetEntityModel(v)] then
				DeleteEntity(v)
			end
		end
	end
end)

local pendingSend = false

RegisterNetEvent("Animations:Server:UploadSelfie", function(data, callback)
	local source = source
	local apiUrl = data.api
	local token = data.token

	exports["st_utils"]:remoteUpload(
		source,
		apiUrl,
		{
			encoding = "webp",
			quality = 0.8,
			headers = {
				Authorization = token
			},
			formField = "image"
		},
		function(response)
			local image = json.decode(response)
			callback(json.encode({ url = image.url }))
		end,
		"blob"
	)
end)

RegisterServerEvent("Selfie:CaptureSelfie", function()
	local src = source
	local char = Strata.User.Find(src)
	if char then
		if pendingSend then
			exports['st_ui']:Notification(src, "warning",
				"Please wait while current photo is uploading", 2000)
			return
		end
		pendingSend = true
		exports['st_ui']:Notification(src, "info", "Prepping Photo Upload", 2000)

		exports["strata"]:ClientCallback(src, "Selfie:Client:UploadPhoto", {
			api = tostring(GetConvar("phone_selfie_webhook", "")),
			token = tostring(GetConvar("phone_selfie_token", "")),
		}, function(ret)
			if ret then
				local _data = {
					image_url = json.decode(ret).url,
				}
				local retval = exports['st_phone']:PhotosCreate(src, _data)
				if retval then
					pendingSend = false
					TriggerClientEvent("Selfie:DoCloseSelfie", src)
					exports['st_ui']:Notification(src, "success", "Photo uploaded successfully!",
						2000)
				else
					pendingSend = false
					TriggerClientEvent("Selfie:DoCloseSelfie", src)
					exports['st_ui']:Notification(src, "error", "Error uploading photo!", 2000)
				end
			else
				pendingSend = false
				TriggerClientEvent("Selfie:DoCloseSelfie", src)
				exports['st_ui']:Notification(src, "error", "Error uploading photo!", 2000)
				print("^1ERROR: " .. data)
			end
		end)
	end
end)
