import { useEffect, useRef, useState } from 'react'
import { useStore } from '../../store'
import { sendNui } from '../../nui'
import { useSound } from '../../useSound'
import GameCard from '../../components/GameCard'
import ResultOverlay from '../../components/ResultOverlay'

interface Cell {
  character: string
  isAnswer: boolean
}

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min)) + min
}

export default function Pattern(): React.ReactElement | null {
  const game = useStore((s) => s.game)
  const status = useStore((s) => s.status)
  const started = useStore((s) => s.started)
  const finish = useStore((s) => s.finish)
  const fail = useStore((s) => s.fail)
  const hide = useStore((s) => s.hide)
  const sound = useSound()

  const size = (game?.size as number) ?? 6
  const difficulty = (game?.difficulty as number) ?? 4
  const difficulty2 = (game?.difficulty2 as number) ?? 2
  const limit = (game?.limit as number) ?? 30000
  const countdown = (game?.countdown as number) ?? 0
  const charset = (game?.chance as string) ?? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

  const [count, setCount] = useState(countdown || -1)
  const [time, setTime] = useState(0)
  const [cells, setCells] = useState<Cell[]>([])
  const [answerCells, setAnswerCells] = useState<Cell[]>([])
  const [selected, setSelected] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [exiting, setExiting] = useState(false)
  const pressed = useRef(false)

  const total = size * 10

  useEffect(() => {
    pressed.current = false
    setCount(countdown || -1)
    setTime(0)
    setExiting(false)
    setSubmitting(false)

    const answerStart = rand(0, total)
    const arr: Cell[] = []
    for (let i = 0; i < total; i++) {
      const isAnswer =
        (i >= answerStart && i < answerStart + difficulty) ||
        (answerStart + difficulty >= total - 1 && i < answerStart + difficulty - total)
      let char = ''
      for (let j = 0; j < difficulty2; j++) {
        char += charset.charAt(rand(0, charset.length))
      }
      arr.push({ character: char, isAnswer })
    }
    setCells(arr)
    setAnswerCells(arr.filter((c) => c.isAnswer))
    setSelected(rand(0, total))
  }, [started, total, difficulty, difficulty2, charset, countdown])

  useEffect(() => {
    if (count < 0) return
    const id = window.setInterval(() => setCount((c) => c - 1), 1000)
    return () => window.clearInterval(id)
  }, [count])

  const active = status === 'playing' && count < 0 && !submitting

  // Time limit
  useEffect(() => {
    if (!active) return
    const tickRate = 50
    const id = window.setInterval(() => {
      setTime((t) => {
        const next = t + tickRate
        if (next >= limit && !pressed.current) {
          pressed.current = true
          void sendNui('Minigame:Finish', { state: 0 })
          sound('negative')
          fail()
        }
        return next
      })
    }, tickRate)
    return () => window.clearInterval(id)
  }, [active, limit, fail, sound])

  // Shift grid every 1.5s
  useEffect(() => {
    if (!active) return
    const id = window.setInterval(() => {
      setCells((cur) => cur.map((_, i, a) => a[(i + 1) % a.length]))
    }, 1500)
    return () => window.clearInterval(id)
  }, [active])

  const move = (delta: number) => {
    setSelected((s) => {
      let n = s + delta
      if (n >= total) n -= total
      else if (n < 0) n = total + n
      return n
    })
  }

  const submit = () => {
    if (!active || pressed.current) return
    setSubmitting(true)
    for (let i = 0; i < difficulty; i++) {
      const k = (selected + i) % total
      if (!cells[k]?.isAnswer) {
        pressed.current = true
        void sendNui('Minigame:Finish', { state: 0 })
        sound('negative')
        fail()
        return
      }
    }
    pressed.current = true
    void sendNui('Minigame:Finish', { state: 1 })
    sound('positive')
    finish()
  }

  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'w' || e.key === 'W') move(-10)
      else if (e.key === 's' || e.key === 'S') move(10)
      else if (e.key === 'a' || e.key === 'A') move(-1)
      else if (e.key === 'd' || e.key === 'D') move(1)
      else if (e.key === ' ' || e.key === 'Enter') submit()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, selected, cells])

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

  const pct = (time / limit) * 100
  const remaining = Math.max(0, 100 - pct)
  const barColor = pct < 33 ? 'bg-menu-success' : pct < 66 ? 'bg-menu-warning' : 'bg-primary'
  const readout =
    count >= 0 ? 'Booting' : active ? `${(Math.max(0, limit - time) / 1000).toFixed(1)}s` : ''

  const cardWidth = Math.max(560, 64 * 10 + 32)

  return (
    <GameCard
      title="Pattern Match"
      successTitle="Pattern Found"
      failTitle="Wrong Pattern"
      status={status}
      exiting={exiting}
      readout={readout}
      className="fixed inset-0 m-auto h-fit"
      style={{ width: cardWidth }}
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
          <div className="w-full h-[3px] bg-menu-bg mb-4 border border-white/5">
            <div
              className={`h-full ${
                status === 'finished' ? 'bg-menu-success' : status === 'failed' ? 'bg-primary' : barColor
              }`}
              style={{ width: `${remaining}%`, transition: 'none' }}
            />
          </div>

          {/* Answer target row */}
          <div className="mb-4">
            <div className="text-center mb-2 font-display font-bold uppercase tracking-[0.14em] text-[0.7rem] text-white/50">
              Find Pattern
            </div>
            <div className="flex justify-center gap-1">
              {answerCells.map((c, i) => (
                <div
                  key={i}
                  className="w-12 h-12 flex items-center justify-center bg-primary/10 border border-primary/40 font-mono text-[0.9rem] text-primary"
                >
                  {c.character}
                </div>
              ))}
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-10 gap-1 p-2 bg-menu-bg border border-white/5">
            {cells.map((c, i) => {
              const isSel =
                (i >= selected && i < selected + difficulty) ||
                (selected + difficulty >= total - 1 && i < selected + difficulty - total)
              return (
                <div
                  key={i}
                  className={`h-12 flex items-center justify-center border font-mono text-[0.85rem] ${
                    isSel ? 'border-primary/60 bg-primary/15 text-primary' : 'border-white/[0.06] text-white/55'
                  }`}
                  style={{ transition: 'none' }}
                >
                  {c.character}
                </div>
              )
            })}
          </div>

          <div className="mt-3 flex items-center justify-between font-mono text-[0.6rem] uppercase tracking-[0.1em] text-white/25">
            <span>WASD · move window</span>
            <span>Enter · submit</span>
          </div>

          <ResultOverlay status={status} successLabel="Pattern Found" failLabel="Wrong Pattern" />
        </div>
      )}
    </GameCard>
  )
}
