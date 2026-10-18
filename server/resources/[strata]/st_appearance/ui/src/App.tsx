import { useEffect } from 'react'
import type { ComponentType } from 'react'
import { useStore } from './store.ts'
import { sendNui } from './nui.ts'
import CreatorScreen from './screens/CreatorScreen.tsx'
import ShopScreen from './screens/ShopScreen.tsx'
import BarberScreen from './screens/BarberScreen.tsx'
import TattooScreen from './screens/TattooScreen.tsx'
import SurgeryScreen from './screens/SurgeryScreen.tsx'
import type { AppState } from './store.ts'

const SCREENS: Record<AppState, ComponentType> = {
  CREATOR:  CreatorScreen,
  SHOP:     ShopScreen,
  BARBER:   BarberScreen,
  TATTOO:   TattooScreen,
  SURGERY:  SurgeryScreen,
}

export default function App(): React.ReactElement | null {
  const hidden   = useStore((s) => s.hidden)
  const appState = useStore((s) => s.appState)
  const ped      = useStore((s) => s.ped)
  const dispatch = useStore((s) => s.dispatch)

  useEffect(() => {
    const handler = (e: MessageEvent<{ type?: string; data?: Record<string, unknown> }>) => {
      if (!e.isTrusted) return
      const { type, data } = e.data
      if (!type) return

      if (type === 'COPY_OUTFIT_CODE') {
        const code = (data as { code?: string })?.code
        if (code) {
          const ta = document.createElement('textarea')
          ta.value = code
          ta.style.position = 'fixed'
          ta.style.opacity = '0'
          document.body.appendChild(ta)
          ta.select()
          document.execCommand('copy')
          document.body.removeChild(ta)
        }
        return
      }

      dispatch(type, data ?? {})
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [dispatch])

  // Wait for all initial Lua data before rendering — prevents the cascade
  // of re-renders from APP_SHOW → SET_STATE → SET_PED_DATA arriving separately
  if (hidden || !appState || !ped) return null

  const Screen = SCREENS[appState]

  const handleCancel = () => {
    dispatch('APP_HIDE')
    sendNui('Cancel')
  }

  return (
    <div
      className="animate-fade-in w-screen h-screen"
      onKeyDown={(e) => { if (e.key === 'Escape' && appState !== 'CREATOR') handleCancel() }}
      tabIndex={-1}
    >
      <Screen />
    </div>
  )
}
