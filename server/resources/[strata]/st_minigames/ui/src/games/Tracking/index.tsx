import { useEffect, useRef, useState } from 'react'
import { useStore } from '../../store'
import { sendNui } from '../../nui'
import { useSound } from '../../useSound'
import GameCard from '../../components/GameCard'
import ResultOverlay from '../../components/ResultOverlay'

interface Target {
  id: number
  x: number
  y: number
  color: string
  targetX: number
  targetY: number
  duration: number
  startedAt: number
}

const COLORS = [
  '#00ffff',
  '#2dd4bf',
  '#708fae',
  '#7392b2',
  '#6394ed',
  '#1e90ff',
  '#0047ab',
  '#818cf8',
  '#a78bfa',
]

const FIELD_W = 900
const FIELD_H = 520
const TARGET_SIZE = 84

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min)) + min
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

type Phase = 'countdown' | 'preview' | 'hunt' | 'done'

export default function Tracking(): React.ReactElement | null {
  const game = useStore((s) => s.game)
  const status = useStore((s) => s.status)
  const started = useStore((s) => s.started)
  const finish = useStore((s) => s.finish)
  const fail = useStore((s) => s.fail)
  const hide = useStore((s) => s.hide)
  const sound = useSound()

  const difficulty = (game?.difficulty as number) ?? 3
  const previewMs = (game?.delay as number) ?? 1500
  const limit = (game?.limit as number) ?? 15000
  const countdown = (game?.countdown as number) ?? 0
  const hasPerfect = Boolean(game?.events?.onPerfect)

  const [phase, setPhase] = useState<Phase>(countdown ? 'countdown' : 'preview')
  const [count, setCount] = useState(countdown || 0)
  const [targets, setTargets] = useState<Target[]>([])
  const [entered, setEntered] = useState(0)
  const [time, setTime] = useState(0)
  const [exiting, setExiting] = useState(false)
  const [, forceTick] = useState(0)
  const pressed = useRef(false)

  useEffect(() => {
    pressed.current = false
    setPhase(countdown ? 'countdown' : 'preview')
    setCount(countdown || 0)
    setEntered(0)
    setTime(0)
    setExiting(false)

    const colors = shuffle(COLORS)
    const now = Date.now()
    const ts: Target[] = Array.from({ length: difficulty }, (_, i) => {
      const x = rand(20, FIELD_W - TARGET_SIZE - 20)
      const y = rand(20, FIELD_H - TARGET_SIZE - 20)
      return {
        id: i + 1,
        x,
        y,
        color: colors[i % colors.length],
        targetX: rand(20, FIELD_W - TARGET_SIZE - 20),
        targetY: rand(20, FIELD_H - TARGET_SIZE - 20),
        duration: rand(1500, 3500),
        startedAt: now,
      }
    })
    setTargets(ts)
  }, [started, difficulty, countdown])

  useEffect(() => {
    if (phase !== 'countdown') return
    if (count <= 0) {
      setPhase('preview')
      return
    }
    const id = window.setTimeout(() => setCount((c) => c - 1), 1000)
    return () => window.clearTimeout(id)
  }, [phase, count])

  // Preview → Hunt transition
  useEffect(() => {
    if (phase !== 'preview') return
    const id = window.setTimeout(() => setPhase('hunt'), previewMs)
    return () => window.clearTimeout(id)
  }, [phase, previewMs])

  // Movement ticker — advance positions each frame; when a target reaches its dest, pick a new one
  useEffect(() => {
    if (phase !== 'preview' && phase !== 'hunt') return
    const id = window.setInterval(() => {
      setTargets((cur) => {
        const now = Date.now()
        return cur.map((t) => {
          if (now - t.startedAt >= t.duration) {
            return {
              ...t,
              x: t.targetX,
              y: t.targetY,
              targetX: rand(20, FIELD_W - TARGET_SIZE - 20),
              targetY: rand(20, FIELD_H - TARGET_SIZE - 20),
              duration: rand(1500, 3500),
              startedAt: now,
            }
          }
          return t
        })
      })
      forceTick((n) => n + 1)
    }, 60)
    return () => window.clearInterval(id)
  }, [phase])

  // Hunt timer
  useEffect(() => {
    if (phase !== 'hunt' || !limit) return
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

  const onClickTarget = (id: number) => {
    if (phase !== 'hunt' || pressed.current) return
    if (id === entered + 1) {
      sound('beep')
      const nextEntered = id
      setEntered(nextEntered)
      if (nextEntered >= difficulty) {
        pressed.current = true
        const state = hasPerfect ? 2 : 1
        void sendNui('Minigame:Finish', { state })
        sound('positive')
        finish()
        setPhase('done')
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

  const pct = (time / limit) * 100
  const remaining = Math.max(0, 100 - pct)
  const barColor = pct < 33 ? 'bg-menu-success' : pct < 66 ? 'bg-menu-warning' : 'bg-primary'

  const readout =
    phase === 'countdown'
      ? 'Booting'
      : phase === 'preview'
      ? 'Memorize'
      : phase === 'hunt' && limit
      ? `${(Math.max(0, limit - time) / 1000).toFixed(1)}s`
      : ''

  return (
    <GameCard
      title={phase === 'preview' ? 'Memorize Order' : 'Track Targets'}
      successTitle="Targets Secured"
      failTitle="Tracking Failed"
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
          <div className="flex items-center justify-between mb-3 px-1 font-mono text-[0.7rem] uppercase tracking-[0.08em] text-white/50">
            <span>
              Click next:{' '}
              <span className="text-primary">{Math.min(entered + 1, difficulty)}</span>
            </span>
            <span>
              Progress{' '}
              <span className="text-menu-success-lt">
                {entered}/{difficulty}
              </span>
            </span>
          </div>

          <div className="w-full h-[3px] bg-menu-bg mb-3 border border-white/5">
            {phase === 'preview' ? (
              <div className="h-full bg-primary/70 w-full" style={{ transition: 'none' }} />
            ) : (
              <div
                className={`h-full ${
                  status === 'finished' ? 'bg-menu-success' : status === 'failed' ? 'bg-primary' : barColor
                }`}
                style={{ width: `${remaining}%`, transition: 'none' }}
              />
            )}
          </div>

          <div
            className="relative bg-menu-bg border border-white/5 overflow-hidden"
            style={{ width: FIELD_W, height: FIELD_H }}
          >
            {targets.map((t) => {
              const done = entered >= t.id
              return (
                <div
                  key={t.id}
                  onClick={() => onClickTarget(t.id)}
                  className={`absolute flex items-center justify-center border-2 cursor-pointer font-display font-bold text-[1.6rem] ${
                    done
                      ? 'bg-menu-success/25 border-menu-success/60 text-menu-success-lt'
                      : 'text-white/85'
                  }`}
                  style={{
                    left: t.targetX,
                    top: t.targetY,
                    width: TARGET_SIZE,
                    height: TARGET_SIZE,
                    background: done ? undefined : `${t.color}33`,
                    borderColor: done ? undefined : `${t.color}`,
                    transition: `left ${t.duration}ms linear, top ${t.duration}ms linear`,
                    boxShadow: `0 0 14px ${done ? '#52984a80' : t.color + '55'}`,
                  }}
                >
                  {phase === 'preview' ? t.id : done ? '✓' : ''}
                </div>
              )
            })}
          </div>

          <ResultOverlay status={status} successLabel="Targets Secured" failLabel="Tracking Failed" />
        </div>
      )}
    </GameCard>
  )
}
