import React from 'react'
import { useStore } from '../store'

export default function Alert(): React.ReactElement | null {
  const alerts = useStore((s) => s.alerts)
  const latest = alerts[alerts.length - 1]

  if (!latest) return null

  return (
    <div className="absolute bottom-14 left-0 right-0 flex justify-center pointer-events-none z-50">
      <div className="animate-slide-up px-4 py-2 rounded-lg bg-black/80 border border-white/10 text-[0.72rem] font-medium text-white/80 tracking-wide">
        {latest.text}
      </div>
    </div>
  )
}
