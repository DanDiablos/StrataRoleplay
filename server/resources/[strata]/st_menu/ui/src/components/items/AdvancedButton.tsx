import React from 'react'
import { cn } from '../../utils.ts'
import { sendNui } from '../../nui.ts'
import type { AdvancedOptions } from '../../types.ts'

interface AdvancedItem {
  id: string
  label: string
  options: AdvancedOptions
}

interface Props { data: AdvancedItem }

export default function AdvancedButton({ data }: Props): React.ReactElement {
  const onClick = () => {
    if (data.options.disabled) return
    sendNui('FrontEndSound', { sound: 'SELECT' })
    sendNui('Selected', { id: data.id })
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'border border-white/[0.06] border-l-[3px] border-l-transparent bg-menu-surface text-white text-[13px] h-[40px] w-full select-none mb-1.5 cursor-pointer transition-colors duration-150 hover:bg-menu-surface-lt flex items-center gap-3 px-4',
        data.options.disabled && 'opacity-40 cursor-default pointer-events-none',
      )}
    >
      {data.options.secondaryLabel && (
        <span className="text-[10px] text-white/40 font-mono bg-white/[0.05] px-1.5 py-0.5 shrink-0 tracking-wider uppercase">
          {data.options.secondaryLabel}
        </span>
      )}
      <span className="flex-1 text-left font-medium tracking-[0.3px] uppercase">
        {data.label}
      </span>
    </button>
  )
}
