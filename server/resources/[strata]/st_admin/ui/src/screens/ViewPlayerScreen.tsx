import { FormEvent, useCallback, useEffect, useState } from 'react'
import { RefreshCw, Link, MapPin, ChevronLeft, UserX, User, Users } from 'lucide-react'
import { sendNui, copyToClipboard } from '../nui.ts'
import { useStore } from '../store.ts'
import Loader from '../components/Loader.tsx'
import Modal from '../components/Modal.tsx'
import InfoRow from '../components/InfoRow.tsx'
import SectionCard from '../components/SectionCard.tsx'
import ActionBtn from '../components/ActionBtn.tsx'
import DropdownSelect from '../components/DropdownSelect.tsx'

const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const fmtDate = (ts: number): string => new Date(ts * 1000).toLocaleString()
const fmtDOB = (dob: string): string => new Date(dob).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
const r = (v: number, d = 3): number => Math.round(v * 10 ** d) / 10 ** d

interface JobGrade { id: string; name: string; level?: number; workplaceId?: string; workplaceName?: string }
interface Job { id: string; name: string; grades: JobGrade[] }

interface CharacterData {
  First: string; Last: string; SID: number; DOB?: string; Phone?: string
  Coords?: { x: number; y: number; z: number; h: number }
}
interface CharacterDetail {
  SID: number; First: string; Last: string; DOB?: string; Phone?: string
  Cash?: number; Jobs?: Array<{ Name: string; Grade: { Name: string } }>; LastPlayed?: number; Deleted?: boolean
}
interface VehicleInfo { Make?: string; Model?: string; Plate: string; Entity: number }
interface PlayerData {
  Source: number; AccountID: number; Name: string; Avatar?: string; GameName?: string
  Discord?: string; Mention?: string; Identifier?: string; StaffGroup?: string; Level?: number
  Character?: CharacterData; Characters?: CharacterDetail[]; Vehicle?: VehicleInfo
  Disconnected?: boolean; DisconnectedTime?: number; Reconnected?: number; Reason?: string
}

const BAN_LENGTHS = [
  { value: '1', label: '1 Day',    level: 75 },
  { value: '2', label: '2 Days',   level: 75 },
  { value: '3', label: '3 Days',   level: 75 },
  { value: '7', label: '7 Days',   level: 75 },
  { value: '14', label: '14 Days', level: 99 },
  { value: '30', label: '30 Days', level: 99 },
  { value: '-1', label: 'Permanent', level: 99 },
]

function timeAgo(ts: number): string {
  const diff = Math.floor(Date.now() / 1000) - ts
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function ViewPlayerScreen(): React.ReactElement {
  const viewId         = useStore((s) => s.viewId)
  const navigate       = useStore((s) => s.navigate)
  const addToast       = useStore((s) => s.addToast)
  const user           = useStore((s) => s.user)
  const permissionLevel = useStore((s) => s.permissionLevel)
  const compact        = useStore((s) => s.compact)

  const [loading, setLoading] = useState(false)
  const [player, setPlayer] = useState<PlayerData | null>(null)

  const [kickOpen, setKickOpen] = useState(false)
  const [kickReason, setKickReason] = useState('')
  const [banOpen, setBanOpen] = useState(false)
  const [banReason, setBanReason] = useState('')
  const [banLength, setBanLength] = useState('1')
  const [giveVehOpen, setGiveVehOpen] = useState(false)
  const [vehModel, setVehModel] = useState('')
  const [giveJobOpen, setGiveJobOpen] = useState(false)
  const [jobOptions, setJobOptions] = useState<Job[]>([])
  const [pendingJobId, setPendingJobId] = useState('')
  const [pendingGradeKey, setPendingGradeKey] = useState('')

  const fetchPlayer = useCallback(async (forced?: boolean) => {
    if (!forced && player && String(player.Source) === viewId) return
    setLoading(true)
    try {
      const res = await sendNui<PlayerData>('GetPlayer', parseInt(viewId ?? '0'))
      if (res) setPlayer(res)
    } catch {}
    setLoading(false)
  }, [viewId, player])

  useEffect(() => { fetchPlayer(true) }, [viewId])

  const onAction = async (action: string, extra: Record<string, unknown> = {}) => {
    try {
      const res = await sendNui<{ success: boolean; message?: string }>('ActionPlayer', { targetSource: player?.Source, action, ...extra })
      if (res?.success) addToast('success', res.message ?? 'Done')
      else addToast('error', res?.message ?? 'Error')
    } catch { addToast('error', 'Error') }
  }

  const onKick = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setKickOpen(false); setLoading(true)
    try {
      const res = await sendNui<{ success: boolean; message?: string }>('KickPlayer', { targetSource: player?.Source, reason: kickReason })
      if (res?.success) { addToast('success', `Kicked ${player?.Name ?? 'Player'}`); navigate('players') }
      else addToast('error', res?.message ?? 'Failed to kick')
    } catch { addToast('error', 'Error') }
    setLoading(false)
  }

  const onBan = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setBanOpen(false); setLoading(true)
    try {
      const res = await sendNui<{ success: boolean; message?: string }>('BanPlayer', { targetSource: player?.Source, reason: banReason, length: parseInt(banLength) })
      if (res?.success) addToast('success', `Banned ${player?.Name ?? 'Player'}`)
      else addToast('error', res?.message ?? 'Failed to ban')
    } catch { addToast('error', 'Error') }
    setLoading(false)
  }

  const onGiveVehicle = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setGiveVehOpen(false)
    if (!vehModel.trim()) { addToast('error', 'Vehicle model is required'); return }
    await onAction('giveownedvehicle', { vehicleModel: vehModel.trim().toLowerCase() })
  }

  const openGiveJob = async () => {
    setPendingJobId(''); setPendingGradeKey('')
    try {
      const res = await sendNui<Job[]>('Admin:GetJobDatabase', {})
      setJobOptions(Array.isArray(res) ? res : [])
    } catch { setJobOptions([]); addToast('error', 'Unable to load jobs'); return }
    setGiveJobOpen(true)
  }

  const onGiveJob = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!pendingJobId || !pendingGradeKey) { addToast('error', 'Select both job and grade'); return }
    const [gradeId, workplaceId] = pendingGradeKey.split('::')
    setGiveJobOpen(false); setLoading(true)
    try {
      const res = await sendNui<{ success: boolean; message?: string }>('Admin:GiveJob', {
        targetSource: player?.Source, jobId: pendingJobId, gradeId,
        workplaceId: workplaceId && workplaceId !== 'none' ? workplaceId : false,
      })
      if (res?.success) { addToast('success', res.message ?? 'Job updated'); fetchPlayer(true) }
      else addToast('error', res?.message ?? 'Failed to set job')
    } catch { addToast('error', 'Error') }
    setLoading(false)
  }

  const copyCoords = () => {
    if (!player?.Character?.Coords) return
    const { x, y, z, h } = player.Character.Coords
    copyToClipboard(`vector3(${r(x)}, ${r(y)}, ${r(z)}), ${r(h, 2)}`)
    addToast('success', 'Copied coordinates')
  }

  if (loading || !player) {
    return (
      <div className="relative h-full">
        <Loader static text="Loading" />
      </div>
    )
  }

  const isSelf = user?.Source === player.Source
  const canAct = Boolean(player.Character) && !player.Disconnected
  const outranks = permissionLevel >= (player.Level ?? 0)
  const initials = player.Name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()

  const selectedJob = jobOptions.find((j) => j.id === pendingJobId)
  const allowedBanLengths = BAN_LENGTHS.filter((l) => permissionLevel >= l.level)

  return (
    <div className={`h-full overflow-y-auto flex flex-col gap-4 ${compact ? 'p-3' : 'p-5'}`}>

      {/* Header */}
      <div className={`flex items-center bg-menu-surface border-l-[3px] border-l-primary shrink-0 ${compact ? 'gap-2.5 p-3' : 'gap-4 p-4'}`}>
        <button onClick={() => navigate('players')} className="text-white/30 hover:text-white/70 transition-colors shrink-0">
          <ChevronLeft size={16} />
        </button>

        <div className="relative shrink-0">
          {player.Avatar
            ? <img src={player.Avatar} className={`${compact ? 'w-10 h-10' : 'w-14 h-14'} object-cover`} alt="" />
            : <div className={`${compact ? 'w-10 h-10 text-[0.9rem]' : 'w-14 h-14 text-[1.2rem]'} flex items-center justify-center bg-primary/15 border-2 border-primary/25 text-primary font-display font-extrabold`}>{initials}</div>
          }
          {player.Character && <span className="absolute bottom-[1px] right-[1px] w-[11px] h-[11px] bg-menu-success border-2 border-menu-bg" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className={`font-display font-extrabold tracking-[0.03em] text-white leading-tight ${compact ? 'text-[0.95rem]' : 'text-[1.15rem]'}`}>{player.Name}</div>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <span className="font-mono text-[0.68rem] bg-white/8 text-white/50 px-1.5 py-px">SRC {player.Source}</span>
            <span className="font-mono text-[0.68rem] bg-white/8 text-white/50 px-1.5 py-px">ID {player.AccountID}</span>
            {player.StaffGroup && <span className="font-mono text-[0.68rem] bg-primary/12 border border-primary/25 text-[#FF8C42] px-1.5 py-px">{player.StaffGroup}</span>}
            {!compact && player.Character && (
              <span className="font-mono text-[0.68rem] bg-white/8 text-white/50 px-1.5 py-px">
                {player.Character.First} {player.Character.Last} #{player.Character.SID}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => fetchPlayer(true)} title="Refresh" className="w-[34px] h-[34px] flex items-center justify-center border border-white/10 bg-white/3 text-white/50 hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-colors">
            <RefreshCw size={13} />
          </button>
          {!compact && (
            <button onClick={() => { copyToClipboard(`https://strataroleplay.com/admin/players/${encodeURIComponent(player.Identifier ?? '')}`); addToast('success', 'Copied web URL') }} title="Copy web URL" className="w-[34px] h-[34px] flex items-center justify-center border border-white/10 bg-white/3 text-white/50 hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-colors">
              <Link size={13} />
            </button>
          )}
          {!compact && permissionLevel >= 90 && (
            <button onClick={() => !isSelf && onAction('marker')} disabled={isSelf} title="GPS Marker" className="w-[34px] h-[34px] flex items-center justify-center border border-white/10 bg-white/3 text-white/50 hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-colors disabled:opacity-30 disabled:pointer-events-none">
              <MapPin size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Disconnected banner */}
      {player.Disconnected && (
        <div
          onClick={() => player.Reconnected && navigate('view-player', String(player.Reconnected))}
          className={`flex items-center gap-3 px-4 py-3 bg-menu-error/35 border border-menu-error-lt/40 text-red-200/85 text-[0.85rem] ${player.Reconnected ? 'cursor-pointer' : ''}`}
        >
          <span>
            Player disconnected {player.DisconnectedTime ? timeAgo(player.DisconnectedTime) : ''}.
            {player.Reconnected ? ' They have since reconnected — click to view.' : ''}
            {player.Reason ? ` Reason: ${player.Reason}` : ''}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className={`flex flex-wrap gap-1.5 bg-menu-surface shrink-0 ${compact ? 'p-2.5' : 'p-3.5'}`}>
        <ActionBtn onClick={() => onAction('goto')} disabled={!canAct || isSelf}>Goto</ActionBtn>
        <ActionBtn onClick={() => onAction('bring')} disabled={!canAct || isSelf || !outranks}>Bring</ActionBtn>
        <ActionBtn onClick={() => onAction('heal')} disabled={!canAct || (isSelf && permissionLevel < 75)}>Heal</ActionBtn>
        <ActionBtn onClick={() => onAction('attach')} disabled={!canAct || isSelf || !outranks}>Spectate</ActionBtn>
        <ActionBtn onClick={() => onAction('givekeys')} disabled={!canAct}>Give Vehicle Keys</ActionBtn>
        <ActionBtn onClick={() => onAction('repairvehicle')} disabled={!canAct || !player.Vehicle}>Repair Vehicle</ActionBtn>
        <ActionBtn onClick={() => onAction('clothingmenu')} disabled={!canAct}>Clothing Menu</ActionBtn>
        <ActionBtn onClick={() => { setVehModel(''); setGiveVehOpen(true) }} disabled={!canAct}>Give Owned Vehicle</ActionBtn>
        {permissionLevel >= 90 && (
          <ActionBtn onClick={openGiveJob} disabled={!canAct || !outranks}>Give Job</ActionBtn>
        )}
        <ActionBtn variant="danger" onClick={() => { setKickReason(''); setKickOpen(true) }} disabled={isSelf || !outranks}>Kick</ActionBtn>
        {permissionLevel >= 75 && (
          <ActionBtn variant="danger" onClick={() => { setBanLength('1'); setBanReason(''); setBanOpen(true) }} disabled={isSelf || !outranks}>Ban</ActionBtn>
        )}
      </div>

      {/* Info columns */}
      <div className={`grid gap-4 ${compact ? 'grid-cols-1' : 'grid-cols-2'}`}>
        <SectionCard title="Account" icon={User}>
          <InfoRow label="Player Name" value={`${player.Name}${isSelf ? ' (You)' : ''}`} />
          <InfoRow label="Account ID" value={player.AccountID} mono />
          <InfoRow label="Server Source" value={player.Source} mono />
          <InfoRow label="Game Name" value={player.GameName} />
          <InfoRow label="Discord ID" value={player.Discord} mono />
          <InfoRow label="Discord @" value={player.Mention} />
          <InfoRow label="Identifier" value={player.Identifier} mono />
          {player.StaffGroup && <InfoRow label="Staff Group" value={player.StaffGroup} />}
        </SectionCard>

        <SectionCard title="Active Character" icon={User}>
          {player.Character ? (
            <>
              <InfoRow label="Name" value={`${player.Character.First} ${player.Character.Last}`} />
              <InfoRow label="State ID" value={`#${player.Character.SID}`} mono />
              <InfoRow label="Date of Birth" value={player.Character.DOB ? fmtDOB(player.Character.DOB) : undefined} />
              {permissionLevel >= 90 && <InfoRow label="Phone" value={player.Character.Phone} mono />}
              {player.Vehicle && (
                <InfoRow
                  label="In Vehicle"
                  value={`${player.Vehicle.Make ?? ''} ${player.Vehicle.Model ?? ''} — ${player.Vehicle.Plate}`}
                  onClick={() => permissionLevel >= 75 ? navigate('view-vehicle', String(player.Vehicle!.Entity)) : undefined}
                />
              )}
              {permissionLevel >= 90 && player.Character.Coords && (
                <InfoRow
                  label="Coordinates"
                  value={`${r(player.Character.Coords.x)}, ${r(player.Character.Coords.y)}, ${r(player.Character.Coords.z)} — ${r(player.Character.Coords.h, 2)}°`}
                  mono
                  onClick={copyCoords}
                />
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 gap-2 text-white/20">
              <UserX size={28} className="opacity-25" />
              <span className="text-[0.85rem]">No character selected</span>
            </div>
          )}
        </SectionCard>
      </div>

      {/* All characters */}
      <SectionCard title={player.Character ? 'Other Characters' : 'Characters'} icon={Users}>
        {player.Characters && player.Characters.length > 0 ? (
          [...player.Characters]
            .sort((a, b) => Number(a.Deleted) - Number(b.Deleted))
            .map((c) => compact ? (
              <div key={c.SID} className={`flex flex-col gap-1 px-3 py-2.5 border-b border-white/10 last:border-0 ${c.Deleted ? 'opacity-35' : ''}`}>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[0.68rem] bg-primary/10 border border-primary/20 text-[#FF8C42] px-1.5 py-px shrink-0">#{c.SID}</span>
                  <span className="font-semibold text-[0.85rem] text-[#e2e2e2] truncate">{c.First} {c.Last}</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[0.75rem] text-white/50 truncate">
                    {c.Jobs?.length ? c.Jobs.map((j) => `${j.Name} — ${j.Grade?.Name}`).join(', ') : 'Unemployed'}
                  </span>
                  {c.Cash !== undefined && <span className="font-mono text-[0.68rem] text-white/35">{fmt.format(c.Cash)}</span>}
                  {c.LastPlayed && <span className="font-mono text-[0.68rem] text-white/35">{timeAgo(c.LastPlayed)}</span>}
                </div>
              </div>
            ) : (
              <div key={c.SID} className={`flex items-center gap-3 px-4 py-2.5 border-b border-white/10 last:border-0 ${c.Deleted ? 'opacity-35' : ''}`}>
                <span className="font-mono text-[0.68rem] bg-primary/10 border border-primary/20 text-[#FF8C42] px-1.5 py-px shrink-0">#{c.SID}</span>
                <span className="font-semibold text-[0.88rem] text-[#e2e2e2] w-44 shrink-0 truncate">{c.First} {c.Last}</span>
                <span className="text-[0.82rem] text-white/60 flex-1 truncate">
                  {c.Jobs?.length ? c.Jobs.map((j) => `${j.Name} — ${j.Grade?.Name}`).join(', ') : 'Unemployed'}
                </span>
                {c.Cash !== undefined && <span className="font-mono text-[0.72rem] text-white/40 shrink-0">{fmt.format(c.Cash)} cash</span>}
                {c.Phone && <span className="font-mono text-[0.72rem] text-white/40 shrink-0">{c.Phone}</span>}
                {c.LastPlayed && <span className="font-mono text-[0.72rem] text-white/40 shrink-0">{timeAgo(c.LastPlayed)}</span>}
              </div>
            ))
        ) : (
          <div className="flex items-center justify-center py-6 text-white/20 text-[0.85rem]">
            No characters on this account
          </div>
        )}
      </SectionCard>

      {/* Modals */}
      <Modal open={kickOpen} title={`Kick ${player.Name}`} onSubmit={onKick} submitLang="Kick" onClose={() => setKickOpen(false)}>
        <textarea
          name="kickReason"
          value={kickReason}
          onChange={(e) => setKickReason(e.target.value)}
          placeholder="Kick reason…"
          required
          rows={3}
          className="w-full px-3 py-2 bg-menu-surface-lt border border-white/10 text-[0.88rem] text-white/80 placeholder:text-white/25 focus:border-primary/50 transition-colors resize-none"
        />
      </Modal>

      <Modal open={banOpen} title={`Ban ${player.Name}`} onSubmit={onBan} submitLang="Ban" onClose={() => setBanOpen(false)}>
        <DropdownSelect value={banLength} onChange={setBanLength} options={allowedBanLengths.map((l) => ({ value: l.value, label: l.label }))} label="Ban Length" />
        <textarea
          name="banReason"
          value={banReason}
          onChange={(e) => setBanReason(e.target.value)}
          placeholder="Ban reason…"
          required
          rows={3}
          className="w-full px-3 py-2 bg-menu-surface-lt border border-white/10 text-[0.88rem] text-white/80 placeholder:text-white/25 focus:border-primary/50 transition-colors resize-none"
        />
      </Modal>

      <Modal open={giveVehOpen} title={`Give Owned Vehicle to ${player.Name}`} onSubmit={onGiveVehicle} submitLang="Give" onClose={() => setGiveVehOpen(false)}>
        <input
          value={vehModel}
          onChange={(e) => setVehModel(e.target.value)}
          placeholder="Vehicle spawn code (e.g. comet2)"
          required
          className="w-full h-9 px-3 bg-menu-surface-lt border border-white/10 text-[0.88rem] text-white/80 placeholder:text-white/25 focus:border-primary/50 transition-colors"
        />
      </Modal>

      <Modal open={giveJobOpen} title={`Give Job to ${player.Name}`} onSubmit={onGiveJob} submitLang="Set Job" onClose={() => setGiveJobOpen(false)}>
        <DropdownSelect
          value={pendingJobId}
          onChange={(v) => { setPendingJobId(v); setPendingGradeKey('') }}
          options={jobOptions.map((j) => ({ value: j.id, label: j.name }))}
          label="Job"
        />
        <DropdownSelect
          value={pendingGradeKey}
          onChange={setPendingGradeKey}
          options={(selectedJob?.grades ?? []).map((g) => ({
            value: `${g.id}::${g.workplaceId || 'none'}`,
            label: `${g.name}${g.workplaceName ? ` (${g.workplaceName})` : ''} [L${g.level ?? 0}]`,
          }))}
          label="Grade"
          disabled={!pendingJobId}
        />
      </Modal>
    </div>
  )
}
