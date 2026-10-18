import { useEffect, useRef, useState } from 'react'
import { useStore } from '../../store'
import { sendNui } from '../../nui'
import { useSound } from '../../useSound'
import GameCard from '../../components/GameCard'
import ResultOverlay from '../../components/ResultOverlay'

function eqNumArr(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false
  return true
}

type Phase = 'countdown' | 'show' | 'input' | 'done'

export default function Sequencer(): React.ReactElement | null {
  const game = useStore((s) => s.game)
  const status = useStore((s) => s.status)
  const started = useStore((s) => s.started)
  const finish = useStore((s) => s.finish)
  const fail = useStore((s) => s.fail)
  const hide = useStore((s) => s.hide)
  const sound = useSound()

  const sequence = (game?.chance as number[]) ?? []
  const timer = (game?.timer as number) ?? 250
  const limit = (game?.limit as number) ?? 5000
  const countdown = (game?.countdown as number) ?? 0
  const hasPerfect = Boolean(game?.events?.onPerfect)

  const [phase, setPhase] = useState<Phase>(countdown ? 'countdown' : 'show')
  const [count, setCount] = useState(countdown || 0)
  const [shown, setShown] = useState<number[]>([])
  const [flash, setFlash] = useState<number | null>(null)
  const [entered, setEntered] = useState<number[]>([])
  const [time, setTime] = useState(0)
  const [exiting, setExiting] = useState(false)
  const pressed = useRef(false)

  useEffect(() => {
    pressed.current = false
    setPhase(countdown ? 'countdown' : 'show')
    setCount(countdown || 0)
    setShown([])
    setFlash(null)
    setEntered([])
    setTime(0)
    setExiting(false)
  }, [started, countdown])

  // Countdown tick
  useEffect(() => {
    if (phase !== 'countdown') return
    if (count <= 0) {
      setPhase('show')
      return
    }
    const id = window.setTimeout(() => setCount((c) => c - 1), 1000)
    return () => window.clearTimeout(id)
  }, [phase, count])

  // Show sequence — flash each in order, with a brief gap
  useEffect(() => {
    if (phase !== 'show') return
    if (shown.length >= sequence.length) {
      const id = window.setTimeout(() => {
        setFlash(null)
        setPhase('input')
      }, timer)
      return () => window.clearTimeout(id)
    }
    const next = sequence[shown.length]
    setFlash(next)
    sound('beep')
    const off = window.setTimeout(() => setFlash(null), Math.max(100, timer * 0.6))
    const advance = window.setTimeout(() => {
      setShown((s) => [...s, next])
    }, timer)
    return () => {
      window.clearTimeout(off)
      window.clearTimeout(advance)
    }
  }, [phase, shown, sequence, timer, sound])

  // Input timer
  useEffect(() => {
    if (phase !== 'input' || !limit) return
    const tickRate = 50
    const id = window.setInterval(() => {
      setTime((t) => {
        const next = t + tickRate
        if (next >= limit && !pressed.current) {
          pressed.current = true
          void sendNui('Minigame:Finish', { state: 0 })
          sound('negative')
          fail()
          setPhase('done')
        }
        return next
      })
    }, tickRate)
    return () => window.clearInterval(id)
  }, [phase, limit, fail, sound])

  // Auto-submit once sequence length entered
  useEffect(() => {
    if (phase !== 'input') return
    if (entered.length < sequence.length) return
    if (pressed.current) return
    pressed.current = true
    const pct = limit ? (time / limit) * 100 : 0
    if (eqNumArr(entered, sequence)) {
      const state = pct <= 25 && hasPerfect ? 2 : 1
      void sendNui('Minigame:Finish', { state })
      sound('positive')
      finish()
    } else {
      void sendNui('Minigame:Finish', { state: 0 })
      sound('negative')
      fail()
    }
    setPhase('done')
  }, [entered, sequence, phase, time, limit, hasPerfect, finish, fail, sound])

  useEffect(() => {
    if (status !== 'finished' && status !== 'failed') return
    const t1 = window.setTimeout(() => setExiting(true), 1500)
    const t2 = window.setTimeout(() => hide(), 1800)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [status, hide])

  const onBtn = (n: number) => {
    if (phase !== 'input') return
    if (entered.length >= sequence.length) return
    setFlash(n)
    sound('beep')
    window.setTimeout(() => setFlash(null), 120)
    setEntered((e) => [...e, n])
  }

  if (!game) return null

  const pct = limit ? (time / limit) * 100 : 0
  const remaining = Math.max(0, 100 - pct)
  const barColor = pct < 33 ? 'bg-menu-success' : pct < 66 ? 'bg-menu-warning' : 'bg-primary'

  const readout =
    phase === 'countdown'
      ? 'Booting'
      : phase === 'show'
      ? 'Watch'
      : phase === 'input' && limit
      ? `${(Math.max(0, limit - time) / 1000).toFixed(1)}s`
      : ''

  return (
    <GameCard
      title={phase === 'show' ? 'Memorize Sequence' : 'Repeat Sequence'}
      successTitle="Sequence Matched"
      failTitle="Sequence Failed"
      status={status}
      exiting={exiting}
      readout={readout}
      className="fixed inset-0 m-auto w-[420px] h-fit"
    >
      {phase === 'countdown' ? (
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
          {/* progress slots */}
          <div className="mb-3 flex items-center justify-center gap-1.5">
            {sequence.map((_, i) => {
              const active = phase === 'show' ? i < shown.length : i < entered.length
              return (
                <div
                  key={i}
                  className={`h-[6px] flex-1 ${active ? 'bg-primary' : 'bg-menu-surface-lt border border-white/5'}`}
                  style={{ transition: 'none' }}
                />
              )
            })}
          </div>

          {phase === 'input' && limit > 0 && (
            <div className="w-full h-[3px] bg-menu-bg mb-4 border border-white/5">
              <div
                className={`h-full ${
                  status === 'finished' ? 'bg-menu-success' : status === 'failed' ? 'bg-primary' : barColor
                }`}
                style={{ width: `${remaining}%`, transition: 'none' }}
              />
            </div>
          )}

          <div className="grid grid-cols-4 gap-1.5">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => {
              const active = flash === n
              const disabled = phase !== 'input'
              return (
                <button
                  key={n}
                  disabled={disabled}
                  onClick={() => onBtn(n)}
                  className={`h-14 flex items-center justify-center border font-mono text-[1.15rem] transition-colors ${
                    active
                      ? 'bg-primary/30 border-primary text-white [box-shadow:0_0_14px_rgba(255,92,58,0.55)]'
                      : 'bg-menu-surface-lt border-white/[0.06] text-white/70 hover:bg-primary/10 hover:border-primary/40 disabled:opacity-40 disabled:pointer-events-none'
                  }`}
                >
                  {n}
                </button>
              )
            })}
          </div>

          <div className="mt-3 flex items-center justify-between font-mono text-[0.6rem] uppercase tracking-[0.1em] text-white/25">
            <span>
              {phase === 'show'
                ? `Showing ${shown.length}/${sequence.length}`
                : `${entered.length}/${sequence.length}`}
            </span>
            <span>{phase === 'show' ? 'Watch the grid' : 'Click in order'}</span>
          </div>

          <ResultOverlay status={status} successLabel="Sequence Matched" failLabel="Sequence Failed" />
        </div>
      )}
    </GameCard>
  )
}
