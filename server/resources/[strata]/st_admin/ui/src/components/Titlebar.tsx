import { useState } from 'react'
import { X, Eye, Wind, Ghost, Hash, PanelRightOpen, PanelRightClose } from 'lucide-react'
import { useStore } from '../store.ts'
import { sendNui } from '../nui.ts'

export default function Titlebar(): React.ReactElement {
  const user = useStore((s) => s.user)
  const permissionName = useStore((s) => s.permissionName)
  const compact = useStore((s) => s.compact)
  const opacity = useStore((s) => s.opacity)
  const dispatch = useStore((s) => s.dispatch)

  const [noclip, setNoclip] = useState(false)
  const [invisible, setInvisible] = useState(false)
  const [playerIds, setPlayerIds] = useState(false)

  const toggleNoclip = () => {
    const next = !noclip
    setNoclip(next)
    sendNui('ToggleNoClip', { active: next })
  }

  const toggleInvisible = () => {
    const next = !invisible
    setInvisible(next)
    sendNui('ToggleInvisible', { active: next })
  }

  const togglePlayerIds = () => {
    const next = !playerIds
    setPlayerIds(next)
    sendNui('ToggleIDs', {})
  }

  const activeBtn = 'border-primary/40 bg-primary/10 text-primary'
  const idleBtn   = 'border-white/10 bg-white/3 text-white/30 hover:text-white/60 hover:border-white/20'
  const btn       = 'w-7 h-7 flex items-center justify-center border transition-colors'

  return (
    <div className={`h-[52px] flex items-center shrink-0 bg-[#0a0a0a] ${compact ? 'px-3' : 'px-5'}`}>
      {/* Brand */}
      <div className="flex items-center gap-3 shrink-0">
        <span
          className={`font-display font-black tracking-[0.1em] ${compact ? 'text-[0.95rem]' : 'text-[1.1rem]'}`}
          style={{
            background: 'linear-gradient(90deg, #FF5C3A, #FF8C42)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          STRATA
        </span>
        <span className="font-mono text-[0.68rem] text-white/30">/ admin</span>
      </div>

      <div className="flex-1 min-w-[8px]" />

      {/* Right side */}
      <div className="flex items-center gap-3 shrink-0">
        {!compact && user && (
          <div className="flex items-center gap-2">
            <span className="font-mono text-[0.7rem] text-white/35">{permissionName || 'Staff'}</span>
            <span className="text-white/15 text-[0.7rem]">·</span>
            <span className="font-medium text-[0.82rem] text-white/60">{user.Name}</span>
          </div>
        )}

        <div className="flex items-center gap-1.5">
          <button onClick={toggleNoclip} title="Toggle NoClip" className={`${btn} ${noclip ? activeBtn : idleBtn}`}>
            <Wind size={12} />
          </button>
          <button onClick={toggleInvisible} title="Toggle Invisible" className={`${btn} ${invisible ? activeBtn : idleBtn}`}>
            <Ghost size={12} />
          </button>
          <button onClick={togglePlayerIds} title="Toggle Player IDs" className={`${btn} ${playerIds ? activeBtn : idleBtn}`}>
            <Hash size={12} />
          </button>

          <button onClick={() => dispatch('TOGGLE_COMPACT')} title="Compact mode (Ctrl+B)" className={`${btn} ${compact ? activeBtn : idleBtn}`}>
            {compact ? <PanelRightClose size={12} /> : <PanelRightOpen size={12} />}
          </button>

          <div className="w-px h-4 bg-white/10 mx-0.5" />

          <button
            onClick={() => dispatch('SET_OPACITY_MODE', { state: !opacity })}
            title="Toggle opacity"
            className={`${btn} ${opacity ? activeBtn : idleBtn}`}
          >
            <Eye size={12} />
          </button>

          <button
            onClick={() => { dispatch('APP_HIDE'); sendNui('Close') }}
            title="Close (ESC)"
            className={`${btn} ${idleBtn} hover:text-white/70 hover:border-white/25`}
          >
            <X size={12} />
          </button>
        </div>

        {!compact && <span className="font-mono text-[0.65rem] text-white/15 uppercase tracking-[0.5px]">ESC</span>}
      </div>
    </div>
  )
}
