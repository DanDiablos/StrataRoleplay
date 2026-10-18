fx_version("cerulean")
description("Strata Framework Anticheat")
author("Sanyo")
version("1.0.0")
games({ "gta5" })
lua54("yes")
client_script("@strata/exports/cl_error.lua")

shared_scripts({
	"@st_lib/shared/init.lua",
	"@st_lib/shared/types.lua",
	"@st_lib/shared/kit.lua",
	"@st_lib/shared/clock.lua",
	"@st_lib/shared/number.lua",
	"shared/**/*.lua",
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
	"game/dist/client.js",
	"cl_*.lua",
	"client/anticheat/**/*.lua",
	"client/capture/**/*.lua",
	"client/escort/**/*.lua",
	"client/pedinteraction/**/*.lua",
	"client/scenes/**/*.lua",
	"client/status/**/*.lua",
	"client/sync/**/*.lua",

	-- Lasers (explicit order — client + wrapper before utils + creation)
	"client/lasers/client.lua",
	"client/lasers/wrapper.lua",
	"client/lasers/utils.lua",
	"client/lasers/creation.lua",

	-- IPL (explicit order — lib + observers + base must load first)
	"client/ipl/lib/common.lua",
	"client/ipl/lib/observers/interiorIdObserver.lua",
	"client/ipl/lib/observers/officeSafeDoorHandler.lua",
	"client/ipl/lib/observers/officeCullHandler.lua",
	"client/ipl/client.lua",

	"client/ipl/gtav/base.lua",
	"client/ipl/gtav/ammunations.lua",
	"client/ipl/gtav/bahama.lua",
	"client/ipl/gtav/cargoship.lua",
	"client/ipl/gtav/floyd.lua",
	"client/ipl/gtav/franklin.lua",
	"client/ipl/gtav/franklin_aunt.lua",
	"client/ipl/gtav/graffitis.lua",
	"client/ipl/gtav/pillbox_hospital.lua",
	"client/ipl/gtav/lester_factory.lua",
	"client/ipl/gtav/michael.lua",
	"client/ipl/gtav/north_yankton.lua",
	"client/ipl/gtav/red_carpet.lua",
	"client/ipl/gtav/simeon.lua",
	"client/ipl/gtav/stripclub.lua",
	"client/ipl/gtav/trevors_trailer.lua",
	"client/ipl/gtav/ufo.lua",
	"client/ipl/gtav/zancudo_gates.lua",

	"client/ipl/gta_online/apartment_hi_1.lua",
	"client/ipl/gta_online/apartment_hi_2.lua",
	"client/ipl/gta_online/house_hi_1.lua",
	"client/ipl/gta_online/house_hi_2.lua",
	"client/ipl/gta_online/house_hi_3.lua",
	"client/ipl/gta_online/house_hi_4.lua",
	"client/ipl/gta_online/house_hi_5.lua",
	"client/ipl/gta_online/house_hi_6.lua",
	"client/ipl/gta_online/house_hi_7.lua",
	"client/ipl/gta_online/house_hi_8.lua",
	"client/ipl/gta_online/house_mid_1.lua",
	"client/ipl/gta_online/house_low_1.lua",

	"client/ipl/dlc_high_life/apartment1.lua",
	"client/ipl/dlc_high_life/apartment2.lua",
	"client/ipl/dlc_high_life/apartment3.lua",
	"client/ipl/dlc_high_life/apartment4.lua",
	"client/ipl/dlc_high_life/apartment5.lua",
	"client/ipl/dlc_high_life/apartment6.lua",

	"client/ipl/dlc_heists/carrier.lua",
	"client/ipl/dlc_heists/yacht.lua",

	"client/ipl/dlc_executive/apartment1.lua",
	"client/ipl/dlc_executive/apartment2.lua",
	"client/ipl/dlc_executive/apartment3.lua",

	"client/ipl/dlc_finance/office1.lua",
	"client/ipl/dlc_finance/office2.lua",
	"client/ipl/dlc_finance/office3.lua",
	"client/ipl/dlc_finance/office4.lua",
	"client/ipl/dlc_finance/organization.lua",

	"client/ipl/dlc_bikers/cocaine.lua",
	"client/ipl/dlc_bikers/counterfeit_cash.lua",
	"client/ipl/dlc_bikers/document_forgery.lua",
	"client/ipl/dlc_bikers/meth.lua",
	"client/ipl/dlc_bikers/weed.lua",
	"client/ipl/dlc_bikers/clubhouse1.lua",
	"client/ipl/dlc_bikers/clubhouse2.lua",
	"client/ipl/dlc_bikers/gang.lua",

	"client/ipl/dlc_import/garage1.lua",
	"client/ipl/dlc_import/garage2.lua",
	"client/ipl/dlc_import/garage3.lua",
	"client/ipl/dlc_import/garage4.lua",
	"client/ipl/dlc_import/vehicle_warehouse.lua",

	"client/ipl/dlc_gunrunning/bunkers.lua",
	"client/ipl/dlc_gunrunning/yacht.lua",

	"client/ipl/dlc_smuggler/hangar.lua",

	"client/ipl/dlc_doomsday/facility.lua",

	"client/ipl/dlc_afterhours/nightclubs.lua",

	"client/ipl/dlc_casino/casino.lua",
	"client/ipl/dlc_casino/penthouse.lua",
	"client/ipl/dlc_casino/arcade.lua",
	"client/ipl/dlc_casino/arcade_basement.lua",

	"client/ipl/dlc_cayoperico/base.lua",
	"client/ipl/dlc_cayoperico/nightclub.lua",
	"client/ipl/dlc_cayoperico/submarine.lua",

	"client/ipl/dlc_tuner/garage.lua",
	"client/ipl/dlc_tuner/meetup.lua",
	"client/ipl/dlc_tuner/methlab.lua",

	"client/ipl/dlc_security/studio.lua",
	"client/ipl/dlc_security/billboards.lua",
	"client/ipl/dlc_security/musicrooftop.lua",
	"client/ipl/dlc_security/garage.lua",
	"client/ipl/dlc_security/office1.lua",
	"client/ipl/dlc_security/office2.lua",
	"client/ipl/dlc_security/office3.lua",
	"client/ipl/dlc_security/office4.lua",

	"client/ipl/gta_mpsum2/simeonfix.lua",
	"client/ipl/gta_mpsum2/vehicle_warehouse.lua",
	"client/ipl/gta_mpsum2/warehouse.lua",

	"client/ipl/dlc_drugwars/base.lua",
	"client/ipl/dlc_drugwars/freakshop.lua",
	"client/ipl/dlc_drugwars/garage.lua",
	"client/ipl/dlc_drugwars/lab.lua",
	"client/ipl/dlc_drugwars/traincrash.lua",

	"client/ipl/dlc_mercenaries/club.lua",
	"client/ipl/dlc_mercenaries/lab.lua",
	"client/ipl/dlc_mercenaries/fixes.lua",

	"client/ipl/dlc_chopshop/base.lua",
	"client/ipl/dlc_chopshop/cargoship.lua",
	"client/ipl/dlc_chopshop/cartel_garage.lua",
	"client/ipl/dlc_chopshop/lifeguard.lua",
	"client/ipl/dlc_chopshop/salvage.lua",

	"client/ipl/dlc_bounties/base.lua",
	"client/ipl/dlc_bounties/carrier.lua",
	"client/ipl/dlc_bounties/office.lua",

	"client/ipl/dlc_agents/base.lua",
	"client/ipl/dlc_agents/factory.lua",
	"client/ipl/dlc_agents/office.lua",
	"client/ipl/dlc_agents/airstrip.lua",
	"client/ipl/dlc_agents/hangar_door.lua",

	"client/ipl/dlc_money/base.lua",
	"client/ipl/dlc_money/carwash.lua",
	"client/ipl/dlc_money/office.lua",
	"client/ipl/dlc_money/construction.lua",

	"client/ipl/arp-properties.lua",
})

server_scripts({
	"@st_lib/server/sv_log.lua",
	"@st_lib/server/sv_net.lua",
	"@st_lib/server/sv_user.lua",
	"@st_lib/server/sv_clan.lua",
	"@st_lib/server/sv_store.lua",
	"@st_lib/server/sv_cash.lua",
	"game/dist/server.js",
	"sv_*.lua",
	"server/**/*.lua",
})

ui_page("game/nui/dist/index.html")

files({
	"game/nui/dist/index.html",
	"game/nui/dist/**/*",
})

provide("screenshot-basic")

exports({
	"SetupClient",
})

server_exports({
	"SetupServer",
})
