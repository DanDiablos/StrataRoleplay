import React, { useState } from 'react'
import { ChromePicker } from 'react-color'
import type { ColorResult } from 'react-color'
import { cn } from '../../utils.ts'
import { sendNui } from '../../nui.ts'
import type { ColorPickerOptions, RgbColor } from '../../types.ts'

interface ColorPickerItem {
  id: string
  label: string
  options: ColorPickerOptions
}

interface Props { data: ColorPickerItem }

const rgbStr = (c: RgbColor) => `rgb(${c.r},${c.g},${c.b})`

export default function ColorPicker({ data }: Props): React.ReactElement {
  const [open,    setOpen]    = useState(false)
  const [current, setCurrent] = useState<RgbColor>(data.options.current)
  const [picking, setPicking] = useState<RgbColor>(current)

  const onOpen = () => {
    if (data.options.disabled) return
    setOpen(true)
  }

  const onSave = () => {
    setCurrent(picking)
    sendNui('Selected', { id: data.id, data: { color: picking } })
    setOpen(false)
  }

  const onPickChange = (c: ColorResult) => {
    setPicking({ r: c.rgb.r, g: c.rgb.g, b: c.rgb.b })
  }

  return (
    <>
      <button
        onClick={onOpen}
        className={cn(
          'border border-white/[0.06] border-l-[3px] border-l-transparent text-white text-[13px] h-[40px] w-full select-none mb-1.5 cursor-pointer flex items-center gap-3 px-4 transition-[filter] duration-150 hover:brightness-110',
          data.options.disabled && 'opacity-40 cursor-default pointer-events-none',
        )}
        style={{ background: rgbStr(current) }}
      >
        <span className="[text-shadow:1px_1px_4px_rgba(0,0,0,0.8)] font-medium text-[12px] uppercase tracking-[0.5px]">
          {data.label || 'Select Color'}
        </span>
        <span className="[text-shadow:1px_1px_4px_rgba(0,0,0,0.8)] font-mono text-[11px] text-white/70 ml-auto">
          rgb({current.r}, {current.g}, {current.b})
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60" onClick={() => setOpen(false)}>
          <div className="bg-menu-surface border border-white/[0.08] p-4 flex flex-col gap-3" onClick={e => e.stopPropagation()}>
            <div className="text-[11px] text-white/40 font-medium uppercase tracking-[0.5px]">Select Color</div>
            <ChromePicker
              color={picking}
              disableAlpha
              onChange={onPickChange}
            />
            <button
              onClick={onSave}
              className="bg-menu-success text-white text-[12px] font-medium uppercase tracking-[0.5px] py-2 px-4 cursor-pointer hover:brightness-110 transition-[filter] border-0"
            >
              Confirm
            </button>
          </div>
        </div>
      )}
    </>
  )
}
