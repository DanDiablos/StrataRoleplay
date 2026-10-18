import { useEffect } from 'react'
import { useStore } from '../../store.ts'

export default function Flashbang(): React.ReactElement | null {
  const flashbanged = useStore(s => s.flashbanged)
  const dispatch = useStore(s => s.dispatch)

  useEffect(() => {
    if (!flashbanged) return
    const t = setTimeout(() => dispatch('CLEAR_FLASHBANGED'), flashbanged.duration)
    return () => clearTimeout(t)
  }, [flashbanged, dispatch])

  if (!flashbanged) return null

  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{
        background: `rgba(255,255,255,${flashbanged.strength})`,
        zIndex: 60,
        transition: 'opacity 0.3s ease',
      }}
    />
  )
}
