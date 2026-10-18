local _toggled = false
local _paused = false
local _vehToggled = false
local _overlayToggled = false
local _statuses = {}
local _statusCount = 0

local _idsCd = false
local _zoomLevel = GetResourceKvpInt("zoomLevel") or 3

local _zoomLevels = {
	900,
	1000,
	1100,
	1200,
	1300,
	1400,
}

-- CreateThread(function()
-- 	Wait(4000)
-- 	if not GetResourceKvpInt("zoomLevel") then
-- 		SetResourceKvpInt("zoomLevel", 3)
-- 		_zoomLevel = 3
-- 		SetRadarZoom(_zoomLevels[3])
-- 	end

-- 	SetRadarZoom(_zoomLevels[_zoomLevel])
-- end)

function GetMinimapAnchor()
	local minimap = {}
	local resX, resY = GetActiveScreenResolution()
	local aspectRatio = GetAspectRatio()
	local scaleX = 1 / resX
	local scaleY = 1 / resY
	local minimapRawX, minimapRawY
	SetScriptGfxAlign(string.byte('L'), string.byte('B'))
	if IsBigmapActive() then
		minimapRawX, minimapRawY = GetScriptGfxPosition(-0.003975, 0.022 + (-0.460416666))
		minimap.width = scaleX * (resX / (2.52 * aspectRatio))
		minimap.height = scaleY * (resY / (2.3374))
	else
		minimapRawX, minimapRawY = GetScriptGfxPosition(0.0005, -0.0545 + (-0.188888))
		minimap.width = scaleX * (resX / (3.53 * aspectRatio))
		minimap.height = scaleY * (resY / (5.674))
	end
	ResetScriptGfxAlign()
	minimap.leftX = minimapRawX
	minimap.rightX = minimapRawX + minimap.width
	minimap.topY = minimapRawY
	minimap.bottomY = minimapRawY + minimap.height
	minimap.X = minimapRawX + (minimap.width / 2)
	minimap.Y = minimapRawY + (minimap.height / 2)
	return minimap
end

AddEventHandler('onClientResourceStart', function(resource)
	if resource == GetCurrentResourceName() then
		Wait(1000)
		-- Hud.Minimap:Set()

		SetBlipAlpha(GetNorthRadarBlip(), 0.0)

		SetMinimapComponentPosition("minimap", "L", "B", 0.0005, -0.0545, 0.170, 0.18888)
		SetMinimapComponentPosition("minimap_mask", "L", "B", 0.028, -0.008, 0.126, 0.159)
		SetMinimapComponentPosition("minimap_blur", "L", "B", -0.028, -0.028, 0.301, 0.237)

		SetRadarBigmapEnabled(true, false)
		Wait(0)
		SetRadarBigmapEnabled(false, false)
		DisplayRadar(0)

		SendNUIMessage({
			type = "UPDATE_MM_POS",
			data = { position = GetMinimapAnchor() },
		})

		exports["st_binds"]:Add("show_interaction", "F1", "keyboard", "Hud - Show Interaction Menu", function()
			if not IsPauseMenuActive() then
				exports['st_ui']:InteractionShow()
			end
		end)

		-- exports["st_binds"]:Add("map_zoom_in", "PageUp", "keyboard", "Minimap - Zoom In", function()
		-- 	Hud.Minimap:In()
		-- end)

		-- exports["st_binds"]:Add("map_zoom_out", "PageDown", "keyboard", "Minimap - Zoom Out", function()
		-- 	Hud.Minimap:Out()
		-- end)

		exports["st_binds"]:Add("ui_toggle", "F11", "keyboard", "Hud - Toggle HUD", function()
			exports['st_ui']:Toggle()
		end)

		exports["st_binds"]:Add("ids_toggle", "u", "keyboard", "Hud - Toggle IDs", function()
			if not _idsCd then
				exports['st_ui']:IDToggle(true)
			end
		end)

		exports["strata"]:RegisterClientCallback("HUD:GetTargetInfront", function(data, cb)
			local originCoords = GetOffsetFromEntityInWorldCoords(LocalPlayer.state.ped, 0, 0.5, -0.5)
			local destinationCoords = GetOffsetFromEntityInWorldCoords(LocalPlayer.state.ped, 0, 1.0, -0.5)
			local castedRay = StartShapeTestSweptSphere(originCoords, destinationCoords, 1.0, 8, LocalPlayer.state.ped, 4)
			local _, hitting, endCoords, surfaceNormal, entity = GetShapeTestResult(castedRay)

			if hitting == 1 then
				local playerId = NetworkGetPlayerIndexFromPed(entity)
				if playerId ~= 0 then
					cb(GetPlayerServerId(playerId))
				else
					cb(nil)
				end
			else
				cb(nil)
			end
		end)

		exports["strata"]:RegisterClientCallback("HUD:PutOnBlindfold", function(data, cb)
			exports['st_ui']:Progress({
				name = "blindfold_action",
				duration = 6000,
				label = data,
				useWhileDead = false,
				canCancel = true,
				disarm = false,
				controlDisables = {
					disableMovement = true,
					disableCarMovement = true,
					disableMouse = false,
					disableCombat = true,
				},
				animation = {
					animDict = "random@mugging4",
					anim = "struggle_loop_b_thief",
					flags = 49,
				},
			}, function(cancelled)
				cb(not cancelled)
			end)
		end)
	end
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

function hasValue(tbl, value)
	for k, v in ipairs(tbl or {}) do
		if v == value or (type(v) == "table" and hasValue(v, value)) then
			return true
		end
	end
	return false
end

exports("IsDisabled", function()
	return (
		LocalPlayer.state.isDead
		or LocalPlayer.state.isCuffed
		or LocalPlayer.state.doingAction
		or LocalPlayer.state.inventoryOpen
		or LocalPlayer.state.phoneOpen
		or LocalPlayer.state.crafting
		or LocalPlayer.state.isHospitalized
		or LocalPlayer.state.myEscorter ~= nil
		or LocalPlayer.state.InventoryDisabled
	)
end)

exports("IsDisabledAllowDead", function()
	return (
		LocalPlayer.state.isCuffed
		or LocalPlayer.state.inventoryOpen
		or LocalPlayer.state.phoneOpen
		or LocalPlayer.state.crafting
		or LocalPlayer.state.isHospitalized
		or LocalPlayer.state.InventoryDisabled
	)
end)

exports("ForceHP", function()
	SendNUIMessage({
		type = "UPDATE_HP",
		data = {
			hp = (GetEntityHealth(LocalPlayer.state.ped) - 100),
			maxHp = (GetEntityMaxHealth(LocalPlayer.state.ped) - 100),
			armor = GetPedArmour(LocalPlayer.state.ped),
		},
	})
end)

exports("Show", function()
	if _toggled then
		return
	end

	local fuel = nil
	if GLOBAL_VEH ~= nil and DoesEntityExist(GLOBAL_VEH) then
		local vehState = Entity(GLOBAL_VEH).state
		fuel = vehState.Fuel
	end

	local ped = PlayerPedId()
	SendNUIMessage({
		type = "SHOW_HUD",
		data = {
			hp = (GetEntityHealth(ped) - 100),
			maxHp = (GetEntityMaxHealth(ped) - 100),
			armor = GetPedArmour(ped),
			fuel = fuel,
		},
	})
	_toggled = true
	StartThreads()

	if GLOBAL_VEH ~= nil then
		exports['st_ui']:VehicleShow()
	end
end)

exports("Hide", function()
	if not _toggled then
		return
	end

	SendNUIMessage({
		type = "HIDE_HUD",
	})
	_toggled = false

	if not exports['st_phone']:IsOpen() then
		DisplayRadar(false)
	end
	exports['st_ui']:VehicleHide()
end)

exports("Toggle", function()
	SendNUIMessage({
		type = "TOGGLE_HUD",
	})
	_toggled = not _toggled
	if _toggled then
		StartThreads()

		if GLOBAL_VEH ~= nil then
			exports['st_ui']:VehicleShow()
		else
			exports['st_ui']:VehicleHide()
		end
	else
		if not exports['st_phone']:IsOpen() and not hasValue(LocalPlayer.state.Character:GetData("States"), "GPS") then
			DisplayRadar(false)
		end
		exports['st_ui']:VehicleHide()
	end
end)

exports("ShiftLocation", function(status)
	SendNUIMessage({
		type = "SHIFT_LOCATION",
		data = { shift = status, position = GetMinimapAnchor() },
	})
end)

exports("OverlayShow", function(data)
	if _overlayToggled then
		return
	end

	SendNUIMessage({
		type = "SHOW_OVERLAY",
		data = { data },
	})
	_overlayToggled = true
end)

exports("OverlayHide", function(data)
	if not _overlayToggled then
		return
	end

	SendNUIMessage({
		type = "HIDE_OVERLAY",
	})
	_overlayToggled = false
end)

exports("VehicleShow", function()
	if _vehToggled then
		return
	end

	SendNUIMessage({
		type = "SHOW_VEHICLE",
		data = {
			position = GetMinimapAnchor()
		}
	})
	_vehToggled = true
	StartVehicleThreads()
end)

exports("VehicleHide", function()
	if not _vehToggled then
		return
	end

	SendNUIMessage({
		type = "HIDE_VEHICLE",
	})
	_vehToggled = false
end)

exports("VehicleToggle", function()
	SendNUIMessage({
		type = "TOGGLE_VEHICLE",
	})
	_vehToggled = not _vehToggled
	if _vehToggled then
		StartVehicleThreads()
	end
end)

exports("RegisterStatus", function(name, current, max, icon, color, flash, update, options)
	local data = {
		name = name,
		max = max,
		value = current,
		icon = icon,
		color = color,
		flash = flash,
		options = options,
	}

	if update then
		SendNUIMessage({
			type = "UPDATE_STATUS",
			data = { status = data },
		})
	else
		SendNUIMessage({
			type = "REGISTER_STATUS",
			data = { status = data },
		})
		_statusCount = _statusCount + 1
	end

	_statuses[name] = data
end)

exports("ResetStatus", function()
	SendNUIMessage({
		type = "RESET_STATUSES",
	})
end)

exports("IDToggle", function(isHeld)
	if _showingIds or _idsCd then
		return
	end

	local shouldHold = isHeld == true
	if shouldHold then
		_idsCd = true
		ShowIds()

		CreateThread(function()
			local holdStart = GetGameTimer()
			while _showingIds do
				if not IsControlPressed(0, 303) then
					break
				end

				if (GetGameTimer() - holdStart) >= 10000 then
					break
				end

				Wait(25)
			end

			_showingIds = false
			SetTimeout(300, function()
				_idsCd = false
			end)
		end)
		return
	end

	ShowIds()
end)

exports("Dead", function(state)
	SendNUIMessage({
		type = "SET_DEAD",
		data = {
			state = state,
		},
	})
end)

exports("GemTableOpen", function(quality)
	SendNUIMessage({
		type = "SHOW_GEM_TABLE",
		data = {
			info = quality
		}
	})
end)

exports("GemTableClose", function()
	SendNUIMessage({
		type = "CLOSE_GEM_TABLE",
		data = {},
	})
end)

exports("MethOpen", function(config)
	SetNuiFocus(true, true)
	SetNuiFocusKeepInput(false)
	SendNUIMessage({
		type = "OPEN_METH",
		data = {
			config = config,
		}
	})
end)

exports("MethClose", function()
	SetNuiFocus(false, false)
	SetNuiFocusKeepInput(false)
	SendNUIMessage({
		type = "CLOSE_METH",
		data = {},
	})
end)

exports("DeathTextsShow", function(type, deathTime, timer, keyOverride)
	SendNUIMessage({
		type = "DO_DEATH_TEXT",
		data = {
			key = exports["st_binds"]:GetKey(keyOverride or "secondary_action") or 'Unknown',
			f1Key = exports["st_binds"]:GetKey(keyOverride or "show_interaction") or 'Unknown',
			type = type,
			deathTime = deathTime,
			timer = timer,
			medicalPrice = 1500 -- (not GlobalState["Duty:ems"] or GlobalState["Duty:ems"] == 0) and 150 or 5000
		},
	})
end)

exports("DeathTextsRelease", function()
	SendNUIMessage({
		type = "DO_DEATH_RELEASING",
		data = {},
	})
end)

exports("DeathTextsHide", function()
	SendNUIMessage({
		type = "HIDE_DEATH_TEXT",
		data = {},
	})
end)

exports("FlashbangDo", function(duration, strength)
	SendNUIMessage({
		type = "SET_FLASHBANGED",
		data = {
			duration = duration,
			strength = strength,
		}
	})
end)

exports("FlashbangEnd", function()
	SendNUIMessage({
		type = "CLEAR_FLASHBANGED",
	})
end)

exports("UpdateVoip", function(level, talking, iconOverride)
	local talkingState = 0
	if talking == 2 or talking == "2" then
		talkingState = 2
	elseif talking == 1 or talking == true or talking == "1" then
		talkingState = 1
	end

	SendNUIMessage({
		type = "SET_VOIP_LEVEL",
		data = {
			level = level,
			talking = talkingState,
			icon = iconOverride,
		}
	})
end)

exports("NOS", function(level)
	SendNUIMessage({
		type = "UPDATE_NOS",
		data = {
			nos = level,
		}
	})
end)

AddEventHandler("Characters:Client:Updated", function(key)
	if key == "States" then
		if not IsPedInAnyVehicle(PlayerPedId(), true) then
			DisplayRadar(
				LocalPlayer.state.phoneOpen or hasValue(LocalPlayer.state.Character:GetData("States"), "GPS")
			)
			exports['st_ui']:ShiftLocation(
				LocalPlayer.state.phoneOpen or hasValue(LocalPlayer.state.Character:GetData("States"), "GPS")
			)
		end
	end
end)

function GetLocation()
	local pos = GetEntityCoords(LocalPlayer.state.ped)

	if LocalPlayer.state.tpLocation then
		pos = vector3(
			LocalPlayer.state.tpLocation.x,
			LocalPlayer.state.tpLocation.y,
			LocalPlayer.state.tpLocation.z
		)
	end

	local rawHeading = GetEntityHeading(LocalPlayer.state.ped)
	local direction = GetDirection(rawHeading)
	local var1, var2 = GetStreetNameAtCoord(pos.x, pos.y, pos.z, Citizen.ResultAsInteger(), Citizen.ResultAsInteger())
	local area = GetLabelText(GetNameOfZone(pos.x, pos.y, pos.z))

	return {
		main = GetStreetNameFromHashKey(var1),
		cross = GetStreetNameFromHashKey(var2),
		area = area,
		direction = direction,
		heading = (360 - rawHeading) % 360,
	}
end

function GetDirection(heading)
	if (heading >= 0 and heading < 45) or (heading >= 315 and heading < 360) then
		return "N"
	elseif heading >= 45 and heading < 135 then
		return "W"
	elseif heading >= 135 and heading < 225 then
		return "S"
	elseif heading >= 225 and heading < 315 then
		return "E"
	end
end

function DrawText3D(position, text, r, g, b)
	local onScreen, _x, _y = World3dToScreen2d(position.x, position.y, position.z + 1)
	local dist = #(GetGameplayCamCoords() - position)

	local scale = (1 / dist) * 2
	local fov = (1 / GetGameplayCamFov()) * 100
	local scale = scale * fov

	if onScreen then
		if not useCustomScale then
			SetTextScale(0.0 * scale, 0.55 * scale)
		else
			SetTextScale(0.0 * scale, customScale)
		end
		SetTextFont(0)
		SetTextProportional(1)
		SetTextColour(r, g, b, 255)
		SetTextDropshadow(0, 0, 0, 0, 255)
		SetTextEdge(2, 0, 0, 0, 150)
		SetTextDropShadow()
		SetTextOutline()
		SetTextEntry("STRING")
		SetTextCentre(1)
		AddTextComponentString(text)
		DrawText(_x, _y)
	end
end

_showingIds = false

local function getVehicleClassLabel(veh)
	if veh and veh > 0 and DoesEntityExist(veh) then
		local nativeClass = GetVehicleClass(veh)
		if nativeClass == 14 then
			return "Boat Class"
		elseif nativeClass == 15 then
			return "Helicopter Class"
		elseif nativeClass == 16 then
			return "Plane Class"
		end

		local vehState = Entity(veh).state
		local stateClass = vehState and vehState.Class
		if stateClass and type(stateClass) == "string" then
			local normalizedStateClass = string.upper(string.gsub(stateClass, "%s+", ""))
			normalizedStateClass = string.gsub(normalizedStateClass, "CLASS", "")
			if normalizedStateClass == "X" or normalizedStateClass == "S" or normalizedStateClass == "A" or normalizedStateClass == "B" or normalizedStateClass == "C" or normalizedStateClass == "D" then
				return string.format("%s Class", normalizedStateClass)
			end
		end

		local tierClass = exports['st_veh']:ClassGet(veh)
		if tierClass and type(tierClass) == "string" and tierClass ~= "" and tierClass ~= "D" then
			return string.format("%s Class", tierClass)
		end

		local value = GetVehicleHandlingInt(veh, "CHandlingData", "nMonetaryValue")
		if value and value > 0 then
			if value >= 2000000 then
				return "X Class"
			elseif value >= 1000000 then
				return "S Class"
			elseif value >= 500000 then
				return "A Class"
			elseif value >= 350000 then
				return "B Class"
			elseif value >= 250000 then
				return "C Class"
			end
		end

		if tierClass and type(tierClass) == "string" and tierClass ~= "" then
			return string.format("%s Class", tierClass)
		end
	end

	return nil
end

local function getVehicleClassColor(classLabel)
	if classLabel == "X Class" then
		return 208, 132, 255
	elseif classLabel == "S Class" then
		return 255, 72, 72
	elseif classLabel == "A Class" then
		return 255, 140, 66
	elseif classLabel == "B Class" then
		return 255, 210, 80
	elseif classLabel == "C Class" then
		return 118, 206, 104
	elseif classLabel == "D Class" then
		return 175, 175, 175
	elseif classLabel == "Boat Class" then
		return 76, 169, 255
	elseif classLabel == "Helicopter Class" then
		return 100, 255, 214
	elseif classLabel == "Plane Class" then
		return 126, 202, 255
	end

	return 255, 255, 255
end

function ShowIds()
	_showingIds = true
	local nearPlayers = {}

	local showInvisible = LocalPlayer.state.isDev

	CreateThread(function()
		while _showingIds do
			for _, data in ipairs(nearPlayers) do
				local targetPed = GetPlayerPed(data.id)
				if data.SID ~= nil and (IsEntityVisible(targetPed) or showInvisible) then
					DrawText3D(GetPedBoneCoords(targetPed, 0), data.SID, 255, 255, 255)

					local targetVeh = GetVehiclePedIsIn(targetPed, false)
					local classLabel = getVehicleClassLabel(targetVeh)
					if classLabel ~= nil then
						local classR, classG, classB = getVehicleClassColor(classLabel)
						local vehCoords = GetEntityCoords(targetVeh)
						DrawText3D(vector3(vehCoords.x, vehCoords.y, vehCoords.z + 1.4), classLabel, classR, classG, classB)
					end
				end
			end
			Wait(0)
		end
	end)

	CreateThread(function()
		while _showingIds do
			nearPlayers = {}
			local playerCoords = GetEntityCoords(LocalPlayer.state.ped)

			if exports['st_admin']:NoClipIsActive() then
				playerCoords = exports['st_admin']:NoClipGetPos()
			end

			for _, id in ipairs(GetActivePlayers()) do
				local targetPed = GetPlayerPed(id)
				if DoesEntityExist(targetPed) then
					local source = GetPlayerServerId(id)
					local distance = #(
						vector3(playerCoords.x, playerCoords.y, playerCoords.z)
						- GetEntityCoords(targetPed)
					)
					if distance <= 25 and GlobalState[string.format("SID:%s", source)] ~= nil then
						table.insert(nearPlayers, {
							id = id,
							SID = GlobalState[string.format("SID:%s", source)],
							source = source,
							distance = distance,
						})
					end
				end
			end
			Wait(2000)
		end
	end)
end

function StartThreads()
	CreateThread(function()
		while _toggled do
			if not _paused then
				SendNUIMessage({
					type = "UPDATE_HEADING",
					data = { heading = (360 - GetEntityHeading(LocalPlayer.state.ped)) % 360 },
				})
			end
			Wait(50)
		end
	end)

	CreateThread(function()
		while _toggled do
			if IsPauseMenuActive() and not _paused then
				_paused = true

				SendNUIMessage({
					type = "TOGGLE_HUD",
				})

				if _vehToggled then
					SendNUIMessage({
						type = "TOGGLE_VEHICLE",
					})
				end
			end

			if not _paused then
				SendNUIMessage({
					type = "UPDATE_LOCATION",
					data = { location = GetLocation() },
				})
				Wait(200)
				SendNUIMessage({
					type = "UPDATE_HP",
					data = {
						hp = (GetEntityHealth(LocalPlayer.state.ped) - 100),
						maxHp = (GetEntityMaxHealth(LocalPlayer.state.ped) - 100),
						armor = GetPedArmour(LocalPlayer.state.ped),
					},
				})
				Wait(200)
			else
				if not IsPauseMenuActive() then
					SendNUIMessage({
						type = "TOGGLE_HUD",
					})

					if _vehToggled then
						SendNUIMessage({
							type = "TOGGLE_VEHICLE",
						})
					end
					_paused = false
				end
				Wait(400)
			end
		end
	end)

	CreateThread(function()
		local lastVisible = nil
		local lastWeapon = nil
		local lastClip = nil
		local lastReserve = nil

		while _toggled do
			local ped = LocalPlayer.state.ped or PlayerPedId()
			local weapon = GetSelectedPedWeapon(ped)
			local visible = false
			local clipAmmo = 0
			local reserveAmmo = 0

			if weapon and weapon ~= `WEAPON_UNARMED` and HasPedGotWeapon(ped, weapon, false) then
				visible = true
				local _, clip = GetAmmoInClip(ped, weapon)
				local total = GetAmmoInPedWeapon(ped, weapon)

				clipAmmo = clip or 0
				reserveAmmo = math.max((total or 0) - clipAmmo, 0)

				-- Hide GTA's native weapon/ammo HUD since we're rendering a custom counter.
				HideHudComponentThisFrame(2)
			end

			if lastVisible ~= visible or lastWeapon ~= weapon or lastClip ~= clipAmmo or lastReserve ~= reserveAmmo then
				lastVisible = visible
				lastWeapon = weapon
				lastClip = clipAmmo
				lastReserve = reserveAmmo

				SendNUIMessage({
					type = "UPDATE_AMMO",
					data = {
						visible = visible,
						weapon = weapon,
						clip = clipAmmo,
						reserve = reserveAmmo,
					},
				})
			end

			Wait(0)
		end
	end)
end

function StartVehicleThreads()
	if not _toggled then
		return
	end

	local class = GetVehicleClass(GLOBAL_VEH)

	if class == 8 or class == 13 or class == 14 or class == 15 or class == 16 then
		SendNUIMessage({
			type = "HIDE_SEATBELT",
		})
	else
		SendNUIMessage({
			type = "SHOW_SEATBELT",
		})
	end

	CreateThread(function()
		DisplayRadar(true)
		while _vehToggled do
			local speed = math.ceil(GetEntitySpeed(GLOBAL_VEH) * 2.237)
			SendNUIMessage({
				type = "UPDATE_SPEED",
				data = { speed = speed },
			})
			Wait(100)
		end

		if LocalPlayer.state.Character ~= nil then
			DisplayRadar(hasValue(LocalPlayer.state.Character:GetData("States"), "GPS"))
		end
	end)

	CreateThread(function()
		while _vehToggled do
			if GLOBAL_VEH then
				SendNUIMessage({
					type = "UPDATE_RPM",
					data = { rpm = GetVehicleCurrentRpm(GLOBAL_VEH) },
				})
				Wait(10)
			end
		end
	end)

	if GetPedInVehicleSeat(GLOBAL_VEH, -1) ~= LocalPlayer.state.ped then
		CreateThread(function()
			local lastIgnition = Entity(GLOBAL_VEH).state.VEH_IGNITION
			while _vehToggled do
				Wait(1000)

				if GLOBAL_VEH then
					local ignitionState = Entity(GLOBAL_VEH).state.VEH_IGNITION
					if lastIgnition ~= ignitionState then
						lastIgnition = ignitionState

						SendNUIMessage({
							type = "UPDATE_IGNITION",
							data = { ignition = ignitionState },
						})
					end
				end
			end
		end)
	end

	if class ~= 13 then
		CreateThread(function()
			while _vehToggled do
				local checkEngine = false

				if GLOBAL_VEH then
					local ent = Entity(GLOBAL_VEH)

					if class ~= 14 and class ~= 15 and class ~= 16 then
						local damageStuff = ent.state.DamagedParts or {}

						for k, v in pairs(damageStuff) do
							if type(v) == "number" and v < 25.0 then
								checkEngine = true
							end
						end
					end

					local rawHealth = GetVehicleEngineHealth(GLOBAL_VEH)
					if rawHealth <= 400.0 then
						checkEngine = true
					end
					local engineHealthPct = math.max(0, math.min(100, rawHealth / 10))
					SendNUIMessage({
						type = "UPDATE_ENGINELIGHT",
						data = { checkEngine = checkEngine, engineHealth = engineHealthPct },
					})
				else
					SendNUIMessage({
						type = "UPDATE_ENGINELIGHT",
						data = { checkEngine = checkEngine, engineHealth = 100 },
					})
				end

				Wait(10000)
			end
		end)
	else
		SendNUIMessage({
			type = "UPDATE_ENGINELIGHT",
			data = { checkEngine = false },
		})
	end
end

-- CreateThread(function()
-- 	SetMapZoomDataLevel(0, 0.96, 0.9, 0.08, 0.0, 0.0) -- Level 0
-- 	SetMapZoomDataLevel(1, 1.6, 0.9, 0.08, 0.0, 0.0) -- Level 1
-- 	SetMapZoomDataLevel(2, 8.6, 0.9, 0.08, 0.0, 0.0) -- Level 2
-- 	SetMapZoomDataLevel(3, 12.3, 0.9, 0.08, 0.0, 0.0) -- Level 3
-- 	SetMapZoomDataLevel(4, 22.3, 0.9, 0.08, 0.0, 0.0) -- Level 4
-- end)

CreateThread(function()
	SetRadarZoom(1200)
end)

-- function DoRadarFix()
-- 	CreateThread(function()
-- 		Wait(300)
-- 		SetRadarZoom(_zoomLevels[6])
-- 		Wait(300)
-- 		SetRadarZoom(_zoomLevels[4])
-- 		Wait(300)
-- 		SetRadarZoom(_zoomLevels[1])
-- 		Wait(300)
-- 		SetRadarZoom(_zoomLevels[_zoomLevel])
-- 	end)
-- end

AddEventHandler("Keybinds:Client:KeyUp:cancel_action", function()
	if _overlayToggled then
		exports['st_ui']:OverlayHide()
	end
end)
