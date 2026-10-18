local _robberyAlerts = {}
_fcGlobalReset = {}
local _inUse = {
	VaultDoor = {},
	GateDoor = {},
	Vault = {},
	SafeBox = {},
	Loot = {},
}

local _inProgress = {}

local _redDongies = {}
local _vaultLoot = {
	trolley = {
		cash = {
			{ 60, { name = "moneyroll", min = 200, max = 250 } },
			{ 33, { name = "moneyband", min = 22, max = 28 } },
			{ 5,  { name = "valuegoods", min = 14, max = 20 } },
			{ 2,  { name = "moneybag", min = 1, max = 1, metadata = { CustomAmt = { Min = 15000, Random = 5000 } } } },
		},
		gold = {
			{ 85, { name = "goldbar", min = 50, max = 70 } },
			{ 15, { name = "moneybag", min = 1, max = 1, metadata = { CustomAmt = { Min = 40000, Random = 10000 } } } },
		},
		gems = {
			{ 20, { name = "opal", min = 1, max = 1 } },
			{ 20, { name = "citrine", min = 1, max = 1 } },
			{ 20, { name = "amethyst", min = 1, max = 1 } },
			{ 15, { name = "ruby", min = 1, max = 1 } },
			{ 15, { name = "sapphire", min = 1, max = 1 } },
			{ 5,  { name = "emerald", min = 1, max = 1 } },
			{ 5,  { name = "diamond", min = 1, max = 1 } },
		},
	},
}

local _triggered = {}

function ResetSource(source)
	for k, v in pairs(FLEECA_LOCATIONS) do
		if _inUse.VaultDoor[v.id] == source then
			_inUse.VaultDoor[v.id] = nil
		end
		if _inUse.GateDoor[v.id] == source then
			_inUse.GateDoor[v.id] = nil
		end
	end
end

AddEventHandler("Characters:Server:PlayerLoggedOut", ResetSource)
AddEventHandler("Characters:Server:PlayerDropped", ResetSource)

function ResetFleeca(fleecaId)
	_inProgress[fleecaId] = false
	_fcGlobalReset[fleecaId] = nil

	GlobalState[string.format("Fleeca:%s:VaultDoor", fleecaId)] = nil

	if FLEECA_LOCATIONS[fleecaId].loots ~= nil then
		for k, v in ipairs(FLEECA_LOCATIONS[fleecaId].loots) do
			GlobalState[string.format("Fleeca:%s:Loot:%s", fleecaId, v.options.name)] = nil
		end
	end

	TriggerClientEvent("Robbery:Client:Fleeca:CloseVaultDoor", -1, fleecaId)
	exports['st_doors']:SetLock(string.format("%s_tills", fleecaId), true)
	exports['st_doors']:SetLock(string.format("%s_gate", fleecaId), true)
	_triggered[fleecaId] = false
end

function StartAutoCDTimer(fleecaId)
	CreateThread(function()
		if _triggered[fleecaId] then
			return
		else
			_triggered[fleecaId] = true
		end

		Wait(1000 * 60 * 30)

		if _inProgress[fleecaId] then
			_inProgress[fleecaId] = false
			GlobalState[string.format("Fleeca:Disable:%s", fleecaId)] = false
			if not _fcGlobalReset[fleecaId] or os.time() > _fcGlobalReset[fleecaId] then
				_fcGlobalReset[fleecaId] = os.time() + (60 * 60 * math.random(4, 6))
			end

			GlobalState[string.format("Fleeca:%s:VaultDoor", fleecaId)] = {
				state = 4,
				expires = _fcGlobalReset[fleecaId],
			}

			if FLEECA_LOCATIONS[fleecaId].loots ~= nil then
				for k, v in ipairs(FLEECA_LOCATIONS[fleecaId].loots) do
					GlobalState[string.format("Fleeca:%s:Loot:%s", fleecaId, v.options.name)] = nil
				end
			end

			TriggerClientEvent("Robbery:Client:Fleeca:CloseVaultDoor", -1, fleecaId)
			exports['st_doors']:SetLock(string.format("%s_tills", fleecaId), true)
			exports['st_doors']:SetLock(string.format("%s_gate", fleecaId), true)
			_triggered[fleecaId] = false
		end
	end)
end

function GetFleecaIds()
	local fleecaIds = {}
	for k, v in pairs(FLEECA_LOCATIONS) do
		table.insert(fleecaIds, k)
	end
	return fleecaIds
end

AddEventHandler("Robbery:Server:Setup", function()
	local t = {}
	for k, v in pairs(FLEECA_LOCATIONS) do
		_inProgress[v.id] = false
		table.insert(t, v.id)
		for k, v in ipairs(v.loots) do
			v.type = TROLLY_TYPES[math.random(#TROLLY_TYPES)]
		end
		GlobalState[string.format("FleecaRobberies:%s", v.id)] = FLEECA_LOCATIONS[v.id]
	end
	GlobalState["FleecaRobberies"] = t
	StartFleecaThreads()

	exports['st_chars']:RepCreate("BankRobbery", "Bank Robberies", {
		{ label = "Newbie", value = 10000 },
		{ label = "Okay",   value = 20000 },
		{ label = "Good",   value = 30000 },
		{ label = "Pro",    value = 40000 },
		{ label = "Expert", value = 50000 },
	}, true) -- Not sure what to do with this yet so hide it

	exports["strata"]:RegisterServerCallback("Robbery:Fleeca:Drill", function(source, data, cb)
		local char = Strata.User.Find(source)
		if char ~= nil then
			local pState = Player(source).state
			if
				GlobalState[string.format("Fleeca:%s:Loot:%s", pState.fleeca, data.id)] == nil
				and (
					data.index <= 2
					or not exports['st_doors']:IsLocked(string.format("%s_gate", pState.fleeca))
				)
			then
				if GetGameTimer() < SERVER_START_WAIT or (GlobalState["RestartLockdown"] and not _inProgress[pState.fleeca]) then
					exports['st_ui']:Notification(source, "error",
						"You Notice The Door Is Barricaded For A Storm, Maybe Check Back Later",
						6000
					)
					return
				elseif (GlobalState["Duty:police"] or 0) < REQUIRED_POLICE and not _inProgress[pState.fleeca] then
					exports['st_ui']:Notification(source, "error",
						"Enhanced Security Measures Enabled, Maybe Check Back Later When Things Feel Safer",
						6000
					)
					return
				elseif GlobalState['RobberiesDisabled'] then
					exports['st_ui']:Notification(source, "error",
						"Temporarily Disabled, Please See City Announcements",
						6000
					)
					return
				end


				if not _inUse.Loot[data.id] then
					_inProgress[pState.fleeca] = true
					_inUse.Loot[data.id] = source
					GlobalState["MazeBankInProgress"] = true

					if exports.st_inventory:ItemsHas(char:GetData("SID"), 1, "drill", 1) then
						local slot = exports.st_inventory:ItemsGetFirst(char:GetData("SID"), "drill", 1)
						local itemData = exports.st_inventory:ItemsGetData("drill")

						if slot ~= nil then
							Strata.Log.Info(
								"Robbery",
								string.format(
									"%s %s (%s) Started Drilling Fleeca %s Loot %s",
									char:GetData("First"),
									char:GetData("Last"),
									char:GetData("SID"),
									pState.fleeca,
									data.id
								)
							)
							exports["strata"]:ClientCallback(source, "Robbery:Games:Drill", {
								passes = 1,
								duration = 25000,
								config = {},
								data = {},
							}, function(success)
								local newValue = slot.CreateDate - itemData.durability
								if success then
									newValue = slot.CreateDate - (itemData.durability / 5)
								end
								if os.time() - itemData.durability >= newValue then
									exports.st_inventory:RemoveId(slot.Owner, slot.invType, slot)
								else
									exports.st_inventory:SetItemCreateDate(slot.id, newValue)
								end

								if _robberyAlerts[pState.fleeca] == nil or _robberyAlerts[pState.fleeca] < os.time() then
									exports['st_crime']:TriggerPDAlert(
										source,
										FLEECA_LOCATIONS[pState.fleeca].coords,
										"10-90",
										"Armed Robbery",
										{
											icon = 586,
											size = 0.9,
											color = 31,
											duration = (60 * 5),
										},
										{
											icon = "building-columns",
											details = string.format("Fleeca Bank - %s",
												FLEECA_LOCATIONS[pState.fleeca].label),
										},
										pState.fleeca
									)
									_robberyAlerts[pState.fleeca] = os.time() + 60 * 20
								end

								if success then
									local lootData = FLEECA_LOCATIONS[pState.fleeca].loots[data.index]
									Strata.Log.Info(
										"Robbery",
										string.format(
											"%s %s (%s) Successfully Drilled Fleeca %s Loot %s",
											char:GetData("First"),
											char:GetData("Last"),
											char:GetData("SID"),
											pState.fleeca,
											data.id
										)
									)
									if
										not GlobalState["AntiShitlord"]
										or os.time() >= GlobalState["AntiShitlord"]
									then
										GlobalState["AntiShitlord"] = os.time() + (60 * math.random(10, 15))
									end

									exports.st_inventory:LootCustomWeightedSetWithCount(
										_vaultLoot.trolley[lootData?.type?.type or "cash"],
										char:GetData("SID"), 1)
									if math.random(100) <= 3 then
										exports.st_inventory:AddItem(char:GetData("SID"), "crypto_voucher", 1, {
											CryptoCoin = "HEIST",
											Quantity = 4
										}, 1)
									end

									if _redDongies[pState.fleeca] == nil then
										if data.index > 2 and math.random(100) <= (1 * data.index) then
											_redDongies[pState.fleeca] = source
											exports.st_inventory:AddItem(char:GetData("SID"), "red_dongle", 1, {},
												1)
										end
									end

									if not _fcGlobalReset[pState.fleeca] or os.time() > _fcGlobalReset[pState.fleeca] then
										_fcGlobalReset[pState.fleeca] = os.time() + (60 * 60 * math.random(4, 6))
									end

									GlobalState[string.format("Fleeca:%s:Loot:%s", pState.fleeca, data.id)] =
										_fcGlobalReset[pState.fleeca]
									StartAutoCDTimer(pState.fleeca)
									GlobalState[string.format("Fleeca:Disable:%s", pState.fleeca)] = true
								end

								_inUse.Loot[data.id] = false
							end, string.format("fleeca_%s_drill_%s", pState.fleeca, data.id))
						else
							_inUse.Loot[data.id] = false
						end
					else
						_inUse.Loot[data.id] = false
						exports['st_ui']:Notification(source, "error", "You Need A Drill", 6000)
					end
				else
					exports['st_ui']:Notification(source, "error",
						"Someone Is Already Interacting With This",
						6000
					)
				end
			else
				exports['st_ui']:Notification(source, "error",
					"Temporary Emergency Systems Enabled, Check Beck In A Bit",
					6000
				)
			end
		end
	end)

	exports["strata"]:RegisterServerCallback("Robbery:Fleeca:SecureBank", function(source, data, cb)
		local char = Strata.User.Find(source)
		local pState = Player(source).state

		if pState.fleeca ~= nil then
			if pState.onDuty == "police" then
				_inProgress[pState.fleeca] = false
				GlobalState[string.format("Fleeca:Disable:%s", pState.fleeca)] = false
				if not _fcGlobalReset[pState.fleeca] or os.time() > _fcGlobalReset[pState.fleeca] then
					_fcGlobalReset[pState.fleeca] = os.time() + (60 * 60 * math.random(4, 6))
				end

				GlobalState[string.format("Fleeca:%s:VaultDoor", pState.fleeca)] = {
					state = 4,
					expires = _fcGlobalReset[pState.fleeca],
				}

				if FLEECA_LOCATIONS[pState.fleeca].loots ~= nil then
					for k, v in ipairs(FLEECA_LOCATIONS[pState.fleeca].loots) do
						GlobalState[string.format("Fleeca:%s:Loot:%s", pState.fleeca, v.options.name)] = nil
					end
				end

				Strata.Log.Info("Robbery",
					string.format("%s %s (%s) Secured Fleeca %s", char:GetData("First"), char:GetData("Last"),
						char:GetData("SID"), pState.fleeca))
				TriggerClientEvent("Robbery:Client:Fleeca:CloseVaultDoor", -1, pState.fleeca)
				exports['st_doors']:SetLock(string.format("%s_tills", pState.fleeca), true)
				exports['st_doors']:SetLock(string.format("%s_gate", pState.fleeca), true)
			else
			end
		end
	end)

	exports.st_inventory:RegisterUse("green_laptop", "FleecaRobbery", function(source, slot, itemData)
		local char = Strata.User.Find(source)
		local pState = Player(source).state

		if pState.fleeca ~= nil then
			local ped = GetPlayerPed(source)
			local playerCoords = GetEntityCoords(ped)

			if not GlobalState["AntiShitlord"] or os.time() >= GlobalState["AntiShitlord"] or _inProgress[pState.fleeca] then
				local bankData = GlobalState[string.format("FleecaRobberies:%s", pState.fleeca)]
				if #(bankData.points.vaultPC.coords - playerCoords) <= 1.5 then
					if GetGameTimer() < SERVER_START_WAIT or (GlobalState["RestartLockdown"] and not _inProgress[pState.fleeca]) then
						exports['st_ui']:Notification(source, "error",
							"You Notice The Door Is Barricaded For A Storm, Maybe Check Back Later",
							6000
						)
						return
					elseif (GlobalState["Duty:police"] or 0) < REQUIRED_POLICE and not _inProgress[pState.fleeca] then
						exports['st_ui']:Notification(source, "error",
							"Enhanced Security Measures Enabled, Maybe Check Back Later When Things Feel Safer",
							6000
						)
						return
					elseif GlobalState['RobberiesDisabled'] then
						exports['st_ui']:Notification(source, "error",
							"Temporarily Disabled, Please See City Announcements",
							6000
						)
						return
					end

					if
						GlobalState[string.format("Fleeca:%s:VaultDoor", pState.fleeca)] == nil
						or (
							GlobalState[string.format("Fleeca:%s:VaultDoor", pState.fleeca)].state == 3
							and (GlobalState[string.format("Fleeca:%s:VaultDoor", pState.fleeca)]?.expires or os.time()) < os.time()
						)
					then
						if not _inUse.VaultDoor[pState.fleeca] then
							Strata.Log.Info("Robbery",
								string.format("%s %s (%s) Started Hacking Vault Door At %s", char:GetData("First"),
									char:GetData("Last"), char:GetData("SID"), pState.fleeca))
							_inUse.VaultDoor[pState.fleeca] = source

							_inProgress[pState.fleeca] = true
							if not GlobalState["AntiShitlord"] or os.time() >= GlobalState["AntiShitlord"] then
								GlobalState["AntiShitlord"] = os.time() + (60 * math.random(10, 15))
							end
							StartAutoCDTimer(pState.fleeca)

							GlobalState[string.format("Fleeca:Disable:%s", pState.fleeca)] = true

							if _robberyAlerts[pState.fleeca] == nil or _robberyAlerts[pState.fleeca] < os.time() then
								exports['st_crime']:TriggerPDAlert(
									source,
									GlobalState[string.format("FleecaRobberies:%s", pState.fleeca)].coords,
									"10-90",
									"Armed Robbery",
									{
										icon = 586,
										size = 0.9,
										color = 31,
										duration = (60 * 5),
									},
									{
										icon = "building-columns",
										details = string.format("Fleeca Bank - %s", FLEECA_LOCATIONS[pState.fleeca]
											.label),
									},
									pState.fleeca
								)
								_robberyAlerts[pState.fleeca] = os.time() + 60 * 20
							end

							exports["strata"]:ClientCallback(
								source,
								"Robbery:Games:Laptop",
								{
									location = bankData.points.vaultPC,
									config = {
										countdown = 3,
										timer = { 1800, 2200 },
										limit = 30000,
										difficulty = 3,
										chances = 4,
										isShuffled = false,
										anim = false,
									},
									data = {},
								},
								function(success, data)
									if success then
										local timer = math.random(2, 4)
										Strata.Log.Info("Robbery",
											string.format("%s %s (%s) Successfully Hacked Vault Door At %s",
												char:GetData("First"), char:GetData("Last"), char:GetData("SID"),
												pState.fleeca))
										GlobalState[string.format("Fleeca:%s:VaultDoor", pState.fleeca)] = {
											state = 2,
											expires = os.time() + (60 * timer),
										}
										exports['st_utils']:Add(source, "PLAYER_STRESS", 3)
										exports['st_ui']:Notification(source, "success",
											string.format("Time Lock Disengaging, Please Wait %s Minutes", timer),
											6000
										)
										exports.st_inventory:RemoveSlot(slot.Owner, slot.Name, 1, slot.Slot, 1)
									else
										exports['st_utils']:Add(source, "PLAYER_STRESS", 6)

										Strata.Log.Info("Robbery",
											string.format("%s %s (%s) Failed Hacking Vault Door At %s",
												char:GetData("First"), char:GetData("Last"), char:GetData("SID"),
												pState.fleeca))
										local newValue = slot.CreateDate - math.ceil(itemData.durability / 2)
										if (os.time() - itemData.durability >= newValue) then
											exports.st_inventory:RemoveId(slot.Owner, slot.invType, slot)
										else
											exports.st_inventory:SetItemCreateDate(
												slot.id,
												newValue
											)
										end
									end
									_inUse.VaultDoor[pState.fleeca] = false
								end, pState.fleeca
							)
						else
							exports['st_ui']:Notification(source, "error",
								"Someone Else Is Doing A Thing", 6000)
						end
						return
					elseif
						GlobalState[string.format("Fleeca:%s:VaultDoor", pState.fleeca)] == nil
						and GlobalState[string.format("Fleeca:%s:VaultDoor", pState.fleeca)].state == 1
					then
						exports['st_ui']:Notification(source, "error",
							"Unable To Insert, Appears The Computer Has Been Tampered With",
							6000
						)
					elseif
						GlobalState[string.format("Fleeca:%s:VaultDoor", pState.fleeca)] ~= nil
						and GlobalState[string.format("Fleeca:%s:VaultDoor", pState.fleeca)].state == 4
						and GlobalState[string.format("Fleeca:%s:VaultDoor", pState.fleeca)].expires > os.time()
					then
						exports['st_ui']:Notification(source, "error",
							"Access Denied: Emergency Security Overrides Enabled",
							6000
						)
					end
				end
			else
				exports['st_ui']:Notification(source, "error",
					"Temporary Emergency Systems Enabled, Check Beck In A Bit",
					6000
				)
			end
		end
	end)

	exports.st_inventory:RegisterUse("thermite", "FleecaRobbery", function(source, slot, itemData)
		local char = Strata.User.Find(source)
		local pState = Player(source).state

		if pState.fleeca ~= nil then
			local ped = GetPlayerPed(source)
			local playerCoords = GetEntityCoords(ped)

			if not GlobalState["AntiShitlord"] or os.time() >= GlobalState["AntiShitlord"] or _inProgress[pState.fleeca] then
				local bankData = GlobalState[string.format("FleecaRobberies:%s", pState.fleeca)]
				if #(bankData.points.vaultGate.coords - playerCoords) <= 1.5 then
					if GetGameTimer() < SERVER_START_WAIT or (GlobalState["RestartLockdown"] and not _inProgress[pState.fleeca]) then
						exports['st_ui']:Notification(source, "error",
							"You Notice The Door Is Barricaded For A Storm, Maybe Check Back Later",
							6000
						)
						return
					elseif (GlobalState["Duty:police"] or 0) < REQUIRED_POLICE and not _inProgress[pState.fleeca] then
						exports['st_ui']:Notification(source, "error",
							"Enhanced Security Measures Enabled, Maybe Check Back Later When Things Feel Safer",
							6000
						)
						return
					elseif GlobalState['RobberiesDisabled'] then
						exports['st_ui']:Notification(source, "error",
							"Temporarily Disabled, Please See City Announcements",
							6000
						)
						return
					end

					if
						GlobalState[string.format("Fleeca:%s:VaultDoor", pState.fleeca)] ~= nil
						and GlobalState[string.format("Fleeca:%s:VaultDoor", pState.fleeca)].state == 3
						and exports['st_doors']:IsLocked(string.format("%s_gate", pState.fleeca))
					then
						if _inUse.Vault[pState.fleeca] == nil or not _inUse.GateDoor[pState.fleeca] then
							Strata.Log.Info("Robbery",
								string.format("%s %s (%s) Started Thermiting Vault Gate Door At %s",
									char:GetData("First"), char:GetData("Last"), char:GetData("SID"), pState.fleeca))
							_inProgress[pState.fleeca] = true
							if not GlobalState["AntiShitlord"] or os.time() >= GlobalState["AntiShitlord"] then
								GlobalState["AntiShitlord"] = os.time() + (60 * math.random(10, 15))
							end
							StartAutoCDTimer(pState.fleeca)

							GlobalState[string.format("Fleeca:Disable:%s", pState.fleeca)] = true
							_inUse.GateDoor[pState.fleeca] = source

							if _robberyAlerts[pState.fleeca] == nil or _robberyAlerts[pState.fleeca] < os.time() then
								exports['st_crime']:TriggerPDAlert(
									source,
									GlobalState[string.format("FleecaRobberies:%s", pState.fleeca)].coords,
									"10-90",
									"Armed Robbery",
									{
										icon = 586,
										size = 0.9,
										color = 31,
										duration = (60 * 5),
									},
									{
										icon = "building-columns",
										details = string.format("Fleeca Bank - %s", FLEECA_LOCATIONS[pState.fleeca]
											.label),
									},
									pState.fleeca
								)
								_robberyAlerts[pState.fleeca] = os.time() + 60 * 20
							end

							exports.st_inventory:RemoveSlot(slot.Owner, slot.Name, 1, slot.Slot, 1)
							exports["strata"]:ClientCallback(
								source,
								"Robbery:Games:Thermite",
								{
									passes = 1,
									location = bankData.points.vaultGate,
									duration = 15000,
									config = {
										countdown = 3,
										preview = 1750,
										timer = 9000,
										passReduce = 500,
										base = 10,
										cols = 5,
										rows = 5,
										anim = false,
									},
									data = {},
								},
								function(success, data)
									if success then
										Strata.Log.Info("Robbery",
											string.format("%s %s (%s) Successfully Thermited Vault Gate Door At %s",
												char:GetData("First"), char:GetData("Last"), char:GetData("SID"),
												pState.fleeca))
										GlobalState[string.format("Fleeca:%s:GateDoor", pState.fleeca)] = {
											state = 3,
											expires = _fcGlobalReset[pState.fleeca],
										}
										exports['st_doors']:SetLock(string.format("%s_gate", pState.fleeca), false)
										exports['st_utils']:Add(source, "PLAYER_STRESS", 3)
										exports['st_ui']:Notification(source, "success",
											"Doorlock Disengaged", 6000)
									else
										Strata.Log.Info("Robbery",
											string.format("%s %s (%s) Failed Thermiting Vault Gate Door At %s",
												char:GetData("First"), char:GetData("Last"), char:GetData("SID"),
												pState.fleeca))
										exports['st_utils']:Add(source, "PLAYER_STRESS", 6)
									end
									_inUse.GateDoor[pState.fleeca] = false
								end, pState.fleeca
							)
						else
							exports['st_ui']:Notification(source, "error",
								"Someone Else Is Doing A Thing", 6000)
						end
					end
				end
			else
				exports['st_ui']:Notification(source, "error",
					"Temporary Emergency Systems Enabled, Check Beck In A Bit",
					6000
				)
			end
		end
	end)

	exports.st_inventory:RegisterUse("fleeca_card", "FleecaRobbery", function(source, itemData)
		local char = Strata.User.Find(source)
		local pState = Player(source).state

		if pState.fleeca ~= nil then
			if pState.fleeca == itemData.MetaData.BankId then
				local ped = GetPlayerPed(source)
				local playerCoords = GetEntityCoords(ped)

				if not GlobalState["AntiShitlord"] or os.time() >= GlobalState["AntiShitlord"] or _inProgress[pState.fleeca] then
					if
						#(GlobalState[string.format("FleecaRobberies:%s", pState.fleeca)].points.vaultPC.coords - playerCoords)
						<= 1.5
					then
						if GetGameTimer() < SERVER_START_WAIT or (GlobalState["RestartLockdown"] and not _inProgress[pState.fleeca]) then
							exports['st_ui']:Notification(source, "error",
								"You Notice The Door Is Barricaded For A Storm, Maybe Check Back Later",
								6000
							)
							return
						elseif (GlobalState["Duty:police"] or 0) < REQUIRED_POLICE and not _inProgress[pState.fleeca] then
							exports['st_ui']:Notification(source, "error",
								"Enhanced Security Measures Enabled, Maybe Check Back Later When Things Feel Safer",
								6000
							)
							return
						elseif GlobalState['RobberiesDisabled'] then
							exports['st_ui']:Notification(source, "error",
								"Temporarily Disabled, Please See City Announcements",
								6000
							)
							return
						end

						if
							GlobalState[string.format("Fleeca:%s:VaultDoor", pState.fleeca)] == nil
							or (
								GlobalState[string.format("Fleeca:%s:VaultDoor", pState.fleeca)] ~= nil
								and GlobalState[string.format("Fleeca:%s:VaultDoor", pState.fleeca)].state == 3
								and GlobalState[string.format("Fleeca:%s:VaultDoor", pState.fleeca)].expires
								< os.time()
							)
						then
							if not _inUse.VaultDoor[pState.fleeca] then
								Strata.Log.Info("Robbery",
									string.format("%s %s (%s) Attempting To Open Vault Door At %s With Access Card",
										char:GetData("First"), char:GetData("Last"), char:GetData("SID"), pState.fleeca))
								_inProgress[pState.fleeca] = true
								if not GlobalState["AntiShitlord"] or os.time() >= GlobalState["AntiShitlord"] then
									GlobalState["AntiShitlord"] = os.time() + (60 * math.random(10, 15))
								end
								StartAutoCDTimer(pState.fleeca)

								_inUse.VaultDoor[pState.fleeca] = source
								exports["strata"]:ClientCallback(
									source,
									"Robbery:Fleeca:Keypad:Vault",
									tostring(itemData.MetaData.VaultCode),
									function(success, data)
										if success and data.entered == tostring(itemData.MetaData.VaultCode) then
											Strata.Log.Info("Robbery",
												string.format("%s %s (%s) Open Vault Door At %s With Access Card",
													char:GetData("First"), char:GetData("Last"), char:GetData("SID"),
													pState.fleeca))
											local timer = math.random(2, 4)
											GlobalState[string.format("Fleeca:%s:VaultDoor", pState.fleeca)] = {
												state = 2,
												expires = os.time() + (60 * timer),
											}
											exports['st_utils']:Add(source, "PLAYER_STRESS", 3)
											exports['st_ui']:Notification(source, "success",
												string.format("Time Lock Disengaging, Please Wait %s Minutes", timer),
												6000
											)
										else
											Strata.Log.Info("Robbery",
												string.format(
													"%s %s (%s) Failed Opening Vault Door At %s With Access Card",
													char:GetData("First"), char:GetData("Last"), char:GetData("SID"),
													pState.fleeca))
											GlobalState[string.format("Fleeca:%s:VaultDoor", pState.fleeca)] = {
												state = 4,
												expires = os.time() + (60 * 60 * 6),
											}
											exports['st_utils']:Add(source, "PLAYER_STRESS", 6)
										end
										exports.st_inventory:RemoveSlot(
											itemData.Owner,
											itemData.Name,
											1,
											itemData.Slot,
											itemData.invType
										)
										_inUse.VaultDoor[pState.fleeca] = false
									end
								)
							else
								exports['st_ui']:Notification(source, "error",
									"Someone Else Is Doing A Thing", 6000)
							end
							return
						elseif
							GlobalState[string.format("Fleeca:%s:VaultDoor", pState.fleeca)] == nil
							and GlobalState[string.format("Fleeca:%s:VaultDoor", pState.fleeca)].state == 1
						then
							exports['st_ui']:Notification(source, "error",
								"Unable To Insert, Appears The Computer Has Been Tampered With",
								6000
							)
						elseif
							GlobalState[string.format("Fleeca:%s:VaultDoor", pState.fleeca)] ~= nil
							and GlobalState[string.format("Fleeca:%s:VaultDoor", pState.fleeca)].state == 4
							and GlobalState[string.format("Fleeca:%s:VaultDoor", pState.fleeca)].expires > os.time()
						then
							exports['st_ui']:Notification(source, "error",
								"Access Denied: Emergency Security Overrides Enabled",
								6000
							)
						end
					end
				else
					exports['st_ui']:Notification(source, "error",
						"Temporary Emergency Systems Enabled, Check Beck In A Bit",
						6000
					)
				end
			else
				exports['st_ui']:Notification(source, "error",
					"Invalid Access Card: Incorrect Location", 6000)
				return
			end
		end
	end)

	exports.st_inventory:RegisterUse("moneybag", "FleecaRobbery", function(source, itemData)
		local char = Strata.User.Find(source)
		if os.time() >= itemData.MetaData.Finished then
			local amt = itemData.MetaData?.CustomAmt or (math.random(5000) + 10000)
			Strata.Log.Info("Robbery",
				string.format("%s %s (%s) Used A Money Bag, Received $%s", char:GetData("First"), char:GetData("Last"),
					char:GetData("SID"), amt))
			exports.st_inventory:RemoveSlot(itemData.Owner, itemData.Name, 1, itemData.Slot, itemData.invType)
			exports['st_finance']:WalletModify(source, amt)
		else
			exports['st_ui']:Notification(source, "error", "Not Ready Yet", 6000)
		end
	end)
end)
