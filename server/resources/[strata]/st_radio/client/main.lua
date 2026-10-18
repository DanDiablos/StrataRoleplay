local radioOpen = false
_radioProp = 0

HAS_RADIO = false

RADIO_FREQUENCY_LAST = 0
RADIO_POWER = false
RADIO_FREQUENCY = 0
RADIO_FREQUENCY_NAME = ""
RADIO_VOLUME = 100
RADIO_CLICKS_VOLUME = 100
RADIO_CHANNEL_MEMBERS = {}
RADIO_TALKING_MEMBERS = {}
RADIO_CHANNEL_NAME = ""
RADIO_MEMBER_TALK_STATES = {}
RADIO_MEMBERS_ANCHOR = "right"
RADIO_MEMBERS_OFFSET_X = 1.75
RADIO_MEMBERS_OFFSET_Y = 38.0
RADIO_MEMBERS_EDIT_MODE = false

local function clamp(value, min, max)
	if value < min then
		return min
	end

	if value > max then
		return max
	end

	return value
end

local function saveMembersPositionSettings()
	SetResourceKvp("strata_radio_members_anchor", tostring(RADIO_MEMBERS_ANCHOR or "right"))
	SetResourceKvpFloat("strata_radio_members_offset_x", tonumber(RADIO_MEMBERS_OFFSET_X) or 1.75)
	SetResourceKvpFloat("strata_radio_members_offset_y", tonumber(RADIO_MEMBERS_OFFSET_Y) or 38.0)
end

local function loadMembersPositionSettings()
	local anchor = GetResourceKvpString("strata_radio_members_anchor")
	if anchor == "left" or anchor == "right" then
		RADIO_MEMBERS_ANCHOR = anchor
	end

	local savedX = GetResourceKvpFloat("strata_radio_members_offset_x")
	if savedX and savedX ~= 0.0 then
		RADIO_MEMBERS_OFFSET_X = clamp(savedX, 0.0, 40.0)
	end

	local savedY = GetResourceKvpFloat("strata_radio_members_offset_y")
	if savedY and savedY ~= 0.0 then
		RADIO_MEMBERS_OFFSET_Y = clamp(savedY, 5.0, 95.0)
	end
end

-- Lowest Level Gets Used
local radioLevels = {
	RADIO_ENCRYPTED = 1,
	RADIO_EXTENDO = 2,
	RADIO_CIV = 3,
}

local radioNames = {
	"Encrypted Radio",
	"B0085 Radio",
	"P6900 Radio",
}

local radioChannelCycle = false

AddEventHandler('onClientResourceStart', function(resource)
	if resource == GetCurrentResourceName() then
		loadMembersPositionSettings()
		Wait(1000)
		exports["st_binds"]:Add("voip_radio_power", "", "keyboard", "Voice - Radio - Toggle Power On/Off",
			function()
			if LocalPlayer.state.loggedIn and HAS_RADIO and not radioChannelCycle and not LocalPlayer.state.isCuffed and not LocalPlayer.state.isHardCuffed and not LocalPlayer.state.isDead then
					radioChannelCycle = true
					ToggleRadioPower(false)
					SetTimeout(1000, function()
						radioChannelCycle = false
					end)
				end
			end)

		exports["st_binds"]:Add("voip_radio_open", "", "keyboard", "Voice - Radio - Open Radio", function()
			if LocalPlayer.state.loggedIn and HAS_RADIO and not LocalPlayer.state.doingAction and not LocalPlayer.state.isCuffed and not LocalPlayer.state.isHardCuffed and not LocalPlayer.state.isDead then
				if CanUseRadio(HAS_RADIO) then
					OpenRadio()
				end
			end
		end)

		exports["st_binds"]:Add("voip_radio_vol_down", "", "keyboard", "Voice - Radio - Volume Down", function()
			if LocalPlayer.state.loggedIn and HAS_RADIO and RADIO_POWER then
				RadioVolumeDown(true)
			end
		end)

		exports["st_binds"]:Add("voip_radio_vol_up", "", "keyboard", "Voice - Radio - Volume Up", function()
			if LocalPlayer.state.loggedIn and HAS_RADIO and RADIO_POWER then
				RadioVolumeUp(true)
			end
		end)

		exports["st_binds"]:Add("voip_radio_next", "", "keyboard", "Voice - Radio - Channel Next", function()
			if LocalPlayer.state.loggedIn and HAS_RADIO and RADIO_POWER then
				CycleRadioChannel(true)
			end
		end)

		exports["st_binds"]:Add("voip_radio_prev", "", "keyboard", "Voice - Radio - Channel Prev.", function()
			if LocalPlayer.state.loggedIn and HAS_RADIO and RADIO_POWER then
				CycleRadioChannel(false)
			end
		end)
	end
end)

RegisterCommand("radio", function(source)
	if not HAS_RADIO then
		exports["st_chat"]:SendSystemSingle(source, "You do not have a usable radio.")
		return
	end

	if not radioOpen then
		OpenRadio()
	end

	RADIO_MEMBERS_EDIT_MODE = not RADIO_MEMBERS_EDIT_MODE
	SendUpdates()

	if RADIO_MEMBERS_EDIT_MODE then
		exports["st_chat"]:SendSystemSingle(source,
			"Radio list position edit mode enabled. Drag the list, then press ESC to exit edit mode.")
	else
		exports["st_chat"]:SendSystemSingle(source, "Radio list position edit mode disabled.")
	end
end, false)

-- Radio item use callbacks are registered by st_voip/server/server.lua
-- When items are used, TriggerClientEvent sends "Radio:Client:OpenUI" event to this client

RegisterNetEvent("Characters:Client:Spawn")
AddEventHandler("Characters:Client:Spawn", function()
	RADIO_FREQUENCY_LAST = 0
	RADIO_POWER = false
	RADIO_FREQUENCY = 0
	RADIO_FREQUENCY_NAME = ""

	RADIO_VOLUME = exports["st_voip"]:GetRadioVolume()
	RADIO_CLICKS_VOLUME = exports["st_voip"]:GetRadioClickVolume()
	RADIO_CHANNEL_MEMBERS = {}
	RADIO_TALKING_MEMBERS = {}
	RADIO_CHANNEL_NAME = ""
	RADIO_MEMBER_TALK_STATES = {}
	RADIO_MEMBERS_EDIT_MODE = false
	HAS_RADIO = false
	LocalPlayer.state.radioType = false

	exports['st_ui']:RegisterStatus("radio-freq", 0, 1000, "walkie-talkie", "#4056b3", false, false, {
		hideZero = true,
		force = "numbers",
	})

	Wait(1000)

	HAS_RADIO = CheckCharacterHasRadio()
	LocalPlayer.state.radioType = HAS_RADIO
	SendUpdates()
end)

RegisterNetEvent("Characters:Client:Logout", function()
	RADIO_MEMBERS_EDIT_MODE = false
	CloseRadio()
	TriggerEvent("Status:Client:Update", "radio-freq", 0)
	SendNUIMessage({
		type = "UPDATE_DATA",
		data = {
			frequency = 0,
			frequencyName = "",
			channelName = "",
			power = false,
			volume = 100,
			members = {},
			talkingMembers = {},
		},
	})
end)

local function RefreshTalkingMembers()
	if not RADIO_POWER or RADIO_FREQUENCY <= 0 then
		if #RADIO_TALKING_MEMBERS > 0 then
			RADIO_TALKING_MEMBERS = {}
			SendUpdates()
		end
		return
	end

	local talkingMembers = {}

	for _, member in ipairs(RADIO_CHANNEL_MEMBERS) do
		local stateId = tonumber(member.id)
		if stateId and RADIO_MEMBER_TALK_STATES[stateId] then
			talkingMembers[#talkingMembers + 1] = stateId
		end
	end

	table.sort(talkingMembers)
	local newHash = table.concat(talkingMembers, ",")
	local oldHash = table.concat(RADIO_TALKING_MEMBERS or {}, ",")

	if newHash ~= oldHash then
		RADIO_TALKING_MEMBERS = talkingMembers
		SendUpdates()
	end
end

RegisterNetEvent("Radio:Client:MemberListUpdate", function(payload)
	local payloadTalkingMembers = nil

	if type(payload) == "table" and payload.members then
		RADIO_CHANNEL_MEMBERS = payload.members or {}
		RADIO_CHANNEL_NAME = payload.channelName or ""
		payloadTalkingMembers = payload.talkingMembers
	else
		RADIO_CHANNEL_MEMBERS = payload or {}
		RADIO_CHANNEL_NAME = ""
	end

	RADIO_MEMBER_TALK_STATES = {}
	if type(payloadTalkingMembers) == "table" then
		for _, id in ipairs(payloadTalkingMembers) do
			local stateId = tonumber(id)
			if stateId then
				RADIO_MEMBER_TALK_STATES[stateId] = true
			end
		end
	end

	RefreshTalkingMembers()
	SendUpdates()
end)

RegisterNetEvent("Radio:Client:MemberTalkState", function(targetSource, isTalking)
	local stateId = tonumber(targetSource)
	if not stateId then
		return
	end

	RADIO_MEMBER_TALK_STATES[stateId] = isTalking == true
	RefreshTalkingMembers()
end)

RegisterNetEvent('VOIP:Radio:Client:SetPlayerTalkState', function(targetSource, isTalking)
	local stateId = tonumber(targetSource)
	if not stateId then
		return
	end

	RADIO_MEMBER_TALK_STATES[stateId] = isTalking == true
	RefreshTalkingMembers()
end)

RegisterNetEvent("Radio:Client:OpenUI", function(rType)
	if CanUseRadio(rType) then
		if HAS_RADIO ~= rType then
			HAS_RADIO = rType
			LocalPlayer.state.radioType = HAS_RADIO
			SendUpdates()
		end

		OpenRadio()
	end
end)

function OpenRadio()
	if radioOpen then
		return
	end

	radioOpen = true
	SetNuiFocus(true, true)
	SendNUIMessage({
		type = "APP_SHOW",
	})

	TriggerEvent('st_inventory:disarm', LocalPlayer.state.ped, true)

	CreateThread(function()
		local playerPed = PlayerPedId()
		Strata.World.StageAnim("cellphone@")
		Strata.World.StageModel(`prop_cs_hand_radio`)

		_radioProp = CreateObject(`prop_cs_hand_radio`, GetEntityCoords(playerPed), 1, 1, 0)
		AttachEntityToEntity(
			_radioProp,
			playerPed,
			GetPedBoneIndex(playerPed, 57005),
			0.14,
			0.01,
			-0.02,
			110.0,
			120.0,
			-15.0,
			1,
			0,
			0,
			0,
			2,
			1
		)

		while radioOpen do
			if not IsEntityPlayingAnim(playerPed, "cellphone@", "cellphone_text_read_base", 3) then
				TaskPlayAnim(
					playerPed,
					"cellphone@",
					"cellphone_text_read_base",
					3.0,
					3.0,
					-1,
					49,
					0,
					false,
					false,
					false
				)
			end
			Wait(250)
		end

		StopAnimTask(playerPed, "cellphone@", "cellphone_text_read_base", 3.0)
		DeleteEntity(_radioProp)
	end)
end

function CloseRadio()
	if not radioOpen then
		return
	end
	RADIO_MEMBERS_EDIT_MODE = false
	SetNuiFocus(false, false)
	SendNUIMessage({
		type = "APP_HIDE",
	})
	radioOpen = false

	DeleteEntity(_radioProp)
end

function SendUpdates()
	SendNUIMessage({
		type = "UPDATE_DATA",
		data = {
			frequency = RADIO_FREQUENCY,
			frequencyName = RADIO_FREQUENCY_NAME,
			channelName = RADIO_CHANNEL_NAME,
			power = RADIO_POWER,
			volume = Strata.Kit.Round(RADIO_VOLUME, 0),
			type = HAS_RADIO,
			typeName = radioNames[HAS_RADIO] or "Radio",
			members = RADIO_CHANNEL_MEMBERS,
			talkingMembers = RADIO_TALKING_MEMBERS,
			membersAnchor = RADIO_MEMBERS_ANCHOR,
			membersOffsetX = RADIO_MEMBERS_OFFSET_X,
			membersOffsetY = RADIO_MEMBERS_OFFSET_Y,
			membersListEditMode = RADIO_MEMBERS_EDIT_MODE,
		},
	})
end

RegisterNUICallback("Close", function(data, cb)
	CloseRadio()
	cb("ok")
end)

RegisterNUICallback("SetMembersListEditMode", function(data, cb)
	RADIO_MEMBERS_EDIT_MODE = data and data.enabled == true
	SendUpdates()
	cb("ok")
end)

RegisterNUICallback("SetMembersListPosition", function(data, cb)
	if type(data) == "table" then
		local x = tonumber(data.x)
		local y = tonumber(data.y)
		local anchor = data.anchor and string.lower(tostring(data.anchor)) or nil

		if x then
			RADIO_MEMBERS_OFFSET_X = clamp(x, 0.0, 40.0)
		end

		if y then
			RADIO_MEMBERS_OFFSET_Y = clamp(y, 5.0, 95.0)
		end

		if anchor == "left" or anchor == "right" then
			RADIO_MEMBERS_ANCHOR = anchor
		end

		saveMembersPositionSettings()
		SendUpdates()
	end

	cb("ok")
end)

RegisterNUICallback("TogglePower", function(data, cb)
	if HAS_RADIO then
		ToggleRadioPower(true)
	end
	cb("ok")
end)

function ToggleRadioPower(fromUI)
	if RADIO_POWER then
		RADIO_POWER = false
		RADIO_CHANNEL_MEMBERS = {}
		RADIO_TALKING_MEMBERS = {}
		RADIO_CHANNEL_NAME = ""
		RADIO_MEMBER_TALK_STATES = {}
		SetCharacterRadioFrequency(0)
		TriggerEvent("EmergencyAlerts:Client:RadioChannelChange", "0")
		TriggerEvent("Status:Client:Update", "radio-freq", 0)
		if not fromUI then
			exports["st_ui"]:Notification("error", "Radio Turned Off", 2500)
		end
		exports["st_sound"]:PlayOne("radiooff.ogg", 0.05 * (RADIO_CLICKS_VOLUME / 100))
		LocalPlayer.state:set("onRadio", false, true)
	else
		if not fromUI then
			exports["st_ui"]:Notification("success", "Radio Turned On", 2500)
		end
		RADIO_POWER = true
		if RADIO_FREQUENCY_LAST and RADIO_FREQUENCY_LAST > 0 then
			SetCharacterRadioFrequency(RADIO_FREQUENCY_LAST, not fromUI)
			LocalPlayer.state:set("onRadio", tostring(RADIO_FREQUENCY_LAST), true)
		end
		exports["st_sound"]:PlayOne("radioon.ogg", 0.05 * (RADIO_CLICKS_VOLUME / 100))
	end

	SendUpdates()
end

function SetCharacterRadioFrequency(freq, notifyChange)
	if not freq then
		freq = 0
	end
	if freq ~= RADIO_FREQUENCY then
		local canUseFrequency = freq == 0
		local frequencyName = false

		if freq > 0 and RADIO_POWER then
			if CanRadioAccessChannel(HAS_RADIO, freq) then
				local access, name = GetHasRadioChannelAuth(freq)
				if access then
					canUseFrequency = true
					frequencyName = name
				else
					canUseFrequency = false
					exports["st_ui"]:Notification("error", "Encrypted Radio Channel")
				end
			else
				exports["st_ui"]:Notification("error", "Out of Range Frequency With This Radio")
				canUseFrequency = false
			end
		end

		if canUseFrequency then
			if freq == 0 then
				RADIO_CHANNEL_MEMBERS = {}
				RADIO_TALKING_MEMBERS = {}
				RADIO_CHANNEL_NAME = ""
				RADIO_MEMBER_TALK_STATES = {}
			end
			RADIO_FREQUENCY = freq

			if RADIO_FREQUENCY and RADIO_FREQUENCY > 0 then
				RADIO_FREQUENCY_LAST = RADIO_FREQUENCY
			end

			RADIO_FREQUENCY_NAME = frequencyName or ""
			TriggerServerEvent("VOIP:Radio:Server:SetChannel", RADIO_FREQUENCY)
			LocalPlayer.state:set("onRadio", tostring(RADIO_FREQUENCY), true)
			SendUpdates()

			local maskRadio = LocalPlayer.state.Character:GetData("HUDConfig").maskRadio or false
			TriggerEvent("EmergencyAlerts:Client:RadioChannelChange", tostring(RADIO_FREQUENCY))
			TriggerEvent("Status:Client:Update", "radio-freq", maskRadio and "???.?" or RADIO_FREQUENCY)

			if notifyChange then
				exports["st_sound"]:PlayOne("radioclick.ogg", 0.05 * (RADIO_CLICKS_VOLUME / 100))
				if frequencyName then
					exports["st_ui"]:Notification("info", "Changed Radio Channel to " .. frequencyName)
				else
					exports["st_ui"]:Notification("info", "Changed Radio Channel to #" .. RADIO_FREQUENCY)
				end
			end
		else
			SendUpdates()
		end
	end
end

RegisterNetEvent("Characters:Client:Updated", function(k)
	if k == "HUDConfig" and RADIO_FREQUENCY ~= 0 then
		local maskRadio = LocalPlayer.state.Character:GetData("HUDConfig").maskRadio or false
		TriggerEvent("EmergencyAlerts:Client:RadioChannelChange", tostring(RADIO_FREQUENCY))
		TriggerEvent("Status:Client:Update", "radio-freq", maskRadio and "???.?" or RADIO_FREQUENCY)
	end
end)

AddEventHandler("UI:Client:ResetFinished", function(manual)
	if manual and RADIO_FREQUENCY then
		local maskRadio = LocalPlayer.state.Character:GetData("HUDConfig").maskRadio or false
		TriggerEvent("EmergencyAlerts:Client:RadioChannelChange", tostring(RADIO_FREQUENCY))
		TriggerEvent("Status:Client:Update", "radio-freq", maskRadio and "???.?" or RADIO_FREQUENCY)
	end
end)

function CycleRadioChannel(up)
	if radioChannelCycle then
		return
	end
	radioChannelCycle = true
	local switchingRadioChannel
	if up then
		switchingRadioChannel = RADIO_FREQUENCY + 1
		if switchingRadioChannel > 2000 then
			switchingRadioChannel = false
		end
	else
		switchingRadioChannel = RADIO_FREQUENCY - 1
		if switchingRadioChannel < 0 then
			switchingRadioChannel = false
		end
	end

	if switchingRadioChannel then
		SetCharacterRadioFrequency(switchingRadioChannel, true)
	end

	SetTimeout(1000, function()
		radioChannelCycle = false
	end)
end

RegisterNetEvent("Job:Client:DutyChanged", function(state)
	Wait(1000)
	if LocalPlayer.state.loggedIn then
		CheckRadioChannelAuth()
	end
end)

RegisterNetEvent("Characters:Client:SetData", function()
	Wait(1000)
	if LocalPlayer.state.loggedIn then
		local hasRadio = CheckCharacterHasRadio()
		if HAS_RADIO and not hasRadio then
			HAS_RADIO = false

			if RADIO_POWER then
				RADIO_POWER = false
				SetCharacterRadioFrequency(0)
				exports["st_sound"]:PlayOne("radioclick.ogg", 0.5 * (RADIO_CLICKS_VOLUME / 100))
			end

			CloseRadio()
		elseif not HAS_RADIO and hasRadio then
			HAS_RADIO = hasRadio
		elseif HAS_RADIO and HAS_RADIO ~= hasRadio then
			HAS_RADIO = hasRadio

			SendUpdates()
		end

		LocalPlayer.state.radioType = HAS_RADIO
		CheckRadioChannelAuth()
	end
end)

function GetHasRadioChannelAuth(freq)
	if freq <= 20 then
		if DoesCharacterPassChannelRestrictions(_emergencyRestriction) then
			return true, "Emergency #" .. freq
		end
	elseif freq == 21 then
		if LocalPlayer.state.onDuty == "dgang" then
			return true, "Poggers"
		end
	elseif freq == 22 then
		if exports['st_jobs']:HasJob("blackline") then
			return true, "Mald"
		end
	elseif freq < 100 then
		return false
	else
		return true
	end

	return false
end

function CheckRadioChannelAuth()
	if HAS_RADIO and RADIO_POWER and RADIO_FREQUENCY > 0 then
		if not GetHasRadioChannelAuth(RADIO_FREQUENCY) then
			SetCharacterRadioFrequency(0, true)
		end

		if not CanRadioAccessChannel(HAS_RADIO, RADIO_FREQUENCY) then
			SetCharacterRadioFrequency(0, true)
		end
	end
end

function CheckCharacterHasRadio()
	local character = LocalPlayer.state.Character
	if character then
		local states = character:GetData("States") or {}
		local hasRadio = false
		local lowestLevel = 100
		for k, v in ipairs(states) do
			local isRadio = radioLevels[v]
			if isRadio and isRadio < lowestLevel and CanUseRadio(isRadio) then
				hasRadio = true
				lowestLevel = isRadio
			end
		end

		if hasRadio then
			return lowestLevel
		end
	end

	return false
end

function SetRadioChannelFromInput(input)
	if input ~= RADIO_FREQUENCY and HAS_RADIO then
		exports["st_sound"]:PlayOne("radioclick.ogg", 0.5 * (RADIO_CLICKS_VOLUME / 100))
		SetCharacterRadioFrequency(Strata.Kit.Round(tonumber(input) or 0, 1))
	end
end

RegisterNUICallback("SetChannel", function(data, cb)
	SetRadioChannelFromInput(data.frequency)
	cb("ok")
end)

AddEventHandler("Radio:Client:SetChannelFromInput", function(input)
	SetRadioChannelFromInput(input)
end)

function RadioVolumeUp(notify)
	local newVolume = RADIO_VOLUME + 10
	if newVolume > 200 then
		newVolume = 200
	end

	RADIO_VOLUME = exports["st_voip"]:SetRadioVolume(newVolume)

	if notify then
		exports["st_ui"]:Notification("info", "Radio Volume: " .. math.floor(RADIO_VOLUME) .. "%", 1500)
	end

	SendUpdates()
end

function RadioVolumeDown(notify)
	local newVolume = RADIO_VOLUME - 10
	if newVolume <= 0 then
		newVolume = 0
	end

	RADIO_VOLUME = exports["st_voip"]:SetRadioVolume(newVolume)

	if notify then
		exports["st_ui"]:Notification("info", "Radio Volume: " .. math.floor(RADIO_VOLUME) .. "%", 1500)
	end

	SendUpdates()
end

RegisterNUICallback("VolumeUp", function(data, cb)
	if HAS_RADIO then
		RadioVolumeUp()
	end

	cb("ok")
end)

RegisterNUICallback("VolumeDown", function(data, cb)
	if HAS_RADIO then
		RadioVolumeDown()
	end

	cb("ok")
end)

RegisterNUICallback("ClickVolumeUp", function(data, cb)
	if HAS_RADIO then
		local newVolume = RADIO_CLICKS_VOLUME + 5
		if newVolume > 200 then
			newVolume = 200
		end

		RADIO_CLICKS_VOLUME = exports["st_voip"]:SetRadioClickVolume(newVolume)

		exports["st_sound"]:PlayOne("radioclick.ogg", (RADIO_CLICKS_VOLUME / 100))
	end
	cb("ok")
end)

RegisterNUICallback("ClickVolumeDown", function(data, cb)
	if HAS_RADIO then
		local newVolume = RADIO_CLICKS_VOLUME - 5
		if newVolume <= 0 then
			newVolume = 0
		end

		RADIO_CLICKS_VOLUME = exports["st_voip"]:SetRadioClickVolume(newVolume)

		exports["st_sound"]:PlayOne("radioclick.ogg", (RADIO_CLICKS_VOLUME / 100))
	end
	cb("ok")
end)

RegisterNetEvent("UI:Client:Reset", function()
	CloseRadio()
end)
