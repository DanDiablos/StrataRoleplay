import { useEffect, useState } from 'react'
import { ChevronRight, Search, UserX } from 'lucide-react'
import { sendNui } from '../nui.ts'
import { useStore } from '../store.ts'
import Loader from '../components/Loader.tsx'
import Pagination from '../components/Pagination.tsx'

interface Character {
  SID: number
  First: string
  Last: string
  Online?: number
  Identifier?: string
  AccountID?: number
}

interface SearchResult { players: Character[]; pages: number }

const PER_PAGE = 10

function CharacterCard({ char }: { char: Character }): React.ReactElement {
  const navigate = useStore((s) => s.navigate)

  return (
    <div
      onClick={() => char.AccountID && navigate('view-player', String(char.AccountID))}
      className={`flex items-center gap-3 px-4 py-3 bg-menu-surface transition-colors
        ${char.AccountID ? 'cursor-pointer hover:bg-primary/8' : ''}`}
    >
      <div className={`w-2 h-2 shrink-0 ${char.Online ? 'bg-menu-success' : 'bg-white/20'}`} />

      <div className="flex-1 min-w-0">
        <div className="font-semibold text-[0.92rem] text-[#e2e2e2] truncate">
          {char.First} {char.Last}
        </div>
        {char.Identifier && (
          <div className="font-mono text-[0.7rem] text-white/30 truncate mt-0.5">{char.Identifier}</div>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="font-mono text-[0.68rem] bg-primary/12 border border-primary/20 text-[#FF8C42] px-1.5 py-px">
          #{char.SID}
        </span>
        {char.Online ? (
          <span className="font-mono text-[0.67rem] text-menu-success-lt">online</span>
        ) : (
          <span className="font-mono text-[0.67rem] text-white/25">offline</span>
        )}
      </div>

      {char.AccountID && <ChevronRight size={11} className="text-white/18 shrink-0" />}
    </div>
  )
}

export default function CharactersScreen(): React.ReactElement {
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const [results, setResults] = useState<Character[]>([])
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(1)

  useEffect(() => {
    doSearch(1)
  }, [])

  const doSearch = async (p: number) => {
    setLoading(true)
    setHasSearched(true)
    try {
      const res = await sendNui<SearchResult>('GetAllPlayersByCharacter', { term: search, page: p })
      setResults(Array.isArray(res?.players) ? res.players : [])
      setPages(Math.ceil((res?.pages ?? 0) / PER_PAGE))
    } catch {
      setResults([])
    }
    setLoading(false)
  }

  const handleSearch = () => { setPage(1); doSearch(1) }
  const handlePage = (p: number) => { setPage(p); doSearch(p) }

  return (
    <div className="flex flex-col h-full p-5 gap-3.5 box-border">
      <div className="flex gap-2.5 shrink-0">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch() }}
            placeholder="Search by character name or state ID…"
            className="w-full h-9 pl-3 pr-8 bg-menu-surface-lt border border-white/10 text-[0.88rem] text-white/80 placeholder:text-white/25 focus:border-primary/50 transition-colors"
          />
          <button
            onClick={handleSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-primary transition-colors"
          >
            <Search size={13} />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between shrink-0">
        <span className="font-display font-extrabold text-[1rem] uppercase tracking-[0.06em] text-white/85">Find Characters</span>
        {hasSearched && (
          <span className="font-mono text-[0.75rem] text-white/30">
            {results.length} result{results.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {loading ? (
        <Loader text="Searching" />
      ) : !hasSearched ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-2.5 text-white/18">
          <Search size={28} className="opacity-25" />
          <span className="text-[0.85rem]">Enter a name or state ID to search</span>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 pr-1">
            {results.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2.5 h-full text-center">
                <UserX size={32} className="text-white/30" />
                <span className="font-mono text-[0.75rem] text-white/20 uppercase tracking-[0.08em]">No characters found</span>
              </div>
            ) : (
              results.map((c, i) => <CharacterCard key={`${c.SID}-${i}`} char={c} />)
            )}
          </div>
          <Pagination page={page} pages={pages} onChange={handlePage} />
        </>
      )}
    </div>
  )
}
