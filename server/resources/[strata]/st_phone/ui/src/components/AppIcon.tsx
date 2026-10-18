import React from 'react'
import { getAppIcon } from '../appIcons'
import type { PhoneApp } from '../store'

interface AppIconProps {
  app: PhoneApp
  size?: 'normal' | 'dock'
  onClick?: () => void
  onContextMenu?: (e: React.MouseEvent) => void
}

export default function AppIcon({ app, size = 'normal', onClick, onContextMenu }: AppIconProps): React.ReactElement {
  const Icon = getAppIcon(app.name)
  const iconSize = size === 'dock' ? 18 : 20
  const dim = size === 'dock' ? 44 : 48

  return (
    <button
      onClick={onClick}
      onContextMenu={onContextMenu}
      className="flex flex-col items-center gap-1 group"
    >
      <div
        className="relative flex items-center justify-center overflow-hidden group-active:scale-95 transition-transform"
        style={{
          width: `${dim}px`,
          height: `${dim}px`,
          borderRadius: '13px',
          background: `linear-gradient(160deg, ${app.color}48 0%, ${app.color}25 100%), rgba(18,18,22,0.72)`,
          border: `1px solid ${app.color}45`,
          boxShadow: '0 4px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.09)',
        }}
      >
        {/* Gloss highlight */}
        <div
          className="absolute inset-x-0 top-0 h-1/2 pointer-events-none"
          style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 100%)' }}
        />
        <Icon size={iconSize} color="rgba(255,255,255,0.88)" />
        {(app.unread ?? 0) > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] flex items-center justify-center bg-primary text-white font-mono text-[0.46rem] rounded-full px-0.5 z-10 leading-none">
            {app.unread}
          </span>
        )}
      </div>
      {size === 'normal' && (
        <span className="font-medium text-[0.58rem] text-white/55 group-hover:text-white/85 transition-colors tracking-[0.04em] uppercase max-w-[56px] truncate text-center leading-tight select-none">
          {app.label}
        </span>
      )}
    </button>
  )
}
