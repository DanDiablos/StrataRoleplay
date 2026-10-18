import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Play } from 'lucide-react'
import { useStore } from '../store'
import { sendNui } from '../nui'

interface AnimDef {
  key: string
  label: string
  category: string
  type: 'scenario' | 'anim'
  scenario?: string
  dict?: string
  clip?: string
}

const ANIMATIONS: AnimDef[] = [
  // Standing
  { key: 'statue',      label: 'Statue',        category: 'Standing', type: 'scenario', scenario: 'WORLD_HUMAN_HUMAN_STATUE' },
  { key: 'guard',       label: 'Guard',          category: 'Standing', type: 'scenario', scenario: 'WORLD_HUMAN_GUARD_STAND' },
  { key: 'clipboard',   label: 'Clipboard',      category: 'Standing', type: 'scenario', scenario: 'WORLD_HUMAN_CLIPBOARD' },
  // Leaning
  { key: 'lean_wall',   label: 'Lean Wall',      category: 'Leaning',  type: 'scenario', scenario: 'WORLD_HUMAN_LEAN_MALE' },
  { key: 'hang_out',    label: 'Hang Out',       category: 'Leaning',  type: 'scenario', scenario: 'WORLD_HUMAN_HANG_OUT_STREET' },
  // Actions
  { key: 'smoke',       label: 'Smoke',          category: 'Actions',  type: 'scenario', scenario: 'WORLD_HUMAN_SMOKING' },
  { key: 'phone',       label: 'Phone Call',     category: 'Actions',  type: 'scenario', scenario: 'WORLD_HUMAN_STAND_MOBILE' },
  { key: 'drink',       label: 'Drink Coffee',   category: 'Actions',  type: 'scenario', scenario: 'WORLD_HUMAN_DRINKING' },
  { key: 'photo',       label: 'Take Photo',     category: 'Actions',  type: 'scenario', scenario: 'WORLD_HUMAN_PAPARAZZI' },
  // Poses
  { key: 'arms_cross',  label: 'Arms Crossed',   category: 'Poses',    type: 'anim', dict: 'anim@heists@heist_corona@single_team', clip: 'single_team_loop_boss' },
  { key: 'arms_behind', label: 'Arms Behind',    category: 'Poses',    type: 'anim', dict: 'amb@world_human_cop_idles@male@idle_b', clip: 'idle_d' },
  { key: 'hands_hip',   label: 'Hands on Hips',  category: 'Poses',    type: 'anim', dict: 'anim@mp_celebration@idles@female', clip: 'celebration_idle_f_a' },
  { key: 'think',       label: 'Thinking',       category: 'Poses',    type: 'anim', dict: 'missheist_jewelleaderprep', clip: 'yourChoice' },
  // Movement
  { key: 'jog',         label: 'Jog in Place',   category: 'Movement', type: 'scenario', scenario: 'WORLD_HUMAN_JOG_STANDING' },
  { key: 'pushups',     label: 'Push-ups',       category: 'Movement', type: 'scenario', scenario: 'WORLD_HUMAN_PUSH_UPS' },
  { key: 'situps',      label: 'Sit-ups',        category: 'Movement', type: 'scenario', scenario: 'WORLD_HUMAN_SIT_UPS' },
  // Social
  { key: 'dance',       label: 'Dance',          category: 'Social',   type: 'anim', dict: 'anim@mp_player_intcelebrationfemale@the_best', clip: 'the_best' },
  { key: 'wave',        label: 'Wave',           category: 'Social',   type: 'anim', dict: 'friends@frj@ig_1', clip: 'wave_a' },
]

const CATEGORIES = [...new Set(ANIMATIONS.map((a) => a.category))]

export default function AnimationPicker(): React.ReactElement {
  const [open, setOpen] = useState(false)
  const activeAnimation = useStore((s) => s.activeAnimation)
  const setActiveAnimation = useStore((s) => s.setActiveAnimation)
  const btnRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ top: 0, right: 0 })

  const currentAnim = ANIMATIONS.find((a) => a.key === activeAnimation)
  const currentLabel = currentAnim ? currentAnim.label : 'Idle'

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (btnRef.current?.contains(target)) return
      if (dropdownRef.current?.contains(target)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleOpen = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      setPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right })
    }
    setOpen((o) => !o)
  }

  const handleSelect = (anim: AnimDef | null) => {
    if (anim) {
      setActiveAnimation(anim.key)
      if (anim.type === 'scenario') {
        sendNui('PlayAnimation', { type: 'scenario', scenario: anim.scenario })
      } else {
        sendNui('PlayAnimation', { type: 'anim', dict: anim.dict, clip: anim.clip })
      }
    } else {
      setActiveAnimation(null)
      sendNui('StopAnimation', {})
    }
    setOpen(false)
  }

  const active = 'border-primary/40 bg-primary/10 text-primary'
  const idle   = 'border-white/10 bg-white/[0.03] text-white/30 hover:text-white/60 hover:border-white/20'

  return (
    <>
      <button
        ref={btnRef}
        onClick={handleOpen}
        title="Animations"
        className={`h-7 flex items-center gap-1.5 px-2 border transition-colors ${activeAnimation ? active : idle}`}
      >
        <Play size={11} />
        <span className="font-mono text-[0.6rem] uppercase tracking-[0.03em] max-w-[72px] truncate">
          {currentLabel}
        </span>
      </button>

      {open && createPortal(
        <div
          ref={dropdownRef}
          className="fixed z-[200] flex flex-col overflow-hidden"
          style={{
            top: pos.top,
            right: pos.right,
            width: 220,
            maxHeight: 320,
            background: 'rgba(10,10,10,0.97)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
          }}
        >
          <div className="overflow-y-auto">
            {/* None option */}
            <button
              onClick={() => handleSelect(null)}
              className={`w-full text-left px-3 py-2 font-mono text-[0.68rem] uppercase tracking-[0.04em] transition-colors border-l-2 ${
                !activeAnimation
                  ? 'text-primary border-primary bg-primary/[0.06]'
                  : 'text-white/50 border-transparent hover:bg-white/[0.04]'
              }`}
            >
              None (Idle)
            </button>

            {CATEGORIES.map((cat) => (
              <div key={cat}>
                <div className="px-3 py-1 font-display font-bold text-[0.55rem] text-white/20 uppercase tracking-[0.12em]">
                  {cat}
                </div>
                {ANIMATIONS.filter((a) => a.category === cat).map((anim) => (
                  <button
                    key={anim.key}
                    onClick={() => handleSelect(anim)}
                    className={`w-full text-left px-3 py-2 font-mono text-[0.68rem] uppercase tracking-[0.04em] transition-colors border-l-2 ${
                      activeAnimation === anim.key
                        ? 'text-primary border-primary bg-primary/[0.06]'
                        : 'text-white/50 border-transparent hover:bg-white/[0.04] hover:text-white/70'
                    }`}
                  >
                    {anim.label}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
