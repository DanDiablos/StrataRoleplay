import React, { useState, useEffect, useCallback } from 'react'
import { Home, Lock, Unlock, Key, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import { useStore } from '../store'
import { sendNui } from '../nui'

interface Property { id: string; label: string; locked?: boolean; keys?: { sid: number; name: string }[] }

export default function HomeManageScreen(): React.ReactElement {
  const pushAlert = useStore((s) => s.pushAlert)
  const [properties, setProperties] = useState<Property[]>([])
  const [selected, setSelected] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProperties = useCallback(async () => {
    try {
      const res = await sendNui('Home:GetMyProperties', {})
      const data = await res.json()
      if (Array.isArray(data)) {
        setProperties(data)
        if (selected) {
          const updated = data.find((p: Property) => p.id === selected.id)
          if (updated) setSelected(updated)
        }
      }
    } catch { /* noop */ }
    setLoading(false)
  }, [selected])

  useEffect(() => { fetchProperties() }, [])

  const toggleLock = async (p: Property) => {
    sendNui('Home:LockProperty', { id: p.id, locked: !p.locked })
    setProperties((prev) => prev.map((x) => x.id === p.id ? { ...x, locked: !x.locked } : x))
    if (selected?.id === p.id) setSelected({ ...p, locked: !p.locked })
    pushAlert(p.locked ? 'Unlocked' : 'Locked')
  }

  if (selected) {
    return (
      <div className="flex-1 flex flex-col min-h-0">
        <div className="shrink-0 flex items-center gap-2 px-3 py-3 bg-black/30 border-b border-white/[0.06]">
          <button onClick={() => setSelected(null)} className="text-white/40 hover:text-white/70 transition-colors">
            <ChevronLeft size={16} />
          </button>
          <span className="font-display font-bold uppercase tracking-[0.1em] text-[0.72rem] text-white/70 truncate">{selected.label}</span>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2">
          <button onClick={() => toggleLock(selected)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] transition-colors">
            {selected.locked ? <Lock size={13} className="text-red-400/60" /> : <Unlock size={13} className="text-menu-success-lt/60" />}
            <span className="text-[0.72rem] font-medium text-white/65">{selected.locked ? 'Unlock Property' : 'Lock Property'}</span>
          </button>
          <button onClick={() => { sendNui('Home:EditMode', { id: selected.id }); pushAlert('Furniture edit mode') }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] transition-colors">
            <Home size={13} className="text-white/40" />
            <span className="text-[0.72rem] font-medium text-white/65">Edit Furniture</span>
          </button>
          <div className="mt-3">
            <span className="font-display font-bold uppercase tracking-[0.12em] text-[0.6rem] text-white/35 px-1">Digital Keys</span>
            {(selected.keys ?? []).length === 0 ? (
              <p className="text-[0.62rem] text-white/25 mt-2 px-1">No keys shared</p>
            ) : (
              (selected.keys ?? []).map((k) => (
                <div key={k.sid} className="flex items-center gap-3 px-3 py-2 mt-1 rounded-lg bg-white/[0.02]">
                  <Key size={11} className="text-white/30" />
                  <span className="flex-1 text-[0.68rem] text-white/60">{k.name}</span>
                  <button onClick={async () => { await sendNui('Home:RevokeDigiKey', { id: selected.id, sid: k.sid }); pushAlert('Key revoked'); fetchProperties() }}
                    className="text-white/20 hover:text-red-400/60 transition-colors"><Trash2 size={10} /></button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="shrink-0 px-4 py-3 bg-black/30 border-b border-white/[0.06]">
        <div className="flex items-center gap-1.5">
          <Home size={14} className="text-[#362a4f]" />
          <span className="font-display font-bold uppercase tracking-[0.1em] text-[0.72rem] text-white/70">Properties</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto flex flex-col">
        {properties.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2">
            <Home size={28} className="text-white/20" />
            <span className="font-mono text-[0.65rem] text-white/20 uppercase tracking-[0.08em]">{loading ? 'Loading...' : 'No properties'}</span>
          </div>
        ) : (
          properties.map((p) => (
            <button key={p.id} onClick={() => setSelected(p)}
              className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors border-b border-white/[0.03]">
              <div className="w-9 h-9 rounded-lg bg-[#362a4f]/20 flex items-center justify-center shrink-0">
                <Home size={15} className="text-[#362a4f]" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <span className="text-[0.72rem] font-medium text-white/70 truncate block">{p.label}</span>
              </div>
              {p.locked ? <Lock size={11} className="text-red-400/40" /> : <Unlock size={11} className="text-menu-success-lt/40" />}
              <ChevronRight size={14} className="text-white/15" />
            </button>
          ))
        )}
      </div>
    </div>
  )
}
