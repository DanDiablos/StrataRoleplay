import { Fuel, Wrench, ShieldCheck } from 'lucide-react'
import { useStore } from '../../store.ts'

const BOX_BG = '#141414'
const BOX_BORDER = '1px solid rgba(255,255,255,0.08)'
const BOX_SHADOW = '0 2px 8px rgba(0,0,0,0.55)'

/* ---- Vertical stat column inside the status box ---- */
function StatCell({
  icon,
  value,
  color,
}: {
  icon: React.ReactNode
  value: number
  color: string
}): JSX.Element {
  const pct = Math.max(0, Math.min(100, value))
  return (
    <div className="relative w-[26px] h-full overflow-hidden bg-black/30">
      {/* flat fill from bottom */}
      <div
        className="absolute left-0 right-0 bottom-0 transition-[height] duration-400 ease-out"
        style={{ height: `${pct}%`, background: color, opacity: 0.85 }}
      />
      {/* 1px accent line at the fill edge */}
      <div
        className="absolute left-0 right-0 transition-[bottom] duration-400 ease-out pointer-events-none"
        style={{
          bottom: `${pct}%`,
          height: '1px',
          background: color,
          opacity: pct > 0 && pct < 100 ? 1 : 0,
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-white/90 drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]">{icon}</div>
      </div>
    </div>
  )
}

/* ---- RPM bar — segmented tachometer, flat segments, no glow ---- */
function RpmBar({ value }: { value: number }): JSX.Element {
  const pct = Math.max(0, Math.min(100, value))
  const segments = 18
  const lit = Math.round((pct / 100) * segments)

  return (
    <div
      className="relative flex items-stretch gap-[2px] h-[14px] p-[2px]"
      style={{ background: BOX_BG, border: BOX_BORDER, boxShadow: BOX_SHADOW, width: 'calc(100% + 4px)', marginLeft: -4 }}
    >
      {Array.from({ length: segments }, (_, i) => {
        const on = i < lit
        const color = i >= segments - 4 ? '#FE2436' : '#FF5C3A'
        return (
          <div
            key={i}
            className="flex-1 transition-colors duration-100"
            style={{
              background: on ? color : 'rgba(255,255,255,0.05)',
            }}
          />
        )
      })}
    </div>
  )
}

/* ---- Horizontal fuel bar ---- */
function FuelBar({ value }: { value: number }): JSX.Element {
  const pct = Math.max(0, Math.min(100, value))
  const color = pct <= 15 ? '#FE2436' : pct <= 35 ? '#f09348' : '#FF5C3A'

  return (
    <div
      className="relative w-[210px] overflow-hidden flex items-center"
      style={{ background: BOX_BG, border: BOX_BORDER, boxShadow: BOX_SHADOW }}
    >
      <div
        className="absolute top-0 bottom-0 left-0 transition-[width] duration-400 ease-out"
        style={{ width: `${pct}%`, background: color, opacity: 0.85 }}
      />
      <div
        className="absolute top-0 bottom-0 transition-[left] duration-400 ease-out pointer-events-none"
        style={{
          left: `${pct}%`,
          width: '1px',
          background: color,
          opacity: pct > 0 && pct < 100 ? 1 : 0,
        }}
      />
      <div className="relative flex items-center px-2">
        <Fuel size={13} className="text-white/90 drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]" />
      </div>
    </div>
  )
}

export default function VehicleHud(): JSX.Element | null {
  const showing = useStore(s => s.vehicleShowing)
  const speed = useStore(s => s.speed)
  const rpm = useStore(s => s.rpm)
  const fuel = useStore(s => s.fuel)
  const engineHealth = useStore(s => s.engineHealth)
  const seatbelt = useStore(s => s.seatbelt)
  const speedMeasure = useStore(s => s.speedMeasure)
  const ignition = useStore(s => s.ignition)
  const currentGear = ignition ? 'D' : 'P'

  if (!showing) return null

  const rpmScaled = Math.round(rpm * 100)
  const speedInt = Math.round(speed)
  const speedStr = String(speedInt)
  const speedPadded = speedStr.padStart(3, '0')

  return (
    <div
      className="absolute flex flex-col items-end gap-1.5"
      style={{ bottom: 22, right: 24, width: 274 }}
    >
      {/* Speed readout — large number, gear, and unit all sized to read as one statement */}
      <div className="w-full flex items-baseline gap-3 px-1">
        <span className="font-mono font-medium tabular-nums leading-none text-[48px] tracking-[0.04em] drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,1)]">
          <span className="text-white/15">{speedPadded.slice(0, speedPadded.length - speedStr.length)}</span>
          <span className="text-white">{speedStr}</span>
        </span>
        <span className="font-display font-bold uppercase tracking-[0.12em] text-[18px] leading-none text-white/45 whitespace-nowrap drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,1)]">
          {speedMeasure}
        </span>
        <span className="font-display font-black text-white/90 tabular-nums text-[28px] leading-none drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,1)] ml-auto">
          {currentGear}
        </span>
      </div>

      {/* RPM bar */}
      <RpmBar value={rpmScaled} />

      {/* Status row: [health box] [seatbelt box] [long horizontal fuel bar] */}
      <div className="flex gap-1.5 items-stretch h-[26px] self-end">
        <div style={{ background: BOX_BG, border: BOX_BORDER, boxShadow: BOX_SHADOW }}>
          <StatCell icon={<Wrench size={13} />} value={engineHealth} color="#52984a" />
        </div>
        <div style={{ background: BOX_BG, border: BOX_BORDER, boxShadow: BOX_SHADOW }}>
          <StatCell
            icon={<ShieldCheck size={13} />}
            value={seatbelt ? 100 : 0}
            color={seatbelt ? '#2B78FC' : '#FE2436'}
          />
        </div>
        <FuelBar value={fuel} />
      </div>
    </div>
  )
}
