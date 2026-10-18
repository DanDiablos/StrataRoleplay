local _curBed        = nil
local _bedId         = nil
local _healEnd       = nil
local _leavingBed    = false
local _done          = nil
local _doing         = false
local _inCheckInZone = false

local cam        = nil
local inBedDict  = "anim@gangops@morgue@table@"
local inBedAnim  = "ko_front"
local getOutDict = "switch@franklin@bed"
local getOutAnim = "sleep_getup_rubeyes"

local hospitalCheckin = {
	{
		icon       = "fas fa-clipboard-check",
		label      = "Go On Duty",
		event      = "EMS:Client:OnDuty",
		groups     = { "ems" },
		reqOffDuty = true,
	},
	{
		icon     = "fas fa-clipboard",
		label    = "Go Off Duty",
		event    = "EMS:Client:OffDuty",
		groups   = { "ems" },
		reqDuty  = true,
	},
	{
		icon     = "fas fa-clipboard",
		label    = "Check ICU Patients",
		event    = "EMS:Client:CheckICUPatients",
		groups   = { "ems" },
		reqDuty  = true,
	},
	{
		icon  = "fas fa-clipboard-check",
		label = "Check In - $1500",
		event = "Hospital:Client:CheckIn",
		canInteract = function()
			if not GlobalState["Duty:ems"] or GlobalState["Duty:ems"] == 0 then
				return not LocalPlayer.state.isEscorted
					and (GlobalState["ems:pmc:doctor"] == nil or GlobalState["ems:pmc:doctor"] == 0)
			end
			return false
		end,
	},
	{
		icon  = "fas fa-clipboard-check",
		label = "Check In - $1500",
		event = "Hospital:Client:CheckIn",
		canInteract = function()
			if GlobalState["Duty:ems"] and GlobalState["Duty:ems"] > 0 then
				return not LocalPlayer.state.isEscorted
					and (GlobalState["ems:pmc:doctor"] == nil or GlobalState["ems:pmc:doctor"] == 0)
			end
			return false
		end,
	},
	{
		icon  = "fas fa-hands-holding",
		label = "Retrieve Items",
		event = "Hospital:Client:RetreiveItems",
		canInteract = function()
			return LocalPlayer.state.Character:GetData("ICU") == nil
				or not LocalPlayer.state.Character:GetData("ICU").Items
		end,
	},
}

AddEventHandler('onClientResourceStart', function(resource)
	if resource ~= GetCurrentResourceName() then return end

	exports['st_utils']:Add(
		"hospital-check-in-1", `u_f_m_miranda_02`,
		vector3(1125.869, -1531.991, 34.033), 344.011, 25.0,
		hospitalCheckin, "notes-medical", "WORLD_HUMAN_CLIPBOARD"
	)
	exports['st_utils']:Add(
		"hospital-check-in-2", `s_f_y_scrubs_01`,
		vector3(1144.530, -1543.017, 34.033), 274.930, 25.0,
		hospitalCheckin, "notes-medical", "WORLD_HUMAN_CLIPBOARD"
	)
	exports['st_utils']:Add(
		"hospital-check-in-3", `s_f_y_scrubs_01`,
		vector3(1135.842, -1539.658, 38.504), 2.759, 25.0,
		hospitalCheckin, "notes-medical", "WORLD_HUMAN_CLIPBOARD"
	)

	exports['st_utils']:Add(
		"HiddenHospital", `s_m_m_doctor_01`,
		Config.HiddenHospital.Coords, Config.HiddenHospital.Heading, 25.0,
		{
			{
				icon  = "heart-pulse",
				text  = "Revive Escort (20 $MALD)",
				event = "Hospital:Client:HiddenRevive",
				data  = LocalPlayer.state.isEscorting or {},
				isEnabled = function()
					if LocalPlayer.state.isEscorting ~= nil and not LocalPlayer.state.isDead then
						local ps = Player(LocalPlayer.state.isEscorting).state
						return ps.isDead and not (ps.deadData and ps.deadData.isMinor)
					end
					return false
				end,
			},
		},
		'suitcase-medical', false, true,
		{ animDict = "mp_prison_break", anim = "hack_loop" }
	)

	for _, model in ipairs(Config.BedModels) do
		exports['st_target']:addModel(model, {
			{
				icon  = "stretcher",
				label = "Lay in Bed",
				event = "Hospital:Client:FindBed",
				distance = 1.5,
				canInteract = function()
					return LocalPlayer.state.isEscorting == nil
						and LocalPlayer.state.myEscorter == nil
						and not LocalPlayer.state.isHospitalized
				end,
			},
		})
	end

	for k, v in ipairs(Config.BedPolys) do
		exports['st_target']:addBoxZone({
			id       = string.format("hospitalbed-%s", k),
			coords   = v.center,
			size     = vector3(v.length, v.width, 2.0),
			rotation = v.options.heading or 0,
			debug    = false,
			minZ     = v.options.minZ,
			maxZ     = v.options.maxZ,
			options  = {
				{
					icon  = "stretcher",
					label = "Lay Down",
					onSelect = function()
						TriggerEvent("Hospital:Client:LaydownAnimation", v.laydown)
					end,
				},
			}
		})
	end

	exports['st_zones']:CreateBox('hospital-check-in-zone-1', vector3(1146.37, -1538.66, 35.03), 2.8, 1.2, {
		heading = 0, minZ = 32.63, maxZ = 36.63,
	}, {})
	exports['st_zones']:CreateBox('hospital-check-in-zone-2', vector3(1129.59, -1534.96, 35.03), 2.8, 1.2, {
		heading = 3, minZ = 32.63, maxZ = 36.63,
	}, {})
	exports['st_zones']:CreateBox('hospital-check-in-zone-3', vector3(1142.82, -1537.74, 39.5), 2.8, 1.2, {
		heading = 88, minZ = 37.1, maxZ = 41.1,
	}, {})

	exports['st_target']:addBoxZone({
		id       = "icu-checkout",
		coords   = vector3(1147.83, -1542.54, 39.5),
		size     = vector3(2.8, 0.8, 2.6),
		rotation = 0,
		debug    = false,
		minZ     = 38.5,
		maxZ     = 41.1,
		options  = {
			{
				icon  = "bell-concierge",
				label = "Request Personnel",
				event = "Hospital:Client:RequestEMS",
				canInteract = function()
					return (LocalPlayer.state.Character:GetData("ICU") ~= nil
						and not LocalPlayer.state.Character:GetData("ICU").Released)
						and (not _done or _done < GetCloudTimeAsInt())
				end,
			}
		}
	})

	exports['st_zones']:CreatePoly("hospital-icu-area", {
		vector2(1144.3436279297, -1541.1220703125),
		vector2(1144.3024902344, -1560.3250732422),
		vector2(1148.193359375,  -1560.3918457031),
		vector2(1154.2583007812, -1560.4184570312),
		vector2(1154.3413085938, -1555.5563964844),
		vector2(1154.4481201172, -1548.7468261719),
		vector2(1154.1629638672, -1540.7801513672),
	}, { minZ = 38.50, maxZ = 40.53 })
end)

local function SetBedCam(bed)
	_curBed = bed
	local player = PlayerPedId()

	if not IsScreenFadedOut() then
		DoScreenFadeOut(1000)
		while not IsScreenFadedOut() do
			Wait(1)
		end
	end

	if IsPedDeadOrDying(player) then
		local playerPos = GetEntityCoords(player, true)
		NetworkResurrectLocalPlayer(playerPos, true, true, false)
	end

	SetEntityCoords(player, _curBed.x, _curBed.y, _curBed.z)
	SetEntityHeading(player, _curBed.h)

	RequestAnimDict(inBedDict)
	while not HasAnimDictLoaded(inBedDict) do
		Wait(0)
	end

	SetEntityHeading(player, _curBed.h + 180)
	Wait(150)
	TaskPlayAnim(player, inBedDict, inBedAnim, 8.0, 1.0, -1, 1, 0, 0, 0, 0)

	CreateThread(function()
		Wait(500)
		while LocalPlayer.state.isHospitalized and not _leavingBed do
			TaskPlayAnim(player, inBedDict, inBedAnim, 8.0, 1.0, -1, 1, 0, 0, 0, 0)
			SetEntityInvincible(player, true)
			Wait(200)
		end
		SetEntityInvincible(player, false)
		ClearPedTasksImmediately(player)
	end)

	cam = CreateCam("DEFAULT_SCRIPTED_CAMERA", 1)
	SetCamActive(cam, true)
	RenderScriptCams(true, false, 1, true, true)
	AttachCamToPedBone(cam, player, 31085, 0, 0, 1.0, true)
	SetCamFov(cam, 90.0)
	SetCamRot(cam, -90.0, 0.0, GetEntityHeading(player) + 180, true)

	LocalPlayer.state:set("isHospitalized", true, true)
	DoScreenFadeIn(1000)
	while not IsScreenFadedIn() do
		Wait(1)
	end
	_leavingBed = false
end

local function LeaveBed()
	local player = PlayerPedId()

	if LocalPlayer.state.isDead then
		DoDeadEvent()
	else
		RequestAnimDict(getOutDict)
		while not HasAnimDictLoaded(getOutDict) do
			Wait(0)
		end

		local reductions = exports['st_injury']:GetReductions()
		if reductions > 0 then
			exports['st_ui']:ApplyUniqueBuff("weakness", -1)
		else
			exports['st_ui']:RemoveBuffType("weakness")
		end

		SetEntityInvincible(player, false)
		SetEntityHeading(player, _curBed.h - 90)
		TaskPlayAnim(player, getOutDict, getOutAnim, 100.0, 1.0, -1, 8, -1, 0, 0, 0)
		ClearPedTasksImmediately(player)
	end

	exports["strata"]:ServerCallback("Hospital:LeaveBed")
	if _curBed ~= nil and not _curBed.freeBed then
		exports['st_injury']:HospitalLeaveBed()
	end

	if LocalPlayer.state.isCuffed then
		SetPedConfigFlag(player, 120, true)
		SetPedConfigFlag(player, 121, LocalPlayer.state.isHardCuffed)
	end

	RenderScriptCams(0, true, 200, true, true)
	DestroyCam(cam, false)
	exports['st_ui']:DeathTextsHide()
	_curBed     = nil
	_leavingBed = false
	LocalPlayer.state:set("isHospitalized", false, true)
end

exports("HospitalCheckIn", function()
	exports["strata"]:ServerCallback('Hospital:Treat', {}, function(bed)
		if bed ~= nil then
			LocalPlayer.state:set("isHospitalized", true, true)
			exports['st_injury']:HospitalSendToBed(Config.Beds[bed], false, bed)
		else
			exports["st_ui"]:Notification("error", 'No Beds Available')
		end
	end)
end)

exports("HospitalSendToBed", function(bed, isRp, bedId)
	local gotobed = false

	if bedId then
		local p = promise.new()
		exports["strata"]:ServerCallback('Hospital:OccupyBed', bedId, function(s)
			p:resolve(s)
		end)
		gotobed = Citizen.Await(p)
	else
		gotobed = true
	end

	_bedId = bedId

	if bed ~= nil and gotobed then
		SetBedCam(bed)
		if isRp then
			_healEnd = GetCloudTimeAsInt()
			exports['st_ui']:DeathTextsShow("hospital_rp", GetCloudTimeAsInt(), _healEnd, "primary_action")
		else
			_healEnd = GetCloudTimeAsInt() + 60
			exports['st_ui']:DeathTextsShow("hospital", GetCloudTimeAsInt(), _healEnd, "primary_action")
			SetTimeout(((_healEnd - GetCloudTimeAsInt()) - 10) * 1000, function()
				if LocalPlayer.state.loggedIn and LocalPlayer.state.isHospitalized then
					LocalPlayer.state.deadData = {}
					exports['st_injury']:ReductionsReset()
					exports['st_injury']:Revive()
				end
			end)
		end
	else
		exports["st_ui"]:Notification("error", 'Invalid Bed or Bed Occupied')
	end
end)

exports("HospitalFindBed", function(object)
	local coords = GetEntityCoords(object)
	exports["strata"]:ServerCallback('Hospital:FindBed', coords, function(bed)
		if bed ~= nil then
			exports['st_injury']:HospitalSendToBed(Config.Beds[bed], true, bed)
		else
			exports['st_injury']:HospitalSendToBed({
				x       = coords.x,
				y       = coords.y,
				z       = coords.z,
				h       = GetEntityHeading(object),
				freeBed = true,
			}, true)
		end
	end)
end)

exports("HospitalLeaveBed", function()
	exports["strata"]:ServerCallback('Hospital:LeaveBed', _bedId, function()
		_bedId = nil
	end)
end)

AddEventHandler('Polyzone:Enter', function(id)
	if id == 'hospital-check-in-zone-1' or id == 'hospital-check-in-zone-2' or id == 'hospital-check-in-zone-3' then
		_inCheckInZone = true
		if not LocalPlayer.state.isEscorted
			and (GlobalState["ems:pmc:doctor"] == nil or GlobalState["ems:pmc:doctor"] == 0)
		then
			exports['st_ui']:ActionShow("medical", '{keybind}primary_action{/keybind} Check In {key}$1500{/key}')
		end
	end
end)

AddEventHandler('Polyzone:Exit', function(id)
	if id == 'hospital-check-in-zone-1' or id == 'hospital-check-in-zone-2' or id == 'hospital-check-in-zone-3' then
		_inCheckInZone = false
		exports['st_ui']:ActionHide("medical")
	elseif id == "hospital-icu-area" and LocalPlayer.state.loggedIn then
		if LocalPlayer.state.Character:GetData("ICU") and not LocalPlayer.state.Character:GetData("ICU").Released then
			TriggerEvent("Hospital:Client:ICU:Enter")
		end
	end
end)

AddEventHandler('Keybinds:Client:KeyUp:primary_action', function()
	if _inCheckInZone then
		if not LocalPlayer.state.doingAction and not LocalPlayer.state.isEscorted
			and (GlobalState["ems:pmc:doctor"] == nil or GlobalState["ems:pmc:doctor"] == 0)
		then
			TriggerEvent('Hospital:Client:CheckIn')
		end
	elseif _curBed ~= nil and LocalPlayer.state.isHospitalized and GetCloudTimeAsInt() > _healEnd and not _leavingBed then
		_leavingBed = true
		exports['st_ui']:DeathTextsRelease()
		LeaveBed()
	end
end)

RegisterNetEvent("Characters:Client:Logout", function()
	if LocalPlayer.state.isHospitalized then
		LocalPlayer.state:set("isHospitalized", false, true)
	end
end)

AddEventHandler("Hospital:Client:CheckIn", function()
	exports['st_ui']:ProgressWithStartEvent({
		name     = "hospital_action",
		duration = 2500,
		label    = "Checking In",
		useWhileDead    = true,
		canCancel       = true,
		ignoreModifier  = true,
		controlDisables = {
			disableMovement    = true,
			disableCarMovement = true,
			disableMouse       = false,
			disableCombat      = true,
		},
		animation = { anim = "clipboard_still" },
		disarm    = true,
	}, function()
		LocalPlayer.state:set("isHospitalized", true, true)
	end, function(status)
		if not status then
			exports['st_injury']:HospitalCheckIn()
		else
			LocalPlayer.state:set("isHospitalized", false, true)
		end
	end)
end)

RegisterNetEvent("Hospital:Client:GetOut", function()
	exports["strata"]:ServerCallback("Hospital:LeaveBed", {}, function()
		_doing = false
		LeaveBed()
	end)
end)

AddEventHandler("Hospital:Client:FindBed", function(event)
	if not event then return end
	exports['st_injury']:HospitalFindBed(event.entity)
end)

RegisterNetEvent("Hospital:Client:ICU:Enter", function()
	if not IsScreenFadedOut() then
		DoScreenFadeOut(1000)
		while not IsScreenFadedOut() do
			Wait(10)
		end
	end

	local room = Config.ICUBeds[math.random(#Config.ICUBeds)]
	SetEntityCoords(LocalPlayer.state.ped, room[1], room[2], room[3], 0, 0, 0, false)
	Wait(100)
	SetEntityHeading(LocalPlayer.state.ped, room[4])

	Wait(1000)
	DoScreenFadeIn(1000)
	while not IsScreenFadedIn() do
		Wait(10)
	end
end)

AddEventHandler("Hospital:Client:LaydownAnimation", function(coords)
	SetEntityCoords(LocalPlayer.state.ped, coords.x, coords.y, coords.z)
	SetEntityHeading(LocalPlayer.state.ped, coords.w)
	exports['st_emotes']:EmotesPlay("passout3", true)
	LocalPlayer.state:set("isHospitalized", true, true)

	while exports['st_emotes']:EmotesGet() == "passout3" do
		Wait(250)
	end

	LocalPlayer.state:set("isHospitalized", false, true)
end)

AddEventHandler("Hospital:Client:RetreiveItems", function()
	exports["strata"]:ServerCallback("Hospital:RetreiveItems")
end)

AddEventHandler("Hospital:Client:RequestEMS", function()
	if not _done or _done < GetCloudTimeAsInt() then
		TriggerServerEvent("EmergencyAlerts:Server:DoPredefined", "icurequest")
		_done = GetCloudTimeAsInt() + (60 * 10)
	end
end)

AddEventHandler("Hospital:Client:HiddenRevive", function()
	exports['st_ui']:Progress({
		name     = "ammo_action",
		duration = (math.random(5) + 15) * 1000,
		label    = "Reviving",
		useWhileDead    = false,
		canCancel       = true,
		ignoreModifier  = true,
		controlDisables = {
			disableMovement    = false,
			disableCarMovement = false,
			disableMouse       = false,
			disableCombat      = true,
		},
		animation = { task = "CODE_HUMAN_MEDIC_KNEEL" },
	}, function(status)
		if not status then
			exports["strata"]:ServerCallback("Hospital:HiddenRevive", {}, function(s)
				if s then
					exports['st_utils']:StopEscort()
				end
			end)
		end
	end)
end)
