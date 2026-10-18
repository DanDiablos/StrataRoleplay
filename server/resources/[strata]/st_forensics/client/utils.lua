function draw3DText(x, y, z, text)
    local onScreen, _x, _y = World3dToScreen2d(x, y, z)
    local px, py, pz = table.unpack(GetGameplayCamCoords())

    SetTextScale(0.25, 0.25)
    SetTextFont(4)
    SetTextProportional(1)
    SetTextColour(255, 255, 255, 245)
    SetTextOutline(true)
    SetTextEntry("STRING")
    SetTextCentre(1)
    AddTextComponentString(text)
    DrawText(_x, _y)
end

function IsCoordsInWater(coords)
    local inWater, waterHeight = TestVerticalProbeAgainstAllWater(coords.x, coords.y, coords.z, 0, 1.0)
    return inWater
end

