exports("WalletGet", function(source)
	return exports.st_inventory:GetItemCount(source, 'money') or 0
end)

exports("WalletHas", function(source, amount)
	if amount > 0 then
		local currentCash = exports.st_inventory:GetItemCount(source, 'money') or 0
		return currentCash >= amount
	end
	return false
end)

exports("WalletModify", function(source, amount, skipNotify)
	local currentCash = exports.st_inventory:GetItemCount(source, 'money') or 0
	local newCashBalance = math.floor(currentCash + amount)

	if newCashBalance >= 0 then
		if amount > 0 then
			exports.st_inventory:AddItem(source, 'money', amount)
		elseif amount < 0 then
			exports.st_inventory:RemoveItem(source, 'money', math.abs(amount))
		end

		if not skipNotify then
			if amount < 0 then
				exports['st_ui']:Notification(source, "info",
					string.format("You Paid $%s In Cash", formatNumberToCurrency(math.floor(math.abs(amount))))
				)
			else
				exports['st_ui']:Notification(source, "success",
					string.format("You Received $%s In Cash", formatNumberToCurrency(math.floor(amount)))
				)
			end
		end
		return newCashBalance
	end
	return false
end)
