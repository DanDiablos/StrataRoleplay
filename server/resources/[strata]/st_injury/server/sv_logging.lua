RegisterNetEvent('Damage:Server:LogDeath', function(killer, reason, wasExecuted)
	local src  = source
	local char = Strata.User.Find(src)
	if char == nil then return end

	local victim = string.format("%s %s (%s)", char:GetData("First"), char:GetData("Last"), char:GetData("SID"))

	if killer then
		local killerChar = Strata.User.Find(killer)
		local killerName = killerChar
			and string.format('%s %s (%s)', killerChar:GetData('First'), killerChar:GetData('Last'), killerChar:GetData('SID'))
			or tostring(killer)

		local msg = wasExecuted
			and string.format("%s Executed By %s. Method: %s", victim, killerName, reason)
			or  string.format("%s Killed By %s. Method: %s",   victim, killerName, reason)

		Strata.Log.Info("Damage", msg, {
			console = true, file = true, database = true,
			discord = { embed = true, type = 'info', webhook = GetConvar('discord_kill_webhook', '') },
		})
	else
		local msg = wasExecuted
			and string.format("%s Executed Themself. Method: %s", victim, reason)
			or  string.format("%s Killed Themself. Method: %s",   victim, reason)

		Strata.Log.Info("Damage", msg, {
			console = true, file = true, database = true,
			discord = { embed = true, type = 'info', webhook = GetConvar('discord_kill_webhook', '') },
		})
	end
end)
