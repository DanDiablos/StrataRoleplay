RegisterNetEvent("Characters:Client:Logout", function()
	_inPickup = false
	_inLogout = false
	_doingMugshot = false
end)

RegisterNetEvent("Jail:Client:EnterJail", function()
	exports["st_sound"]:PlayOne("jailed.ogg", 0.075)
	if not IsScreenFadedOut() then
		DoScreenFadeOut(1000)
		while not IsScreenFadedOut() do
			Wait(10)
		end
	end

	local cellData = Config.Cells[math.random(#Config.Cells)]

	SetEntityCoords(LocalPlayer.state.ped, cellData.coords.x, cellData.coords.y, cellData.coords.z, 0, 0, 0, false)
	Wait(100)
	SetEntityHeading(LocalPlayer.state.ped, cellData.heading)
	_disabled = false

	Wait(1000)

	DoScreenFadeIn(1000)
	while not IsScreenFadedIn() do
		Wait(10)
	end
end)

AddEventHandler("Keybinds:Client:KeyUp:primary_action", function()
	if _inLogout then
		exports["strata"]:ServerCallback("Jail:Validate", {
			id = GlobalState[string.format("%s:Apartment", LocalPlayer.state.ID)],
			type = "logout",
		}, function(state)
			if state then
				exports['st_chars']:Logout()
			end
		end)
	end
end)

AddEventHandler("Jail:Client:RetreiveItems", function()
	exports["strata"]:ServerCallback("Jail:RetreiveItems")
end)

AddEventHandler("Jail:Client:CheckSentence", function()
	local jailed = LocalPlayer.state.Character:GetData("Jailed")
	if not jailed or GetCloudTimeAsInt() >= (jailed.Release or 0) then
		exports["st_ui"]:Notification("info", "Time Served")
	else
		if jailed.Duration >= 9999 then
			exports["st_ui"]:Notification("info", "You've Been Setenced To The 9's")
		else
			local months = math.ceil((jailed.Release - GetCloudTimeAsInt()) / 60)
			exports["st_ui"]:Notification("info",
				string.format("You Have %s Months of Your %s Month Sentence Remaining", months, jailed.Duration)
			)
		end
	end
end)

AddEventHandler("Jail:Client:Released", function()
	if exports['st_jail']:IsJailed() and exports['st_jail']:IsReleaseEligible() then
		exports["strata"]:ServerCallback("Jail:Release", {}, function(s)
			if s then
				DoScreenFadeOut(1000)
				while not IsScreenFadedOut() do
					Wait(10)
				end

				exports["st_sound"]:PlayOne("release.ogg", 0.15)
				SetEntityCoords(
					LocalPlayer.state.ped,
					Config.Release.coords.x,
					Config.Release.coords.y,
					Config.Release.coords.z,
					0,
					0,
					0,
					false
				)
				Wait(100)
				SetEntityHeading(LocalPlayer.state.ped, Config.Release.heading)

				Wait(1000)

				DoScreenFadeIn(1000)
				while not IsScreenFadedIn() do
					Wait(10)
				end
			end
		end)
	end
end)

AddEventHandler("Polyzone:Enter", function(id, testedPoint, insideZones, data)
	if id == "prison-pickup" then
		_inPickup = true
	elseif id == "prison-logout" then
		_inLogout = true
		exports['st_ui']:ActionShow("logout", "{keybind}primary_action{/keybind} Switch Characters")
	end
end)

AddEventHandler("Polyzone:Exit", function(id, testedPoint, insideZones, data)
	if id == "prison" and LocalPlayer.state.loggedIn then
		if LocalPlayer.state.inTrunk then
			exports['st_utils']:TrunkGetOut()

			while LocalPlayer.state.inTrunk do
				Wait(1)
			end

			Wait(2000)

			exports["st_ui"]:Notification("warning", "Stop exploiting or you will be flighted")
			exports["strata"]:ServerCallback("Jail:Server:ExploitAttempt", 1)
		end

		if LocalPlayer.state.myEscorter ~= nil then
			TriggerServerEvent("Escort:Server:ForceStop")

			while LocalPlayer.state.myEscorter ~= nil do
				Wait(1)
			end

			exports["st_ui"]:Notification("warning", "Stop exploiting or you will be flighted")
			exports["strata"]:ServerCallback("Jail:Server:ExploitAttempt", 2)
		end

		if exports['st_jail']:IsJailed() and not _doingMugshot then
			TriggerEvent("Jail:Client:EnterJail")
		end
	elseif id == "prison-pickup" then
		_inPickup = false
	elseif id == "prison-logout" then
		_inLogout = false
		exports['st_ui']:ActionHide("logout")
	end
end)

AddEventHandler("Jail:Client:StartWork", function()
	exports["strata"]:ServerCallback("Jail:StartWork")
end)

AddEventHandler("Jail:Client:QuitWork", function()
	exports["strata"]:ServerCallback("Jail:QuitWork")
end)

AddEventHandler("Jail:Client:MakeFood", function()
	exports['st_ui']:Progress({
		name = "prison_action",
		duration = 12500,
		label = "Making Food",
		useWhileDead = false,
		canCancel = true,
		controlDisables = {
			disableMovement = true,
			disableCarMovement = true,
			disableMouse = false,
			disableCombat = true,
		},
		animation = {
			anim = "dj",
		},
	}, function(status)
		if not status then
			exports["strata"]:ServerCallback("Jail:MakeItem", "food")
		end
	end)
end)

AddEventHandler("Jail:Client:MakeDrink", function()
	exports['st_ui']:Progress({
		name = "prison_action",
		duration = 12500,
		label = "Making Drink",
		useWhileDead = false,
		canCancel = true,
		controlDisables = {
			disableMovement = true,
			disableCarMovement = true,
			disableMouse = false,
			disableCombat = true,
		},
		animation = {
			anim = "dj",
		},
	}, function(status)
		if not status then
			exports["strata"]:ServerCallback("Jail:MakeItem", "drink")
		end
	end)
end)

AddEventHandler("Jail:Client:MakeJuice", function(self, data)
	exports['st_ui']:Progress({
		name = "prison_action",
		duration = 12500,
		label = "Making Slushie",
		useWhileDead = false,
		canCancel = true,
		controlDisables = {
			disableMovement = true,
			disableCarMovement = true,
			disableMouse = false,
			disableCombat = true,
		},
		animation = {
			anim = "dj",
		},
	}, function(status)
		if not status then
			exports["strata"]:ServerCallback("Jail:MakeJuice", data.name)
		end
	end)
end)

AddEventHandler("Jail:Client:ViewInmates", function()
	TriggerServerEvent("MDT:Server:OpenDOCPublic")
end)
