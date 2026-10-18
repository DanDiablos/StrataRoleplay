AddEventHandler('Labor:Client:Setup', function()
	exports["strata"]:Add('exporter', "Goods Exporter", vector3(-769.529, -2638.597, 12.945), 272, 4, 0.65)
	exports['st_utils']:Add("LaborExporter", `a_m_m_farmer_01`, vector3(-769.529, -2638.597, 12.945),
		63.569, 25.0, {
			{
				icon = "hand-holding-magic",
				text = "Export Items",
				event = "Labor:Client:Export:GetMenu",
			},
		}, 'money-check-dollar-pen', 'WORLD_HUMAN_CLIPBOARD')
end)

AddEventHandler("Labor:Client:Export:GetMenu", function()
	exports['st_ui']:ListMenuShow(GlobalState["LaborExporter"])
end)

AddEventHandler("Labor:Client:Export:Sell", function(data)
	local itemData = exports.st_inventory:ItemsGetData(data.item)
	exports['st_ui']:ConfirmShow(
		string.format("Mass Export %s at $%s/unit?", itemData.label, data.price),
		{
			yes = "Labor:Client:Export:Sell:Yes",
			no = "Labor:Client:Export:Sell:No",
		},
		string.format("Doing this will sell all in your inventory for $%s/unit, are you sure you want to continue?",
			data.price),
		data
	)
end)

AddEventHandler("Labor:Client:Export:Sell:Yes", function(data)
	exports["strata"]:ServerCallback("Labor:Exporter:Sell", data)
end)
