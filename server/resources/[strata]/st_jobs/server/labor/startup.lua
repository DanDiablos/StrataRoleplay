--[[
	Rep Ideas?

	Farming: Sell food mats in bulk?
	Salvage: Gain access to chop-lists (Will be a seperate thing from boosting, chopping will be NPC-driven stuff that will give raw materials and rarely car parts opposed to boosting)
	Garbage: Gain access to pawn shop stuff allowing people to sell off chains/watches/etc
	Mining: Gain access to selling gems? And/Or crafting bench to smelt?
	Hunting: Gain access to selling hides?
	Fishing: ????
]]

AddEventHandler("Labor:Server:Startup", function()
	exports['st_jobs']:RegisterJob(
		"HouseRobbery",
		"House Robbery",
		4,
		0,
		75,
		{
			state = "SCRIPT_HOUSE_ROBBERY",
		},
		{
			{ label = "Rank 1", value = 1000 },
			{ label = "Rank 2", value = 3000 },
			{ label = "Rank 3", value = 6000 },
			{ label = "Rank 4", value = 16000 },
			{ label = "Rank 5", value = 30000 },
		},
		false,
		{
			Duration = 60 * 10,
			Message = "If you wont do the job, I'll give it to someone else",
		}
	)
	exports['st_jobs']:RegisterJob(
		"OxyRun",
		"Oxy",
		4,
		0,
		75,
		{
			state = "SCRIPT_OXY_RUN",
		},
		{
			{ label = "Rank 1", value = 1000 },
			{ label = "Rank 2", value = 2000 },
			{ label = "Rank 3", value = 4000 },
			{ label = "Rank 4", value = 8000 },
			{ label = "Rank 5", value = 12000 },
		},
		false,
		{
			Duration = 60 * 20,
			Message = "You took too damn long, maybe next time",
		}
	)
	exports['st_jobs']:RegisterJob(
		"WeedRun",
		"Weed Distribution",
		0,
		0,
		75,
		{
			state = "SCRIPT_WEED_RUN",
		},
		{
			{ label = "Rank 1",  value = 1000 },
			{ label = "Rank 2",  value = 2500 },
			{ label = "Rank 3",  value = 5000 },
			{ label = "Rank 4",  value = 10000 },
			{ label = "Rank 5",  value = 25000 },
			{ label = "Rank 6",  value = 50000 },
			{ label = "Rank 7",  value = 100000 },
			{ label = "Rank 8",  value = 250000 },
			{ label = "Rank 9",  value = 500000 },
			{ label = "Rank 10", value = 1000000 },
		},
		false,
		{
			KeepRep = true,
			Duration = 60 * 20,
			Message = "Let Me Know If You Want To Do More Runs",
		}
	)
	exports['st_jobs']:RegisterJob(
		"CornerDealing",
		"Corner Dealing",
		4,
		0,
		75,
		{
			state = "SCRIPT_CORNER_DEALING",
		},
		{
			{ label = "Rank 1",  value = 1000 },
			{ label = "Rank 2",  value = 2500 },
			{ label = "Rank 3",  value = 5000 },
			{ label = "Rank 4",  value = 10000 },
			{ label = "Rank 5",  value = 25000 },
			{ label = "Rank 6",  value = 50000 },
			{ label = "Rank 7",  value = 100000 },
			{ label = "Rank 8",  value = 250000 },
			{ label = "Rank 9",  value = 500000 },
			{ label = "Rank 10", value = 1000000 },
		},
		false,
		{
			KeepRep = true,
			Duration = 60 * 20,
			Message = "Let me know if you have anymore product you want to sell",
		}
	)

	exports['st_jobs']:RegisterJob("Prison", "U SHOULDNT SEE THIS LOL", 0, 0, 0, {
		state = "SCRIPT_PRISON_JOB",
	}, {}, true)

	exports['st_jobs']:RegisterJob("Hunting", "Hunting", 0, 1200, 80, false, {
		{ label = "Rank 1", value = 1500 },
		{ label = "Rank 2", value = 3000 },
		{ label = "Rank 3", value = 6000 },
		{ label = "Rank 4", value = 9000 },
		{ label = "Rank 5", value = 12000 },
		{ label = "Rank 6", value = 22000 },
		{ label = "Rank 7", value = 35000 },
		{ label = "Rank 8", value = 40000 },
	})
	exports['st_jobs']:RegisterJob("Mining", "Mining", 0, 1000, 75, false, {
		{ label = "Rank 1", value = 1500 },
		{ label = "Rank 2", value = 3000 },
		{ label = "Rank 3", value = 7000 },
		{ label = "Rank 4", value = 10000 },
		{ label = "Rank 5", value = 12000 },
	})
	exports['st_jobs']:RegisterJob("Farming", "Farming", 0, 1200, 75)
	exports['st_jobs']:RegisterJob("Salvaging", "Salvaging", 0, 1000, 75, false, {
		{ label = "Rank 1",   value = 1500 },
		{ label = "Rank 2",   value = 3000 },
		{ label = "Rank 3",   value = 7000 },
		{ label = "Rank 4",   value = 10000 },
		{ label = "Rank 5",   value = 12000 },
		{ label = "Rank 6",   value = 15000 },
		{ label = "Rank 7",   value = 18000 },
		{ label = "Rank 8",   value = 21000 },
		{ label = "Rank 9",   value = 24000 },
		{ label = "Pls Stop", value = 30000 },
	})
	exports['st_jobs']:RegisterJob("Garbage", "Garbage", 0, 1500, 75, false, {
		{ label = "Rank 1", value = 1500 },
		{ label = "Rank 2", value = 3000 },
		{ label = "Rank 3", value = 7000 },
		{ label = "Rank 4", value = 10000 },
		{ label = "Rank 5", value = 12000 },
	})
	exports['st_jobs']:RegisterJob("Fishing", "Fishing", 0, 1000, 75)

	exports['st_jobs']:RegisterJob("Coke", "THIS SHOULD NOT BE SEEN", 1, 0, 75, {
		state = "SCRIPT_COKE_RUN",
	}, {
		{ label = "Rank 1", value = 1500 },
		{ label = "Rank 2", value = 3000 },
		{ label = "Rank 3", value = 7000 },
		{ label = "Rank 4", value = 10000 },
		{ label = "Rank 5", value = 12000 },
	}, true)

	--exports['st_jobs']:RegisterJob("Trucking", "Trucking", 0, 1005, 100)
end)
