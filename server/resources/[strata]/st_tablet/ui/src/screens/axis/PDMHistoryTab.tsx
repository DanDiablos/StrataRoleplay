import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'
import { sendNui } from '../../nui'
import Loader from '../../components/Loader.tsx'

interface SaleRecord {
  id: string | number
  vehicle: string
  label?: string
  buyer: string
  price: number
  plate: string
  date: string
}

export default function PDMHistoryTab(): React.ReactElement {
  const [loading, setLoading] = useState(true)
  const [history, setHistory] = useState<SaleRecord[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const r = await sendNui('PDMGetHistory', {})
        const result = await r.json()
        setHistory(Array.isArray(result) ? result : [])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const fmtPrice = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

  if (loading) return (
    <div className="h-full flex items-center justify-center"><Loader /></div>
  )

  return (
    <div className="h-full flex flex-col p-5 gap-3.5">
      <span className="font-display font-bold uppercase tracking-[0.12em] text-[0.72rem] text-white/50 shrink-0">
        Sales History ({history.length})
      </span>
      <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 pr-1">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <Clock size={28} className="text-white/20" />
            <span className="font-mono text-[0.72rem] text-white/20 uppercase tracking-[0.06em]">No sales on record</span>
          </div>
        ) : (
          history.map(s => (
            <div key={s.id} className="px-4 py-3 bg-menu-surface border-b border-white/[0.04] last:border-0 flex items-center gap-3">
              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <span className="font-medium text-[0.84rem] text-white/80">{s.label ?? s.vehicle}</span>
                <span className="font-mono text-[0.65rem] text-white/35">
                  {s.buyer} · Plate: {s.plate}
                </span>
              </div>
              <div className="flex flex-col items-end gap-0.5">
                <span className="font-mono text-[0.8rem] text-menu-success-lt">{fmtPrice(s.price)}</span>
                <span className="font-mono text-[0.62rem] text-white/25">{s.date}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
