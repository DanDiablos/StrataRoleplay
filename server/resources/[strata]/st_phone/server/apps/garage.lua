AddEventHandler("Phone:Server:RegisterMiddleware", function()
	exports['strata']:MiddlewareAdd("Phone:Spawning", function(source, char)
		return {
			{
				type = "garages",
				data = exports['st_veh']:GaragesGetAll(),
			},
		}
	end)
end)

AddEventHandler("Phone:Server:RegisterCallbacks", function()
	exports["strata"]:RegisterServerCallback("Phone:Garage:GetCars", function(source, data, cb)
		local char = Strata.User.Find(source)
		if char == nil then return cb({}) end
		local garages = exports['st_veh']:GaragesGetAll()
		exports['st_veh']:OwnedGetAll(nil, 0, char:GetData("SID"), function(vehicles)
			if not vehicles then return cb({}) end
			local result = {}
			for _, v in ipairs(vehicles) do
				local garageName = "Unknown"
				if v.Storage and v.Storage.Id and garages[v.Storage.Id] then
					garageName = garages[v.Storage.Id].label
				elseif v.Spawned then
					garageName = "Out"
				end
				table.insert(result, {
					vin = v.VIN,
					model = v.Model or v.Make or "Unknown",
					plate = v.RegisteredPlate or v.FakePlate or "N/A",
					garage = garageName,
					state = v.Spawned and "out" or "stored",
				})
			end
			cb(result)
		end)
	end)

	exports["strata"]:RegisterServerCallback("Phone:Garage:TrackVehicle", function(source, data, cb)
		cb(exports['st_veh']:OwnedTrack(data.vin))
	end)
end)
