fx_version("cerulean")
description("Strata Chat")
author("Sanyo")
version("2.0.0")
game("gta5")
lua54("yes")

shared_scripts({
    "@st_lib/shared/init.lua",
    "@st_lib/shared/types.lua",
    "@st_lib/shared/kit.lua",
    "@st_lib/shared/clock.lua",
    "@st_lib/shared/number.lua",
})

client_scripts({
    "@strata/exports/cl_error.lua",
    "@st_utils/client/anticheat/check.lua",
    "@st_lib/client/cl_log.lua",
    "@st_lib/client/cl_net.lua",
    "@st_lib/client/cl_self.lua",
    "@st_lib/client/cl_world.lua",
    "@st_lib/client/cl_field.lua",
    "@st_lib/client/cl_surface.lua",
    "@st_lib/client/cl_alert.lua",
    "client/component.lua",
    "client/cl_chat.lua",
    "client/commands.lua",
})

server_scripts({
    "@st_lib/server/sv_log.lua",
    "@st_lib/server/sv_net.lua",
    "@st_lib/server/sv_user.lua",
    "@st_lib/server/sv_clan.lua",
    "@st_lib/server/sv_store.lua",
    "@st_lib/server/sv_cash.lua",
    "server/component.lua",
    "server/sv_chat.lua",
    "server/utils.lua",
    "server/commands.lua",
})

ui_page("ui/dist/index.html")
files({
    "ui/dist/index.html",
    "ui/dist/assets/*.js",
    "ui/dist/assets/*.css",
    "ui/dist/assets/*.png",
    "ui/dist/assets/*.webp",
    "ui/dist/assets/*.ttf",
    "ui/dist/assets/*.woff2",
    "ui/dist/assets/*.mp3",
})
