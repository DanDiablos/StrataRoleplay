-- ── Helpers ───────────────────────────────────────────────────────────────────

---@param source number
---@return boolean
local function IsAuthorized(source)
	local pState = Player(source).state
	if Config.AllowedJobs[pState.onDuty] then return true end
	local player = Strata.User.Account(source)
	return player ~= nil and player.Permissions:IsAdmin()
end

-- Search forward (direction=1) or backward (direction=-1) through the camera
-- list for the next camera in the same group, wrapping around if needed.
---@param currentId integer
---@param group     string
---@param direction integer  1 or -1
---@return integer|nil
local function FindInGroup(currentId, group, direction)
	local n = #Config.Cameras

	-- Primary pass
	local i = currentId + direction
	while i >= 1 and i <= n do
		if i ~= currentId and Config.Cameras[i] and Config.Cameras[i].group == group then
			return i
		end
		i = i + direction
	end

	-- Wrap-around pass
	i = direction > 0 and 1 or n
	while i ~= currentId do
		if Config.Cameras[i] and Config.Cameras[i].group == group then
			return i
		end
		i = i + direction
	end

	return nil
end

-- ── Camera state ──────────────────────────────────────────────────────────────

local function SetupCameras()
	for i, cam in ipairs(Config.Cameras) do
		GlobalState[("CCTV:Camera:%d"):format(i)] = cam
	end
	GlobalState["CCTV:Camera:Total"] = #Config.Cameras
	Strata.Log.Trace("CCTV", ("Loaded ^2%d^7 cameras"):format(#Config.Cameras))
end

-- ── Exports ───────────────────────────────────────────────────────────────────

exports("View", function(source, camId)
	if not IsAuthorized(source) then return end
	TriggerClientEvent("CCTV:View", source, camId)
end)

exports("ViewGroup", function(source, group)
	for i, cam in ipairs(Config.Cameras) do
		if cam.group == group then
			exports['st_cameras']:View(source, i)
			return
		end
	end
end)

exports("StateOnline", function(camId)
	local key  = ("CCTV:Camera:%d"):format(camId)
	local data = GlobalState[key]
	if not data then return end
	data.isOnline = true
	GlobalState[key] = data
end)

exports("StateOffline", function(camId)
	local key  = ("CCTV:Camera:%d"):format(camId)
	local data = GlobalState[key]
	if not data then return end
	data.isOnline = false
	GlobalState[key] = data
end)

exports("StateGroupOnline", function(group)
	for i, cam in ipairs(Config.Cameras) do
		if cam.group == group then
			exports['st_cameras']:StateOnline(i)
		end
	end
end)

exports("StateGroupOffline", function(group)
	for i, cam in ipairs(Config.Cameras) do
		if cam.group == group then
			exports['st_cameras']:StateOffline(i)
		end
	end
end)

-- ── Group cycling (server events → client) ───────────────────────────────────
-- Previous/next used to be server callbacks but never called cb(), leaving the
-- client waiting forever. Converted to fire-and-forget server events.

RegisterNetEvent("CCTV:Server:PreviousInGroup", function()
	local src    = source
	local pState = Player(src).state
	if not pState.inCCTVCam then return end

	local group = Config.Cameras[pState.inCCTVCam.camId]?.group
	if not group then return end

	local nextId = FindInGroup(pState.inCCTVCam.camId, group, -1)
	if nextId then
		exports['st_cameras']:View(src, nextId)
	end
end)

RegisterNetEvent("CCTV:Server:NextInGroup", function()
	local src    = source
	local pState = Player(src).state
	if not pState.inCCTVCam then return end

	local group = Config.Cameras[pState.inCCTVCam.camId]?.group
	if not group then return end

	local nextId = FindInGroup(pState.inCCTVCam.camId, group, 1)
	if nextId then
		exports['st_cameras']:View(src, nextId)
	end
end)

-- ── Bootstrap ─────────────────────────────────────────────────────────────────

AddEventHandler("onResourceStart", function(resource)
	if resource ~= GetCurrentResourceName() then return end
	SetupCameras()
end)
