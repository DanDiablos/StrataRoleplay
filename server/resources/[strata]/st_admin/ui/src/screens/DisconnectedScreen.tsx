import { useEffect, useMemo, useState } from 'react'
import { ChevronRight, User, Users } from 'lucide-react'
import { sendNui } from '../nui.ts'
import { useStore } from '../store.ts'
import Loader from '../components/Loader.tsx'
import SearchInput from '../components/SearchInput.tsx'
import Pagination from '../components/Pagination.tsx'

interface PlayerChar { First: string; Last: string; SID: number }
interface Player {
  Source: number
  AccountID: number
  Name: string
  Avatar?: string
  Character?: PlayerChar
  DisconnectedTime?: number
}

const PER_PAGE = 32

function timeAgo(ts: number): string {
  const diff = Math.floor(Date.now() / 1000) - ts
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function PlayerCard({ player }: { player: Player }): React.ReactElement {
  const navigate = useStore((s) => s.navigate)
  const initials = player.Name
    ? player.Name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  return (
    <div
      onClick={() => navigate('view-player', String(player.Source))}
      className="flex items-center gap-3 px-4 py-3 bg-menu-surface cursor-pointer hover:bg-primary/8 transition-colors opacity-75"
    >
      <div className="relative shrink-0">
        {player.Avatar
          ? <img src={player.Avatar} className="w-9 h-9 object-cover grayscale opacity-60" alt="" />
          : (
            <div className="w-9 h-9 flex items-center justify-center bg-white/8 text-white/30 font-display font-bold text-[0.85rem]">
              {initials}
            </div>
          )
        }
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-semibold text-[0.92rem] text-white/60 truncate">{player.Name}</div>
        {player.Character ? (
          <div className="font-mono text-[0.72rem] text-white/35 truncate mt-0.5">
            <User size={10} className="inline mr-1 mb-px" />
            {player.Character.First} {player.Character.Last}
            <span className="ml-1.5 text-white/20">#{player.Character.SID}</span>
          </div>
        ) : (
          <div className="font-mono text-[0.72rem] text-white/20 italic mt-0.5">no character</div>
        )}
      </div>

      <div className="flex flex-col items-end gap-1 shrink-0">
        {player.DisconnectedTime && (
          <span className="font-mono text-[0.67rem] text-white/30">{timeAgo(player.DisconnectedTime)}</span>
        )}
        <span className="font-mono text-[0.67rem] text-white/25">ID {player.AccountID}</span>
      </div>

      <ChevronRight size={11} className="text-white/18 shrink-0" />
    </div>
  )
}

export default function DisconnectedScreen(): React.ReactElement {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<Player[]>([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    setLoading(true)
    sendNui<Player[]>('GetPlayerList', { disconnected: true })
      .then((res) => setResults(Array.isArray(res) ? res : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return results.filter((r) =>
      !q
      || r.Name.toLowerCase().includes(q)
      || String(r.AccountID) === q
      || (r.Character && `${r.Character.First} ${r.Character.Last}`.toLowerCase().includes(q))
      || (r.Character && String(r.Character.SID) === q)
    ).sort((a, b) => (b.DisconnectedTime ?? 0) - (a.DisconnectedTime ?? 0))
  }, [results, search])

  const pages = Math.ceil(filtered.length / PER_PAGE)
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  return (
    <div className="flex flex-col h-full p-5 gap-3.5 box-border">
      <div className="flex gap-2.5 shrink-0">
        <SearchInput
          value={search}
          onChange={(v) => { setSearch(v); setPage(1) }}
          placeholder="Search by name, account ID, character, SID…"
        />
      </div>

      <div className="flex items-center justify-between shrink-0">
        <span className="font-display font-extrabold text-[1rem] uppercase tracking-[0.06em] text-white/85">Disconnected Players</span>
        <span className="font-mono text-[0.75rem] text-white/30">
          {filtered.length} player{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {loading ? (
        <Loader text="Loading" />
      ) : (
        <>
          <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 pr-1">
            {paged.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2.5 h-full text-center">
                <Users size={32} className="text-white/30" />
                <span className="font-mono text-[0.75rem] text-white/20 uppercase tracking-[0.08em]">No disconnected players</span>
              </div>
            ) : (
              paged.map((p) => <PlayerCard key={p.Source} player={p} />)
            )}
          </div>
          <Pagination page={page} pages={pages} onChange={setPage} />
        </>
      )}
    </div>
  )
}
