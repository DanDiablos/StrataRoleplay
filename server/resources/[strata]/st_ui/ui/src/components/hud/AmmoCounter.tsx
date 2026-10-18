import { useStore } from '../../store.ts'
import { useRef, useEffect, useState, useMemo } from 'react'
import { Crosshair } from 'lucide-react'

export default function AmmoCounter(): JSX.Element | null {
  const ammo = useStore(s => s.ammo)
  const [bump, setBump] = useState(false)
  const prevClip = useRef(ammo.clip)

  useEffect(() => {
    if (ammo.clip !== prevClip.current) {
      prevClip.current = ammo.clip
      setBump(true)
      const t = setTimeout(() => setBump(false), 150)
      return () => clearTimeout(t)
    }
  }, [ammo.clip])

  const clipColor = useMemo(() => {
    if (ammo.clip <= 0) return '#FE2436'
    if (ammo.clip <= 5) return '#f09348'
    return '#FF5C3A'
  }, [ammo.clip])

  if (!ammo.visible) return null

  return (
    <div
      className="relative flex items-center gap-2 px-2.5 py-1.5 bg-menu-surface"
      style={{
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.55)',
      }}
    >
      {/* left accent bar — mirrors the site's section-card accent */}
      <span
        className="absolute left-0 top-0 bottom-0 transition-colors"
        style={{ width: 2, background: clipColor }}
      />
      <Crosshair
        size={13}
        strokeWidth={2.2}
        className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]"
        style={{ color: clipColor }}
      />
      <span
        className={`font-mono font-medium tabular-nums text-[14px] leading-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)] ${bump ? 'animate-bump' : ''}`}
        style={{ color: clipColor }}
      >
        {ammo.clip}
      </span>
      <span className="w-px h-3" style={{ background: 'rgba(255,255,255,0.12)' }} />
      <span className="font-mono tabular-nums text-[11px] text-white/45 leading-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]">
        {ammo.reserve}
      </span>
    </div>
  )
}
