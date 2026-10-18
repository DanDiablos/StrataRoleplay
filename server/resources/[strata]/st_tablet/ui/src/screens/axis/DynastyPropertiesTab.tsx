import { useState } from 'react'
import { Home, MapPin, DollarSign } from 'lucide-react'
import { sendNui } from '../../nui'
import SearchInput from '../../components/SearchInput.tsx'
import ActionBtn from '../../components/ActionBtn.tsx'
import Loader from '../../components/Loader.tsx'
import Modal from '../../components/Modal.tsx'

interface Property {
  id: string | number
  address: string
  type?: string
  price: number
  status: string
  owner?: string
}

export default function DynastyPropertiesTab(): React.ReactElement {
  const [search, setSearch]       = useState('')
  const [loading, setLoading]     = useState(false)
  const [properties, setProperties] = useState<Property[]>([])
  const [searched, setSearched]   = useState(false)
  const [selected, setSelected]   = useState<Property | null>(null)
  const [buyerSid, setBuyerSid]   = useState('')
  const [selling, setSelling]     = useState(false)

  const doSearch = async () => {
    setLoading(true)
    setSearched(true)
    try {
      const r = await sendNui('Dyn8SearchProperties', { query: search })
      const result = await r.json()
      setProperties(Array.isArray(result) ? result : [])
    } finally {
      setLoading(false)
    }
  }

  const doMark = async (prop: Property) => {
    await sendNui('Dyn8MarkProperty', { id: prop.id })
  }

  const doSell = async () => {
    if (!selected) return
    setSelling(true)
    try {
      await sendNui('Dyn8StartSale', { id: selected.id, buyerSid })
      setSelected(null)
      setBuyerSid('')
      doSearch()
    } finally {
      setSelling(false)
    }
  }

  const fmtPrice = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

  return (
    <div className="h-full flex flex-col p-5 gap-3.5">
      <div className="flex gap-2 shrink-0">
        <SearchInput value={search} onChange={setSearch} placeholder="Search properties…" className="flex-1" />
        <ActionBtn onClick={doSearch} variant="primary" disabled={loading}>Search</ActionBtn>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 pr-1">
        {loading && <div className="flex justify-center py-8"><Loader /></div>}
        {!loading && searched && properties.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <Home size={28} className="text-white/20" />
            <span className="font-mono text-[0.72rem] text-white/20 uppercase tracking-[0.06em]">No properties found</span>
          </div>
        )}
        {!loading && properties.map(p => (
          <div key={p.id} className="flex items-center gap-3 px-4 py-3 bg-menu-surface border-b border-white/[0.04] last:border-0">
            <Home size={14} className="text-white/30 shrink-0" />
            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
              <span className="font-medium text-[0.84rem] text-white/80 truncate">{p.address}</span>
              <span className="font-mono text-[0.65rem] text-white/30">
                {p.type ?? 'Property'} · {p.status}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-[0.78rem] text-white/70">{fmtPrice(p.price)}</span>
              <div className="flex gap-1">
                <button
                  onClick={() => doMark(p)}
                  className="flex items-center gap-1 px-2.5 py-1 border border-white/10 text-white/40 text-[0.72rem] hover:border-primary/30 hover:text-primary/70 transition-colors"
                >
                  <MapPin size={11} />
                  Mark
                </button>
                {p.status?.toLowerCase() === 'available' && (
                  <ActionBtn onClick={() => setSelected(p)} variant="primary">
                    <DollarSign size={11} className="inline mr-0.5" />
                    Sell
                  </ActionBtn>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <Modal title={`Sell — ${selected.address}`} onClose={() => setSelected(null)}>
          <div className="p-4 flex flex-col gap-3">
            <div className="divide-y divide-white/[0.06]">
              <Row label="Address" value={selected.address} />
              <Row label="Price" value={fmtPrice(selected.price)} />
              <Row label="Status" value={selected.status} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-mono text-[0.65rem] text-white/40 uppercase tracking-[0.05em]">Buyer SID</label>
              <input value={buyerSid} onChange={e => setBuyerSid(e.target.value)} placeholder="Enter buyer SID…"
                className="h-9 px-3 w-full bg-menu-surface-lt border border-white/10 text-[0.88rem] text-white/80 placeholder-white/25 focus:border-primary/50 transition-colors" />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <ActionBtn onClick={doSell} variant="primary" disabled={selling || !buyerSid.trim()}>
                {selling ? 'Processing…' : 'Confirm Sale'}
              </ActionBtn>
              <ActionBtn onClick={() => setSelected(null)}>Cancel</ActionBtn>
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
