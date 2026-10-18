import React from 'react'

interface NavbarProps {
  subLabel: string
  center?: React.ReactNode
  right?: React.ReactNode
}

export default function Navbar({ subLabel, center, right }: NavbarProps): React.ReactElement {
  return (
    <div className="fixed top-0 left-0 right-0 h-[52px] z-[100] flex items-stretch bg-[rgba(10,10,10,0.92)] border-b border-white/[0.07] px-8">
      <div className="flex items-center pr-6 border-r border-white/[0.07] shrink-0 select-none">
        <span
          className="font-display font-black text-[1.05rem]"
          style={{ background: 'linear-gradient(90deg,#FF5C3A,#FF8C42)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
        >
          STRATA
        </span>
        <span className="font-mono text-[0.85rem] text-white/[0.12] mx-[0.28rem]">/</span>
        <span className="font-mono text-[0.68rem] text-white/30 tracking-[0.02em]">{subLabel}</span>
      </div>

      <div className="flex-1 flex items-stretch justify-center overflow-hidden">
        {center}
      </div>

      {right && (
        <div className="flex items-center gap-2.5 pl-6 border-l border-white/[0.07] shrink-0">
          {right}
        </div>
      )}
    </div>
  )
}
