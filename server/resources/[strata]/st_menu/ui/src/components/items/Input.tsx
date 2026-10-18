import React, { useState } from 'react'
import { cn } from '../../utils.ts'
import { sendNui } from '../../nui.ts'
import type { InputOptions } from '../../types.ts'

interface InputItem {
  id: string
  label: string
  options: InputOptions
}

interface Props { data: InputItem }

export default function Input({ data }: Props): React.ReactElement {
  const [value, setValue] = useState(data.options.current ?? '')

  const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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
      <textarea
        value={value}
        onChange={onChange}
        disabled={data.options.disabled}
        maxLength={data.options.max ?? 1024}
        rows={2}
        className="w-full bg-transparent text-white text-[13px] border-0 border-b border-white/[0.08] outline-none resize-none leading-relaxed font-sans"
      />
    </div>
  )
}
