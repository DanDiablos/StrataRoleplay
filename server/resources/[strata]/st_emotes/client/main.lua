GLOBAL_VEH = nil

IsInAnimation = false

_isPointing = false
_isCrouched = false

walkStyle = "default"
facialExpression = "default"
emoteBinds = {}

_doingStateAnimation = false

local function RegisterMenuItems()
	exports['st_ui']:InteractionRegisterMenu("emotes", "Emotes", "person-running", function()
		exports['st_ui']:InteractionHide()
		exports['st_emotes']:OpenMainEmoteMenu()
	end)

	exports['st_ui']:InteractionRegisterMenu("expressions", "Expressions", "face-grin-squint-tears", function()
		exports['st_ui']:InteractionHide()
		exports['st_emotes']:OpenExpressionsMenu()
	end)

	exports['st_ui']:InteractionRegisterMenu("walks", "Walk Styles", "person-walking", function()
		exports['st_ui']:InteractionHide()
		exports['st_emotes']:OpenWalksMenu()
	end)
end

AddEventHandler('onClientResourceStart', function(resource)
	if resource == GetCurrentResourceName() then
		Wait(1000)
		RegisterKeybinds()

		RegisterChairTargets()

		RegisterMenuItems()

		exports["strata"]:RegisterClientCallback("Selfie:Client:UploadPhoto", function(data, cb)
			TriggerServerEvent("Animations:Server:UploadSelfie", data, cb)
		end)
	end
end)

AddEventHandler('st_ui:RegisterMenuItems', function()
	RegisterMenuItems()
end)

local pauseListener = nil
AddEventHandler("Characters:Client:Spawn", function()
	exports['st_emotes']:EmotesCancel()
	TriggerEvent("Animations:Client:StandUp", true, true)

	pauseListener = AddStateBagChangeHandler(
		"inPauseMenu",
		string.format("player:%s", GetPlayerServerId(LocalPlayer.state.PlayerID)),
		function(bagName, key, value, _unused, replicated)
			if key == "inPauseMenu" then
				if
					value == 1
					and not LocalPlayer.state.isDead
					and not LocalPlayer.state.isCuffed
					and not LocalPlayer.state.isHardCuffed
				then
					if value == 1 and not exports['st_emotes']:EmotesGet() then
						exports['st_emotes']:EmotesPlay("map", false, nil, true, true)
					end
				else
					if value == false and exports['st_emotes']:EmotesGet() == "map" then
						exports['st_emotes']:EmotesForceCancel()
					end
				end
			end
		end
	)

	CreateThread(function()
		while LocalPlayer.state.loggedIn do
			Wait(5000)
			if not _isCrouched and not LocalPlayer.state.drunkMovement then
				exports['st_emotes']:PedFeaturesRequestFeaturesUpdate()
			end
		end
	end)

	CreateThread(function()
		while LocalPlayer.state.loggedIn do
			Wait(0)
			DisableControlAction(0, 36, true)
			if IsDisabledControlJustPressed(0, 36) then
				exports['st_emotes']:PedFeaturesToggleCrouch()
			end
			if IsInAnimation and IsPedShooting(LocalPlayer.state.ped) then
				exports['st_emotes']:EmotesForceCancel()
			end
		end
	end)

	local character = LocalPlayer.state.Character
	if character and character:GetData("Animations") then
		local data = character:GetData("Animations")
		walkStyle, facialExpression, emoteBinds = data.walk, data.expression, data.emoteBinds
		exports['st_emotes']:PedFeaturesRequestFeaturesUpdate()
	else
		walkStyle, facialExpression, emoteBinds =
			Config.DefaultSettings.walk, Config.DefaultSettings.expression, Config.DefaultSettings.emoteBinds
		exports['st_emotes']:PedFeaturesRequestFeaturesUpdate()
	end
end)

RegisterNetEvent("Characters:Client:Logout", function()
	exports['st_emotes']:EmotesForceCancel()
	Wait(20)

	RemoveStateBagChangeHandler(pauseListener)
	if LocalPlayer.state.anim then
		LocalPlayer.state:set("anim", false, true)
	end
end)

RegisterNetEvent("Vehicles:Client:EnterVehicle", function(veh)
	GLOBAL_VEH = veh
end)

RegisterNetEvent("Vehicles:Client:ExitVehicle", function()
	GLOBAL_VEH = nil
end)

function RegisterKeybinds()
	exports["st_binds"]:Add("pointing", "b", "keyboard", "Pointing - Toggle", function()
		if _isPointing then
			StopPointing()
		else
			StartPointing()
		end
	end)

	exports["st_binds"]:Add("ragdoll", Config.RagdollKeybind, "keyboard", "Ragdoll - Toggle", function()
		local time = 3500
		Wait(350)
		ClearPedSecondaryTask(LocalPlayer.state.ped)
		SetPedToRagdoll(LocalPlayer.state.ped, time, time, 0, 0, 0, 0)
	end)

	exports["st_binds"]:Add("emote_cancel", "x", "keyboard", "Emotes - Cancel Current", function()
		exports['st_emotes']:EmotesCancel()

		TriggerEvent("Animations:Client:StandUp")
		TriggerEvent("Animations:Client:Selfie", false)
		TriggerEvent("Animations:Client:UsingCamera", false)
	end)

	-- Don't specify and key so then players can set it themselves if they want to use...
	exports["st_binds"]:Add("emote_menu", "", "keyboard", "Emotes - Open Menu", function()
		exports['st_emotes']:OpenMainEmoteMenu()
	end)

	-- There are 4 emote binds and by default they use numbers 6, 7, 8 and 9
	for bindNum = 1, 4 do
		exports["st_binds"]:Add(
			"emote_bind_" .. bindNum,
			tostring(5 + bindNum),
			"keyboard",
			"Emotes - Bind #" .. bindNum,
			function()
				exports['st_emotes']:EmoteBindsUse(bindNum)
			end
		)
	end
end

RegisterNetEvent("Animations:Client:OpenMainEmoteMenu")
AddEventHandler("Animations:Client:OpenMainEmoteMenu", function()
	exports['st_emotes']:OpenMainEmoteMenu()
end)

RegisterNetEvent("Animations:Client:OpenWalksMenu")
AddEventHandler("Animations:Client:OpenWalksMenu", function()
	exports['st_emotes']:OpenWalksMenu()
end)

RegisterNetEvent("Animations:Client:OpenExpressionsMenu")
AddEventHandler("Animations:Client:OpenExpressionsMenu", function()
	exports['st_emotes']:OpenExpressionsMenu()
end)
