import { useEffect, useMemo, useState } from 'react'
import { Box, Package } from 'lucide-react'
import { sendNui } from '../nui.ts'
import { useStore } from '../store.ts'
import Loader from '../components/Loader.tsx'
import SearchInput from '../components/SearchInput.tsx'
import DropdownSelect from '../components/DropdownSelect.tsx'
import Modal from '../components/Modal.tsx'

interface RawItem {
  name?: string; Name?: string
  label?: string; Label?: string
  type?: string; Type?: string
  stack?: boolean
  weapon?: boolean
  ammo?: boolean
}

interface Item extends RawItem {
  name: string
  label: string
  isWeapon: boolean
  isAmmo: boolean
  domainCategory: string
  imageCandidates: string[]
}

const buildCandidates = (name: string): string[] => {
  const l = name.toLowerCase()
  return [
    `https://cfx-nui-st_inventory/web/images/${name}.png`,
    `https://st_inventory/web/images/${name}.png`,
    `https://cfx-nui-st_inventory/web/images/${l}.png`,
    `https://st_inventory/web/images/${l}.png`,
  ]
}

const getDomainCategory = (name: string, label: string, type: string, hasAmmo: boolean): string => {
  const n = name.toLowerCase()
  const lb = label.toLowerCase()
  const has = (terms: string[]) => terms.some((t) => n.includes(t) || lb.includes(t))
  if (hasAmmo) return 'ammo'
  if (has(['bandage','med','first aid','ifak','syringe','painkiller','health','defib','adrenaline','blood','medical'])) return 'medical'
  if (has(['heist','thermite','drill','c4','hacking','laptop','lockpick','electronic','vpn','usb','security card'])) return 'heist'
  if (type === 'food' || type === 'drink' || type === 'consumable' || has(['water','burger','sandwich','soda','cola','coffee','meal','snack','drink','food'])) return 'consumable'
  if (has(['scrap','metal','plastic','rubber','copper','aluminum','steel','cloth','wood','ore','material','component'])) return 'material'
  return 'other'
}

const normalize = (raw: RawItem): Item => {
  const name = String(raw.name || raw.Name || 'unknown')
  const label = String(raw.label || raw.Label || name)
  const type = String(raw.type || raw.Type || 'unknown').toLowerCase()
  const lower = name.toLowerCase()
  const isAmmo = Boolean(raw.ammo) || type === 'ammo' || lower.startsWith('ammo_') || lower.startsWith('ammo-')
  const isWeapon = !isAmmo && (Boolean(raw.weapon) || lower.startsWith('weapon_') || lower.includes('weapon'))
  return { ...raw, name, label, type, isWeapon, isAmmo, domainCategory: getDomainCategory(name, label, type, isAmmo), imageCandidates: buildCandidates(name) }
}

function ItemImage({ item }: { item: Item }): React.ReactElement {
  const [idx, setIdx] = useState(0)
  const src = item.imageCandidates[idx]
  if (!src) return (
    <div className="w-10 h-10 flex items-center justify-center bg-menu-surface-lt shrink-0">
      <Box size={16} className="text-white/20" />
    </div>
  )
  return (
    <img
      src={src}
      alt={item.label}
      className="w-10 h-10 object-contain bg-menu-surface-lt shrink-0"
      onError={() => setIdx((p) => (p < item.imageCandidates.length - 1 ? p + 1 : p))}
    />
  )
}

const CAT_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'weapons', label: 'Weapons' },
  { value: 'nonweapons', label: 'Non-Weapons' },
  { value: 'ammo', label: 'Ammo' },
  { value: 'utility', label: 'Utility' },
  { value: 'medical', label: 'Medical' },
  { value: 'heist', label: 'Heist' },
  { value: 'consumable', label: 'Consumables' },
  { value: 'material', label: 'Materials' },
]
const STACK_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'stackable', label: 'Stackable' },
  { value: 'nonstackable', label: 'Non-Stackable' },
]
const SORT_OPTIONS = [
  { value: 'label:asc', label: 'Label A–Z' },
  { value: 'label:desc', label: 'Label Z–A' },
  { value: 'name:asc', label: 'Name A–Z' },
  { value: 'name:desc', label: 'Name Z–A' },
  { value: 'type:asc', label: 'Type A–Z' },
  { value: 'type:desc', label: 'Type Z–A' },
]

export default function ItemsScreen(): React.ReactElement {
  const addToast = useStore((s) => s.addToast)
  const compact = useStore((s) => s.compact)
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<Item[]>([])
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('all')
  const [stack, setStack] = useState('all')
  const [sort, setSort] = useState('label:asc')

  const [giveOpen, setGiveOpen] = useState(false)
  const [selected, setSelected] = useState<Item | null>(null)
  const [targetSid, setTargetSid] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [ammo, setAmmo] = useState(0)

  const fetchItems = (showLoader = false) => {
    if (showLoader) setLoading(true)
    return sendNui<RawItem[]>('Admin:GetItemDatabase', {})
      .then((res) => setItems(Array.isArray(res) && res.length > 0 ? res.map(normalize) : []))
      .catch(() => {})
      .finally(() => { if (showLoader) setLoading(false) })
  }

  useEffect(() => {
    fetchItems(true)
  }, [])

  const filtered = useMemo(() => {
    const [sortKey, sortDir] = sort.split(':')
    return items.filter((item) => {
      const q = search.toLowerCase()
      if (q && !item.name.toLowerCase().includes(q) && !item.label.toLowerCase().includes(q)) return false
      if (cat === 'weapons' && !item.isWeapon) return false
      if (cat === 'nonweapons' && item.isWeapon) return false
      if (cat === 'ammo' && !item.isAmmo) return false
      if (cat === 'utility' && !['item','consumable','unknown'].includes(item.type ?? '')) return false
      if (['medical','heist','consumable','material'].includes(cat) && item.domainCategory !== cat) return false
      if (stack === 'stackable' && item.stack === false) return false
      if (stack === 'nonstackable' && item.stack !== false) return false
      return true
    }).sort((a, b) => {
      const key = (sortKey === 'name' ? 'name' : sortKey === 'type' ? 'type' : 'label') as keyof Item
      const result = String(a[key]).localeCompare(String(b[key]))
      return sortDir === 'asc' ? result : -result
    })
  }, [items, search, cat, stack, sort])

  const openGive = (item: Item) => {
    setSelected(item); setTargetSid(''); setQuantity(1); setAmmo(item.isWeapon ? 30 : 0); setGiveOpen(true)
  }

  const onGive = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selected?.name) return
    try {
      const res = await sendNui<{ success: boolean; message?: string }>('Admin:GiveItem', {
        itemName: selected.name,
        targetSid: targetSid ? Number(targetSid) : undefined,
        quantity: Number(quantity || 1),
        ammo: selected.isWeapon ? Number(ammo || 0) : 0,
      })
      if (res?.success) { addToast('success', res.message || 'Item given'); setGiveOpen(false); fetchItems() }
      else addToast('error', res?.message || 'Unable to give item')
    } catch { addToast('error', 'Failed to send give request') }
  }

  return (
    <div className={`flex flex-col h-full gap-3.5 box-border ${compact ? 'p-3' : 'p-5'}`}>
      <div className="flex gap-2.5 shrink-0 flex-wrap">
        <DropdownSelect value={cat} onChange={setCat} options={CAT_OPTIONS} className={compact ? 'flex-1 min-w-[100px]' : 'w-36'} />
        <DropdownSelect value={stack} onChange={setStack} options={STACK_OPTIONS} className={compact ? 'flex-1 min-w-[100px]' : 'w-36'} />
        <DropdownSelect value={sort} onChange={setSort} options={SORT_OPTIONS} className={compact ? 'flex-1 min-w-[100px]' : 'w-36'} />
        <SearchInput value={search} onChange={setSearch} placeholder="Search…" className="flex-1 min-w-[100px]" />
      </div>

      <div className="flex items-center justify-between shrink-0">
        <span className={`font-display font-extrabold uppercase tracking-[0.06em] text-white/85 ${compact ? 'text-[0.85rem]' : 'text-[1rem]'}`}>Item Database</span>
        <span className="font-mono text-[0.75rem] text-white/30">{filtered.length} item{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {loading ? <Loader text="Loading Item Database" /> : (
        <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 pr-1">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2.5 h-full text-center">
              <Package size={32} className="text-white/30" />
              <span className="font-mono text-[0.75rem] text-white/20 uppercase tracking-[0.08em]">No items found</span>
            </div>
          ) : (
            filtered.map((item) => (
              <div key={item.name} className={`flex items-center bg-menu-surface hover:bg-primary/8 transition-colors ${compact ? 'gap-2.5 px-2.5 py-2' : 'gap-3.5 px-4 py-2.5'}`}>
                <ItemImage item={item} />
                <div className="flex-1 min-w-0">
                  <div className={`font-semibold text-[#e2e2e2] truncate ${compact ? 'text-[0.82rem]' : 'text-[0.9rem]'}`}>{item.label}</div>
                  <div className="font-mono text-[0.7rem] text-white/30 mt-0.5 truncate">{item.name}</div>
                </div>
                {!compact && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="font-mono text-[0.67rem] bg-white/8 text-white/40 px-1.5 py-px">{item.type || 'unknown'}</span>
                    {item.isWeapon && <span className="font-mono text-[0.67rem] bg-primary/10 border border-primary/20 text-[#FF8C42] px-1.5 py-px">weapon</span>}
                    {item.isAmmo && <span className="font-mono text-[0.67rem] bg-primary/10 border border-primary/20 text-[#FF8C42] px-1.5 py-px">ammo</span>}
                    <span className="font-mono text-[0.67rem] bg-white/6 text-white/25 px-1.5 py-px">{item.stack === false ? 'no-stack' : 'stack'}</span>
                  </div>
                )}
                <button
                  onClick={() => openGive(item)}
                  className={`shrink-0 border border-primary/30 bg-primary/8 text-[#FF8C42] font-semibold hover:bg-primary/18 hover:border-primary/50 hover:text-white transition-colors ${compact ? 'px-2.5 py-0.5 text-[0.72rem]' : 'px-3.5 py-1 text-[0.78rem]'}`}
                >
                  Give
                </button>
              </div>
            ))
          )}
        </div>
      )}

      <Modal open={giveOpen} title={selected ? `Give ${selected.label}` : 'Give Item'} onSubmit={onGive} submitLang="Give Item" onClose={() => setGiveOpen(false)}>
        <input
          type="text"
          placeholder="Target State ID (blank = self)"
          value={targetSid}
          onChange={(e) => setTargetSid(e.target.value)}
          className="w-full h-9 px-3 bg-menu-surface-lt border border-white/10 text-[0.88rem] text-white/80 placeholder:text-white/25 focus:border-primary/50 transition-colors"
        />
        <input
          type="number"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value) || 1)}
          className="w-full h-9 px-3 bg-menu-surface-lt border border-white/10 text-[0.88rem] text-white/80 focus:border-primary/50 transition-colors"
        />
        {selected?.isWeapon && (
          <input
            type="number"
            placeholder="Ammo"
            value={ammo}
            onChange={(e) => setAmmo(Number(e.target.value) || 0)}
            className="w-full h-9 px-3 bg-menu-surface-lt border border-white/10 text-[0.88rem] text-white/80 focus:border-primary/50 transition-colors"
          />
        )}
      </Modal>
    </div>
  )
}
