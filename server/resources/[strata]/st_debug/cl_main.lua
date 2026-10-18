local _enabled    = false
local _freezeNpcs = false
local _lowGrav    = false

local KEY_E = 38
local KEY_G = 47

-- ── 2D screen overlay ────────────────────────────────────────────────────────

---@param ped number
local function DrawOverlay(ped)
	local pos    = GetEntityCoords(ped)
	local street = GetStreetNameFromHashKey(GetStreetNameAtCoord(pos.x, pos.y, pos.z))

	local function row(y, label, value)
		SetTextFont(0)
		SetTextProportional(0)
		SetTextScale(0.25, 0.25)
		SetTextColour(55, 155, 55, 255)
		SetTextDropShadow()
		SetTextOutline()
		SetTextEntry("STRING")
		AddTextComponentString(label .. tostring(value))
		DrawText(0.6, y)
	end

	row(0.50, "Coords:  ", ("%.3f, %.3f, %.3f"):format(pos.x, pos.y, pos.z))
	row(0.52, "Heading: ", ("%.2f"):format(GetEntityHeading(ped)))
	row(0.54, "Health:  ", GetEntityHealth(ped))
	row(0.56, "Speed:   ", ("%.1f"):format(GetEntitySpeed(ped)))
	row(0.58, "H a G:   ", ("%.3f"):format(GetEntityHeightAboveGround(ped)))
	row(0.60, "Model:   ", GetEntityModel(ped))
	row(0.62, "Frame:   ", ("%.4f"):format(GetFrameTime()))
	row(0.64, "Street:  ", street)
	row(0.66, "Freeze:  ", _freezeNpcs)
	row(0.68, "LowGrav: ", _lowGrav)
end

-- ── 3D world labels ───────────────────────────────────────────────────────────

---@param x number
---@param y number
---@param z number
---@param text string
local function DrawLabel3D(x, y, z, text)
	local onScreen, sx, sy = World3dToScreen2d(x, y, z)
	if not onScreen then return end

	SetTextScale(0.35, 0.35)
	SetTextFont(4)
	SetTextProportional(1)
	SetTextColour(255, 255, 255, 215)
	SetTextEntry("STRING")
	SetTextCentre(1)
	AddTextComponentString(text)
	DrawText(sx, sy)

	local factor = #text / 370
	DrawRect(sx, sy + 0.0125, 0.015 + factor, 0.03, 41, 11, 41, 68)
end

-- ── Direction lines ───────────────────────────────────────────────────────────

---@param ped number
---@param pos vector3
local function DrawDirectionLines(ped, pos)
	local fwd  = GetOffsetFromEntityInWorldCoords(ped,  0,    1.0,  0)
	local back = GetOffsetFromEntityInWorldCoords(ped,  0,   -1.0,  0)
	local left = GetOffsetFromEntityInWorldCoords(ped,  1.0,  0,    0)
	local rght = GetOffsetFromEntityInWorldCoords(ped, -1.0,  0,    0)
	local fwd2 = GetOffsetFromEntityInWorldCoords(ped,  0,    2.0,  0)
	local bk2  = GetOffsetFromEntityInWorldCoords(ped,  0,   -2.0,  0)
	local lt2  = GetOffsetFromEntityInWorldCoords(ped,  2.0,  0,    0)
	local rt2  = GetOffsetFromEntityInWorldCoords(ped, -2.0,  0,    0)

	DrawLine(pos, fwd,  255, 0,   0,   115)
	DrawLine(pos, back, 255, 0,   0,   115)
	DrawLine(pos, left, 255, 255, 0,   115)
	DrawLine(pos, rght, 255, 255, 0,   115)
	DrawLine(fwd,  fwd2, 255, 0,   255, 115)
	DrawLine(back, bk2,  255, 0,   255, 115)
	DrawLine(left, lt2,  255, 255, 255, 115)
	DrawLine(rght, rt2,  255, 255, 255, 115)
end

-- ── Entity scanning ───────────────────────────────────────────────────────────

---@param origin vector3
---@param localPed number
local function ScanVehicles(origin, localPed)
	local handle, veh = FindFirstVehicle()
	local found
	repeat
		local pos = GetEntityCoords(veh)
		if #(origin - pos) < 30.0 then
			local contact = IsEntityTouchingEntity(localPed, veh) and "  [CONTACT]" or ""
			DrawLabel3D(pos.x, pos.y, pos.z + 1,
				("Veh: %d  Model: %d%s"):format(veh, GetEntityModel(veh), contact))
			if _lowGrav then
				SetEntityCoords(veh, pos.x, pos.y, pos.z + 5.0, false, false, false, false)
			end
		end
		found, veh = FindNextVehicle(handle)
	until not found
	EndFindVehicle(handle)
end

---@param origin vector3
---@param localPed number
local function ScanObjects(origin, localPed)
	local handle, obj = FindFirstObject()
	local found
	repeat
		local pos = GetEntityCoords(obj)
		if #(origin - pos) < 10.0 then
			local contact = IsEntityTouchingEntity(localPed, obj) and "  [CONTACT]" or ""
			DrawLabel3D(pos.x, pos.y, pos.z + 1,
				("Obj: %d  Model: %d%s"):format(obj, GetEntityModel(obj), contact))
			if _lowGrav then
				SetEntityCoords(obj, pos.x, pos.y, pos.z + 0.1, false, false, false, false)
				FreezeEntityPosition(obj, false)
			end
		end
		found, obj = FindNextObject(handle)
	until not found
	EndFindObject(handle)
end

---@param origin vector3
---@param localPed number
local function ScanPeds(origin, localPed)
	local handle, ped = FindFirstPed()
	local found
	repeat
		local pos = GetEntityCoords(ped)
		if ped ~= localPed and DoesEntityExist(ped) and #(origin - pos) < 30.0 then
			local contact = IsEntityTouchingEntity(localPed, ped) and "  [CONTACT]" or ""
			DrawLabel3D(pos.x, pos.y, pos.z,
				("Ped: %d  Model: %d  Rel: %d%s"):format(
					ped, GetEntityModel(ped), GetPedRelationshipGroupHash(ped), contact))
			FreezeEntityPosition(ped, _freezeNpcs)
			if _lowGrav then
				SetPedToRagdoll(ped, 511, 511, 0, 0, 0, 0)
				SetEntityCoords(ped, pos.x, pos.y, pos.z + 0.1, false, false, false, false)
			end
		end
		found, ped = FindNextPed(handle)
	until not found
	EndFindPed(handle)
end

-- ── Main loop ─────────────────────────────────────────────────────────────────

CreateThread(function()
	while true do
		if _enabled then
			local ped = PlayerPedId()
			local pos = GetEntityCoords(ped)

			DrawOverlay(ped)
			DrawDirectionLines(ped, pos)
			ScanVehicles(pos, ped)
			ScanObjects(pos, ped)
			ScanPeds(pos, ped)

			if IsControlJustReleased(0, KEY_E) then
				_freezeNpcs = not _freezeNpcs
			end
			if IsControlJustReleased(0, KEY_G) then
				_lowGrav = not _lowGrav
			end

			Wait(1)
		else
			Wait(5000)
		end
	end
end)

-- ── Toggle ────────────────────────────────────────────────────────────────────

RegisterNetEvent("Debug:Toggle", function()
	_enabled    = not _enabled
	_freezeNpcs = false
	_lowGrav    = false
end)
