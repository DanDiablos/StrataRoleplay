fx_version("cerulean")
description("Strata Zones (PolyZone + Killzones)")
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
})

client_scripts({
	"@st_lib/client/cl_log.lua",
	"@st_lib/client/cl_net.lua",
	"@st_lib/client/cl_self.lua",
	"@st_lib/client/cl_world.lua",
	"@st_lib/client/cl_field.lua",
	"@st_lib/client/cl_surface.lua",
	"@st_lib/client/cl_alert.lua",

	-- PolyZone (explicit order — base classes before wrapper/consumers)
	"client/polyzone/client.lua",
	"client/polyzone/BoxZone.lua",
	"client/polyzone/EntityZone.lua",
	"client/polyzone/CircleZone.lua",
	"client/polyzone/ComboZone.lua",
	"client/polyzone/creation/*.lua",
	"client/polyzone/wrapper.lua",

	-- Killzones (depends on polyzone)
	"client/killzones/**/*.lua",
})
