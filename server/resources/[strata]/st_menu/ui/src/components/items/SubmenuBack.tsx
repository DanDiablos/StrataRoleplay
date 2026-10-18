import React from 'react'
import { ChevronLeft } from 'lucide-react'
import { cn } from '../../utils.ts'
import { sendNui } from '../../nui.ts'
import { useStore } from '../../store.ts'
import type { GoBackOptions } from '../../types.ts'

interface GoBackItem {
  id: string
  label: string
  options: GoBackOptions
}

interface Props { data: GoBackItem }

export default function SubmenuBack({ data }: Props): React.ReactElement {
  const subMenuBack = useStore(s => s.subMenuBack)

  const onClick = () => {
    if (data.options.disabled) return
    sendNui('FrontEndSound', { sound: 'BACK' })
    sendNui('Selected', { id: data.id })
    subMenuBack()
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'border border-white/[0.06] border-l-[3px] border-l-menu-error-lt bg-menu-surface text-white text-[13px] h-[40px] w-full select-none mb-1.5 cursor-pointer transition-colors duration-150 hover:bg-menu-surface-lt flex items-center gap-2 px-4',
        data.options.disabled && 'opacity-40 cursor-default pointer-events-none',
      )}
    >
      <ChevronLeft size={14} className="text-menu-error-lt/60 shrink-0" />
      <span className="flex-1 text-left font-medium tracking-[0.3px] uppercase">
        {data.label}
      </span>
    </button>
  )
}
