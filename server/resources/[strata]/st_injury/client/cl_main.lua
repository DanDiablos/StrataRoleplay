local _reductions = 0
local _hasKO      = false

AddEventHandler('onClientResourceStart', function(resource)
	if resource ~= GetCurrentResourceName() then return end

	exports["strata"]:RegisterClientCallback("Damage:Heal", function(s)
		if s then
			LocalPlayer.state.deadData = {}
			exports['st_injury']:ReductionsReset()
		end
		exports['st_injury']:Revive()
	end)

	exports["strata"]:RegisterClientCallback("Damage:FieldStabalize", function()
		exports['st_injury']:Revive(true)
	end)

	exports["strata"]:RegisterClientCallback("Damage:Kill", function()
		ApplyDamageToPed(LocalPlayer.state.ped, 10000)
	end)

	exports["strata"]:RegisterClientCallback("Damage:Admin:Godmode", function(s)
		if s then
			exports['st_ui']:ApplyBuff("godmode")
		else
			exports['st_ui']:RemoveBuffType("godmode")
		end
	end)
end)

RegisterNetEvent("Characters:Client:Spawned", function()
	for weapon, modifier in pairs(Config.MeleeModifiers) do
		SetWeaponDamageModifier(weapon, modifier)
	end

	StartThreads()

	exports['st_ui']:RegisterBuff("weakness", "bandage",      "#FF0049", -1, "permanent")
	exports['st_ui']:RegisterBuff("godmode",  "shield-virus", "#FFBB04", -1, "permanent")

	_reductions = LocalPlayer.state.Character:GetData("HPReductions") or 0
	if _reductions > 0 then
		exports['st_ui']:ApplyUniqueBuff("weakness", -1)
	else
		exports['st_ui']:RemoveBuffType("weakness")
	end
	exports['st_injury']:CalculateMaxHp()

	if LocalPlayer.state.isDead then
		exports['st_ui']:DeathTextsShow(
			(LocalPlayer.state.deadData and LocalPlayer.state.deadData.isMinor) and "knockout" or "death",
			LocalPlayer.state.isDeadTime,
			LocalPlayer.state.releaseTime
		)
		exports['st_ui']:Dead(true)
		DoDeadEvent()
	end
end)

RegisterNetEvent("Characters:Client:Logout", function()
	if LocalPlayer.state.isDead then
		if Config.EnableDownblur then
			AnimpostfxStop("DeathFailMPIn")
		end
		exports['st_ui']:DeathTextsHide()
		ClearPedTasksImmediately(PlayerPedId())
		LocalPlayer.state:set("isDead",       false, true)
		LocalPlayer.state:set("deadData",     false, true)
		LocalPlayer.state:set("isDeadTime",   false, true)
		LocalPlayer.state:set("releaseTime",  false, true)
	end
	exports['st_ui']:RemoveBuffType("weakness")
end)

RegisterNetEvent('UI:Client:Reset', function()
	if not LocalPlayer.state.isDead and not LocalPlayer.state.isHospitalized then
		exports['st_ui']:DeathTextsHide()
		exports['st_ui']:Dead(false)
		if _reductions > 0 then
			exports['st_ui']:ApplyUniqueBuff("weakness", -1)
		else
			exports['st_ui']:RemoveBuffType("weakness")
		end
	end
end)

exports("GetReductions", function()
	return _reductions
end)

exports("ReductionsIncrease", function(amt)
	_reductions += amt
	exports['st_ui']:ApplyUniqueBuff("weakness", -1)
	exports["strata"]:ServerCallback("Damage:SyncReductions", _reductions)
	exports['st_injury']:CalculateMaxHp()
end)

exports("ReductionsReset", function()
	_reductions = 0
	exports['st_ui']:RemoveBuffType("weakness")
	exports["strata"]:ServerCallback("Damage:SyncReductions", _reductions)
	exports['st_injury']:CalculateMaxHp()
end)

exports("CalculateMaxHp", function()
	local ped    = PlayerPedId()
	local curr   = GetEntityHealth(ped)
	local mod    = math.min(0.25 * _reductions, 0.8)
	local newMax = 100 + math.ceil(100 * (1.0 - mod))

	SetEntityMaxHealth(ped, newMax)
	if curr > newMax then
		SetEntityHealth(ped, newMax)
	end
	exports['st_ui']:ForceHP()
end)

exports("WasDead", function(sid)
	return false
end)

exports("Died", function()
	-- reserved
end)

exports("ApplyStandardDamage", function(value, armorFirst, forceKill)
	if forceKill and not _hasKO then
		_hasKO = true
	end
	ApplyDamageToPed(LocalPlayer.state.ped, value, armorFirst)
end)

exports("Revive", function(fieldTreat)
	local player = PlayerPedId()

	if LocalPlayer.state.isDead then
		DoScreenFadeOut(1000)
		while not IsScreenFadedOut() do
			Wait(10)
		end
	end

	local wasDead  = LocalPlayer.state.isDead
	local wasMinor = LocalPlayer.state.deadData and LocalPlayer.state.deadData.isMinor

	if LocalPlayer.state.isDead     then LocalPlayer.state:set("isDead",      false, true) end
	if LocalPlayer.state.deadData   then LocalPlayer.state:set("deadData",    false, true) end
	if LocalPlayer.state.isDeadTime then LocalPlayer.state:set("isDeadTime",  false, true) end
	if LocalPlayer.state.releaseTime then LocalPlayer.state:set("releaseTime", false, true) end

	local veh  = GetVehiclePedIsIn(player)
	local seat = 0
	if veh ~= 0 then
		local m = GetEntityModel(veh)
		for k = -1, GetVehicleModelNumberOfSeats(m) do
			if GetPedInVehicleSeat(veh, k) == player then
				seat = k
			end
		end
	end

	if veh ~= 0 then
		Wait(300)
		TaskWarpPedIntoVehicle(player, veh, seat)
		Wait(300)
	end

	TriggerServerEvent("Damage:Server:Revived", wasMinor, fieldTreat)
	exports['st_ui']:Dead(false)

	if not LocalPlayer.state.isHospitalized and wasDead then
		exports['st_ui']:DeathTextsHide()
		SetEntityInvincible(player, LocalPlayer.state.isAdmin and LocalPlayer.state.isGodmode or false)
	end

	if _reductions > 0 then
		exports['st_ui']:ApplyUniqueBuff("weakness", -1)
	else
		exports['st_ui']:RemoveBuffType("weakness")
	end

	local mod    = math.min(0.25 * _reductions, 0.8)
	local newMax = 100 + math.ceil(100 * (1.0 - mod))

	SetEntityHealth(player, newMax)
	SetPlayerSprint(PlayerId(), true)
	ClearPedBloodDamage(player)

	if not fieldTreat then
		exports['st_utils']:Reset()
	end

	DoScreenFadeIn(1000)

	if not LocalPlayer.state.isHospitalized and wasDead and veh == 0 then
		exports['st_emotes']:EmotesPlay("reviveshit", false, 1750, true)
	end
end)
