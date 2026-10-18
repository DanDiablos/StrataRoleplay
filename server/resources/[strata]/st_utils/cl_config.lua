Config = {
	Token = {
		Log = true,
		Delay = 250,
	},
	Components = {
		GodMode = { Enabled = true },
		NoClip = { Enabled = true },
		Invis = { Enabled = true },
		Hp = { Enabled = true },
		Armor = { Enabled = true },
		Spectator = { Enabled = true },
		Weapon = { Enabled = true },
	},
	BlacklistedWeaponHashes = {
		GetHashKey("WEAPON_MINIGUN"),
		GetHashKey("WEAPON_RPG"),
		GetHashKey("WEAPON_HOMINGLAUNCHER"),
		GetHashKey("WEAPON_GRENADELAUNCHER"),
		GetHashKey("WEAPON_COMPACTLAUNCHER"),
		GetHashKey("WEAPON_RAILGUN"),
		GetHashKey("WEAPON_EMPLAUNCHER"),
		GetHashKey("WEAPON_STICKYBOMB"),
		GetHashKey("WEAPON_PROXMINE"),
		GetHashKey("WEAPON_PIPEBOMB"),
	},
	PedFreeZones = {
		{
			coords = vector3(-551.72, -202.28, 55.44), -- vangelico
			radius = 42,
		},
		{
			coords = vector3(-558.525, 286.516, 82.176), -- tequlala
			radius = 25,
		},
		{
			coords = vector3(1134.168, -468.023, 66.486), -- digital den
			radius = 20,
		},
		{
			coords = vector3(-1185.219, -1151.132, 7.669), -- noodle exchange
			radius = 10,
		},
		{
			coords = vector3(109.664, -1289.111, 29.243), -- vanilla unicorn
			radius = 25,
		},
	},
	AspectRatio = {
		Enabled = true,
		Options = {
			KickTimer = 30,
		},
	},
	Messages = {
		ProhibitedVariables = "Detected prohibited variable: {VARIABLE}",
	},
}
