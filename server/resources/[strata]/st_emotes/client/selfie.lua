local _selfie = false
local _frontie = true

RegisterNetEvent("Animations:Client:Selfie", function(toggle)
	if toggle ~= nil then
		if toggle then
			StartSelfieMode()
		else
			StopSelfieMode()
		end
	else
		if _selfie then
			StopSelfieMode()
		else
			StartSelfieMode()
		end
	end
end)

function StartSelfieMode()
	if not _selfie and not LocalPlayer.state.doingAction then
		_selfie = true
		exports["st_ui"]:Notification(
			"info",
			string.format("Camera - Press %s to take a Selfie", exports["st_binds"]:GetKey("primary_action"))
			.. "<br/>"
			.. string.format("Camera - Press %s to flip the camera",
				exports["st_binds"]:GetKey("secondary_action"))
			.. "<br/>"
			.. string.format("Camera - Press %s to cancel", exports["st_binds"]:GetKey("emote_cancel")),
			-1,
			"camera",
			nil,
			"camera-info-notif"
		)
		exports.st_inventory:Disable()
		exports['st_ui']:Hide()
		DestroyMobilePhone()
		Wait(10)
		CreateMobilePhone(0)
		CellCamActivate(true, true)
		CellCamDisableThisFrame(true)
	end
end

function StopSelfieMode()
	if _selfie then
		exports["st_ui"]:Notification("remove", nil, nil, nil, nil, "camera-info-notif")
		DestroyMobilePhone()
		Wait(10)
		CellCamDisableThisFrame(false)
		CellCamActivate(false, false)
		exports.st_inventory:Enable()
		exports['st_ui']:Show()
		_selfie = false
		_frontie = true
	end
end

RegisterNetEvent("Selfie:DoCloseSelfie", function()
	DestroyMobilePhone()
	CellCamActivate(false, false)
	StopSelfieMode()
end)

AddEventHandler("Keybinds:Client:KeyUp:primary_action", function()
	if _selfie then
		TriggerServerEvent("Selfie:CaptureSelfie")
	end
end)

AddEventHandler("Keybinds:Client:KeyUp:secondary_action", function()
	if _selfie then
		_frontie = not _frontie
		CellFrontCamActivate(_frontie)
		-- if _frontie == false then
		-- 	exports['st_emotes']:EmotesPlay("filmshocking", false, false, false)
		-- else
		-- 	exports['st_emotes']:EmotesForceCancel()
		-- end
	end
end)

AddEventHandler("Keybinds:Client:KeyUp:cancel_action", function()
	if _selfie then
		StopSelfieMode()
	end
end)

function CellFrontCamActivate(activate)
	return Citizen.InvokeNative(0x2491A93618B7D838, activate)
end
