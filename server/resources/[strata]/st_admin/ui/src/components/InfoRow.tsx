interface Props {
  label: string
  value?: React.ReactNode
  mono?: boolean
  muted?: boolean
  onClick?: () => void
}

export default function InfoRow({ label, value, mono, muted, onClick }: Props): React.ReactElement {
  return (
    <div
      onClick={onClick}
      className={`flex items-baseline gap-3 px-4 py-[9px] border-b border-white/10 last:border-0
        ${onClick ? 'cursor-pointer hover:bg-primary/5' : ''}`}
    >
      <span className="font-display font-bold text-[0.68rem] uppercase tracking-[0.1em] text-white/35 w-[130px] shrink-0">
        {label}
      </span>
      <span className={`break-all ${
        mono ? 'font-mono text-[0.78rem] text-white/60'
        : muted ? 'text-[0.85rem] text-white/25 italic'
        : 'font-medium text-[0.88rem] text-[#e2e2e2]'
      }`}>
        {value ?? <span className="text-[0.85rem] text-white/25 italic">—</span>}
      </span>
    </div>
  )
}
