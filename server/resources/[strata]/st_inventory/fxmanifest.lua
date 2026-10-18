fx_version 'cerulean'
use_experimental_fxv2_oal 'yes'
lua54 'yes'
game 'gta5'
name 'st_inventory'
author 'Strata'
version '2.44.8'
description 'Strata slot-based inventory with item metadata, back items, drag craft, and item carry'

dependencies {
    '/server:6116',
    '/onesync',
    'oxmysql',
    'ox_lib',
}

shared_scripts {
    '@ox_lib/init.lua',
    '@st_lib/shared/init.lua',
    '@st_lib/shared/types.lua',
    '@st_lib/shared/kit.lua',
    '@st_lib/shared/clock.lua',
    '@st_lib/shared/number.lua',
}

ox_libs {
    'locale',
    'table',
    'math',
}

server_scripts {
    '@oxmysql/lib/MySQL.lua',
    '@st_lib/server/sv_log.lua',
    '@st_lib/server/sv_net.lua',
    '@st_lib/server/sv_user.lua',
    '@st_lib/server/sv_clan.lua',
    '@st_lib/server/sv_store.lua',
    '@st_lib/server/sv_cash.lua',
    'init.lua',
    'addons/**/server/*.lua',
}

client_scripts {
    '@st_lib/client/cl_log.lua',
    '@st_lib/client/cl_net.lua',
    '@st_lib/client/cl_self.lua',
    '@st_lib/client/cl_world.lua',
    '@st_lib/client/cl_field.lua',
    '@st_lib/client/cl_surface.lua',
    '@st_lib/client/cl_alert.lua',
    'init.lua',
    'addons/**/client/*.lua',
}

ui_page 'web/build/index.html'

files {
    'client.lua',
    'server.lua',
    'locales/*.json',
    'web/build/index.html',
    'web/build/assets/*.js',
    'web/build/assets/*.css',
    'web/build/sounds/*.*',
    'web/images/*.webp',
    'modules/**/shared.lua',
    'modules/**/client.lua',
    'modules/bridge/**/client.lua',
    'data/*.lua',
    'addons/**/config.lua',
    'addons/**/imports/*.lua',
}
