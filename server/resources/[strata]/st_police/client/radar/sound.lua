function PlayFastAlert()
    CreateThread(function()
        exports['st_sound']:UISoundsPlayFrontEnd(-1, 'BEEP_RED', 'DLC_HEIST_HACKING_SNAKE_SOUNDS')
        Wait(250)
        exports['st_sound']:UISoundsPlayFrontEnd(-1, 'BEEP_RED', 'DLC_HEIST_HACKING_SNAKE_SOUNDS')
        Wait(250)
        exports['st_sound']:UISoundsPlayFrontEnd(-1, 'BEEP_RED', 'DLC_HEIST_HACKING_SNAKE_SOUNDS')
    end)
end

function PlayFlaggedAlert()
    exports['st_sound']:UISoundsPlayFrontEnd(-1, 'BEEP_GREEN', 'DLC_HEIST_HACKING_SNAKE_SOUNDS')
end

function PlayLockAlert()
    exports['st_sound']:UISoundsPlayFrontEnd(-1, 'BEEP_RED', 'DLC_HEIST_HACKING_SNAKE_SOUNDS')
end

function PlayUnlockAlert()
    exports['st_sound']:UISoundsPlayFrontEnd(-1, '5_SEC_WARNING', 'HUD_MINI_GAME_SOUNDSET')
end
