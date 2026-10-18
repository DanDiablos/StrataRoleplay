import React, { useMemo } from 'react'
import { useStore } from '../store'
import Header from './Header'
import Footer from './Footer'
import Alert from './Alert'
import PeekBanner from './PeekBanner'
import HomeScreen from '../screens/HomeScreen'
import LockScreen from '../screens/LockScreen'
import defaultWallpaper from '../assets/wallpaper.webp'
import phoneFrame from '../assets/phone-frame.png'

const WALLPAPER_GRADIENTS: Record<string, string> = {
  ember:    'linear-gradient(135deg, #1a0a05 0%, #2d0f06 30%, #FF5C3A 100%)',
  ocean:    'linear-gradient(165deg, #020c1b 0%, #0a2540 40%, #1258a3 100%)',
  aurora:   'linear-gradient(150deg, #041c14 0%, #05372a 40%, #1abc9c 100%)',
  twilight: 'linear-gradient(160deg, #0d0415 0%, #2d1050 45%, #8800c7 100%)',
  midnight: 'linear-gradient(180deg, #0a0a0f 0%, #121220 50%, #1c1c3a 100%)',
  sunset:   'linear-gradient(140deg, #1a0505 0%, #6b1515 40%, #f09348 100%)',
  storm:    'linear-gradient(155deg, #08080a 0%, #1a1a24 45%, #3a3a5c 100%)',
  neon:     'linear-gradient(135deg, #0a0014 0%, #1a003a 40%, #59E5F7 100%)',
  forest:   'linear-gradient(170deg, #050a05 0%, #0f1f0a 45%, #268f3a 100%)',
  rose:     'linear-gradient(145deg, #140508 0%, #2d0a15 40%, #870b30 100%)',
  solar:    'linear-gradient(160deg, #0f0a00 0%, #2a1a00 40%, #c4b404 100%)',
}

interface PhoneShellProps {
  appScreen: React.ReactNode | null
}

/* Frame dimensions — the PNG is 350×750. The screen cutout inside the frame
   starts roughly 14px from left/right and 38px from top / 42px from bottom.
   We size the frame so its inner cutout matches the 290×590 screen area.
   Inner width  = 350 - 28 = 322  → scale = 290/322 ≈ 0.9006 → frame W = 315
   Inner height = 750 - 80 = 670  → scale = 590/670 ≈ 0.8806 → frame H = 660
   We'll use the larger scale to ensure full coverage and adjust offsets. */
const SCREEN_W = 334
const SCREEN_H = 674
const FRAME_W = 382
const FRAME_H = 743
const FRAME_OFFSET_X = 23 // left edge of screen inside frame
const FRAME_OFFSET_Y_TOP = 52  // bezel above screen
const FRAME_OFFSET_Y_BOTTOM = FRAME_H - SCREEN_H - FRAME_OFFSET_Y_TOP // remaining at bottom

export default function PhoneShell({ appScreen }: PhoneShellProps): React.ReactElement {
  const locked = useStore((s) => s.locked)
  const currentApp = useStore((s) => s.currentApp)
  const wallpaperSetting = useStore((s) => s.player.PhoneSettings?.wallpaper ?? 'default')

  const wallpaperStyle = useMemo(() => {
    const gradient = WALLPAPER_GRADIENTS[wallpaperSetting]
    if (gradient) return { background: gradient } as React.CSSProperties
    return { backgroundImage: `url(${defaultWallpaper})` } as React.CSSProperties
  }, [wallpaperSetting])

  return (
    <div
      className="relative"
      style={{
        width: `${FRAME_W}px`,
        height: `${FRAME_H}px`,
      }}
    >
      {/* Phone frame image — sits on top of everything, pointer-events-none */}
      <img
        src={phoneFrame}
        alt=""
        className="absolute inset-0 w-full h-full pointer-events-none select-none"
        style={{ zIndex: 60 }}
        draggable={false}
      />

      {/* Screen content — positioned inside the frame cutout */}
      <div
        className="absolute flex flex-col overflow-hidden"
        style={{
          top: `${FRAME_OFFSET_Y_TOP}px`,
          left: `${FRAME_OFFSET_X}px`,
          width: `${SCREEN_W}px`,
          height: `${SCREEN_H}px`,
          background: 'linear-gradient(165deg, #111111 0%, #0a0a0a 100%)',
          borderRadius: '4px',
        }}
      >
        {/* Wallpaper — visible on lock screen and home */}
        <div
          className="absolute inset-0 bg-cover bg-center pointer-events-none transition-opacity duration-200"
          style={{
            ...wallpaperStyle,
            opacity: locked || !currentApp ? 1 : 0,
          }}
        />

        {/* Status bar */}
        <div className="relative z-10">
          <Header />
        </div>

        {/* Peek banner — calls + notifications, shows over lock screen and apps */}
        <PeekBanner />

        {/* Lock screen overlay */}
        {locked && <LockScreen />}

        {/* Screen area (hidden while locked) */}
        {!locked && (
          <div className="flex-1 min-h-0 flex flex-col relative z-10 overflow-hidden">
            {/* App or Home */}
            <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
              {currentApp ? appScreen : <HomeScreen />}
            </div>

            {/* Alert toast */}
            <Alert />
          </div>
        )}

        {/* Navigation bar (hidden while locked) */}
        {!locked && <div className="relative z-10"><Footer /></div>}
      </div>
    </div>
  )
}
