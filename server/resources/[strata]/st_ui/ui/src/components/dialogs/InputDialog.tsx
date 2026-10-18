import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useStore } from '../../store.ts'
import { sendNui } from '../../nui.ts'
import type { InputField } from '../../store.ts'

export default function InputDialog(): React.ReactElement | null {
  const showing = useStore(s => s.inputShowing)
  const event = useStore(s => s.inputEvent)
  const title = useStore(s => s.inputTitle)
  const data = useStore(s => s.inputData)
  const options = useStore(s => s.inputOptions)
  const dispatch = useStore(s => s.dispatch)

  const [values, setValues] = useState<Record<string, string>>({})

  useEffect(() => {
    if (showing && options) {
      const init: Record<string, string> = {}
      options.forEach(f => { init[f.id] = '' })
      setValues(init)
    }
  }, [showing, options])

  useEffect(() => {
    if (!showing) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [showing])

  if (!showing) return null

  const handleClose = () => {
    sendNui('Input:Close', { event, values: false, data })
    dispatch('CLOSE_INPUT')
  }

  const handleSubmit = () => {
    sendNui('Input:Submit', { event, values, data })
    dispatch('CLOSE_INPUT')
  }

  const handleChange = (id: string, val: string) => {
    setValues(prev => ({ ...prev, [id]: val }))
  }

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center animate-fade-in" style={{ zIndex: 120 }}>
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} />
      <div
        className="relative w-[420px] border-l-[3px] border-l-primary border border-white/8"
        style={{ background: 'rgba(10,10,10,0.95)' }}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-white/[0.06]">
          <span className="font-display font-bold uppercase tracking-[0.12em] text-[0.78rem] text-white/70">
            {title}
          </span>
        </div>

        {/* Fields */}
        <div className="px-4 py-4 flex flex-col gap-3">
          {options?.map((field: InputField) => (
            <div key={field.id} className="flex flex-col gap-1">
              {field.label && (
                <label className="font-mono text-[0.65rem] text-white/40 uppercase tracking-wider">
                  {field.label}
                </label>
              )}
              {field.type === 'select' && field.config?.select ? (
                <SelectField
                  options={field.config.select}
                  value={values[field.id] ?? ''}
                  onChange={val => handleChange(field.id, val)}
                />
              ) : field.type === 'multiline' ? (
                <textarea
                  value={values[field.id] ?? ''}
                  onChange={e => handleChange(field.id, e.target.value)}
                  className="h-24 px-3 py-2 bg-menu-surface-lt border border-white/10 text-[0.88rem] text-white/80 placeholder-white/25 focus:border-primary/50 transition-colors resize-none"
                  maxLength={(field.options?.maxLength as number) ?? undefined}
                />
              ) : (
                <input
                  type={field.type === 'number' ? 'number' : 'text'}
                  value={values[field.id] ?? ''}
                  onChange={e => handleChange(field.id, e.target.value)}
                  className="h-9 px-3 bg-menu-surface-lt border border-white/10 text-[0.88rem] text-white/80 placeholder-white/25 focus:border-primary/50 transition-colors"
                  maxLength={(field.options?.maxLength as number) ?? undefined}
                />
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-4 py-3 border-t border-white/[0.06]">
          <button
            onClick={handleClose}
            className="px-[14px] py-[5px] border text-[0.8rem] font-semibold border-white/10 bg-white/4 text-white/60 hover:bg-primary/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-[14px] py-[5px] border text-[0.8rem] font-semibold border-primary/35 bg-primary/8 text-[#FF8C42] hover:bg-primary/15 transition-colors"
          >
            Submit
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

function SelectField({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[]
  value: string
  onChange: (val: string) => void
}): React.ReactElement {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const close = () => setOpen(false)
    window.addEventListener('mousedown', close)
    return () => window.removeEventListener('mousedown', close)
  }, [open])

  const selected = options.find(o => o.value === value)

  return (
    <div className="relative" onMouseDown={e => e.stopPropagation()}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full h-9 px-3 flex items-center justify-between bg-menu-surface-lt border border-white/10 text-[0.88rem] text-white/80 hover:border-primary/50 transition-colors"
      >
        <span>{selected?.label ?? 'Select...'}</span>
        <span className="text-white/30 text-[0.65rem]">&#9662;</span>
      </button>
      {open && (
        <div
          className="absolute left-0 right-0 top-full mt-1 border border-white/10 max-h-40 overflow-y-auto"
          style={{ background: 'rgba(20,20,20,0.98)', zIndex: 10 }}
        >
          {options.map(o => (
            <div
              key={o.value}
              onClick={() => { onChange(o.value); setOpen(false) }}
              className="px-3 py-2 text-[0.82rem] text-white/70 cursor-pointer hover:bg-primary/10 transition-colors"
            >
              {o.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
