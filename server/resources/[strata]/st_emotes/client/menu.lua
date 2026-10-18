local inEmoteMenu, inEmoteSubMenu, inFeaturesMenu = false, false, false

local cachedEmoteMenu

exports("OpenMainEmoteMenu", function()
    if not cachedEmoteMenu then
        local emoteMenu = {
            main = {
                label = 'Emotes',
                items = {
                    {
                        label = 'Emote Binds',
                        description = 'Edit Your Emote Binds',
                        event = 'Animations:Client:OpenEmoteBinds',
                    },
                    {
                        label = 'Prop Emotes',
                        description = 'Emotes',
                        submenu = 'emotes-prop',
                    },
                    {
                        label = 'Dance Emotes',
                        description = 'Emotes',
                        submenu = 'emotes-dance',
                    },
                },
            },
            ['emotes-prop'] = {
                label = 'Prop Emotes',
                items = {},
            },
            ['emotes-dance'] = {
                label = 'Dance Emotes',
                items = {},
            }
        }

        for k, v in pairs(Config.EmoteNaming.regular) do
            if k ~= "doggo" then
                local emoteSub = 'emotes-' .. k

                table.insert(emoteMenu.main.items, {
                    label = v.name,
                    description = 'Emotes',
                    submenu = emoteSub,
                })

                local subItems = {}

                for _, emote in ipairs(v.emotes) do
                    table.insert(subItems, {
                        label = emote[2],
                        description = '/e ' .. emote[1],
                        event = 'Animations:Client:EmoteMenuEmote',
                        data = emote[1]
                    })
                end

                emoteMenu[emoteSub] = {
                    label = v.name,
                    items = subItems,
                }
            end
        end

        for _, emote in ipairs(Config.EmoteNaming.prop) do
            table.insert(emoteMenu['emotes-prop'].items, {
                label = emote[2],
                description = '/e ' .. emote[1],
                event = 'Animations:Client:EmoteMenuEmote',
                data = emote[1]
            })
        end

        for _, emote in ipairs(Config.EmoteNaming.dance) do
            table.insert(emoteMenu['emotes-dance'].items, {
                label = emote[2],
                description = '/e ' .. emote[1],
                event = 'Animations:Client:EmoteMenuEmote',
                data = emote[1]
            })
        end

        cachedEmoteMenu = emoteMenu
    end

    exports['st_ui']:ListMenuShow(cachedEmoteMenu)
end)

exports("OpenWalksMenu", function(fromMainMenu)
    local emoteMenu = {
        main = {
            label = 'Walk Styles',
            items = {
                {
                    label = 'Reset',
                    description = 'Reset Walk Style to Default',
                    event = 'Animations:Client:EmoteMenuWalkStyle',
                    data = {
                        walk = 'reset',
                        label = false,
                    }
                }
            },
        },
    }

    for k, v in spairs(Config.Walks) do
        table.insert(emoteMenu.main.items, {
            label = k,
            event = 'Animations:Client:EmoteMenuWalkStyle',
            data = {
                walk = v,
                label = k,
            }
        })
    end

    exports['st_ui']:ListMenuShow(emoteMenu)
end)

exports("OpenExpressionsMenu", function()
    local emoteMenu = {
        main = {
            label = 'Facial Expressions',
            items = {
                {
                    label = 'Reset',
                    description = 'Reset Expressions to Default',
                    event = 'Animations:Client:EmoteMenuExpressions',
                    data = {
                        exp = 'reset',
                        label = false,
                    }
                }
            },
        },
    }

    for k, v in spairs(Config.Expressions) do
        table.insert(emoteMenu.main.items, {
            label = k,
            event = 'Animations:Client:EmoteMenuExpressions',
            data = {
                exp = v,
                label = k,
            }
        })
    end

    exports['st_ui']:ListMenuShow(emoteMenu)
end)

-- ── Emote Preview (hover camera) ─────────────────────────────────────────
local _previewCam = nil
local _previewActive = false  -- true only while a preview anim is playing
local _previewSelected = false -- true when player picked a real emote
local _previewToken = 0

local function CancelEmotePreview()
    _previewToken = _previewToken + 1
    if _previewCam then
        RenderScriptCams(false, false, 0, true, true)
        DestroyCam(_previewCam, false)
        _previewCam = nil
    end
    -- Only cancel the ped task if it was a preview, not a real selected emote
    if _previewActive and not _previewSelected then
        ClearPedTasksImmediately(PlayerPedId())
    end
    _previewActive = false
    _previewSelected = false
end

AddEventHandler('Animations:Client:EmoteMenuEmote:Preview', function(emote)
    _previewToken = _previewToken + 1
    local myToken = _previewToken
    _previewSelected = false

    CreateThread(function()
        local name = string.lower(tostring(emote))
        local animInfo = AnimData.Emotes[name] or AnimData.Dances[name] or AnimData.PropEmotes[name]
        if not animInfo then return end

        Strata.World.StageAnim(animInfo.AnDictionary)

        if myToken ~= _previewToken then return end

        local ped = PlayerPedId()
        local flags = (animInfo.AdditionalOptions and animInfo.AdditionalOptions.EmoteLoop) and 1 or 0
        TaskPlayAnim(ped, animInfo.AnDictionary, animInfo.AnAnim, 3.0, -1.0, -1, flags, 0, false, false, false)
        _previewActive = true

        if not _previewCam then
            local coords = GetEntityCoords(ped)
            local fwd = GetEntityForwardVector(ped)
            local cam = CreateCam('DEFAULT_SCRIPTED_CAMERA', true)
            SetCamCoord(cam, coords.x + fwd.x * 2.8, coords.y + fwd.y * 2.8, coords.z + 0.1)
            PointCamAtEntity(cam, ped, 0.0, 0.0, 0.1, false)
            SetCamFov(cam, 50.0)
            RenderScriptCams(true, true, 350, true, true)
            _previewCam = cam
        end
    end)
end)

AddEventHandler('ListMenu:PreviewCancel', function()
    CancelEmotePreview()
end)

AddEventHandler('Animations:Client:EmoteMenuEmote', function(data)
    -- Mark as selected so CancelEmotePreview won't kill the anim
    _previewSelected = true
    _previewActive = false
    -- Fade camera out in background, don't block emote from playing
    if _previewCam then
        local cam = _previewCam
        _previewCam = nil
        CreateThread(function()
            RenderScriptCams(false, true, 350, true, true)
            Wait(370)
            DestroyCam(cam, false)
        end)
    end
    exports['st_emotes']:EmotesPlay(data, true)
    Wait(250)
    exports['st_emotes']:OpenMainEmoteMenu()
end)

AddEventHandler('Animations:Client:EmoteMenuWalkStyle', function(data)
    exports['st_emotes']:PedFeaturesSetWalk(data.walk, data.label)
end)

AddEventHandler('Animations:Client:EmoteMenuExpressions', function(data)
    exports['st_emotes']:PedFeaturesSetExpression(data.exp, data.label)
end)
