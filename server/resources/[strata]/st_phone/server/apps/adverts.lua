local _adverts = {
	["0"] = {},
	-- Lua, Suck My Dick
}

exports("AdvertsCreate", function(source, advert)
	_adverts[source] = advert
	TriggerClientEvent("Phone:Client:AddData", -1, "adverts", advert, source)
end)

exports("AdvertsUpdate", function(source, advert)
	_adverts[source] = advert
	TriggerClientEvent("Phone:Client:UpdateData", -1, "adverts", source, advert)
end)

exports("AdvertsDelete", function(source)
	if _adverts[source] ~= nil then
		_adverts[source] = nil
		TriggerClientEvent("Phone:Client:RemoveData", -1, "adverts", source)
	end
end)

AddEventHandler("Phone:Server:RegisterCallbacks", function()
	exports["strata"]:RegisterServerCallback("Phone:Adverts:GetAll", function(source, data, cb)
		cb(_adverts)
	end)
	exports["strata"]:RegisterServerCallback("Phone:Adverts:Create", function(source, data, cb)
		local char = Strata.User.Find(source)
		if char ~= nil then
			local advert = {
				title = data.title,
				description = data.description,
				category = data.category,
				author = char:GetData("First") .. " " .. char:GetData("Last"),
				phone = char:GetData("Phone"),
				SID = char:GetData("SID"),
				time = os.time(),
				source = source,
			}
			exports['st_phone']:AdvertsCreate(source, advert)
			cb(true)
		else
			cb(false)
		end
	end)
	exports["strata"]:RegisterServerCallback("Phone:Adverts:Update", function(source, data, cb)
		local existing = _adverts[source]
		if existing then
			existing.title = data.title
			existing.description = data.description
			existing.category = data.category
			exports['st_phone']:AdvertsUpdate(source, existing)
			cb(true)
		else
			cb(false)
		end
	end)
	exports["strata"]:RegisterServerCallback("Phone:Adverts:Delete", function(source, data, cb)
		exports['st_phone']:AdvertsDelete(source)
		cb(true)
	end)
end)

AddEventHandler("Phone:Server:RegisterMiddleware", function()
	exports['strata']:MiddlewareAdd("Phone:Spawning", function(source, char)
		return {
			{
				type = "adverts",
				data = _adverts,
			},
		}
	end)
end)

AddEventHandler("Characters:Server:PlayerLoggedOut", function(source, cData)
	exports['st_phone']:AdvertsDelete(source)
end)

AddEventHandler("Characters:Server:PlayerDropped", function(source, cData)
	exports['st_phone']:AdvertsDelete(source)
end)
