import React, { useState, useEffect } from 'react'
import { Car, MapPin, Search } from 'lucide-react'
import { useStore } from '../store'
import { sendNui } from '../nui'

interface Vehicle { vin: string; model: string; plate: string; garage?: string; state?: string; color?: string }

export default function GarageScreen(): React.ReactElement {
  const pushAlert = useStore((s) => s.pushAlert)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await sendNui('Garage:GetCars', {})
        const data = await res.json()
        if (Array.isArray(data)) setVehicles(data)
      } catch { /* noop */ }
      setLoading(false)
    }
    load()
  }, [])

  const filtered = vehicles.filter((v) => {
    const q = search.toLowerCase()
    return v.model?.toLowerCase().includes(q) || v.plate?.toLowerCase().includes(q)
  })

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="shrink-0 px-4 py-3 bg-black/30 border-b border-white/[0.06]">
        <div className="flex items-center gap-1.5">
          <Car size={14} className="text-[#50ba13]" />
          <span className="font-display font-bold uppercase tracking-[0.1em] text-[0.72rem] text-white/70">Garage</span>
        </div>
      </div>
      <div className="shrink-0 px-3 py-2">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/25" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search vehicles..."
            className="w-full h-8 pl-8 pr-3 bg-white/[0.04] border border-white/[0.06] rounded-lg text-[0.75rem] text-white/80 placeholder-white/25 focus:border-primary/40 transition-colors" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto flex flex-col">
        {filtered.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2">
            <Car size={28} className="text-white/20" />
            <span className="font-mono text-[0.65rem] text-white/20 uppercase tracking-[0.08em]">{loading ? 'Loading...' : 'No vehicles'}</span>
          </div>
        ) : (
          filtered.map((v) => (
            <div key={v.vin} className="flex items-center gap-3 px-4 py-2.5 border-b border-white/[0.03]">
              <div className="w-9 h-9 rounded-lg bg-[#50ba13]/10 flex items-center justify-center shrink-0">
                <Car size={15} className="text-[#50ba13]/50" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[0.72rem] font-medium text-white/70 truncate block">{v.model}</span>
                <span className="font-mono text-[0.55rem] text-white/30">{v.plate} · {v.garage ?? 'Unknown'}</span>
              </div>
              <button
                onClick={() => { sendNui('Garage:TrackVehicle', { vin: v.vin }); pushAlert('Tracking vehicle') }}
                className="w-7 h-7 rounded-full bg-white/[0.04] flex items-center justify-center text-white/30 hover:text-primary transition-colors"
              >
                <MapPin size={11} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
