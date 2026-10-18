import React from 'react'
import {
  Signal,
  Wifi,
  WifiOff,
  BatteryMedium,
  Flag,
  ShieldCheck,
} from 'lucide-react'
import { useStore } from '../store'

export default function Header(): React.ReactElement {
  const time = useStore((s) => s.time)
  const limited = useStore((s) => s.limited)
  const player = useStore((s) => s.player)
  const currentApp = useStore((s) => s.currentApp)

  const states = (player.States ?? {}) as Record<string, unknown>
  const hasVpn = !!states.PHONE_VPN
  const hasDongle = !!states.RACE_DONGLE

  const timeStr = `${String(time.hour).padStart(2, '0')}:${String(time.minute).padStart(2, '0')}`

  const onHome = !currentApp
  const bgClass = onHome ? 'bg-transparent' : 'bg-black/40'

  return (
    <div
      className={`relative flex items-center justify-between px-3 h-9 shrink-0 transition-colors ${bgClass}`}
    >
      {/* Left — status icons */}
      <div className="flex items-center gap-1.5">
        <Signal size={11} className="text-white/50" />
        {limited && <WifiOff size={11} className="text-white/40" />}
        {!limited && <Wifi size={11} className="text-white/40" />}
        {hasVpn && <ShieldCheck size={11} className="text-primary/70" />}
        {hasDongle && <Flag size={11} className="text-red-400/70" />}
      </div>

      {/* Center — SID */}
      {player.SID != null && (
        <span className="absolute left-1/2 -translate-x-1/2 font-mono text-[0.6rem] text-white/45 tracking-wide">
          #{player.SID}
        </span>
      )}

      {/* Right — time + battery */}
      <div className="flex items-center gap-2">
        <span className="font-mono text-[0.6rem] text-white/60 tracking-wide">{timeStr}</span>
        <BatteryMedium size={13} className="text-white/40" />
      </div>
    </div>
  )
}
