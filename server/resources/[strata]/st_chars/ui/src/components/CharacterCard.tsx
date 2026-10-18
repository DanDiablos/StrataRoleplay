import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useStore } from '../store'
import { sendNui } from '../nui'
import DeleteDialog from './DeleteDialog'
import type { Character, Job } from '../store'

function formatDate(ts: number | undefined | null): string {
  if (!ts || +ts === -1) return 'Never played'
  const d = new Date(+ts)
  return d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }) +
    ' ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

function getJobLabel(jobs: Job[] | undefined): string {
  if (!jobs?.length) return 'Unemployed'
  if (jobs.length === 1) {
    const j = jobs[0]
    return j.Workplace ? `${j.Workplace.Name} — ${j.Grade.Name}` : `${j.Name} — ${j.Grade.Name}`
  }
  return `${jobs.length} Jobs`
}

interface CharacterCardProps {
  character: Character
}

export default function CharacterCard({ character }: CharacterCardProps): React.ReactElement {
  const selected = useStore(s => s.selected)
  const dispatch  = useStore(s => s.dispatch)
  const [showDelete, setShowDelete] = useState(false)

  const fullName = `${(character.First ?? '').trim()} ${(character.Last ?? '').trim()}`.trim()
  const isActive = selected?.ID === character?.ID
  const cashLabel = character.Cash != null ? `$${Number(character.Cash).toLocaleString()}` : null

  const onSelect = () => {
    dispatch('LOADING_SHOW', { message: 'Getting Spawn Points' })
    dispatch('SELECT_CHARACTER', { character })
    sendNui('SelectCharacter', { id: character.ID })
  }

  const onDeleteConfirm = () => {
    dispatch('LOADING_SHOW', { message: 'Deleting Character' })
    sendNui('DeleteCharacter', { id: character.ID })
    setShowDelete(false)
  }

  return (
    <div className="relative shrink-0 group">
      <div
        onDoubleClick={onSelect}
        onContextMenu={e => { e.preventDefault(); setShowDelete(true) }}
        className="w-[220px] p-[14px_16px] flex flex-col gap-1 bg-[rgba(26,26,26,0.92)] border border-white/[0.07] cursor-pointer select-none transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30"
        style={isActive ? { borderColor: 'rgba(255,92,58,0.6)', boxShadow: '0 0 0 1px rgba(255,92,58,0.12),0 8px 32px rgba(0,0,0,0.5)' } : {}}
      >
        <div className="font-mono text-[0.88rem] text-primary tracking-[0.04em] mb-0.5">#{character.SID}</div>
        <div className="font-display font-bold text-[1rem] text-white tracking-[-0.02em] leading-[1.2]">{fullName}</div>
        <div className="font-mono text-[0.88rem] text-white/80 mt-1 leading-[1.4]">{getJobLabel(character.Jobs)}</div>
        <div className="flex items-center justify-between mt-1 gap-2">
          <span className="font-mono text-[0.82rem] text-white/60">{formatDate(character.LastPlayed)}</span>
          {cashLabel && <span className="font-mono text-[0.82rem] text-white/45 whitespace-nowrap">{cashLabel}</span>}
        </div>
      </div>

      <button
        type="button"
        onClick={e => { e.stopPropagation(); setShowDelete(true) }}
        className="absolute top-2 right-2 w-[26px] h-[26px] flex items-center justify-center bg-[rgba(20,20,20,0.9)] border border-white/[0.08] text-white/30 text-[0.72rem] opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-150 hover:text-primary hover:border-primary/35"
      >
        <Trash2 size={12} />
      </button>

      {showDelete && (
        <DeleteDialog
          name={fullName}
          onConfirm={onDeleteConfirm}
          onCancel={() => setShowDelete(false)}
        />
      )}
    </div>
  )
}
