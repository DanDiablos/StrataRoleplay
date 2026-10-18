import React, { useState } from 'react'
import { Building2, Search, MapPin, DollarSign } from 'lucide-react'
import { useStore } from '../store'
import { sendNui } from '../nui'

interface Property { id: string | number; label: string; price?: number; type?: string; sold?: boolean | number }

export default function Dyn8Screen(): React.ReactElement {
  const pushAlert = useStore((s) => s.pushAlert)
  const [results, setResults] = useState<Property[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    setLoading(true)
    try {
      const res = await sendNui('Dyn8:SearchProperty', { query: search })
      const data = await res.json()
      if (Array.isArray(data)) setResults(data)
    } catch { /* noop */ }
    setLoading(false)
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="shrink-0 px-4 py-3 bg-black/30 border-b border-white/[0.06]">
        <div className="flex items-center gap-1.5">
          <Building2 size={14} className="text-[#136231]" />
          <span className="font-display font-bold uppercase tracking-[0.1em] text-[0.72rem] text-white/70">Dynasty 8</span>
        </div>
      </div>
      <div className="shrink-0 px-3 py-2">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/25" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search properties..."
            className="w-full h-8 pl-8 pr-3 bg-white/[0.04] border border-white/[0.06] rounded-lg text-[0.75rem] text-white/80 placeholder-white/25 focus:border-primary/40 transition-colors" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto flex flex-col">
        {results.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2">
            <Building2 size={28} className="text-white/20" />
            <span className="font-mono text-[0.65rem] text-white/20 uppercase tracking-[0.08em]">{loading ? 'Searching...' : 'Search for properties'}</span>
          </div>
        ) : (
          results.map((p) => (
            <div key={p.id} className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.03]">
              <div className="flex-1 min-w-0">
                <span className="text-[0.72rem] font-medium text-white/70 truncate block">{p.label}</span>
                <div className="flex items-center gap-2 mt-0.5">
                  {p.type && <span className="text-[0.55rem] text-white/30">{p.type}</span>}
                  {p.price != null && <span className="font-mono text-[0.58rem] text-[#136231]">${p.price.toLocaleString()}</span>}
                  {(p.sold === true || p.sold === 1) && <span className="text-[0.5rem] font-mono text-red-400/50 uppercase">Sold</span>}
                </div>
              </div>
              <button onClick={() => { sendNui('Dyn8:MarkProperty', { id: p.id }); pushAlert('GPS set') }}
                className="w-7 h-7 rounded-full bg-white/[0.04] flex items-center justify-center text-white/30 hover:text-primary transition-colors">
                <MapPin size={11} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
