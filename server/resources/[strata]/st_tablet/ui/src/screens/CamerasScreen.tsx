import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, X, Video, Search, Wifi, WifiOff, Move, Lock } from 'lucide-react'
import { sendNui } from '../nui'
import { useStore } from '../store'

interface Camera {
  id: number
  label: string
  group?: string
  isOnline: boolean
  quality: string
  canRotate: boolean
}

const GROUP_LABEL: Record<string, string> = {
  store1: '24/7 — Davis',
  store2: '24/7 — N. Rockford Dr',
  store3: '24/7 — Little Seoul',
  store4: '24/7 — Grapeseed',
  store5: '24/7 — Grand Senora',
  store6: '24/7 — Mt. Chiliad',
}

function groupLabel(id?: string): string {
  if (!id) return 'Ungrouped'
  return GROUP_LABEL[id] ?? id.replace(/_/g, ' ').toUpperCase()
}

export default function CamerasScreen(): React.ReactElement {
  const navigate = useStore(s => s.navigate)
  const dispatch = useStore(s => s.dispatch)

  const [cameras, setCameras] = useState<Camera[]>([])
  const [loading, setLoading] = useState(true)
  const [query,   setQuery]   = useState('')

  useEffect(() => {
    sendNui('GetCameras')
      .then(r => r.json())
      .then((list: Camera[]) => setCameras(Array.isArray(list) ? list : []))
      .catch(() => setCameras([]))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return cameras
    return cameras.filter(c =>
      c.label.toLowerCase().includes(q) ||
      groupLabel(c.group).toLowerCase().includes(q) ||
      String(c.id).includes(q)
    )
  }, [cameras, query])

  const grouped = useMemo(() => {
    const by = new Map<string, Camera[]>()
    for (const cam of filtered) {
      const key = cam.group ?? '__ungrouped__'
      if (!by.has(key)) by.set(key, [])
      by.get(key)!.push(cam)
    }
    return Array.from(by.entries()).map(([key, items]) => ({
      key,
      label: key === '__ungrouped__' ? 'Ungrouped' : groupLabel(key),
      items: items.sort((a, b) => a.id - b.id),
    }))
  }, [filtered])

  const handleClose = () => {
    dispatch('LAPTOP_NOT_VISIBLE')
    sendNui('CloseTablet')
  }

  const handleView = (cam: Camera) => {
    dispatch('LAPTOP_NOT_VISIBLE')
    sendNui('ViewCamera', { camId: cam.id })
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="h-[52px] shrink-0 flex items-center px-4 gap-3 border-b border-white/[0.06] bg-menu-surface">
        <button
          onClick={() => navigate('home')}
          className="w-7 h-7 flex items-center justify-center border border-white/10 bg-white/[0.03] text-white/30 hover:text-white/60 transition-colors"
        >
          <ArrowLeft size={13} />
        </button>
        <span
          className="font-display font-black tracking-[0.1em] text-[1.05rem] select-none"
          style={{ background: 'linear-gradient(90deg, #FF5C3A, #FF8C42)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
        >
          STRATA
        </span>
        <span className="font-mono text-[0.65rem] text-white/25 uppercase">/ watchtower</span>
        <div className="flex-1" />
        <span className="font-mono text-[0.65rem] text-white/30 uppercase tracking-[0.05em]">
          {cameras.length} feed{cameras.length === 1 ? '' : 's'}
        </span>
        <button
          onClick={handleClose}
          className="flex items-center gap-1.5 font-mono text-[0.65rem] text-white/25 hover:text-white/60 uppercase tracking-[0.05em] transition-colors"
        >
          <X size={11} /><span>ESC</span>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 flex flex-col p-5 gap-3.5">

        {/* Search */}
        <div className="shrink-0 relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search cameras…"
            className="w-full h-9 pl-9 pr-3 bg-menu-surface-lt border border-white/10 text-[0.82rem] text-white/80 placeholder-white/25 focus:border-primary/50 transition-colors"
          />
        </div>

        {/* Title row */}
        <div className="shrink-0 flex items-center gap-2">
          <Video size={13} className="text-primary" />
          <span className="font-display font-bold uppercase tracking-[0.12em] text-[0.72rem] text-white/70">
            Security Feeds
          </span>
        </div>

        {/* List */}
        <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-3 pr-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-2.5">
              <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              <span className="font-mono text-[0.72rem] text-white/25 uppercase tracking-[0.08em]">Loading feeds</span>
            </div>
          ) : grouped.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2.5">
              <Video size={32} className="text-white/25" />
              <span className="font-mono text-[0.72rem] text-white/25 uppercase tracking-[0.08em]">
                {cameras.length === 0 ? 'No access' : 'No results'}
              </span>
            </div>
          ) : (
            grouped.map(g => (
              <div key={g.key} className="border-l-[3px] border-l-primary bg-menu-surface">
                <div className="px-3 py-2 bg-menu-surface-lt border-b border-white/[0.06] flex items-center justify-between">
                  <span className="font-display font-bold uppercase tracking-[0.12em] text-[0.72rem] text-white/70">
                    {g.label}
                  </span>
                  <span className="font-mono text-[0.62rem] text-white/30 uppercase tracking-[0.05em]">
                    {g.items.length} cam{g.items.length === 1 ? '' : 's'}
                  </span>
                </div>
                <div>
                  {g.items.map(cam => (
                    <button
                      key={cam.id}
                      onClick={() => cam.isOnline && handleView(cam)}
                      disabled={!cam.isOnline}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-white/[0.04] last:border-0 transition-colors ${
                        cam.isOnline ? 'hover:bg-primary/[0.08] cursor-pointer' : 'opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <span className="font-mono text-[0.68rem] text-white/35 w-8 shrink-0">#{String(cam.id).padStart(3, '0')}</span>
                      <span className="flex-1 font-medium text-[0.82rem] text-white/80 truncate">
                        {cam.label}
                      </span>
                      <span className="flex items-center gap-1.5 font-mono text-[0.6rem] uppercase tracking-[0.05em] text-white/35">
                        {cam.canRotate ? <Move size={10} /> : <Lock size={10} />}
                        {cam.quality}
                      </span>
                      {cam.isOnline ? (
                        <span className="flex items-center gap-1.5 font-mono text-[0.62rem] uppercase tracking-[0.05em] text-menu-success-lt shrink-0">
                          <Wifi size={11} /> Online
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 font-mono text-[0.62rem] uppercase tracking-[0.05em] text-red-300/70 shrink-0">
                          <WifiOff size={11} /> Offline
                        </span>
                      )}
                      <span className={`px-[10px] py-[4px] border text-[0.72rem] font-semibold shrink-0 ${
                        cam.isOnline
                          ? 'border-primary/35 bg-primary/8 text-[#FF8C42]'
                          : 'border-white/10 bg-white/[0.03] text-white/25'
                      }`}>
                        VIEW
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
