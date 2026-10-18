import { useEffect, useMemo, useState } from 'react'
import { Car, ChevronRight } from 'lucide-react'
import { sendNui } from '../nui.ts'
import { useStore } from '../store.ts'
import Loader from '../components/Loader.tsx'
import SearchInput from '../components/SearchInput.tsx'
import Pagination from '../components/Pagination.tsx'

interface Vehicle {
  Entity: number
  Make?: string
  Model?: string
  Plate: string
  VIN: string
  OwnerId?: string | number
  Owner?: { Id: string | number }
  Owned?: boolean
}

const PER_PAGE = 32

function VehicleCard({ vehicle }: { vehicle: Vehicle }): React.ReactElement {
  const navigate = useStore((s) => s.navigate)

  return (
    <div
      onClick={() => navigate('view-vehicle', String(vehicle.Entity))}
      className="flex items-center gap-3 px-4 py-3 bg-menu-surface cursor-pointer hover:bg-primary/8 transition-colors"
    >
      <div className="w-9 h-9 flex items-center justify-center bg-primary/12 border border-primary/25 text-primary shrink-0">
        <Car size={16} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-semibold text-[0.92rem] text-[#e2e2e2] truncate">
          {vehicle.Make ?? 'Unknown'} {vehicle.Model ?? 'Unknown'}
        </div>
        <div className="font-mono text-[0.72rem] text-white/35 mt-0.5">
          {vehicle.VIN}
        </div>
      </div>

      <div className="flex flex-col items-end gap-1 shrink-0">
        <span className="font-mono text-[0.72rem] font-bold tracking-[0.08em] bg-white/10 text-[#e2e2e2] px-2 py-px">
          {vehicle.Plate}
        </span>
        {(vehicle.OwnerId || vehicle.Owner?.Id) && (
          <span className="font-mono text-[0.67rem] text-[#FF8C42]">
            ID {vehicle.OwnerId ?? vehicle.Owner?.Id}
          </span>
        )}
      </div>

      <ChevronRight size={11} className="text-white/18 shrink-0" />
    </div>
  )
}

export default function VehiclesScreen(): React.ReactElement {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<Vehicle[]>([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    setLoading(true)
    sendNui<Vehicle[]>('GetVehicleList', {})
      .then((res) => setResults(Array.isArray(res) ? res : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return results.filter((v) =>
      !q
      || `${v.Make ?? ''} ${v.Model ?? ''}`.toLowerCase().includes(q)
      || v.Plate.toUpperCase().includes(search.toUpperCase())
      || v.VIN.toUpperCase() === search.toUpperCase()
      || String(v.OwnerId ?? '').includes(q)
    )
  }, [results, search])

  const pages = Math.ceil(filtered.length / PER_PAGE)
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  return (
    <div className="flex flex-col h-full p-5 gap-3.5 box-border">
      <div className="flex gap-2.5 shrink-0">
        <SearchInput
          value={search}
          onChange={(v) => { setSearch(v); setPage(1) }}
          placeholder="Search by make, model, plate, VIN, or owner ID…"
        />
      </div>

      <div className="flex items-center justify-between shrink-0">
        <span className="font-display font-extrabold text-[1rem] uppercase tracking-[0.06em] text-white/85">Active Owned Vehicles</span>
        <span className="font-mono text-[0.75rem] text-white/30">
          {filtered.length} vehicle{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {loading ? (
        <Loader text="Loading" />
      ) : (
        <>
          <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 pr-1">
            {paged.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2.5 h-full text-center">
                <Car size={32} className="text-white/30" />
                <span className="font-mono text-[0.75rem] text-white/20 uppercase tracking-[0.08em]">No vehicles found</span>
              </div>
            ) : (
              paged.map((v) => <VehicleCard key={v.Entity} vehicle={v} />)
            )}
          </div>
          <Pagination page={page} pages={pages} onChange={setPage} />
        </>
      )}
    </div>
  )
}
