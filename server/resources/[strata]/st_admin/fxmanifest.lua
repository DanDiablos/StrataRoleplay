fx_version("cerulean")
description("Strata Admin")
author("Sanyo")
version("2.0.0")
game("gta5")
lua54("yes")

shared_scripts({
    "@st_lib/shared/init.lua",
})

client_scripts({
    "@ox_lib/init.lua",
    "@strata/exports/cl_error.lua",
    "@st_utils/client/anticheat/check.lua",
    "@st_lib/client/cl_log.lua",
    "client/cl_noclip.lua",
    "client/cl_menu.lua",
    "client/cl_spectate.lua",
    "client/cl_playertags.lua",
    "client/cl_nuke.lua",
    "client/cl_weapontest.lua",
    "client/cl_doorlock.lua",
    "client/cl_main.lua",
})

server_scripts({
    "@oxmysql/lib/MySQL.lua",
    "@st_lib/server/sv_log.lua",
    "@st_lib/server/sv_user.lua",
    "server/sv_doorlock.lua",
    "server/sv_callbacks.lua",
    "server/sv_dashboard.lua",
    "server/sv_main.lua",
})

ui_page("ui/dist/index.html")

files({
    "ui/dist/index.html",
    "ui/dist/assets/*.js",
    "ui/dist/assets/*.css",
    "ui/dist/assets/*.woff2",
    "ui/dist/assets/*.png",
    "ui/dist/assets/*.webp",
})
