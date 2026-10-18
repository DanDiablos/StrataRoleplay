CreateThread(function()
    local spawned = false
    while true do
        spawned = false

        if #_moneyTruckSpawns == 0 then
            _moneyTruckSpawns = table.copy(_spawnHoldingShit)
        end

        if _truckSpawnEnabled then
            spawned = SpawnBobcatTruck(`stockade`)
            if not spawned then
                Wait(30000)
            else
                Wait(BCT_SPAWN_RATE)
            end
        else
            Wait(60000)
        end
    end
end)
