---@class WeedFertilizerConfig
---@field time number Minutes of effect
---@field value number Multiplier added to ground stat

---@class WeedGroundType
---@field nitrogen number   0-1 base nitrogen multiplier
---@field phosphorus number 0-1 base phosphorus multiplier
---@field potassium number  0-1 base potassium multiplier
---@field water number      0-1 base water retention
---@field label string

---@class WeedPlantTargetOption
---@field icon string
---@field text string
---@field event string
---@field groups? table<number, string>
---@field reqDuty? boolean
---@field canInteract fun(entity: number): number|false

---@class WeedPlantStage
---@field model number
---@field offset number
---@field harvestable boolean
---@field targeting WeedPlantTargetOption[]

---@class WeedDealerLocation
---@field coords vector3
---@field heading number

WeedConfig = {
	DebugSmokeProgress = false,
	Lifetime         = (60 * 60 * 24 * 3),
	FemSeedChance    = 25,
	PackagePrice     = 7500,
	BrickPrice       = 4000,
	---@type table<string, WeedFertilizerConfig>
	Fertilizer = {
		nitrogen   = { time = 40, value = 2.0  },
		phosphorus = { time = 40, value = 0.75 },
		potassium  = { time = 60, value = 0.4  },
	},
}

---@type table<string, WeedGroundType>
GroundTypes = {
	grass  = { nitrogen = 0.6,  phosphorus = 0.6,  potassium = 0.6,  water = 0.5, label = "Grass"         },
	normal = { nitrogen = 0.3,  phosphorus = 0.3,  potassium = 0.3,  water = 0.4, label = "Normal"        },
	grocks = { nitrogen = 0.6,  phosphorus = 0.6,  potassium = 0.6,  water = 0.5, label = "Grassy Rocks"  },
	mgrass = { nitrogen = 0.6,  phosphorus = 0.6,  potassium = 0.6,  water = 0.4, label = "Mountain Grass" },
	wet    = { nitrogen = 0.9,  phosphorus = 0.9,  potassium = 0.9,  water = 0.9, label = "Wetlands"      },
	farm   = { nitrogen = 0.9,  phosphorus = 0.9,  potassium = 0.9,  water = 0.5, label = "Farmland"      },
	sand   = { nitrogen = 0.15, phosphorus = 0.15, potassium = 0.15, water = 0.3, label = "Sand"          },
	unk1   = { nitrogen = 0.6,  phosphorus = 0.6,  potassium = 0.6,  water = 0.6, label = "Unknown"       },
	unk2   = { nitrogen = 0.3,  phosphorus = 0.3,  potassium = 0.3,  water = 0.5, label = "Unknown"       },
	unk3   = { nitrogen = 0.3,  phosphorus = 0.3,  potassium = 0.3,  water = 0.5, label = "Unknown"       },
}

---@type table<number, { groundType: string }>
Materials = {
	[581794674]    = { groundType = "normal" },
	[-2041329971]  = { groundType = "normal" },
	[-309121453]   = { groundType = "normal" },
	[-913351839]   = { groundType = "normal" },
	[-1885547121]  = { groundType = "normal" },
	[-1915425863]  = { groundType = "normal" },
	[-1833527165]  = { groundType = "normal" },
	[2128369009]   = { groundType = "normal" },
	[-124769592]   = { groundType = "normal" },
	[-840216541]   = { groundType = "normal" },
	[-461750719]   = { groundType = "grass"  },
	[930824497]    = { groundType = "grass"  },
	[1333033863]   = { groundType = "grocks" },
	[223086562]    = { groundType = "wet"    },
	[1109728704]   = { groundType = "wet"    },
	[-1286696947]  = { groundType = "mgrass" },
	[-1942898710]  = { groundType = "grocks" },
	[509508168]    = { groundType = "sand"   },
	[-2073312001]  = { groundType = "unk1"   },
	[627123000]    = { groundType = "unk1"   },
	[-1595148316]  = { groundType = "unk2"   },
	[435688960]    = { groundType = "unk3"   },
}

---@type WeedPlantStage[]
Plants = {
	{
		model      = GetHashKey("bzzz_plants_weed_green_small"),
		offset     = 0.0,
		harvestable = false,
		targeting  = {
			{
				icon        = "fas fa-magnifying-glass",
				text        = "Check",
				event       = "Weed:Client:Check",
				canInteract = function(entity) return GetWeedPlant(entity) end,
			},
			{
				icon        = "fas fa-hand-scissors",
				text        = "Destroy Plant",
				event       = "Weed:Client:PDDestroy",
				groups      = { "police" },
				reqDuty     = true,
				canInteract = function(entity) return GetWeedPlant(entity) end,
			},
		},
	},
	{
		model      = GetHashKey("bzzz_plants_weed_green_medium"),
		offset     = 0.0,
		harvestable = false,
		targeting  = {
			{
				icon        = "fas fa-magnifying-glass",
				text        = "Check",
				event       = "Weed:Client:Check",
				canInteract = function(entity) return GetWeedPlant(entity) end,
			},
			{
				icon        = "fas fa-hand-scissors",
				text        = "Destroy Plant",
				event       = "Weed:Client:PDDestroy",
				groups      = { "police" },
				reqDuty     = true,
				canInteract = function(entity) return GetWeedPlant(entity) end,
			},
		},
	},
	{
		model      = GetHashKey("bzzz_plants_weed_green_big"),
		offset     = 0.0,
		harvestable = false,
		targeting  = {
			{
				icon        = "fas fa-magnifying-glass",
				text        = "Check",
				event       = "Weed:Client:Check",
				canInteract = function(entity) return GetWeedPlant(entity) end,
			},
			{
				icon        = "fas fa-hand-scissors",
				text        = "Destroy Plant",
				event       = "Weed:Client:PDDestroy",
				groups      = { "police" },
				reqDuty     = true,
				canInteract = function(entity) return GetWeedPlant(entity) end,
			},
		},
	},
	{
		model      = GetHashKey("bzzz_plants_weed_green_bud"),
		offset     = 0.0,
		harvestable = false,
		targeting  = {
			{
				icon        = "fas fa-magnifying-glass",
				text        = "Check",
				event       = "Weed:Client:Check",
				canInteract = function(entity) return GetWeedPlant(entity.entity) end,
			},
			{
				icon        = "fas fa-sack",
				text        = "Harvest",
				event       = "Weed:Client:Harvest",
				canInteract = function(entity) return GetWeedPlant(entity) end,
			},
			{
				icon        = "fas fa-hand-scissors",
				text        = "Destroy Plant",
				event       = "Weed:Client:PDDestroy",
				groups      = { "police" },
				reqDuty     = true,
				canInteract = function(entity) return GetWeedPlant(entity) end,
			},
		},
	},
	{
		model      = GetHashKey("bzzz_plants_weed_green_bud_big"),
		offset     = 0.0,
		harvestable = true,
		targeting  = {
			{
				icon        = "fas fa-magnifying-glass",
				text        = "Check",
				event       = "Weed:Client:Check",
				canInteract = function(entity) return GetWeedPlant(entity) end,
			},
			{
				icon        = "fas fa-sack",
				text        = "Harvest",
				event       = "Weed:Client:Harvest",
				canInteract = function(entity) return GetWeedPlant(entity) end,
			},
			{
				icon        = "fas fa-hand-scissors",
				text        = "Destroy Plant",
				event       = "Weed:Client:PDDestroy",
				groups      = { "police" },
				reqDuty     = true,
				canInteract = function(entity) return GetWeedPlant(entity) end,
			},
		},
	},
}

---@type table<string, WeedDealerLocation>
Locations = {
	["0"] = { coords = vector3(-1238.631, -809.376, 22.760), heading = 125.365 },
	["1"] = { coords = vector3(-1238.631, -809.376, 22.760), heading = 125.365 },
	["2"] = { coords = vector3(497.536,   -1959.389, 23.820), heading = 305.063 },
	["3"] = { coords = vector3(497.536,   -1959.389, 23.820), heading = 305.063 },
	["4"] = { coords = vector3(-3107.755, 304.206,   4.071),  heading = 11.543  },
	["5"] = { coords = vector3(-3107.755, 304.206,   4.071),  heading = 11.543  },
	["6"] = { coords = vector3(-1238.631, -809.376, 22.760), heading = 125.365 },
}
