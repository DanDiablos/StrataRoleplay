AddEventHandler("Vehicles:Client:EnterVehicle", function(currentVehicle, currentSeat)
	GLOBAL_VEH = currentVehicle
	exports['st_ui']:VehicleShow()
	--Hud.Minimap:Set()
end)

AddEventHandler("Vehicles:Client:ExitVehicle", function(currentVehicle, currentSeat)
	exports['st_ui']:VehicleHide()
	GLOBAL_VEH = nil
end)

AddEventHandler("Characters:Client:Spawn", function()
	SendNUIMessage({
		type = "SET_CONFIG",
		data = {
			config = LocalPlayer.state.Character:GetData("HUDConfig"),
		},
	})

	exports['st_ui']:Show()

	DisplayRadar(hasValue(LocalPlayer.state.Character:GetData("States"), "GPS"))
	exports['st_ui']:ShiftLocation(hasValue(LocalPlayer.state.Character:GetData("States"), "GPS"))
end)

RegisterNetEvent("UI:Client:Reset", function(manual)
	exports['st_ui']:Hide()
	SendNUIMessage({
		type = "UI_RESET",
		data = {
			manual = manual,
		},
	})

	if LocalPlayer.state.Character ~= nil then
		SendNUIMessage({
			type = "SET_CONFIG",
			data = {
				config = LocalPlayer.state.Character:GetData("HUDConfig"),
			},
		})
	end

	exports['st_ui']:ActionHide()
	exports['st_ui']:ListMenuClose()
	exports['st_ui']:InteractionHide()
	exports["st_ui"]:Notification("clear")
	exports['st_ui']:ConfirmClose()
	exports['st_ui']:InputClose()
	exports['st_ui']:InfoOverlayClose()
	exports['st_ui']:MethClose()

	TriggerEvent("UI:Client:ResetFinished", manual)

	if manual then
		Wait(2500)
		exports['st_ui']:Show()
		if exports['st_phone']:IsOpen() or hasValue(LocalPlayer.state.Character:GetData("States"), "GPS") then
			DisplayRadar(true)
		end
	end
end)

RegisterNetEvent("Characters:Client:Logout", function()
	TriggerEvent("UI:Client:Reset")
end)

AddEventHandler("Vehicles:Client:Seatbelt", function(state)
	SendNUIMessage({
		type = "UPDATE_SEATBELT",
		data = { seatbelt = state },
	})
end)

AddEventHandler("Vehicles:Client:Cruise", function(state)
	SendNUIMessage({
		type = "UPDATE_CRUISE",
		data = { cruise = state },
	})
end)

AddEventHandler("Vehicles:Client:Ignition", function(state)
	SendNUIMessage({
		type = "UPDATE_IGNITION",
		data = { ignition = state },
	})
end)

AddEventHandler("Vehicles:Client:Fuel", function(amount, show)
	SendNUIMessage({
		type = "UPDATE_FUEL",
		data = {
			fuel = amount,
			fuelHide = show,
		},
	})
end)

RegisterNetEvent("Status:Client:Update", function(status, value)
	SendNUIMessage({
		type = "UPDATE_STATUS_VALUE",
		data = { name = status, value = value },
	})
end)

RegisterNetEvent("Progress:Client:Progress", function(action, cb)
	exports['st_ui']:Progress(action, cb)
end)

RegisterNetEvent("Progress:Client:ProgressWithStartEvent", function(action, start, finish)
	exports['st_ui']:ProgressWithStartEvent(action, start, finish)
end)

RegisterNetEvent("Progress:Client:ProgressWithTickEvent", function(action, tick, finish)
	exports['st_ui']:ProgressWithTickEvent(action, tick, finish)
end)

RegisterNetEvent("Progress:Client:ProgressWithStartAndTick", function(action, start, tick, finish)
	exports['st_ui']:ProgressWithStartAndTick(action, start, tick, finish)
end)

RegisterNetEvent("Progress:Client:Cancel", function()
	exports['st_ui']:ProgressCancel()
end)

RegisterNetEvent("Progress:Client:Fail", function()
	exports['st_ui']:ProgressFail()
end)

RegisterNUICallback("Progress:Finish", function(data, cb)
	exports['st_ui']:ProgressFinish()
	cb("ok")
end)

AddEventHandler("Targeting:Client:UpdateState", function(isTargeting, hasTarget)
	SendNUIMessage({
		type = (isTargeting and "SHOW_EYE" or "HIDE_EYE"),
		data = {
			icon = (type(hasTarget) == "string" and hasTarget or false),
		},
	})
end)

AddEventHandler("Targeting:Client:OpenMenu", function(menuData)
	SetNuiFocus(true, true)
	SetCursorLocation(0.5, 0.5)
	SendNUIMessage({
		type = "OPEN_MENU",
		data = {
			menu = menuData,
		},
	})
end)

AddEventHandler("Targeting:Client:CloseMenu", function()
	SetNuiFocus(false, false)
	SendNUIMessage({
		type = "CLOSE_MENU",
		data = {},
	})
end)

RegisterNetEvent("UI:Client:Configure", function()
	SetNuiFocus(true, true)
	SendNUIMessage({
		type = "TOGGLE_SETTINGS",
		data = {
			state = true,
		},
	})
end)

RegisterNUICallback("targetingAction", function(data, cb)
	SetNuiFocus(false, false)
	SendNUIMessage({
		type = "CLOSE_MENU",
		data = {},
	})
	TriggerEvent("Targeting:Client:MenuSelect", data and data.event, data and data.data or {})
	cb("ok")
end)

RegisterNUICallback("CloseUI", function(data, cb)
	SetNuiFocus(false, false)
	cb("OK")
end)

RegisterNUICallback("SaveConfig", function(data, cb)
	exports["strata"]:ServerCallback("HUD:SaveConfig", data, function(s)
		cb(s)
	end)
end)
