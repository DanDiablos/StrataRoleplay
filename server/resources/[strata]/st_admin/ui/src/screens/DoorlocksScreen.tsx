import { useEffect, useMemo, useState } from 'react'
import { DoorClosed, DoorOpen, Plus, RefreshCw } from 'lucide-react'
import { sendNui } from '../nui.ts'
import { useStore } from '../store.ts'
import Loader from '../components/Loader.tsx'
import SearchInput from '../components/SearchInput.tsx'
import Pagination from '../components/Pagination.tsx'

interface Doorlock {
  id: number
  name: string
  state: number
  coords?: { x: number; y: number; z: number }
  groups?: Record<string, number>
}

const PER_PAGE = 20

function DoorlockCard({ doorlock, onRefresh }: { doorlock: Doorlock; onRefresh: () => void }): React.ReactElement {
  const navigate = useStore((s) => s.navigate)
  const compact = useStore((s) => s.compact)
  const isLocked = doorlock.state === 1
  const groupCount = Object.keys(doorlock.groups ?? {}).length

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await sendNui('ToggleDoorLockState', { id: doorlock.id, state: isLocked ? 0 : 1 })
    onRefresh()
  }

  return (
    <div
      onClick={() => navigate('view-doorlock', String(doorlock.id))}
      className={`flex items-center bg-menu-surface cursor-pointer hover:bg-primary/8 transition-colors ${compact ? 'gap-2 px-2.5 py-2.5' : 'gap-3 px-4 py-3'}`}
    >
      <div className={`${compact ? 'w-7 h-7' : 'w-8 h-8'} flex items-center justify-center border shrink-0 ${
        isLocked
          ? 'bg-menu-error/35 border-menu-error-lt/40 text-red-300'
          : 'bg-menu-success/15 border-menu-success/30 text-menu-success-lt'
      }`}>
        {isLocked ? <DoorClosed size={compact ? 12 : 14} /> : <DoorOpen size={compact ? 12 : 14} />}
      </div>

      <div className="flex-1 min-w-0">
        <div className={`font-semibold text-[#e2e2e2] truncate ${compact ? 'text-[0.82rem]' : 'text-[0.92rem]'}`}>{doorlock.name}</div>
        <div className="font-mono text-[0.7rem] text-white/30 mt-0.5 truncate">
          ID #{doorlock.id}
          {!compact && doorlock.coords && (
            <span className="ml-2">
              {doorlock.coords.x.toFixed(1)}, {doorlock.coords.y.toFixed(1)}, {doorlock.coords.z.toFixed(1)}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {!compact && groupCount > 0 && (
          <span className="font-mono text-[0.67rem] text-white/30">{groupCount} group{groupCount !== 1 ? 's' : ''}</span>
        )}
        <button
          onClick={handleToggle}
          className={`font-mono text-[0.67rem] px-2 py-px border transition-colors ${
            isLocked
              ? 'bg-menu-error/30 border-menu-error-lt/35 text-red-300 hover:bg-menu-error/50'
              : 'bg-menu-success/12 border-menu-success/25 text-menu-success-lt hover:bg-menu-success/25'
          }`}
        >
          {isLocked ? 'locked' : 'unlocked'}
        </button>
      </div>
    </div>
  )
}

export default function DoorlocksScreen(): React.ReactElement {
  const navigate = useStore((s) => s.navigate)
  const compact = useStore((s) => s.compact)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<Doorlock[]>([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const fetchDoors = () => {
    setLoading(true)
    sendNui<Doorlock[]>('GetDoorLocks', {})
      .then((res) => setResults(Array.isArray(res) ? res : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchDoors() }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return results.filter((d) =>
      !q || d.name.toLowerCase().includes(q) || String(d.id) === q
    ).sort((a, b) => a.id - b.id)
  }, [results, search])

  const pages = Math.ceil(filtered.length / PER_PAGE)
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  return (
    <div className={`flex flex-col h-full gap-3.5 box-border ${compact ? 'p-3' : 'p-5'}`}>
      <div className="flex gap-2.5 shrink-0">
        <button
          onClick={() => navigate('view-doorlock', 'new')}
          className="flex items-center gap-1.5 h-9 px-3.5 border border-primary/35 bg-primary/8 text-[#FF8C42] text-[0.82rem] font-semibold hover:bg-primary/18 hover:border-primary/50 hover:text-white transition-colors shrink-0 whitespace-nowrap"
        >
          <Plus size={12} />
          New Doorlock
        </button>
        <SearchInput
          value={search}
          onChange={(v) => { setSearch(v); setPage(1) }}
          placeholder="Search by name or ID…"
        />
        <button
          onClick={fetchDoors}
          className="w-9 h-9 flex items-center justify-center border border-white/10 bg-white/3 text-white/40 hover:text-white/70 hover:bg-white/7 transition-colors shrink-0"
        >
          <RefreshCw size={12} />
        </button>
      </div>

      <div className="flex items-center justify-between shrink-0">
        <span className="font-display font-extrabold text-[1rem] uppercase tracking-[0.06em] text-white/85">Doorlocks</span>
        <span className="font-mono text-[0.75rem] text-white/30">
          {filtered.length} door{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {loading ? (
        <Loader text="Loading Doorlocks" />
      ) : (
        <>
          <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 pr-1">
            {paged.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2.5 h-full text-center">
                <DoorClosed size={32} className="text-white/30" />
                <span className="font-mono text-[0.75rem] text-white/20 uppercase tracking-[0.08em]">No doorlocks found</span>
              </div>
            ) : (
              paged.map((d) => <DoorlockCard key={d.id} doorlock={d} onRefresh={fetchDoors} />)
            )}
          </div>
          <Pagination page={page} pages={pages} onChange={setPage} />
        </>
      )}
    </div>
  )
}
