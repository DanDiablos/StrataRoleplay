AddEventHandler("Phone:Server:RegisterCallbacks", function()
	exports["strata"]:RegisterServerCallback("Phone:PingEm:SendPing", function(source, data, cb)
		local char = Strata.User.Find(source)
		local tChar = Strata.User.BySID(tonumber(data.target))

		local coords = GetEntityCoords(GetPlayerPed(source))

		local tpCoords = Player(source)?.state?.tpLocation
		if tpCoords then
			coords = vector3(tpCoords.x, tpCoords.y, tpCoords.z)
		end

		if tChar ~= nil and tChar:GetData("Source") ~= source then
			if data.type then -- Anonymous
				exports['st_phone']:NotificationAdd(
					tChar:GetData("Source"),
					"Received A Ping",
					"You Received An Anonymous Ping",
					os.time(),
					15000,
					"pingem",
					{
						accept = "Phone:Client:PingEm:AcceptPing",
						cancel = "Phone:Client:PingEm:RejectPing",
					},
					{
						location = coords,
						source = source,
					}
				)
				cb(true)
			else
				exports['st_phone']:NotificationAdd(
					tChar:GetData("Source"),
					"Received A Ping",
					string.format("You Received A Ping From %s %s", char:GetData("First"), char:GetData("Last")),
					os.time(),
					15000,
					"pingem",
					{
						accept = "Phone:Client:PingEm:AcceptPing",
						cancel = "Phone:Client:PingEm:RejectPing",
					},
					{
						location = coords,
						source = source,
					}
				)
				cb(true)
			end
		else
			cb(false)
		end
	end)

	exports["strata"]:RegisterServerCallback("Phone:PingEm:GetFeedback", function(source, data, cb)
		if data.result then
			exports['st_phone']:NotificationAdd(data.source, "Your Ping", "Your Ping Was Accepted", os.time(),
				6000, "pingem")
		else
			exports['st_phone']:NotificationAdd(data.source, "Your Ping", "Your Ping Was Rejected", os.time(),
				6000, "pingem")
		end
	end)
end)
