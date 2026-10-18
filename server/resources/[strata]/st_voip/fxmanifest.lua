game("gta5")
fx_version("cerulean")
description("Strata Framework Voip")
author("Sanyo")
version("1.0.0")
client_script("@strata/exports/cl_error.lua")
client_script("@st_utils/client/anticheat/check.lua")

lua54("yes")

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
