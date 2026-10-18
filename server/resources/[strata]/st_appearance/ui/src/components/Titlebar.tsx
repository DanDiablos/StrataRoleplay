import { X } from 'lucide-react'

interface Props {
  label: string
  onClose: () => void
}

export default function Titlebar({ label, onClose }: Props): React.ReactElement {
  return (
    <div className="h-[52px] flex items-center px-5 shrink-0 border-b border-white/[0.07]">
      <div className="flex items-center gap-3">
        <span
          className="font-display font-black tracking-[0.1em] text-[1.1rem]"
          style={{
            background: 'linear-gradient(90deg, #FF5C3A, #FF8C42)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          STRATA
        </span>
        <span className="font-mono text-[0.68rem] text-white/30">{label}</span>
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-2">
        <span className="font-mono text-[0.65rem] text-white/15 uppercase tracking-[0.5px]">ESC</span>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center border border-white/10 bg-white/[0.03] text-white/30 hover:text-white/70 hover:border-white/25 transition-colors"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  )
}
