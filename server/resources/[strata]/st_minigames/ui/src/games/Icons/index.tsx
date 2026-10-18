import { useEffect, useRef, useState } from 'react'
import {
  Server,
  Monitor,
  Atom,
  Terminal,
  Binary,
  Code,
  GitBranch,
  GitCommit,
  Workflow,
  Share2 as CN,
  GitMerge,
  Cpu,
  Wrench,
  Split,
  Network,
  Shield,
  FileCode,
  GitPullRequest,
  Boxes,
  Brain,
  Bug,
  Barcode,
  Keyboard as KeyboardIcon,
  Laptop,
  Bluetooth,
  SatelliteDish,
  RadioTower,
  type LucideIcon,
} from 'lucide-react'
import { useStore } from '../../store'
import { sendNui } from '../../nui'
import { useSound } from '../../useSound'
import GameCard from '../../components/GameCard'
import ResultOverlay from '../../components/ResultOverlay'

const ICON_POOL: LucideIcon[] = [
  Server,
  Monitor,
  Atom,
  Terminal,
  Binary,
  Code,
  GitBranch,
  GitCommit,
  Workflow,
  CN,
  GitMerge,
  Cpu,
  Wrench,
  Split,
  Network,
  Shield,
  FileCode,
  GitPullRequest,
  Boxes,
  Brain,
  Bug,
  Barcode,
  KeyboardIcon,
  Laptop,
  Bluetooth,
  SatelliteDish,
  RadioTower,
]

interface ColorDef {
  color: string
  names: string[]
}

const COLORS: ColorDef[] = [
  { color: '#ef4444', names: ['red'] },
  { color: '#22c55e', names: ['green'] },
  { color: '#3b82f6', names: ['blue'] },
  { color: '#a855f7', names: ['purple'] },
  { color: '#f97316', names: ['orange'] },
  { color: '#eab308', names: ['yellow'] },
  { color: '#ffffff', names: ['white'] },
  { color: '#06b6d4', names: ['cyan'] },
  { color: '#9ca3af', names: ['grey', 'gray'] },
  { color: '#ec4899', names: ['pink'] },
  { color: '#6ee7b7', names: ['mint'] },
]

interface IconState {
  Icon: LucideIcon
  color: ColorDef
  solved: boolean
}

function sample<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export default function IconsGame(): React.ReactElement | null {
  const game = useStore((s) => s.game)
  const status = useStore((s) => s.status)
  const started = useStore((s) => s.started)
  const finish = useStore((s) => s.finish)
  const fail = useStore((s) => s.fail)
  const hide = useStore((s) => s.hide)
  const sound = useSound()

  const difficulty = (game?.difficulty as number) ?? 8
  const requiredCorrect = (game?.difficulty2 as number) ?? 8
  const shuffleRounds = (game?.timer as number) ?? 5
  const delayMs = (game?.delay as number) ?? 1500
  const limit = (game?.limit as number) ?? 15000
  const countdown = (game?.countdown as number) ?? 0

  type Phase = 'countdown' | 'shuffling' | 'delay' | 'input' | 'done'
  const [phase, setPhase] = useState<Phase>(countdown ? 'countdown' : 'shuffling')
  const [count, setCount] = useState(countdown || 0)
  const [shuffles, setShuffles] = useState(0)
  const [icons, setIcons] = useState<IconState[]>([])
  const [selected, setSelected] = useState<IconState | null>(null)
  const [correct, setCorrect] = useState(0)
  const [time, setTime] = useState(0)
  const [input, setInput] = useState('')
  const [exiting, setExiting] = useState(false)
  const pressed = useRef(false)

  const regen = () => {
    const pool = [...ICON_POOL]
    const next: IconState[] = []
    for (let i = 0; i < difficulty; i++) {
      const idx = Math.floor(Math.random() * pool.length)
      const Icon = pool.splice(idx, 1)[0]
      next.push({ Icon, color: sample(COLORS), solved: false })
    }
    setIcons(next)
    setSelected(next[Math.floor(Math.random() * next.length)])
  }

  useEffect(() => {
    pressed.current = false
    setPhase(countdown ? 'countdown' : 'shuffling')
    setCount(countdown || 0)
    setShuffles(0)
    setCorrect(0)
    setTime(0)
    setInput('')
    setExiting(false)
    regen()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, countdown, difficulty])

  useEffect(() => {
    if (phase !== 'countdown') return
    if (count <= 0) {
      setPhase('shuffling')
      return
    }
    const id = window.setTimeout(() => setCount((c) => c - 1), 1000)
    return () => window.clearTimeout(id)
  }, [phase, count])

  // Shuffle rounds
  useEffect(() => {
    if (phase !== 'shuffling') return
    if (shuffles >= shuffleRounds) {
      setPhase('delay')
      return
    }
    const id = window.setTimeout(() => {
      regen()
      setShuffles((s) => s + 1)
      sound('beep')
    }, 900)
    return () => window.clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, shuffles, shuffleRounds])

  // Delay before input
  useEffect(() => {
    if (phase !== 'delay') return
    const id = window.setTimeout(() => setPhase('input'), delayMs)
    return () => window.clearTimeout(id)
  }, [phase, delayMs])

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

  useEffect(() => {
    if (status !== 'finished' && status !== 'failed') return
    const t1 = window.setTimeout(() => setExiting(true), 1500)
    const t2 = window.setTimeout(() => hide(), 1800)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [status, hide])

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (phase !== 'input' || pressed.current || !selected) return
    const guess = input.trim().toLowerCase()
    if (!guess) return
    if (selected.color.names.includes(guess)) {
      const solvedIcon = selected
      const nextIcons = icons.map((i) =>
        i.Icon === solvedIcon.Icon ? { ...i, solved: true } : i,
      )
      const nextCorrect = correct + 1
      setCorrect(nextCorrect)
      setIcons(nextIcons)
      setInput('')
      sound('positive')
      if (nextCorrect >= requiredCorrect) {
        pressed.current = true
        void sendNui('Minigame:Finish', { state: 1 })
        finish()
        setPhase('done')
      } else {
        const unsolved = nextIcons.filter((i) => !i.solved)
        setSelected(unsolved[Math.floor(Math.random() * unsolved.length)])
      }
    } else {
      pressed.current = true
      void sendNui('Minigame:Finish', { state: 0 })
      sound('negative')
      fail()
      setPhase('done')
    }
  }

  if (!game) return null

  const pct = limit ? (time / limit) * 100 : 0
  const remaining = Math.max(0, 100 - pct)
  const barColor = pct < 33 ? 'bg-menu-success' : pct < 66 ? 'bg-menu-warning' : 'bg-primary'

  const readout =
    phase === 'countdown'
      ? 'Booting'
      : phase === 'shuffling'
      ? `Shuffle ${shuffles}/${shuffleRounds}`
      : phase === 'delay'
      ? 'Stand by'
      : phase === 'input' && limit
      ? `${(Math.max(0, limit - time) / 1000).toFixed(1)}s`
      : ''

  const SelectedIcon = selected?.Icon

  return (
    <GameCard
      title={phase === 'input' ? 'Identify Color' : 'Icons'}
      successTitle="All Identified"
      failTitle="Wrong Answer"
      status={status}
      exiting={exiting}
      readout={readout}
      className="fixed inset-0 m-auto w-[540px] h-fit"
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
          {phase === 'input' && limit > 0 && (
            <div className="w-full h-[3px] bg-menu-bg mb-3 border border-white/5">
              <div
                className={`h-full ${
                  status === 'finished' ? 'bg-menu-success' : status === 'failed' ? 'bg-primary' : barColor
                }`}
                style={{ width: `${remaining}%`, transition: 'none' }}
              />
            </div>
          )}

          <div className="grid grid-cols-4 gap-2 mb-4">
            {icons.map((ico, i) => {
              const Icon = ico.Icon
              return (
                <div
                  key={i}
                  className={`h-20 flex items-center justify-center border ${
                    ico.solved
                      ? 'bg-menu-success/15 border-menu-success/40'
                      : 'bg-menu-surface-lt border-white/[0.06]'
                  }`}
                >
                  <Icon size={44} color={ico.solved ? '#60eb50' : ico.color.color} strokeWidth={1.5} />
                </div>
              )
            })}
          </div>

          {phase === 'input' && SelectedIcon && selected && (
            <div className="flex flex-col items-center gap-3 py-2">
              <span className="font-display font-bold uppercase tracking-[0.14em] text-[0.7rem] text-white/50">
                Type this icon's color
              </span>
              <div className="flex items-center justify-center w-20 h-20 bg-menu-bg border-2 border-primary/50">
                <SelectedIcon size={56} color={selected.color.color} strokeWidth={1.5} />
              </div>
              <form onSubmit={onSubmit}>
                <input
                  autoFocus
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="color"
                  className="h-10 w-48 px-3 bg-menu-surface-lt border border-white/10 text-center font-mono text-[0.9rem] text-white placeholder-white/20 focus:border-primary/60"
                />
              </form>
            </div>
          )}

          <div className="mt-3 flex items-center justify-between font-mono text-[0.6rem] uppercase tracking-[0.1em] text-white/25">
            <span>
              {correct}/{requiredCorrect} solved
            </span>
            <span>Enter · submit</span>
          </div>

          <ResultOverlay status={status} successLabel="All Identified" failLabel="Wrong Answer" />
        </div>
      )}
    </GameCard>
  )
}
