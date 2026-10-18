import { useEffect, useRef, useState } from 'react'
import { useStore } from '../../store'
import { sendNui } from '../../nui'
import { useSound } from '../../useSound'
import GameCard from '../../components/GameCard'
import Alley from './Alley'

const KEYSETS: string[][] = [
  ['q', 'w', 'e', 'r'],
  ['a', 's', 'd', 'f'],
  ['u', 'i', 'o', 'p'],
  ['z', 'x', 'c', 'v'],
]

function keyPairs(n: number): string[][] {
  const set = KEYSETS[Math.floor(Math.random() * KEYSETS.length)]
  return set.slice(0, n).map((k) => [k.toLowerCase(), k.toUpperCase()])
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function Keymaster(): React.ReactElement | null {
  const game = useStore((s) => s.game)
  const status = useStore((s) => s.status)
  const started = useStore((s) => s.started)
  const finish = useStore((s) => s.finish)
  const fail = useStore((s) => s.fail)
  const hide = useStore((s) => s.hide)
  const sound = useSound()

  const difficulty = (game?.difficulty as number) ?? 4
  const timerRange = (game?.timer as number[]) ?? [3500, 3500]
  const limit = (game?.limit as number) ?? 30000
  const countdown = (game?.countdown as number) ?? 0
  const chances = (game?.chances as number) ?? 10
  const shuffled = Boolean(game?.shuffled)
  const providedKeys = game?.key as string[][] | undefined

  const [count, setCount] = useState(countdown || -1)
  const [time, setTime] = useState(0)
  const [fails, setFails] = useState(0)
  const [alleyKeys, setAlleyKeys] = useState<string[][]>([])
  const [exiting, setExiting] = useState(false)
  const pressed = useRef(false)

  useEffect(() => {
    pressed.current = false
    setCount(countdown || -1)
    setTime(0)
    setFails(0)
    setExiting(false)
    const base = providedKeys && providedKeys.length >= difficulty ? providedKeys : keyPairs(difficulty)
    setAlleyKeys(shuffled ? shuffle(base) : base)
  }, [started, countdown, difficulty, shuffled, providedKeys])

  useEffect(() => {
    if (count < 0) return
    const id = window.setInterval(() => setCount((c) => c - 1), 1000)
    return () => window.clearInterval(id)
  }, [count])

  const active = status === 'playing' && count < 0

  useEffect(() => {
    if (!active || !limit) return
    const tickRate = 50
    const id = window.setInterval(() => {
      setTime((t) => {
        const next = t + tickRate
        if (next >= limit && !pressed.current) {
          pressed.current = true
          void sendNui('Minigame:Finish', { state: 1 })
          sound('positive')
          finish()
        }
        return next
      })
    }, tickRate)
    return () => window.clearInterval(id)
  }, [active, limit, finish, sound])

  useEffect(() => {
    if (fails > chances && !pressed.current) {
      pressed.current = true
      void sendNui('Minigame:Finish', { state: 0 })
      sound('negative')
      fail()
    }
  }, [fails, chances, fail, sound])

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

  const pct = limit ? (time / limit) * 100 : 0
  const readout = count >= 0 ? 'Booting' : `${(Math.max(0, limit - time) / 1000).toFixed(1)}s`

  const [minMs, maxMs] = [timerRange[0] ?? 3500, timerRange[1] ?? 3500]
  const alleyWidth = 140
  const cardWidth = alleyWidth * difficulty + 32 // padding

  return (
    <GameCard
      title="Keymaster"
      successTitle="Verified"
      failTitle="Verification Failed"
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
        <div className="p-4">
          {/* strikes */}
          <div className="flex gap-1 mb-3">
            {Array.from({ length: chances }, (_, i) => (
              <div
                key={i}
                className={`flex-1 h-[6px] border ${
                  i < fails
                    ? 'bg-menu-error-lt/70 border-menu-error-lt/60'
                    : 'bg-menu-surface-lt border-white/5'
                }`}
                style={{ transition: 'none' }}
              />
            ))}
          </div>

          {/* timer */}
          <div className="w-full h-[3px] bg-menu-bg mb-3 border border-white/5">
            <div
              className="h-full bg-primary/70"
              style={{ width: `${Math.max(0, 100 - pct)}%`, transition: 'none' }}
            />
          </div>

          {/* alleys */}
          <div className="flex gap-2 h-[360px]">
            {alleyKeys.map((pair, i) => (
              <Alley
                key={i}
                keyPair={pair}
                minMs={minMs}
                maxMs={maxMs}
                disabled={!active}
                onFail={() => setFails((f) => f + 1)}
                onHit={() => {
                  /* hit counted implicitly by survival */
                }}
              />
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between font-mono text-[0.6rem] uppercase tracking-[0.1em] text-white/25">
            <span>
              Fails {fails}/{chances}
            </span>
            <span>Hit keys in the zone to survive</span>
          </div>
        </div>
      )}
    </GameCard>
  )
}
