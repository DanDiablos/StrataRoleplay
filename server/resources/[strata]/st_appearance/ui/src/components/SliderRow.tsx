interface Props {
  label: string
  value: number
  min?: number
  max: number
  step?: number
  onChange: (value: number) => void
  disabled?: boolean
}

export default function SliderRow({ label, value, min = 0, max, step = 1, onChange, disabled }: Props): React.ReactElement {
  return (
    <div className={`flex items-center px-4 py-2.5 border-b border-white/[0.06] last:border-0 gap-3 ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
      <span className="w-[130px] shrink-0 font-mono text-[0.68rem] uppercase tracking-[0.05em] text-white/40">
        {label}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1"
      />
      <span className="w-8 text-right font-mono text-[0.72rem] text-white/60 shrink-0">
        {value}
      </span>
    </div>
  )
}
