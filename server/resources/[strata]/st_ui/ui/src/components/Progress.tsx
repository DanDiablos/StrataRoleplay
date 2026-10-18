import { useState, useEffect } from 'react'
import { Loader } from 'lucide-react'
import { useStore } from '../store.ts'
import { sendNui } from '../nui.ts'

export default function Progress(): JSX.Element | null {
  const showing = useStore(s => s.progressShowing)
  const label = useStore(s => s.progressLabel)
  const duration = useStore(s => s.progressDuration)
  const startTime = useStore(s => s.progressStartTime)
  const cancelled = useStore(s => s.progressCancelled)
  const failed = useStore(s => s.progressFailed)
  const finished = useStore(s => s.progressFinished)
  const dispatch = useStore(s => s.dispatch)

  const [pct, setPct] = useState(0)

  useEffect(() => {
    if (!showing || duration <= 0) return
    if (cancelled || failed || finished) return

    const id = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(1, elapsed / duration)
      setPct(progress * 100)

      if (progress >= 1) {
        dispatch('FINISH_PROGRESS')
        clearInterval(id)
      }
    }, 16)

    return () => clearInterval(id)
  }, [showing, duration, startTime, cancelled, failed, finished, dispatch])

  useEffect(() => {
    if (!showing) return
    if (!cancelled && !failed && !finished) return
    const t = setTimeout(() => dispatch('HIDE_PROGRESS'), 2000)
    return () => clearTimeout(t)
  }, [showing, cancelled, failed, finished, dispatch])

  useEffect(() => {
    if (showing && !cancelled && !failed && !finished) setPct(0)
  }, [showing, startTime])

  if (!showing) return null

  const totalSec = Math.round(duration / 1000)
  const elapsedSec = Math.round((Date.now() - startTime) / 1000)

  let statusLabel = label
  let color = '#FF5C3A'

  if (finished) {
    statusLabel = 'Finished'
    color = '#52984a'
  } else if (cancelled) {
    statusLabel = 'Cancelled'
    color = '#a13434'
  } else if (failed) {
    statusLabel = 'Failed'
    color = '#a13434'
  }

  return (
    <div
      className="fixed pointer-events-none animate-fade-in"
      style={{ bottom: 160, left: '50%', transform: 'translateX(-50%)', zIndex: 8 }}
    >
      <div
        className="relative overflow-hidden bg-menu-surface w-[320px]"
        style={{
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.55)',
        }}
      >
        {/* Left accent — site SectionCard pattern */}
        <div
          className="absolute left-0 top-0 bottom-0 transition-colors"
          style={{ width: 3, background: color }}
        />

        <div className="flex items-center gap-3 px-4 py-3 pl-[18px]">
          <Loader
            size={14}
            className="shrink-0 animate-spin drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]"
            style={{ color, animationDuration: '2s' }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-3">
              <span className="font-display font-bold uppercase tracking-[0.08em] text-[0.78rem] text-white/85 truncate">
                {statusLabel}
              </span>
              <span className="font-mono tabular-nums text-[0.65rem] text-white/35 whitespace-nowrap">
                {Math.min(elapsedSec, totalSec)}s / {totalSec}s
              </span>
            </div>
          </div>
        </div>

        {/* Progress bar at bottom — flat fill */}
        <div
          className="absolute bottom-0 left-0 h-[2px] transition-all"
          style={{
            width: `${cancelled || failed ? 100 : pct}%`,
            background: color,
            transitionDuration: '50ms',
            transitionTimingFunction: 'linear',
          }}
        />
      </div>
    </div>
  )
}
