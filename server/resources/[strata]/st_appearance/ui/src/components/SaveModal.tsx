import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import type { AppState } from '../store.ts'

const STATE_LABELS: Record<AppState, string> = {
  CREATOR: 'Create Character',
  SHOP:    'Purchase Changes',
  BARBER:  'Pay for Haircut',
  TATTOO:  'Apply Tattoos',
  SURGERY: 'Confirm Surgery',
}

interface Props {
  open: boolean
  appState: AppState | null
  price?: number
  saving: boolean
  onConfirm: () => void
  onClose: () => void
}

export default function SaveModal({ open, appState, price, saving, onConfirm, onClose }: Props): React.ReactElement | null {
  if (!open) return null

  const label     = appState ? STATE_LABELS[appState] : 'Save Changes'
  const hasPrice  = price !== undefined && price > 0
  const formatted = hasPrice
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price!)
    : null

  return createPortal(
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-[380px] bg-menu-surface border border-white/10 flex flex-col animate-fade-in">
        <div className="flex items-center justify-between px-4 py-3 bg-menu-bg/60 border-b border-white/[0.06]">
          <span className="font-display font-bold uppercase tracking-[2px] text-[0.78rem] text-white/70">
            {label}
          </span>
          <button onClick={onClose} className="text-white/30 hover:text-white/70 transition-colors">
            <X size={14} />
          </button>
        </div>

        <div className="px-4 py-4 flex flex-col gap-3">
          {hasPrice ? (
            <div className="flex items-center justify-between px-3 py-2 bg-menu-surface-lt border border-white/[0.06]">
              <span className="font-mono text-[0.7rem] text-white/40 uppercase tracking-[0.05em]">Cost</span>
              <span className="font-mono text-[0.85rem] text-menu-warning font-medium">{formatted}</span>
            </div>
          ) : (
            <p className="font-medium text-[0.85rem] text-white/60">Save your changes and exit?</p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              onClick={onConfirm}
              disabled={saving}
              className="flex-1 py-2 px-4 border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 text-[0.82rem] font-semibold uppercase tracking-[0.3px] transition-colors disabled:opacity-40"
            >
              {saving ? 'Saving…' : 'Confirm'}
            </button>
            <button
              onClick={onClose}
              disabled={saving}
              className="py-2 px-4 border border-white/10 bg-white/[0.03] text-white/50 hover:bg-white/[0.07] text-[0.82rem] font-semibold uppercase tracking-[0.3px] transition-colors"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
