AddEventHandler("onResourceStart", function(resource)
	if resource == GetCurrentResourceName() then
		Wait(1000)
		CreateThread(function()
			local ver
			repeat
				Wait(0)
			until exports["strata"]:GetSbfwVersion() ~= nil

			if exports["strata"]:GetSbfwVersion() == "UNKNOWN" then
				ver = "^1v1"
			else
				ver = "^2v1"
			end

			print([[
^2=================================================================================================^8
^8  Strata Framework ]] .. ver .. [[^8  —  By ^6Sanyo ^7& ^6DanDiablos^8
^2=================================================================================================^7]])

			TriggerEvent("Core:Shared:Watermark")
		end)
	end
end)
