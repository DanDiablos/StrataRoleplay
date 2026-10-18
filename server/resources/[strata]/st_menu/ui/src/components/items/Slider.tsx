import React, { useState } from 'react'
import { CheckCircle } from 'lucide-react'
import { cn } from '../../utils.ts'
import { sendNui } from '../../nui.ts'
import type { SliderOptions } from '../../types.ts'

interface SliderItem {
  id: string
  label: string
  options: SliderOptions
}

interface Props { data: SliderItem }

export default function Slider({ data }: Props): React.ReactElement {
  const [current, setCurrent] = useState(data.options.current)
  const [saved,   setSaved]   = useState(current)
  const isDirty = current !== saved

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (data.options.disabled) return
    setCurrent(Number(e.target.value))
  }

  const onSave = () => {
    if (data.options.disabled || !isDirty) return
    setSaved(current)
    sendNui('FrontEndSound', { sound: 'SELECT' })
    sendNui('Selected', { id: data.id, data: { value: current } })
  }

  return (
    <div
      className={cn(
        'border border-white/[0.06] border-l-[3px] border-l-transparent bg-menu-surface text-white w-full select-none mb-1.5 px-4 pt-3 pb-3',
        data.options.disabled && 'opacity-40',
      )}
    >
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[11px] text-white/40 font-medium uppercase tracking-[0.5px]">
          {data.label}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-white/80 font-mono">{current}</span>
          {isDirty && (
            <button
              onClick={onSave}
              className="text-menu-success-lt hover:text-menu-success transition-colors cursor-pointer bg-transparent border-0 p-0 leading-none"
            >
              <CheckCircle size={14} />
            </button>
          )}
        </div>
      </div>
      <input
        type="range"
        value={current}
        min={data.options.min}
        max={data.options.max}
        step={data.options.step ?? 1}
        onChange={onChange}
        disabled={data.options.disabled}
        className="w-full"
      />
    </div>
  )
}
