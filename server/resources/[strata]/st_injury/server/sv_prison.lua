exports["strata"]:RegisterServerCallback("Hospital:PrisonHospitalRevive", function(source, data, cb)
	local char = Strata.User.Find(source)
	local cost = Config.PrisonCheckIn.Cost

	exports['st_finance']:BillingCharge(source, cost, "Medical Services",
		"Use of facilities at Bolingbroke Infirmary")

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

	local tChar = Strata.User.Find(source)
	if tChar ~= nil then
		exports["strata"]:ClientCallback(tChar:GetData("Source"), "Damage:Heal", true)
	else
		exports['st_ui']:Notification(source, "error", "An error has occured. Please report this.")
	end

	cb(true)
end)
