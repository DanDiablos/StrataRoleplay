local _inCheckInZone = false

---@param tbl table
---@param value any
---@return boolean
local function hasValue(tbl, value)
	for _, v in ipairs(tbl) do
		if v == value or (type(v) == "table" and hasValue(v, value)) then
			return true
		end
	end
	return false
end

AddEventHandler('onClientResourceStart', function(resource)
	if resource ~= GetCurrentResourceName() then return end

	exports['st_utils']:Add(
		"PrisonHospital", `s_m_m_doctor_01`,
		vector3(1769.832, 2571.891, 44.730), 138.556,
		Config.PrisonCheckIn.Radius,
		{
			{
				icon  = "heart-pulse",
				text  = "Medical Attention - $150",
				event = "Hospital:Client:PrisonHospitalRevive",
				data  = {},
				isEnabled = function()
					return false
				end,
			},
		},
		"suitcase-medical", "WORLD_HUMAN_CLIPBOARD"
	)

	exports['st_zones']:CreateBox(
		"prison-hospital-check-in-zone",
		Config.PrisonCheckIn.Coords,
		Config.PrisonCheckIn.Width,
		Config.PrisonCheckIn.Length,
		{
			heading = Config.PrisonCheckIn.Heading,
			minZ    = Config.PrisonCheckIn.Coords.z - 1.0,
			maxZ    = Config.PrisonCheckIn.Coords.z + 1.0,
		},
		{}
	)

	exports['st_zones']:CreateBox("prison_visitation", vector3(1831.24, 2585.78, 46.01), 12.4, 8.2, {
		heading = 0, minZ = 44.21, maxZ = 49.01,
	}, {
		disableEscorting = true,
		disableInventory = true,
		allowJobs        = { "ems", "prison", "police" },
	})
end)

AddEventHandler("Polyzone:Enter", function(id, point, insideZone, data)
	if id == "prison-hospital-check-in-zone" then
		_inCheckInZone = true
		if not LocalPlayer.state.isEscorted then
			exports['st_ui']:ActionShow("medical",
				"{keybind}primary_action{/keybind} Check In {key}$" .. Config.PrisonCheckIn.Cost .. "{/key}")
		end
	end

	if id == "prison_visitation" and not hasValue(data.allowJobs, LocalPlayer.state.onDuty) then
		if data.disableEscorting then
			LocalPlayer.state:set("AllowEscorting", false, true)
		end
		if data.disableInventory then
			exports.st_inventory:Disable()
		end
	end
end)

AddEventHandler("Polyzone:Exit", function(id, point, insideZone, data)
	if id == "prison-hospital-check-in-zone" then
		_inCheckInZone = false
		exports['st_ui']:ActionHide("medical")
	end
	if id == "prison_visitation" then
		if data.disableEscorting then
			LocalPlayer.state:set("AllowEscorting", true, true)
		end
		if data.disableInventory then
			exports.st_inventory:Enable()
		end
	end
end)

AddEventHandler("Keybinds:Client:KeyUp:primary_action", function()
	if _inCheckInZone and not LocalPlayer.state.doingAction and not LocalPlayer.state.isEscorted then
		TriggerEvent("Hospital:Client:PrisonHospitalRevive")
	end
end)

AddEventHandler("Hospital:Client:PrisonHospitalRevive", function()
	local animObj
	if LocalPlayer.state.isDead then
		animObj = { animDict = "dead", anim = "dead_d", flags = 1 }
	else
		animObj = { animDict = "move_m@_idles@shake_off", anim = "shakeoff_1", flags = 49 }
	end

	exports['st_ui']:Progress({
		name     = "prison_hospital_revive_action",
		duration = (math.random(10) + 45) * 1000,
		label    = "Healing",
		useWhileDead    = true,
		canCancel       = true,
		ignoreModifier  = true,
		controlDisables = {
			disableMovement    = true,
			disableCarMovement = false,
			disableMouse       = false,
			disableCombat      = true,
		},
		animation = {
			animDict = animObj.animDict,
			anim     = animObj.anim,
			flags    = animObj.flags,
		},
	}, function(status)
		if not status then
			exports["strata"]:ServerCallback("Hospital:PrisonHospitalRevive", {}, function(s)
				if s then
					exports['st_utils']:StopEscort()
				end
			end)
		end
	end)
end)
