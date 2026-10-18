name("strata RP Framework Phone")
description("Strata Framework Phone")
author("Sanyo")
lua54("yes")
fx_version("cerulean")
version("1.0.0")
game("gta5")
shared_scripts({
	"@st_lib/shared/init.lua",
	"@st_lib/shared/types.lua",
	"@st_lib/shared/kit.lua",
	"@st_lib/shared/clock.lua",
	"@st_lib/shared/number.lua",
	"config/config.lua",
})

client_script("@strata/exports/cl_error.lua")
client_script("@st_utils/client/anticheat/check.lua")

ui_page("ui/dist/index.html")
files({
	"ui/dist/index.html",
	"ui/dist/assets/*.js",
	"ui/dist/assets/*.css",
	"ui/dist/assets/*.png",
	"ui/dist/assets/*.webp",
	"ui/dist/assets/*.woff2",
	"ui/dist/assets/*.mp3",
})

client_scripts({
	"@st_lib/client/cl_log.lua",
	"@st_lib/client/cl_net.lua",
	"@st_lib/client/cl_self.lua",
	"@st_lib/client/cl_world.lua",
	"@st_lib/client/cl_field.lua",
	"@st_lib/client/cl_surface.lua",
	"@st_lib/client/cl_alert.lua",
	"@st_lib/client/cl_world.lua",
	"client/*.lua",
	"client/apps/**/*.lua",
})

server_scripts({
	"@st_lib/server/sv_log.lua",
	"@st_lib/server/sv_net.lua",
	"@st_lib/server/sv_user.lua",
	"@st_lib/server/sv_clan.lua",
	"@st_lib/server/sv_store.lua",
	"@st_lib/server/sv_cash.lua",
	'@oxmysql/lib/MySQL.lua',
	"server/*.lua",
	"server/apps/**/*.lua",
})
