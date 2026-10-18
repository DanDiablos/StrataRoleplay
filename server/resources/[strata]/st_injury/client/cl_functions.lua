local koDict  = "mini@cpr@char_b@cpr_def"
local koAnim  = "cpr_pumpchest_idle"
local deadDict = "dead"
local deadAnim = "dead_d"
local vehDict  = "veh@low@front_ps@idle_duck"
local vehAnim  = "sit"
local drownDict = "dam_ko"
local drownAnim = "drown"

CreateThread(function()
	Strata.World.StageAnim(koDict)
	Strata.World.StageAnim(deadDict)
	Strata.World.StageAnim(vehDict)
end)

---@param ped integer
function ApplyLimp(ped)
	local shouldLimp = (GetEntityHealth(ped) - 100) <= math.floor((GetEntityMaxHealth(ped) - 100) / 4)
	if shouldLimp and not (LocalPlayer.state.onPainKillers or 0 > 0) then
		if not LocalPlayer.state.isLimping then
			LocalPlayer.state.isLimping = true
			exports['st_emotes']:PedFeaturesRequestFeaturesUpdate()
		end
	else
		if LocalPlayer.state.isLimping then
			LocalPlayer.state.isLimping = false
			exports['st_emotes']:PedFeaturesRequestFeaturesUpdate()
		end
	end
end

---@param isMinor boolean
---@return integer
function GetReleaseTime(isMinor)
	if LocalPlayer.state.isDead then
		if isMinor then
			return 60 * 1
		elseif LocalPlayer.state.onDuty == "police" or LocalPlayer.state.onDuty == "ems" then
			return 60 * 3
		else
			return 60 * 5
		end
	end
	return 0
end

---@param hash integer
---@return boolean
function wasMinorDeath(hash)
	return Config.Weapons[hash] ~= nil and Config.Weapons[hash].minor == true
end

function DoDeadEvent()
	if LocalPlayer.state.isDead then
		TriggerEvent('st_inventory:disarm', LocalPlayer.state.ped, true)
		if not LocalPlayer.state.gameMode then
			exports['st_ui']:RemoveBuffType("weakness")
			DisableControls()
			DeadAnimLoop()
		else
			exports['st_ui']:DeathTextsHide()
			TriggerEvent(string.format("Damage:Client:Gamemode:%s:Died", LocalPlayer.state.gameMode))
		end
	else
		exports['st_ui']:DeathTextsHide()
		ClearPedTasksImmediately(PlayerPedId())
		SetEntityInvincible(PlayerPedId(), LocalPlayer.state.isAdmin and LocalPlayer.state.isGodmode or false)
	end
end

local deathLooping = false
local aDict = deadDict
local aAnim = deadAnim

function DeadAnimLoop()
	CreateThread(function()
		local ped = PlayerPedId()

		aDict = deadDict
		aAnim = deadAnim

		local seat = 0
		local veh = GetVehiclePedIsIn(ped)
		if veh ~= 0 then
			local m = GetEntityModel(veh)
			for k = -1, GetVehicleModelNumberOfSeats(m) do
				if GetPedInVehicleSeat(veh, k) == ped then
					seat = k
				end
			end
		end

		DoScreenFadeOut(1000)
		while not IsScreenFadedOut() do
			Wait(10)
		end

		if Config.EnableDownblur then
			AnimpostfxPlay("DeathFailMPIn", 100.0, true)
		end

		local loc = GetEntityCoords(ped)
		NetworkResurrectLocalPlayer(loc, true, true, false)

		if not veh then
			ClearPedTasksImmediately(ped)
		else
			TaskWarpPedIntoVehicle(ped, veh, seat)
			Wait(300)
		end

		if (type(LocalPlayer.state.deadData) == "table") and LocalPlayer.state?.deadData?.isMinor then
			aDict = koDict
			aAnim = koAnim
		end

		DoScreenFadeIn(1000)
		SetEntityHealth(ped, 200)

		if not deathLooping then
			deathLooping = true

			while LocalPlayer.state.loggedIn and LocalPlayer.state.isDead and not LocalPlayer.state.isHospitalized do
				ped = PlayerPedId()

				if not LocalPlayer.state?.deadData?.isMinor then
					SetEntityInvincible(ped, true)
				else
					SetEntityInvincible(ped, false)
				end

				if IsPedInAnyVehicle(ped) then
					TaskPlayAnim(ped, vehDict, vehAnim, 8.0, -8, -1, 1, 0, 0, 0, 0)
				elseif IsEntityInWater(ped) then
					TaskPlayAnim(ped, drownDict, drownAnim, 8.0, -8, -1, 1, 0, 0, 0, 0)
				elseif LocalPlayer.state.inTrunk then
					-- nothing while in trunk
				else
					TaskPlayAnim(ped, aDict, aAnim, 1.0, 1.0, -1, 1, 0, 0, 0, 0)
				end
				Wait(100)
			end

			if Config.EnableDownblur then
				AnimpostfxStop("DeathFailMPIn")
			end

			exports['st_ui']:DeathTextsHide()
			ClearPedTasksImmediately(ped)
			SetEntityInvincible(ped, LocalPlayer.state.isAdmin and LocalPlayer.state.isGodmode or false)

			deathLooping = false
		end
	end)
end

local disabling = false
function DisableControls()
	if disabling then return end
	disabling = true
	CreateThread(function()
		while LocalPlayer.state.loggedIn and LocalPlayer.state.isDead do
			DisableControlAction(0, 30, true)
			DisableControlAction(0, 31, true)
			DisableControlAction(0, 36, true)
			DisableControlAction(0, 21, true)
			DisableControlAction(0, 44, true)
			DisableControlAction(0, 63, true)
			DisableControlAction(0, 64, true)
			DisableControlAction(0, 71, true)
			DisableControlAction(0, 72, true)
			DisableControlAction(0, 75, true)
			DisablePlayerFiring(PlayerId(), true)
			DisableControlAction(0, 24, true)
			DisableControlAction(0, 25, true)
			DisableControlAction(1, 37, true)
			DisableControlAction(0, 47, true)
			DisableControlAction(0, 58, true)
			DisableControlAction(0, 140, true)
			DisableControlAction(0, 141, true)
			DisableControlAction(0, 142, true)
			DisableControlAction(0, 143, true)
			DisableControlAction(0, 263, true)
			DisableControlAction(0, 264, true)
			DisableControlAction(0, 257, true)
			Wait(1)
		end
		disabling = false
	end)
end

---@param dist number
---@return boolean
function nearPlayer(dist)
	local peds = GetGamePool("CPed")
	local myCoords = GetEntityCoords(LocalPlayer.state.ped)
	for _, ped in ipairs(peds) do
		if ped ~= LocalPlayer.state.ped and IsPedAPlayer(ped) then
			if #(GetEntityCoords(ped) - myCoords) <= dist then
				return true
			end
		end
	end
	return false
end
