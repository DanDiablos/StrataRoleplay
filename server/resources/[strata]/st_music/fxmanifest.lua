name "DJBooth"
fx_version "cerulean"
description("Strata Framework Dj")
author("Sanyo")
version("1.0.0")
game "gta5"

client_scripts {
	"@st_zones/client/polyzone/client.lua",
	"@st_zones/client/polyzone/BoxZone.lua",
	"@st_zones/client/polyzone/EntityZone.lua",
	"@st_zones/client/polyzone/CircleZone.lua",
	"@st_zones/client/polyzone/ComboZone.lua",
    'client.lua'
}

shared_script { 'config.lua' }
server_script { 'server.lua' }

dependency 'st_sound'

lua54 'yes'