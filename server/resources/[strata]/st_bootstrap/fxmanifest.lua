fx_version("cerulean")
description("Strata Intro")
author("Sanyo")
version("2.0.0")
game("gta5")
lua54("yes")

loadscreen("ui/dist/index.html")
loadscreen_manual_shutdown("yes")

files({
    "ui/dist/index.html",
    "ui/dist/assets/*.js",
    "ui/dist/assets/*.css",
    "ui/dist/assets/*.jpg",
    "ui/dist/assets/*.woff2",
})
