fx_version("cerulean")
description("Strata Sound (SFX + Sound)")
author("Sanyo")
version("2.0.0")
game("gta5")
lua54("yes")

client_script("@strata/exports/cl_error.lua")
client_script("@st_utils/client/anticheat/check.lua")

shared_scripts({
	"@st_lib/shared/init.lua",
	"@st_lib/shared/types.lua",
	"@st_lib/shared/kit.lua",
	"@st_lib/shared/clock.lua",
	"@st_lib/shared/number.lua",
	"sound_config.lua",
})

client_scripts({
	"@st_lib/client/cl_log.lua",
	"@st_lib/client/cl_net.lua",
	"@st_lib/client/cl_self.lua",
	"@st_lib/client/cl_world.lua",
	"@st_lib/client/cl_field.lua",
	"@st_lib/client/cl_surface.lua",
	"@st_lib/client/cl_alert.lua",

	-- SFX
	"client/sfx/**/*.lua",

	-- Sound (explicit order — main + events + commands, then exports + effects + emulator)
	"client/sound/main.lua",
	"client/sound/events.lua",
	"client/sound/commands.lua",
	"client/sound/exports/info.lua",
	"client/sound/exports/play.lua",
	"client/sound/exports/manipulation.lua",
	"client/sound/exports/events.lua",
	"client/sound/effects/main.lua",
	"client/sound/emulator/interact_sound/client.lua",
})

server_scripts({
	"@st_lib/server/sv_log.lua",
	"@st_lib/server/sv_net.lua",
	"@st_lib/server/sv_user.lua",
	"@st_lib/server/sv_clan.lua",
	"@st_lib/server/sv_store.lua",
	"@st_lib/server/sv_cash.lua",

	-- SFX
	"server/sfx/**/*.lua",

	-- Sound
	"server/sound/exports/play.lua",
	"server/sound/exports/manipulation.lua",
	"server/sound/emulator/interact_sound/server.lua",
})

ui_page("ui/index.html")

files({
	"ui/index.html",
	"ui/sfx/howler.min.js",
	"ui/sfx/script.js",
	"ui/sfx/sounds/*.ogg",
	"ui/sfx/sounds/*.mp3",
	"ui/sound/scripts/*.js",
})
