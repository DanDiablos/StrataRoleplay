_openCd = false -- Prevents spamm open/close
_settings = {}
_loggedIn = false

local _ignoreEvents = {
	"Health",
	"HP",
	"Armor",
	"Status",
	"Damage",
	"Wardrobe",
	"Animations",
	"Ped",
}

AddEventHandler('onClientResourceStart', function(resource)
	if resource == GetCurrentResourceName() then
		if LocalPlayer.state.loggedIn then
			_loggedIn = true
		end

		Wait(1000)
		exports["st_binds"]:Add("laptop_open", "", "keyboard", "Laptop - Open", function()
			OpenLaptop()
		end)

		RegisterBoostingCallbacks()
	end
end)

function OpenLaptop()
	if
		_loggedIn
		and not exports['st_ui']:IsDisabled()
		and not exports['st_jail']:IsJailed()
		and not (exports.st_inventory:Search('count', 'tablet') == 0)
		and not LocalPlayer.state.tabletOpen
	then
		exports['st_tablet']:Open()
	end
end

RegisterNetEvent("Tablet:Client:Open")
AddEventHandler("Tablet:Client:Open", function()
	OpenLaptop()
end)

AddEventHandler("Inventory:Client:ItemsLoaded", function()
	exports['st_tablet']:SetData("items", exports.st_inventory:ItemsGetData())
end)

AddEventHandler("Characters:Client:Updated", function()
	_settings = LocalPlayer.state.Character:GetData("LaptopSettings")
	exports['st_tablet']:SetData("player", LocalPlayer.state.Character:GetData())

	if
		LocalPlayer.state.tabletOpen
		and exports.st_inventory:Search('count', 'tablet') == 0
	then
		exports['st_tablet']:Close(true)
	end
end)

AddEventHandler("Ped:Client:Died", function()
	exports['st_tablet']:Close(true)
end)

RegisterNetEvent("Job:Client:DutyChanged", function(state)
	exports['st_tablet']:SetData("onDuty", state)
end)

RegisterNetEvent("UI:Client:Reset", function(manual)
	SetNuiFocus(false, false)
	SendNUIMessage({
		type = "UI_RESET",
		data = {},
	})

	if manual then
		TriggerServerEvent("Tablet:Server:UIReset")
		if LocalPlayer.state.tabletOpen then
			exports['st_tablet']:Close()
		end
	end
end)

AddEventHandler("UI:Client:Close", function(context)
	if context ~= "laptop" then
		exports['st_tablet']:Close()
	end
end)

AddEventHandler("Ped:Client:Died", function()
	if LocalPlayer.state.tabletOpen then
		exports['st_tablet']:Close()
	end
end)

RegisterNetEvent("Tablet:Client:SetApps", function(apps)
	LAPTOP_APPS = apps
	SendNUIMessage({
		type = "SET_APPS",
		data = apps,
	})
end)

RegisterNetEvent("Characters:Client:Spawned", function()
	_loggedIn = true

	CreateThread(function()
		while _loggedIn do
			SendNUIMessage({
				type = "SET_TIME",
				data = GlobalState["Sync:Time"],
			})
			Wait(15000)
		end
	end)
end)

RegisterNetEvent("Characters:Client:Logout", function()
	_loggedIn = false
end)

function hasValue(tbl, value)
	for k, v in ipairs(tbl or {}) do
		if v == value or (type(v) == "table" and hasValue(v, value)) then
			return true
		end
	end
	return false
end

RegisterNUICallback("AcceptPopup", function(data, cb)
	cb("OK")
	if data.data ~= nil and data.data.server then
		TriggerServerEvent(data.event, data.data)
	else
		TriggerEvent(data.event, data.data)
	end
end)

RegisterNUICallback("CancelPopup", function(data, cb)
	cb("OK")
	if data.data ~= nil and data.data.server then
		TriggerServerEvent(data.event, data.data)
	else
		TriggerEvent(data.event, data.data)
	end
end)

RegisterNUICallback("CDExpired", function(data, cb)
	cb("OK")
	_openCd = false
end)
