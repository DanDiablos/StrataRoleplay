local _cam      = 0       -- GTA scripted camera handle
local _timecycle = nil    -- active timecycle modifier name
local _moveUp    = false
local _moveDown  = false
local _moveLeft  = false
local _moveRight = false

-- Quality setting → GTA timecycle modifier
local TIMECYCLES = {
	brown         = "phone_cam6",
	medium        = "CAMERA_BW",
	low           = "CAMERA_secuirity",
	blackandwhite = "phone_cam2",
	blurred       = "helicamfirst",
	nightvision   = "MP_heli_cam",
}

-- ── GTA camera helpers ────────────────────────────────────────────────────────

---@param x number
---@param y number
---@param z number
---@param r CameraRotation
local function SetupCamera(x, y, z, r)
	if _cam ~= 0 then
		DestroyCam(_cam, false)
		_cam = 0
	end
	local cam = CreateCam("DEFAULT_SCRIPTED_CAMERA", true)
	SetCamCoord(cam, x, y, z)
	SetCamRot(cam, r.x, r.y, r.z, 2)
	RenderScriptCams(true, false, 0, true, true)
	Wait(250)
	_cam = cam
end

local function DestroyCamera()
	if _cam ~= 0 then
		DestroyCam(_cam, false)
		RenderScriptCams(false, false, 1, true, true)
		_cam = 0
	end
	if _timecycle then
		ClearTimecycleModifier()
		_timecycle = nil
	end
	SetFocusEntity(PlayerPedId())
end

-- ── Overlay ───────────────────────────────────────────────────────────────────

---@param camData CameraConfig
local function ShowOverlay(camData)
	local hints = {}
	if camData.group then
		hints[#hints + 1] = { keys = { "←", "→" }, label = "Cycle Cameras" }
	end
	if camData.canRotate and camData.isOnline then
		hints[#hints + 1] = { keys = { "W", "S" }, label = "Tilt" }
		hints[#hints + 1] = { keys = { "A", "D" }, label = "Pan" }
	end
	hints[#hints + 1] = { keys = { "ESC" }, label = "Disconnect" }
	exports['st_ui']:InfoOverlayShow(camData.label, hints, { icon = "camera", sub = "Security Feed", live = true })
end

-- ── Control loop ──────────────────────────────────────────────────────────────

local function CameraLoop(camKey)
	-- Disable all player controls while in camera
	CreateThread(function()
		while _cam ~= 0 and LocalPlayer.state.inCCTVCam?.camKey == camKey do
			DisableControlAction(0, 1,   true) -- LookLeftRight
			DisableControlAction(0, 2,   true) -- LookUpDown
			DisableControlAction(0, 22,  true) -- Jump
			DisableControlAction(0, 24,  true) -- Attack
			DisableControlAction(0, 25,  true) -- Aim
			DisableControlAction(0, 30,  true) -- MoveLeftRight
			DisableControlAction(0, 31,  true) -- MoveUpDown
			DisableControlAction(0, 36,  true) -- Duck
			DisableControlAction(0, 44,  true) -- Cover
			DisableControlAction(0, 47,  true) -- Weapon
			DisableControlAction(0, 58,  true) -- Weapon
			DisableControlAction(0, 63,  true) -- VehTurnLeft
			DisableControlAction(0, 64,  true) -- VehTurnRight
			DisableControlAction(0, 71,  true) -- VehAccelerate
			DisableControlAction(0, 72,  true) -- VehBrake
			DisableControlAction(0, 75,  true) -- VehExit
			DisableControlAction(0, 106, true) -- VehicleMouseControlOverride
			DisableControlAction(0, 140, true) -- MeleeAttack
			DisableControlAction(0, 141, true) -- MeleeAttack2
			DisableControlAction(0, 142, true) -- MeleeAttack3
			DisableControlAction(0, 143, true) -- MeleeAttack4
			DisableControlAction(0, 263, true) -- MeleeAttack Light
			DisableControlAction(0, 264, true) -- MeleeAttack Heavy
			DisableControlAction(0, 257, true) -- MeleeAttack Alternate
			DisableControlAction(1, 37,  true) -- SelectWeapon
			DisablePlayerFiring(PlayerId(), true)
			Wait(1)
		end
	end)

	-- Handle camera rotation
	CreateThread(function()
		while _cam ~= 0 and LocalPlayer.state.inCCTVCam?.camKey == camKey do
			local camData = GlobalState[camKey]
			if camData and camData.canRotate and camData.isOnline then
				local rot  = GetCamRot(_cam, 2)
				local rotX = rot.x
				local rotZ = rot.z
				local changed = false

				if _moveUp   and rotX < 0.0   then rotX += 0.7  changed = true end
				if _moveDown and rotX > -50.0  then rotX -= 0.7  changed = true end
				if _moveLeft                   then rotZ += 0.7  changed = true end
				if _moveRight                  then rotZ -= 0.7  changed = true end

				if changed then
					SetCamRot(_cam, rotX, 0.0, rotZ, 2)
				end
			end
			SetTimecycleModifierStrength(1.0)
			Wait(1)
		end
	end)
end

-- ── Enter / Exit ──────────────────────────────────────────────────────────────

---@param camId integer
local function EnterCam(camId)
	local camKey  = ("CCTV:Camera:%d"):format(camId)
	local camData = GlobalState[camKey]
	if not camData or GlobalState["Sync:Blackout"] then return end

	LocalPlayer.state:set("inCCTVCam", { camKey = camKey, camId = camId }, true)

	DoScreenFadeOut(250)
	while not IsScreenFadedOut() do Wait(0) end

	local tc = camData.isOnline and (TIMECYCLES[camData.quality] or "Broken_camera_fuzz") or "Broken_camera_fuzz"
	SetTimecycleModifier(tc)
	_timecycle = tc

	Wait(200)

	SetFocusArea(camData.x, camData.y, camData.z, camData.x, camData.y, camData.z)
	SetupCamera(camData.x, camData.y, camData.z, camData.r)

	DoScreenFadeIn(250)
	ShowOverlay(camData)
	CameraLoop(camKey)
end

local function ExitCam()
	exports['st_ui']:InfoOverlayClose()

	DoScreenFadeOut(250)
	while not IsScreenFadedOut() do Wait(0) end

	LocalPlayer.state:set("inCCTVCam", false, true)
	DestroyCamera()

	DoScreenFadeIn(250)
end

-- ── Exports ───────────────────────────────────────────────────────────────────

exports("View", function(camId)
	EnterCam(camId)
end)

exports("Close", function()
	if LocalPlayer.state.inCCTVCam then
		ExitCam()
	end
end)

-- ── Keybinds ─────────────────────────────────────────────────────────────────

local function RegisterKeybinds()
	exports["st_binds"]:Add("cctv_disconnect", "ESCAPE", "keyboard", "CCTV - Disconnect", function()
		if LocalPlayer.state.inCCTVCam then
			exports['st_cameras']:Close()
		end
	end)

	exports["st_binds"]:Add("cctv_previous", "LEFT", "keyboard", "CCTV - Previous Camera", function()
		if LocalPlayer.state.inCCTVCam then
			TriggerServerEvent("CCTV:Server:PreviousInGroup")
		end
	end)

	exports["st_binds"]:Add("cctv_next", "RIGHT", "keyboard", "CCTV - Next Camera", function()
		if LocalPlayer.state.inCCTVCam then
			TriggerServerEvent("CCTV:Server:NextInGroup")
		end
	end)

	exports["st_binds"]:Add("cctv_up", "W", "keyboard", "CCTV - Tilt Up",
		function() if LocalPlayer.state.inCCTVCam then _moveUp   = true  end end,
		function() _moveUp   = false end)

	exports["st_binds"]:Add("cctv_down", "S", "keyboard", "CCTV - Tilt Down",
		function() if LocalPlayer.state.inCCTVCam then _moveDown  = true  end end,
		function() _moveDown  = false end)

	exports["st_binds"]:Add("cctv_left", "A", "keyboard", "CCTV - Pan Left",
		function() if LocalPlayer.state.inCCTVCam then _moveLeft  = true  end end,
		function() _moveLeft  = false end)

	exports["st_binds"]:Add("cctv_right", "D", "keyboard", "CCTV - Pan Right",
		function() if LocalPlayer.state.inCCTVCam then _moveRight = true  end end,
		function() _moveRight = false end)
end

-- ── Events ────────────────────────────────────────────────────────────────────

RegisterNetEvent("CCTV:View", function(camId)
	EnterCam(camId)
end)

AddEventHandler("onClientResourceStart", function(resource)
	if resource ~= GetCurrentResourceName() then return end
	RegisterKeybinds()
end)
