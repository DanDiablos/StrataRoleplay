import React, { useState, useEffect } from 'react'
import { Shield, Plus, ChevronLeft, Map } from 'lucide-react'
import { useStore } from '../store'
import { sendNui } from '../nui'

interface Racer { source: number; sid: number }
interface Race { id: string; track?: string; host?: string; laps?: number; state?: number; racers?: Record<string, Racer> }
interface Track { id: string; name?: string; Name?: string; Creator?: string; Checkpoints?: unknown[]; Distance?: number }

type View = 'races' | 'tracks' | 'create' | 'detail'

function raceStateLabel(state?: number): string {
  if (state === 0) return 'Staging'
  if (state === 1) return 'In Progress'
  if (state === -1) return 'Cancelled'
  return 'Open'
}

function racerCount(racers?: Record<string, Racer>): number {
  return racers ? Object.keys(racers).length : 0
}

export default function BluelineScreen(): React.ReactElement {
  const pushAlert = useStore((s) => s.pushAlert)
  const pdTracks = useStore((s) => s.player.pdTracks) as Track[] | undefined

  const [view, setView] = useState<View>('races')
  const [races, setRaces] = useState<Record<string, Race>>({})
  const [tracks, setTracks] = useState<Track[]>(pdTracks ?? [])
  const [selected, setSelected] = useState<Race | null>(null)
  const [createData, setCreateData] = useState({ track: '', laps: '3' })

  useEffect(() => { sendNui('GetBluelineData') }, [])

  useEffect(() => {
    if (pdTracks && Array.isArray(pdTracks)) setTracks(pdTracks)
  }, [pdTracks])

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (!e.isTrusted) return
      const { type, data } = e.data ?? {}
      if (type === 'PD_EVENT_SPAWN' && data?.races) setRaces(data.races)
      if (type === 'PD_ADD_PENDING_RACE' && data) setRaces((prev) => ({ ...prev, [data.id]: data }))
      if (type === 'PD_CANCEL_RACE' && data?.race) {
        setRaces((prev) => {
          const copy = { ...prev }
          if (copy[data.race]) copy[data.race] = { ...copy[data.race], state: -1 }
          return copy
        })
      }
      if (type === 'PD_FINISH_RACE' && data?.id) {
        setRaces((prev) => { const copy = { ...prev }; delete copy[data.id]; return copy })
      }
      if (type === 'PD_JOIN_RACE' && data?.race && data?.racer) {
        setRaces((prev) => {
          const r = prev[data.race]
          if (!r) return prev
          return { ...prev, [data.race]: { ...r, racers: { ...(r.racers ?? {}), [data.racer]: data } } }
        })
      }
      if (type === 'PD_LEAVE_RACE' && data?.race && data?.racer) {
        setRaces((prev) => {
          const r = prev[data.race]
          if (!r) return prev
          const racers = { ...(r.racers ?? {}) }
          delete racers[data.racer]
          return { ...prev, [data.race]: { ...r, racers } }
        })
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  const raceList = Object.values(races).filter((r) => r.state !== -1)
  const trackName = (id: string) => tracks.find((t) => t.id === id)?.name ?? tracks.find((t) => t.id === id)?.Name ?? id

  const handleCreate = () => {
    if (!createData.track) { pushAlert('Select a track'); return }
    sendNui('CreateRacePD', { track: createData.track, laps: Number(createData.laps) })
    pushAlert('Trial created')
    setView('races')
  }

  if (view === 'create') {
    return (
      <div className="flex-1 flex flex-col min-h-0">
        <div className="shrink-0 flex items-center gap-2 px-3 py-3 bg-black/30 border-b border-white/[0.06]">
          <button onClick={() => setView('races')} className="text-white/40 hover:text-white/70 transition-colors"><ChevronLeft size={16} /></button>
          <span className="font-display font-bold uppercase tracking-[0.1em] text-[0.72rem] text-white/70">New Trial</span>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-[0.6rem] font-medium text-white/40 uppercase tracking-wider">Track</span>
            <div className="flex flex-col gap-1 max-h-[150px] overflow-y-auto">
              {tracks.map((t) => (
                <button key={t.id} onClick={() => setCreateData({ ...createData, track: t.id })}
                  className={`text-left px-3 py-2 rounded-lg text-[0.68rem] transition-colors ${createData.track === t.id ? 'bg-[#1258a3]/20 border border-[#1258a3]/30 text-white/80' : 'bg-white/[0.03] border border-white/[0.04] text-white/50'}`}>
                  {t.name ?? t.Name ?? t.id}
                </button>
              ))}
              {tracks.length === 0 && <span className="text-[0.6rem] text-white/25 py-2">No tracks available</span>}
            </div>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[0.6rem] font-medium text-white/40 uppercase tracking-wider">Laps</span>
            <input type="number" value={createData.laps} onChange={(e) => setCreateData({ ...createData, laps: e.target.value })}
              className="h-9 px-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-[0.8rem] text-white/80 font-mono focus:border-primary/40 transition-colors" />
          </label>
          <button onClick={handleCreate}
            className="h-9 rounded-lg bg-[#1258a3]/20 border border-[#1258a3]/30 text-[#5ba3e6] text-[0.75rem] font-semibold uppercase tracking-wider hover:bg-[#1258a3]/30 transition-colors">
            Create Trial
          </button>
        </div>
      </div>
    )
  }

  if (view === 'tracks') {
    return (
      <div className="flex-1 flex flex-col min-h-0">
        <div className="shrink-0 flex items-center gap-2 px-3 py-3 bg-black/30 border-b border-white/[0.06]">
          <button onClick={() => setView('races')} className="text-white/40 hover:text-white/70 transition-colors"><ChevronLeft size={16} /></button>
          <span className="font-display font-bold uppercase tracking-[0.1em] text-[0.72rem] text-white/70">Tracks</span>
        </div>
        <div className="flex-1 overflow-y-auto flex flex-col">
          {tracks.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2">
              <Map size={28} className="text-white/20" />
              <span className="font-mono text-[0.65rem] text-white/20 uppercase tracking-[0.08em]">No tracks</span>
            </div>
          ) : (
            tracks.map((t) => (
              <div key={t.id} className="px-4 py-3 border-b border-white/[0.03]">
                <span className="text-[0.72rem] font-medium text-white/70">{t.name ?? t.Name ?? t.id}</span>
                <div className="flex items-center gap-3 mt-0.5">
                  {t.Checkpoints && <span className="font-mono text-[0.55rem] text-white/30">{t.Checkpoints.length} CP</span>}
                  {t.Distance != null && <span className="font-mono text-[0.55rem] text-white/30">{(t.Distance / 1000).toFixed(1)} km</span>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    )
  }

  if (view === 'detail' && selected) {
    const count = racerCount(selected.racers)
    return (
      <div className="flex-1 flex flex-col min-h-0">
        <div className="shrink-0 flex items-center gap-2 px-3 py-3 bg-black/30 border-b border-white/[0.06]">
          <button onClick={() => setView('races')} className="text-white/40 hover:text-white/70 transition-colors"><ChevronLeft size={16} /></button>
          <span className="font-display font-bold uppercase tracking-[0.1em] text-[0.72rem] text-white/70">Trial</span>
        </div>
        <div className="px-4 py-4 flex flex-col gap-2">
          <div className="flex items-center justify-between px-3 py-2 bg-white/[0.02] border-b border-white/[0.04]">
            <span className="font-mono text-[0.55rem] text-white/35 uppercase">Track</span>
            <span className="text-[0.68rem] text-white/65">{trackName(selected.track ?? '')}</span>
          </div>
          <div className="flex items-center justify-between px-3 py-2 bg-white/[0.02] border-b border-white/[0.04]">
            <span className="font-mono text-[0.55rem] text-white/35 uppercase">Laps</span>
            <span className="font-mono text-[0.68rem] text-white/65">{selected.laps ?? 1}</span>
          </div>
          <div className="flex items-center justify-between px-3 py-2 bg-white/[0.02] border-b border-white/[0.04]">
            <span className="font-mono text-[0.55rem] text-white/35 uppercase">Racers</span>
            <span className="font-mono text-[0.68rem] text-white/65">{count}</span>
          </div>
          <div className="flex items-center justify-between px-3 py-2 bg-white/[0.02]">
            <span className="font-mono text-[0.55rem] text-white/35 uppercase">Status</span>
            <span className="font-mono text-[0.68rem] text-white/65">{raceStateLabel(selected.state)}</span>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={() => { sendNui('JoinRacePD', { id: selected.id }); pushAlert('Joined trial') }}
              className="flex-1 h-8 rounded-lg bg-[#1258a3]/15 border border-[#1258a3]/25 text-[#5ba3e6] text-[0.65rem] font-semibold hover:bg-[#1258a3]/25 transition-colors">Join</button>
            <button onClick={() => { sendNui('LeaveRacePD', { id: selected.id }); pushAlert('Left trial'); setView('races') }}
              className="flex-1 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] text-white/40 text-[0.65rem] font-semibold hover:bg-white/[0.08] transition-colors">Leave</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="shrink-0 flex items-center justify-between px-4 py-3 bg-black/30 border-b border-white/[0.06]">
        <div className="flex items-center gap-1.5">
          <Shield size={14} className="text-[#2980b9]" />
          <span className="font-display font-bold uppercase tracking-[0.1em] text-[0.72rem] text-white/70">Pursuit</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setView('tracks')} className="text-white/30 hover:text-white/60 transition-colors"><Map size={13} /></button>
          <button onClick={() => setView('create')} className="text-primary/80 hover:text-primary transition-colors"><Plus size={16} /></button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto flex flex-col">
        {raceList.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2">
            <Shield size={28} className="text-white/20" />
            <span className="font-mono text-[0.65rem] text-white/20 uppercase tracking-[0.08em]">No active trials</span>
          </div>
        ) : (
          raceList.map((r) => (
            <button key={r.id} onClick={() => { setSelected(r); setView('detail') }}
              className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors border-b border-white/[0.03]">
              <div className="w-9 h-9 rounded-lg bg-[#1258a3]/15 flex items-center justify-center shrink-0">
                <Shield size={15} className="text-[#1258a3]/60" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <span className="text-[0.72rem] font-medium text-white/70 truncate block">{trackName(r.track ?? '')}</span>
                <span className="font-mono text-[0.55rem] text-white/30">{racerCount(r.racers)} racers · {r.laps ?? 1} laps</span>
              </div>
              <span className="text-[0.55rem] font-medium text-[#1258a3]/60 uppercase">{raceStateLabel(r.state)}</span>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
