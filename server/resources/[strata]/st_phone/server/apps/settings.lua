AddEventHandler("Phone:Server:RegisterCallbacks", function()
	exports["strata"]:RegisterServerCallback("Phone:Settings:Update", function(source, data, cb)
		local src = source
		local char = Strata.User.Find(src)
		local settings = char:GetData("PhoneSettings")
		settings[data.type] = data.val
		char:SetData("PhoneSettings", settings)
	end)
end)
