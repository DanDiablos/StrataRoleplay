AddEventHandler('Vehicles:Client:StartUp', function()
    exports["st_binds"]:Add('emergency_lights', 'Q', 'keyboard', 'Vehicle - Toggle Emergency Lighting',
        function()
            exports['st_veh']:SyncEmergencyLightsToggle()
        end)

    exports["st_binds"]:Add('emergency_sirens', 'LMENU', 'keyboard', 'Vehicle - Toggle Emergency Sirens',
        function()
            exports['st_veh']:SyncEmergencySirenToggle()
        end)

    exports["st_binds"]:Add('emergency_sirens_tone', 'R', 'keyboard', 'Vehicle - Cycle Emergency Siren Tone',
        function()
            exports['st_veh']:SyncEmergencySirenCycle()
        end)

    exports["st_binds"]:Add('emergency_airhorn', 'E', 'keyboard', 'Vehicle - Emergency Airhorn', function()
        exports['st_veh']:SyncEmergencyAirhornSet(true)
    end, function()
        exports['st_veh']:SyncEmergencyAirhornSet(false)
    end)

    exports["st_binds"]:Add('veh_indicators_hazards', '', 'keyboard', 'Vehicle - Indicator - Hazards', function()
        exports['st_veh']:SyncIndicatorsSet(0)
    end)

    exports["st_binds"]:Add('veh_indicators_right', '', 'keyboard', 'Vehicle - Indicator - Right', function()
        exports['st_veh']:SyncIndicatorsSet(1)
    end)

    exports["st_binds"]:Add('veh_indicators_left', '', 'keyboard', 'Vehicle - Indicator - Left', function()
        exports['st_veh']:SyncIndicatorsSet(2)
    end)

    exports["st_binds"]:Add('veh_neons_toggle', '', 'keyboard', 'Vehicle - Toggle Neons/Underglow', function()
        exports['st_veh']:SyncNeonsToggle()
    end)

    exports["st_binds"]:Add('veh_bike_drop', 'G', 'keyboard', 'Vehicle - Put Down Bicycle', function()
        exports['st_veh']:SyncBikeDrop()
    end)

    exports["st_binds"]:Add('veh_k9_leavevehicle', '', 'keyboard', 'Vehicle - K9 - Get Out of Vehicle',
        function()
            if LocalPlayer.state.isK9Ped then
                TriggerEvent("Vehicles:Client:K9LeaveVehicle")
            end
        end)
end)
