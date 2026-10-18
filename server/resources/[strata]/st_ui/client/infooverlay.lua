-- RegisterNetEvent("Confirm:Client:Test", function()
-- 	exports['st_ui']:ConfirmShow(
-- 		"Test Input",
-- 		{
-- 			yes = "Confirm:Test:Yes",
-- 			no = "Confirm:Test:No",
-- 		},
-- 		"This is a test confirm dialog, neat",
-- 		{
-- 			test = "penis",
-- 		}
-- 	)
-- end)

local _isOpen = false

exports("InfoOverlayShow", function(title, description, meta)
	_isOpen = true

	local info = { label = title, description = description }
	if meta then
		if meta.icon then info.icon = meta.icon end
		if meta.sub  then info.sub  = meta.sub  end
		if meta.live then info.live = meta.live  end
	end

	SendNUIMessage({
		type = "SHOW_INFO_OVERLAY",
		data = { info = info },
	})
end)

exports("InfoOverlayClose", function()
	_isOpen = false

	SendNUIMessage({
		type = "CLOSE_INFO_OVERLAY",
	})
end)

exports("InfoOverlayIsOpen", function()
	return _isOpen
end)
