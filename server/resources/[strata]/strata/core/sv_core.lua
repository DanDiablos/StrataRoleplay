exports("Shutdown", function(reason)
	exports['strata']:LoggerCritical("Core", "Shutting Down Core, Reason: " .. reason, {
		console = true,
		file = true,
	})
	Wait(1000) -- Need wait period so logging can finish
	os.exit()
end)

exports("DropAll", function()
	for k, v in pairs(exports["strata"]:GetAllPlayers()) do
		if v ~= nil then
			DropPlayer(
				v:GetData("Source"),
				"⛔ Server Restarting ⛔ Due to a pending restart, you've been dropped from the server. Please ❗❗❗RESTART FIVEM❗❗❗ and reconnect in a few minutes."
			)
		end
	end
end)

AddEventHandler("Core:Server:ForceAllSave", function()
	exports['st_queue']:CloseAndDrop()
	exports["strata"]:DropAll()
	TriggerEvent("Core:Server:ForceSave")
end)

AddEventHandler("txAdmin:events:scheduledRestart", function(eventData)
	if eventData.secondsRemaining <= 60 then
		exports['st_queue']:CloseAndDrop()
		exports["strata"]:DropAll()
		TriggerEvent("Core:Server:ForceSave")
	elseif not GlobalState["RestartLockdown"] and eventData.secondsRemaining <= (60 * 30) then
		GlobalState["RestartLockdown"] = true
	end

	-- exports["st_chat"]:SendSystemBroadcast( -- TX Admin Sends them
	-- 	string.format("Server Restart In %s Minutes", math.floor(eventData.secondsRemaining / 60))
	-- )
end)

AddEventHandler("Core:Server:StartupReady", function()
	SetupAPIHandler()
end)

-- CreateThread(function()
-- 	while true do
-- 		GlobalState["OS:Time"] = os.time()
-- 		Wait(1000)
-- 	end
-- end)

RegisterNetEvent("Core:Server:ResourceStopped", function(resource)
	local src = source
	if resource == "st_utils" then
		exports['strata']:PunishmentBanSource(src, -1, "Anticheat Resource Stopped", "Anticheat")
	end
end)

RegisterCommand("rcondisablelockdown", function()
	GlobalState["RestartLockdown"] = false
end, true)
