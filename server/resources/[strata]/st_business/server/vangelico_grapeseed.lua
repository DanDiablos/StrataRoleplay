local _jobName = "vangelico_grapeseed"

AddEventHandler("Businesses:Server:Startup", function()
	exports["strata"]:RegisterServerCallback("Businesses:VANGELICOGRAPESEED:OpenTable", function(source, data, cb)
		exports.st_inventory:OpenSecondary(source, 221, data)
	end)

	exports["strata"]:RegisterServerCallback("Businesses:VANGELICOGRAPESEED:Sell", function(source, data, cb)
		local char = Strata.User.Find(source)
		if exports['st_jobs']:HasJob(source, _jobName, false, false, false, false, "JOB_SELL_GEMS") then
			local its = exports.st_inventory:GetAllOfTypeNoStack(char:GetData("SID"), 1, 11)

			if its and #its > 0 then
				local totalSold = 0
				local totalPayout = 0
				for k, v in ipairs(its) do
					local md = json.decode(v.MetaData)
					local itemData = exports.st_inventory:ItemsGetData(v.Name)
					local gemWorth = (itemData.price * ((md.Quality or 1) / 100))

					if exports.st_inventory:RemoveId(char:GetData("SID"), 1, v) then
						totalPayout += gemWorth
						totalSold += 1
					end
				end

				local f = exports['st_finance']:AccountsGetOrganization(_jobName)
				if f ~= nil then
					exports['st_finance']:BalanceDeposit(f.Account, math.ceil(math.abs(totalPayout) * 0.8), {
						type = "deposit",
						title = "Sold Goods",
						description = string.format("Sold %s Gems", totalSold),
						data = {},
					})
					exports['st_ui']:Notification(source, "success",
						string.format(
							"Sold %s Gems For $%s (Deposited To Company Account)",
							totalSold,
							math.ceil(math.abs(totalPayout) * 0.8)
						)
					)
				else
					exports['st_finance']:WalletModify(source, totalPayout)
				end

				f = exports['st_finance']:AccountsGetOrganization("government")
				exports['st_finance']:BalanceDeposit(f.Account, math.ceil(math.abs(totalPayout) * 0.1), {
					type = "deposit",
					title = "Sold Goods Tax",
					description = string.format("10%% Tax On %s Sold Gems", totalSold),
					data = data,
				}, true)

				-- KEKW
				f = exports['st_finance']:AccountsGetOrganization("dgang")
				exports['st_finance']:BalanceDeposit(f.Account, math.ceil(math.abs(totalPayout) * 0.1), {
					type = "deposit",
					title = "Sold Goods Tax",
					description = string.format("10%% Tax On %s Sold Gems", totalSold),
					data = data,
				}, true)
			else
				exports['st_ui']:Notification(source, "error", "You Don't Have Any Gems To Sell")
			end
		end
	end)
end)

AddEventHandler("Businesses:Server:VANGELICOGRAPESEED:ViewGem", function(source, data)
	local char = Strata.User.Find(source)
	if char ~= nil then
		if exports['st_jobs']:HasJob(source, _jobName, false, false, false, true, "JOB_USE_GEM_TABLE") then
			local its = exports.st_inventory:GetInventory(source, data.owner, data.invType)
			if #its > 0 then
				local md = json.decode(its[1].MetaData)
				local itemData = exports.st_inventory:ItemsGetData(its[1].Name)
				if itemData ~= nil and itemData.type == 11 and itemData.gemProperties ~= nil then
					TriggerClientEvent(
						"Businesses:Client:VANGELICOGRAPESEED:ViewGem",
						source,
						data.owner,
						itemData.gemProperties,
						md.Quality,
						its[1]
					)
				end
			end
		end
	end
end)
