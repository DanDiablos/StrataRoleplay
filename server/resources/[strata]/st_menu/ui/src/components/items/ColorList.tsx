import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../utils.ts'
import { sendNui } from '../../nui.ts'
import type { ColorListOptions, ColorOption } from '../../types.ts'

interface ColorListItem {
  id: string
  label: string
  options: ColorListOptions
}

interface Props { data: ColorListItem }

const colorToCSS = (c: ColorOption): string =>
  c.rgb ? `rgb(${c.rgb.r},${c.rgb.g},${c.rgb.b})` : (c.hex ?? '#000')

export default function ColorList({ data }: Props): React.ReactElement {
  const [open,    setOpen]    = useState(false)
  const [current, setCurrent] = useState<ColorOption>(data.options.colors[data.options.current])

  const onOpen = () => {
    if (data.options.disabled) return
    setOpen(true)
  }

  const onPick = (color: ColorOption) => {
    setCurrent(color)
    setOpen(false)
    sendNui('Selected', { id: data.id, data: { color } })
  }

  return (
    <>
      <button
        onClick={onOpen}
        className={cn(
          'border border-white/[0.06] border-l-[3px] border-l-transparent bg-menu-surface text-white text-[13px] h-[40px] w-full select-none mb-1.5 cursor-pointer transition-colors duration-150 hover:bg-menu-surface-lt flex items-center gap-3 px-4',
          data.options.disabled && 'opacity-40 cursor-default pointer-events-none',
        )}
      >
        <span
          className="w-5 h-5 shrink-0 border border-white/20"
          style={{ background: colorToCSS(current) }}
        />
        <span className="flex-1 text-left font-medium tracking-[0.3px] uppercase">
          {current.label}
        </span>
        <ChevronDown size={13} className="text-white/25 shrink-0" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60" onClick={() => setOpen(false)}>
          <div className="bg-menu-surface border border-white/[0.08] w-[380px] max-h-[480px] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="px-4 py-3 border-b border-white/[0.06] text-[11px] text-white/40 font-medium uppercase tracking-[0.5px]">
              Select Color
            </div>
            {data.options.colors.map((color, i) => (
              <button
                key={i}
                onClick={() => onPick(color)}
                className="w-full flex items-center gap-3 h-[40px] border-b border-white/[0.04] bg-menu-surface hover:bg-menu-surface-lt transition-colors cursor-pointer px-4"
              >
                <span
                  className="w-5 h-5 shrink-0 border border-white/20"
                  style={{ background: colorToCSS(color) }}
                />
                <span className="flex-1 text-left text-white text-[13px] font-medium tracking-[0.3px] uppercase">
                  {color.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
