AddEventHandler("Crypto:Server:Startup", function()
	exports['st_finance']:CryptoCoinCreate("Vroom", "VRM", 100, false, false)
	exports['st_finance']:CryptoCoinCreate("Mald", "MALD", 250, true, 190)

	-- Compatability since we're renaming MALD
	exports['strata']:MiddlewareAdd("Characters:Spawning", function(source)
		local char = Strata.User.Find(source)
		local myCrypto = char:GetData("Crypto")

		if myCrypto.PLEB ~= nil then
			myCrypto.MALD = myCrypto.PLEB
			myCrypto.PLEB = nil
			char:SetData("Crypto", myCrypto)
		end
	end, 1)
end)

AddEventHandler("Phone:Server:RegisterCallbacks", function()
	exports["strata"]:RegisterServerCallback("Phone:Crypto:GetCoins", function(source, data, cb)
		local char = Strata.User.Find(source)
		if char then
			local coins = exports['st_finance']:CryptoCoinGetAll()
			local owned = char:GetData("Crypto") or {}
			local result = {}
			for _, coin in ipairs(coins) do
				table.insert(result, {
					Name = coin.Name,
					Short = coin.Short,
					Price = coin.Price,
					Change = coin.Change or 0,
					Buyable = coin.Buyable,
					Sellable = coin.Sellable,
					Owned = owned[coin.Short] or 0,
				})
			end
			cb(result)
		else
			cb({})
		end
	end)

	exports["strata"]:RegisterServerCallback("Phone:Crypto:Buy", function(source, data, cb)
		local char = Strata.User.Find(source)
		if char then
			return cb(exports['st_finance']:CryptoExchangeBuy(data.Short, char:GetData("SID"), data.Quantity))
		end
		cb(false)
	end)

	exports["strata"]:RegisterServerCallback("Phone:Crypto:Sell", function(source, data, cb)
		local char = Strata.User.Find(source)
		if char then
			return cb(exports['st_finance']:CryptoExchangeSell(data.Short, char:GetData("SID"), data.Quantity))
		end
		cb(false)
	end)

	exports["strata"]:RegisterServerCallback("Phone:Crypto:Transfer", function(source, data, cb)
		local char = Strata.User.Find(source)
		if char and char:GetData("SID") ~= data.Target then
			return cb(exports['st_finance']:CryptoExchangeTransfer(data.Short, char:GetData("SID"), data.Target,
				data.Quantity))
		end
		cb(false)
	end)
end)
