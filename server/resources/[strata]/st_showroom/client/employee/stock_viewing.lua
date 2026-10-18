local stockViewing
local stockViewingSub

AddEventHandler('Dealerships:Client:StockViewing', function(hit, data)
    if data and data.dealerId then
        ViewDealershipStocks(data.dealerId)
    end
end)

function ViewDealershipStocks(dealerId)
    local dealerData = _dealerships[dealerId]
    if dealerData then
        exports["strata"]:ServerCallback('Dealerships:StockViewing:FetchData', dealerId,
            function(authed, stocks, serverTime, dealerProfitPercent)
                if not authed then
                    exports["st_ui"]:Notification("error", 'You\'re Not Authorized to View Stock', 3500,
                        'car-building')
                    return
                end

                local stockData = FormatDealerStockToCategories(stocks)
                stockViewingSub = {}

                stockViewing = exports['st_menu']:Create('stockViewing',
                    string.format('View %s Stock', dealerData.abbreviation),
                    function()

                    end, function()
                        stockViewing = nil
                        stockViewingSub = nil
                        collectgarbage()
                    end)
                --stockViewing.Add:Text(string.format('There are %s different models of vehicle, totalling %s vehicles', stockData.total, stockData.totalQuantity), { 'pad', 'center', 'code' })

                local orderedCategories = exports['strata']:UtilsGetTableKeys(_catalogCategories)
                table.sort(orderedCategories, function(a, b)
                    return _catalogCategories[a] < _catalogCategories[b]
                end)

                local saleMultiplier = 1 + (dealerProfitPercent / 100)

                for _, category in ipairs(orderedCategories) do
                    if stockData.sorted[category] and #stockData.sorted[category] > 0 then
                        stockViewingSub[category] = exports['st_menu']:Create('stockViewingCat-' .. category,
                            _catalogCategories[category])

                        for k, v in ipairs(stockData.sorted[category]) do
                            stockViewingSub[category].Add:Text(string.format(
                                [[
                                Make: %s<br>
                                Model: %s<br>
                                Quantity In Stock: %s<br>
                                Class: %s<br>
                                Category: %s<br>
                                Wholesale Value: %s<br>
                                Dealer Sale Price: %s<br>
                                Last Purchased: %s<br>
                                Last Restocked: %s<br>
                                Vehicle Identifier: %s<br>
                            ]],
                                v.make,
                                v.model,
                                v.quantity,
                                v.class and string.upper(v.class) or '?',
                                _catalogCategories[v.category],
                                v.price and '$' .. formatNumberToCurrency(v.price) or '$?',
                                v.price and
                                '$' ..
                                formatNumberToCurrency(math.floor(Strata.Kit.Round(
                                    v.price * saleMultiplier, 0))) or
                                '$?',
                                (v.lastPurchased and Strata.Clock.Human(serverTime - v.lastPurchased) .. ' ago.' or 'Never'),
                                Strata.Clock.Human(serverTime - v.lastStocked) .. ' ago.',
                                string.upper(v.vehicle)
                            ), { 'code', 'pad' })
                        end

                        stockViewingSub[category].Add:SubMenuBack('Go Back', {})
                        stockViewing.Add:SubMenu(_catalogCategories[category], stockViewingSub[category], {})
                    end
                end

                stockViewing:Show()
            end)
    end
end
