fx_version("cerulean")
description("Strata Shared Library")
author("Sanyo")
version("1.0.0")
game("gta5")
lua54("yes")

shared_scripts({
    "shared/init.lua",
    "shared/types.lua",
    "shared/kit.lua",
    "shared/clock.lua",
    "shared/number.lua",
})

client_scripts({
    "@st_utils/client/anticheat/check.lua",
    "client/cl_log.lua",
    "client/cl_net.lua",
    "client/cl_self.lua",
    "client/cl_world.lua",
    "client/cl_field.lua",
    "client/cl_surface.lua",
    "client/cl_alert.lua",
})

server_scripts({
    "@oxmysql/lib/MySQL.lua",
    "server/sv_log.lua",
    "server/sv_net.lua",
    "server/sv_user.lua",
    "server/sv_clan.lua",
    "server/sv_store.lua",
    "server/sv_cash.lua",
})

dependencies({ "strata", "ox_lib" })
