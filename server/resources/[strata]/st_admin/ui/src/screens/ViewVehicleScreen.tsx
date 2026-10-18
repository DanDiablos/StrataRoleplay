import { useEffect, useState } from 'react'
import { Car, RefreshCw, ChevronLeft, Wrench, Info } from 'lucide-react'
import { sendNui, copyToClipboard } from '../nui.ts'
import { useStore } from '../store.ts'
import Loader from '../components/Loader.tsx'
import InfoRow from '../components/InfoRow.tsx'
import SectionCard from '../components/SectionCard.tsx'
import ActionBtn from '../components/ActionBtn.tsx'

const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const r = (v: number | undefined, d = 3): number | undefined => v === undefined ? undefined : Math.round(v * 10 ** d) / 10 ** d

interface DamagedParts {
  Axle?: number; Radiator?: number; Transmission?: number; FuelInjectors?: number
  Brakes?: number; Clutch?: number; Electronics?: number
}

interface VehicleData {
  Entity: number; EntityModel?: string; Make?: string; Model?: string; Plate: string; VIN: string
  Owned?: boolean; Owner?: { Id: string | number }; Value?: number; Fuel?: number
  Heading?: number; Coords?: { x: number; y: number; z: number }
  Damage?: { Engine?: number; Body?: number }; DamagedParts?: DamagedParts
}

function DamageBar({ label, health }: { label: string; health?: number }): React.ReactElement {
  const pct = Math.min(100, Math.max(0, ((health ?? 1000) / 1000) * 100))
  const color = pct > 70 ? '#52984a' : pct > 35 ? '#f09348' : '#a13434'
  return (
    <div className="flex items-center gap-3 px-4 py-2 border-b border-white/10 last:border-0">
      <span className="font-display font-bold text-[0.68rem] uppercase tracking-[0.1em] text-white/35 w-[130px] shrink-0">{label}</span>
      <div className="flex-1 h-1 bg-white/7 overflow-hidden">
        <div className="h-full transition-all duration-300" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="font-mono text-[0.72rem] text-white/40 w-9 text-right shrink-0">{Math.round(pct)}%</span>
    </div>
  )
}

export default function ViewVehicleScreen(): React.ReactElement {
  const viewId          = useStore((s) => s.viewId)
  const navigate        = useStore((s) => s.navigate)
  const addToast        = useStore((s) => s.addToast)
  const permissionLevel = useStore((s) => s.permissionLevel)

  const [loading, setLoading] = useState(false)
  const [vehicle, setVehicle] = useState<VehicleData | null>(null)

  const fetch = async (forced?: boolean) => {
    if (!forced && vehicle) return
    setLoading(true)
    try {
      const res = await sendNui<VehicleData>('GetVehicle', parseInt(viewId ?? '0'))
      if (res) setVehicle(res)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { fetch(true) }, [viewId])

  const onAction = async (action: string) => {
    try {
      const res = await sendNui<{ success: boolean; message?: string }>('ActionVehicle', {
        model: vehicle?.EntityModel, target: vehicle?.Entity, action,
      })
      if (res?.success) addToast('success', res.message ?? 'Done')
      else addToast('error', res?.message ?? 'Error')
    } catch { addToast('error', 'Error') }
  }

  if (loading || !vehicle) {
    return <div className="relative h-full"><Loader static text="Loading" /></div>
  }

  return (
    <div className="h-full overflow-y-auto p-5 flex flex-col gap-5">

      {/* Header */}
      <div className="flex items-center gap-4 p-4 bg-menu-surface border-l-[3px] border-l-primary shrink-0">
        <button onClick={() => navigate('vehicles')} className="text-white/30 hover:text-white/70 transition-colors shrink-0">
          <ChevronLeft size={16} />
        </button>
        <div className="w-[52px] h-[52px] flex items-center justify-center bg-primary/12 border border-primary/25 text-primary text-[1.3rem] shrink-0">
          <Car size={22} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-display font-extrabold text-[1.15rem] tracking-[0.03em] text-white leading-tight">
            {vehicle.Make ?? 'Unknown'} {vehicle.Model ?? 'Unknown'}
          </div>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="font-mono text-[0.72rem] font-bold tracking-[0.08em] bg-white/10 text-[#e2e2e2] px-2 py-px">{vehicle.Plate ?? '—'}</span>
            {vehicle.Owned && vehicle.Owner?.Id && (
              <span className="font-mono text-[0.68rem] bg-primary/10 border border-primary/20 text-[#FF8C42] px-1.5 py-px">ID {vehicle.Owner.Id}</span>
            )}
            <span className="font-mono text-[0.68rem] bg-white/8 text-white/45 px-1.5 py-px">Fuel {Math.round(vehicle.Fuel ?? 0)}%</span>
            {(vehicle.Value ?? 0) > 0 && (
              <span className="font-mono text-[0.68rem] bg-white/8 text-white/45 px-1.5 py-px">{fmt.format(vehicle.Value!)}</span>
            )}
          </div>
        </div>
        <button onClick={() => fetch(true)} className="w-[34px] h-[34px] flex items-center justify-center border border-white/10 bg-white/3 text-white/50 hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-colors shrink-0">
          <RefreshCw size={13} />
        </button>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2 p-3.5 bg-menu-surface shrink-0">
        <ActionBtn onClick={() => onAction('repair')}>Quick Repair</ActionBtn>
        {permissionLevel >= 90 && <ActionBtn onClick={() => onAction('repair_full')}>Full Repair</ActionBtn>}
        {permissionLevel >= 90 && <ActionBtn onClick={() => onAction('repair_engine')}>Engine Repair</ActionBtn>}
        {permissionLevel >= 90 && <ActionBtn onClick={() => onAction('fuel')}>Fuel</ActionBtn>}
        {permissionLevel >= 75 && <ActionBtn onClick={() => onAction('sitinside')}>Sit Inside</ActionBtn>}
        {permissionLevel >= 90 && <ActionBtn onClick={() => onAction('locks')}>Toggle Locks</ActionBtn>}
        {permissionLevel >= 90 && <ActionBtn variant="danger" onClick={() => onAction('stall')}>Stall</ActionBtn>}
        {permissionLevel >= 90 && <ActionBtn variant="danger" onClick={() => onAction('explode')}>Explode</ActionBtn>}
        {permissionLevel >= 75 && <ActionBtn variant="danger" onClick={() => onAction('delete')}>Delete</ActionBtn>}
      </div>

      {/* Info columns */}
      <div className="grid grid-cols-2 gap-4">
        <SectionCard title="Vehicle Info" icon={Info}>
          <InfoRow label="Make / Model" value={`${vehicle.Make ?? 'Unknown'} ${vehicle.Model ?? 'Unknown'}`} />
          <InfoRow label="Plate" value={vehicle.Plate} mono />
          <InfoRow label="VIN" value={vehicle.VIN} mono />
          <InfoRow label="Owner" value={vehicle.Owned ? String(vehicle.Owner?.Id ?? 'Unknown') : 'Unowned'} />
          <InfoRow label="Value" value={(vehicle.Value ?? 0) > 0 ? fmt.format(vehicle.Value!) : undefined} />
          <InfoRow label="Entity Model" value={vehicle.EntityModel} mono onClick={() => { copyToClipboard(vehicle.EntityModel ?? ''); addToast('success', 'Copied model hash') }} />
          {vehicle.Coords && (
            <InfoRow
              label="Coordinates"
              value={`${r(vehicle.Coords.x)}, ${r(vehicle.Coords.y)}, ${r(vehicle.Coords.z)}`}
              mono
              onClick={() => { copyToClipboard(`vector3(${r(vehicle.Coords!.x)}, ${r(vehicle.Coords!.y)}, ${r(vehicle.Coords!.z)})`); addToast('success', 'Copied coordinates') }}
            />
          )}
          <InfoRow label="Heading" value={vehicle.Heading != null ? `${r(vehicle.Heading, 1)}°` : undefined} mono />
        </SectionCard>

        <SectionCard title="Condition" icon={Wrench}>
          <DamageBar label="Engine" health={vehicle.Damage?.Engine} />
          <DamageBar label="Body" health={vehicle.Damage?.Body} />
          {vehicle.DamagedParts && <>
            <DamageBar label="Axle" health={vehicle.DamagedParts.Axle} />
            <DamageBar label="Radiator" health={vehicle.DamagedParts.Radiator} />
            <DamageBar label="Transmission" health={vehicle.DamagedParts.Transmission} />
            <DamageBar label="Fuel Injectors" health={vehicle.DamagedParts.FuelInjectors} />
            <DamageBar label="Brakes" health={vehicle.DamagedParts.Brakes} />
            <DamageBar label="Clutch" health={vehicle.DamagedParts.Clutch} />
            <DamageBar label="Electronics" health={vehicle.DamagedParts.Electronics} />
          </>}
        </SectionCard>
      </div>
    </div>
  )
}
