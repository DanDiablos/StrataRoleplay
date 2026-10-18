import { useState } from 'react'
import { Receipt as ReceiptIcon, Plus, Trash2, Eye } from 'lucide-react'
import { sendNui } from '../../nui'
import { useStore } from '../../store'
import SearchInput from '../../components/SearchInput.tsx'
import ActionBtn from '../../components/ActionBtn.tsx'
import Modal from '../../components/Modal.tsx'
import Loader from '../../components/Loader.tsx'
import type { Receipt } from '../../types'

export default function ReceiptsTab(): React.ReactElement {
  const axisTab = useStore(s => s.axisTab)
  const [search, setSearch]     = useState('')
  const [loading, setLoading]   = useState(false)
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [searched, setSearched] = useState(false)
  const [selected, setSelected] = useState<Receipt | null>(null)
  const [creating, setCreating] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newAmount, setNewAmount] = useState('')
  const [newDesc, setNewDesc]   = useState('')

  const canCreate  = axisTab === 'Search/Receipt'
  const canManage  = axisTab === 'Search/ReceiptCount'

  const doSearch = async () => {
    setLoading(true)
    setSearched(true)
    try {
      const r = await sendNui('BusinessReceiptSearch', { query: search })
      const result = await r.json()
      setReceipts(Array.isArray(result) ? result : [])
    } finally {
      setLoading(false)
    }
  }

  const doView = async (rec: Receipt) => {
    const r = await sendNui('BusinessReceiptView', { id: rec.id })
    const result = await r.json()
    setSelected(result ?? rec)
  }

  const doCreate = async () => {
    if (!newTitle.trim() || !newAmount.trim()) return
    setLoading(true)
    try {
      const r = await sendNui('BusinessReceiptCreate', {
        title: newTitle,
        amount: parseFloat(newAmount),
        description: newDesc,
      })
      const result = await r.json()
      if (result) {
        setCreating(false)
        setNewTitle(''); setNewAmount(''); setNewDesc('')
        doSearch()
      }
    } finally {
      setLoading(false)
    }
  }

  const doDelete = async (id: string) => {
    setLoading(true)
    try {
      await sendNui('BusinessReceiptDelete', { id })
      setReceipts(r => r.filter(x => x.id !== id))
    } finally {
      setLoading(false)
    }
  }

  const doDeleteAll = async () => {
    setLoading(true)
    try {
      await sendNui('BusinessReceiptDeleteAll', {})
      setReceipts([])
    } finally {
      setLoading(false)
    }
  }

  const fmtAmount = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

  return (
    <div className="h-full flex flex-col p-5 gap-3.5">
      {/* Search row */}
      <div className="flex gap-2 shrink-0">
        <SearchInput value={search} onChange={setSearch} placeholder="Search receipts…" className="flex-1" />
        <ActionBtn onClick={doSearch} disabled={loading}>Search</ActionBtn>
        {canCreate && (
          <ActionBtn onClick={() => setCreating(true)} variant="primary" disabled={loading}>
            <Plus size={13} className="inline mr-1" />
            New
          </ActionBtn>
        )}
        {canManage && receipts.length > 0 && (
          <ActionBtn onClick={doDeleteAll} variant="danger" disabled={loading}>Clear All</ActionBtn>
        )}
      </div>

      {/* Total */}
      {receipts.length > 0 && (
        <div className="flex items-center gap-3 shrink-0">
          <span className="font-mono text-[0.68rem] text-white/40 uppercase">Total:</span>
          <span className="font-mono text-[0.82rem] text-white/80">
            {fmtAmount(receipts.reduce((s, r) => s + r.amount, 0))}
          </span>
          <span className="font-mono text-[0.65rem] text-white/25">({receipts.length} receipts)</span>
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 pr-1">
        {loading && <div className="flex justify-center py-8"><Loader /></div>}
        {!loading && searched && receipts.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <ReceiptIcon size={28} className="text-white/20" />
            <span className="font-mono text-[0.72rem] text-white/20 uppercase tracking-[0.06em]">No receipts found</span>
          </div>
        )}
        {!loading && receipts.map(rec => (
          <div
            key={rec.id}
            className="flex items-center gap-3 px-4 py-3 bg-menu-surface hover:bg-primary/[0.06] transition-colors border-b border-white/[0.04] last:border-0 cursor-pointer"
            onClick={() => doView(rec)}
          >
            <ReceiptIcon size={14} className="text-white/30 shrink-0" />
            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
              <span className="font-medium text-[0.84rem] text-white/80 truncate">{rec.title}</span>
              <span className="font-mono text-[0.65rem] text-white/30">{rec.author} · {rec.created_at}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className={`font-mono text-[0.8rem] ${rec.amount >= 0 ? 'text-menu-success-lt' : 'text-red-300/70'}`}>
                {fmtAmount(rec.amount)}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={e => { e.stopPropagation(); doView(rec) }}
                  className="w-6 h-6 flex items-center justify-center border border-white/10 text-white/25 hover:text-white/60 transition-colors"
                >
                  <Eye size={11} />
                </button>
                {canManage && (
                  <button
                    onClick={e => { e.stopPropagation(); doDelete(rec.id) }}
                    className="w-6 h-6 flex items-center justify-center border border-menu-error-lt/30 text-red-300/40 hover:text-red-300/70 transition-colors"
                  >
                    <Trash2 size={11} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View modal */}
      {selected && !creating && (
        <Modal title={selected.title} onClose={() => setSelected(null)}>
          <div className="p-4 flex flex-col gap-3">
            <div className="divide-y divide-white/[0.06]">
              <Row label="Amount" value={fmtAmount(selected.amount)} />
              <Row label="Author" value={selected.author} />
              <Row label="Date" value={selected.created_at} />
              {selected.description && <Row label="Notes" value={selected.description} />}
            </div>
            <div className="flex justify-end pt-1">
              <ActionBtn onClick={() => setSelected(null)}>Close</ActionBtn>
            </div>
          </div>
        </Modal>
      )}

      {/* Create modal */}
      {creating && (
        <Modal title="New Receipt" onClose={() => setCreating(false)}>
          <div className="p-4 flex flex-col gap-3">
            <Field label="Title">
              <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Receipt title…"
                className="h-9 px-3 w-full bg-menu-surface-lt border border-white/10 text-[0.88rem] text-white/80 placeholder-white/25 focus:border-primary/50 transition-colors" />
            </Field>
            <Field label="Amount ($)">
              <input type="number" value={newAmount} onChange={e => setNewAmount(e.target.value)} placeholder="0.00"
                className="h-9 px-3 w-full bg-menu-surface-lt border border-white/10 text-[0.88rem] text-white/80 placeholder-white/25 focus:border-primary/50 transition-colors" />
            </Field>
            <Field label="Notes (optional)">
              <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Notes…" rows={3}
                className="px-3 py-2 w-full bg-menu-surface-lt border border-white/10 text-[0.84rem] text-white/80 placeholder-white/25 focus:border-primary/50 transition-colors" />
            </Field>
            <div className="flex justify-end gap-2 pt-1">
              <ActionBtn onClick={doCreate} variant="primary" disabled={loading || !newTitle.trim() || !newAmount.trim()}>
                {loading ? 'Saving…' : 'Create'}
              </ActionBtn>
              <ActionBtn onClick={() => setCreating(false)}>Cancel</ActionBtn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center px-1 py-[9px]">
      <span className="w-[100px] shrink-0 font-mono text-[0.68rem] uppercase tracking-[0.05em] text-white/40">{label}</span>
      <span className="font-mono text-[0.75rem] text-white/80">{value}</span>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-mono text-[0.65rem] text-white/40 uppercase tracking-[0.05em]">{label}</label>
      {children}
    </div>
  )
}
