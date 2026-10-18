import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '../../utils.ts'
import { sendNui } from '../../nui.ts'
import type { SelectOptions, SelectOption } from '../../types.ts'

interface SelectItem {
  id: string
  label: string
  options: SelectOptions
}

interface Props { data: SelectItem }

export default function Select({ data }: Props): React.ReactElement {
  const [value, setValue] = useState(data.options.current)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const current = data.options.list.find(o => o.value === value) ?? data.options.list[0]

  const select = (opt: SelectOption) => {
    setValue(opt.value)
    setOpen(false)
    sendNui('Selected', { id: data.id, data: { value: opt.value } })
  }

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div
      ref={ref}
      className={cn(
        'relative border border-white/[0.06] border-l-[3px] bg-menu-surface text-white w-full select-none mb-1.5',
        open ? 'border-l-primary' : 'border-l-transparent',
        data.options.disabled && 'opacity-40 pointer-events-none',
      )}
    >
      {/* Trigger */}
      <button
        type="button"
        onClick={() => !data.options.disabled && setOpen(o => !o)}
        className="flex items-center w-full h-[40px] px-4 gap-2 text-left cursor-pointer hover:bg-menu-surface-lt transition-colors"
      >
        <span className="flex-1 text-[12px] font-medium uppercase tracking-[0.3px] truncate">
          {data.label}
        </span>
        <span className="font-mono text-[12px] text-white/60 truncate max-w-[120px]">
          {current?.label ?? '—'}
        </span>
        <ChevronDown
          size={13}
          className={cn(
            'text-white/40 shrink-0 transition-transform duration-150',
            open && 'rotate-180 text-primary',
          )}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute left-0 right-0 z-50 border border-white/[0.08] border-t-0 overflow-hidden"
          style={{ background: 'rgba(10,10,10,0.98)', boxShadow: '0 8px 24px rgba(0,0,0,0.8)' }}
        >
          <div className="max-h-[200px] overflow-y-auto">
            {data.options.list.map(opt => {
              const active = opt.value === value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => select(opt)}
                  className={cn(
                    'flex items-center w-full h-[34px] px-4 gap-2 text-left cursor-pointer transition-colors',
                    active
                      ? 'bg-white/[0.06] text-white'
                      : 'text-white/50 hover:bg-menu-surface-lt hover:text-white',
                  )}
                >
                  <span className="flex-1 text-[11px] font-medium uppercase tracking-[0.3px] truncate">
                    {opt.label}
                  </span>
                  {active && <Check size={11} className="shrink-0 text-white/60" />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
