AddEventHandler("Finance:Server:Startup", function()
	RegisterItems()
	exports['strata']:MiddlewareAdd("Characters:Creating", function(source, cData)
		return { {
			Crypto = {},
		} }
	end)

	exports['strata']:MiddlewareAdd("Characters:Spawning", function(source)
		local char = Strata.User.Find(source)
		if char and not char:GetData("CryptoWallet") then
			local stateId = char:GetData("SID")
			local generatedWallet = GenerateUniqueCrytoWallet()
			if generatedWallet then
				Strata.Log.Trace(
					"Banking",
					string.format("Crypto Wallet (%s) Created for Character: %s", generatedWallet, stateId)
				)
				char:SetData("CryptoWallet", generatedWallet)
			end
		end
	end, 3)

	exports["strata"]:RegisterServerCallback("Crypto:GetAll", function(source, data, cb)
		cb(_cryptoCoins)
	end)

	TriggerEvent("Crypto:Server:Startup")
end)

function RegisterItems()
	exports.st_inventory:RegisterUse("crypto_voucher", "RandomItems", function(source, item)
		local char = Strata.User.Find(source)
		if item.MetaData.CryptoCoin and ((item.MetaData.Quantity and tonumber(item.MetaData.Quantity) or 0) > 0) then
			local data = exports['st_finance']:CryptoCoinGet(item.MetaData.CryptoCoin)

			-- More dumb compatability stuff
			if item.MetaData.CryptoCoin == "PLEB" then
				item.MetaData.CryptoCoin = "MALD"
			end

			exports['st_finance']:CryptoExchangeAdd(item.MetaData.CryptoCoin, char:GetData("CryptoWallet"),
				item.MetaData.Quantity)
			exports.st_inventory:RemoveSlot(item.Owner, item.Name, 1, item.Slot, 1)
		else
			exports['st_ui']:Notification(source, "error", "Invalid Voucher")
		end
	end)
end

RegisterNetEvent('st_inventory:ready', function()
	if GetResourceState(GetCurrentResourceName()) == 'started' then
		RegisterItems()
	end
end)

local _todaysGenerated = {}
local _charSet = {
	"a",
	"b",
	"c",
	"d",
	"e",
	"f",
	"g",
	"h",
	"i",
	"j",
	"k",
	"l",
	"m",
	"n",
	"o",
	"p",
	"q",
	"r",
	"s",
	"t",
	"u",
	"v",
	"w",
	"x",
	"y",
	"z",
}

function RandomCharOrNumber(amount)
	if amount == nil then
		amount = 1
	end
	local value = ""
	for i = 1, amount do
		if math.random(0, 6) <= 4 then -- More chance of letter
			value = value .. _charSet[math.random(1, #_charSet)]
		else
			value = value .. tostring(math.random(1, 9))
		end
	end
	return value
end

function GenerateCryptoWallet()
	return RandomCharOrNumber(5)
end

function GenerateUniqueCrytoWallet()
	local generated = GenerateCryptoWallet()
	while DoesCryptoWalletExist(generated) do
		generated = GenerateCryptoWallet()
	end

	_todaysGenerated[generated] = true

	return generated
end

function DoesCryptoWalletExist(wallet)
	if _todaysGenerated[wallet] then
		return false
	end

	local p = promise.new()

	MySQL.Async.fetchAll('SELECT 1 FROM characters WHERE CryptoWallet = @wallet LIMIT 1', {
		['@wallet'] = wallet
	}, function(results)
		if #results > 0 then
			p:resolve(true)
		else
			p:resolve(false)
		end
	end)

	return Citizen.Await(p)
end
