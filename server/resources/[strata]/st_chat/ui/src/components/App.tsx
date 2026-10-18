import React, { useEffect } from 'react'
import { useStore } from '../store'
import { sendNui } from '../nui'
import Chat from './Chat'

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
    sendNui('loaded')
  }, [])

  return <Chat />
}
