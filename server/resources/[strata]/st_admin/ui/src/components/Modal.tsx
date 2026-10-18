import React, { FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

interface Props {
  open: boolean
  title: string
  children?: React.ReactNode
  onClose: () => void
  onSubmit?: (e: FormEvent<HTMLFormElement>) => void
  onAccept?: () => void
  submitLang?: string
  acceptLang?: string
}

export default function Modal({
  open, title, children, onClose, onSubmit, onAccept, submitLang = 'Submit', acceptLang = 'Accept',
}: Props): React.ReactElement | null {
  if (!open) return null

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onSubmit?.(e)
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-[420px] bg-menu-surface border border-menu-border flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-menu-bg/60">
          <span className="font-display font-bold uppercase tracking-[2px] text-[0.78rem] text-white/70">
            {title}
          </span>
          <button onClick={onClose} className="text-white/30 hover:text-white/70 transition-colors">
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        {onSubmit ? (
          <form onSubmit={handleSubmit}>
            <div className="p-4 flex flex-col gap-3">{children}</div>
            <div className="flex gap-2 px-4 pb-4">
              <button
                type="submit"
                className="flex-1 py-2 px-4 border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 text-[0.82rem] font-semibold uppercase tracking-[0.3px] transition-colors"
              >
                {submitLang}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="py-2 px-4 border border-white/10 bg-white/3 text-white/50 hover:bg-white/7 text-[0.82rem] font-semibold uppercase tracking-[0.3px] transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="p-4 text-[0.88rem] text-white/70">{children}</div>
            <div className="flex gap-2 px-4 pb-4">
              {onAccept && (
                <button
                  onClick={onAccept}
                  className="flex-1 py-2 px-4 border border-menu-error-lt/40 bg-menu-error/20 text-red-300 hover:bg-menu-error/35 text-[0.82rem] font-semibold uppercase tracking-[0.3px] transition-colors"
                >
                  {acceptLang}
                </button>
              )}
              <button
                onClick={onClose}
                className="flex-1 py-2 px-4 border border-white/10 bg-white/3 text-white/50 hover:bg-white/7 text-[0.82rem] font-semibold uppercase tracking-[0.3px] transition-colors"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  )
}
