import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  X, ChevronLeft, PersonStanding, Laugh, Footprints, Armchair,
  CircleDot, Snowflake, PartyPopper, Banknote, Warehouse, DoorOpen,
  Waves, Siren, Tablet, Megaphone, Car, DollarSign, Frown, Terminal,
  Circle, type LucideIcon,
} from 'lucide-react'
import { useStore } from '../store.ts'
import { sendNui } from '../nui.ts'

/* Map Font Awesome icon names (sent from Lua) → Lucide components */
const FA_ICON_MAP: Record<string, LucideIcon> = {
  'person-running': PersonStanding,
  'face-grin-squint-tears': Laugh,
  'person-walking': Footprints,
  'chair': Armchair,
  'tire': CircleDot,
  'snowflake': Snowflake,
  'party-horn': PartyPopper,
  'money-bill-1-wave': Banknote,
  'warehouse': Warehouse,
  'window-frame-open': DoorOpen,
  'door-open': DoorOpen,
  'mask-snorkel': Waves,
  'siren-on': Siren,
  'tablet-rugged': Tablet,
  'megaphone': Megaphone,
  'car-on': Car,
  'dollar-sign': DollarSign,
  'face-tired': Frown,
  'fas fa-terminal': Terminal,
  'champagne-glasses': Laugh,
}

const OUTER_R = 180
const INNER_R = 68
const CENTER_R = 54

function polarToXY(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function wedgePath(cx: number, cy: number, innerR: number, outerR: number, startDeg: number, endDeg: number): string {
  const p1 = polarToXY(cx, cy, innerR, startDeg)
  const p2 = polarToXY(cx, cy, outerR, startDeg)
  const p3 = polarToXY(cx, cy, outerR, endDeg)
  const p4 = polarToXY(cx, cy, innerR, endDeg)
  const largeArc = endDeg - startDeg > 180 ? 1 : 0
  return [
    `M ${p1.x} ${p1.y}`,
    `L ${p2.x} ${p2.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${p3.x} ${p3.y}`,
    `L ${p4.x} ${p4.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${p1.x} ${p1.y}`,
    'Z',
  ].join(' ')
}

export default function InteractionMenu(): JSX.Element | null {
  const show = useStore(s => s.interactionShow)
  const items = useStore(s => s.interactionItems)
  const layer = useStore(s => s.interactionLayer)
  const dispatch = useStore(s => s.dispatch)
  const [hovered, setHovered] = useState<number | null>(null)

  useEffect(() => {
    if (!show) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'F1') {
        sendNui('Interaction:Hide')
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [show])

  useEffect(() => { setHovered(null) }, [show])

  if (!show || items.length === 0) return null

  const sorted = [...items].sort((a, b) => {
    const ai = typeof a.id === 'number' ? a.id : 0
    const bi = typeof b.id === 'number' ? b.id : 0
    return ai - bi
  })

  const count = sorted.length
  const size = (OUTER_R + 20) * 2
  const cx = size / 2
  const cy = size / 2
  const sliceAngle = 360 / count

  const handleSelect = (item: typeof sorted[number]) => {
    sendNui('Interaction:Trigger', { ...item })
  }

  const handleCenter = () => {
    if (layer > 0) sendNui('Interaction:Back')
    else sendNui('Interaction:Hide')
  }

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center animate-fade-in"
      style={{ zIndex: 110 }}
    >
      <svg
        width={size}
        height={size}
        className="relative pointer-events-auto"
        style={{ filter: 'drop-shadow(0 4px 24px rgba(0,0,0,0.7))' }}
      >
        <defs>
          <filter id="radial-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Wedge slices */}
        {sorted.map((item, i) => {
          const startAngle = -90 + i * sliceAngle
          const endAngle = startAngle + sliceAngle
          const midAngle = startAngle + sliceAngle / 2
          const labelR = (INNER_R + OUTER_R) / 2
          const labelPos = polarToXY(cx, cy, labelR, midAngle)
          const isHovered = hovered === i

          return (
            <g
              key={i}
              onClick={() => handleSelect(item)}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className="cursor-pointer"
            >
              <path
                d={wedgePath(cx, cy, INNER_R + 4, OUTER_R, startAngle, endAngle)}
                fill={isHovered ? 'rgba(255,92,58,0.12)' : '#141414'}
                stroke={isHovered ? 'rgba(255,92,58,0.35)' : 'rgba(255,255,255,0.08)'}
                strokeWidth={1}
                style={{ transition: 'fill 0.15s, stroke 0.15s' }}
              />
              {/* Icon */}
              {item.icon && (() => {
                const Icon = FA_ICON_MAP[item.icon] ?? Circle
                return (
                  <foreignObject
                    x={labelPos.x - 8}
                    y={labelPos.y - 16}
                    width={16}
                    height={16}
                    className="pointer-events-none"
                  >
                    <Icon
                      size={14}
                      strokeWidth={2.5}
                      fill={isHovered ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.45)'}
                      color={isHovered ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.45)'}
                      style={{ transition: 'color 0.15s, fill 0.15s' }}
                    />
                  </foreignObject>
                )
              })()}
              {/* Label */}
              <text
                x={labelPos.x}
                y={labelPos.y + 12}
                textAnchor="middle"
                dominantBaseline="central"
                fill={isHovered ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.5)'}
                fontFamily="var(--font-display, 'Barlow'), sans-serif"
                fontSize="9"
                fontWeight="700"
                letterSpacing="1.2"
                className="pointer-events-none uppercase"
                style={{ transition: 'fill 0.15s' }}
              >
                {item.label}
              </text>
            </g>
          )
        })}

        {/* Divider lines */}
        {sorted.map((_, i) => {
          const angle = -90 + i * sliceAngle
          const p1 = polarToXY(cx, cy, INNER_R + 4, angle)
          const p2 = polarToXY(cx, cy, OUTER_R, angle)
          return (
            <line
              key={`d-${i}`}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={1}
              className="pointer-events-none"
            />
          )
        })}

        {/* Center ring */}
        <circle
          cx={cx}
          cy={cy}
          r={CENTER_R}
          fill="#141414"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={1}
          onClick={handleCenter}
          className="cursor-pointer"
        />
        {/* Inner accent ring — primary at low opacity */}
        <circle
          cx={cx}
          cy={cy}
          r={CENTER_R - 5}
          fill="none"
          stroke="rgba(255,92,58,0.25)"
          strokeWidth={1}
          className="pointer-events-none"
        />
      </svg>

      {/* Center icon */}
      <div
        className="absolute flex flex-col items-center gap-1 pointer-events-none"
        style={{ zIndex: 1 }}
      >
        {layer > 0 ? (
          <>
            <ChevronLeft size={20} className="text-[#FF5C3A] drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,1)]" />
            <span className="font-display font-bold text-[10px] text-white/40 uppercase tracking-[0.15em] drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]">
              Back
            </span>
          </>
        ) : (
          <>
            <X size={20} className="text-[#FF5C3A] drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,1)]" />
            <span className="font-display font-bold text-[10px] text-white/40 uppercase tracking-[0.15em] drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]">
              Close
            </span>
          </>
        )}
      </div>
    </div>,
    document.body,
  )
}
