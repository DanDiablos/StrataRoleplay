import { useStore } from '../../store.ts'
import StatusBar from './StatusBar.tsx'
import Location from './Location.tsx'
import Buffs from './Buffs.tsx'
import VehicleHud from './VehicleHud.tsx'
import AmmoCounter from './AmmoCounter.tsx'

export default function HudShell(): JSX.Element | null {
  const hudShowing = useStore(s => s.hudShowing)
  const position = useStore(s => s.position)

  // Minimap-relative container for status bars (matches minimal-hud positioning)
  const hasPosition = position.width > 0
  const mmStyle = hasPosition
    ? {
        top: position.topY * 100 + 'vh',
        left: position.leftX * 100 + 'vw',
        width: position.width * 100 * 2 + 'vw',
        height: position.height * 100 + 'vh',
      }
    : { bottom: 70, left: 20, width: 314.496 * 2, height: 197.64 }

  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{
        opacity: hudShowing ? 1 : 0,
        transition: 'opacity 0.25s ease',
      }}
    >
      {/* Status — bottom-left, same level as VOIP */}
      <div
        className="fixed z-20"
        style={{
          bottom: 22,
          left: hasPosition ? (position.leftX * 100 + 'vw') : 20,
          width: hasPosition ? (position.width * 100 * 2 + 'vw') : 314.496 * 2,
        }}
      >
        <StatusBar />
      </div>

      {/* Location — top-center */}
      <Location />

      {/* Buffs — bottom-center */}
      <Buffs />

      {/* Vehicle HUD — bottom-right area */}
      <VehicleHud />

      {/* Ammo — top-right */}
      <div className="absolute" style={{ top: 22, right: 24 }}>
        <AmmoCounter />
      </div>
    </div>
  )
}
