import { useMemo } from 'react'
import { useStore } from '../../store.ts'

const CARDINALS: Record<number, { label: string; major: boolean }> = {
  0: { label: 'N', major: true },
  45: { label: 'NE', major: false },
  90: { label: 'E', major: true },
  135: { label: 'SE', major: false },
  180: { label: 'S', major: true },
  225: { label: 'SW', major: false },
  270: { label: 'W', major: true },
  315: { label: 'NW', major: false },
}

const RIBBON_WIDTH_PX = 280
const VISIBLE_DEG = 110
const PX_PER_DEG = RIBBON_WIDTH_PX / VISIBLE_DEG
const STRIP_WIDTH = 360 * PX_PER_DEG

type Tick = {
  deg: number
  label?: string
  major: boolean
  size: 'minor' | 'medium' | 'major'
}

// Generated once — never changes
const BASE_TICKS: Tick[] = (() => {
  const out: Tick[] = []
  for (let d = 0; d < 360; d += 5) {
    const card = CARDINALS[d]
    out.push({
      deg: d,
      label: card?.label,
      major: !!card?.major,
      size: card ? 'major' : d % 15 === 0 ? 'medium' : 'minor',
    })
  }
  return out
})()

function TickStrip({ offset, activeDeg }: { offset: number; activeDeg: number }): JSX.Element {
  return (
    <div
      className="absolute top-0"
      style={{ left: offset, width: STRIP_WIDTH, height: '100%' }}
    >
      {BASE_TICKS.map((t, i) => {
        const x = t.deg * PX_PER_DEG
        const isActive = t.label && t.deg === activeDeg
        return (
          <div
            key={i}
            className="absolute top-0 flex flex-col items-center"
            style={{ left: x, transform: 'translateX(-50%)' }}
          >
            <div
              className="w-[1px] bg-white/60"
              style={{ height: t.label ? (t.major ? 6 : 4) : t.size === 'medium' ? 4 : 2 }}
            />
            {t.label && (
              <span
                className={
                  t.major
                    ? 'font-display font-bold tracking-[0.12em] text-[10px] leading-none drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,1)] mt-[2px]'
                    : 'font-mono tracking-[0.08em] text-[8px] leading-none drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,1)] mt-[2px]'
                }
                style={{
                  textIndent: t.major ? '0.12em' : '0.08em',
                  color: isActive ? '#FF5C3A' : '#FFFFFF',
                }}
              >
                {t.label}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

function CompassRibbon({ heading }: { heading: number }): JSX.Element {
  // Translate the strip so that `heading` degrees sits at center.
  // We render the strip three times (offset -STRIP_WIDTH, 0, +STRIP_WIDTH)
  // so the seam wraps cleanly across any rotation.
  const center = RIBBON_WIDTH_PX / 2
  const translate = center - heading * PX_PER_DEG

  // Compute which cardinal (if any) is currently active for the orange highlight overlay
  const activeCardinalDeg = useMemo(() => {
    let best: { deg: number; delta: number } | null = null
    for (const key of Object.keys(CARDINALS)) {
      const d = Number(key)
      let delta = Math.abs(((heading - d + 540) % 360) - 180)
      if (!best || delta < best.delta) best = { deg: d, delta }
    }
    return best && best.delta <= 22 ? best.deg : -1
  }, [heading])

  return (
    <div
      className="relative h-[26px] overflow-hidden bg-menu-surface"
      style={{
        width: RIBBON_WIDTH_PX,
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.55)',
      }}
    >
      {/* bottom accent strip under the center — mirrors site's left-border accent */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          width: 40,
          height: '2px',
          background: '#FF5C3A',
        }}
      />

      {/* side fade mask wrapper */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          maskImage: 'linear-gradient(90deg, transparent 0%, black 14%, black 86%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, black 14%, black 86%, transparent 100%)',
        }}
      >
        {/* Wrapping tick strip — render at -360°, 0°, +360° so rotation wraps seamlessly */}
        <div
          className="absolute top-0 h-full"
          style={{
            transform: `translate3d(${translate}px, 0, 0)`,
            willChange: 'transform',
            transition: 'transform 120ms linear',
          }}
        >
          <TickStrip offset={-STRIP_WIDTH} activeDeg={activeCardinalDeg} />
          <TickStrip offset={0} activeDeg={activeCardinalDeg} />
          <TickStrip offset={STRIP_WIDTH} activeDeg={activeCardinalDeg} />
        </div>
      </div>

      {/* center indicator — flat triangle + tick, no glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-10">
        <div
          className="w-0 h-0"
          style={{
            borderLeft: '4px solid transparent',
            borderRight: '4px solid transparent',
            borderTop: '5px solid #FF5C3A',
            filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.9))',
          }}
        />
        <div className="w-[1px] h-[9px] bg-[#FF5C3A]" />
      </div>
    </div>
  )
}

export default function Location(): JSX.Element | null {
  const showing = useStore(s => s.locationShowing)
  const location = useStore(s => s.location)
  const heading = useStore(s => s.heading)
  const blindfolded = useStore(s => s.blindfolded)
  const config = useStore(s => s.config)

  if (!showing || blindfolded) return null

  const hasCross = !!location.cross && !config.hideCrossStreet
  const rightText = hasCross ? location.cross : location.area

  return (
    <div
      className="absolute pointer-events-none flex flex-col items-center"
      style={{ top: 12, left: '50%', transform: 'translateX(-50%)' }}
    >
      {/* Compass row: main street | ribbon | cross street OR area fallback */}
      <div className="flex items-center gap-3">
        <span className="font-display font-bold uppercase tracking-[0.12em] text-[0.7vw] text-white/70 whitespace-nowrap drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,1)] text-right min-w-[120px]">
          {location.main}
        </span>
        <CompassRibbon heading={heading} />
        <span className="font-display font-bold uppercase tracking-[0.12em] text-[0.7vw] text-white/70 whitespace-nowrap drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,1)] text-left min-w-[120px]">
          {rightText || ''}
        </span>
      </div>

      {/* Area — only show below when we already used cross on the right */}
      {hasCross && location.area && (
        <span
          className="font-mono text-[0.68vw] uppercase tracking-[0.25em] drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,1)] mt-1"
          style={{ color: '#FF5C3A' }}
        >
          {location.area}
        </span>
      )}
    </div>
  )
}
