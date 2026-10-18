import { useEffect, useRef, useState } from 'react'
import { useStore } from '../../store'
import { sendNui } from '../../nui'
import { useSound } from '../../useSound'
import GameCard from '../../components/GameCard'

const SIZE = 240
const RADIUS = 100
const STROKE = 14

function polar(deg: number): { x: number; y: number } {
  const r = ((deg - 90) * Math.PI) / 180
  return { x: SIZE / 2 + RADIUS * Math.cos(r), y: SIZE / 2 + RADIUS * Math.sin(r) }
}

function arcPath(start: number, end: number): string {
  const a = polar(start)
  const b = polar(end)
  const large = end - start > 180 ? 1 : 0
  return `M ${a.x} ${a.y} A ${RADIUS} ${RADIUS} 0 ${large} 1 ${b.x} ${b.y}`
}

export default function Round(): React.ReactElement | null {
  const game = useStore((s) => s.game)
  const status = useStore((s) => s.status)
  const started = useStore((s) => s.started)
  const finish = useStore((s) => s.finish)
  const fail = useStore((s) => s.fail)
  const hide = useStore((s) => s.hide)
  const sound = useSound()

  const rate = (game?.rate as number) ?? 0.5
  const difficulty = (game?.difficulty as number) ?? 4
  const keys = (game?.key as string[]) ?? ['1']

  const [degrees, setDegrees] = useState(0)
  const [zone, setZone] = useState<{ start: number; end: number }>({ start: 90, end: 140 })
  const [exiting, setExiting] = useState(false)
  const pressed = useRef(false)

  useEffect(() => {
    pressed.current = false
    setExiting(false)
    setDegrees(0)
    // Match original — g_start: random(20,40)/10 rad → ~114–229°, g_end = g_start + difficulty/10 rad
    const startRad = (Math.floor(Math.random() * 21) + 20) / 10
    const endRad = startRad + difficulty / 10
    setZone({
      start: (startRad * 180) / Math.PI,
      end: (endRad * 180) / Math.PI,
    })
  }, [started, difficulty])

  useEffect(() => {
    if (status !== 'playing') return
    const id = window.setInterval(() => {
      setDegrees((d) => {
        const next = d + rate
        if (next > 360 && !pressed.current) {
          pressed.current = true
          void sendNui('Minigame:Finish', { state: 0 })
          sound('negative')
          fail()
          return 360
        }
        return next
      })
    }, 10)
    return () => window.clearInterval(id)
  }, [status, rate, fail, sound])

  useEffect(() => {
    if (status !== 'playing') return
    const onKey = (e: KeyboardEvent) => {
      if (pressed.current) return
      pressed.current = true
      const inZone = degrees >= zone.start && degrees <= zone.end + 5
      if (keys.includes(e.key) && inZone) {
        void sendNui('Minigame:Finish', { state: 1 })
        sound('positive')
        finish()
      } else {
        void sendNui('Minigame:Finish', { state: 0 })
        sound('negative')
        fail()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [status, degrees, zone, keys, finish, fail, sound])

  useEffect(() => {
    if (status !== 'finished' && status !== 'failed') return
    const t1 = window.setTimeout(() => setExiting(true), 1200)
    const t2 = window.setTimeout(() => hide(), 1450)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [status, hide])

  if (!game) return null

  const keyLabel = (keys[0] ?? '1').toUpperCase()
  const zoneColor =
    status === 'finished' ? '#52984a' : status === 'failed' ? '#a13434' : '#FF5C3A'
  const indicator = polar(degrees)

  return (
    <GameCard
      title="Focus Check"
      successTitle="Hit"
      failTitle="Missed"
      status={status}
      exiting={exiting}
      readout={status === 'playing' ? `${Math.round(degrees)}°` : ''}
      className="fixed inset-0 m-auto w-fit h-fit"
    >
      <div className="px-6 py-4">
        <svg width={SIZE} height={SIZE} className="block">
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="#1c1c1c"
            strokeWidth={STROKE}
          />
          <path
            d={arcPath(zone.start, zone.end)}
            fill="none"
            stroke={zoneColor}
            strokeWidth={STROKE}
            strokeLinecap="butt"
            style={{ filter: `drop-shadow(0 0 6px ${zoneColor}80)` }}
          />
          <circle
            cx={indicator.x}
            cy={indicator.y}
            r={9}
            fill="white"
            stroke="#0f0f0f"
            strokeWidth={2}
            style={{ filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.6))' }}
          />
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-white"
            style={{ fontFamily: 'Barlow', fontWeight: 700, fontSize: 56 }}
          >
            {keyLabel}
          </text>
        </svg>

        <div className="mt-3 text-center font-medium uppercase tracking-[0.06em] text-[0.7rem] text-white/50">
          Press <span className="text-primary">[{keyLabel}]</span> in the zone
        </div>
      </div>
    </GameCard>
  )
}
