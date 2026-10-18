import { useEffect, useState } from 'react'
import { useStore } from './store'
import { sendNui } from './nui'
import LockScreen from './screens/LockScreen.tsx'
import HomeScreen from './screens/HomeScreen.tsx'
import AxisScreen from './screens/AxisScreen.tsx'
import LSUScreen from './screens/LSUScreen.tsx'
import TeamsScreen from './screens/TeamsScreen.tsx'
import SettingsScreen from './screens/SettingsScreen.tsx'
import InternetScreen from './screens/InternetScreen.tsx'
import FilesScreen from './screens/FilesScreen.tsx'
import CamerasScreen from './screens/CamerasScreen.tsx'
import wallpaperDefault from './assets/wallpaper-default.png'

const SCREENS: Record<string, React.ComponentType> = {
  home:     HomeScreen,
  bizwiz:   AxisScreen,
  lsu:      LSUScreen,
  teams:    TeamsScreen,
  settings: SettingsScreen,
  internet: InternetScreen,
  files:    FilesScreen,
  cameras:  CamerasScreen,
}

const WALLPAPER_BG: Record<string, { type: 'image' | 'gradient'; value: string }> = {
  default:  { type: 'image',    value: wallpaperDefault },
  city:     { type: 'gradient', value: 'linear-gradient(180deg, #0a061e 0%, #1a0d35 25%, #32133a 50%, #4a1a18 75%, #3d1205 100%)' },
  abstract: { type: 'gradient', value: 'radial-gradient(ellipse 120% 100% at 30% 100%, #00302a 0%, #001520 45%, #06080f 100%)' },
  minimal:  { type: 'gradient', value: 'linear-gradient(145deg, #161618 0%, #0c0c0e 100%)' },
}

export default function App(): React.ReactElement | null {
  const hidden   = useStore(s => s.hidden)
  const locked   = useStore(s => s.locked)
  const screen   = useStore(s => s.screen)
  const data     = useStore(s => s.data)
  const dispatch = useStore(s => s.dispatch)

  const [visible, setVisible] = useState(!hidden)
  const [leaving, setLeaving] = useState(false)

  const player   = data.player as Record<string, unknown> | undefined
  const settings = player?.LaptopSettings as Record<string, unknown> | undefined
  const wallpaper = (settings?.wallpaper as string) ?? 'default'

  useEffect(() => {
    const handler = (e: MessageEvent<{ type?: string; data?: unknown }>) => {
      if (!e.isTrusted) return
      const { type, data } = e.data
      if (type) dispatch(type, data)
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [dispatch])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dispatch('LAPTOP_NOT_VISIBLE')
        sendNui('CloseTablet')
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [dispatch])

  useEffect(() => {
    if (hidden) {
      setLeaving(true)
    } else {
      setVisible(true)
      setLeaving(false)
    }
  }, [hidden])

  if (!visible) return null

  const Screen = SCREENS[screen] ?? HomeScreen
  const showWallpaper = screen === 'home' || locked

  return (
    <div
      className={`${leaving ? 'animate-fade-out' : 'animate-fade-in'} w-screen h-screen flex items-center justify-center`}
      onAnimationEnd={() => { if (leaving) setVisible(false) }}
    >
      <div
        className="relative w-[80vw] h-[85vh] flex flex-col overflow-hidden"
        style={{
          borderRadius: '20px',
          border: '10px solid #0e0e0e',
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04), 0 0 0 2px #000, 0 40px 100px rgba(0,0,0,0.85)',
        }}
      >
        {/* Background layer */}
        <div
          className="absolute inset-0 z-0"
          style={showWallpaper ? (() => {
            const wp = WALLPAPER_BG[wallpaper] ?? WALLPAPER_BG.default
            return wp.type === 'image'
              ? { backgroundImage: `url(${wp.value})`, backgroundSize: 'cover', backgroundPosition: 'center' }
              : { background: wp.value }
          })() : { background: '#0f0f0f' }}
        />
        {/* Lock screen — sits over wallpaper, fades out on unlock */}
        {locked && <LockScreen />}
        {/* App content — hidden while locked */}
        {!locked && (
          <div className="relative z-10 flex flex-col h-full">
            <Screen />
          </div>
        )}
      </div>
    </div>
  )
}
