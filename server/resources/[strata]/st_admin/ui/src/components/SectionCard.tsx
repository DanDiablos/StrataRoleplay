import React from 'react'
import { LucideIcon } from 'lucide-react'

interface Props {
  title: string
  icon: LucideIcon
  children: React.ReactNode
  className?: string
}

export default function SectionCard({ title, icon: Icon, children, className = '' }: Props): React.ReactElement {
  return (
    <div className={`bg-menu-surface border-l-[3px] border-l-primary overflow-hidden flex flex-col ${className}`}>
      <div className="flex items-center gap-2 px-4 py-3 bg-menu-surface-lt shrink-0">
        <Icon size={12} className="text-primary" />
        <span className="font-display font-bold text-[0.72rem] uppercase tracking-[0.12em] text-white/60">
          {title}
        </span>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  )
}
