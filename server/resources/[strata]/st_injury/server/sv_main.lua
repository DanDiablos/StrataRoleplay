local _damagedLimbs = {}
local _deadCunts    = {}

AddEventHandler('onResourceStart', function(resource)
	if resource ~= GetCurrentResourceName() then return end

	exports['strata']:MiddlewareAdd("Characters:Spawning", function(source)
		local char = Strata.User.Find(source)
		if char == nil then return end

		local sid    = char:GetData("SID")
		local pState = Player(source).state

		if _deadCunts[sid] ~= nil then
			pState.isDead       = true
			pState.deadData     = _deadCunts[sid].deadData
			pState.isDeadTime   = _deadCunts[sid].isDeadTime
			pState.releaseTime  = _deadCunts[sid].releaseTime
			Wait(100)
		end

		if char:GetData("Damage") ~= nil then
			char:SetData("Damage", nil)
		end

		_damagedLimbs[sid] = _damagedLimbs[sid] or {}
	end, 2)

	exports["strata"]:RegisterServerCallback("Damage:GetLimbDamage", function(source, data, cb)
		if data == nil or source == nil then cb({}) return end

		local char = Strata.User.Find(data)
		if char == nil then cb({}) return end

		local damage   = exports['st_injury']:GetLimbDamage(char:GetData("SID"))
		local menuData = {}

		local reductions = char:GetData("HPReductions") or 0
		if reductions > 1 then
			table.insert(menuData, { label = "Signs of Trauma", description = "Signs of multiple major traumas (Health Reduced)" })
		elseif reductions > 0 then
			table.insert(menuData, { label = "Sign of Trauma", description = "Sign of major trauma (Health Reduced)" })
		end

		for bone, hits in pairs(damage) do
			local parts = {}
			for dmgType, count in pairs(hits) do
				if count > 0 then
					table.insert(parts, string.format("%s %s", count, Config.DamageTypeLabels[dmgType]))
				end
			end
			if #parts > 0 then
				table.insert(menuData, {
					label       = Config.BoneLabels[bone],
					description = table.concat(parts, ", "),
				})
			end
		end

		if #menuData == 0 then
			table.insert(menuData, { label = "No Observed Injuries" })
		end

		cb(menuData)
	end)

	exports["strata"]:RegisterServerCallback("Damage:SyncReductions", function(source, data, cb)
		local char = Strata.User.Find(source)
		if char ~= nil then
			char:SetData("HPReductions", data)
		end
	end)
end)

exports("GetLimbDamage", function(sid)
	return _damagedLimbs[sid]
end)

exports("ResetLimbDamage", function(sid)
	_damagedLimbs[sid] = {}
end)

exports("EffectsPainkiller", function(source, tier)
	exports["strata"]:ClientCallback(source, "Damage:ApplyPainkiller", 225 * (tier or 1))
end)

exports("EffectsAdrenaline", function(source, tier)
	exports["strata"]:ClientCallback(source, "Damage:ApplyAdrenaline", 75 * (tier or 1))
end)

AddEventHandler("Characters:Server:PlayerLoggedOut", function(source)
	SetPlayerInvincible(source, false)
	Player(source).state.isGodmode = false
end)

RegisterNetEvent("Ped:Server:Died", function()
	local src  = source
	local char = Strata.User.Find(src)
	if char ~= nil then
		local pState = Player(src).state
		_deadCunts[char:GetData("SID")] = {
			deadData    = pState.deadData,
			isDeadTime  = pState.isDeadTime,
			releaseTime = pState.releaseTime,
		}
	end
end)

RegisterNetEvent("Damage:Server:StoreHealth", function(hp, armor)
	local src  = source
	local char = Strata.User.Find(src)
	if char ~= nil then
		char:SetData("HP",    hp)
		char:SetData("Armor", armor)
	end
end)

RegisterNetEvent("Damage:Server:BoneDamage", function(damageData)
	local src  = source
	local char = Strata.User.Find(src)
	if char == nil then return end

	local sid = char:GetData("SID")
	for _, entry in ipairs(damageData) do
		local boneName = Config.Bones[entry.bone]
		if boneName and boneName ~= "NONE" then
			if _damagedLimbs[sid][boneName] == nil then
				_damagedLimbs[sid][boneName] = {}
				for _, dmgType in ipairs(Config.DamageTypes) do
					_damagedLimbs[sid][boneName][dmgType] = 0
				end
			end
			local dmgType = Config.ClassDamageTypes[Config.WeaponClassBindings[entry.hash]]
			if dmgType ~= nil then
				_damagedLimbs[sid][boneName][dmgType] += 1
			end
		end
	end
end)

RegisterNetEvent("Damage:Server:Revived", function(wasMinor, wasFieldTreatment)
	local src  = source
	local char = Strata.User.Find(src)
	if char == nil then return end

	_deadCunts[char:GetData("SID")] = nil

	if not wasMinor and not wasFieldTreatment then
		Strata.Log.Trace("Damage", string.format(
			"%s %s (%s) Was Revived (Not Minor and Not Field Treatment)",
			char:GetData("First"), char:GetData("Last"), char:GetData("SID")
		))
		exports['st_injury']:ResetLimbDamage(char:GetData("SID"))
	elseif wasMinor then
		Strata.Log.Trace("Damage", string.format(
			"%s %s (%s) Was Revived (Minor Injury)",
			char:GetData("First"), char:GetData("Last"), char:GetData("SID")
		))
	else
		Strata.Log.Trace("Damage", string.format(
			"%s %s (%s) Was Revived (Field Treatment)",
			char:GetData("First"), char:GetData("Last"), char:GetData("SID")
		))
	end
end)
