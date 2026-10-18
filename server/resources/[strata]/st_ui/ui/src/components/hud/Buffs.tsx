import { useEffect, useState } from 'react'
import { useStore } from '../../store.ts'
import {
  Coffee, Cigarette, BriefcaseMedical, Dumbbell, Zap, ShieldHalf,
  Trash2, Bandage, ShieldAlert, Gauge, AirVent, Circle,
  type LucideIcon,
} from 'lucide-react'

const BUFF_ICON_MAP: Record<string, LucideIcon> = {
  'mug-hot': Coffee,
  'joint': Cigarette,
  'suitcase-medical': BriefcaseMedical,
  'dumbbell': Dumbbell,
  'bolt-lightning': Zap,
  'shield-halved': ShieldHalf,
  'trash-can': Trash2,
  'bandage': Bandage,
  'shield-virus': ShieldAlert,
  'gauge-high': Gauge,
  'mask-ventilator': AirVent,
}

export default function Buffs(): React.ReactElement | null {
  const buffs = useStore(s => s.buffs)
  const buffDefs = useStore(s => s.buffDefs)

  if (buffs.length === 0) return null

  return (
    <div
      className="absolute flex gap-1.5 pointer-events-none"
      style={{
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
      }}
    >
      {buffs.map((b, i) => {
        const def = buffDefs[b.buff]
        if (!def) return null

        if (def.type === 'timed') {
          return <TimedBuff key={`${b.buff}-${i}`} instance={b} def={def} />
        }
        if (def.type === 'value') {
          return <ValueBuff key={`${b.buff}-${i}`} instance={b} def={def} />
        }
        return <PermBuff key={`${b.buff}-${i}`} def={def} />
      })}
    </div>
  )
}

function BuffCard({
  icon,
  color,
  pct,
  isLow,
}: {
  icon: string
  color: string
  pct: number
  isLow: boolean
}): React.ReactElement {
  const Icon = BUFF_ICON_MAP[icon] ?? Circle

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-menu-surface ${isLow ? 'animate-flash' : ''}`}
      style={{
        width: 42,
        height: 42,
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.55)',
      }}
    >
      {/* Left accent — identifies the buff by color, mirrors site SectionCard */}
      <div
        className="absolute left-0 top-0 bottom-0"
        style={{ width: 2, background: color }}
      />

      {/* Icon — flat color, no glow */}
      <Icon
        size={18}
        strokeWidth={2}
        className="relative drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]"
        style={{ color }}
      />

      {/* Bottom progress bar — flat, no glow */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[2px]"
        style={{ background: 'rgba(255,255,255,0.06)' }}
      >
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${Math.max(0, Math.min(100, pct))}%`,
            background: color,
          }}
        />
      </div>
    </div>
  )
}

interface BuffProps {
  instance: { buff: string; val: number; applied?: number; override?: string | null; options?: { customMax?: number; interval?: number } }
  def: { icon: string; color: string; duration: number; type: string }
}

function TimedBuff({ instance, def }: BuffProps): React.ReactElement {
  const [pct, setPct] = useState(100)
  const applied = instance.applied ?? Date.now()
  const duration = def.duration

  useEffect(() => {
    if (duration <= 0) return
    const interval = instance.options?.interval ?? 100
    const id = setInterval(() => {
      const elapsed = Date.now() - applied
      const remaining = Math.max(0, 1 - elapsed / duration)
      setPct(remaining * 100)
    }, interval)
    return () => clearInterval(id)
  }, [applied, duration, instance.options?.interval])

  const icon = instance.override ?? def.icon

  return <BuffCard icon={icon} color={def.color} pct={pct} isLow={pct < 20} />
}

function ValueBuff({ instance, def }: BuffProps): React.ReactElement {
  const customMax = instance.options?.customMax ?? 100
  const pct = customMax > 0 ? (instance.val / customMax) * 100 : 0
  const icon = instance.override ?? def.icon

  return <BuffCard icon={icon} color={def.color} pct={pct} isLow={pct < 20} />
}

function PermBuff({ def }: { def: { icon: string; color: string } }): React.ReactElement {
  return <BuffCard icon={def.icon} color={def.color} pct={100} isLow={false} />
}
