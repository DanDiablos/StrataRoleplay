exports("DiscordRichPresence", function()
	SetDiscordAppId(exports["strata"]:GetDiscordApp())
	SetDiscordRichPresenceAsset("stratarp_large_icon")
	SetDiscordRichPresenceAssetText("Join Today: strataRP.gg")
	--SetDiscordRichPresenceAssetSmall("info")
	SetDiscordRichPresenceAction(0, "Apply Now", "https://stratarp.gg")
	SetDiscordRichPresenceAction(1, "Join Our Discord", "https://discord.gg/stratagg")

	CreateThread(function()
		while true do
			local char = LocalPlayer.state.Character
			local playerCount = GlobalState["PlayerCount"] or 0
			local queueCount = GlobalState["QueueCount"] or 0
			if char ~= nil then
				SetRichPresence(
					string.format(
						"[%d/%d]%s - Playing %s %s",
						playerCount,
						GlobalState.MaxPlayers,
						queueCount > 0 and string.format(" (Queue: %d)", queueCount) or "",
						char:GetData("First"),
						char:GetData("Last")
					)
				)
			else
				SetRichPresence(
					string.format(
						"[%d/%d]%s - Selecting a Character",
						playerCount,
						GlobalState.MaxPlayers,
						queueCount > 0 and string.format(" (Queue: %d)", queueCount) or ""
					)
				)
			end

			-- SetDiscordRichPresenceAssetSmallText(
			-- 	string.format("%s/%s [Queue: %s]", playerCount, GlobalState.MaxPlayers, queueCount)
			-- )
			Wait(30000)
		end
	end)
end)

CreateThread(function()
	exports['strata']:DiscordRichPresence()
end)
