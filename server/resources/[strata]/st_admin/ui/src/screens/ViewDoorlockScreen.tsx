import { useEffect, useState } from 'react'
import { DoorClosed, DoorOpen, Plus, Save, Trash2, MapPin, ChevronLeft, Shield, SlidersHorizontal, Info, MapPinned } from 'lucide-react'
import { sendNui } from '../nui.ts'
import { useStore } from '../store.ts'
import Loader from '../components/Loader.tsx'
import Modal from '../components/Modal.tsx'
import SectionCard from '../components/SectionCard.tsx'
import ActionBtn from '../components/ActionBtn.tsx'

interface Coords { x: number; y: number; z: number }
interface Door { coords: Coords; heading: number; model: string }
interface DoorlockData {
  id?: number; name: string; state: number
  coords: Coords; heading: number; model: string; maxDistance: number; doorRate: number
  auto: boolean; lockpick: boolean; hideUi: boolean; holdOpen: boolean; onduty: boolean
  passcode: string | null; groups: Record<string, number>
  lockSound: string; unlockSound: string; workplace: string; permissions: string
  doors?: Door[]
}

const DEFAULT_DL: DoorlockData = {
  name: '', state: 1, coords: { x: 0, y: 0, z: 0 }, heading: 0,
  model: '', maxDistance: 2.5, doorRate: 1.0,
  auto: false, lockpick: false, hideUi: false, holdOpen: false, onduty: false,
  passcode: null, groups: {}, lockSound: '', unlockSound: '', workplace: '', permissions: '',
}

function parseGroups(input: string): Record<string, number> {
  if (!input?.trim()) return {}
  try { return JSON.parse(input) } catch {
    const g: Record<string, number> = {}
    input.split(/[,;\n]/).map((p) => p.trim()).filter(Boolean).forEach((pair) => {
      if (pair.includes('=')) {
        const [k, v] = pair.split('=').map((s) => s.trim())
        const key = k.replace(/['"]/g, '')
        const val = parseInt(v)
        if (key && !isNaN(val)) g[key] = val
      }
    })
    return g
  }
}

function formatGroups(groups: Record<string, number>): string {
  if (!groups || Object.keys(groups).length === 0) return ''
  return Object.entries(groups).map(([k, v]) => `${k} = ${v}`).join(', ')
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }): React.ReactElement {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer select-none">
      <div
        onClick={() => onChange(!checked)}
        className={`w-8 h-4 relative transition-colors ${checked ? 'bg-primary/40' : 'bg-white/15'}`}
      >
        <div className={`absolute top-0.5 w-3 h-3 transition-all ${checked ? 'left-4 bg-primary' : 'left-0.5 bg-white/40'}`} />
      </div>
      <span className="text-[0.85rem] text-white/60">{label}</span>
    </label>
  )
}

function Field({ label, value, onChange, type = 'text', readOnly = false, placeholder = '' }: {
  label: string; value: string | number; onChange?: (v: string) => void; type?: string; readOnly?: boolean; placeholder?: string
}): React.ReactElement {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[0.68rem] text-white/30 uppercase tracking-[0.5px] font-medium">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        readOnly={readOnly}
        placeholder={placeholder}
        className="h-9 px-3 bg-menu-surface-lt border border-white/10 text-[0.85rem] text-white/80 placeholder:text-white/20 focus:border-primary/50 transition-colors read-only:opacity-50"
      />
    </div>
  )
}

export default function ViewDoorlockScreen(): React.ReactElement {
  const viewId   = useStore((s) => s.viewId)
  const navigate = useStore((s) => s.navigate)
  const addToast = useStore((s) => s.addToast)
  const compact  = useStore((s) => s.compact)
  const isNew = viewId === 'new'

  const [loading, setLoading] = useState(!isNew)
  const [dl, setDl] = useState<DoorlockData>(DEFAULT_DL)
  const [groupsInput, setGroupsInput] = useState('')
  const [deleteOpen, setDeleteOpen] = useState(false)

  useEffect(() => {
    const handler = (e: MessageEvent<{ type?: string; data?: { model?: string; coords?: Coords; heading?: number; doors?: Door[] } }>) => {
      if (!e.isTrusted || e.data.type !== 'DOORLOCK_DOORS_SELECTED') return
      const d = e.data.data
      if (!d) return
      setDl((prev) => ({
        ...prev,
        model: d.model || prev.model,
        coords: d.coords || prev.coords,
        heading: d.heading !== undefined ? d.heading : prev.heading,
        doors: d.doors || prev.doors,
      }))
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  useEffect(() => {
    if (!isNew) {
      setLoading(true)
      sendNui<DoorlockData>('GetDoorLockById', { id: parseInt(viewId ?? '0') })
        .then((res) => { if (res) { setDl(res); setGroupsInput(formatGroups(res.groups || {})) } })
        .catch(() => {})
        .finally(() => setLoading(false))
    }
  }, [viewId])

  const upd = (field: keyof DoorlockData, value: unknown) => setDl((prev) => ({ ...prev, [field]: value }))
  const updCoord = (axis: 'x' | 'y' | 'z', value: string) =>
    setDl((prev) => ({ ...prev, coords: { ...prev.coords, [axis]: parseFloat(value) || 0 } }))

  const handleSave = async () => {
    try {
      const endpoint = isNew ? 'CreateDoorLock' : 'UpdateDoorLock'
      const payload = isNew ? dl : { ...dl, id: parseInt(viewId ?? '0') }
      const res = await sendNui<{ success: boolean }>( endpoint, payload as Record<string, unknown>)
      if (res?.success) navigate('doorlocks')
      else addToast('error', 'Failed to save doorlock')
    } catch { addToast('error', 'Error saving') }
  }

  const handleDelete = async () => {
    try {
      const res = await sendNui<{ success: boolean }>('DeleteDoorLock', { id: parseInt(viewId ?? '0') })
      if (res?.success) navigate('doorlocks')
    } catch { addToast('error', 'Error deleting') }
  }

  const handleTeleport = () => sendNui('TeleportToDoorLock', { id: parseInt(viewId ?? '0') }).catch(() => {})
  const handleStartDoor = (isDouble: boolean) => sendNui('StartAddDoorLock', { isDouble }).catch(() => {})
  const handleToggle = async () => {
    const newState = dl.state === 1 ? 0 : 1
    try {
      const res = await sendNui<{ success: boolean }>('ToggleDoorLockState', { id: parseInt(viewId ?? '0'), state: newState })
      if (res?.success) setDl((prev) => ({ ...prev, state: newState }))
    } catch {}
  }

  if (loading) return <div className="relative h-full"><Loader text="Loading Doorlock" /></div>

  const isLocked = dl.state === 1

  return (
    <div className={`h-full overflow-y-auto flex flex-col gap-4 ${compact ? 'p-3' : 'p-5'}`}>

      {/* Header */}
      <div className={`flex items-center bg-menu-surface border-l-[3px] border-l-primary shrink-0 ${compact ? 'gap-2.5 p-3' : 'gap-4 p-4'}`}>
        <button onClick={() => navigate('doorlocks')} className="text-white/30 hover:text-white/70 transition-colors shrink-0">
          <ChevronLeft size={16} />
        </button>
        <div className={`${compact ? 'w-10 h-10' : 'w-[52px] h-[52px]'} flex items-center justify-center border shrink-0 ${
          isNew ? 'bg-primary/12 border-primary/25 text-primary'
          : isLocked ? 'bg-menu-error/35 border-menu-error-lt/40 text-red-300'
          : 'bg-menu-success/15 border-menu-success/30 text-menu-success-lt'
        }`}>
          {isNew ? <Plus size={compact ? 16 : 20} /> : isLocked ? <DoorClosed size={compact ? 16 : 20} /> : <DoorOpen size={compact ? 16 : 20} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className={`font-display font-extrabold tracking-[0.03em] text-white leading-tight truncate ${compact ? 'text-[0.95rem]' : 'text-[1.15rem]'}`}>
            {isNew ? 'New Doorlock' : dl.name || `Doorlock #${viewId}`}
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {!isNew && <span className="font-mono text-[0.68rem] bg-white/8 text-white/45 px-1.5 py-px">#{viewId}</span>}
            {!isNew && (
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
            )}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-1.5 shrink-0">
        {!isNew && (
          <ActionBtn onClick={handleTeleport}><MapPin size={12} className="inline mr-1.5" />Teleport</ActionBtn>
        )}
        <ActionBtn variant="primary" onClick={handleSave}>
          <Save size={12} className="inline mr-1.5" />{isNew ? 'Create' : 'Save'}
        </ActionBtn>
        {!isNew && <ActionBtn variant="danger" onClick={() => setDeleteOpen(true)}><Trash2 size={12} className="inline mr-1.5" />Delete</ActionBtn>}
        <ActionBtn onClick={() => navigate('doorlocks')}>Cancel</ActionBtn>
      </div>

      <div className={`grid gap-4 ${compact ? 'grid-cols-1' : 'grid-cols-2'}`}>

        {/* Basic info */}
        <SectionCard title="Basic Info" icon={Info}>
          <div className={`p-3 grid gap-3 ${compact ? 'grid-cols-1' : 'grid-cols-2'}`}>
            <div className={compact ? '' : 'col-span-2'}>
              <Field label="Name" value={dl.name} onChange={(v) => upd('name', v)} placeholder="Doorlock name" />
            </div>
            <Field label="Max Distance" value={dl.maxDistance} type="number" onChange={(v) => upd('maxDistance', parseFloat(v))} />
            <Field label="Door Rate" value={dl.doorRate || 1.0} type="number" onChange={(v) => upd('doorRate', parseFloat(v))} />
            {!dl.doors && (
              <div className={compact ? '' : 'col-span-2'}>
                <Field label="Model Hash" value={dl.model || ''} onChange={(v) => upd('model', v)} />
              </div>
            )}
            <Field label="Lock Sound" value={dl.lockSound || ''} onChange={(v) => upd('lockSound', v)} />
            <Field label="Unlock Sound" value={dl.unlockSound || ''} onChange={(v) => upd('unlockSound', v)} />
          </div>
        </SectionCard>

        {/* Coordinates */}
        <SectionCard title={dl.doors ? 'Door Coordinates' : 'Coordinates'} icon={MapPinned}>
          <div className="p-3 flex flex-col gap-3">
            {isNew && (
              <div className={`flex gap-2 ${compact ? 'flex-col' : ''}`}>
                <ActionBtn variant="primary" className="flex-1" onClick={() => handleStartDoor(false)}>Select Single Door</ActionBtn>
                <ActionBtn variant="primary" className="flex-1" onClick={() => handleStartDoor(true)}>Select Double Door</ActionBtn>
              </div>
            )}
            {dl.doors?.length === 2 ? (
              <>
                <p className="text-[0.7rem] text-[#FF8C42] font-display font-bold uppercase tracking-[0.1em]">Door 1</p>
                <div className={`grid gap-2 ${compact ? 'grid-cols-2' : 'grid-cols-4'}`}>
                  <Field label="X" value={(dl.doors[0]?.coords?.x || 0).toFixed(2)} readOnly />
                  <Field label="Y" value={(dl.doors[0]?.coords?.y || 0).toFixed(2)} readOnly />
                  <Field label="Z" value={(dl.doors[0]?.coords?.z || 0).toFixed(2)} readOnly />
                  <Field label="Heading" value={dl.doors[0]?.heading || 0} readOnly />
                </div>
                <Field label="Model Hash" value={dl.doors[0]?.model || ''} readOnly />
                <p className="text-[0.7rem] text-[#FF8C42] font-display font-bold uppercase tracking-[0.1em]">Door 2</p>
                <div className={`grid gap-2 ${compact ? 'grid-cols-2' : 'grid-cols-4'}`}>
                  <Field label="X" value={(dl.doors[1]?.coords?.x || 0).toFixed(2)} readOnly />
                  <Field label="Y" value={(dl.doors[1]?.coords?.y || 0).toFixed(2)} readOnly />
                  <Field label="Z" value={(dl.doors[1]?.coords?.z || 0).toFixed(2)} readOnly />
                  <Field label="Heading" value={dl.doors[1]?.heading || 0} readOnly />
                </div>
                <Field label="Model Hash" value={dl.doors[1]?.model || ''} readOnly />
              </>
            ) : (
              <div className={`grid gap-2 ${compact ? 'grid-cols-2' : 'grid-cols-4'}`}>
                <Field label="X" type="number" value={parseFloat(String(dl.coords?.x || 0)).toFixed(2)} onChange={(v) => updCoord('x', v)} />
                <Field label="Y" type="number" value={parseFloat(String(dl.coords?.y || 0)).toFixed(2)} onChange={(v) => updCoord('y', v)} />
                <Field label="Z" type="number" value={parseFloat(String(dl.coords?.z || 0)).toFixed(2)} onChange={(v) => updCoord('z', v)} />
                <Field label="Heading" type="number" value={dl.heading || 0} onChange={(v) => upd('heading', parseFloat(v))} />
              </div>
            )}
          </div>
        </SectionCard>

        {/* Access control */}
        <SectionCard title="Access Control" icon={Shield}>
          <div className="p-3 flex flex-col gap-3">
            <div>
              <label className="text-[0.68rem] text-white/30 uppercase tracking-[0.5px] font-medium block mb-1">
                Groups (e.g. police = 0, ems = 1)
              </label>
              <textarea
                value={groupsInput}
                onChange={(e) => { setGroupsInput(e.target.value); upd('groups', parseGroups(e.target.value)) }}
                rows={3}
                placeholder="Job name = minimum grade. Leave empty for public access."
                className="w-full px-3 py-2 bg-menu-surface-lt border border-white/10 text-[0.85rem] text-white/80 placeholder:text-white/20 focus:border-primary/50 transition-colors resize-none"
              />
            </div>
            <div className={`grid gap-3 ${compact ? 'grid-cols-1' : 'grid-cols-2'}`}>
              <Field label="Workplace" value={dl.workplace || ''} onChange={(v) => upd('workplace', v)} placeholder="e.g. lspd" />
              <Field label="Permissions" value={dl.permissions || ''} onChange={(v) => upd('permissions', v)} placeholder="Permission string" />
            </div>
            {dl.passcode !== null && dl.passcode !== undefined && (
              <Field label="Passcode" value={dl.passcode || ''} onChange={(v) => upd('passcode', v)} placeholder="Numeric code" />
            )}
          </div>
        </SectionCard>

        {/* Options */}
        <SectionCard title="Options" icon={SlidersHorizontal}>
          <div className={`p-3 flex flex-wrap ${compact ? 'gap-x-4 gap-y-2.5' : 'gap-x-5 gap-y-3'}`}>
            <Toggle label="Auto Door" checked={dl.auto} onChange={(v) => upd('auto', v)} />
            <Toggle label="Lockpickable" checked={dl.lockpick} onChange={(v) => upd('lockpick', v)} />
            <Toggle label="Hide UI" checked={dl.hideUi} onChange={(v) => upd('hideUi', v)} />
            <Toggle label="Hold Open" checked={dl.holdOpen} onChange={(v) => upd('holdOpen', v)} />
            <Toggle label="Require On Duty" checked={dl.onduty} onChange={(v) => upd('onduty', v)} />
            <Toggle
              label="Passcode Protected"
              checked={dl.passcode !== null && dl.passcode !== undefined}
              onChange={(v) => upd('passcode', v ? '' : null)}
            />
          </div>
        </SectionCard>
      </div>

      <Modal open={deleteOpen} title="Delete Doorlock" onAccept={handleDelete} onClose={() => setDeleteOpen(false)} acceptLang="Delete">
        Are you sure you want to delete this doorlock? This action cannot be undone.
      </Modal>
    </div>
  )
}
