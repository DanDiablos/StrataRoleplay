RegisterNUICallback("Home:GetMyProperties", function(data, cb)
	local props = exports['st_housing']:GetPropertiesWithAccess() or {}

	local upgrades = exports['st_housing']:GetUpgradesConfig()

	cb({
		properties = props,
		upgrades = upgrades,
	})
end)

RegisterNUICallback("Home:StartPlacement", function(data, cb)
	cb(false)
end)

RegisterNUICallback("Home:CreateDigiKey", function(data, cb)
	exports["strata"]:ServerCallback("Phone:Home:CreateDigiKey", data, cb)
end)

RegisterNUICallback("Home:RevokeDigiKey", function(data, cb)
	exports["strata"]:ServerCallback("Phone:Home:RevokeDigiKey", data, cb)
end)

RegisterNUICallback("Home:RemoveMyKey", function(data, cb)
	exports["strata"]:ServerCallback("Phone:Home:RemoveMyKey", data, cb)
end)

RegisterNUICallback("Home:LockProperty", function(data, cb)
	exports["strata"]:ServerCallback("Phone:Home:LockProperty", data, cb)
end)

RegisterNUICallback("Home:EditMode", function(data, cb)
	exports['st_housing']:EditMode()
	cb("OK")
end)

RegisterNUICallback("Home:GetCurrentFurniture", function(data, cb)
	local p = exports['st_housing']:GetCurrent(data.property)
	cb(p)
end)

RegisterNUICallback("Home:PlaceFurniture", function(data, cb)
	-- model, category
	cb(exports['st_housing']:Place(data.model, data.category))
end)

RegisterNUICallback("Home:EditFurniture", function(data, cb)
	cb(exports['st_housing']:Move(data.id))
end)

RegisterNUICallback("Home:DeleteFurniture", function(data, cb)
	cb(exports['st_housing']:Delete(data.id))
end)

RegisterNUICallback("Home:HighlightFurniture", function(data, cb)
	cb(false)
	--cb(Properties.Furniture:Find(data.id))
end)

RegisterNUICallback("PurchasePropertyInterior", function(data, cb)
	-- data.int
	exports["strata"]:ServerCallback("Properties:ChangeInterior", data, cb)
end)

RegisterNUICallback("PurchasePropertyUpgrade", function(data, cb)
	-- data.upgrade
	exports["strata"]:ServerCallback("Properties:Upgrade", data, cb)
end)

RegisterNUICallback("PreviewPropertyInterior", function(data, cb)
	-- data.int
	cb("OK")
	exports['st_housing']:Preview(data.int)
end)
