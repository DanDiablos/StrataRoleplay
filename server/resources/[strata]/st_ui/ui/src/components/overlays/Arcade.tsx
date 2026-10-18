import { useState, useEffect } from 'react'
import { useStore } from '../../store.ts'

function formatTime(ms: number): string {
  if (ms <= 0) return '0:00'
  const totalSec = Math.ceil(ms / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function Arcade(): React.ReactElement | null {
  const showing = useStore(s => s.arcadeShowing)
  const matchInfo = useStore(s => s.arcadeMatchInfo)
  const team1 = useStore(s => s.arcadeTeam1)
  const team2 = useStore(s => s.arcadeTeam2)

  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    if (!showing) return
    const id = setInterval(() => setNow(Date.now()), 500)
    return () => clearInterval(id)
  }, [showing])

  if (!showing || !matchInfo.matchEnd) return null

  const remaining = matchInfo.matchEnd - now

  return (
    <div
      className="fixed pointer-events-none"
      style={{ top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 20 }}
    >
      <div
        className="flex items-center gap-6 px-6 py-3 border"
        style={{
          background: 'rgba(10,10,10,0.9)',
          borderColor: 'rgba(255,255,255,0.08)',
        }}
      >
        {/* Team 1 */}
        <div className="text-center">
          <span className="font-display font-bold text-[0.68rem] text-white/40 uppercase block">Team 1</span>
          <span className="font-mono text-[1.4rem] text-white/90">
            {team1.current}<span className="text-white/30 text-[0.8rem]">/{team1.max}</span>
          </span>
        </div>

        {/* Timer */}
        <div className="text-center">
          <span className="font-display font-bold text-[0.62rem] text-primary uppercase tracking-wider block">
            {matchInfo.matchLabel}
          </span>
          <span className="font-mono text-[1.1rem] text-white/70">{formatTime(remaining)}</span>
        </div>

        {/* Team 2 */}
        <div className="text-center">
          <span className="font-display font-bold text-[0.68rem] text-white/40 uppercase block">Team 2</span>
          <span className="font-mono text-[1.4rem] text-white/90">
            {team2.current}<span className="text-white/30 text-[0.8rem]">/{team2.max}</span>
          </span>
        </div>
      </div>
    </div>
  )
}
