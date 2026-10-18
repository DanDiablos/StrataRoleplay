import React from 'react'
import { ChevronRight } from 'lucide-react'
import { cn } from '../../utils.ts'
import { sendNui } from '../../nui.ts'
import type { SubmenuOptions } from '../../types.ts'

interface SubmenuItem {
  id: string
  label: string
  options: SubmenuOptions
}

interface Props { data: SubmenuItem }

export default function Submenu({ data }: Props): React.ReactElement {
  const onClick = () => {
    if (data.options.disabled) return
    sendNui('FrontEndSound', { sound: 'SELECT' })
    sendNui('MenuOpen', { id: data.id })
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'border border-white/[0.06] border-l-[3px] border-l-transparent bg-menu-surface text-white text-[13px] h-[40px] w-full select-none mb-1.5 cursor-pointer transition-colors duration-150 hover:bg-menu-surface-lt flex items-center gap-2 px-4',
        data.options.disabled && 'opacity-40 cursor-default pointer-events-none',
      )}
    >
      <span className="flex-1 text-left font-medium tracking-[0.3px] uppercase">
        {data.label}
      </span>
      <ChevronRight size={14} className="text-white/25 shrink-0" />
    </button>
  )
}
