import { useMemo } from 'react'
import { useStore } from '../../store.ts'
import Voip from './Voip.tsx'

/* ---- SVG icon paths (all viewBox 0 0 24 24, fill-based) ---- */
/* Map Font Awesome icon names (sent from Lua) → local SVG key */
const FA_TO_KEY: Record<string, string> = {
  'whiskey-glass': 'thirst',
  'drumstick-bite': 'hunger',
  'face-dizzy': 'stress',
  'champagne-glasses': 'thirst',  // drunk reuses thirst icon
  'fas fa-terminal': 'stress',    // dev fallback
}

/* Icon data: [viewBox, path] */
const ICONS: Record<string, [string, string]> = {
  shield: ['0 0 24 24', 'M21.881 5.223a.496.496 0 0 0-.747-.412c-.672.392-1.718.898-2.643.898-.421 0-.849-.064-1.289-.198a5.712 5.712 0 0 1-.808-.309c-1.338-.639-2.567-1.767-3.696-2.889a1.008 1.008 0 0 0-.698-.29 1.008 1.008 0 0 0-.698.29c-1.129 1.122-2.358 2.25-3.696 2.889h-.001a5.655 5.655 0 0 1-.807.309c-.44.134-.869.198-1.289.198-.925 0-1.971-.507-2.643-.898a.496.496 0 0 0-.747.412c-.061 1.538-.077 4.84.688 7.444 1.399 4.763 4.48 7.976 8.91 9.292l.14.041.14-.014V22v-.014H12l.143.014.14-.041c4.43-1.316 7.511-4.529 8.91-9.292.765-2.604.748-5.906.688-7.444z'],
  heart: ['0 0 24 24', 'M2.2 9.4c0 1.3.2 3.3 2 5.1 1.6 1.6 6.9 5.2 7.1 5.4.2.1.4.2.6.2s.4-.1.6-.2c.2-.2 5.5-3.7 7.1-5.4 1.8-1.8 2-3.8 2-5.1 0-3-2.4-5.4-5.4-5.4-1.6 0-3.2.9-4.2 2.3-1-1.4-2.6-2.3-4.4-2.3-2.9 0-5.4 2.4-5.4 5.4z'],
  hunger: ['0 0 512 512', 'M61.1 224C45 224 32 211 32 194.9c0-1.9.2-3.7.6-5.6C37.9 168.3 78.8 32 256 32s218.1 136.3 223.4 157.3c.5 1.9.6 3.7.6 5.6c0 16.1-13 29.1-29.1 29.1L61.1 224zM144 128a16 16 0 1 0-32 0 16 16 0 1 0 32 0zm240 16a16 16 0 1 0 0-32 16 16 0 1 0 0 32zM272 96a16 16 0 1 0-32 0 16 16 0 1 0 32 0zM16 304c0-26.5 21.5-48 48-48l384 0c26.5 0 48 21.5 48 48s-21.5 48-48 48L64 352c-26.5 0-48-21.5-48-48zm16 96c0-8.8 7.2-16 16-16l416 0c8.8 0 16 7.2 16 16l0 16c0 35.3-28.7 64-64 64L96 480c-35.3 0-64-28.7-64-64l0-16z'],
  thirst: ['0 0 384 512', 'M32 0C23.1 0 14.6 3.7 8.6 10.2S-.6 25.4.1 34.3L28.9 437.7c3 41.9 37.8 74.3 79.8 74.3l166.6 0c42 0 76.8-32.4 79.8-74.3L383.9 34.3c.6-8.9-2.4-17.6-8.5-24.1S360.9 0 352 0L32 0zM73 156.5L66.4 64l251.3 0L311 156.5l-24.2 12.1c-19.4 9.7-42.2 9.7-61.6 0c-20.9-10.4-45.5-10.4-66.4 0c-19.4 9.7-42.2 9.7-61.6 0L73 156.5z'],
  stress: ['0 0 512 512', 'M184 0c30.9 0 56 25.1 56 56l0 400c0 30.9-25.1 56-56 56c-28.9 0-52.7-21.9-55.7-50.1c-5.2 1.4-10.7 2.1-16.3 2.1c-35.3 0-64-28.7-64-64c0-7.4 1.3-14.6 3.6-21.2C21.4 367.4 0 338.2 0 304c0-31.9 18.7-59.5 45.8-72.3C37.1 220.8 32 207 32 192c0-30.7 21.6-56.3 50.4-62.6C80.8 123.9 80 118 80 112c0-29.9 20.6-55.1 48.3-62.1C131.3 21.9 155.1 0 184 0zM328 0c28.9 0 52.6 21.9 55.7 49.9c27.8 7 48.3 32.1 48.3 62.1c0 6-.8 11.9-2.4 17.4c28.8 6.2 50.4 31.9 50.4 62.6c0 15-5.1 28.8-13.8 39.7C493.3 244.5 512 272.1 512 304c0 34.2-21.4 63.4-51.6 74.8c2.3 6.6 3.6 13.8 3.6 21.2c0 35.3-28.7 64-64 64c-5.6 0-11.1-.7-16.3-2.1c-3 28.2-26.8 50.1-55.7 50.1c-30.9 0-56-25.1-56-56l0-400c0-30.9 25.1-56 56-56z'],
  mic: ['0 0 384 512', 'M192 0C139 0 96 43 96 96l0 160c0 53 43 96 96 96s96-43 96-96l0-160c0-53-43-96-96-96zM64 216c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 40c0 89.1 66.2 162.7 152 174.4l0 33.6-48 0c-13.3 0-24 10.7-24 24s10.7 24 24 24l72 0 72 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-48 0 0-33.6c85.8-11.7 152-85.3 152-174.4l0-40c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 40c0 70.7-57.3 128-128 128s-128-57.3-128-128l0-40z'],
  voice: ['0 0 384 512', 'M192 0C139 0 96 43 96 96l0 160c0 53 43 96 96 96s96-43 96-96l0-160c0-53-43-96-96-96zM64 216c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 40c0 89.1 66.2 162.7 152 174.4l0 33.6-48 0c-13.3 0-24 10.7-24 24s10.7 24 24 24l72 0 72 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-48 0 0-33.6c85.8-11.7 152-85.3 152-174.4l0-40c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 40c0 70.7-57.3 128-128 128s-128-57.3-128-128l0-40z'],
  stamina: ['0 0 448 512', 'M320 48a48 48 0 1 0-96 0 48 48 0 1 0 96 0zM125.7 175.5c9.9-9.9 23.4-15.5 37.5-15.5c1.9 0 3.8.1 5.6.3L137.6 254c-9.3 28 1.7 58.8 26.8 74.5l86.2 53.9-25.4 88.8c-4.9 17 5 34.7 22 39.6s34.7-5 39.6-22l28.7-100.4c5.9-20.6-2.6-42.6-20.7-53.9L238 299l30.9-82.4 5.1 12.3C289 264.7 323.9 288 362.7 288l21.3 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-21.3 0c-12.9 0-24.6-7.8-29.5-19.7l-6.3-15c-14.6-35.1-44.1-61.9-80.5-73.1l-48.7-15c-11.1-3.4-22.7-5.2-34.4-5.2c-31 0-60.8 12.3-82.7 34.3L57.4 153.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l23.1-23.1zM91.2 352L32 352c-17.7 0-32 14.3-32 32s14.3 32 32 32l69.6 0c19 0 36.2-11.2 43.9-28.5L157 361.6l-9.5-6c-17.5-10.9-30.5-26.8-37.9-44.9L91.2 352z'],
  oxygen: ['0 0 576 512', 'M309.5 178.4L447.9 297.1c-1.6.9-3.2 2-4.8 3c-18 12.4-40.1 20.3-59.2 20.3c-19.6 0-40.8-7.7-59.2-20.3c-22.1-15.5-51.6-15.5-73.7 0c-17.1 11.8-38 20.3-59.2 20.3c-10.1 0-21.1-2.2-31.9-6.2C163.1 193.2 262.2 96 384 96l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-26.9 0-52.3 6.6-74.5 18.4zM160 160A64 64 0 1 1 32 160a64 64 0 1 1 128 0zM306.5 325.9C329 341.4 356.5 352 384 352c26.9 0 55.4-10.8 77.4-26.1c0 0 0 0 0 0c11.9-8.5 28.1-7.8 39.2 1.7c14.4 11.9 32.5 21 50.6 25.2c17.2 4 27.9 21.2 23.9 38.4s-21.2 27.9-38.4 23.9c-24.5-5.7-44.9-16.5-58.2-25C449.5 405.7 417 416 384 416c-31.9 0-60.6-9.9-80.4-18.9c-5.8-2.7-11.1-5.3-15.6-7.7c-4.5 2.4-9.7 5.1-15.6 7.7c-19.8 9-48.5 18.9-80.4 18.9c-33 0-65.5-10.3-94.5-25.8c-13.4 8.4-33.7 19.3-58.2 25c-17.2 4-34.4-6.7-38.4-23.9s6.7-34.4 23.9-38.4c18.1-4.2 36.2-13.3 50.6-25.2c11.1-9.4 27.3-10.1 39.2-1.7c0 0 0 0 0 0C136.7 341.2 165.1 352 192 352c27.5 0 55-10.6 77.5-26.1c11.1-7.9 25.9-7.9 37 0z'],
}

function SvgIcon({ name, fallback, className }: { name: string; fallback?: string; className?: string }): JSX.Element {
  const key = FA_TO_KEY[name] ?? name
  const entry = ICONS[key] ?? (fallback ? ICONS[FA_TO_KEY[fallback] ?? fallback] : undefined)
  if (!entry) return <></>
  const [vb, d] = entry
  return (
    <svg fill="currentColor" viewBox={vb} width="1em" height="1em" className={className} xmlns="http://www.w3.org/2000/svg">
      <path d={d} />
    </svg>
  )
}

/* ---- StatBox — single square per stat; fills from the bottom, icon centred ---- */
function StatBox({
  icon,
  iconFallback,
  value = 0,
  color = '#F2F2F2',
}: {
  icon: string
  iconFallback?: string
  value?: number
  color?: string
}): JSX.Element {
  const pct = Math.max(0, Math.min(100, value))

  return (
    <div
      className="relative w-[2.2vw] h-[2.2vw] overflow-hidden bg-menu-surface"
      style={{
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.55)',
      }}
    >
      {/* flat fill from bottom — no gradient sheen, no glow */}
      <div
        className="absolute left-0 right-0 bottom-0 transition-[height] duration-400 ease-out"
        style={{
          height: `${pct}%`,
          background: color,
          opacity: 0.85,
        }}
      />
      {/* 1px top accent on the fill — mirrors the website's left-border accent */}
      <div
        className="absolute left-0 right-0 transition-[bottom] duration-400 ease-out pointer-events-none"
        style={{
          bottom: `${pct}%`,
          height: '1px',
          background: color,
          opacity: pct > 0 && pct < 100 ? 1 : 0,
          boxShadow: `0 0 4px ${color}`,
        }}
      />
      {/* icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <SvgIcon
          name={icon}
          fallback={iconFallback}
          className="text-white/90 text-[0.95vw] drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]"
        />
      </div>
    </div>
  )
}

/* ---- StatBar — vertical statuses ---- */
function StatBar({
  icon = 'heart',
  value = 20,
  maxValue = 100,
  color = '#F2F2F2',
  vertical = false,
}: {
  icon?: string
  value?: number
  maxValue?: number
  color?: string
  vertical?: boolean
}): JSX.Element {
  const percentage = useMemo(() => (value / maxValue) * 100, [value, maxValue])

  return (
    <div className={`flex ${vertical ? 'h-[3dvh]' : 'w-full'} items-center gap-1`}>
      {!vertical && <SvgIcon name={icon} className="text-[#F2F2F2] text-[1vw]" />}
      {!vertical && (
        <p
          className="text-[0.6vw] drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,1)] w-[20px] text-center font-bold"
          style={{ color }}
        >
          {value}
        </p>
      )}
      <div
        className={`relative drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,1)] ${
          vertical
            ? 'h-full w-[4px] rounded-full'
            : 'w-full ml-2 h-2 rounded-full'
        } bg-black/30 overflow-hidden`}
      >
        <div
          className={`absolute ${vertical ? 'bottom-0 w-full' : 'left-0 h-full'} transition-all bg-red-500 rounded-[1px] ease-in-out`}
          style={{
            backgroundColor: color,
            [vertical ? 'height' : 'width']: `${percentage}%`,
            borderRadius: percentage < 100 ? '50px' : '9999px',
            overflow: 'hidden',
          }}
        />
      </div>
      {vertical && <SvgIcon name={icon} className="text-[#F2F2F2] text-[0.8vw] drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,1)]" />}
    </div>
  )
}

/* ---- Main export ---- */
export default function StatusBar(): JSX.Element {
  const health = useStore(s => s.health)
  const maxHealth = useStore(s => s.maxHealth)
  const armor = useStore(s => s.armor)
  const isDead = useStore(s => s.isDead)
  const statuses = useStore(s => s.statuses)

  const hpPercent = maxHealth > 0 ? Math.round((health / maxHealth) * 100) : (health > 0 ? 100 : 0)
  const hpClamped = Math.max(0, Math.min(100, hpPercent))
  const armorClamped = Math.max(0, Math.min(100, armor))

  const STATUS_ORDER: Record<string, number> = {
    hunger: 0,
    thirst: 1,
    stress: 2,
    stamina: 3,
    oxygen: 4,
  }

  const visibleStatuses = statuses
    .filter(s => {
      if (s.options?.hideZero && s.value <= 0) return false
      if (s.options?.hideHigh && s.value >= s.max * 0.9) return false
      return true
    })
    .slice()
    .sort((a, b) => (STATUS_ORDER[a.name] ?? 999) - (STATUS_ORDER[b.name] ?? 999))

  return (
    <div className="w-full flex gap-[10px] items-center justify-start">
      <Voip />
      <StatBox icon="heart" value={isDead ? 0 : hpClamped} color="#FF5C3A" />
      <StatBox icon="shield" value={armorClamped} color="#2B78FC" />
      {visibleStatuses.map(s => {
        const pct = s.max > 0 ? Math.max(0, Math.min(100, (s.value / s.max) * 100)) : 0
        return (
          <StatBox
            key={s.name}
            icon={s.icon || s.name}
            iconFallback={s.name}
            value={Math.round(pct)}
            color={s.color || '#FB8607'}
          />
        )
      })}
    </div>
  )
}
