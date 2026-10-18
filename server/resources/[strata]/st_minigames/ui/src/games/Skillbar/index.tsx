import { useEffect, useRef, useState } from 'react'
import { useStore } from '../../store'
import { sendNui } from '../../nui'
import GameCard from '../../components/GameCard'

export default function Skillbar(): React.ReactElement | null {
  const game = useStore((s) => s.game)
  const status = useStore((s) => s.status)
  const started = useStore((s) => s.started)
  const finish = useStore((s) => s.finish)
  const fail = useStore((s) => s.fail)
  const hide = useStore((s) => s.hide)

  const timer = (game?.timer as number) ?? 3000
  const difficulty = (game?.difficulty as number) ?? 10
  const chance = (game?.chance as number) ?? 50

  const [curr, setCurr] = useState(0)
  const [exiting, setExiting] = useState(false)
  const pressed = useRef(false)
  const tickMs = 5

  useEffect(() => {
    pressed.current = false
    setCurr(0)
    setExiting(false)
  }, [started])

  useEffect(() => {
    if (status !== 'playing') return
    const id = window.setInterval(() => {
      setCurr((c) => {
        const next = c + tickMs
        if (next > timer) {
          void sendNui('Minigame:Finish', { state: 0 })
          fail()
          return timer
        }
        return next
      })
    }, tickMs)
    return () => window.clearInterval(id)
  }, [status, timer, fail])

  useEffect(() => {
    if (status !== 'playing') return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'e' && e.key !== 'E') return
      if (pressed.current) return
      pressed.current = true
      const pct = Math.ceil((curr / timer) * 100)
      if (pct >= chance && pct <= chance + difficulty) {
        void sendNui('Minigame:Finish', { state: 1 })
        finish()
      } else {
        void sendNui('Minigame:Finish', { state: 0 })
        fail()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [status, curr, timer, chance, difficulty, finish, fail])

  useEffect(() => {
    if (status !== 'finished' && status !== 'failed') return
    const t1 = window.setTimeout(() => setExiting(true), 1200)
    const t2 = window.setTimeout(() => hide(), 1450)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [status, hide])

  if (!game) return null

  const pct = status === 'playing' ? (curr / timer) * 100 : 100
  const fillColor =
    status === 'failed'
      ? 'bg-menu-error-lt'
      : status === 'finished'
      ? 'bg-menu-success'
      : 'bg-white/80'

  return (
    <GameCard
      title="Skill Check"
      successTitle="Success"
      failTitle="Failed"
      status={status}
      exiting={exiting}
      readout={status === 'playing' ? `${(Math.max(0, timer - curr) / 1000).toFixed(2)}s` : ''}
      className="fixed left-0 right-0 bottom-[14%] mx-auto w-[440px]"
    >
      <div className="px-4 py-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center justify-center w-7 h-7 border border-primary/40 bg-primary/10 text-primary font-mono text-[0.75rem] font-semibold">
            E
          </div>
          <span className="font-medium uppercase tracking-[0.06em] text-[0.72rem] text-white/60">
            Press when the bar hits the marker
          </span>
        </div>

        <div className="relative w-full h-[10px] bg-menu-bg border border-white/10 overflow-hidden">
          {status === 'playing' && (
            <div
              className="absolute inset-y-0 bg-primary/25 border-l border-r border-primary/70"
              style={{
                left: `${chance - difficulty / 4}%`,
                width: `${difficulty}%`,
                boxShadow: 'inset 0 0 8px rgba(255,92,58,0.35)',
              }}
            />
          )}
          <div
            className={`absolute inset-y-0 left-0 ${fillColor}`}
            style={{ width: `${pct}%`, transition: 'none' }}
          />
          <div
            className="absolute inset-y-0 w-[2px] bg-white"
            style={{
              left: `${pct}%`,
              transform: 'translateX(-1px)',
              boxShadow: '0 0 6px rgba(255,255,255,0.7)',
              opacity: status === 'playing' ? 1 : 0,
              transition: 'none',
            }}
          />
        </div>
      </div>
    </GameCard>
  )
}
