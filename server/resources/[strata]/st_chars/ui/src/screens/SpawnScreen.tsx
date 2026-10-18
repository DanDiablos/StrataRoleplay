import { MapPin, Home, Building, Car, Bed, Navigation, Compass } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useStore, STATES } from '../store'
import type { Spawn } from '../store'
import { sendNui } from '../nui'
import Navbar from '../components/Navbar'

const ICON_MAP: Record<string, LucideIcon> = {
  'location-dot': MapPin,
  'map-pin':      MapPin,
  'map-marker':   MapPin,
  'home':         Home,
  'house':        Home,
  'hotel':        Building,
  'building':     Building,
  'car':          Car,
  'bed':          Bed,
  'compass':      Compass,
  'navigation':   Navigation,
}

function SpawnIcon({ name }: { name: string }): React.ReactElement {
  const Icon = ICON_MAP[name] ?? MapPin
  return <Icon size={14} />
}

function formatTimeAgo(unixSeconds: number): string {
  const diff = Math.max(0, Math.floor(Date.now() / 1000) - unixSeconds)
  if (diff < 60) return `${diff}s ago`
  const m = Math.floor(diff / 60)
  if (m < 60)   return `${m}m ago`
  return `${Math.floor(m / 60)}h ago`
}

interface SpawnTabProps {
  spawn:        Spawn
  onPlay:       () => void
  noneSelected: boolean
}

function SpawnTab({ spawn, onPlay, noneSelected }: SpawnTabProps): React.ReactElement {
  const selectedSpawn = useStore(s => s.selectedSpawn)
  const dispatch       = useStore(s => s.dispatch)
  const isActive       = selectedSpawn?.id === spawn?.id

  const onClick = () => {
    sendNui('SelectSpawn', { spawn })
    dispatch('SELECT_SPAWN', spawn as unknown as Record<string, unknown>)
  }

  const sublabel = spawn.loggedOffTime ? `logged off ${formatTimeAgo(spawn.loggedOffTime)}` : null

  return (
    <div
      onClick={onClick}
      onDoubleClick={onPlay}
      className="relative flex items-center gap-2 px-[0.9rem] cursor-pointer select-none transition-colors duration-150"
      style={{
        color: isActive ? 'rgba(255,255,255,0.92)' : noneSelected ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.38)',
      }}
    >
      <SpawnIcon name={spawn.icon ?? 'location-dot'} />
      <div className="flex flex-col gap-px">
        <span className="text-[0.84rem] font-medium whitespace-nowrap leading-[1.2]">{spawn.label}</span>
        {sublabel && <span className="font-mono text-[0.62rem] text-white/32 whitespace-nowrap leading-none">{sublabel}</span>}
      </div>
      {isActive && (
        <div className="absolute bottom-0 left-[0.9rem] right-[0.9rem] h-0.5 bg-primary" />
      )}
    </div>
  )
}

export default function SpawnScreen(): React.ReactElement {
  const dispatch      = useStore(s => s.dispatch)
  const spawns        = useStore(s => s.spawns)
  const selectedSpawn = useStore(s => s.selectedSpawn)
  const selectedChar  = useStore(s => s.selected)

  const onSpawn = () => {
    if (!selectedSpawn) return
    sendNui('PlayCharacter', { spawn: selectedSpawn as unknown as Record<string, unknown>, character: selectedChar as unknown as Record<string, unknown> })
    dispatch('LOADING_SHOW', { message: 'Spawning' })
    dispatch('UPDATE_PLAYED')
    dispatch('DESELECT_CHARACTER')
    dispatch('DESELECT_SPAWN')
  }

  const goBack = () => {
    sendNui('CancelSpawn')
    dispatch('DESELECT_CHARACTER')
    dispatch('DESELECT_SPAWN')
    dispatch('SET_STATE', { state: STATES.CHARACTERS })
  }

  const centerTabs = (
    <div className="flex items-stretch">
      {spawns.map((spawn, i) => (
        <SpawnTab key={i} spawn={spawn} onPlay={onSpawn} noneSelected={!selectedSpawn} />
      ))}
    </div>
  )

  const rightSlot = (
    <div className="flex items-center gap-2.5">
      {selectedChar && (
        <>
          <div className="flex flex-col items-end gap-px">
            <span className="font-mono text-[0.64rem] text-white/28 tracking-[0.04em]">spawning as</span>
            <span className="font-display font-bold text-[0.88rem] text-white/82 whitespace-nowrap tracking-[-0.01em]">
              {selectedChar.First} {selectedChar.Last}
            </span>
          </div>
          <div className="w-px h-[22px] bg-white/[0.07]" />
        </>
      )}
      <button
        type="button"
        onClick={goBack}
        className="font-display font-bold text-[0.78rem] uppercase tracking-[0.03em] text-white/50 bg-transparent border border-white/[0.07] px-3.5 py-1.5 hover:border-white/[0.18] hover:text-white/72 transition-all"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={onSpawn}
        disabled={!selectedSpawn}
        className="font-display font-bold text-[0.78rem] uppercase tracking-[0.03em] text-white px-[18px] py-1.5 hover:opacity-85 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
        style={{ background: 'linear-gradient(135deg,#FF5C3A,#FF8C42,#FFB347)' }}
      >
        Play
      </button>
    </div>
  )

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <Navbar subLabel="spawn selection" center={centerTabs} right={rightSlot} />

      {!selectedSpawn && (
        <p className="fixed top-[60px] left-0 right-0 text-center font-mono text-[0.68rem] tracking-[0.08em] text-white/28 pointer-events-none z-[99]">
          <span className="text-primary/55 mr-1.5">↑</span>
          select a spawn location to continue
        </p>
      )}

      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80vw] h-[50vh] pointer-events-none z-0"
        style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(255,92,58,0.06) 0%, transparent 65%)' }}
      />
    </div>
  )
}
