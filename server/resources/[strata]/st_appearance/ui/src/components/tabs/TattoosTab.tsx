import { useState, useRef, useEffect } from 'react'
import { ChevronDown, X, Plus } from 'lucide-react'
import { useStore } from '../../store'
import { sendNui } from '../../nui'
import SectionHeader from '../SectionHeader'
import type { TattooEntry } from '../../store'

const ZONES = [
  { id: 'ZONE_HEAD',      label: 'Head'      },
  { id: 'ZONE_TORSO',     label: 'Torso'     },
  { id: 'ZONE_LEFT_ARM',  label: 'Left Arm'  },
  { id: 'ZONE_RIGHT_ARM', label: 'Right Arm' },
  { id: 'ZONE_LEFT_LEG',  label: 'Left Leg'  },
  { id: 'ZONE_RIGHT_LEG', label: 'Right Leg' },
]

const ZONE_LABEL: Record<string, string> = Object.fromEntries(ZONES.map((z) => [z.id, z.label]))

/** Turn a GTA hash name like "MP_Airraces_Tattoo_003_M" into "Airraces Tattoo 003" */
function formatTattooName(tattoo: TattooEntry, gender: number): string {
  const hash = gender === 0 ? (tattoo.HashNameMale ?? '') : (tattoo.HashNameFemale ?? '')
  if (hash) {
    let clean = hash
      .replace(/^MP_/i, '')
      .replace(/_[MF]$/i, '')
      .replace(/^Bea_[MF]_/i, 'Beach ')
      .replace(/_/g, ' ')
      .trim()
    if (clean) return clean
  }
  // Fallback: try to clean the Name field (e.g. "TAT_AR_000" -> "AR 000")
  const name = tattoo.Name ?? ''
  if (name && !name.startsWith('TAT_')) return name
  return name.replace(/^TAT_/, '').replace(/_/g, ' ').trim() || '—'
}

export default function TattoosTab(): React.ReactElement | null {
  const ped          = useStore((s) => s.ped)
  const tattooData   = useStore((s) => s.tattooData)
  const gender       = useStore((s) => s.gender)
  const addTattoo    = useStore((s) => s.addTattoo)
  const removeTattoo = useStore((s) => s.removeTattoo)
  const setTattoo    = useStore((s) => s.setTattoo)

  const [zone,     setZone]     = useState('ZONE_TORSO')
  const [search,   setSearch]   = useState('')
  const [zoneOpen, setZoneOpen] = useState(false)
  const zoneRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (zoneRef.current && !zoneRef.current.contains(e.target as Node)) setZoneOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (!ped) return null

  const applied = ped.customization.tattoos

  // Group applied tattoos by zone, preserving original indices for removal
  const groupedApplied = ZONES.map((z) => ({
    ...z,
    items: applied
      .map((t, i) => ({ tattoo: t, index: i }))
      .filter(({ tattoo }) => tattoo.Zone === z.id),
  })).filter((g) => g.items.length > 0)

  const catalog = tattooData.filter((t) => {
    if (t.Zone !== zone) return false
    if (search.trim()) {
      const q = search.toLowerCase()
      const display = formatTattooName(t, gender).toLowerCase()
      return display.includes(q) || t.Name.toLowerCase().includes(q)
    }
    return true
  })

  const handleRemove = (i: number) => {
    removeTattoo(i)
    sendNui('RemovePedTattoo', { index: i })
  }

  const handleAdd = (tattoo: TattooEntry) => {
    const newIndex = applied.length
    addTattoo(zone)
    sendNui('AddPedTattoo', { type: zone })
    setTattoo(newIndex, tattoo)
    sendNui('SetPedTattoo', {
      index: newIndex,
      data: {
        Name:          tattoo.Name,
        Collection:    tattoo.Collection,
        HashNameMale:  tattoo.HashNameMale ?? '',
        HashNameFemale: tattoo.HashNameFemale ?? '',
        Zone:          tattoo.Zone,
      },
    })
  }

  return (
    <div className="pb-2">
      {/* Applied tattoos grouped by zone */}
      <SectionHeader title={`Applied (${applied.length})`} />
      {applied.length === 0 ? (
        <div className="px-4 py-4 font-mono text-[0.72rem] text-white/20 uppercase tracking-[0.08em] text-center">
          No tattoos applied
        </div>
      ) : (
        groupedApplied.map((group) => (
          <div key={group.id}>
            <div className="px-4 py-1.5 bg-black/20">
              <span className="font-display font-bold uppercase tracking-[0.1em] text-[0.6rem] text-white/30">
                {group.label}
              </span>
              <span className="font-mono text-[0.58rem] text-white/20 ml-1.5">{group.items.length}</span>
            </div>
            {group.items.map(({ tattoo, index }) => (
              <div key={index} className="flex items-center gap-3 px-4 py-2 border-b border-white/[0.06] last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[0.8rem] text-white/70 truncate">
                    {formatTattooName(tattoo, gender)}
                  </p>
                </div>
                <button
                  onClick={() => handleRemove(index)}
                  className="w-6 h-6 flex items-center justify-center border border-white/10 bg-white/[0.03] text-white/30 hover:text-red-400 hover:border-red-400/30 transition-colors shrink-0"
                >
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
        ))
      )}

      {/* Add tattoo section */}
      <SectionHeader title="Add Tattoo" />

      <div className="px-4 pt-3 pb-2" ref={zoneRef}>
        <div className="relative">
          <button
            onClick={() => setZoneOpen((o) => !o)}
            className="w-full h-9 px-3 bg-menu-surface-lt border border-white/10 flex items-center justify-between hover:border-white/20 transition-colors"
          >
            <span className="font-mono text-[0.75rem] text-white/70">{ZONE_LABEL[zone] ?? zone}</span>
            <ChevronDown size={14} className={`text-white/30 transition-transform ${zoneOpen ? 'rotate-180' : ''}`} />
          </button>
          {zoneOpen && (
            <div className="absolute top-full left-0 right-0 z-50 bg-menu-surface border border-white/10 border-t-0">
              {ZONES.map((z) => (
                <button
                  key={z.id}
                  onClick={() => { setZone(z.id); setZoneOpen(false) }}
                  className={`w-full px-3 py-2 text-left font-mono text-[0.75rem] transition-colors ${
                    z.id === zone ? 'text-primary bg-primary/8' : 'text-white/60 hover:bg-menu-surface-lt'
                  }`}
                >
                  {z.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="px-4 pb-2">
        <input
          type="text"
          placeholder="Search tattoos…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-9 px-3 bg-menu-surface-lt border border-white/10 text-[0.85rem] text-white/80 placeholder-white/25 focus:border-primary/40 transition-colors"
        />
      </div>

      <div className="mx-4 border border-white/[0.07] max-h-[220px] overflow-y-auto">
        {catalog.length === 0 ? (
          <div className="px-4 py-6 font-mono text-[0.72rem] text-white/20 uppercase tracking-[0.08em] text-center">
            No results
          </div>
        ) : (
          catalog.map((t, i) => (
            <button
              key={i}
              onClick={() => handleAdd(t)}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-left border-b border-white/[0.04] last:border-0 hover:bg-primary/8 transition-colors group"
            >
              <Plus size={11} className="text-white/20 group-hover:text-primary shrink-0 transition-colors" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[0.8rem] text-white/70 group-hover:text-white/90 truncate transition-colors">
                  {formatTattooName(t, gender)}
                </p>
                {t.Collection && (
                  <p className="font-mono text-[0.6rem] text-white/20 truncate">{t.Collection.replace(/_overlays$/, '').replace(/_/g, ' ')}</p>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
