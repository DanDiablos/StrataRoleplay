--[[ FX Information ]]--
fx_version   'cerulean'
use_experimental_fxv2_oal 'yes'
lua54        'yes'
game         'gta5'

--[[ Resource Information ]]--
name         'st_doors'
version      '1.21.0'
license      'GPL-3.0-or-later'
author       'Overextended (forked by Sanyo)'
repository   'https://github.com/communityox/ox_doorlock'

--[[ Manifest ]]--
shared_scripts {
	'@ox_lib/init.lua',
	'@st_lib/shared/init.lua',
	'@st_lib/shared/types.lua',
	'@st_lib/shared/kit.lua',
	'@st_lib/shared/clock.lua',
	'@st_lib/shared/number.lua',
	'config.lua',
}

client_scripts {
	'@st_lib/client/cl_log.lua',
	'@st_lib/client/cl_net.lua',
	'@st_lib/client/cl_self.lua',
	'@st_lib/client/cl_world.lua',
	'@st_lib/client/cl_field.lua',
	'@st_lib/client/cl_surface.lua',
	'@st_lib/client/cl_alert.lua',
	'client/main.lua',
	'client/utils.lua',
	'client/keyfob.lua',
}

server_scripts {
	'@oxmysql/lib/MySQL.lua',
	'@st_lib/server/sv_log.lua',
	'@st_lib/server/sv_net.lua',
	'@st_lib/server/sv_user.lua',
	'@st_lib/server/sv_clan.lua',
	'@st_lib/server/sv_store.lua',
	'@st_lib/server/sv_cash.lua',
	'server/main.lua',
	'server/keyfob.lua',
}

ui_page 'web/build/index.html'

files {
	'web/build/index.html',
	'web/build/**/*',
	'locales/*.json',
	'audio/data/oxdoorlock_sounds.dat54.rel',
	'audio/dlc_oxdoorlock/oxdoorlock.awc',
}

data_file 'AUDIO_WAVEPACK' 'audio/dlc_oxdoorlock'
data_file 'AUDIO_SOUNDDATA' 'audio/data/oxdoorlock_sounds.dat'

dependencies {
	'oxmysql',
	'ox_lib',
}

ox_libs {
    'locale',
    'table',
}
