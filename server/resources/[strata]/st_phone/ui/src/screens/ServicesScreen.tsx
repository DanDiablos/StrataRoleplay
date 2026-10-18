import React, { useState, useEffect } from 'react'
import { Wrench, MapPin, Phone } from 'lucide-react'
import { sendNui } from '../nui'
import { useStore } from '../store'

interface Player { playerId: number; playerNumber: string; playerName: string; playerStatus: number }
interface Service { jobName: string; jobLabel: string; jobColor?: string; players: Player[]; phoneNumber?: string; jobLocation?: { x: number; y: number; z: number } }

export default function ServicesScreen(): React.ReactElement {
  const pushAlert = useStore((s) => s.pushAlert)
  const openApp = useStore((s) => s.openApp)
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await sendNui('Services:GetServices', {})
        const data = await res.json()
        if (Array.isArray(data)) setServices(data)
      } catch { /* noop */ }
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="shrink-0 px-4 py-3 bg-black/30 border-b border-white/[0.06]">
        <div className="flex items-center gap-1.5">
          <Wrench size={14} className="text-[#E95200]" />
          <span className="font-display font-bold uppercase tracking-[0.1em] text-[0.72rem] text-white/70">Services</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto flex flex-col">
        {services.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2">
            <Wrench size={28} className="text-white/20" />
            <span className="font-mono text-[0.65rem] text-white/20 uppercase tracking-[0.08em]">{loading ? 'Loading...' : 'No services'}</span>
          </div>
        ) : (
          services.map((s) => (
            <div key={s.jobName} className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.03]">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[0.75rem] font-medium text-white/70">{s.jobLabel}</span>
                  <span className="font-mono text-[0.5rem] text-menu-success-lt/60">{s.players?.length ?? 0} online</span>
                </div>
              </div>
              {s.phoneNumber && (
                <button
                  onClick={() => openApp('phone', `call:${s.phoneNumber}`)}
                  className="w-7 h-7 rounded-full bg-[#21a500]/15 flex items-center justify-center text-[#21a500]/60 hover:text-[#21a500] transition-colors"
                >
                  <Phone size={11} />
                </button>
              )}
              {s.jobLocation && (
                <button
                  onClick={() => { sendNui('Services:SetGPS', { location: s.jobLocation }); pushAlert('GPS set') }}
                  className="w-7 h-7 rounded-full bg-white/[0.04] flex items-center justify-center text-white/30 hover:text-primary transition-colors"
                >
                  <MapPin size={11} />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
