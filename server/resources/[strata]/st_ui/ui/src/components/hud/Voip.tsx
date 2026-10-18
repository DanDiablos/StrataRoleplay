import { Mic, Radio } from 'lucide-react'
import { useStore } from '../../store.ts'

const WAVEFORMS: Record<number, number[]> = {
  1: [10, 14, 10],
  2: [10, 16, 22, 16, 10],
  3: [8, 14, 18, 22, 18, 14, 8],
}

export default function Voip(): JSX.Element | null {
  const voip = useStore(s => s.voip)
  const talking = useStore(s => s.talking)
  const voipIcon = useStore(s => s.voipIcon)
  const config = useStore(s => s.config)

  const isRadio = talking === 2
  const isActive = talking > 0

  const IconComponent = voipIcon === 'bullhorn' ? Radio : Mic
  const DisplayIcon = isRadio && !config.maskRadio ? Radio : IconComponent

  return (
    <div
      className="relative flex items-center gap-2 px-2.5 h-[2.2vw] bg-menu-surface"
      style={{
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.55)',
      }}
    >
      {/* Left accent — primary on active, muted otherwise */}
      <span
        className="absolute left-0 top-0 bottom-0 transition-colors"
        style={{
          width: 2,
          background: isActive ? '#FF5C3A' : 'rgba(255,255,255,0.08)',
        }}
      />

      <DisplayIcon
        size={13}
        className="transition-colors duration-200 drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]"
        style={{ color: isActive ? '#FF5C3A' : 'rgba(255,255,255,0.55)' }}
      />

      {/* Waveform bars — width scales with voice range */}
      <div className="flex items-center gap-[3px]" style={{ height: 22 }}>
        {(WAVEFORMS[voip] ?? WAVEFORMS[2]).map((h, i, arr) => {
          const delay = (i / Math.max(arr.length - 1, 1)) * 0.6
          return (
            <div
              key={i}
              className="w-[2px] origin-center"
              style={{
                height: h,
                transform: isActive ? 'scaleY(1)' : `scaleY(${4 / h})`,
                background: isActive ? '#FF5C3A' : 'rgba(255,255,255,0.18)',
                animation: isActive ? `voip-wave 0.8s ease-in-out ${delay}s infinite alternate` : 'none',
                transition: 'transform 0.25s ease, background 0.25s ease',
              }}
            />
          )
        })}
      </div>
    </div>
  )
}
