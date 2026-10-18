import { useEffect, useState } from 'react'
import { useStore } from './store.ts'
import { sendNui } from './nui.ts'
import BankScreen from './screens/BankScreen.tsx'
import ATMScreen from './screens/ATMScreen.tsx'
import Toast from './components/Toast.tsx'

export default function App(): React.ReactElement | null {
  const hidden   = useStore(s => s.hidden)
  const appMode  = useStore(s => s.appMode)
  const dispatch = useStore(s => s.dispatch)

  const [visible, setVisible] = useState(!hidden)
  const [leaving, setLeaving] = useState(false)

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
        sendNui('Close').catch(() => {})
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

  return (
    <div
      className={`${leaving ? 'animate-fade-out' : 'animate-fade-in'} w-screen h-screen flex items-center justify-center`}
      onAnimationEnd={() => { if (leaving) setVisible(false) }}
    >
      {appMode === 'BANK' ? <BankScreen /> : <ATMScreen />}
      <Toast />
    </div>
  )
}
