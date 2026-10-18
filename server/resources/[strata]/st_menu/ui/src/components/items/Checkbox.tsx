import React, { useState } from 'react'
import { Square, CheckSquare } from 'lucide-react'
import { cn } from '../../utils.ts'
import { sendNui } from '../../nui.ts'
import type { CheckboxOptions } from '../../types.ts'

interface CheckboxItem {
  id: string
  label: string
  options: CheckboxOptions
}

interface Props { data: CheckboxItem }

export default function Checkbox({ data }: Props): React.ReactElement {
  const [checked, setChecked] = useState(data.options.selected ?? false)

  const onClick = () => {
    if (data.options.disabled) return
    const next = !checked
    setChecked(next)
    sendNui('FrontEndSound', { sound: 'SELECT' })
    sendNui('Selected', { id: data.id, data: { selected: next } })
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'border border-white/[0.06] border-l-[3px] border-l-transparent bg-menu-surface text-white text-[13px] h-[40px] w-full select-none mb-1.5 cursor-pointer transition-colors duration-150 hover:bg-menu-surface-lt flex items-center gap-3 px-4',
        data.options.disabled && 'opacity-40 cursor-default pointer-events-none',
      )}
    >
      <span className={cn('shrink-0 transition-colors duration-150', checked ? 'text-primary' : 'text-white/25')}>
        {checked ? <CheckSquare size={15} /> : <Square size={15} />}
      </span>
      <span className="flex-1 text-left font-medium tracking-[0.3px] uppercase">
        {data.label}
      </span>
    </button>
  )
}
