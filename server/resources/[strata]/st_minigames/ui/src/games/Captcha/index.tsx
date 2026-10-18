import { useEffect, useRef, useState } from 'react'
import { useStore } from '../../store'
import { sendNui } from '../../nui'
import { useSound } from '../../useSound'
import GameCard from '../../components/GameCard'
import ResultOverlay from '../../components/ResultOverlay'
import { randomizePiece, generateQA, SHAPE_SVG, type PuzzlePiece, type QuestionPart } from './puzzle'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

type Phase = 'countdown' | 'preview' | 'reveal' | 'input' | 'done'

export default function Captcha(): React.ReactElement | null {
  const game = useStore((s) => s.game)
  const status = useStore((s) => s.status)
  const started = useStore((s) => s.started)
  const finish = useStore((s) => s.finish)
  const fail = useStore((s) => s.fail)
  const hide = useStore((s) => s.hide)
  const sound = useSound()

  const difficulty = (game?.difficulty as number) ?? 5
  const difficulty2 = (game?.difficulty2 as number) ?? 2
  const previewMs = (game?.timer as number) ?? 5000
  const limit = (game?.limit as number) ?? 30000
  const countdown = (game?.countdown as number) ?? 0

  const [phase, setPhase] = useState<Phase>(countdown ? 'countdown' : 'preview')
  const [count, setCount] = useState(countdown || 0)
  const [puzzle, setPuzzle] = useState<PuzzlePiece[]>([])
  const [qa, setQa] = useState<{ parts: QuestionPart[]; answer: string } | null>(null)
  const [previewLeft, setPreviewLeft] = useState(previewMs)
  const [time, setTime] = useState(0)
  const [input, setInput] = useState('')
  const [exiting, setExiting] = useState(false)
  const pressed = useRef(false)

  useEffect(() => {
    pressed.current = false
    setPhase(countdown ? 'countdown' : 'preview')
    setCount(countdown || 0)
    setPreviewLeft(previewMs)
    setTime(0)
    setInput('')
    setExiting(false)

    const positions = shuffle(Array.from({ length: difficulty }, (_, i) => i + 1))
    const pieces = positions.map((i) => randomizePiece(i))
    setPuzzle(pieces)
    setQa(generateQA(difficulty2, positions, pieces))
  }, [started, difficulty, difficulty2, previewMs, countdown])

  useEffect(() => {
    if (phase !== 'countdown') return
    if (count <= 0) {
      setPhase('preview')
      return
    }
    const id = window.setTimeout(() => setCount((c) => c - 1), 1000)
    return () => window.clearTimeout(id)
  }, [phase, count])

  useEffect(() => {
    if (phase !== 'preview') return
    const tickRate = 50
    const id = window.setInterval(() => {
      setPreviewLeft((t) => {
        const next = t - tickRate
        if (next <= 0) {
          setPhase('reveal')
          return 0
        }
        return next
      })
    }, tickRate)
    return () => window.clearInterval(id)
  }, [phase])

  useEffect(() => {
    if (phase !== 'reveal') return
    const id = window.setTimeout(() => setPhase('input'), 600)
    return () => window.clearTimeout(id)
  }, [phase])

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
    if (phase !== 'input' || pressed.current || !qa) return
    pressed.current = true
    if (input.trim().toLowerCase() === qa.answer.toLowerCase()) {
      void sendNui('Minigame:Finish', { state: 1 })
      sound('positive')
      finish()
    } else {
      void sendNui('Minigame:Finish', { state: 0 })
      sound('negative')
      fail()
    }
    setPhase('done')
  }

  if (!game) return null

  const pct = (time / limit) * 100
  const remaining = Math.max(0, 100 - pct)
  const barColor = pct < 33 ? 'bg-menu-success' : pct < 66 ? 'bg-menu-warning' : 'bg-primary'

  const readout =
    phase === 'countdown'
      ? 'Booting'
      : phase === 'preview'
      ? `${(previewLeft / 1000).toFixed(1)}s`
      : phase === 'reveal'
      ? 'Revealing'
      : phase === 'input' && limit
      ? `${(Math.max(0, limit - time) / 1000).toFixed(1)}s`
      : ''

  const pieceSize = 150
  const gap = 12
  const cardWidth = Math.max(520, pieceSize * difficulty + gap * (difficulty - 1) + 32)

  const showPuzzle = phase === 'reveal' || phase === 'input'

  return (
    <GameCard
      title="Captcha"
      successTitle="Verified"
      failTitle="Verification Failed"
      status={status}
      exiting={exiting}
      readout={readout}
      className="fixed inset-0 m-auto h-fit"
      style={{ width: cardWidth }}
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
          {phase === 'preview' ? (
            <div className="w-full h-[3px] bg-menu-bg mb-3 border border-white/5">
              <div
                className="h-full bg-primary/70"
                style={{ width: `${(previewLeft / previewMs) * 100}%`, transition: 'none' }}
              />
            </div>
          ) : phase === 'input' && limit > 0 ? (
            <div className="w-full h-[3px] bg-menu-bg mb-3 border border-white/5">
              <div
                className={`h-full ${
                  status === 'finished' ? 'bg-menu-success' : status === 'failed' ? 'bg-primary' : barColor
                }`}
                style={{ width: `${remaining}%`, transition: 'none' }}
              />
            </div>
          ) : (
            <div className="h-[3px] mb-3" />
          )}

          <div className="flex justify-center gap-3">
            {puzzle.map((p) => (
              <div
                key={p.index}
                className="flex items-center justify-center border border-white/10"
                style={{
                  width: pieceSize,
                  height: pieceSize,
                  background: showPuzzle ? p.colors.background : '#1c1c1c',
                }}
              >
                {showPuzzle ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 150" width={pieceSize} height={pieceSize}>
                    {SHAPE_SVG[p.shape](p.colors.shape)}
                    <text
                      x="50%"
                      y="25%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      stroke="black"
                      strokeWidth="0.35"
                      fill={p.colors.colortext}
                      fontWeight="bold"
                      style={{ fontSize: 22, fontFamily: 'Barlow, sans-serif' }}
                    >
                      {p.text[0].toUpperCase()}
                    </text>
                    <text
                      x="50%"
                      y="70%"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      stroke="black"
                      strokeWidth="0.35"
                      fill={p.colors.shapetext}
                      fontWeight="bold"
                      style={{ fontSize: 22, fontFamily: 'Barlow, sans-serif' }}
                    >
                      {p.text[1].toUpperCase()}
                    </text>
                    <text
                      x="50%"
                      y="50%"
                      textAnchor="middle"
                      dominantBaseline="central"
                      stroke="black"
                      strokeWidth="0.35"
                      fill={p.colors.number}
                      fontWeight="bold"
                      style={{ fontSize: 52, fontFamily: 'Arial, Helvetica' }}
                    >
                      {p.number}
                    </text>
                  </svg>
                ) : (
                  <span className="font-display font-black text-[3.5rem] text-white/80">{p.index}</span>
                )}
              </div>
            ))}
          </div>

          {phase === 'input' && qa && (
            <form onSubmit={onSubmit} className="mt-5 flex flex-col items-center gap-3">
              <div className="text-center font-display font-bold uppercase tracking-[0.1em] text-[0.8rem] text-white/70 max-w-[560px]">
                Enter{' '}
                {qa.parts.map((q, i) => (
                  <span key={i}>
                    <span className="text-primary">{q.question}</span>{' '}
                    <span className="font-mono text-white/90">( {q.position} )</span>
                    {i < qa.parts.length - 1 && ' and '}
                  </span>
                ))}
              </div>
              <input
                autoFocus
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="answer"
                className="h-10 w-[320px] px-3 bg-menu-surface-lt border border-white/10 text-center font-mono text-[0.95rem] text-white placeholder-white/20 focus:border-primary/60"
              />
            </form>
          )}

          <ResultOverlay status={status} successLabel="Verified" failLabel="Verification Failed" />
        </div>
      )}
    </GameCard>
  )
}
