fx_version("cerulean")
description("Strata Web API")
author("Sanyo")
version("2.0.0")
game("gta5")
lua54("yes")

server_only("yes")

server_scripts({
    "config/config.lua",
    "server/sv_main.lua",
    "ws/server.js",
    "ws/namespaces/*.js",
})

files({
    "cert.pem",
    "privkey.pem",
})
