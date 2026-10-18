import React from 'react'
import { cn } from '../../utils.ts'
import { sendNui } from '../../nui.ts'
import type { ButtonOptions } from '../../types.ts'

interface ButtonItem {
  id: string
  label: string
  options: ButtonOptions
}

interface Props { data: ButtonItem }

export default function Button({ data }: Props): React.ReactElement {
  const onClick = () => {
    if (data.options.disabled) return
    sendNui('FrontEndSound', { sound: 'SELECT' })
    sendNui('Selected', { id: data.id })
  }

  const accent = data.options.error
    ? 'border-l-menu-error-lt'
    : data.options.success
    ? 'border-l-menu-success'
    : 'border-l-transparent'

  return (
    <button
      onClick={onClick}
      className={cn(
        'border border-white/[0.06] border-l-[3px] bg-menu-surface text-white text-[13px] h-[40px] w-full select-none mb-1.5 cursor-pointer transition-colors duration-150 hover:bg-menu-surface-lt flex items-center px-4 font-medium tracking-[0.3px] uppercase',
        accent,
        data.options.disabled && 'opacity-40 cursor-default pointer-events-none',
      )}
    >
      {data.label}
    </button>
  )
}
