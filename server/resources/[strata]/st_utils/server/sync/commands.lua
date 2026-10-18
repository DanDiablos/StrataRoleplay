function RegisterChatCommands()
    exports["st_chat"]:RegisterAdminCommand('freezetime', function(source, args, rawCommand)
        exports["st_utils"]:FreezeTime()
        exports["st_chat"]:SendServerSingle(source,
            'Time Has Been ' .. (exports["st_utils"]:GetTimeFrozen() and 'Frozen' or 'Unfrozen'))
    end, {
        help = 'Freeze Time',
        params = {}
    })

    exports["st_chat"]:RegisterAdminCommand('freezeweather', function(source, args, rawCommand)
        exports["st_utils"]:FreezeWeather()
        exports["st_chat"]:SendServerSingle(source,
            'Weather Has Been ' .. (exports["st_utils"]:GetWeatherFrozen() and 'Frozen' or 'Unfrozen'))
    end, {
        help = 'Freeze the Weather',
        params = {}
    })

    exports["st_chat"]:RegisterAdminCommand('weather', function(source, args, rawCommand)
        for _, v in pairs(AvailableWeatherTypes) do
            if args[1]:upper() == v then
                exports["st_utils"]:SetWeather(args[1])
                return
            end
        end
        exports["st_chat"]:SendServerSingle(source, 'Invalid Weather Type')
    end, {
        help = 'Set Weather',
        params = { {
            name = 'Type',
            help =
            'EXTRASUNNY, CLEAR, NEUTRAL, SMOG, FOGGY, OVERCAST, CLOUDS, CLEARING, RAIN, THUNDER, SNOW, BLIZZARD, SNOWLIGHT, XMAS, HALLOWEEN'
        }
        }
    }, 1)

    exports["st_chat"]:RegisterAdminCommand('time', function(src, args, raw)
        exports["st_utils"]:SetTimeType(args[1])
    end, {
        help = 'Set Time',
        params = {
            { name = 'Type', help = 'MORNING, NOON, EVENING, NIGHT' }
        }
    }, 1)

    exports["st_chat"]:RegisterAdminCommand('clock', function(src, args, raw)
        exports["st_utils"]:SetTime(tonumber(args[1]), tonumber(args[2]))
    end, {
        help = 'Set Specific Hour',
        params = {
            { name = 'Hour', help = '0 - 23' },
        }
    }, -1)

    exports["st_chat"]:RegisterAdminCommand('blackout', function(source, args, rawCommand)
        exports["st_utils"]:SetBlackout()
        exports["st_chat"]:SendServerSingle(source,
            'Blackout Has Been ' .. (exports["st_utils"]:GetBlackout() and 'Enabled' or 'Disabled'))
    end, {
        help = 'Toggle Blackout'
    }, 0)

    exports["st_chat"]:RegisterAdminCommand('winter', function(source, args, rawCommand)
        exports["st_utils"]:SetWinter()
        exports["st_chat"]:SendServerSingle(source, 'Winter Only Weather Has Been ' ..
            (exports["st_utils"]:GetWinter() and 'Enabled' or 'Disabled'))
    end, {
        help = 'Toggle Winter Only Weather'
    }, 0)
end
