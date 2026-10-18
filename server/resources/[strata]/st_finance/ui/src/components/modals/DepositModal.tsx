import { useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { sendNui } from '../../nui.ts'
import { useStore, type Account, type Transaction } from '../../store.ts'

interface Props {
  account: Account
  onClose: () => void
  onTransaction: (tx: Transaction) => void
}

export default function DepositModal({ account, onClose, onTransaction }: Props): React.ReactElement {
  const character    = useStore(s => s.character)
  const updateAccount = useStore(s => s.updateAccount)
  const updateCash   = useStore(s => s.updateCash)
  const addToast     = useStore(s => s.addToast)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const els    = e.currentTarget.elements
    const amount = Number((els.namedItem('amount') as HTMLInputElement).value)
    const notes  = (els.namedItem('notes') as HTMLTextAreaElement).value

    if (!amount || amount <= 0) return

    setLoading(true)
    const res = await sendNui<{ state: boolean; balance: number }>('Bank:Deposit', {
      account: account.Account,
      amount,
      comments: notes,
    })
    setLoading(false)

    if (res.state) {
      updateAccount(account.Account, { ...account, Balance: res.balance })
      if (character) updateCash(character.Cash - amount)
      onTransaction({
        Type: 'deposit', Amount: amount, Account: account.Account,
        Title: 'Cash Deposit', Description: notes || 'No description',
        Timestamp: Date.now() / 1000, TransactionAccount: false,
        Data: { character: character?.SID ?? 0 },
      })
      addToast('success', 'Funds deposited')
      onClose()
    } else {
      addToast('error', 'Unable to deposit funds')
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
            Deposit — {account.Name}
          </span>
          <button onClick={onClose} className="text-white/30 hover:text-white/70 transition-colors">
            <X size={14} />
          </button>
        </div>
        <form onSubmit={onSubmit}>
          <div className="p-4 flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[0.68rem] uppercase tracking-[0.05em] text-white/40">Account</label>
              <input
                value={account.Account} readOnly
                className="h-9 px-3 bg-menu-surface-lt border border-white/10 text-[0.88rem] text-white/30 opacity-60"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[0.68rem] uppercase tracking-[0.05em] text-white/40">
                Amount{character ? ` (cash: $${Math.floor(character.Cash).toLocaleString('en-US')})` : ''}
              </label>
              <input
                name="amount" type="number" min="1" step="1" required disabled={loading}
                className="h-9 px-3 bg-menu-surface-lt border border-white/10 text-[0.88rem] text-white/80 placeholder-white/25 focus:border-primary/50 transition-colors disabled:opacity-40"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[0.68rem] uppercase tracking-[0.05em] text-white/40">Note (optional)</label>
              <textarea
                name="notes" rows={2} disabled={loading}
                className="px-3 py-2 bg-menu-surface-lt border border-white/10 text-[0.88rem] text-white/80 placeholder-white/25 focus:border-primary/50 transition-colors resize-none disabled:opacity-40"
              />
            </div>
          </div>
          <div className="flex gap-2 px-4 pb-4">
            <button
              type="submit" disabled={loading}
              className="flex-1 py-2 px-4 border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 text-[0.82rem] font-semibold uppercase tracking-[0.3px] transition-colors disabled:opacity-50"
            >
              {loading ? 'Depositing…' : 'Deposit'}
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
