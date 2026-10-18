fx_version("cerulean")
games({ "gta5" })
lua54("yes")
client_script("@strata/exports/cl_error.lua")
client_script("@st_utils/client/anticheat/check.lua")

description("Strata Framework Businesses")
name("strata RP Framework: st_business")
author("Sanyo")
version("1.0.0")

client_scripts({
	"@st_lib/client/cl_log.lua",
	"@st_lib/client/cl_net.lua",
	"@st_lib/client/cl_self.lua",
	"@st_lib/client/cl_world.lua",
	"@st_lib/client/cl_field.lua",
	"@st_lib/client/cl_surface.lua",
	"@st_lib/client/cl_alert.lua",
	"@st_lib/client/cl_world.lua",
	"client/**/*.lua",
})

server_scripts({
	"@st_lib/server/sv_log.lua",
	"@st_lib/server/sv_net.lua",
	"@st_lib/server/sv_user.lua",
	"@st_lib/server/sv_clan.lua",
	"@st_lib/server/sv_store.lua",
	"@st_lib/server/sv_cash.lua",
	'@oxmysql/lib/MySQL.lua',
	"config/sv_config.lua",
	"config/businesses/*.lua",
	"server/**/*.lua",
})

shared_scripts({
	"@st_lib/shared/init.lua",
	"@st_lib/shared/types.lua",
	"@st_lib/shared/kit.lua",
	"@st_lib/shared/clock.lua",
	"@st_lib/shared/number.lua",
	"shared/**/*.lua",
})

files({
	"dui/bowling/app.js",
	"dui/bowling/index.html",
	"dui/bowling/*.png",
	"dui/bowling/gifs/*.gif",
	"dui/tvs/app.js",
	"dui/tvs/index.html",
})
