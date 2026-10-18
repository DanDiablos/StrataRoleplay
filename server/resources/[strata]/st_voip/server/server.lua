voiceData = {}
radioData = {}
callData = {}

local mappedChannels = {}

function firstFreeChannel()
	for i = 1, 2048 do
		if not mappedChannels[i] then
			return i
		end
	end

	return 0
end

function GetDefaultPlayerVOIPData(source)
	return {
		Radio = 0,
		Call = 0,
		LastRadio = 0,
		LastCall = 0,
	}
end

AddEventHandler('onResourceStart', function(resource)
	if resource == GetCurrentResourceName() then
		Wait(1000)
		RegisterMiddleware()
		RegisterItems()

		local mAddress = GetConvar("ext_mumble_address", "")
		if mAddress ~= "" then
			GlobalState.MumbleAddress = mAddress
			GlobalState.MumblePort = GetConvarInt("ext_mumble_port", 64738)
		end

		--RegisterChatCommands()
	end
end)

function RegisterItems()
	local function resolvePlayerSource(id)
		if type(id) == 'number' and GetPlayerName(id) then
			return id
		end

		local sid = tonumber(id)
		if sid then
			local char = Strata.User.BySID(sid)
			if char then
				local src = char:GetData('Source')
				if src and GetPlayerName(src) then
					return src
				end
			end
		end

		return nil
	end

	exports.st_inventory:RegisterUse("radio", "VOIP", function(source, slot, itemData)
		local target = resolvePlayerSource(source)
		if target then
			TriggerClientEvent("Radio:Client:OpenUI", target, 1)
		end
	end)

	exports.st_inventory:RegisterUse("radio_shitty", "VOIP", function(source, slot, itemData)
		local target = resolvePlayerSource(source)
		if target then
			TriggerClientEvent("Radio:Client:OpenUI", target, 3)
		end
	end)

	exports.st_inventory:RegisterUse("radio_extendo", "VOIP", function(source, slot, itemData)
		local target = resolvePlayerSource(source)
		if target then
			TriggerClientEvent("Radio:Client:OpenUI", target, 2)
		end
	end)

	exports.st_inventory:RegisterUse("megaphone", "VOIP", function(source, slot, itemData)
		local target = resolvePlayerSource(source)
		if target then
			TriggerClientEvent("VOIP:Client:Megaphone:Use", target, false)
		end
	end)
end

RegisterNetEvent('st_inventory:ready', function()
	if GetResourceState(GetCurrentResourceName()) == 'started' then
		RegisterItems()
	end
end)

function RegisterMiddleware()
	exports['strata']:MiddlewareAdd("Characters:Spawning", function(source)
		exports["st_voip"]:AddPlayer(source)
	end, 3)
end

exports("AddPlayer", function(source)
	if not voiceData[source] then
		voiceData[source] = GetDefaultPlayerVOIPData()

		local plyState = Player(source).state

		if plyState then
			local chan = firstFreeChannel()
			if chan > 0 then
				MumbleCreateChannel(chan)
					
				mappedChannels[chan] = source
				plyState:set("voiceChannel", chan, true)
			end
		end
	end
end)

exports("RemovePlayer", function(source)
	if voiceData[source] then
		local plyData = voiceData[source]

		if plyData.Radio > 0 then
			exports["st_voip"]:RadioSetChannel(source, 0)
		end

		if plyData.Call > 0 then
			exports["st_voip"]:SetChannel(source, 0)
		end

		voiceData[source] = nil
	end

	local aChannel = Player(source).state.voiceChannel
	if aChannel then
		mappedChannels[aChannel] = nil
	end
end)

AddEventHandler("Characters:Server:PlayerLoggedOut", function(source)
	exports["st_voip"]:RemovePlayer(source)
end)
