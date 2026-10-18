local _threading = false

function StartMazeBankThreads()
	if _threading then return end
	_threading = true


	CreateThread(function()
		while _threading do
			if _mbGlobalReset ~= nil then
				if os.time() > _mbGlobalReset then
					Strata.Log.Info("Robbery", "Maze Bank Heist Has Been Reset")
					ResetMazeBank()
				end
			end
			Wait(30000)
		end
	end)

	CreateThread(function()
		while _threading do
		local powerDisabled = IsMBPowerDisabled()
		if not powerDisabled and not exports['st_doors']:IsLocked("strata_mazebank_offices") then
			exports['st_doors']:SetLock("strata_mazebank_offices", true)
			for k, v in ipairs(_mbOfficeDoors) do
				exports['st_doors']:SetLock(v.door, true)
			end
		elseif powerDisabled and exports['st_doors']:IsLocked("strata_mazebank_offices") then
			exports['st_doors']:SetLock("strata_mazebank_offices", false)
			end
			Wait((1000 * 60) * 1)
		end
	end)

	CreateThread(function()
		while _threading do
			for k, v in pairs(_mbHacks) do
				if
					GlobalState[string.format("MazeBank:ManualDoor:%s", v.doorId)] ~= nil
					and GlobalState[string.format("MazeBank:ManualDoor:%s", v.doorId)].state == 2
					and GlobalState[string.format("MazeBank:ManualDoor:%s", v.doorId)].expires < os.time()
				then
					Strata.Log.Info("Robbery", string.format("Maze Bank Door %s Opening", v.doorId))
					GlobalState[string.format("MazeBank:ManualDoor:%s", v.doorId)] = {
						state = 3,
					}
					TriggerClientEvent("Robbery:Client:MazeBank:OpenVaultDoor", -1, v)
				end
			end

			Wait(30000)
		end
	end)
end
