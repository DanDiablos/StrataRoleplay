import { useState } from 'react'
import { createPortal } from 'react-dom'
import { X, UserMinus, UserPlus } from 'lucide-react'
import { sendNui } from '../../nui.ts'
import { useStore, type Account } from '../../store.ts'

interface Props {
  account: Account
  onClose: () => void
}

export default function JointOwnersModal({ account, onClose }: Props): React.ReactElement {
  const character    = useStore(s => s.character)
  const updateAccount = useStore(s => s.updateAccount)
  const addToast     = useStore(s => s.addToast)
  const [loading, setLoading]   = useState(false)
  const [adding, setAdding]     = useState(false)
  const [addTarget, setAddTarget] = useState('')

  const isOwner = character?.SID === account.Owner

  const removeOwner = async (sid: number) => {
    setLoading(true)
    const res = await sendNui<boolean>('Bank:RemoveJoint', { account: account.Account, target: sid })
    setLoading(false)

    if (res) {
      updateAccount(account.Account, {
        ...account,
        JointOwners: account.JointOwners.filter(o => o !== sid),
      })
      addToast('success', 'Joint owner removed')
    } else {
      addToast('error', 'Unable to remove joint owner')
    }
  }

  const addOwner = async () => {
    const targetSid = Number(addTarget)
    if (!targetSid) return
    if (character && targetSid === character.SID) {
      addToast('error', 'You cannot add yourself as a joint owner')
      return
    }

    setLoading(true)
    const res = await sendNui<boolean>('Bank:AddJoint', { account: account.Account, target: targetSid })
    setLoading(false)

    if (res) {
      updateAccount(account.Account, {
        ...account,
        JointOwners: [...account.JointOwners, targetSid],
      })
      setAddTarget('')
      setAdding(false)
      addToast('success', 'Joint owner added')
    } else {
      addToast('error', 'Unable to add joint owner')
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
            Joint Owners — {account.Name}
          </span>
          <button onClick={onClose} className="text-white/30 hover:text-white/70 transition-colors">
            <X size={14} />
          </button>
        </div>

        <div className="flex flex-col">
          {account.JointOwners.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <span className="font-mono text-[0.72rem] text-white/20 uppercase tracking-[0.06em]">No joint owners</span>
            </div>
          ) : (
            account.JointOwners.map(sid => (
              <div key={sid} className="flex items-center px-4 py-3 border-b border-white/[0.06] last:border-0">
                <span className="font-mono text-[0.68rem] uppercase tracking-[0.05em] text-white/40 w-20 shrink-0">State ID</span>
                <span className="font-mono text-[0.78rem] text-white/80 flex-1">{sid}</span>
                {isOwner && (
                  <button
                    onClick={() => removeOwner(sid)} disabled={loading}
                    className="w-7 h-7 flex items-center justify-center border border-menu-error-lt/30 bg-menu-error/15 text-red-400 hover:bg-menu-error/25 transition-colors disabled:opacity-40"
                  >
                    <UserMinus size={12} />
                  </button>
                )}
              </div>
            ))
          )}

          {isOwner && (
            <div className="p-4 border-t border-white/[0.06]">
              {adding ? (
                <div className="flex gap-2">
                  <input
                    type="number" min="1" step="1" placeholder="State ID" value={addTarget}
                    onChange={e => setAddTarget(e.target.value)} disabled={loading}
                    className="flex-1 h-9 px-3 bg-menu-surface-lt border border-white/10 text-[0.88rem] text-white/80 placeholder-white/25 focus:border-primary/50 transition-colors disabled:opacity-40"
                    autoFocus
                  />
                  <button
                    onClick={addOwner} disabled={loading || !addTarget}
                    className="px-3 py-2 border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 text-[0.78rem] font-semibold uppercase transition-colors disabled:opacity-40"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => { setAdding(false); setAddTarget('') }}
                    className="px-3 py-2 border border-white/10 bg-white/5 text-white/40 hover:bg-white/10 text-[0.78rem] font-semibold uppercase transition-colors"
                  >
                    <X size={13} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAdding(true)} disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-2 border border-white/10 bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70 text-[0.8rem] font-semibold uppercase tracking-[0.04em] transition-colors"
                >
                  <UserPlus size={13} /> Add Joint Owner
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex px-4 pb-4">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 border border-white/10 bg-white/5 text-white/50 hover:bg-white/10 text-[0.82rem] font-semibold uppercase tracking-[0.3px] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
