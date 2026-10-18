--[[ FX Information ]]--
fx_version   'cerulean'
use_experimental_fxv2_oal 'yes'
lua54        'yes'
game         'gta5'

--[[ Resource Information ]]--
name         'st_target'
version      '1.17.3'
license      'GPL-3.0-or-later'
author       'Overextended (forked by Sanyo)'
repository   'https://github.com/communityox/ox_target'
description  'Strata Thirdeye - performant third-eye targeting for Strata.'

--[[ Manifest ]]--
ui_page 'web/build/index.html'

shared_scripts {
    '@ox_lib/init.lua',
    'config.lua',
}

client_scripts {
    'client/main.lua',
}

server_scripts {
    'server/main.lua'
}

files {
    'web/build/index.html',
    'web/build/**/*',
    'locales/*.json',
    'client/api.lua',
    'client/utils.lua',
    'client/state.lua',
    'client/debug.lua',
    'client/defaults.lua',
    'client/framework/strata.lua',
}

dependency 'ox_lib'
