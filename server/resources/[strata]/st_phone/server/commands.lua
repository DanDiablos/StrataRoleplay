function RegisterChatCommands()
	exports["st_chat"]:RegisterCommand("resetphonepos", function(source, args, rawCommand)
		local char = Strata.User.Find(source)
		if char ~= nil then
			char:SetData("PhonePosition", {
				x = 25,
				y = 25,
			})
			TriggerClientEvent("Phone:Client:RestorePosition", source, char:GetData("PhonePosition"))
			exports["st_chat"]:SendSystemSingle(source, "Phone Position Reset")
		else
			exports["st_chat"]:SendSystemSingle(source, "Unable To Reset Phone Position")
		end
	end, {
		help = "Resets your phones position",
	}, 0)

	exports["st_chat"]:RegisterAdminCommand("clearalias", function(source, args, rawCommand)
		if tonumber(args[1]) then
			local char = Strata.User.BySID(tonumber(args[1]))

			if char ~= nil then
				local aliases = char:GetData("Alias")
				aliases[args[2]] = nil
				char:SetData("Alias", aliases)
				exports["st_chat"]:SendSystemSingle(
					source,
					string.format(
						"Alias Cleared For %s %s (%s) For %s",
						char:GetData("First"),
						char:GetData("Last"),
						char:GetData("SID"),
						args[2]
					)
				)
			else
				exports["st_chat"]:SendSystemSingle(source, "Invalid Target")
			end
		else
			exports["st_chat"]:SendSystemSingle(source, "Invalid Target")
		end
	end, {
		help = "[Admin] Clear Player App Alias",
		params = {
			{
				name = "SID",
				help = "Target State ID",
			},
			{
				name = "App ID",
				help = "App ID to reset the players alias for",
			},
		},
	}, 2)

	exports["st_chat"]:RegisterAdminCommand("clearprofile", function(source, args, rawCommand)
		if tonumber(args[1]) then
			local char = Strata.User.BySID(tonumber(args[1]))
			if char ~= nil then
				local profiles = char:GetData("Profiles") or {}

				if profiles[args[2]] ~= nil then
					local queries = {}
					table.insert(queries, {
						query = "INSERT INTO app_profile_history (sid, app, name, picture, meta) VALUES(?, ?, ?, ?, ?)",
						values = {
							char:GetData("SID"),
							args[2],
							profiles[args[2]].name,
							profiles[args[2]].picture,
							json.encode(profiles[args[2]].meta or {}),
						},
					})
					table.insert(queries, {
						query = "DELETE FROM character_app_profiles WHERE sid = ? AND app = ?",
						values = {
							char:GetData("SID"),
							args[2],
						},
					})
					MySQL.transaction(queries)

					profiles[args[2]] = nil
					char:SetData("Profiles", profiles)
					exports["st_chat"]:SendSystemSingle(
						source,
						string.format(
							"Profile Cleared For %s %s (%s) For %s",
							char:GetData("First"),
							char:GetData("Last"),
							char:GetData("SID"),
							args[2]
						)
					)
				else
				end
			else
				exports["st_chat"]:SendSystemSingle(source, "Invalid Target")
			end
		else
			exports["st_chat"]:SendSystemSingle(source, "Invalid Target")
		end
	end, {
		help = "[Admin] Clear Player App Alias",
		params = {
			{
				name = "SID",
				help = "Target State ID",
			},
			{
				name = "App ID",
				help = "App ID to reset the players alias for",
			},
		},
	}, 2)

	exports["st_chat"]:RegisterStaffCommand("ctwitter", function(source, args, rawCommand)
		ClearAllTweets(args[1])
		exports["st_chat"]:SendSystemSingle(source, "All Tweets Removed")
	end, {
		help = "[Admin] Clear All Tweets",
		params = {
			{
				name = "SID",
				help = "(Optional) Target State ID",
			},
		},
	}, -1)

	exports["st_chat"]:RegisterStaffCommand("twitteraccount", function(source, args, rawCommand)
		local twitterName = args[1]

		local sid = MySQL.scalar.await("SELECT sid FROM character_app_profiles WHERE name = ? AND app = ?", {
			twitterName,
			"twitter",
		})

		local char = Strata.User.BySID(sid)
		if char ~= nil then
			exports["st_chat"]:SendSystemSingle(
				source,
				string.format(
					"Twitter Account Found With Name: %s. %s %s (SID: %s) [User: %s]",
					twitterName,
					char:GetData("First"),
					char:GetData("Last"),
					sid,
					char:GetData("User")
				)
			)
		else
			exports["st_chat"]:SendSystemSingle(source, "No Twitter Account Found")
		end
	end, {
		help = "[Admin] Get Twitter Account Owner",
		params = {
			{
				name = "Account Name",
				help = "Account Name of User You Want to Find",
			},
		},
	}, 1)

	exports["st_chat"]:RegisterAdminCommand("govtweet", function(source, args, rawCommand)
		local accountName, accountAvatar, content, image = args[1], args[2], args[3], args[4]

		if accountName and accountAvatar and content then
			if image then
				image = {
					using = true,
					link = image,
				}
			else
				image = {
					using = false,
				}
			end

			exports['st_phone']:TwitterPost(-1, -1, {
				name = accountName,
				picture = accountAvatar,
			}, content, image, false, "government")
			exports["st_chat"]:SendSystemSingle(source, "Tweet Sent")
		end
	end, {
		help = "[Admin] Send GOVERNMENT ACCOUNT Tweet",
		params = {
			{
				name = "Account Name",
				help = "",
			},
			{
				name = "Account Avatar",
				help = "",
			},
			{
				name = "Tweet Content",
				help = "",
			},
			{
				name = "Tweet Image",
				help = "",
			},
		},
	}, -1)

	exports["st_chat"]:RegisterAdminCommand("reloadtracks", function(source, args, rawCommand)
		ReloadRaceTracks()
		exports["st_chat"]:SendSystemSingle(source, "Reloaded Vroom Vrooms")
	end, {
		help = "[Admin] Reload Race Tracks",
	}, 0)

	exports["st_chat"]:RegisterAdminCommand("reloadpdtracks", function(source, args, rawCommand)
		ReloadRaceTracksPD()
		exports["st_chat"]:SendSystemSingle(source, "Reloaded PD Vroom Vrooms")
	end, {
		help = "[Admin] Reload PD Race Tracks",
	}, 0)

	exports["st_chat"]:RegisterAdminCommand("raceinvite", function(source, args, rawCommand)
		local char = Strata.User.Find(source)

		if char then
			local id, count = args[1], tonumber(args[2])

			if IsRedlineRace(id) then
				exports.st_inventory:AddItem(char:GetData("SID"), "event_invite", count, {
					Event = id,
				}, 1)
			else
				exports['st_ui']:Notification(source, "error", "Invalid Race Event")
			end
		end
	end, {
		help = "[Admin] Create Race Invite Items",
		params = {
			{
				name = "Event ID",
				help = "ID of the race that using the invite will add you to",
			},
			{
				name = "Quantity",
				help = "How many invites to create",
			},
		},
	}, 2)

	-- ── Test commands ──────────────────────────────────────

	exports["st_chat"]:RegisterAdminCommand("testcall", function(source, args, rawCommand)
		local number = args[1] or "555-123-4567"
		-- Register a fake server-side call so Accept/End buttons work through the real flow
		exports['st_phone']:TestCallRegister(source, number)
		TriggerClientEvent("Phone:Client:Phone:RecieveCall", source, 999, number, false)
		exports["st_chat"]:SendSystemSingle(source, "Test incoming call from " .. number)
	end, {
		help = "[Test] Simulate an incoming phone call",
		params = {
			{
				name = "Number",
				help = "Phone number to show (default: 555-123-4567)",
			},
		},
	}, -1)

	exports["st_chat"]:RegisterAdminCommand("testendcall", function(source, args, rawCommand)
		TriggerClientEvent("Phone:Client:Phone:EndCall", source)
		exports["st_chat"]:SendSystemSingle(source, "Test call ended")
	end, {
		help = "[Test] End the current test call",
	}, 0)

	exports["st_chat"]:RegisterAdminCommand("testemail", function(source, args, rawCommand)
		local sender = args[1] or "test@stratarp.gg"
		local subject = args[2] or "Test Email Subject"
		local body = args[3] or "This is a test email body to check how it looks in the phone UI."
		exports['st_phone']:EmailSend(source, sender, os.time(), subject, body)
		exports["st_chat"]:SendSystemSingle(source, "Test email sent from " .. sender)
	end, {
		help = "[Test] Send yourself a test email",
		params = {
			{
				name = "Sender",
				help = "Sender email (default: test@stratarp.gg)",
			},
			{
				name = "Subject",
				help = "Email subject (default: Test Email Subject)",
			},
			{
				name = "Body",
				help = "Email body (default: test body text)",
			},
		},
	}, -1)

	exports["st_chat"]:RegisterAdminCommand("testnotif", function(source, args, rawCommand)
		local app = args[1] or "messages"
		local title = args[2] or "Test Notification"
		local desc = args[3] or "This is a test notification to check how it looks."

		if app == "messages" then
			---@type CharacterStore?
			local char = Strata.User.Find(source)
			if char then
				local myPhone = char:GetData("Phone")
				local testNumber = "555-TEST"
				local now = os.time()

				MySQL.query(
					"INSERT INTO character_messages (owner, number, method, unread, time, message) VALUES (?, ?, ?, ?, FROM_UNIXTIME(?), ?)",
					{ myPhone, testNumber, 0, true, now, desc }
				)

				TriggerClientEvent("Phone:Client:Messages:Notify", source, {
					id = now,
					owner = myPhone,
					number = testNumber,
					method = 0,
					unread = true,
					time = now,
					message = desc,
				}, false)

				exports["st_chat"]:SendSystemSingle(source, "Test message received from " .. testNumber)
			else
				exports["st_chat"]:SendSystemSingle(source, "No character loaded")
			end
			return
		end

		exports['st_phone']:NotificationAdd(source, title, desc, os.time(), 6000, app, nil, nil)
		exports["st_chat"]:SendSystemSingle(source, "Test notification sent for app: " .. app)
	end, {
		help = "[Test] Send yourself a test phone notification",
		params = {
			{
				name = "App",
				help = "App name (default: messages) — e.g. messages, twitter, email, bank",
			},
			{
				name = "Title",
				help = "Notification title (default: Test Notification)",
			},
			{
				name = "Description",
				help = "Notification body (default: test text)",
			},
		},
	}, -1)
end
