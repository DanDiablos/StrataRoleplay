import { useEffect, useRef, useState } from 'react'
import { useSound } from '../../useSound'

interface Props {
  keyPair: string[]
  minMs: number
  maxMs: number
  disabled: boolean
  onFail: () => void
  onHit: () => void
}

const ZONE_TOP = 76
const ZONE_BOTTOM = 88

export default function Alley({
  keyPair,
  minMs,
  maxMs,
  disabled,
  onFail,
  onHit,
}: Props): React.ReactElement {
  const sound = useSound()
  const [falling, setFalling] = useState(false)
  const [speed, setSpeed] = useState(() => Math.random() * (maxMs - minMs) + minMs)
  const [offset, setOffset] = useState(0)
  const [pressed, setPressed] = useState(false)
  const startTimerRef = useRef<number | null>(null)

  const label = (keyPair[1] ?? keyPair[0] ?? '').toUpperCase()
  const lowerKey = keyPair[0] ?? ''
  const upperKey = keyPair[1] ?? ''

  useEffect(() => {
    if (disabled) return
    if (falling) return
    setOffset(0)
    setSpeed(Math.random() * (maxMs - minMs) + minMs)
    const delay = 300 * (Math.random() * 3 + 1)
    startTimerRef.current = window.setTimeout(() => setFalling(true), delay)
    return () => {
      if (startTimerRef.current !== null) window.clearTimeout(startTimerRef.current)
    }
  }, [falling, disabled, minMs, maxMs])

  useEffect(() => {
    if (!falling || disabled) return
    const id = window.setInterval(() => {
      setOffset((o) => {
        const next = o + 10
        if (next >= speed) {
          setFalling(false)
          sound('negative')
          onFail()
          return 0
        }
        return next
      })
    }, 10)
    return () => window.clearInterval(id)
  }, [falling, speed, disabled, onFail, sound])

  useEffect(() => {
    if (disabled) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== lowerKey && e.key !== upperKey) return
      if (!falling) return
      setPressed(true)
      window.setTimeout(() => setPressed(false), 200)
      const pct = (offset / speed) * 100
      const valid = pct >= ZONE_TOP && pct <= ZONE_BOTTOM
      setFalling(false)
      if (valid) {
        sound('beep')
        onHit()
      } else {
        sound('negative')
        onFail()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [falling, offset, speed, lowerKey, upperKey, disabled, onFail, onHit, sound])

  const topPct = falling ? (offset / speed) * 100 : -100

  return (
    <div className="relative w-[140px] h-full border-x border-b border-white/[0.08] bg-menu-bg overflow-hidden">
      {/* Hit zone */}
      <div
        className="absolute inset-x-0 border-y border-primary/50 bg-primary/5"
        style={{ top: `${ZONE_TOP}%`, height: `${ZONE_BOTTOM - ZONE_TOP}%` }}
      />

      {/* Falling key */}
      {falling && (
        <div
          className="absolute left-0 right-0 mx-auto w-10 h-10 flex items-center justify-center border border-white/20 bg-menu-surface font-mono text-[1.1rem] font-semibold text-white/85"
          style={{ top: `${topPct}%`, transition: 'none' }}
        >
          {label}
        </div>
      )}

      {/* Target key at hit zone */}
      <div
        className={`absolute left-0 right-0 mx-auto w-10 h-10 flex items-center justify-center border font-mono text-[1.1rem] font-semibold transition-colors ${
          pressed
            ? 'border-menu-success/80 bg-menu-success/20 text-white'
            : 'border-white/15 bg-menu-surface-lt text-white/50'
        }`}
        style={{ top: `${(ZONE_TOP + ZONE_BOTTOM) / 2}%`, transform: 'translateY(-50%)' }}
      >
        {label}
      </div>
    </div>
  )
}
