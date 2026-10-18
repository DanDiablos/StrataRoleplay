import { useState } from 'react'
import { ChevronLeft, ChevronRight, Lock, Unlock } from 'lucide-react'

interface Props {
  label: string
  value: number
  options: number[]
  onChange: (value: number) => void
  disabled?: boolean
  noneLabel?: string
  secondary?: boolean
  locked?: boolean
  onToggleLock?: () => void
}

export default function StepControl({ label, value, options, onChange, disabled, noneLabel = 'None', secondary = false, locked = false, onToggleLock }: Props): React.ReactElement {
  const [draft, setDraft] = useState<string | null>(null)

  const idx     = options.indexOf(value)
  const safeIdx = idx === -1 ? 0 : idx
  const total   = options.length

  const prev = () => { if (safeIdx > 0) onChange(options[safeIdx - 1]) }
  const next = () => { if (safeIdx < total - 1) onChange(options[safeIdx + 1]) }

  const display = options[safeIdx] === -1 ? noneLabel : String(options[safeIdx])
  const maxVal  = options[total - 1]

  const commitDraft = () => {
    if (draft === null) return
    const n = parseInt(draft, 10)
    if (!isNaN(n)) {
      const valid = options.filter((o) => o >= 0)
      if (valid.length > 0) {
        const clamped = Math.max(valid[0], Math.min(valid[valid.length - 1], n))
        const closest = valid.reduce((p, c) => (Math.abs(c - clamped) < Math.abs(p - clamped) ? c : p))
        onChange(closest)
      }
    }
    setDraft(null)
  }

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') e.currentTarget.blur()
    if (e.key === 'Escape') setDraft(null)
  }

  const btnBase = 'w-6 h-6 flex items-center justify-center border border-white/10 bg-white/[0.03] text-white/40 hover:text-white/70 disabled:opacity-20 transition-colors'

  return (
    <div className={`flex items-center border-b border-white/[0.06] last:border-0 ${secondary ? 'px-4 py-1.5 bg-black/20' : 'px-4 py-2.5'} ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
      {onToggleLock && (
        <button
          onClick={onToggleLock}
          className={`w-5 h-5 flex items-center justify-center shrink-0 -ml-1 mr-1 transition-colors ${locked ? 'text-primary/60' : 'text-white/15 hover:text-white/30'}`}
        >
          {locked ? <Lock size={10} /> : <Unlock size={10} />}
        </button>
      )}
      <span className={`flex-1 font-mono uppercase tracking-[0.05em] ${secondary ? 'text-[0.62rem] text-white/35 pl-3' : 'text-[0.68rem] text-white/70'}`}>
        {label}
      </span>
      <div className="flex items-center gap-1.5">
        <button onClick={prev} disabled={safeIdx === 0} className={btnBase}>
          <ChevronLeft size={11} />
        </button>

        {draft !== null ? (
          <div className="flex items-center gap-1 font-mono text-[0.72rem]">
            <input
              type="number"
              value={draft}
              autoFocus
              min={0}
              max={maxVal}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commitDraft}
              onKeyDown={handleKey}
              className="w-9 text-center text-white/90 bg-menu-surface-lt border border-primary/50 outline-none h-6"
            />
            <span className="text-white/35">/ {maxVal}</span>
          </div>
        ) : (
          <span
            className="w-[72px] text-center font-mono text-[0.72rem] text-white/80 cursor-text select-none"
            title="Click to type"
            onClick={() => { if (!disabled && total > 0) setDraft(options[safeIdx] === -1 ? '0' : String(options[safeIdx])) }}
          >
            {total === 0 ? '—' : `${display} / ${maxVal}`}
          </span>
        )}

        <button onClick={next} disabled={safeIdx === total - 1} className={btnBase}>
          <ChevronRight size={11} />
        </button>
      </div>
    </div>
  )
}
