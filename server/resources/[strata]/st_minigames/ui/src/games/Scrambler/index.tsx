import { useEffect, useRef, useState } from 'react'
import { useStore } from '../../store'
import { sendNui } from '../../nui'
import { useSound } from '../../useSound'
import GameCard from '../../components/GameCard'
import ResultOverlay from '../../components/ResultOverlay'

type Phase = 'countdown' | 'input' | 'done'

function shuffle(n: number): number[] {
  const arr = Array.from({ length: n }, (_, i) => i + 1)
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export default function Scrambler(): React.ReactElement | null {
  const game = useStore((s) => s.game)
  const status = useStore((s) => s.status)
  const started = useStore((s) => s.started)
  const finish = useStore((s) => s.finish)
  const fail = useStore((s) => s.fail)
  const hide = useStore((s) => s.hide)
  const sound = useSound()

  const difficulty = (game?.difficulty as number) ?? 12
  const reshuffleMs = (game?.timer as number) ?? 3000
  const limit = (game?.limit as number) ?? 0
  const countdown = (game?.countdown as number) ?? 0
  const maxStrikes = (game?.chance as number) ?? 3
  const hasPerfect = Boolean(game?.events?.onPerfect)

  const [phase, setPhase] = useState<Phase>(countdown ? 'countdown' : 'input')
  const [count, setCount] = useState(countdown || 0)
  const [sequence, setSequence] = useState<number[]>(() => shuffle(difficulty))
  const [reshuffleLeft, setReshuffleLeft] = useState(reshuffleMs)
  const [time, setTime] = useState(0)
  const [next, setNext] = useState(1)
  const [strikes, setStrikes] = useState(0)
  const [exiting, setExiting] = useState(false)
  const pressed = useRef(false)

  useEffect(() => {
    pressed.current = false
    setPhase(countdown ? 'countdown' : 'input')
    setCount(countdown || 0)
    setSequence(shuffle(difficulty))
    setReshuffleLeft(reshuffleMs)
    setTime(0)
    setNext(1)
    setStrikes(0)
    setExiting(false)
  }, [started, difficulty, countdown, reshuffleMs])

  useEffect(() => {
    if (phase !== 'countdown') return
    if (count <= 0) {
      setPhase('input')
      return
    }
    const id = window.setTimeout(() => setCount((c) => c - 1), 1000)
    return () => window.clearTimeout(id)
  }, [phase, count])

  // Reshuffle timer
  useEffect(() => {
    if (phase !== 'input') return
    const tickRate = 50
    const id = window.setInterval(() => {
      setReshuffleLeft((t) => {
        const nextT = t - tickRate
        if (nextT <= 0) {
          setSequence(shuffle(difficulty))
          return reshuffleMs
        }
        return nextT
      })
    }, tickRate)
    return () => window.clearInterval(id)
  }, [phase, reshuffleMs, difficulty])

  // Overall time limit
  useEffect(() => {
    if (phase !== 'input' || !limit) return
    const tickRate = 50
    const id = window.setInterval(() => {
      setTime((t) => {
        const nextT = t + tickRate
        if (nextT >= limit && !pressed.current) {
          pressed.current = true
          void sendNui('Minigame:Finish', { state: 0 })
          sound('negative')
          fail()
          setPhase('done')
        }
        return nextT
      })
    }, tickRate)
    return () => window.clearInterval(id)
  }, [phase, limit, fail, sound])

  useEffect(() => {
    if (status !== 'finished' && status !== 'failed') return
    const t1 = window.setTimeout(() => setExiting(true), 1500)
    const t2 = window.setTimeout(() => hide(), 1800)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [status, hide])

  const onBtn = (digit: number) => {
    if (phase !== 'input' || pressed.current) return
    if (digit === next) {
      sound('beep')
      const newNext = next + 1
      if (newNext > difficulty) {
        pressed.current = true
        const state = strikes === 0 && hasPerfect ? 2 : 1
        void sendNui('Minigame:Finish', { state })
        sound('positive')
        finish()
        setPhase('done')
      } else {
        setNext(newNext)
      }
    } else {
      const nextStrikes = strikes + 1
      sound('negative')
      if (nextStrikes >= maxStrikes) {
        pressed.current = true
        setStrikes(nextStrikes)
        void sendNui('Minigame:Finish', { state: 0 })
        fail()
        setPhase('done')
      } else {
        setStrikes(nextStrikes)
      }
    }
  }

  if (!game) return null

  const pct = limit ? (time / limit) * 100 : 0
  const remaining = Math.max(0, 100 - pct)
  const barColor = pct < 33 ? 'bg-menu-success' : pct < 66 ? 'bg-menu-warning' : 'bg-primary'

  const readout =
    phase === 'countdown'
      ? 'Booting'
      : phase === 'input' && limit
      ? `${(Math.max(0, limit - time) / 1000).toFixed(1)}s`
      : ''

  // Grid cols: fit square-ish layout
  const gridCols = difficulty <= 9 ? 3 : difficulty <= 16 ? 4 : 5

  return (
    <GameCard
      title="Scrambler"
      successTitle="Sequence Solved"
      failTitle="Too Many Errors"
      status={status}
      exiting={exiting}
      readout={readout}
      className="fixed inset-0 m-auto w-fit h-fit"
    >
      {phase === 'countdown' ? (
        <div className="flex flex-col items-center justify-center gap-3 py-12 px-16">
          <span className="font-display font-bold uppercase tracking-[0.18em] text-[0.72rem] text-white/40">
            Preparing System
          </span>
          <span className="font-mono text-[4.5rem] leading-none text-primary [text-shadow:0_0_20px_rgba(255,92,58,0.45)]">
            {count === 0 ? '•' : count}
          </span>
        </div>
      ) : (
        <div className="relative p-4">
          <div className="flex gap-1 mb-3">
            {Array.from({ length: maxStrikes }, (_, i) => (
              <div
                key={i}
                className={`flex-1 h-[6px] border ${
                  i < strikes
                    ? 'bg-menu-error-lt/70 border-menu-error-lt/60'
                    : 'bg-menu-surface-lt border-white/5'
                }`}
                style={{ transition: 'none' }}
              />
            ))}
          </div>

          {limit > 0 && (
            <div className="w-full h-[3px] bg-menu-bg mb-2 border border-white/5">
              <div
                className={`h-full ${
                  status === 'finished' ? 'bg-menu-success' : status === 'failed' ? 'bg-primary' : barColor
                }`}
                style={{ width: `${remaining}%`, transition: 'none' }}
              />
            </div>
          )}

          <div
            className="grid gap-1.5"
            style={{ gridTemplateColumns: `repeat(${gridCols}, 60px)` }}
          >
            {sequence.map((digit) => {
              const done = digit < next
              const isNext = digit === next
              let cls = 'bg-menu-surface-lt border-white/10 text-white/85 hover:bg-primary/10 hover:border-primary/40'
              if (done) cls = 'bg-menu-success/25 border-menu-success/50 text-menu-success-lt'
              else if (isNext) cls = 'bg-primary/15 border-primary/50 text-white'

              return (
                <button
                  key={digit}
                  disabled={done || phase !== 'input'}
                  onClick={() => onBtn(digit)}
                  className={`h-14 flex items-center justify-center border font-mono text-[1.15rem] transition-colors ${cls} disabled:pointer-events-none`}
                >
                  {digit}
                </button>
              )
            })}
          </div>

          {/* Reshuffle timer */}
          <div className="mt-3 w-full h-[2px] bg-menu-bg border border-white/5">
            <div
              className="h-full bg-white/30"
              style={{ width: `${(reshuffleLeft / reshuffleMs) * 100}%`, transition: 'none' }}
            />
          </div>

          <div className="mt-2 flex items-center justify-between font-mono text-[0.6rem] uppercase tracking-[0.1em] text-white/25">
            <span>
              {next - 1}/{difficulty}
            </span>
            <span>Click in order · reshuffles</span>
          </div>

          <ResultOverlay status={status} successLabel="Sequence Solved" failLabel="Too Many Errors" />
        </div>
      )}
    </GameCard>
  )
}
