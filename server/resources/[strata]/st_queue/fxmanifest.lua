fx_version("cerulean")
description("Strata Queue")
author("Sanyo")
version("2.0.0")
game("gta5")
lua54("yes")

server_only("yes")

shared_scripts({
	"@st_lib/shared/init.lua",
	"@st_lib/shared/types.lua",
	"@st_lib/shared/kit.lua",
	"@st_lib/shared/clock.lua",
	"@st_lib/shared/number.lua",
	"config/config.lua",
})

server_scripts({
	"@oxmysql/lib/MySQL.lua",
	"@st_lib/server/sv_log.lua",
	"@st_lib/server/sv_net.lua",
	"@st_lib/server/sv_user.lua",
	"@st_lib/server/sv_clan.lua",
	"@st_lib/server/sv_store.lua",
	"@st_lib/server/sv_cash.lua",
	"server/sv_main.lua",
})
