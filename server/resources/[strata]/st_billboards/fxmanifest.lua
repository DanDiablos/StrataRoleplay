fx_version("cerulean")
description("Strata Billboards")
author("Sanyo")
version("2.0.0")
game("gta5")
lua54("yes")

shared_scripts({
    "config/config.lua",
})

client_scripts({
    "@strata/exports/cl_error.lua",
    "@st_utils/client/anticheat/check.lua",
    "client/cl_main.lua",
})

server_scripts({
    "@oxmysql/lib/MySQL.lua",
    "server/sv_main.lua",
})
