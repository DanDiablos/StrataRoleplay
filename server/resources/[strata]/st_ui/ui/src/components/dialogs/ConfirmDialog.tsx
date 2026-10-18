import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle } from 'lucide-react'
import { useStore } from '../../store.ts'
import { sendNui } from '../../nui.ts'
import DOMPurify from 'dompurify'
import parse from 'html-react-parser'

export default function ConfirmDialog(): JSX.Element | null {
  const showing = useStore(s => s.confirmShowing)
  const title = useStore(s => s.confirmTitle)
  const description = useStore(s => s.confirmDescription)
  const yes = useStore(s => s.confirmYes)
  const no = useStore(s => s.confirmNo)
  const data = useStore(s => s.confirmData)
  const denyLabel = useStore(s => s.confirmDenyLabel)
  const acceptLabel = useStore(s => s.confirmAcceptLabel)
  const dispatch = useStore(s => s.dispatch)

  useEffect(() => {
    if (!showing) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleDeny()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [showing])

  if (!showing) return null

  const handleAccept = () => {
    sendNui('Confirm:Yes', { event: yes, data })
    dispatch('CLOSE_CONFIRM')
  }

  const handleDeny = () => {
    sendNui('Confirm:No', { event: no, data })
    dispatch('CLOSE_CONFIRM')
  }

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center animate-fade-in" style={{ zIndex: 130 }}>
      <div className="absolute inset-0 bg-black/40" onClick={handleDeny} />
      <div
        className="relative w-[360px] border overflow-hidden"
        style={{
          background: 'rgba(10,10,10,0.92)',
          borderColor: 'rgba(255,92,58,0.25)',
        }}
      >
        {/* Left accent */}
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#FF5C3A]" />

        {/* Header */}
        <div className="flex items-center gap-2.5 px-4 py-3 pl-5">
          <AlertTriangle size={16} className="text-[#FF5C3A] shrink-0" />
          <span className="text-[0.82rem] font-bold text-white/80 drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,1)]">
            {title}
          </span>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-white/[0.06]" />

        {/* Body */}
        {description && (
          <div className="px-4 py-4 pl-5 text-[0.78rem] text-white/60 leading-relaxed drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,1)]">
            {parse(DOMPurify.sanitize(description))}
          </div>
        )}

        {/* Divider */}
        <div className="h-px w-full bg-white/[0.06]" />

        {/* Footer */}
        <div className="flex justify-end gap-2 px-4 py-3 pl-5">
          <button
            onClick={handleDeny}
            className="h-8 px-4 flex items-center justify-center border text-[0.75rem] font-bold text-white/50 transition-colors hover:text-white/70"
            style={{
              background: 'rgba(255,255,255,0.03)',
              borderColor: 'rgba(255,255,255,0.1)',
            }}
          >
            {denyLabel}
          </button>
          <button
            onClick={handleAccept}
            className="h-8 px-4 flex items-center justify-center border text-[0.75rem] font-bold text-[#FF5C3A] transition-colors hover:bg-[#FF5C3A]/15"
            style={{
              background: 'rgba(255,92,58,0.08)',
              borderColor: 'rgba(255,92,58,0.3)',
            }}
          >
            {acceptLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
