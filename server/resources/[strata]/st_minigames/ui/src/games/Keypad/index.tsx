import { useEffect, useRef, useState } from 'react'
import { Delete, Check } from 'lucide-react'
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

export default function Keypad(): React.ReactElement | null {
  const game = useStore((s) => s.game)
  const status = useStore((s) => s.status)
  const started = useStore((s) => s.started)
  const finish = useStore((s) => s.finish)
  const fail = useStore((s) => s.fail)
  const hide = useStore((s) => s.hide)
  const sound = useSound()

  const limit = (game?.limit as number) ?? 0
  const countdown = (game?.countdown as number) ?? 0
  const difficulty = (game?.difficulty as number) ?? 4
  const mask = Boolean(game?.mask)
  const target = (game?.chance as number[]) ?? []

  const [time, setTime] = useState(0)
  const [count, setCount] = useState(countdown || -1)
  const [entered, setEntered] = useState<number[]>([])
  const [exiting, setExiting] = useState(false)
  const pressed = useRef(false)

  useEffect(() => {
    pressed.current = false
    setTime(0)
    setCount(countdown || -1)
    setEntered([])
    setExiting(false)
  }, [started, countdown])

  useEffect(() => {
    if (count < 0) return
    const id = window.setInterval(() => setCount((c) => c - 1), 1000)
    return () => window.clearInterval(id)
  }, [count])

  useEffect(() => {
    if (status !== 'playing' || count >= 0 || !limit) return
    const tickRate = 50
    const id = window.setInterval(() => {
      setTime((t) => {
        const next = t + tickRate
        if (next >= limit) {
          if (!pressed.current) {
            pressed.current = true
            void sendNui('Minigame:Finish', { state: 0 })
            sound('negative')
            fail()
          }
          return limit
        }
        return next
      })
    }, tickRate)
    return () => window.clearInterval(id)
  }, [status, count, limit, fail, sound])

  useEffect(() => {
    if (status !== 'finished' && status !== 'failed') return
    const t1 = window.setTimeout(() => setExiting(true), 1500)
    const t2 = window.setTimeout(() => hide(), 1800)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [status, hide])

  const locked = status !== 'playing' || count >= 0

  const onDigit = (d: number) => {
    if (locked || entered.length >= difficulty) return
    sound('beep')
    setEntered((e) => [...e, d])
  }

  const onBackspace = () => {
    if (locked || entered.length === 0) return
    sound('back')
    setEntered((e) => e.slice(0, -1))
  }

  const onSubmit = () => {
    if (locked || pressed.current) return
    if (entered.length < target.length) return
    pressed.current = true
    sound('confirm')
    if (eqNumArr(entered, target)) {
      void sendNui('Minigame:Finish', { state: 1, entered: entered.join('') })
      sound('positive')
      finish()
    } else {
      void sendNui('Minigame:Finish', { state: 0, entered: entered.join('') })
      sound('negative')
      fail()
    }
  }

  useEffect(() => {
    if (status !== 'playing' || count >= 0) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') onDigit(Number(e.key))
      else if (e.key === 'Backspace') onBackspace()
      else if (e.key === 'Enter') onSubmit()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, count, entered])

  if (!game) return null

  const pct = limit ? (time / limit) * 100 : 0
  const remaining = Math.max(0, 100 - pct)
  const barColor = pct < 33 ? 'bg-menu-success' : pct < 66 ? 'bg-menu-warning' : 'bg-primary'
  const slots = Array.from({ length: difficulty }, (_, i) => entered[i])

  return (
    <GameCard
      title="Keypad"
      successTitle="Access Granted"
      failTitle="Access Denied"
      status={status}
      exiting={exiting}
      readout={
        count >= 0
          ? 'Booting'
          : limit
          ? `${(Math.max(0, limit - time) / 1000).toFixed(1)}s`
          : `${entered.length}/${difficulty}`
      }
      className="fixed inset-0 m-auto w-[360px] h-fit"
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
          <div className="mb-3 flex items-center justify-center gap-2">
            {slots.map((d, i) => (
              <div
                key={i}
                className={`w-10 h-12 flex items-center justify-center border ${
                  d !== undefined
                    ? 'border-primary/40 bg-primary/10'
                    : 'border-white/10 bg-menu-bg'
                }`}
              >
                <span
                  className={`font-mono text-[1.5rem] leading-none ${
                    d !== undefined ? 'text-white' : 'text-white/15'
                  }`}
                >
                  {d === undefined ? '–' : mask ? '•' : d}
                </span>
              </div>
            ))}
          </div>

          {limit > 0 && (
            <div className="w-full h-[3px] bg-menu-bg mb-4 border border-white/5">
              <div
                className={`h-full ${
                  status === 'finished'
                    ? 'bg-menu-success'
                    : status === 'failed'
                    ? 'bg-primary'
                    : barColor
                }`}
                style={{ width: `${remaining}%`, transition: 'none' }}
              />
            </div>
          )}

          <div className="grid grid-cols-3 gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
              <button
                key={d}
                disabled={locked || entered.length >= difficulty}
                onClick={() => onDigit(d)}
                className="h-14 flex items-center justify-center bg-menu-surface-lt border border-white/[0.06] hover:bg-primary/10 hover:border-primary/40 disabled:opacity-25 disabled:pointer-events-none font-mono text-[1.3rem] text-white/85 transition-colors"
              >
                {d}
              </button>
            ))}
            <button
              disabled={locked || entered.length === 0}
              onClick={onBackspace}
              className="h-14 flex items-center justify-center bg-menu-surface-lt border border-menu-error-lt/25 hover:bg-menu-error/20 hover:border-menu-error-lt/50 disabled:opacity-25 disabled:pointer-events-none text-red-300/80 transition-colors"
            >
              <Delete size={18} />
            </button>
            <button
              disabled={locked || entered.length >= difficulty}
              onClick={() => onDigit(0)}
              className="h-14 flex items-center justify-center bg-menu-surface-lt border border-white/[0.06] hover:bg-primary/10 hover:border-primary/40 disabled:opacity-25 disabled:pointer-events-none font-mono text-[1.3rem] text-white/85 transition-colors"
            >
              0
            </button>
            <button
              disabled={locked || entered.length < target.length}
              onClick={onSubmit}
              className="h-14 flex items-center justify-center bg-menu-success/15 border border-menu-success/35 hover:bg-menu-success/25 hover:border-menu-success/60 disabled:opacity-25 disabled:pointer-events-none text-menu-success-lt transition-colors"
            >
              <Check size={20} />
            </button>
          </div>

          <div className="mt-3 flex items-center justify-between font-mono text-[0.6rem] uppercase tracking-[0.1em] text-white/25">
            <span>
              {entered.length}/{difficulty}
            </span>
            <span>Enter · Backspace · 0–9</span>
          </div>

          <ResultOverlay
            status={status}
            successLabel="Access Granted"
            failLabel="Access Denied"
          />
        </div>
      )}
    </GameCard>
  )
}
