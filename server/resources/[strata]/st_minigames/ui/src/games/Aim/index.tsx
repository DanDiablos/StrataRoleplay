import { useEffect, useRef, useState } from 'react'
import { useStore } from '../../store'
import { sendNui } from '../../nui'
import { useSound } from '../../useSound'
import GameCard from '../../components/GameCard'

interface Target {
  id: number
  x: number
  y: number
  born: number
  vx?: number
  vy?: number
}

const FIELD_W = 760
const FIELD_H = 440

export default function Aim(): React.ReactElement | null {
  const game = useStore((s) => s.game)
  const status = useStore((s) => s.status)
  const started = useStore((s) => s.started)
  const finish = useStore((s) => s.finish)
  const fail = useStore((s) => s.fail)
  const hide = useStore((s) => s.hide)
  const sound = useSound()

  const countdown = (game?.countdown as number) ?? 0
  const spawnMs = (game?.timer as number) ?? 1000
  const growStep = (game?.difficulty as number) ?? 25
  const maxSize = (game?.maxSize as number) ?? 75
  const minSize = (game?.size as number) ?? 25
  const limit = (game?.limit as number) ?? 10000
  const requiredAccuracy = (game?.accuracy as number) ?? 50
  const isMoving = Boolean(game?.isMoving)
  const hasPerfect = Boolean(game?.events?.onPerfect)

  const [count, setCount] = useState(countdown || -1)
  const [time, setTime] = useState(0)
  const [targets, setTargets] = useState<Target[]>([])
  const [hits, setHits] = useState(0)
  const [missed, setMissed] = useState(0)
  const [exiting, setExiting] = useState(false)
  const pressed = useRef(false)
  const nextId = useRef(0)

  useEffect(() => {
    pressed.current = false
    nextId.current = 0
    setCount(countdown || -1)
    setTime(0)
    setTargets([])
    setHits(0)
    setMissed(0)
    setExiting(false)
  }, [started, countdown])

  useEffect(() => {
    if (count < 0) return
    const id = window.setInterval(() => setCount((c) => c - 1), 1000)
    return () => window.clearInterval(id)
  }, [count])

  const active = status === 'playing' && count < 0

  // Main time tick
  useEffect(() => {
    if (!active) return
    const tickRate = 50
    const id = window.setInterval(() => {
      setTime((t) => {
        const next = t + tickRate
        if (next >= limit && !pressed.current) {
          pressed.current = true
          const total = hits + missed
          const accuracy = total > 0 ? Math.floor((hits / total) * 100) : 0
          if (accuracy >= requiredAccuracy) {
            const state = accuracy === 100 && hasPerfect ? 2 : 1
            void sendNui('Minigame:Finish', { state })
            sound('positive')
            finish()
          } else {
            void sendNui('Minigame:Finish', { state: 0 })
            sound('negative')
            fail()
          }
        }
        return next
      })
    }, tickRate)
    return () => window.clearInterval(id)
  }, [active, limit, hits, missed, requiredAccuracy, hasPerfect, finish, fail, sound])

  // Spawn targets
  useEffect(() => {
    if (!active) return
    const spawn = () => {
      const id = nextId.current++
      setTargets((cur) => [
        ...cur,
        {
          id,
          x: 20 + Math.random() * (FIELD_W - 120),
          y: 20 + Math.random() * (FIELD_H - 120),
          born: Date.now(),
          vx: isMoving ? (Math.random() - 0.5) * 60 : 0,
          vy: isMoving ? (Math.random() - 0.5) * 60 : 0,
        },
      ])
    }
    spawn()
    const id = window.setInterval(spawn, spawnMs)
    return () => window.clearInterval(id)
  }, [active, spawnMs, isMoving])

  // Grow / cull targets
  useEffect(() => {
    if (!active) return
    const growRate = 50
    const stepPct = growRate / growStep
    const id = window.setInterval(() => {
      setTargets((cur) => {
        const now = Date.now()
        const remaining: Target[] = []
        let newlyMissed = 0
        for (const t of cur) {
          const elapsed = now - t.born
          const growthMs = maxSize * growStep
          if (elapsed >= growthMs) {
            newlyMissed++
          } else {
            remaining.push(t)
          }
        }
        if (newlyMissed > 0) setMissed((m) => m + newlyMissed)
        // stepPct silences linter — growth based on born time, not state
        return stepPct > 0 ? remaining : remaining
      })
    }, growRate)
    return () => window.clearInterval(id)
  }, [active, growStep, maxSize])

  useEffect(() => {
    if (status !== 'finished' && status !== 'failed') return
    const t1 = window.setTimeout(() => setExiting(true), 1500)
    const t2 = window.setTimeout(() => hide(), 1800)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [status, hide])

  const onTargetClick = (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    if (!active) return
    sound('beep')
    setHits((h) => h + 1)
    setTargets((cur) => cur.filter((t) => t.id !== id))
  }

  const onFieldClick = () => {
    if (!active) return
    sound('negative')
    setMissed((m) => m + 1)
  }

  if (!game) return null

  const total = hits + missed
  const accuracy = total > 0 ? Math.floor((hits / total) * 100) : 0
  const pct = (time / limit) * 100
  const remaining = Math.max(0, 100 - pct)
  const barColor = pct < 33 ? 'bg-menu-success' : pct < 66 ? 'bg-menu-warning' : 'bg-primary'

  return (
    <GameCard
      title="Aim Training"
      successTitle="Target Verified"
      failTitle="Too Many Misses"
      status={status}
      exiting={exiting}
      readout={
        count >= 0
          ? 'Booting'
          : active
          ? `${(Math.max(0, limit - time) / 1000).toFixed(1)}s`
          : ''
      }
      className="fixed inset-0 m-auto w-fit h-fit"
    >
      {count >= 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-12 px-16">
          <span className="font-display font-bold uppercase tracking-[0.18em] text-[0.72rem] text-white/40">
            Preparing System
          </span>
          <span className="font-mono text-[4.5rem] leading-none text-primary [text-shadow:0_0_20px_rgba(255,92,58,0.45)]">
            {count === 0 ? '•' : count}
          </span>
        </div>
      ) : (
        <div className="p-4">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex gap-4 font-mono text-[0.7rem] uppercase tracking-[0.08em] text-white/50">
              <span>
                Hits <span className="text-menu-success-lt">{hits}</span>
              </span>
              <span>
                Miss <span className="text-red-300/80">{missed}</span>
              </span>
              <span>
                Acc{' '}
                <span className={accuracy >= requiredAccuracy ? 'text-menu-success-lt' : 'text-primary'}>
                  {accuracy}%
                </span>
              </span>
              <span className="text-white/30">Target {requiredAccuracy}%</span>
            </div>
          </div>

          <div className="w-full h-[3px] bg-menu-bg mb-3 border border-white/5">
            <div
              className={`h-full ${
                status === 'finished' ? 'bg-menu-success' : status === 'failed' ? 'bg-primary' : barColor
              }`}
              style={{ width: `${remaining}%`, transition: 'none' }}
            />
          </div>

          <div
            className="relative bg-menu-bg border border-white/5 overflow-hidden cursor-crosshair"
            style={{ width: FIELD_W, height: FIELD_H }}
            onClick={onFieldClick}
          >
            {targets.map((t) => (
              <AimTarget
                key={t.id}
                target={t}
                growStep={growStep}
                minSize={minSize}
                maxSize={maxSize}
                onClick={(e) => onTargetClick(e, t.id)}
              />
            ))}
          </div>
        </div>
      )}
    </GameCard>
  )
}

function AimTarget({
  target,
  growStep,
  minSize,
  maxSize,
  onClick,
}: {
  target: Target
  growStep: number
  minSize: number
  maxSize: number
  onClick: (e: React.MouseEvent) => void
}): React.ReactElement {
  const [, tick] = useState(0)
  useEffect(() => {
    const id = window.setInterval(() => tick((n) => n + 1), 50)
    return () => window.clearInterval(id)
  }, [])

  const elapsed = Date.now() - target.born
  const steps = Math.floor(elapsed / growStep)
  const size = Math.min(maxSize, minSize + steps)

  return (
    <div
      onClick={onClick}
      className="absolute rounded-full bg-primary/30 border-2 border-primary cursor-pointer"
      style={{
        left: target.x,
        top: target.y,
        width: size,
        height: size,
        transform: 'translate(-50%, -50%)',
        boxShadow: '0 0 12px rgba(255,92,58,0.35)',
      }}
    />
  )
}
