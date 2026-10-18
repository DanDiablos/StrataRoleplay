import { useState } from 'react'
import { Car, Users, AlertCircle, CheckCircle, XCircle, ArrowRight, Ban, Plus } from 'lucide-react'
import { sendNui } from '../../nui'
import { useStore } from '../../store'
import ActionBtn from '../../components/ActionBtn.tsx'
import Modal from '../../components/Modal.tsx'
import Loader from '../../components/Loader.tsx'
import type { LSUDetails, BoostingContract } from '../../types'

interface Props {
  lsuData: LSUDetails | null
}

export default function BoostingTab({ lsuData }: Props): React.ReactElement {
  const data = useStore(s => s.data)
  const disabledContracts = (data.disabledBoostingContracts as string[] | null) ?? []
  const contracts = (data.boostingContracts as BoostingContract[] | null) ?? []

  const [inQueue, setInQueue]   = useState(false)
  const [loading, setLoading]   = useState(false)
  const [transferTo, setTransferTo] = useState('')
  const [transferId, setTransferId] = useState<string | null>(null)
  const [showAdmin, setShowAdmin]   = useState(false)
  const [adminVehicle, setAdminVehicle] = useState('')
  const [bans, setBans]         = useState<Record<string, unknown>[]>([])
  const [showBans, setShowBans] = useState(false)

  const canBoost  = lsuData?.canBoost ?? false
  const reps      = lsuData?.reputations ?? {}
  const boostRep  = reps['Boosting']
  const banned    = lsuData?.banned

  const handleQueue = async () => {
    setLoading(true)
    try {
      if (!inQueue) {
        const r = await sendNui('Boosting:EnterQueue', {})
        const res = await r.json()
        if (res) setInQueue(true)
      } else {
        await sendNui('Boosting:ExitQueue', {})
        setInQueue(false)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (id: string) => {
    setLoading(true)
    try {
      const r = await sendNui('Boosting:AcceptContract', { id })
      await r.json()
    } finally {
      setLoading(false)
    }
  }

  const handleDecline = async (id: string) => {
    setLoading(true)
    try {
      await sendNui('Boosting:DeclineContract', { id })
    } finally {
      setLoading(false)
    }
  }

  const handleTransfer = async () => {
    if (!transferId || !transferTo.trim()) return
    setLoading(true)
    try {
      await sendNui('Boosting:TransferContract', { id: transferId, target: transferTo })
      setTransferId(null)
      setTransferTo('')
    } finally {
      setLoading(false)
    }
  }

  const handleAdminCreate = async () => {
    if (!adminVehicle.trim()) return
    setLoading(true)
    try {
      const r = await sendNui('Boosting:Admin:CreateContract', { vehicle: adminVehicle })
      const res = await r.json()
      if (res?.success) {
        setAdminVehicle('')
        setShowAdmin(false)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGetBans = async () => {
    const r = await sendNui('Boosting:Admin:GetBans', {})
    const res = await r.json()
    setBans(Array.isArray(res) ? res : [])
    setShowBans(true)
  }

  if (banned) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3">
        <AlertCircle size={32} className="text-red-300/60" />
        <span className="font-display font-bold uppercase tracking-[0.1em] text-[0.82rem] text-red-300/70">Banned</span>
        <span className="font-mono text-[0.68rem] text-white/30 text-center max-w-xs">
          You have been banned from the boosting system.
        </span>
      </div>
    )
  }

  if (!canBoost) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3">
        <Car size={32} className="text-white/20" />
        <span className="font-display font-bold uppercase tracking-[0.1em] text-[0.82rem] text-white/40">
          Reputation Required
        </span>
        <span className="font-mono text-[0.68rem] text-white/25 text-center max-w-xs">
          You need a higher Boosting reputation to access contracts.
        </span>
        {boostRep && (
          <div className="flex flex-col items-center gap-1 mt-2">
            <span className="font-mono text-[0.75rem] text-white/60">
              Current Level: {boostRep.level}
            </span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col p-5 gap-4">
      {/* Reputation + queue */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          {boostRep && (
            <div className="flex items-center gap-2 px-3 py-1.5 border border-white/[0.06] bg-menu-surface">
              <Car size={12} className="text-primary/70" />
              <span className="font-mono text-[0.72rem] text-white/60">
                Boosting Level {boostRep.level}
              </span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <ActionBtn onClick={() => setShowAdmin(true)}>
            <Plus size={11} className="inline mr-1" />
            Admin
          </ActionBtn>
          <ActionBtn
            onClick={handleQueue}
            variant={inQueue ? 'danger' : 'primary'}
            disabled={loading}
          >
            {loading ? 'Loading…' : inQueue ? 'Leave Queue' : 'Enter Queue'}
          </ActionBtn>
        </div>
      </div>

      {/* Queue status */}
      {inQueue && (
        <div className="flex items-center gap-2 px-3 py-2 border border-menu-success/30 bg-menu-success/8 shrink-0">
          <div className="w-2 h-2 rounded-full bg-menu-success animate-pulse" />
          <span className="font-mono text-[0.72rem] text-menu-success-lt">In queue — waiting for a contract…</span>
        </div>
      )}

      {/* Contracts list */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 pr-1">
        <span className="font-display font-bold uppercase tracking-[0.12em] text-[0.72rem] text-white/40 shrink-0">
          Available Contracts ({contracts.length})
        </span>

        {contracts.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-2">
            <Users size={28} className="text-white/20" />
            <span className="font-mono text-[0.72rem] text-white/20 uppercase tracking-[0.06em]">No contracts available</span>
          </div>
        ) : (
          contracts.map(contract => {
            const isDisabled = disabledContracts.includes(contract.id)
            return (
              <div
                key={contract.id}
                className={`flex items-center gap-3 px-4 py-3 bg-menu-surface border-b border-white/[0.04] last:border-0 ${
                  isDisabled ? 'opacity-50 pointer-events-none' : ''
                }`}
              >
                <Car size={14} className="text-white/30 shrink-0" />
                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                  <span className="font-medium text-[0.84rem] text-white/80">
                    {contract.label ?? contract.vehicle ?? 'Unknown Vehicle'}
                  </span>
                  <div className="flex items-center gap-2">
                    {contract.class && (
                      <span className="font-mono text-[0.65rem] bg-white/[0.06] px-1.5 py-0.5 text-white/50 uppercase">
                        Class {contract.class}
                      </span>
                    )}
                    {contract.reward && (
                      <span className="font-mono text-[0.65rem] text-menu-success-lt">
                        ${contract.reward?.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                {!isDisabled && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => { setTransferId(contract.id); setTransferTo('') }}
                      className="flex items-center gap-1 px-2.5 py-1 border border-white/10 text-white/35 text-[0.72rem] hover:text-white/65 transition-colors"
                    >
                      <ArrowRight size={10} />
                      Transfer
                    </button>
                    <button
                      onClick={() => handleDecline(contract.id)}
                      className="w-7 h-7 flex items-center justify-center border border-menu-error-lt/30 text-red-300/40 hover:text-red-300/70 transition-colors"
                    >
                      <XCircle size={12} />
                    </button>
                    <button
                      onClick={() => handleAccept(contract.id)}
                      className="flex items-center gap-1 px-2.5 py-1 border border-primary/35 bg-primary/8 text-[#FF8C42] text-[0.72rem] hover:bg-primary/15 transition-colors"
                    >
                      <CheckCircle size={10} />
                      Accept
                    </button>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Transfer modal */}
      {transferId && (
        <Modal title="Transfer Contract" onClose={() => setTransferId(null)}>
          <div className="p-4 flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-mono text-[0.65rem] text-white/40 uppercase tracking-[0.05em]">Transfer to SID</label>
              <input
                value={transferTo}
                onChange={e => setTransferTo(e.target.value)}
                placeholder="Enter SID…"
                className="h-9 px-3 w-full bg-menu-surface-lt border border-white/10 text-[0.88rem] text-white/80 placeholder-white/25 focus:border-primary/50 transition-colors"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <ActionBtn onClick={handleTransfer} variant="primary" disabled={loading || !transferTo.trim()}>
                Transfer
              </ActionBtn>
              <ActionBtn onClick={() => setTransferId(null)}>Cancel</ActionBtn>
            </div>
          </div>
        </Modal>
      )}

      {/* Admin modal */}
      {showAdmin && (
        <Modal title="Admin — Create Contract" onClose={() => setShowAdmin(false)}>
          <div className="p-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="font-mono text-[0.65rem] text-white/40 uppercase tracking-[0.05em]">Vehicle Model</label>
              <input
                value={adminVehicle}
                onChange={e => setAdminVehicle(e.target.value)}
                placeholder="e.g. adder"
                className="h-9 px-3 w-full bg-menu-surface-lt border border-white/10 text-[0.88rem] text-white/80 placeholder-white/25 focus:border-primary/50 transition-colors"
              />
            </div>
            <div className="flex gap-2">
              <ActionBtn onClick={handleAdminCreate} variant="primary" disabled={loading || !adminVehicle.trim()}>
                Create
              </ActionBtn>
              <ActionBtn onClick={handleGetBans}>
                <Ban size={11} className="inline mr-1" />
                View Bans
              </ActionBtn>
              <ActionBtn onClick={() => setShowAdmin(false)}>Close</ActionBtn>
            </div>
          </div>
        </Modal>
      )}

      {/* Bans modal */}
      {showBans && (
        <Modal title="Boosting Bans" onClose={() => setShowBans(false)} width="w-[560px]">
          <div className="divide-y divide-white/[0.06]">
            {bans.length === 0 ? (
              <div className="p-6 text-center">
                <span className="font-mono text-[0.68rem] text-white/25">No active bans</span>
              </div>
            ) : (
              bans.map((ban, i) => (
                <div key={i} className="px-4 py-3 flex items-center justify-between gap-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-mono text-[0.75rem] text-white/75">
                      {String(ban.name ?? ban.SID ?? 'Unknown')}
                    </span>
                    <span className="font-mono text-[0.62rem] text-white/30">
                      {String(ban.reason ?? '—')}
                    </span>
                  </div>
                  <ActionBtn
                    onClick={async () => {
                      await sendNui('Boosting:Admin:Unban', { SID: ban.SID })
                      setBans(b => b.filter((_, j) => j !== i))
                    }}
                    variant="success"
                  >
                    Unban
                  </ActionBtn>
                </div>
              ))
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}
