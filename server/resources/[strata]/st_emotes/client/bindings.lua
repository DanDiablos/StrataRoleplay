exports("EmoteBindsUpdate", function(newBinds)
	exports["strata"]:ServerCallback("Animations:UpdateEmoteBinds", newBinds, function(success, data)
		if success then
			emoteBinds = data
			exports["st_ui"]:Notification("success", "Successfully Updated and Saved Keybinds", 5000)
		end
	end)
end)

exports("EmoteBindsUse", function(bindId)
	local bindEmote = emoteBinds[tostring(bindId)]
	if bindEmote and type(bindEmote) == "string" then
		exports['st_emotes']:EmotesPlay(bindEmote, true)
	end
end)

RegisterNetEvent("Animations:Client:OpenEmoteBinds", function()
	local bindInputs = {}
	for bindNum = 1, 4 do
		table.insert(bindInputs, {
			id = "bind-" .. bindNum,
			type = "text",
			options = {
				inputProps = {
					maxLength = 64,
				},
				label = string.format(
					"Emote Bind #%s - Currently Assigned to %s",
					bindNum,
					exports["st_binds"]:GetKey("emote_bind_" .. bindNum)
				),
				defaultValue = emoteBinds[tostring(bindNum)] or "",
			},
		})
	end

	exports['st_ui']:InputShow("Emote Binds", "Input Label", bindInputs, "Animations:Client:SaveEmoteBinds", {})
end)

AddEventHandler("Animations:Client:SaveEmoteBinds", function(values)
	local updatedBinds = {}

	for bindNum = 1, 4 do
		local newValue = values["bind-" .. bindNum]
		if newValue then
			updatedBinds[tostring(bindNum)] = newValue
		end
	end

	exports['st_emotes']:EmoteBindsUpdate(updatedBinds)
end)
