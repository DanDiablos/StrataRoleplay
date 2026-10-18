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

export default function TransferModal({ account, onClose, onTransaction }: Props): React.ReactElement {
  const character    = useStore(s => s.character)
  const accounts     = useStore(s => s.accounts)
  const updateAccount = useStore(s => s.updateAccount)
  const addToast     = useStore(s => s.addToast)
  const [loading, setLoading]       = useState(false)
  const [byStateId, setByStateId]   = useState(false)

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const els    = e.currentTarget.elements
    const target = (els.namedItem('target') as HTMLInputElement).value.trim()
    const amount = Number((els.namedItem('amount') as HTMLInputElement).value)
    const notes  = (els.namedItem('notes') as HTMLTextAreaElement).value

    if (!amount || amount <= 0 || !target) return

    if (byStateId && character && target === String(character.SID)) {
      addToast('error', 'Cannot transfer to your own State ID')
      return
    }
    if (!byStateId && target === account.Account) {
      addToast('error', 'Cannot transfer to the same account')
      return
    }

    setLoading(true)
    const res = await sendNui<{ state: boolean; balance: number }>('Bank:Transfer', {
      account: account.Account,
      type: byStateId,
      target,
      amount,
      comments: notes,
    })
    setLoading(false)

    if (res.state) {
      updateAccount(account.Account, { ...account, Balance: res.balance })

      // If target is a local account, update its balance too
      if (!byStateId) {
        const targetAcc = accounts.find(a => a.Account === target)
        if (targetAcc) {
          updateAccount(targetAcc.Account, { ...targetAcc, Balance: targetAcc.Balance + amount })
        }
      }

      onTransaction({
        Type: 'transfer', Amount: amount, Account: account.Account,
        Title: 'Outgoing Bank Transfer',
        Description: `To: ${target}${notes ? ` · ${notes}` : ''}`,
        Timestamp: Date.now() / 1000, TransactionAccount: byStateId ? false : target,
        Data: { character: character?.SID ?? 0 },
      })
      addToast('success', 'Funds transferred')
      onClose()
    } else {
      addToast('error', 'Unable to transfer funds')
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
            Transfer — {account.Name}
          </span>
          <button onClick={onClose} className="text-white/30 hover:text-white/70 transition-colors">
            <X size={14} />
          </button>
        </div>
        <form onSubmit={onSubmit}>
          <div className="p-4 flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[0.68rem] uppercase tracking-[0.05em] text-white/40">From Account</label>
              <input
                value={account.Account} readOnly
                className="h-9 px-3 bg-menu-surface-lt border border-white/10 text-[0.88rem] text-white/30 opacity-60"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[0.68rem] uppercase tracking-[0.05em] text-white/40">Transfer Type</label>
              <div className="flex">
                <button
                  type="button" onClick={() => setByStateId(false)}
                  className={`flex-1 py-2 text-[0.78rem] font-semibold uppercase tracking-[0.04em] border transition-colors ${
                    !byStateId
                      ? 'border-primary/40 bg-primary/10 text-primary'
                      : 'border-white/10 bg-white/5 text-white/40 hover:text-white/60'
                  }`}
                >
                  Account Number
                </button>
                <button
                  type="button" onClick={() => setByStateId(true)}
                  className={`flex-1 py-2 text-[0.78rem] font-semibold uppercase tracking-[0.04em] border border-l-0 transition-colors ${
                    byStateId
                      ? 'border-primary/40 bg-primary/10 text-primary'
                      : 'border-white/10 bg-white/5 text-white/40 hover:text-white/60'
                  }`}
                >
                  State ID
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[0.68rem] uppercase tracking-[0.05em] text-white/40">
                {byStateId ? 'State ID' : 'Account Number'}
              </label>
              <input
                name="target" type="number" min="1" step="1" required disabled={loading}
                className="h-9 px-3 bg-menu-surface-lt border border-white/10 text-[0.88rem] text-white/80 placeholder-white/25 focus:border-primary/50 transition-colors disabled:opacity-40"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[0.68rem] uppercase tracking-[0.05em] text-white/40">
                Amount{account.Permissions.BALANCE ? ` (balance: $${Math.floor(account.Balance).toLocaleString('en-US')})` : ''}
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
              {loading ? 'Transferring…' : 'Transfer'}
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
