Config = {}

Config.DoorModel = -1028247766

Config.ReceptionPed = {
	model    = "s_m_y_doorman_01",
	coords   = vector4(-461.8189, -914.9046, 27.147, 87.8875),
	scenario = "WORLD_HUMAN_CLIPBOARD",
}

Config.Building = {
	name       = "La Puerta",
	identifier = "nexus_apartment_block_1",
	entrance   = {
		coords  = vector3(-456.14, -921.61, 28.1),
		length  = 20.0,
		width   = 30.0,
		options = {
			heading  = 0,
			minZ     = 26.0,
			maxZ     = 33.0,
		},
	},
	-- Where players teleport to when exiting their apartment
	exit = { x = -461.0209, y = -924.0651, z = 28.102636, h = 88.52 },
}

-- Elevator floor positions (used for floor nav & blip)
Config.Elevators = {
	{ floor = -1, label = "Garage",  coords = vector4(-442.6301,  -950.0204, 20.690100,  89.7917) },
	{ floor = 0,  label = "Lobby",   coords = vector4(-461.0209,  -924.0651, 28.102636,  88.5221) },
	{ floor = 1,  label = "Floor 1", coords = vector4(-451.97125, -933.34240, 47.617900, 89.54)   },
	{ floor = 2,  label = "Floor 2", coords = vector4(-451.97125, -933.34240, 58.613449, 89.54)   },
	{ floor = 3,  label = "Floor 3", coords = vector4(-451.97125, -933.34240, 69.613418, 89.54)   },
	{ floor = 4,  label = "Floor 4", coords = vector4(-451.97125, -933.34240, 80.613082, 89.54)   },
	{ floor = 5,  label = "Floor 5", coords = vector4(-451.97125, -933.34240, 91.613677, 89.54)   },
	{ floor = 6,  label = "Floor 6", coords = vector4(-451.97125, -933.34240, 102.612709, 89.54)  },
	{ floor = 7,  label = "Floor 7", coords = vector4(-451.97125, -933.34240, 108.113044, 89.54)  },
}

-- ────────────────────────────────────────────────────────────────────────────
-- Room generation
-- 7 floors × 7 rooms = 49 apartments (rooms 100-106, 200-206, … 700-706)
-- aptId 1-49 maps directly to Config.Rooms[aptId]
-- ────────────────────────────────────────────────────────────────────────────

local _doorZPerFloor = {
	47.767715, 58.76775, 69.767754, 80.767776, 91.767769, 102.767807, 108.267815,
}

-- Interior Z is offset from floor 1 by these deltas (matching door Z spacing)
local _interiorZDeltaPerFloor = { 0.0, 11.0, 22.0, 33.0, 44.0, 55.0, 60.5 }

-- Per-floor door headings for each of the 7 room slots (some floors have
-- slightly off-axis doors due to MLO geometry)
local _doorHeadingsPerFloor = {
	{ 270.278503, 89.707733, 270.0,      89.999985, 270.0,      89.999985, 270.0      }, -- Floor 1
	{ 270.0,      89.999985, 270.0,      89.999985, 270.0,      89.999985, 270.0      }, -- Floor 2
	{ 270.0,      89.999985, 270.0,      89.999985, 270.0,      89.999985, 270.0      }, -- Floor 3
	{ 270.0,      89.999985, 270.0,      89.999985, 270.0,      89.999985, 270.0      }, -- Floor 4
	{ 269.629211, 89.999985, 270.0,      89.999985, 270.0,      89.999985, 270.0      }, -- Floor 5
	{ 270.0,      17.559883, 270.0,      89.999985, 270.0,      90.396767, 269.611511 }, -- Floor 6
	{ 233.216675, 89.999985, 270.0,      89.999985, 270.082825, 90.355362, 269.347839 }, -- Floor 7
}

-- Door world XY per room slot (same on every floor)
local _baseDoorXY = {
	{ x = -459.746399, y = -938.000488 }, -- slot 1 → X00 (west)
	{ x = -454.685181, y = -924.317200 }, -- slot 2 → X01 (east)
	{ x = -459.746399, y = -923.930725 }, -- slot 3 → X02 (west)
	{ x = -454.685181, y = -910.374390 }, -- slot 4 → X03 (east)
	{ x = -459.746399, y = -910.072510 }, -- slot 5 → X04 (west)
	{ x = -454.685181, y = -896.462585 }, -- slot 6 → X05 (east)
	{ x = -459.746399, y = -896.146423 }, -- slot 7 → X06 (west)
}

-- Interior interaction coords at floor-1 Z (floors 2-7 add _interiorZDeltaPerFloor)
-- Fields: entry, stash, wardrobe, shower, wakeup (bed) — all at floor-1 Z
-- Wakeup (bed) offset from slot-1 door: dx=-8.6226, dy=+5.3895, dz=+0.5023
-- West rooms mirror X outward; east rooms mirror inward (opposite sign on dx)
local _baseInterior = {
	-- slot 1 → X00 (west wing)
	{ ex=-459.8265, ey=-938.6508, ez=47.617954, sx=-464.3675, sy=-935.7334, sz=47.617954, wx=-464.2869, wy=-932.7739, wz=47.617954, shx=-461.4623, shy=-931.8782, shz=47.706924, bux=-468.369, buy=-932.611, buz=46.670 },
	-- slot 2 → X01 (east wing)
	{ ex=-454.6119, ey=-923.6325, ez=47.617946, sx=-450.0599, sy=-926.6741, sz=47.617946, wx=-449.7002, wy=-929.6013, wz=47.617954, shx=-452.9580, shy=-930.4773, shz=47.706581, bux=-446.063, buy=-918.928, buz=46.670 },
	-- slot 3 → X02 (west wing)
	{ ex=-459.8521, ey=-924.5889, ez=47.617961, sx=-464.3279, sy=-921.5688, sz=47.617954, wx=-464.6367, wy=-918.7537, wz=47.617946, shx=-461.6259, shy=-917.9022, shz=47.703983, bux=-468.369, buy=-918.542, buz=46.670 },
	-- slot 4 → X03 (east wing)
	{ ex=-454.6358, ey=-909.7139, ez=47.617950, sx=-450.0709, sy=-912.7156, sz=47.617946, wx=-449.6410, wy=-915.5927, wz=47.617946, shx=-452.8888, shy=-916.5816, shz=47.709651, bux=-446.063, buy=-904.985, buz=46.670 },
	-- slot 5 → X04 (west wing)
	{ ex=-459.8412, ey=-910.7286, ez=47.617954, sx=-464.4056, sy=-907.7710, sz=47.617954, wx=-464.8889, wy=-904.8333, wz=47.617946, shx=-461.4842, shy=-903.7851, shz=47.712352, bux=-468.369, buy=-904.683, buz=46.670 },
	-- slot 6 → X05 (east wing)
	{ ex=-454.5732, ey=-895.7935, ez=47.617946, sx=-450.0029, sy=-898.7509, sz=47.617946, wx=-449.4658, wy=-901.7604, wz=47.617950, shx=-452.9404, shy=-902.7141, shz=47.711299, bux=-446.063, buy=-891.073, buz=46.670 },
	-- slot 7 → X06 (west wing)
	{ ex=-459.9028, ey=-896.7797, ez=47.617961, sx=-464.4308, sy=-893.7620, sz=47.617950, wx=-464.9906, wy=-890.9302, wz=47.617950, shx=-461.5498, shy=-890.0003, shz=47.707637, bux=-468.369, buy=-890.757, buz=46.670 },
}

Config.Rooms = {}
for floorIdx = 1, 7 do
	local doorZ    = _doorZPerFloor[floorIdx]
	local intDelta = _interiorZDeltaPerFloor[floorIdx]
	local headings = _doorHeadingsPerFloor[floorIdx]

	for slot = 1, 7 do
		local suffix  = slot - 1                      -- 0-6
		local roomNum = (floorIdx * 100) + suffix     -- 100, 101, … 706
		local dxy     = _baseDoorXY[slot]
		local b       = _baseInterior[slot]
		local isEast  = (slot % 2 == 0)               -- even slots are east-wing rooms

		table.insert(Config.Rooms, {
			roomId        = string.format("apt_room_%d", roomNum),
			label         = string.format("Room %d", roomNum),
			floor         = floorIdx,
			door          = { x = dxy.x, y = dxy.y, z = doorZ, heading = headings[slot] },
			interior      = {
				entry    = vector3(b.ex,  b.ey,  b.ez  + intDelta),
				stash    = vector3(b.sx,  b.sy,  b.sz  + intDelta),
				wardrobe = vector3(b.wx,  b.wy,  b.wz  + intDelta),
				shower   = vector3(b.shx, b.shy, b.shz + intDelta),
				wakeup   = vector3(b.bux, b.buy, b.buz + intDelta),
			},
			entryHeading  = isEast and 90.0 or 270.0,
			-- When waking up on the bed, face into the room
			wakeupHeading = isEast and 90.0 or 270.0,
		})
	end
end
