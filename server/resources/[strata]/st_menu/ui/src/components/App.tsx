import React, { useEffect } from 'react'
import { useStore } from '../store.ts'
import { sendNui } from '../nui.ts'
import Menu from './Menu.tsx'

export default function App(): React.ReactElement {
  const dispatch = useStore(s => s.dispatch)

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
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        sendNui('Close')
        dispatch('CLEAR_MENU')
      } else if (e.key === 'Shift') {
        if ((document.activeElement as HTMLElement)?.nodeName !== 'TEXTAREA') {
          sendNui('ToggleFocusLoss')
        }
      }
    }
    window.addEventListener('keyup', onKey)
    return () => window.removeEventListener('keyup', onKey)
  }, [dispatch])

  return <Menu />
}
