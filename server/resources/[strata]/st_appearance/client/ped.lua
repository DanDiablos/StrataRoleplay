_creatorLocation = { x = -464.149, y = -932.703, z = 46.612, h = 90.63 }
_currentState = nil
_data = nil
_playingIdle = false
FROZEN = false

_camOffsets = {
	[0] = "standard",
	[1] = "head",
	[2] = "body",
	[3] = "legs",
}

_glassesOff = false
_vestOff = false
attachedProps = {}

AddEventHandler('onClientResourceStart', function(resource)
	if resource == GetCurrentResourceName() then
		Wait(1000)
		RegisterInteraction()
		CreateShops()
	end
end)

AddEventHandler('st_ui:RegisterMenuItems', function()
	RegisterInteraction()
end)

RegisterNetEvent("Ped:Client:RemoveGlasses", function()
	if LocalPlayer.state.Character ~= nil and not LocalPed.customization.props.glass.disabled and not _glassesOff then
		_glassesOff = true
		CreateThread(function()
			TriggerEvent("Ped:Client:HatGlassAnim")
			Wait(500)
			ClearPedProp(LocalPlayer.state.ped, 1)
		end)
	end
end)

RegisterNetEvent("Ped:Client:RemoveKevlar", function()
	if LocalPlayer.state.Character ~= nil and not LocalPed.customization.props.glass.disabled and not _vestOff then
		_vestOff = true
		CreateThread(function()
			TriggerEvent("Ped:Client:HatGlassAnim")
			Wait(500)
			ClearPedProp(LocalPlayer.state.ped, 1)
		end)
	end
end)

function RegisterInteraction()
	exports['st_ui']:InteractionRegisterMenu("ped_interact", "Appearance", "face-tired", function()
		exports['st_ui']:InteractionShowMenu({
			{
				icon = "masks-theater",
				label = "Remove Mask",
				shouldShow = function()
					return LocalPed.customization.components.mask.drawableId ~= 0
				end,
				action = function()
					exports["strata"]:ServerCallback("Ped:RemoveMask")
					exports['st_ui']:InteractionHide()
				end,
			},
			{
				icon = "hat-cowboy-side",
				label = "Remove Hat",
				shouldShow = function()
					return not LocalPed.customization.props.hat.disabled
				end,
				action = function()
					exports["strata"]:ServerCallback("Ped:RemoveHat")
					exports['st_ui']:InteractionHide()
				end,
			},
			{
				icon = "glasses",
				label = "Remove Glasses",
				shouldShow = function()
					return not LocalPed.customization.props.glass.disabled and not _glassesOff
				end,
				action = function()
					_glassesOff = true
					CreateThread(function()
						TriggerEvent("Ped:Client:HatGlassAnim")
						Wait(500)
						ClearPedProp(LocalPlayer.state.ped, 1)
					end)
					exports['st_ui']:InteractionHide()
				end,
			},
			{
				icon = "glasses",
				label = "Put On Glasses",
				shouldShow = function()
					return not LocalPed.customization.props.glass.disabled and _glassesOff
				end,
				action = function()
					_glassesOff = false
					CreateThread(function()
						TriggerEvent("Ped:Client:HatGlassAnim")
						Wait(500)
						SetPedPropIndex(
							LocalPlayer.state.ped,
							LocalPed.customization.props.glass.componentId,
							LocalPed.customization.props.glass.drawableId,
							LocalPed.customization.props.glass.textureId
						)
					end)
					exports['st_ui']:InteractionHide()
				end,
			},
			{
				icon = "rotate",
				label = false,
				shouldShow = function()
					return (
							not LocalPed.customization.props.hat.disabled
							and GetPedPropIndex(LocalPlayer.state.ped, 0) == -1
						)
						or (
							not LocalPed.customization.props.glass.disabled
							and GetPedPropIndex(LocalPlayer.state.ped, 1) == -1
							and not _glassesOff
						)
				end,
				action = function()
					CreateThread(function()
						TriggerEvent("Ped:Client:HatGlassAnim")
						Wait(500)

						if not LocalPed.customization.props.hat.disabled
							and GetPedPropIndex(LocalPlayer.state.ped, 0) == -1
						then
							SetPedPropIndex(
								LocalPlayer.state.ped,
								LocalPed.customization.props.hat.componentId,
								LocalPed.customization.props.hat.drawableId,
								LocalPed.customization.props.hat.textureId
							)
						end

						if not LocalPed.customization.props.glass.disabled
							and GetPedPropIndex(LocalPlayer.state.ped, 1) == -1
							and not _glassesOff
						then
							SetPedPropIndex(
								LocalPlayer.state.ped,
								LocalPed.customization.props.glass.componentId,
								LocalPed.customization.props.glass.drawableId,
								LocalPed.customization.props.glass.textureId
							)
						end
					end)
					exports['st_ui']:InteractionHide()
					-- exports['st_ui']:InteractionShowMenu({
					-- 	{
					-- 		icon = "face-sunglasses",
					-- 		label = "Put On Hat & Glasses",
					-- 		shouldShow = function()
					-- 			return (
					-- 					not LocalPed.customization.props.hat.disabled
					-- 					and GetPedPropIndex(LocalPlayer.state.ped, 0) == -1
					-- 				)
					-- 				and (
					-- 					not LocalPed.customization.props.glass.disabled
					-- 					and GetPedPropIndex(LocalPlayer.state.ped, 1) == -1
					-- 					and not _glassesOff
					-- 				)
					-- 		end,
					-- 		action = function()
					-- 			CreateThread(function()
					-- 				TriggerEvent("Ped:Client:HatGlassAnim")
					-- 				Wait(500)
					-- 				SetPedPropIndex(
					-- 					LocalPlayer.state.ped,
					-- 					LocalPed.customization.props.hat.componentId,
					-- 					LocalPed.customization.props.hat.drawableId,
					-- 					LocalPed.customization.props.hat.textureId
					-- 				)
					-- 				SetPedPropIndex(
					-- 					LocalPlayer.state.ped,
					-- 					LocalPed.customization.props.glass.componentId,
					-- 					LocalPed.customization.props.glass.drawableId,
					-- 					LocalPed.customization.props.glass.textureId
					-- 				)
					-- 			end)
					-- 			exports['st_ui']:InteractionHide()
					-- 		end,
					-- 	},
					-- 	{
					-- 		icon = "hat-cowboy-side",
					-- 		label = "Put On Hat",
					-- 		shouldShow = function()
					-- 			return (
					-- 					not LocalPed.customization.props.hat.disabled
					-- 					and GetPedPropIndex(LocalPlayer.state.ped, 0) == -1
					-- 				)
					-- 		end,
					-- 		action = function()
					-- 			CreateThread(function()
					-- 				TriggerEvent("Ped:Client:HatGlassAnim")
					-- 				Wait(500)
					-- 				SetPedPropIndex(
					-- 					LocalPlayer.state.ped,
					-- 					LocalPed.customization.props.hat.componentId,
					-- 					LocalPed.customization.props.hat.drawableId,
					-- 					LocalPed.customization.props.hat.textureId
					-- 				)
					-- 			end)
					-- 			exports['st_ui']:InteractionHide()
					-- 		end,
					-- 	},
					-- 	{
					-- 		icon = "glasses",
					-- 		label = "Put On Glasses",
					-- 		shouldShow = function()
					-- 			return (
					-- 					not LocalPed.customization.props.glass.disabled
					-- 					and GetPedPropIndex(LocalPlayer.state.ped, 1) == -1
					-- 					and not _glassesOff
					-- 				)
					-- 		end,
					-- 		action = function()
					-- 			CreateThread(function()
					-- 				TriggerEvent("Ped:Client:HatGlassAnim")
					-- 				Wait(500)
					-- 				SetPedPropIndex(
					-- 					LocalPlayer.state.ped,
					-- 					LocalPed.customization.props.glass.componentId,
					-- 					LocalPed.customization.props.glass.drawableId,
					-- 					LocalPed.customization.props.glass.textureId
					-- 				)
					-- 			end)
					-- 			exports['st_ui']:InteractionHide()
					-- 		end,
					-- 	},
					-- })
				end,
			},
		})
	end, function()
		return not LocalPlayer.state.isDead
			and (
				not LocalPed.customization.props.hat.disabled
				or not LocalPed.customization.props.glass.disabled
				or (LocalPed.customization.components.mask.drawableId ~= 0)
				or (exports.st_inventory:ItemsGetWithStaticMetadata("accessory", "drawableId", "textureId", LocalPlayer.state.Character:GetData("Gender"), LocalPed.customization.components.accessory) ~= nil)
			)
	end)
end

RegisterNetEvent("Characters:Client:Logout", function()
	withinPedShop = false
	_glassesOff = false
	if cam ~= nil then
		cam = nil
		_currentState = nil
	end
end)

RegisterNetEvent("Characters:Client:Spawn", function()
	CreateShopsBlips()

	SendNUIMessage({
		type = "SET_PRICING",
		data = {
			pricing = GlobalState["Ped:Pricing"],
		},
	})

	SendNUIMessage({
		type = "SET_TATTOOS_DATA",
		data = {
			data = PedTattoos
		},
	})
end)

function getBonePos(bone)
	if bone == "standard" then
		local coords = GetPedBoneCoords(PlayerPedId(), 11816)
		return vector3(coords.x - 0.3, coords.y + 1.0, coords.z + 0.5)
	elseif bone == "head" then
		local coords = GetPedBoneCoords(PlayerPedId(), 31086)
		return vector3(coords.x - 0.195, coords.y + 0.4, coords.z + 0.05)
	elseif bone == "torso" then
		local coords = GetPedBoneCoords(PlayerPedId(), 11816)
		return vector3(coords.x - 0.3, coords.y + 0.6, coords.z + 0.3)
	elseif bone == "legs" then
		local coords = GetPedBoneCoords(PlayerPedId(), 11816)
		return vector3(coords.x - 0.3, coords.y + 0.7, coords.z - 0.5)
	elseif bone == "feet" then
		local coords = GetPedBoneCoords(PlayerPedId(), 11816)
		return vector3(coords.x - 0.2, coords.y + 0.45, coords.z - 0.8)
	end
end

function PlayIdleAnimation()
	_playingIdle = true
	ClearPedTasksImmediately(PlayerPedId())
	TaskStartScenarioInPlace(PlayerPedId(), "WORLD_HUMAN_HUMAN_STATUE", 0, false)
end

function RemoveAttached(propId)
	if attachedProps[propId] ~= nil then
		DeleteEntity(attachedProps[propId])
		attachedProps[propId] = nil
	end
end

function AttachProp(propId, attachModel, boneNumberSent, x, y, z, xR, yR, zR, keepOtherProps, altVertex)
	if attachedProps[propId] ~= nil then
		RemoveAttached(propId)
	end

	boneNumber = boneNumberSent
	local bone = GetPedBoneIndex(PlayerPedId(), boneNumberSent)
	RequestModel(attachModel)
	while not HasModelLoaded(attachModel) do
		Wait(0)
	end
	local attachedProp = CreateObject(attachModel, 1.0, 1.0, 1.0, 1, 1, 0)
	attachedProps[propId] = attachedProp
	AttachEntityToEntity(
		attachedProp,
		PlayerPedId(),
		bone,
		x,
		y,
		z,
		xR,
		yR,
		zR,
		1,
		1,
		0,
		1,
		not altVertex and 2 or 0,
		1
	)
	SetModelAsNoLongerNeeded(attachModel)
end

exports("ApplyToPed", function(ped, skip, entityOverride)
	local playerPed = entityOverride or PlayerPedId()

	if not ped or not ped.customization then return end

	if not skip then
		local gender = LocalPlayer.state.Character:GetData("Gender")
		local gangChain = LocalPlayer.state.Character:GetData("GangChain")
		local gangChainData = gangChain ~= nil and GlobalState["GangChains"][gangChain] or nil

		SetPedEyeColor(playerPed, ped.customization.eyeColor)
		local playerModel = GetEntityModel(playerPed)
		if playerModel == GetHashKey("mp_f_freemode_01") or playerModel == GetHashKey("mp_m_freemode_01") then
			-- Mix can be 0-100 (template/old DB) or 0.0-1.0 (UI-updated).
			-- SetPedHeadBlendData expects 0.0-1.0, so normalise transparently.
			local f1mix = ped.customization.face.face1.mix
			local f2mix = ped.customization.face.face2.mix
			local f3mix = ped.customization.face.face3.mix
			if f1mix > 1.0 then f1mix = f1mix / 100.0 end
			if f2mix > 1.0 then f2mix = f2mix / 100.0 end
			if f3mix > 1.0 then f3mix = f3mix / 100.0 end

			SetPedHeadBlendData(
				playerPed,
				ped.customization.face.face1.index,
				ped.customization.face.face2.index,
				ped.customization.face.face3.index,
				ped.customization.face.face1.texture,
				ped.customization.face.face2.texture,
				ped.customization.face.face3.index,
				f1mix + 0.0,
				f2mix + 0.0,
				f3mix + 0.0,
				false
			)
		end

		for i = 0, 20 do
			local val = 0.0
			if ped.customization.face.features[i] then
				val = (ped.customization.face.features[i] / 100) + 0.0
			elseif ped.customization.face.features[tostring(i)] then
				val = (ped.customization.face.features[tostring(i)] / 100) + 0.0
			end

			SetPedFaceFeature(playerPed, i, val)
		end

		for k, value in pairs(ped.customization.overlay) do
			-- Opacity can be 0-100 (template/old DB) or 0.0-1.0 (UI-updated).
			-- SetPedHeadOverlay expects 0.0-1.0, so normalise transparently.
			local opacity = value.opacity
			if opacity > 1.0 then opacity = opacity / 100.0 end

			if value.disabled then
				SetPedHeadOverlay(playerPed, value.id, 255, opacity + 0.0)
			else
				SetPedHeadOverlay(playerPed, value.id, value.index, opacity + 0.0)

				if value.color1 and value.color1 > 0 then
					if type(value.color2) == "number" then
						SetPedHeadOverlayColor(playerPed, value.id, 2, value.color1, 0)
					else
						SetPedHeadOverlayColor(playerPed, value.id, 2, value.color1, value.color2)
					end
				else
					SetPedHeadOverlayColor(playerPed, value.id, 0, 0, 0)
				end
			end
		end
		for k, component in pairs(ped.customization.components) do
			if gangChain ~= nil and gangChain ~= "NONE" and gangChainData ~= nil and gangChainData.type == "component" and gangChainData.componentId == component.componentId then
				SetPedComponentVariation(
					playerPed,
					gangChainData.componentId,
					gangChainData.data[gender].drawableId,
					gangChainData.data[gender].textureId,
					gangChainData.data[gender].paletteId
				)
			else
				SetPedComponentVariation(
					playerPed,
					component.componentId,
					component.drawableId,
					component.textureId,
					component.paletteId
				)
			end
		end
		SetPedHairColor(
			playerPed,
			ped.customization.colors.hair.color1.index,
			ped.customization.colors.hair.color2.index
		)
		SetPedHeadOverlayColor(
			playerPed,
			1,
			1,
			ped.customization.colors.facialhair.color1.index,
			ped.customization.colors.facialhair.color2.index
		)
		SetPedHeadOverlayColor(
			playerPed,
			2,
			1,
			ped.customization.colors.eyebrows.color1.index,
			ped.customization.colors.eyebrows.color2.index
		)
		for k, prop in pairs(ped.customization.props) do
			if prop.disabled or (not FROZEN and k == "glass" and _glassesOff) then
				ClearPedProp(playerPed, prop.componentId)
			else
				SetPedPropIndex(playerPed, prop.componentId, prop.drawableId, prop.textureId)
			end
		end

		SetPedEyeColor(playerPed, ped.customization.eyeColor)
	end

	ClearPedDecorations(playerPed)
	if LocalPlayer.state.Character ~= nil then
		if ped.customization.tattoos ~= nil then
			local isMale = LocalPlayer.state.Character:GetData("Gender") == 0
			for i, tattoo in ipairs(ped.customization.tattoos) do
				if tattoo.Name ~= "" then
					if isMale then
						AddPedDecorationFromHashes(playerPed, tattoo.Collection, tattoo.HashNameMale)
					else
						AddPedDecorationFromHashes(playerPed, tattoo.Collection, tattoo.HashNameFemale)
					end
				end
			end
		end
	end

	if ped.customization.hairOverlay and ped.customization.hairOverlay > -1 then
		if ped.customization.hairOverlay > 0 and Config.CustomHairOverlays[ped.customization.hairOverlay] then
			local overlay = Config.CustomHairOverlays[ped.customization.hairOverlay]
			if overlay and overlay.collection and overlay.overlay then
				AddPedDecorationFromHashes(
					playerPed,
					GetHashKey(overlay.collection),
					GetHashKey(overlay.overlay)
				)
			end
		end
	else
		local modelHairOverlays = Config.HairOverlays[GetEntityModel(playerPed)]
		if modelHairOverlays and ped.customization.components and ped.customization.components.hair and ped.customization.components.hair.drawableId then
			local hairHasOverlays = modelHairOverlays[ped.customization.components.hair.drawableId]
			if hairHasOverlays and hairHasOverlays.collection then
				AddPedDecorationFromHashes(
					playerPed,
					GetHashKey(hairHasOverlays.collection),
					GetHashKey(hairHasOverlays.overlay)
				)
			end
		end
	end
end)

exports("Preview", function(entity, gender, ped, skip, gangChain)
	local playerPed = entity

	if not skip then
		local gangChainData = gangChain ~= nil and GlobalState["GangChains"][gangChain] or nil

		SetPedEyeColor(playerPed, ped.customization.eyeColor)
		local playerModel = GetEntityModel(playerPed)
		if playerModel == GetHashKey("mp_f_freemode_01") or playerModel == GetHashKey("mp_m_freemode_01") then
			local f1mix = ped.customization.face.face1.mix
			local f2mix = ped.customization.face.face2.mix
			local f3mix = ped.customization.face.face3.mix
			if f1mix > 1.0 then f1mix = f1mix / 100.0 end
			if f2mix > 1.0 then f2mix = f2mix / 100.0 end
			if f3mix > 1.0 then f3mix = f3mix / 100.0 end

			SetPedHeadBlendData(
				playerPed,
				ped.customization.face.face1.index,
				ped.customization.face.face2.index,
				ped.customization.face.face3.index,
				ped.customization.face.face1.texture,
				ped.customization.face.face2.texture,
				ped.customization.face.face3.index,
				f1mix + 0.0,
				f2mix + 0.0,
				f3mix + 0.0,
				false
			)
		end

		for i = 0, 20 do
			local val = 0.0
			if ped.customization.face.features[i] then
				val = (ped.customization.face.features[i] / 100) + 0.0
			elseif ped.customization.face.features[tostring(i)] then
				val = (ped.customization.face.features[tostring(i)] / 100) + 0.0
			end

			SetPedFaceFeature(playerPed, i, val)
		end

		for k, value in pairs(ped.customization.overlay) do
			local opacity = value.opacity
			if opacity > 1.0 then opacity = opacity / 100.0 end

			if value.disabled then
				SetPedHeadOverlay(playerPed, value.id, 255, opacity + 0.0)
			else
				SetPedHeadOverlay(playerPed, value.id, value.index, opacity + 0.0)

				if value.color1 and value.color1 > 0 then
					if type(value.color2) == "number" then
						SetPedHeadOverlayColor(playerPed, value.id, 2, value.color1, 0)
					else
						SetPedHeadOverlayColor(playerPed, value.id, 2, value.color1, value.color2)
					end
				else
					SetPedHeadOverlayColor(playerPed, value.id, 0, 0, 0)
				end
			end
		end
		for k, component in pairs(ped.customization.components) do
			if gangChain ~= nil and gangChain ~= "NONE" and gangChainData ~= nil and gangChainData.type == "component" and gangChainData.componentId == component.componentId then
				SetPedComponentVariation(
					playerPed,
					gangChainData.componentId,
					gangChainData.data[gender].drawableId,
					gangChainData.data[gender].textureId,
					gangChainData.data[gender].paletteId
				)
			else
				SetPedComponentVariation(
					playerPed,
					component.componentId,
					component.drawableId,
					component.textureId,
					component.paletteId
				)
			end
		end
		SetPedHairColor(
			playerPed,
			ped.customization.colors.hair.color1.index,
			ped.customization.colors.hair.color2.index
		)
		SetPedHeadOverlayColor(
			playerPed,
			1,
			1,
			ped.customization.colors.facialhair.color1.index,
			ped.customization.colors.facialhair.color2.index
		)
		SetPedHeadOverlayColor(
			playerPed,
			2,
			1,
			ped.customization.colors.eyebrows.color1.index,
			ped.customization.colors.eyebrows.color2.index
		)
		for k, prop in pairs(ped.customization.props) do
			if prop.disabled or (not FROZEN and k == "glass" and _glassesOff) then
				ClearPedProp(playerPed, prop.componentId)
			else
				SetPedPropIndex(playerPed, prop.componentId, prop.drawableId, prop.textureId)
			end
		end

		SetPedEyeColor(playerPed, ped.customization.eyeColor)
	end

	ClearPedDecorations(playerPed)
	if LocalPlayer.state.Character ~= nil then
		if ped.customization.tattoos ~= nil then
			local isMale = gender == 0
			for i, tattoo in ipairs(ped.customization.tattoos) do
				if tattoo.Name ~= "" then
					if isMale then
						AddPedDecorationFromHashes(playerPed, tattoo.Collection, tattoo.HashNameMale)
					else
						AddPedDecorationFromHashes(playerPed, tattoo.Collection, tattoo.HashNameFemale)
					end
				end
			end
		end
	end

	if ped.customization.hairOverlay and ped.customization.hairOverlay > -1 then
		if ped.customization.hairOverlay > 0 and Config.CustomHairOverlays[ped.customization.hairOverlay] then
			local overlay = Config.CustomHairOverlays[ped.customization.hairOverlay]
			if overlay and overlay.collection and overlay.overlay then
				AddPedDecorationFromHashes(
					playerPed,
					GetHashKey(overlay.collection),
					GetHashKey(overlay.overlay)
				)
			end
		end
	else
		local modelHairOverlays = Config.HairOverlays[GetEntityModel(playerPed)]
		if modelHairOverlays and ped.customization.components and ped.customization.components.hair and ped.customization.components.hair.drawableId then
			local hairHasOverlays = modelHairOverlays[ped.customization.components.hair.drawableId]
			if hairHasOverlays and hairHasOverlays.collection then
				AddPedDecorationFromHashes(
					playerPed,
					GetHashKey(hairHasOverlays.collection),
					GetHashKey(hairHasOverlays.overlay)
				)
			end
		end
	end
end)

exports("CreatorStart", function(data)
	_data = data

	-- Ensure global LocalPed is set from the data we just received from the server.
	-- Characters:Client:Updated may not have fired yet (statebag replication is async).
	LocalPed = data.Ped

	LocalPlayer.state.inCreator = true
	_currentState = "CREATOR"

	exports["st_utils"]:Start()
	Wait(300)
	exports["st_utils"]:Stop(true)

	FROZEN = true
	local player = PlayerPedId()

	SetTimecycleModifier("default")

	local model = GetHashKey("mp_f_freemode_01")
	if tonumber(data.Gender) == 0 then
		model = GetHashKey("mp_m_freemode_01")
	end
	if data.Ped.model ~= "" then
		model = GetHashKey(data.Ped.model)
	end

	RequestModel(model)

	while not HasModelLoaded(model) do
		Wait(500)
	end
	SetPlayerModel(PlayerId(), model)
	player = PlayerPedId()
	SetEntityMaxHealth(player, 200)
	SetEntityHealth(player, GetEntityMaxHealth(player))
	FreezePedCameraRotation(player, true)
	SetPedDefaultComponentVariation(player)
	SetEntityAsMissionEntity(player, true, true)
	SetModelAsNoLongerNeeded(model)
	exports['st_appearance']:ApplyToPed(LocalPed)
	FreezeEntityPosition(player, true)
	LoadInterior(121346)
	SetEntityCoords(player, _creatorLocation.x, _creatorLocation.y, _creatorLocation.z, false, false, false, false)
	Wait(500)
	SetEntityHeading(player, _creatorLocation.h)
	NetworkSetEntityInvisibleToNetwork(player, false)
	SetEntityVisible(player, true)
	Wait(500)

	PlayIdleAnimation()

	TriggerServerEvent("Ped:EnterCreator")

	SendNUIMessage({
		type = "SET_TATTOOS_DATA",
		data = {
			data = PedTattoos
		},
	})

	DoScreenFadeIn(500)
	while not IsScreenFadedIn() do
		Wait(10)
	end

	TriggerScreenblurFadeOut(500)

	Camera.Activate(500)
	exports['st_ui']:Hide()
	exports['st_ui']:ActionHideAll()
	SetNuiFocus(true, true)
	Wait(100)
	SendNUIMessage({
		type = "SET_PED_DATA",
		data = {
			ped = LocalPed,
			gender = tonumber(data.Gender) or 0,
		},
	})
	SendNUIMessage({
		type = "SET_STATE",
		data = {
			state = "CREATOR",
		},
	})
	SendNUIMessage({
		type = "APP_SHOW",
	})
end)

exports("CreatorEnd", function()
	exports["st_utils"]:Start()
	TriggerServerEvent("Ped:LeaveCreator")

	exports['st_appearance']:CustomizationHide()
	LocalPlayer.state.inCreator = false
	FROZEN = false
	local characterData = LocalPlayer.state.Character:GetData()
	if characterData then
		local currentPedData = characterData.Ped
		characterData.Ped = currentPedData
		exports['st_appearance']:PlacePedIntoWorld(characterData)
	end

	_data = nil
	exports["strata"]:ServerCallback("Apartment:SpawnInside", {})
end)

exports("CustomizationShow", function(type, data)
	FROZEN = true
	local player = PlayerPedId()

	LocalPed = LocalPlayer.state.Character:GetData("Ped")
	exports['st_appearance']:ApplyToPed(LocalPed)
	_currentState = type

	Camera.Activate()

	NetworkSetEntityInvisibleToNetwork(player, false)
	SetEntityVisible(player, true)
	exports['st_ui']:Hide()
	exports['st_ui']:ActionHideAll()
	SetNuiFocus(true, true)
	Wait(100)

	if type == "SURGERY" then
		local p = promise.new()
		exports["strata"]:ServerCallback("Ped:GetWhitelistedPeds", {}, function(wls)
			SendNUIMessage({
				type = "SET_WL_PEDS",
				data = {
					data = wls,
				},
			})

			p:resolve(true)
		end)
		Citizen.Await(p)
	end

	SendNUIMessage({
		type = "SET_PED_DATA",
		data = {
			ped = LocalPed,
			gender = LocalPlayer.state.Character:GetData("Gender") or 0,
		},
	})
	SendNUIMessage({
		type = "SET_STATE",
		data = {
			state = type,
		},
	})
	SendNUIMessage({
		type = "APP_SHOW",
	})
end)

exports("CustomizationHide", function()
	local player = PlayerPedId()
	Camera.Deactivate()
	SetNuiFocus(false, false)
	exports['st_ui']:Show()
	_currentState = nil
	FROZEN = false
end)

exports("CustomizationSave", function(cb)
	FROZEN = false
	exports["strata"]:ServerCallback("Ped:MakePayment", {
		type = _currentState,
	}, function(status, paid)
		if status then
			if LocalPlayer.state.isNaked then
				ToggleNekked(false)
			end

			exports['st_appearance']:ApplyToPed(LocalPed)
			exports["strata"]:ServerCallback("Ped:SavePed", {
				ped = LocalPed,
			}, function(saved)
				if _currentState == "CREATOR" and LocalPlayer.state.inCreator then
					exports['st_appearance']:CreatorEnd()
				else
					exports['st_appearance']:CustomizationHide()
					exports["st_ui"]:Notification("success", string.format("You Paid $%s", paid))
				end
			end)
		else
			exports["st_ui"]:Notification("error", "You Don't Have Enough Cash")
		end
		cb(status)
	end)
end)

exports("CustomizationCancel", function()
	if LocalPlayer.state.isNaked then
		ToggleNekked(false)
	end

	exports['st_appearance']:ApplyToPed(LocalPlayer.state.Character:GetData("Ped"))

	SendNUIMessage({
		type = "SET_PED_DATA",
		data = {
			ped = LocalPlayer.state.Character:GetData("Ped"),
			gender = LocalPlayer.state.Character:GetData("Gender"),
		},
	})
	exports['st_appearance']:CustomizationHide()

	Wait(1000) -- When naked it overrides the cancel so just do this again after a second for a lazy fix idk

	local pData = LocalPlayer.state.Character:GetData("Ped")
	if pData and GetEntityModel(PlayerPedId()) ~= GetHashKey(pData.model) then
		SetPlayerModel(PlayerId(), GetHashKey(pData.model))
	end

	exports['st_appearance']:ApplyToPed(LocalPlayer.state.Character:GetData("Ped"))
	return true
end)

LocalPed = {}

AddEventHandler("Characters:Client:Updated", function(key)
	if key == "Ped" or key == "GangChain" then
		LocalPed = LocalPlayer.state.Character:GetData("Ped")
		exports['st_appearance']:ApplyToPed(LocalPed)
		SendNUIMessage({
			type = "SET_PED_DATA",
			data = {
				ped = LocalPed,
				gender = LocalPlayer.state.Character:GetData("Gender"),
			},
		})
	end
end)


RegisterNetEvent("Ped:Client:Hat", function()
	SetPedPropIndex(
		LocalPlayer.state.ped,
		LocalPed.customization.props.hat.componentId,
		LocalPed.customization.props.hat.drawableId,
		LocalPed.customization.props.hat.textureId
	)
end)

RegisterNetEvent("Ped:Client:Glasses", function()
	SetPedPropIndex(
		LocalPlayer.state.ped,
		LocalPed.customization.props.glass.componentId,
		LocalPed.customization.props.glass.drawableId,
		LocalPed.customization.props.glass.textureId
	)
end)

RegisterNetEvent("Ped:Client:MaskAnim", function()
	Strata.World.StageAnim("missfbi4")
	TaskPlayAnim(LocalPlayer.state.ped, "missfbi4", "takeoff_mask", 4.0, 3.0, -1, 49, 1.0, 0, 0, 0)
	Wait(1000)
	ClearPedTasks(LocalPlayer.state.ped)
end)

RegisterNetEvent("Ped:Client:HatGlassAnim", function()
	Strata.World.StageAnim("mp_masks@on_foot")
	TaskPlayAnim(LocalPlayer.state.ped, "mp_masks@on_foot", "put_on_mask", 4.0, 3.0, -1, 49, 1.0, 0, 0, 0)
	Wait(500)
	ClearPedTasks(LocalPlayer.state.ped)
end)

RegisterNetEvent("Ped:Client:ChainAnim", function()
	Strata.World.StageAnim("clothingtie")
	TaskPlayAnim(LocalPlayer.state.ped, "clothingtie", "try_tie_positive_a", 1.0, 1.0, -1, 48, -1, 0, 0, 0)
	Wait(4000)
	ClearPedTasks(LocalPlayer.state.ped)
end)
