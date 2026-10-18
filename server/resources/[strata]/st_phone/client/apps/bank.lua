RegisterNUICallback("Banking:GetData", function(data, cb)
	exports["strata"]:ServerCallback('Banking:GetAccounts', {}, function(accounts, pendingBills)
		cb({
			accounts = accounts,
			pendingBills = pendingBills or {},
		})
	end)
end)

-- Transfer

RegisterNUICallback("Banking:Transfer", function(data, cb)
	data.action = 'TRANSFER'
	exports["strata"]:ServerCallback('Banking:DoAccountAction', data, function(success)
		if success then
			exports["strata"]:ServerCallback('Banking:GetAccounts', {}, function(accounts, pendingBills)
				exports['st_phone']:DataSet('bankLoans', {
					accounts = accounts,
					pendingBills = pendingBills or {},
				})
				cb(true)
			end)
		else
			cb(false)
		end
	end)
end)

-- Bills

RegisterNUICallback("Banking:AcceptBill", function(data, cb)
	exports["strata"]:ServerCallback('Billing:AcceptBill', data, function(success)
		cb(success)
	end)
end)

RegisterNUICallback("Banking:DismissBill", function(data, cb)
	exports["strata"]:ServerCallback('Billing:DismissBill', data, function(success)
		cb(success)
	end)
end)

RegisterNUICallback("Banking:Bill", function(data, cb)
	exports["strata"]:ServerCallback('Billing:CreateBill', data, function(success)
		cb(success)
	end)
end)

RegisterNUICallback("Banking:GetTransactions", function(data, cb)
	exports["strata"]:ServerCallback("Banking:GetAccountsTransactions", data, cb)
end)

AddEventHandler("Phone:Nui:Bank:AcceptBill", function(data)
	exports["strata"]:ServerCallback('Billing:AcceptBill', {
		bill = data.bill,
		notify = true
	})
end)

AddEventHandler("Phone:Nui:Bank:DenyBill", function(data)
	exports["strata"]:ServerCallback('Billing:DismissBill', data, function() end)
end)
