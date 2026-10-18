import type { ReactNode } from 'react'
import type { GameStatus } from '../store'

interface GameCardProps {
  title: string
  successTitle?: string
  failTitle?: string
  readout?: string
  status: GameStatus
  exiting?: boolean
  className?: string
  style?: React.CSSProperties
  children: ReactNode
}

export default function GameCard({
  title,
  successTitle,
  failTitle,
  readout,
  status,
  exiting,
  className = '',
  style,
  children,
}: GameCardProps): React.ReactElement {
  const accent =
    status === 'failed'
      ? 'border-l-menu-error-lt'
      : status === 'finished'
      ? 'border-l-menu-success'
      : 'border-l-primary'

  const headerColor =
    status === 'failed'
      ? 'text-red-300'
      : status === 'finished'
      ? 'text-menu-success-lt'
      : 'text-white/70'

  const label =
    status === 'finished'
      ? successTitle ?? title
      : status === 'failed'
      ? failTitle ?? title
      : title

  return (
    <div className={`${exiting ? 'animate-fade-out' : 'animate-fade-in'} ${className}`} style={style}>
      <div
        className={`border-l-[3px] ${accent} bg-menu-surface border-y border-r border-white/10`}
        style={{ boxShadow: '0 12px 40px rgba(0,0,0,0.75)' }}
      >
        <div className="flex items-center justify-between px-3 py-2 bg-menu-surface-lt border-b border-white/[0.06]">
          <span className={`font-display font-bold uppercase tracking-[0.14em] text-[0.7rem] ${headerColor}`}>
            {label}
          </span>
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.1em] text-white/30 min-w-[40px] text-right">
            {readout ?? ''}
          </span>
        </div>
        {children}
      </div>
    </div>
  )
}
