fx_version("cerulean")
description("Strata Framework Games")
author("Sanyo")
version("1.0.0")
games({ "gta5" })
lua54("yes")
client_script("@strata/exports/cl_error.lua")
client_script("@st_utils/client/anticheat/check.lua")

-- data_file "SCALEFORM_DLC_FILE" "stream/int3232302352.gfx"

shared_scripts({
	"@st_lib/shared/init.lua",
	"@st_lib/shared/types.lua",
	"@st_lib/shared/kit.lua",
	"@st_lib/shared/clock.lua",
	"@st_lib/shared/number.lua",
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
	"config.lua",
	"client/*.lua",
	--'demo_games.lua',
})

server_scripts({
	"@st_lib/server/sv_log.lua",
	"@st_lib/server/sv_net.lua",
	"@st_lib/server/sv_user.lua",
	"@st_lib/server/sv_clan.lua",
	"@st_lib/server/sv_store.lua",
	"@st_lib/server/sv_cash.lua",
	"config.lua",
	"server/*.lua",
})

ui_page("ui/dist/index.html")
files({
	"ui/dist/index.html",
	"ui/dist/assets/*.js",
	"ui/dist/assets/*.css",
	"ui/dist/assets/*.png",
	"ui/dist/assets/*.webp",
	"ui/dist/assets/*.mp3",
	"ui/dist/assets/*.ogg",
	"ui/dist/assets/*.ttf",
	"ui/dist/assets/*.woff2",
})
