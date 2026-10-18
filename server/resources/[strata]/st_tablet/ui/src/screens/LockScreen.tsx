import { useState } from 'react'
import { Lock, LockOpen, X, Wifi, BatteryMedium, Bell } from 'lucide-react'
import { useStore } from '../store'
import { sendNui } from '../nui'

const DAYS   = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function LockScreen(): React.ReactElement {
  const time          = useStore(s => s.time)
  const notifications = useStore(s => s.notifications)
  const dispatch      = useStore(s => s.dispatch)
  const [unlocking, setUnlocking] = useState(false)
  const [leaving,   setLeaving]   = useState(false)

  const unreadCount = notifications.filter(n => n.show).length

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation()
    dispatch('LAPTOP_NOT_VISIBLE')
    sendNui('CloseTablet')
  }

  const now     = new Date()
  const dateStr = `${DAYS[now.getDay()]}, ${MONTHS[now.getMonth()]} ${now.getDate()}`

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
      className={`absolute inset-0 z-20 flex flex-col cursor-pointer ${leaving ? 'animate-fade-out' : 'animate-fade-in'}`}
      onClick={handleUnlock}
    >
      {/* Status bar */}
      <div
        className="h-[48px] flex items-center px-5 gap-3 shrink-0 border-b border-white/[0.07] z-10"
        style={{ background: 'rgba(0,0,0,0.62)' }}
        onClick={e => e.stopPropagation()}
      >
        <span
          className="font-display font-black tracking-[0.1em] text-[1.05rem] select-none"
          style={{ background: 'linear-gradient(90deg, #FF5C3A, #FF8C42)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
        >
          STRATA
        </span>
        <span className="font-mono text-[0.65rem] text-white/25 uppercase tracking-[0.05em] select-none">
          / tablet
        </span>
        <div className="flex-1" />
        <span className="font-mono text-[0.82rem] text-white/60 tabular-nums select-none mr-1">
          {time ?? '--:--'}
        </span>
        <div className="flex items-center gap-2.5 h-8 px-3 border border-white/[0.08] bg-white/[0.03] text-white/50">
          <Wifi size={15} />
          <BatteryMedium size={18} />
        </div>
        <div className="relative w-8 h-8 flex items-center justify-center border border-white/[0.08] bg-white/[0.03] text-white/45">
          <Bell size={15} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[15px] h-[15px] flex items-center justify-center bg-primary text-white font-mono text-[0.46rem] rounded-full px-0.5 leading-none z-10">
              {unreadCount}
            </span>
          )}
        </div>
        <button
          onClick={handleClose}
          className="flex items-center gap-1.5 h-8 px-3 border border-white/[0.08] bg-white/[0.03] text-white/40 hover:text-white/70 transition-colors"
        >
          <X size={13} />
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.06em]">ESC</span>
        </button>
      </div>

      {/* Remaining area: vignette + centred content */}
      <div className="flex-1 relative flex flex-col items-center justify-center">
      {/* Vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.55) 100%)' }}
      />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center select-none">
        {/* Clock */}
        <span
          className="font-display font-black leading-none text-white tabular-nums"
          style={{ fontSize: '5.8rem', textShadow: '0 4px 40px rgba(0,0,0,0.85)' }}
        >
          {time ?? '--:--'}
        </span>

        {/* Date */}
        <span
          className="mt-2 font-mono text-[0.8rem] uppercase tracking-[0.22em] text-white/40"
          style={{ textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}
        >
          {dateStr}
        </span>

        {/* Lock button */}
        <div className="mt-14 flex flex-col items-center gap-3">
          <div
            className="w-[60px] h-[60px] flex items-center justify-center rounded-full transition-all duration-200"
            style={{
              background: unlocking ? 'rgba(255,92,58,0.10)' : 'rgba(255,255,255,0.05)',
              border: unlocking ? '1px solid rgba(255,92,58,0.30)' : '1px solid rgba(255,255,255,0.10)',
              boxShadow: unlocking
                ? '0 0 32px rgba(255,92,58,0.30), 0 0 64px rgba(255,92,58,0.10)'
                : '0 2px 20px rgba(0,0,0,0.4)',
            }}
          >
            {unlocking
              ? <LockOpen size={24} className="text-primary" />
              : <Lock size={24} className="text-white/45" />
            }
          </div>

          <span
            className="font-mono text-[0.68rem] uppercase tracking-[0.16em]"
            style={{ color: unlocking ? 'rgba(255,92,58,0.75)' : 'rgba(255,255,255,0.55)', textShadow: '0 1px 10px rgba(0,0,0,0.95)' }}
          >
            {unlocking ? 'Unlocking...' : 'Tap to unlock'}
          </span>
        </div>
      </div>

      </div>
    </div>
  )
}
