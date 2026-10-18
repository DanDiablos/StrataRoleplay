import React, { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../../utils.ts'
import { sendNui } from '../../nui.ts'
import type { TickerOptions } from '../../types.ts'

interface TickerItem {
  id: string
  label: string
  options: TickerOptions
}

interface Props { data: TickerItem }

export default function Ticker({ data }: Props): React.ReactElement {
  const { min = 0, max, current, disabled } = data.options
  const [value, setValue] = useState(current)

  const send = (v: number) => {
    sendNui('FrontEndSound', { sound: 'UPDOWN' })
    sendNui('Selected', { id: data.id, data: { value: v } })
  }

  const onLeft = () => {
    if (disabled) return
    const next = value - 1 < min ? max : value - 1
    setValue(next)
    send(next)
  }

  const onRight = () => {
    if (disabled) return
    const next = value + 1 > max ? min : value + 1
    setValue(next)
    send(next)
  }

  const onInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return
    let v = parseInt(e.target.value, 10)
    if (isNaN(v)) v = min
    else if (v > max) v = max
    else if (v < min) v = min
    setValue(v)
    send(v)
  }

  return (
    <div
      className={cn(
        'border border-white/[0.06] border-l-[3px] border-l-transparent bg-menu-surface text-white text-[13px] h-[40px] w-full select-none mb-1.5 flex items-center px-4',
        disabled && 'opacity-40',
      )}
    >
      <span className="flex-1 font-medium tracking-[0.3px] uppercase">
        {data.label}
      </span>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onLeft}
          className="text-white/40 hover:text-white transition-colors cursor-pointer bg-transparent border-0 p-1 leading-none"
        >
          <ChevronLeft size={14} />
        </button>
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={value}
            onChange={onInput}
            disabled={disabled}
            min={min}
            max={max}
            className="w-[28px] bg-transparent text-white/80 font-mono text-[12px] text-center border-0 border-b border-white/10 outline-none"
          />
          <span className="text-white/25 text-[11px] font-mono">/ {max}</span>
        </div>
        <button
          onClick={onRight}
          className="text-white/40 hover:text-white transition-colors cursor-pointer bg-transparent border-0 p-1 leading-none"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}
