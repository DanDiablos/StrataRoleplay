import { useEffect, useRef, useState } from 'react'
import { useStore } from '../../store'
import { sendNui } from '../../nui'
import { useSound } from '../../useSound'
import GameCard from '../../components/GameCard'
import ResultOverlay from '../../components/ResultOverlay'

export default function Scanner(): React.ReactElement | null {
  const game = useStore((s) => s.game)
  const status = useStore((s) => s.status)
  const started = useStore((s) => s.started)
  const finish = useStore((s) => s.finish)
  const fail = useStore((s) => s.fail)
  const hide = useStore((s) => s.hide)
  const sound = useSound()

  const total = (game?.total as number) ?? 20
  const timer = (game?.timer as number) ?? 80
  const limit = (game?.limit as number) ?? 0
  const countdown = (game?.countdown as number) ?? 0
  const difficulty = (game?.difficulty as number) ?? 2
  const chance = (game?.chance as number) ?? Math.floor(total / 2)
  const keys = (game?.key as string[]) ?? ['e', 'E']
  const hasPerfect = Boolean(game?.events?.onPerfect)

  const [current, setCurrent] = useState<number>(1)
  const [dir, setDir] = useState<1 | -1>(1)
  const [time, setTime] = useState(0)
  const [count, setCount] = useState(countdown || -1)
  const [stopped, setStopped] = useState(false)
  const [exiting, setExiting] = useState(false)
  const pressed = useRef(false)

  useEffect(() => {
    pressed.current = false
    setTime(0)
    setCount(countdown || -1)
    setExiting(false)
    setStopped(false)
    const r = Math.max(1, Math.ceil(Math.random() * (total - 1)))
    setCurrent(r)
    setDir(r >= total - 1 ? -1 : 1)
  }, [started, total, countdown])

  useEffect(() => {
    if (count < 0) return
    const id = window.setInterval(() => setCount((c) => c - 1), 1000)
    return () => window.clearInterval(id)
  }, [count])

  useEffect(() => {
    if (status !== 'playing' || count >= 0 || stopped) return
    const id = window.setInterval(() => {
      setCurrent((c) => {
        let nextDir = dir
        if (c >= total) nextDir = -1
        else if (c <= 1) nextDir = 1
        if (nextDir !== dir) setDir(nextDir)
        return c + nextDir
      })
      setTime((t) => {
        const next = t + timer
        if (limit && next > limit && !pressed.current) {
          pressed.current = true
          void sendNui('Minigame:Finish', { state: 0 })
          sound('negative')
          fail()
        }
        return next
      })
    }, timer)
    return () => window.clearInterval(id)
  }, [status, count, stopped, dir, total, timer, limit, fail, sound])

  useEffect(() => {
    if (status !== 'playing' || count >= 0 || stopped) return
    const onKey = (e: KeyboardEvent) => {
      if (!keys.includes(e.key)) return
      if (pressed.current) return
      pressed.current = true
      setStopped(true)
      if (current >= chance - difficulty && current <= chance + difficulty) {
        const state = current === chance && hasPerfect ? 2 : 1
        void sendNui('Minigame:Finish', { state })
        sound('positive')
        finish()
      } else {
        void sendNui('Minigame:Finish', { state: 0 })
        sound('negative')
        fail()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [status, count, stopped, current, chance, difficulty, hasPerfect, keys, finish, fail, sound])

  useEffect(() => {
    if (status !== 'finished' && status !== 'failed') return
    const t1 = window.setTimeout(() => setExiting(true), 1500)
    const t2 = window.setTimeout(() => hide(), 1800)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [status, hide])

  if (!game) return null

  const keyLabel = (keys[0] ?? 'e').toUpperCase()

  return (
    <GameCard
      title="Signal Scanner"
      successTitle="Locked In"
      failTitle="Signal Lost"
      status={status}
      exiting={exiting}
      readout={
        count >= 0
          ? 'Booting'
          : limit
          ? `${(Math.max(0, limit - time) / 1000).toFixed(1)}s`
          : ''
      }
      className="fixed inset-0 m-auto w-[720px] h-fit"
    >
      {count >= 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-12">
          <span className="font-display font-bold uppercase tracking-[0.18em] text-[0.72rem] text-white/40">
            Preparing System
          </span>
          <span className="font-mono text-[4.5rem] leading-none text-primary [text-shadow:0_0_20px_rgba(255,92,58,0.45)]">
            {count === 0 ? '•' : count}
          </span>
        </div>
      ) : (
        <div className="relative p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-7 h-7 border border-primary/40 bg-primary/10 text-primary font-mono text-[0.75rem] font-semibold">
              {keyLabel}
            </div>
            <span className="font-medium uppercase tracking-[0.06em] text-[0.72rem] text-white/60">
              Press when cursor enters the zone
            </span>
          </div>

          <div className="flex gap-[3px] h-[110px] p-2 bg-menu-bg border border-white/5">
            {Array.from({ length: total }, (_, i) => {
              const idx = i + 1
              const isPerfect = idx === chance && hasPerfect
              const inZone = idx >= chance - difficulty && idx <= chance + difficulty
              const isActive = idx === current && !stopped
              const ended = status === 'finished' || status === 'failed'

              let barClass = 'bg-menu-surface-lt'
              if (isPerfect) barClass = 'bg-yellow-400/70'
              else if (inZone) barClass = 'bg-primary/35 border-x border-primary/60'

              if (isActive) barClass = 'bg-white'
              if (ended) barClass += ' opacity-50'

              return (
                <div
                  key={i}
                  className={`relative flex-1 h-full ${barClass}`}
                  style={{ transition: 'none' }}
                >
                  {inZone && idx === chance && !ended && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="font-mono text-[1.1rem] font-bold text-menu-bg [text-shadow:0_0_4px_rgba(255,255,255,0.4)]">
                        {keyLabel}
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="mt-3 flex items-center justify-between font-mono text-[0.6rem] uppercase tracking-[0.1em] text-white/25">
            <span>
              Cursor {current}/{total}
            </span>
            <span>
              Zone {chance - difficulty}–{chance + difficulty}
            </span>
          </div>

          <ResultOverlay status={status} successLabel="Locked In" failLabel="Signal Lost" />
        </div>
      )}
    </GameCard>
  )
}
