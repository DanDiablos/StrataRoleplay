import { useEffect, useRef, useState } from 'react'
import { useStore } from '../../store'
import { sendNui } from '../../nui'
import { useSound } from '../../useSound'
import GameCard from '../../components/GameCard'
import ResultOverlay from '../../components/ResultOverlay'

type Phase = 'countdown' | 'preview' | 'input' | 'done'

export default function Memory(): React.ReactElement | null {
  const game = useStore((s) => s.game)
  const status = useStore((s) => s.status)
  const started = useStore((s) => s.started)
  const finish = useStore((s) => s.finish)
  const fail = useStore((s) => s.fail)
  const hide = useStore((s) => s.hide)
  const sound = useSound()

  const targets = (game?.chance as number[]) ?? []
  const cols = (game?.cols as number) ?? 3
  const rows = (game?.rows as number) ?? 3
  const maxErrors = (game?.errors as number) ?? 3
  const previewMs = (game?.timer as number) ?? 3000
  const limit = (game?.limit as number) ?? 0
  const countdown = (game?.countdown as number) ?? 0
  const hasPerfect = Boolean(game?.events?.onPerfect)

  const [phase, setPhase] = useState<Phase>(countdown ? 'countdown' : 'preview')
  const [count, setCount] = useState(countdown || 0)
  const [previewLeft, setPreviewLeft] = useState(previewMs)
  const [time, setTime] = useState(0)
  const [entered, setEntered] = useState<number[]>([])
  const [strikes, setStrikes] = useState<number[]>([])
  const [exiting, setExiting] = useState(false)
  const pressed = useRef(false)

  useEffect(() => {
    pressed.current = false
    setPhase(countdown ? 'countdown' : 'preview')
    setCount(countdown || 0)
    setPreviewLeft(previewMs)
    setTime(0)
    setEntered([])
    setStrikes([])
    setExiting(false)
  }, [started, countdown, previewMs])

  useEffect(() => {
    if (phase !== 'countdown') return
    if (count <= 0) {
      setPhase('preview')
      return
    }
    const id = window.setTimeout(() => setCount((c) => c - 1), 1000)
    return () => window.clearTimeout(id)
  }, [phase, count])

  // Preview tick
  useEffect(() => {
    if (phase !== 'preview') return
    const tickRate = 50
    const id = window.setInterval(() => {
      setPreviewLeft((t) => {
        const next = t - tickRate
        if (next <= 0) {
          setPhase('input')
          return 0
        }
        return next
      })
    }, tickRate)
    return () => window.clearInterval(id)
  }, [phase])

  // Input tick
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

  const onCell = (digit: number) => {
    if (phase !== 'input') return
    if (entered.includes(digit)) return
    sound('beep')
    const correct = targets.includes(digit)
    const nextEntered = [...entered, digit]
    const nextStrikes = correct ? strikes : [...strikes, digit]
    setEntered(nextEntered)
    if (!correct) setStrikes(nextStrikes)

    const correctCount = nextEntered.filter((d) => targets.includes(d)).length
    const tooMany = nextStrikes.length >= maxErrors
    const gotAll = correctCount >= targets.length

    if ((gotAll || tooMany) && !pressed.current) {
      pressed.current = true
      if (gotAll && nextStrikes.length < maxErrors) {
        const state = nextStrikes.length === 0 && hasPerfect ? 2 : 1
        void sendNui('Minigame:Finish', { state })
        sound('positive')
        finish()
      } else {
        void sendNui('Minigame:Finish', { state: 0 })
        sound('negative')
        fail()
      }
      setPhase('done')
    }
  }

  if (!game) return null

  const pct = limit ? (time / limit) * 100 : 0
  const remaining = Math.max(0, 100 - pct)
  const barColor = pct < 33 ? 'bg-menu-success' : pct < 66 ? 'bg-menu-warning' : 'bg-primary'
  const total = rows * cols

  const readout =
    phase === 'countdown'
      ? 'Booting'
      : phase === 'preview'
      ? `${(previewLeft / 1000).toFixed(1)}s`
      : phase === 'input' && limit
      ? `${(Math.max(0, limit - time) / 1000).toFixed(1)}s`
      : ''

  const cellSize = 64

  return (
    <GameCard
      title={phase === 'preview' ? 'Memorize Cells' : 'Recall Cells'}
      successTitle="Memory Matched"
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
          {/* Strike indicators */}
          <div className="flex gap-1 mb-3">
            {Array.from({ length: maxErrors }, (_, i) => (
              <div
                key={i}
                className={`flex-1 h-[6px] border ${
                  i < strikes.length
                    ? 'bg-menu-error-lt/70 border-menu-error-lt/60'
                    : 'bg-menu-surface-lt border-white/5'
                }`}
                style={{ transition: 'none' }}
              />
            ))}
          </div>

          {/* Phase timer */}
          <div className="w-full h-[3px] bg-menu-bg mb-3 border border-white/5">
            {phase === 'preview' ? (
              <div
                className="h-full bg-primary/70"
                style={{ width: `${(previewLeft / previewMs) * 100}%`, transition: 'none' }}
              />
            ) : phase === 'input' && limit > 0 ? (
              <div
                className={`h-full ${
                  status === 'finished' ? 'bg-menu-success' : status === 'failed' ? 'bg-primary' : barColor
                }`}
                style={{ width: `${remaining}%`, transition: 'none' }}
              />
            ) : null}
          </div>

          <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${cols}, ${cellSize}px)` }}>
            {Array.from({ length: total }, (_, i) => {
              const digit = i + 1
              const isTarget = targets.includes(digit)
              const clicked = entered.includes(digit)
              const showPreview = phase === 'preview' && isTarget
              const correctHit = clicked && isTarget
              const wrongHit = clicked && !isTarget

              let cls = 'bg-menu-surface-lt border-white/10 hover:border-primary/40'
              if (showPreview) cls = 'bg-primary/30 border-primary/70'
              else if (correctHit) cls = 'bg-menu-success/30 border-menu-success/60'
              else if (wrongHit) cls = 'bg-menu-error/30 border-menu-error-lt/60'

              const disabled = phase !== 'input' || clicked

              return (
                <button
                  key={digit}
                  disabled={disabled}
                  onClick={() => onCell(digit)}
                  className={`border transition-colors ${cls} disabled:pointer-events-none`}
                  style={{ width: cellSize, height: cellSize }}
                />
              )
            })}
          </div>

          <div className="mt-3 flex items-center justify-between font-mono text-[0.6rem] uppercase tracking-[0.1em] text-white/25">
            <span>
              {entered.filter((d) => targets.includes(d)).length}/{targets.length}
            </span>
            <span>
              Errors {strikes.length}/{maxErrors}
            </span>
          </div>

          <ResultOverlay status={status} successLabel="Memory Matched" failLabel="Too Many Errors" />
        </div>
      )}
    </GameCard>
  )
}
