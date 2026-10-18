import React, { useState, useEffect, useCallback } from 'react'
import { Flag, Plus, ChevronLeft, Play, Users, Map, Clock } from 'lucide-react'
import { useStore } from '../store'
import { sendNui } from '../nui'

interface Racer { source: number; sid: number }
interface Race { id: string; track?: string; host_id?: number; laps?: number; buyin?: number; state?: number; racers?: Record<string, Racer>; time?: number }
interface Track { id: string; name?: string; Creator?: string; Checkpoints?: unknown[]; Distance?: number }

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

export default function RedlineScreen(): React.ReactElement {
  const pushAlert = useStore((s) => s.pushAlert)
  const playerTracks = useStore((s) => s.player.tracks) as Track[] | undefined

  const [view, setView] = useState<View>('races')
  const [races, setRaces] = useState<Record<string, Race>>({})
  const [tracks, setTracks] = useState<Track[]>(playerTracks ?? [])
  const [selected, setSelected] = useState<Race | null>(null)
  const [createData, setCreateData] = useState({ track: '', laps: '3', buyin: '0' })

  /* Fetch data on mount */
  useEffect(() => {
    sendNui('GetRedlineData')
  }, [])

  /* Sync tracks from store */
  useEffect(() => {
    if (playerTracks && Array.isArray(playerTracks)) setTracks(playerTracks)
  }, [playerTracks])

  /* Listen for race events */
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (!e.isTrusted) return
      const { type, data } = e.data ?? {}
      if (type === 'EVENT_SPAWN' && data?.races) {
        setRaces(data.races)
      }
      if (type === 'ADD_PENDING_RACE' && data?.race) {
        setRaces((prev) => ({ ...prev, [data.race.id]: data.race }))
      }
      if (type === 'CANCEL_RACE' && data?.race) {
        setRaces((prev) => {
          const copy = { ...prev }
          if (copy[data.race]) copy[data.race] = { ...copy[data.race], state: -1 }
          return copy
        })
      }
      if (type === 'FINISH_RACE' && data?.race) {
        setRaces((prev) => {
          const copy = { ...prev }
          delete copy[data.race]
          return copy
        })
      }
      if (type === 'JOIN_RACE' && data?.race && data?.racer) {
        setRaces((prev) => {
          const r = prev[data.race]
          if (!r) return prev
          return { ...prev, [data.race]: { ...r, racers: { ...(r.racers ?? {}), [data.racer]: data.racerData } } }
        })
      }
      if (type === 'LEAVE_RACE' && data?.race && data?.racer) {
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
  const trackName = (id: string) => tracks.find((t) => t.id === id)?.name ?? id

  const handleCreate = () => {
    if (!createData.track) { pushAlert('Select a track'); return }
    sendNui('CreateRace', { track: createData.track, laps: Number(createData.laps), buyin: Number(createData.buyin) })
    pushAlert('Race created')
    setView('races')
  }

  /* ── Create view ────────────────────── */
  if (view === 'create') {
    return (
      <div className="flex-1 flex flex-col min-h-0">
        <div className="shrink-0 flex items-center gap-2 px-3 py-3 bg-black/30 border-b border-white/[0.06]">
          <button onClick={() => setView('races')} className="text-white/40 hover:text-white/70 transition-colors"><ChevronLeft size={16} /></button>
          <span className="font-display font-bold uppercase tracking-[0.1em] text-[0.72rem] text-white/70">New Race</span>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-[0.6rem] font-medium text-white/40 uppercase tracking-wider">Track</span>
            <div className="flex flex-col gap-1 max-h-[150px] overflow-y-auto">
              {tracks.map((t) => (
                <button key={t.id} onClick={() => setCreateData({ ...createData, track: t.id })}
                  className={`text-left px-3 py-2 rounded-lg text-[0.68rem] transition-colors ${createData.track === t.id ? 'bg-[#9d1614]/20 border border-[#9d1614]/30 text-white/80' : 'bg-white/[0.03] border border-white/[0.04] text-white/50'}`}>
                  {t.name ?? t.Creator ?? t.id}
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
          <label className="flex flex-col gap-1">
            <span className="text-[0.6rem] font-medium text-white/40 uppercase tracking-wider">Buy-in ($)</span>
            <input type="number" value={createData.buyin} onChange={(e) => setCreateData({ ...createData, buyin: e.target.value })}
              className="h-9 px-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-[0.8rem] text-white/80 font-mono focus:border-primary/40 transition-colors" />
          </label>
          <button onClick={handleCreate}
            className="h-9 rounded-lg bg-[#9d1614]/20 border border-[#9d1614]/30 text-[#ff6b6b] text-[0.75rem] font-semibold uppercase tracking-wider hover:bg-[#9d1614]/30 transition-colors">
            Create Race
          </button>
        </div>
      </div>
    )
  }

  /* ── Tracks view ────────────────────── */
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
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[0.72rem] font-medium text-white/70">{t.name ?? t.id}</span>
                  {t.Creator && <span className="font-mono text-[0.5rem] text-white/25">by {t.Creator}</span>}
                </div>
                <div className="flex items-center gap-3">
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

  /* ── Race detail ────────────────────── */
  if (view === 'detail' && selected) {
    const count = racerCount(selected.racers)
    return (
      <div className="flex-1 flex flex-col min-h-0">
        <div className="shrink-0 flex items-center gap-2 px-3 py-3 bg-black/30 border-b border-white/[0.06]">
          <button onClick={() => setView('races')} className="text-white/40 hover:text-white/70 transition-colors"><ChevronLeft size={16} /></button>
          <span className="font-display font-bold uppercase tracking-[0.1em] text-[0.72rem] text-white/70">Race</span>
        </div>
        <div className="px-4 py-4 flex flex-col gap-2">
          <InfoRow label="Track" value={trackName(selected.track ?? '')} />
          <InfoRow label="Laps" value={String(selected.laps ?? 1)} />
          <InfoRow label="Buy-in" value={`$${(selected.buyin ?? 0).toLocaleString()}`} accent />
          <InfoRow label="Racers" value={String(count)} />
          <InfoRow label="Status" value={raceStateLabel(selected.state)} />

          {selected.racers && count > 0 && (
            <div className="mt-2">
              <span className="text-[0.55rem] font-medium text-white/30 uppercase tracking-wider block mb-1">Racers</span>
              {Object.keys(selected.racers).map((alias) => (
                <div key={alias} className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.02] border-b border-white/[0.03]">
                  <Users size={10} className="text-white/25" />
                  <span className="text-[0.65rem] text-white/55">{alias}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 mt-3">
            <button onClick={() => { sendNui('JoinRace', { id: selected.id }); pushAlert('Joined race') }}
              className="flex-1 h-8 rounded-lg bg-[#9d1614]/15 border border-[#9d1614]/25 text-[#ff6b6b] text-[0.65rem] font-semibold hover:bg-[#9d1614]/25 transition-colors">Join</button>
            <button onClick={() => { sendNui('LeaveRace', { id: selected.id }); pushAlert('Left race'); setView('races') }}
              className="flex-1 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] text-white/40 text-[0.65rem] font-semibold hover:bg-white/[0.08] transition-colors">Leave</button>
          </div>
        </div>
      </div>
    )
  }

  /* ── Races list ─────────────────────── */
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="shrink-0 flex items-center justify-between px-4 py-3 bg-black/30 border-b border-white/[0.06]">
        <div className="flex items-center gap-1.5">
          <Flag size={14} className="text-[#c0392b]" />
          <span className="font-display font-bold uppercase tracking-[0.1em] text-[0.72rem] text-white/70">Nitro</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setView('tracks')} className="text-white/30 hover:text-white/60 transition-colors"><Map size={13} /></button>
          <button onClick={() => setView('create')} className="text-primary/80 hover:text-primary transition-colors"><Plus size={16} /></button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto flex flex-col">
        {raceList.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2">
            <Flag size={28} className="text-white/20" />
            <span className="font-mono text-[0.65rem] text-white/20 uppercase tracking-[0.08em]">No active races</span>
          </div>
        ) : (
          raceList.map((r) => (
            <button key={r.id} onClick={() => { setSelected(r); setView('detail') }}
              className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors border-b border-white/[0.03]">
              <div className="w-9 h-9 rounded-lg bg-[#9d1614]/15 flex items-center justify-center shrink-0">
                <Flag size={15} className="text-[#9d1614]/60" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <span className="text-[0.72rem] font-medium text-white/70 truncate block">{trackName(r.track ?? '')}</span>
                <span className="font-mono text-[0.55rem] text-white/30">{racerCount(r.racers)} racers · {r.laps ?? 1} laps · ${r.buyin ?? 0}</span>
              </div>
              <span className="text-[0.55rem] font-medium text-[#9d1614]/60 uppercase">{raceStateLabel(r.state)}</span>
            </button>
          ))
        )}
      </div>
    </div>
  )
}

function InfoRow({ label, value, accent }: { label: string; value: string; accent?: boolean }): React.ReactElement {
  return (
    <div className="flex items-center justify-between px-3 py-2 bg-white/[0.02] border-b border-white/[0.04]">
      <span className="font-mono text-[0.55rem] text-white/35 uppercase">{label}</span>
      <span className={`font-mono text-[0.68rem] ${accent ? 'text-[#ff6b6b]' : 'text-white/65'}`}>{value}</span>
    </div>
  )
}
