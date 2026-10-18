import { useState } from 'react'
import { Lock, LockOpen } from 'lucide-react'
import { useStore } from '../store'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function LockScreen(): React.ReactElement {
  const time = useStore((s) => s.time)
  const dispatch = useStore((s) => s.dispatch)
  const [unlocking, setUnlocking] = useState(false)
  const [leaving, setLeaving] = useState(false)

  const now = new Date()
  const dateStr = `${DAYS[now.getDay()]}, ${MONTHS[now.getMonth()]} ${now.getDate()}`
  const timeStr = `${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')}`

  const handleUnlock = () => {
    if (unlocking || leaving) return
    setUnlocking(true)
    setTimeout(() => {
      setLeaving(true)
      setTimeout(() => dispatch('UNLOCK'), 150)
    }, 240)
  }

  return (
    <div
      className={`flex-1 flex flex-col cursor-pointer ${leaving ? 'animate-fade-out' : 'animate-fade-in'}`}
      onClick={handleUnlock}
    >
      {/* Vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.45) 100%)' }}
      />

      {/* Centred content */}
      <div className="flex-1 relative z-10 flex flex-col items-center justify-center select-none">
        {/* Clock */}
        <span
          className="font-display font-black leading-none text-white tabular-nums"
          style={{ fontSize: '3.4rem', textShadow: '0 3px 24px rgba(0,0,0,0.85)' }}
        >
          {timeStr}
        </span>

        {/* Date */}
        <span
          className="mt-1.5 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-white/40"
          style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}
        >
          {dateStr}
        </span>

        {/* Lock button */}
        <div className="mt-10 flex flex-col items-center gap-2.5">
          <div
            className="w-[48px] h-[48px] flex items-center justify-center rounded-full transition-all duration-200"
            style={{
              background: unlocking ? 'rgba(255,92,58,0.10)' : 'rgba(255,255,255,0.05)',
              border: unlocking ? '1px solid rgba(255,92,58,0.30)' : '1px solid rgba(255,255,255,0.10)',
              boxShadow: unlocking
                ? '0 0 24px rgba(255,92,58,0.30), 0 0 48px rgba(255,92,58,0.10)'
                : '0 2px 16px rgba(0,0,0,0.4)',
            }}
          >
            {unlocking
              ? <LockOpen size={20} className="text-primary" />
              : <Lock size={20} className="text-white/45" />
            }
          </div>

          <span
            className="font-mono text-[0.58rem] uppercase tracking-[0.14em]"
            style={{
              color: unlocking ? 'rgba(255,92,58,0.75)' : 'rgba(255,255,255,0.55)',
              textShadow: '0 1px 8px rgba(0,0,0,0.95)',
            }}
          >
            {unlocking ? 'Unlocking...' : 'Tap to unlock'}
          </span>
        </div>
      </div>
    </div>
  )
}
