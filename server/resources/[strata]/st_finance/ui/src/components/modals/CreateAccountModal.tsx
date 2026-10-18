import { useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { sendNui } from '../../nui.ts'
import { useStore, type Account } from '../../store.ts'

interface Props {
  onClose: () => void
}

export default function CreateAccountModal({ onClose }: Props): React.ReactElement {
  const character    = useStore(s => s.character)
  const accounts     = useStore(s => s.accounts)
  const addAccount   = useStore(s => s.addAccount)
  const selectAccount = useStore(s => s.selectAccount)
  const addToast     = useStore(s => s.addToast)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const name = (e.currentTarget.elements.namedItem('name') as HTMLInputElement).value.trim()
    if (!name) return

    if (accounts.some(a => a.Owner === character?.SID && a.Type === 'personal_savings')) {
      addToast('error', 'You may only own 1 savings account')
      onClose()
      return
    }

    setLoading(true)
    const res = await sendNui<Account>('Bank:Register', { type: 'personal_savings', name })
    setLoading(false)

    if (res?.Account) {
      addAccount(res)
      selectAccount(res.Account)
      addToast('success', 'Savings account opened')
      onClose()
    } else {
      addToast('error', 'Unable to open account')
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60"
      onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-[420px] bg-menu-surface border border-menu-border flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 bg-menu-bg/60 border-b border-white/[0.06]">
          <span className="font-display font-bold uppercase tracking-[2px] text-[0.78rem] text-white/70">
            Open Savings Account
          </span>
          <button onClick={onClose} className="text-white/30 hover:text-white/70 transition-colors">
            <X size={14} />
          </button>
        </div>
        <form onSubmit={onSubmit}>
          <div className="p-4 flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[0.68rem] uppercase tracking-[0.05em] text-white/40">Account Type</label>
              <input
                value="Personal Savings" readOnly
                className="h-9 px-3 bg-menu-surface-lt border border-white/10 text-[0.88rem] text-white/30 opacity-60"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[0.68rem] uppercase tracking-[0.05em] text-white/40">Account Name</label>
              <input
                name="name" type="text" required disabled={loading}
                placeholder="e.g. My Savings"
                className="h-9 px-3 bg-menu-surface-lt border border-white/10 text-[0.88rem] text-white/80 placeholder-white/25 focus:border-primary/50 transition-colors disabled:opacity-40"
              />
            </div>
          </div>
          <div className="flex gap-2 px-4 pb-4">
            <button
              type="submit" disabled={loading}
              className="flex-1 py-2 px-4 border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 text-[0.82rem] font-semibold uppercase tracking-[0.3px] transition-colors disabled:opacity-50"
            >
              {loading ? 'Opening…' : 'Open Account'}
            </button>
            <button
              type="button" onClick={onClose} disabled={loading}
              className="py-2 px-4 border border-white/10 bg-white/5 text-white/50 hover:bg-white/10 text-[0.82rem] font-semibold uppercase tracking-[0.3px] transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  )
}
