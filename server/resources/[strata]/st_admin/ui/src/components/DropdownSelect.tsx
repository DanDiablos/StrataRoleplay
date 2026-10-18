import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'

export interface SelectOption {
  value: string
  label: string
}

interface Props {
  value: string
  onChange: (v: string) => void
  options: SelectOption[]
  label?: string
  className?: string
  disabled?: boolean
}

export default function DropdownSelect({ value, onChange, options, label, className = '', disabled = false }: Props): React.ReactElement {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const current = options.find((o) => o.value === value)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={ref} className={`relative ${className}`}>
      {label && (
        <div className="text-[0.68rem] text-white/30 uppercase tracking-[0.5px] mb-1 font-medium">{label}</div>
      )}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={`w-full h-9 flex items-center justify-between gap-2 px-3 bg-menu-surface-lt border text-[0.85rem] text-white/70 transition-colors
          ${open ? 'border-primary/50' : 'border-white/10 hover:border-white/20'}
          ${disabled ? 'opacity-40 pointer-events-none' : ''}`}
      >
        <span className="truncate">{current?.label ?? value}</span>
        <ChevronDown size={12} className={`shrink-0 text-white/35 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full mt-1 left-0 right-0 z-50 bg-menu-surface-lt border border-white/10 max-h-48 overflow-y-auto">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false) }}
              className={`w-full text-left px-3 py-2 text-[0.85rem] transition-colors
                ${opt.value === value
                  ? 'bg-primary/12 text-primary'
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
