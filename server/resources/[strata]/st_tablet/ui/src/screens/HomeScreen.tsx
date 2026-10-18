import { useState, useRef, useEffect } from 'react'
import { Bell, X, Wifi, BatteryMedium, Tablet, Briefcase, Users, Ghost, Settings, Globe, Archive, Lock, Check, Video } from 'lucide-react'
import { useStore } from '../store'
import { sendNui } from '../nui'
import Notifications from '../components/Notifications.tsx'
import type { LaptopApp } from '../types'

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  lsunderground: Ghost,
  teams:         Users,
  bizwiz:        Briefcase,
  settings:      Settings,
  internet:      Globe,
  files:         Archive,
  cameras:       Video,
}

interface WifiNetwork {
  id: string
  name: string
  signal: number   // 1–4
  secured: boolean
  connected?: boolean
}

const WIFI_NETWORKS: WifiNetwork[] = [
  { id: 'strata_5g',    name: 'Strata_5G',         signal: 4, secured: false, connected: true },
  { id: 'ls_fiber',     name: 'LS_Fiber_Premium',   signal: 3, secured: true  },
  { id: 'vinewood',     name: 'Vinewood_Guest',      signal: 3, secured: false },
  { id: 'pd_secure',    name: 'LSPD_SECURE_NET',     signal: 2, secured: true  },
  { id: 'grove_wifi',   name: 'Grove_St_Network',    signal: 2, secured: true  },
  { id: 'sandy_pub',    name: 'Sandy_Public',        signal: 1, secured: false },
]

function SignalBars({ level, active }: { level: number; active: boolean }) {
  return (
    <div className="flex items-end gap-[2px]">
      {[1, 2, 3, 4].map(i => (
        <div
          key={i}
          style={{
            width: '3px',
            height: `${5 + i * 3}px`,
            borderRadius: '1px',
            background: i <= level
              ? active ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.55)'
              : 'rgba(255,255,255,0.12)',
          }}
        />
      ))}
    </div>
  )
}

function WifiPanel({ onClose }: { onClose: () => void }) {
  const [expanded, setExpanded]   = useState<string | null>(null)
  const [passwords, setPasswords] = useState<Record<string, string>>({})
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const toggle = (id: string) => setExpanded(prev => prev === id ? null : id)

  return (
    <div
      ref={ref}
      className="absolute top-[52px] right-5 z-50 w-[272px] animate-fade-in overflow-hidden"
      style={{
        background: 'rgba(11,11,15,0.97)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px',
        boxShadow: '0 12px 40px rgba(0,0,0,0.75)',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.06]">
        <Wifi size={13} className="text-white/50" />
        <span className="font-display font-bold uppercase tracking-[0.1em] text-[0.72rem] text-white/60 flex-1">
          Wi-Fi
        </span>
        <span className="font-mono text-[0.6rem] text-menu-success-lt uppercase tracking-[0.05em]">
          Connected
        </span>
      </div>

      {/* Network list */}
      <div className="py-1 max-h-[300px] overflow-y-auto">
        {WIFI_NETWORKS.map(net => (
          <div key={net.id}>
            <button
              onClick={() => !net.connected && toggle(net.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors ${
                net.connected
                  ? 'bg-primary/[0.07]'
                  : 'hover:bg-white/[0.04] cursor-pointer'
              }`}
            >
              <SignalBars level={net.signal} active={!!net.connected} />
              <span className={`flex-1 text-left font-medium text-[0.8rem] ${net.connected ? 'text-white/90' : 'text-white/60'}`}>
                {net.name}
              </span>
              {net.connected && (
                <Check size={11} className="text-menu-success-lt shrink-0" />
              )}
              {!net.connected && net.secured && (
                <Lock size={11} className="text-white/22 shrink-0" />
              )}
            </button>

            {/* Expand: password or open connect */}
            {expanded === net.id && !net.connected && (
              <div className="px-4 pt-1 pb-3 bg-white/[0.02] border-t border-white/[0.04] animate-fade-in">
                {net.secured && (
                  <input
                    type="password"
                    placeholder="Password"
                    value={passwords[net.id] ?? ''}
                    onChange={e => setPasswords(p => ({ ...p, [net.id]: e.target.value }))}
                    className="w-full h-8 px-3 mt-2 mb-2 bg-menu-surface-lt border border-white/10 text-[0.82rem] text-white/80 placeholder-white/20 focus:border-primary/50 transition-colors"
                    style={{ borderRadius: '5px' }}
                    autoFocus
                  />
                )}
                <button className="w-full h-7 flex items-center justify-center border border-primary/35 bg-primary/8 text-[#FF8C42] text-[0.72rem] font-semibold hover:bg-primary/15 transition-colors mt-1" style={{ borderRadius: '5px' }}>
                  Connect
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

interface AppIconProps {
  app: LaptopApp
  onClick: () => void
  iconSize?: number
  showLabel?: boolean
}

function AppIcon({ app, onClick, iconSize = 26, showLabel = true }: AppIconProps) {
  const Icon = ICON_MAP[app.name] ?? Tablet
  const dim  = showLabel ? 64 : 52

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 group"
    >
      <div
        className="relative flex items-center justify-center overflow-hidden"
        style={{
          width: `${dim}px`,
          height: `${dim}px`,
          borderRadius: '16px',
          background: `linear-gradient(160deg, ${app.color}48 0%, ${app.color}25 100%), rgba(18,18,22,0.72)`,
          border: `1px solid ${app.color}45`,
          boxShadow: `0 4px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.09)`,
        }}
      >
        <div
          className="absolute inset-x-0 top-0 h-1/2 pointer-events-none"
          style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 100%)' }}
        />
        <Icon size={iconSize} color="rgba(255,255,255,0.88)" />
        {app.unread > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center bg-primary text-white font-mono text-[0.48rem] rounded-full px-1 z-10 leading-none">
            {app.unread}
          </span>
        )}
      </div>
      {showLabel && (
        <span className="font-medium text-[0.67rem] text-white/55 group-hover:text-white/85 transition-colors text-center tracking-[0.04em] uppercase max-w-[72px] truncate select-none">
          {app.label}
        </span>
      )}
    </button>
  )
}

export default function HomeScreen(): React.ReactElement {
  const apps          = useStore(s => s.apps)
  const time          = useStore(s => s.time)
  const notifications = useStore(s => s.notifications)
  const dispatch      = useStore(s => s.dispatch)
  const navigate      = useStore(s => s.navigate)
  const [showNotifs, setShowNotifs] = useState(false)
  const [showWifi,   setShowWifi]   = useState(false)

  const unreadCount = notifications.filter(n => n.show).length
  const visibleApps = apps.filter(a => !a.hidden)
  const dockApps    = visibleApps.filter(a => !a.canUninstall)

  const handleClose = () => {
    dispatch('LAPTOP_NOT_VISIBLE')
    sendNui('CloseTablet')
  }

  const handleAppClick = (app: LaptopApp) => {
    const SCREEN_MAP: Record<string, string> = { lsunderground: 'lsu' }
    const screen = SCREEN_MAP[app.name] ?? app.name
    if (['home', 'bizwiz', 'lsu', 'teams', 'settings', 'internet', 'files', 'cameras'].includes(screen)) {
      navigate(screen)
    }
  }

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Status bar */}
      <div
        className="h-[48px] flex items-center px-5 gap-3 shrink-0 border-b border-white/[0.07]"
        style={{ background: 'rgba(0,0,0,0.62)' }}
      >
        {/* Left — wordmark + context */}
        <span
          className="font-display font-black tracking-[0.1em] text-[1.05rem] select-none"
          style={{ background: 'linear-gradient(90deg, #FF5C3A, #FF8C42)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
        >
          STRATA
        </span>
        <span className="font-mono text-[0.65rem] text-white/25 uppercase tracking-[0.05em] select-none">
          / tablet
        </span>

        <div className="flex-1" />

        {/* Right — time + icons + close */}
        <span className="font-mono text-[0.82rem] text-white/60 tabular-nums select-none mr-1">
          {time ?? '--:--'}
        </span>

        {/* Wifi + Battery — individual clickable buttons */}
        <button
          onClick={() => { setShowWifi(s => !s); setShowNotifs(false) }}
          className={`flex items-center gap-2.5 h-8 px-3 border transition-colors ${
            showWifi
              ? 'border-primary/40 bg-primary/10 text-primary'
              : 'border-white/[0.08] bg-white/[0.03] text-white/50 hover:text-white/80'
          }`}
        >
          <Wifi size={15} />
        </button>

        <div className="flex items-center h-8 px-3 border border-white/[0.08] bg-white/[0.03] text-white/50">
          <BatteryMedium size={18} />
        </div>

        <button
          onClick={() => { setShowNotifs(s => !s); setShowWifi(false) }}
          className={`relative w-8 h-8 flex items-center justify-center border transition-colors ${
            showNotifs
              ? 'border-primary/40 bg-primary/10 text-primary'
              : 'border-white/[0.08] bg-white/[0.03] text-white/45 hover:text-white/75'
          }`}
        >
          <Bell size={15} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[15px] h-[15px] flex items-center justify-center bg-primary text-white font-mono text-[0.46rem] rounded-full px-0.5 leading-none z-10">
              {unreadCount}
            </span>
          )}
        </button>

        <button
          onClick={handleClose}
          className="flex items-center gap-1.5 h-8 px-3 border border-white/[0.08] bg-white/[0.03] text-white/40 hover:text-white/70 transition-colors"
        >
          <X size={13} />
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.06em]">ESC</span>
        </button>
      </div>

      {/* Wi-Fi dropdown */}
      {showWifi && <WifiPanel onClose={() => setShowWifi(false)} />}

      {/* Main content */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* App grid */}
        <div className="flex-1 p-10 pt-8 overflow-y-auto">
          {visibleApps.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <Tablet size={36} className="text-white/12" />
              <span className="font-mono text-[0.68rem] text-white/18 uppercase tracking-[0.08em]">
                No apps installed
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-5 gap-x-6 gap-y-8">
              {visibleApps.map(app => (
                <AppIcon key={app.name} app={app} onClick={() => handleAppClick(app)} />
              ))}
            </div>
          )}
        </div>

        {/* Notifications side panel */}
        {showNotifs && <Notifications onClose={() => setShowNotifs(false)} />}
      </div>

      {/* Bottom dock */}
      {dockApps.length > 0 && (
        <div className="shrink-0 flex justify-center px-6 pb-5">
          <div
            className="flex items-center gap-5 px-7 py-3"
            style={{
              background: 'rgba(12,12,15,0.90)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '20px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            }}
          >
            {dockApps.map(app => (
              <AppIcon
                key={app.name}
                app={app}
                iconSize={22}
                showLabel={false}
                onClick={() => handleAppClick(app)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
