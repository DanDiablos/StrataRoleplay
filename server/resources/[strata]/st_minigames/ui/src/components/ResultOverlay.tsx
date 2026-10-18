import type { GameStatus } from '../store'

interface Props {
  status: GameStatus
  successLabel?: string
  failLabel?: string
}

export default function ResultOverlay({
  status,
  successLabel = 'Success',
  failLabel = 'Failed',
}: Props): React.ReactElement | null {
  if (status !== 'finished' && status !== 'failed') return null
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-menu-bg/85 animate-fade-in">
      <div
        className={`px-6 py-2.5 border font-display font-bold uppercase tracking-[0.18em] text-[0.85rem] ${
          status === 'finished'
            ? 'bg-menu-success/20 border-menu-success/45 text-menu-success-lt'
            : 'bg-menu-error/25 border-menu-error-lt/45 text-red-300'
        }`}
      >
        {status === 'finished' ? successLabel : failLabel}
      </div>
    </div>
  )
}
