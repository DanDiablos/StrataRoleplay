import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

interface ModalProps {
  title: string
  onClose: () => void
  children: React.ReactNode
  width?: string
}

export default function Modal({ title, onClose, children, width = 'w-[480px]' }: ModalProps): React.ReactElement {
  return createPortal(
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60">
      <div
        className={`${width} max-h-[80vh] flex flex-col bg-menu-surface border border-white/[0.08] animate-fade-in`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="h-[44px] flex items-center px-4 border-b border-white/[0.06] bg-menu-surface-lt shrink-0">
          <span className="flex-1 font-display font-bold uppercase tracking-[2px] text-[0.72rem] text-white/70">
            {title}
          </span>
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center text-white/30 hover:text-white/70 transition-colors"
          >
            <X size={13} />
          </button>
        </div>
        {/* Body */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}
