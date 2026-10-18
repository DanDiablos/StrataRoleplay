fx_version("cerulean")
description("Strata Keybinds")
author("Sanyo")
version("2.0.0")
game("gta5")
lua54("yes")

client_scripts({
	"@strata/exports/cl_error.lua",
	"@st_utils/client/anticheat/check.lua",
	"client/cl_main.lua",
})
