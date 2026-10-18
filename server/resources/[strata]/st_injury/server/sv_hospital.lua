local _inBed     = {}
local _inBedChar = {}

local _medsForSale = {
	{ item = "firstaid", coin = "MALD", price = 20,  qty = -1, vpn = false, requireCurrency = false },
	{ item = "ifak",     coin = "MALD", price = 100, qty = -1, vpn = false, requireCurrency = true  },
}

AddEventHandler('onResourceStart', function(resource)
	if resource ~= GetCurrentResourceName() then return end

	exports['st_utils']:VendorCreate(
		"BlackmarketMeds", "ped", "Medical Supplies", `S_M_M_Paramedic_01`,
		{ coords = vector3(2815.044, 5980.179, 349.928), heading = 277.889, scenario = "WORLD_HUMAN_CLIPBOARD" },
		_medsForSale, "pump-medical", "View Supplies", false, false, true
	)

	exports["st_chat"]:RegisterAdminCommand("clearbeds", function()
		_inBed = {}
	end, { help = "Force Clear All Hospital Beds", params = {} }, -1)

	-- ICU commands
	exports["st_chat"]:RegisterCommand("icu", function(source, args)
		if not tonumber(args[1]) then
			exports["st_chat"]:SendSystemSingle(source, "Invalid Arguments")
			return
		end
		local char = Strata.User.BySID(tonumber(args[1]))
		if char ~= nil then
			exports['st_injury']:HospitalICUSend(char:GetData("Source"))
			exports["st_chat"]:SendSystemSingle(source, string.format("%s Has Been Admitted To ICU", args[1]))
		else
			exports["st_chat"]:SendSystemSingle(source, "State ID Not Logged In")
		end
	end, {
		help   = "Sends Patient To ICU",
		params = { { name = "Target", help = "State ID of target" } },
	}, 1, { { Id = "ems" } })

	exports["st_chat"]:RegisterCommand("release", function(source, args)
		if not tonumber(args[1]) then
			exports["st_chat"]:SendSystemSingle(source, "Invalid Arguments")
			return
		end
		local char = Strata.User.BySID(tonumber(args[1]))
		if char ~= nil and char:GetData("ICU") ~= nil and not char:GetData("ICU").Released then
			exports['st_injury']:HospitalICURelease(char:GetData("Source"))
			exports["st_chat"]:SendSystemSingle(source, string.format("%s Has Been Released From ICU", args[1]))
		else
			exports["st_chat"]:SendSystemSingle(source, "State ID Not Logged In")
		end
	end, {
		help   = "Releases a patient from ICU",
		params = { { name = "Target", help = "State ID of target" } },
	}, 1, { { Id = "ems" } })

	-- Hospital server callbacks
	exports["strata"]:RegisterServerCallback("Hospital:Treat", function(source, data, cb)
		local char = Strata.User.Find(source)
		local bed  = exports['st_injury']:HospitalRequestBed(source)
		local cost = 1500

		exports['st_finance']:BillingCharge(source, cost, "Medical Services",
			"Use of facilities at St. Fiacre Medical Center")

		local f = exports['st_finance']:AccountsGetOrganization("ems")
		exports['st_finance']:BalanceDeposit(f.Account, cost / 2, {
			type = "deposit", title = "Medical Treatment",
			description = string.format("Medical Bill For %s %s", char:GetData("First"), char:GetData("Last")),
			data = {},
		}, true)

		f = exports['st_finance']:AccountsGetOrganization("government")
		exports['st_finance']:BalanceDeposit(f.Account, cost / 2, {
			type = "deposit", title = "Medical Treatment",
			description = string.format("Medical Bill For %s %s", char:GetData("First"), char:GetData("Last")),
			data = {},
		}, true)

		cb(bed)
	end)

	exports["strata"]:RegisterServerCallback("Hospital:Respawn", function(source, data, cb)
		local char = Strata.User.Find(source)
		if os.time() < Player(source).state.releaseTime then
			cb(nil)
			return
		end

		exports['st_utils']:TempPosIgnore(source)
		local bed  = exports['st_injury']:HospitalRequestBed(source)
		local cost = 1500

		exports['st_finance']:BillingCharge(source, cost, "Medical Services",
			"Use of facilities at St. Fiacre Medical Center")

		Strata.Log.Info("Damage", string.format(
			"%s %s (%s) Respawned Via Local EMS",
			char:GetData("First"), char:GetData("Last"), char:GetData("SID")
		), {
			console = true, file = true, database = true,
			discord = { embed = true, type = "info", webhook = GetConvar("discord_log_webhook", "") },
		})

		local f = exports['st_finance']:AccountsGetOrganization("ems")
		exports['st_finance']:BalanceDeposit(f.Account, cost / 2, {
			type = "deposit", title = "Medical Treatment",
			description = string.format("Medical Bill For %s %s", char:GetData("First"), char:GetData("Last")),
			data = {},
		}, true)

		f = exports['st_finance']:AccountsGetOrganization("government")
		exports['st_finance']:BalanceDeposit(f.Account, cost / 2, {
			type = "deposit", title = "Medical Treatment",
			description = string.format("Medical Bill For %s %s", char:GetData("First"), char:GetData("Last")),
			data = {},
		}, true)

		cb(bed)
	end)

	exports["strata"]:RegisterServerCallback("Hospital:FindBed", function(source, data, cb)
		cb(exports['st_injury']:HospitalFindBed(source, data))
	end)

	exports["strata"]:RegisterServerCallback("Hospital:OccupyBed", function(source, data, cb)
		cb(exports['st_injury']:HospitalOccupyBed(source, data))
	end)

	exports["strata"]:RegisterServerCallback("Hospital:LeaveBed", function(source, data, cb)
		cb(exports['st_injury']:HospitalLeaveBed(source))
	end)

	exports["strata"]:RegisterServerCallback("Hospital:RetreiveItems", function(source, data, cb)
		exports['st_injury']:HospitalICUGetItems(source)
	end)

	exports["strata"]:RegisterServerCallback("Hospital:HiddenRevive", function(source, data, cb)
		local char = Strata.User.Find(source)
		local p    = Player(source).state
		if p.isEscorting == nil then return end

		local t = Player(p.isEscorting).state
		if t == nil or not t.isDead then return end

		if exports['st_finance']:CryptoExchangeRemove("MALD", char:GetData("CryptoWallet"), 20) then
			cb(true)
			local tChar = Strata.User.Find(p.isEscorting)
			if tChar ~= nil then
				exports["strata"]:ClientCallback(tChar:GetData("Source"), "Damage:Heal", true)
			else
				exports['st_ui']:Notification(source, "error", "Invalid Target")
			end
		else
			cb(false)
			exports['st_ui']:Notification(source, "error", "Not Enough Crypto")
		end
	end)

	exports["strata"]:RegisterServerCallback("Hospital:SpawnICU", function(source, data, cb)
		exports["strata"]:RoutePlayerToGlobalRoute(source)
		Player(source).state.ICU = false
		TriggerClientEvent("Hospital:Client:ICU:Enter", source)
		cb(true)
	end)
end)

exports("HospitalRequestBed", function(source)
	for k in ipairs(Config.Beds) do
		if _inBed[k] == nil then
			return k
		end
	end
	return nil
end)

exports("HospitalFindBed", function(source, location)
	for k, v in ipairs(Config.Beds) do
		if #(vector3(v.x, v.y, v.z) - vector3(location.x, location.y, location.z)) <= 2.0 and not _inBed[k] then
			return k
		end
	end
	return nil
end)

exports("HospitalOccupyBed", function(source, bedId)
	local char = Strata.User.Find(source)
	if char == nil or Config.Beds[bedId] == nil then return false end
	if _inBed[bedId] ~= nil then return false end

	_inBedChar[char:GetData("ID")] = bedId
	_inBed[bedId]                  = char:GetData("ID")
	return true
end)

exports("HospitalLeaveBed", function(source)
	local char = Strata.User.Find(source)
	if char == nil then return false end

	local bedId = _inBedChar[char:GetData("ID")]
	if bedId == nil then return false end

	_inBed[bedId]                  = nil
	_inBedChar[char:GetData("ID")] = nil
	return true
end)

exports("HospitalICUSend", function(target)
	local char = Strata.User.Find(target)
	if char == nil then return false end
	if char:GetData("ICU") ~= nil and not char:GetData("ICU").Released then return false end

	exports['st_jobs']:JailSentenced(target)
	Player(target).state.ICU = true
	char:SetData("ICU", { Released = false })

	CreateThread(function()
		exports['st_jobs']:DutyOff(target, Player(target).state.onDuty)
		exports['st_police']:UncuffTarget(-1, target)
		exports['st_appearance']:MaskUnequipNoItem(target)
		exports.st_inventory:HoldingPut(target)
	end)

	exports['st_utils']:TempPosIgnore(target)
	TriggerClientEvent("Hospital:Client:ICU:Sent",  target)
	TriggerClientEvent("Hospital:Client:ICU:Enter", target)
	exports['st_ui']:Notification("info", target, "You Were Admitted To ICU")
end)

exports("HospitalICURelease", function(target)
	local char = Strata.User.Find(target)
	if char == nil then return false end

	Player(target).state.ICU = false
	char:SetData("ICU", { Released = true, Items = false })
	exports['st_ui']:Notification("info", target, "You Were Released From ICU")
end)

exports("HospitalICUGetItems", function(target)
	local char = Strata.User.Find(target)
	if char == nil then return false end

	Player(target).state.ICU = false
	char:SetData("ICU", { Released = true, Items = true })
	exports.st_inventory:HoldingTake(target)
end)

-- Cleanup on logout/drop
AddEventHandler("Characters:Server:PlayerLoggedOut", function(source, cData)
	if cData ~= nil and _inBedChar[cData.ID] ~= nil then
		_inBed[_inBedChar[cData.ID]] = nil
		_inBedChar[cData.ID]         = nil
	end
end)

AddEventHandler("Characters:Server:PlayerDropped", function(source, cData)
	if cData ~= nil and _inBedChar[cData.ID] ~= nil then
		_inBed[_inBedChar[cData.ID]] = nil
		_inBedChar[cData.ID]         = nil
	end
end)
