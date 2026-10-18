import { useState } from 'react'
import { Car, MapPin } from 'lucide-react'
import { sendNui } from '../../nui'
import ActionBtn from '../../components/ActionBtn.tsx'
import Loader from '../../components/Loader.tsx'
import type { FleetVehicle } from '../../types'

export default function FleetTab(): React.ReactElement {
  const [loading, setLoading]   = useState(false)
  const [vehicles, setVehicles] = useState<FleetVehicle[]>([])
  const [loaded, setLoaded]     = useState(false)
  const [tracking, setTracking] = useState<string | null>(null)

  const doLoad = async () => {
    setLoading(true)
    try {
      const r = await sendNui('ViewVehicleFleet', {})
      const result = await r.json()
      setVehicles(Array.isArray(result) ? result : [])
      setLoaded(true)
    } finally {
      setLoading(false)
    }
  }

  const doTrack = async (id: string | number) => {
    setTracking(String(id))
    try {
      const r = await sendNui('TrackFleetVehicle', { id })
      const result = await r.json()
      if (!result) setTracking(null)
    } catch {
      setTracking(null)
    }
  }

  return (
    <div className="h-full flex flex-col p-5 gap-3.5">
      <div className="flex items-center justify-between shrink-0">
        <span className="font-display font-bold uppercase tracking-[0.12em] text-[0.72rem] text-white/50">
          Fleet Management
        </span>
        <ActionBtn onClick={doLoad} disabled={loading}>
          {loading ? 'Loading…' : 'Refresh'}
        </ActionBtn>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 pr-1">
        {loading && <div className="flex justify-center py-8"><Loader /></div>}
        {!loading && loaded && vehicles.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <Car size={28} className="text-white/20" />
            <span className="font-mono text-[0.72rem] text-white/20 uppercase tracking-[0.06em]">No fleet vehicles</span>
          </div>
        )}
        {!loading && !loaded && (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <Car size={28} className="text-white/20" />
            <span className="font-mono text-[0.68rem] text-white/20 uppercase tracking-[0.06em]">Click refresh to load fleet</span>
          </div>
        )}
        {!loading && vehicles.map(v => (
          <div
            key={v.id}
            className="flex items-center gap-3 px-4 py-3 bg-menu-surface border-b border-white/[0.04] last:border-0"
          >
            <Car size={14} className="text-white/30 shrink-0" />
            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
              <span className="font-medium text-[0.84rem] text-white/80">{v.label ?? v.model}</span>
              <span className="font-mono text-[0.65rem] text-white/35 uppercase">{v.plate}</span>
            </div>
            {v.driver && (
              <span className="font-mono text-[0.65rem] text-white/40">{v.driver}</span>
            )}
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${v.online ? 'bg-menu-success' : 'bg-white/20'}`} />
              <span className="font-mono text-[0.62rem] text-white/30">{v.online ? 'Online' : 'Offline'}</span>
            </div>
            <button
              onClick={() => doTrack(v.id)}
              disabled={tracking === String(v.id)}
              className={`flex items-center gap-1 px-2.5 py-1 border text-[0.72rem] font-medium transition-colors ${
                tracking === String(v.id)
                  ? 'border-primary/40 bg-primary/10 text-primary'
                  : 'border-white/10 text-white/40 hover:border-primary/30 hover:text-primary/70'
              }`}
            >
              <MapPin size={11} />
              Track
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
