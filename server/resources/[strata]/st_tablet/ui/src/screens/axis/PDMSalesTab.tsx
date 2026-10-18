import { useState, useEffect } from 'react'
import { Car, DollarSign } from 'lucide-react'
import { sendNui } from '../../nui'
import ActionBtn from '../../components/ActionBtn.tsx'
import Loader from '../../components/Loader.tsx'
import Modal from '../../components/Modal.tsx'

interface DealerStock {
  id: string | number
  model: string
  label: string
  price: number
  stock: number
  category?: string
}

export default function PDMSalesTab(): React.ReactElement {
  const [loading, setLoading]   = useState(true)
  const [stock, setStock]       = useState<DealerStock[]>([])
  const [dealerData, setDealerData] = useState<Record<string, unknown> | null>(null)
  const [selected, setSelected] = useState<DealerStock | null>(null)
  const [plate, setPlate]       = useState('')
  const [selling, setSelling]   = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const r = await sendNui('PDMGetDealerData', {})
        const result = await r.json()
        setDealerData(result)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const doGetStock = async () => {
    setLoading(true)
    try {
      const r = await sendNui('PDMGetStock', {})
      const result = await r.json()
      setStock(Array.isArray(result) ? result : [])
    } finally {
      setLoading(false)
    }
  }

  const doSell = async () => {
    if (!selected) return
    setSelling(true)
    try {
      await sendNui('PDMStartSale', { vehicleId: selected.id, plate })
      setSelected(null)
      setPlate('')
      doGetStock()
    } finally {
      setSelling(false)
    }
  }

  const doTestDrive = async (vehicle: DealerStock) => {
    await sendNui('DealershipStartTestDrive', { model: vehicle.model })
  }

  if (loading) return (
    <div className="h-full flex items-center justify-center"><Loader /></div>
  )

  return (
    <div className="h-full flex flex-col p-5 gap-3.5">
      <div className="flex items-center justify-between shrink-0">
        <span className="font-display font-bold uppercase tracking-[0.12em] text-[0.72rem] text-white/50">
          Vehicle Stock
        </span>
        <ActionBtn onClick={doGetStock} disabled={loading}>Refresh Stock</ActionBtn>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 pr-1">
        {stock.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <Car size={28} className="text-white/20" />
            <span className="font-mono text-[0.72rem] text-white/20 uppercase tracking-[0.06em]">
              Click "Refresh Stock" to load
            </span>
          </div>
        ) : (
          stock.map(v => (
            <div key={v.id} className="flex items-center gap-3 px-4 py-3 bg-menu-surface border-b border-white/[0.04] last:border-0">
              <Car size={14} className="text-white/30 shrink-0" />
              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <span className="font-medium text-[0.84rem] text-white/80">{v.label}</span>
                <span className="font-mono text-[0.65rem] text-white/30 uppercase">{v.model}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end gap-0.5">
                  <span className="font-mono text-[0.8rem] text-white/80">
                    ${v.price?.toLocaleString() ?? 0}
                  </span>
                  <span className="font-mono text-[0.62rem] text-white/30">
                    {v.stock > 0 ? `${v.stock} in stock` : 'Out of stock'}
                  </span>
                </div>
                <div className="flex gap-1">
                  <ActionBtn onClick={() => doTestDrive(v)} disabled={v.stock === 0}>
                    Test
                  </ActionBtn>
                  <ActionBtn
                    onClick={() => setSelected(v)}
                    variant="primary"
                    disabled={v.stock === 0}
                  >
                    <DollarSign size={11} className="inline mr-0.5" />
                    Sell
                  </ActionBtn>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {selected && (
        <Modal title={`Sell — ${selected.label}`} onClose={() => setSelected(null)}>
          <div className="p-4 flex flex-col gap-3">
            <div className="divide-y divide-white/[0.06]">
              <Row label="Vehicle" value={selected.label} />
              <Row label="Price" value={`$${selected.price?.toLocaleString() ?? 0}`} />
              <Row label="In Stock" value={String(selected.stock)} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-mono text-[0.65rem] text-white/40 uppercase tracking-[0.05em]">Custom Plate</label>
              <input value={plate} onChange={e => setPlate(e.target.value)} placeholder="Leave blank for random"
                maxLength={8}
                className="h-9 px-3 w-full bg-menu-surface-lt border border-white/10 text-[0.88rem] text-white/80 placeholder-white/25 focus:border-primary/50 transition-colors uppercase" />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <ActionBtn onClick={doSell} variant="primary" disabled={selling}>
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
