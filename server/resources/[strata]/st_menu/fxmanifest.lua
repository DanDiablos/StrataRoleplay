fx_version("cerulean")
description("Strata Menu")
author("Sanyo")
version("2.0.0")
game("gta5")
lua54("yes")

client_scripts({
	"@strata/exports/cl_error.lua",
	"@st_utils/client/anticheat/check.lua",
	"client/cl_main.lua",
})

ui_page("ui/dist/index.html")
files({
	"ui/dist/index.html",
	"ui/dist/assets/*.png",
	"ui/dist/assets/*.webp",
	"ui/dist/assets/*.js",
	"ui/dist/assets/*.css",
	"ui/dist/assets/*.mp3",
	"ui/dist/assets/*.ttf",
	"ui/dist/assets/*.woff2",
})
