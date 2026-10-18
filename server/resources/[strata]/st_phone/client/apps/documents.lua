RegisterNetEvent("Phone:Client:Documents:ReceivedSignature", function(id, data)
	SendNUIMessage({
		type = "DOCUMENTS_RECEIVED_SIGNATURE",
		data = {
			id = id,
			signature = data,
		},
	})

	exports['st_phone']:NotificationAdd(
		"Document Signed",
		string.format("%s Signed Your Document", data.signed_name),
		data.signed,
		6000,
		"documents",
		{
			view = "view/" .. id,
		},
		nil
	)
end)

RegisterNetEvent("Phone:Client:Documents:SigReqReceived", function(id, data)
	SendNUIMessage({
		type = "DOCUMENTS_RECEIVED_SIGNATURE",
		data = {
			id = id,
			signature = data,
		},
	})

	if data.signed ~= nil then
		exports['st_phone']:NotificationAdd(
			"Document Signed",
			string.format("%s Signed Your Document", data.signed_name),
			data.signed,
			6000,
			"documents",
			{
				view = "view/" .. id,
			},
			nil
		)
	end
end)

RegisterNetEvent("Phone:Client:Documents:Deleted", function(id)
	SendNUIMessage({
		type = "DOCUMENTS_DOCUMENT_DELETED",
		data = {
			id = id,
		},
	})
end)

RegisterNUICallback("EditDocument", function(data, cb)
	exports["strata"]:ServerCallback("Phone:Documents:Edit", data, cb)
end)

RegisterNUICallback("DeleteDocument", function(data, cb)
	exports["strata"]:ServerCallback("Phone:Documents:Delete", data.id, function(status)
		cb(status)
		if status then
			exports['st_phone']:DataRemove("myDocuments", data.id)
		end
	end)
end)

RegisterNUICallback("CreateDocument", function(data, cb)
	exports["strata"]:ServerCallback("Phone:Documents:Create", data, function(doc)
		cb(doc)
		if doc and type(doc) == "table" and doc.id then
			exports['st_phone']:DataAdd("myDocuments", doc)
		end
	end)
end)

RegisterNUICallback("ShareDocument", function(data, cb)
	exports["strata"]:ServerCallback("Phone:Documents:Share", data, cb)
end)

RegisterNUICallback("SignDocument", function(data, cb)
	exports["strata"]:ServerCallback("Phone:Documents:Sign", data, cb)
end)

RegisterNUICallback("Documents:GetSignatures", function(data, cb)
	exports["strata"]:ServerCallback("Phone:Documents:GetSignatures", data, cb)
end)
