RegisterNUICallback("CreateContact", function(data, cb)
	exports["strata"]:ServerCallback("Phone:Contacts:Create", data, function(nId)
		cb(nId)
		if nId then
			exports['st_phone']:DataAdd("contacts", {
				id = nId,
				name = data.name,
				number = data.number,
				color = data.color,
				favorite = data.favorite or false,
			})
		end
	end)
end)

RegisterNUICallback("UpdateContact", function(data, cb)
	exports["strata"]:ServerCallback("Phone:Contacts:Update", data, function(status)
		cb(status)
		if status then
			exports['st_phone']:DataUpdate("contacts", data.id, {
				name = data.name,
				number = data.number,
				color = data.color,
				avatar = data.avatar,
				favorite = data.favorite,
			})
		end
	end)
end)

RegisterNUICallback("DeleteContact", function(data, cb)
	exports["strata"]:ServerCallback("Phone:Contacts:Delete", data, function(status)
		cb(status)
		if status then
			exports['st_phone']:DataRemove("contacts", data.id)
		end
	end)
end)
