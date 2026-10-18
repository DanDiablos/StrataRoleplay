import { useState } from 'react'
import { createPortal } from 'react-dom'

interface DeleteDialogProps {
  name: string
  onConfirm: () => void
  onCancel: () => void
}

export default function DeleteDialog({ name, onConfirm, onCancel }: DeleteDialogProps): React.ReactElement {
  const [input, setInput] = useState('')
  const matches = input.trim().toLowerCase() === name.toLowerCase()

  const handleConfirm = () => {
    if (!matches) return
    onConfirm()
  }

  return createPortal(
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/50">
      <div className="w-[340px] bg-[#1a1a1a] border border-white/[0.07] shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
        <div className="px-4 py-4 border-b border-white/[0.07]">
          <p className="font-display font-bold text-[1rem] text-white/90 m-0">Delete {name}?</p>
        </div>

        <div className="px-4 py-4 flex flex-col gap-3">
          <p className="text-[0.85rem] text-white/50 m-0">
            This is completely irreversible. Type{' '}
            <span className="font-mono text-white/90">{name}</span>{' '}
            to confirm.
          </p>
          <input
            autoFocus
            type="text"
            placeholder={name}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleConfirm() }}
            className="w-full font-mono text-[0.85rem] text-white/90 bg-transparent border border-white/10 px-3 py-2 placeholder-white/20 focus:border-white/30 transition-colors"
            style={{ borderColor: matches ? 'rgba(255,92,58,0.6)' : undefined }}
          />
        </div>

        <div className="px-4 py-3 border-t border-white/[0.07] flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="font-display font-bold text-[0.78rem] uppercase tracking-[0.03em] text-white/60 bg-white/[0.05] border border-white/[0.07] px-4 py-1.5 hover:text-white/80 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!matches}
            className="font-display font-bold text-[0.78rem] uppercase tracking-[0.03em] text-white px-4 py-1.5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={matches ? { background: 'linear-gradient(135deg,#FF5C3A,#FF8C42,#FFB347)' } : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
