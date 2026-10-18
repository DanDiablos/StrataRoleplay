FLAGGED_PLATES = {}

AddEventHandler('onResourceStart', function(resource)
	if resource == GetCurrentResourceName() then
		Wait(1000)
		RegisterChatCommands()
	end
end)

CreateThread(function()
	GlobalState.RadarFlaggedPlates = {}
end)

function RegisterChatCommands()
	exports["st_chat"]:RegisterCommand(
		"flagplate",
		function(src, args, raw)
			local plate = args[1]
			local reason = args[2]

			if plate and reason then
				exports['st_police']:AddFlaggedPlate(plate:upper(), reason)

				exports["st_chat"]:SendSystemSingle(src, "Plate Flagged: " .. plate)
			end
		end,
		{
			help = "Flag a Plate",
			params = {
				{ name = "Plate",  help = "The Plate to Flag" },
				{ name = "Reason", help = "Reason Why the Plate is Flagged" },
			},
		},
		2,
		{
			{ Id = "police", Level = 1 },
		}
	)

	exports["st_chat"]:RegisterCommand(
		"unflagplate",
		function(src, args, raw)
			local plate = args[1]

			if plate then
				exports['st_police']:RemoveFlaggedPlate(plate)
				exports["st_chat"]:SendSystemSingle(src, "Removed Flagged Plate: " .. plate)
			end
		end,
		{
			help = "Unflag a Plate",
			params = {
				{ name = "Plate", help = "The Plate to Unflag" },
			},
		},
		1,
		{
			{ Id = "police", Level = 1 },
		}
	)

	exports["st_chat"]:RegisterCommand(
		"radar",
		function(src)
			TriggerClientEvent("Radar:Client:ToggleRadarDisabled", src)
		end,
		{
			help = "Toggle Radar",
		},
		0,
		{
			{ Id = "police", Level = 1 },
		}
	)
end

exports("AddFlaggedPlate", function(plate, reason)
	if not reason then
		reason = "No Reason Specified"
	end

	Strata.Log.Trace("Radar", string.format("New Flagged Plate: %s, Reason: %s", plate, reason))
	FLAGGED_PLATES[plate] = reason

	GlobalState.RadarFlaggedPlates = FLAGGED_PLATES
end)

exports("RemoveFlaggedPlate", function(plate)
	Strata.Log.Trace("Radar", string.format("Plate Unflagged: %s", plate))
	FLAGGED_PLATES[plate] = nil

	GlobalState.RadarFlaggedPlates = FLAGGED_PLATES
end)

exports("ClearFlaggedPlates", function()
	Strata.Log.Trace("Radar", "All Plates Unflagged")
	FLAGGED_PLATES = {}

	GlobalState.RadarFlaggedPlates = FLAGGED_PLATES
end)

exports("GetFlaggedPlates", function()
	return FLAGGED_PLATES
end)

exports("CheckPlate", function(plate)
	return FLAGGED_PLATES[plate]
end)

RegisterNetEvent("Radar:Server:StolenVehicle", function(plate)
	if type(plate) == "string" then
		exports['st_police']:AddFlaggedPlate(plate, "Vehicle Reported Stolen")
	end
end)
