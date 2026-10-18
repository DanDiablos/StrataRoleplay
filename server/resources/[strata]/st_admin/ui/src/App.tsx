import { useEffect, useState } from 'react'
import type { ComponentType } from 'react'
import { useStore, Screen } from './store.ts'
import { sendNui } from './nui.ts'
import Titlebar from './components/Titlebar.tsx'
import NavBar from './components/NavBar.tsx'
import Toast from './components/Toast.tsx'
import DashboardScreen from './screens/DashboardScreen.tsx'
import PlayersScreen from './screens/PlayersScreen.tsx'
import DisconnectedScreen from './screens/DisconnectedScreen.tsx'
import CharactersScreen from './screens/CharactersScreen.tsx'
import ItemsScreen from './screens/ItemsScreen.tsx'
import VehiclesScreen from './screens/VehiclesScreen.tsx'
import CurrentVehicleScreen from './screens/CurrentVehicleScreen.tsx'
import DoorlocksScreen from './screens/DoorlocksScreen.tsx'
import ViewPlayerScreen from './screens/ViewPlayerScreen.tsx'
import ViewVehicleScreen from './screens/ViewVehicleScreen.tsx'
import ViewDoorlockScreen from './screens/ViewDoorlockScreen.tsx'

const SCREENS: Record<Screen, ComponentType> = {
  'dashboard':       DashboardScreen,
  'players':         PlayersScreen,
  'disconnected':    DisconnectedScreen,
  'characters':      CharactersScreen,
  'items':           ItemsScreen,
  'vehicles':        VehiclesScreen,
  'current-vehicle': CurrentVehicleScreen,
  'doorlocks':       DoorlocksScreen,
  'view-player':     ViewPlayerScreen,
  'view-vehicle':    ViewVehicleScreen,
  'view-doorlock':   ViewDoorlockScreen,
}

export default function App(): React.ReactElement | null {
  const hidden   = useStore((s) => s.hidden)
  const compact  = useStore((s) => s.compact)
  const opacity  = useStore((s) => s.opacity)
  const screen   = useStore((s) => s.screen)
  const dispatch = useStore((s) => s.dispatch)

  const [visible,  setVisible]  = useState(!hidden)
  const [leaving,  setLeaving]  = useState(false)

  useEffect(() => {
    const handler = (e: MessageEvent<{ type?: string; data?: Record<string, unknown> }>) => {
      if (!e.isTrusted) return
      const { type, data } = e.data
      if (type) dispatch(type, data ?? {})
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [dispatch])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dispatch('APP_HIDE')
        sendNui('Close')
      }
      if (e.key === 'b' && e.ctrlKey) {
        e.preventDefault()
        dispatch('TOGGLE_COMPACT')
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

  const Screen = SCREENS[screen] ?? DashboardScreen

  return (
    <div
      className={`${leaving ? 'animate-fade-out' : 'animate-fade-in'} w-screen h-screen relative`}
      onAnimationEnd={() => { if (leaving) setVisible(false) }}
    >
      <div
        className="absolute top-1/2 -translate-y-1/2 flex flex-col bg-menu-bg border border-white/10"
        style={{
          width: compact ? 420 : 'calc(80vw)',
          height: '85vh',
          right: compact ? 16 : 'calc(10vw)',
          transition: 'width 0.35s cubic-bezier(0.4,0,0.2,1), right 0.35s cubic-bezier(0.4,0,0.2,1)',
          opacity: opacity ? 0.25 : 1,
        }}
      >
        <Titlebar />
        <div className={compact ? 'flex flex-1 min-h-0 overflow-hidden' : 'contents'}>
          {compact && <NavBar />}
          <div className="flex flex-col flex-1 min-h-0">
            {!compact && <NavBar />}
            <main className="flex-1 min-h-0 overflow-hidden">
              <Screen />
            </main>
          </div>
        </div>
        <Toast />
      </div>
    </div>
  )
}
