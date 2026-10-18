AddEventHandler('st_target:debug', function(data)
    if data.entity and GetEntityType(data.entity) > 0 then
        data.archetype = GetEntityArchetypeName(data.entity)
        data.model = GetEntityModel(data.entity)
    end

    print(json.encode(data, { indent = true }))
end)

if GetConvarInt('st_target:debug', 0) ~= 1 then return end

local target = exports['st_target']
local drawZones = true

target:addBoxZone({
    coords = vec3(442.5363, -1017.666, 28.85637),
    size = vec3(3, 3, 3),
    rotation = 45,
    debug = drawZones,
    drawSprite = true,
    options = {
        {
            name = 'debug_box',
            event = 'st_target:debug',
            icon = 'fas fa-cube',
            label = locale('debug_box'),
        }
    }
})

target:addSphereZone({
    coords = vec3(440.5363, -1015.666, 28.85637),
    radius = 3,
    debug = drawZones,
    drawSprite = true,
    options = {
        {
            name = 'debug_sphere',
            event = 'st_target:debug',
            icon = 'fas fa-circle',
            label = locale('debug_sphere'),
        }
    }
})

target:addModel(`police`, {
    {
        name = 'debug_model',
        event = 'st_target:debug',
        icon = 'fas fa-handcuffs',
        label = locale('debug_police_car'),
    }
})

target:addGlobalPed({
    {
        name = 'debug_ped',
        event = 'st_target:debug',
        icon = 'fas fa-male',
        label = locale('debug_ped'),
    }
})

target:addGlobalVehicle({
    {
        name = 'debug_vehicle',
        event = 'st_target:debug',
        icon = 'fas fa-car',
        label = locale('debug_vehicle'),
    }
})

target:addGlobalObject({
    {
        name = 'debug_object',
        event = 'st_target:debug',
        icon = 'fas fa-bong',
        label = locale('debug_object'),
    }
})

target:addGlobalOption({
    {
        name = 'debug_global',
        icon = 'fas fa-globe',
        label = locale('debug_global'),
        openMenu = 'debug_global'
    }
})

target:addGlobalOption({
    {
        name = 'debug_global2',
        event = 'st_target:debug',
        icon = 'fas fa-globe',
        label = locale('debug_global') .. ' 2',
        menuName = 'debug_global'
    }
})
