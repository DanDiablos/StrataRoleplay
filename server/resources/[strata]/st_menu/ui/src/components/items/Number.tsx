import React, { useState } from 'react'
import { cn } from '../../utils.ts'
import { sendNui } from '../../nui.ts'
import type { NumberOptions } from '../../types.ts'

interface NumberItem {
  id: string
  label: string
  options: NumberOptions
}

interface Props { data: NumberItem }

export default function NumberInput({ data }: Props): React.ReactElement {
  const [value, setValue] = useState(String(data.options.current ?? ''))

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
    sendNui('Selected', { id: data.id, data: { value: e.target.value } })
  }

  return (
    <div
      className={cn(
        'border border-white/[0.06] border-l-[3px] border-l-transparent bg-menu-surface text-white w-full select-none mb-1.5 px-4 pt-3 pb-3',
        data.options.disabled && 'opacity-40',
      )}
    >
      <label className="block text-[10px] text-white/40 font-medium uppercase tracking-[0.5px] mb-2">
        {data.label}
      </label>
      <input
        type="number"
        value={value}
        onChange={onChange}
        disabled={data.options.disabled}
        className="w-full bg-transparent text-white/80 font-mono text-[13px] border-0 border-b border-white/[0.08] outline-none"
      />
    </div>
  )
}
