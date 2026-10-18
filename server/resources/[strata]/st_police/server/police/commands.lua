local _911Cds = {}
local _311Cds = {}

function RegisterCommands()
	exports["st_chat"]:RegisterCommand("911", function(source, args, rawCommand)
		if #rawCommand:sub(4) > 0 then
			if
				not Player(source).state.isCuffed
				and not Player(source).state.isDead
				and ((function()
					local phoneItem = exports.st_inventory:getUtilitySlotItem(source, 8)
					return phoneItem ~= nil and phoneItem.metadata.durability > 0
				end)())
			then
				if _911Cds[source] == nil or os.time() >= _911Cds[source] then
					exports["st_chat"]:SendEmergency(source, rawCommand:sub(4))
					_911Cds[source] = os.time() + (60 * 1)
					TriggerClientEvent("Animations:Client:DoPDCallEmote", source)
				else
					exports["st_chat"]:SendSystemSingle(source, "You've Called 911 Recently")
				end
			else
				exports["st_chat"]:SendSystemSingle(source, "You Find It Difficult To Call 911")
			end
		end
	end, {
		help = "Make 911 Call",
		params = {
			{
				name = "Message",
				help = "The Message You Want To Send To 911",
			},
		},
	}, -1)

	exports["st_chat"]:RegisterCommand("911a", function(source, args, rawCommand)
		if #rawCommand:sub(5) > 0 then
			if
				not Player(source).state.isCuffed
				and not Player(source).state.isDead
				and ((function()
					local phoneItem = exports.st_inventory:getUtilitySlotItem(source, 8)
					return phoneItem ~= nil and phoneItem.metadata.durability > 0
				end)())
			then
				if _911Cds[source] == nil or os.time() >= _911Cds[source] then
					exports["st_chat"]:SendEmergencyAnonymous(source, rawCommand:sub(5))
					_911Cds[source] = os.time() + (60 * 1)
					TriggerClientEvent("Animations:Client:DoPDCallEmote", source)
				else
					exports["st_chat"]:SendSystemSingle(source, "You've Called 911 Recently")
				end
			else
				exports["st_chat"]:SendSystemSingle(source, "You Find It Difficult To Call 911")
			end
		end
	end, {
		help = "Make Anonymous 911 Call",
		params = {
			{
				name = "Message",
				help = "The Message You Want To Send To 911",
			},
		},
	}, -1)

	exports["st_chat"]:RegisterCommand(
		"911r",
		function(source, args, rawCommand)
			if tonumber(args[1]) then
				local target = Strata.User.BySID(tonumber(args[1]))
				if ((function()
						local phoneItem = exports.st_inventory:getUtilitySlotItem(source, 8)
						return phoneItem == nil or phoneItem.metadata.durability <= 0
					end)()) then
					exports["st_chat"]:SendSystemSingle(source, "You Find It Difficult Replying to 911")
					return
				end
				if target ~= nil then
					exports["st_chat"]:SendEmergencyRespond(source, target:GetData("Source"), args[2])
				else
					exports["st_chat"]:SendSystemSingle(source, "Invalid Target 2")
				end
			else
				exports["st_chat"]:SendSystemSingle(source, "Invalid Target 1")
			end
		end,
		{
			help = "Respond To 911 Caller",
			params = {
				{
					name = "Target",
					help = "State ID of the person you want to reply to",
				},
				{
					name = "Message",
					help = "[WRAP IN QUOTES] Message you want to send",
				},
			},
		},
		2,
		{
			{
				Id = "police",
			},
			{
				Id = "ems",
			},
		}
	)

	exports["st_chat"]:RegisterCommand("311", function(source, args, rawCommand)
		if #rawCommand:sub(4) > 0 then
			if
				not Player(source).state.isCuffed
				and not Player(source).state.isDead
				and ((function()
					local phoneItem = exports.st_inventory:getUtilitySlotItem(source, 8)
					return phoneItem ~= nil and phoneItem.metadata.durability > 0
				end)())
			then
				if _311Cds[source] == nil or os.time() >= _311Cds[source] then
					exports["st_chat"]:SendNonEmergency(source, rawCommand:sub(4))
					_311Cds[source] = os.time() + (60 * 1)
					TriggerClientEvent("Animations:Client:DoPDCallEmote", source)
				else
					exports["st_chat"]:SendSystemSingle(source, "You've Called 311 Recently")
				end
			else
				exports["st_chat"]:SendSystemSingle(source, "You Find It Difficult To Call 311")
			end
		end
	end, {
		help = "Make 311 Call",
		params = {
			{
				name = "Message",
				help = "The Message You Want To Send To 311",
			},
		},
	}, -1)

	exports["st_chat"]:RegisterCommand("311a", function(source, args, rawCommand)
		if #rawCommand:sub(5) > 0 then
			if
				not Player(source).state.isCuffed
				and not Player(source).state.isDead
				and ((function()
					local phoneItem = exports.st_inventory:getUtilitySlotItem(source, 8)
					return phoneItem ~= nil and phoneItem.metadata.durability > 0
				end)())
			then
				if _311Cds[source] == nil or os.time() >= _311Cds[source] then
					exports["st_chat"]:SendNonEmergencyAnonymous(source, rawCommand:sub(5))
					_311Cds[source] = os.time() + (60 * 1)
					TriggerClientEvent("Animations:Client:DoPDCallEmote", source)
				else
					exports["st_chat"]:SendSystemSingle(source, "You've Called 311 Recently")
				end
			else
				exports["st_chat"]:SendSystemSingle(source, "You Find It Difficult To Call 311")
			end
		end
	end, {
		help = "Make Anonymous 311 Call",
		params = {
			{
				name = "Message",
				help = "The Message You Want To Send To 311",
			},
		},
	}, -1)

	exports["st_chat"]:RegisterAdminCommand("testanim", function(source, args, rawCommand)
		TriggerClientEvent("Test:Animation", source, args[1], args[2])
	end, {
		help = "Test",
		params = {
			{
				name = "Dictionary",
				help = "Animation Dictionary",
			},
			{
				name = "Animation",
				help = "Animation",
			},
		},
	}, 2)

	exports["st_chat"]:RegisterAdminCommand("tems", function(source, args, rawCommand)
		TriggerClientEvent("EMS:Client:Test", source, source)
	end, {
		help = "Test",
	}, -1)

	exports["st_chat"]:RegisterCommand(
		"311r",
		function(source, args, rawCommand)
			if tonumber(args[1]) then
				local target = Strata.User.BySID(tonumber(args[1]))
				if ((function()
						local phoneItem = exports.st_inventory:getUtilitySlotItem(source, 8)
						return phoneItem == nil or phoneItem.metadata.durability <= 0
					end)()) then
					exports["st_chat"]:SendSystemSingle(source, "You Find It Difficult Replying to 311")
					return
				end
				if target ~= nil then
					exports["st_chat"]:SendNonEmergencyRespond(source, target:GetData("Source"), args[2])
				else
					exports["st_chat"]:SendSystemSingle(source, "Invalid Target 2")
				end
			else
				exports["st_chat"]:SendSystemSingle(source, "Invalid Target 1")
			end
		end,
		{
			help = "Respond To 311 Caller",
			params = {
				{
					name = "Target",
					help = "State ID of the person you want to reply to",
				},
				{
					name = "Message",
					help = "[WRAP IN QUOTES] Message you want to send",
				},
			},
		},
		2,
		{
			{
				Id = "police",
			},
			{
				Id = "ems",
			},
			{
				Id = "prison",
			},
		}
	)
end
