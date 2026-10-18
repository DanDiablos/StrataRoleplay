import { ArrowLeft, X, Volume2, Bell, BellOff, Monitor } from 'lucide-react'
import { useState } from 'react'
import { sendNui } from '../nui'
import { useStore } from '../store'
import type { LaptopSettings } from '../types'

const WALLPAPERS = [
  { id: 'default',  label: 'Default',     preview: 'linear-gradient(145deg, #0e0e0e 0%, #1a1a1a 100%)' },
  { id: 'city',     label: 'City Lights', preview: 'linear-gradient(180deg, #0a061e 0%, #32133a 50%, #3d1205 100%)' },
  { id: 'abstract', label: 'Abstract',    preview: 'radial-gradient(ellipse 120% 100% at 30% 100%, #00302a 0%, #001520 45%, #06080f 100%)' },
  { id: 'minimal',  label: 'Minimal',     preview: 'linear-gradient(145deg, #161618 0%, #0c0c0e 100%)' },
]

export default function SettingsScreen(): React.ReactElement {
  const navigate = useStore(s => s.navigate)
  const dispatch = useStore(s => s.dispatch)
  const data     = useStore(s => s.data)
  const apps     = useStore(s => s.apps)

  const player = data.player as Record<string, unknown> | undefined
  const initSettings: LaptopSettings = {
    volume: 80,
    notifications: true,
    appNotifications: {},
    wallpaper: 'default',
    zoom: 100,
    ...(typeof player?.LaptopSettings === 'object' ? player?.LaptopSettings as Partial<LaptopSettings> : {}),
  }

  const [volume,    setVolume]    = useState(initSettings.volume)
  const [notifs,    setNotifs]    = useState(initSettings.notifications)
  const [appNotifs, setAppNotifs] = useState<Record<string, boolean>>(initSettings.appNotifications)
  const [wallpaper, setWallpaper] = useState(initSettings.wallpaper ?? 'default')

  const save = (type: string, val: unknown) => sendNui('UpdateSetting', { type, val })

  const handleVolume    = (v: number)  => { setVolume(v);   save('volume', v) }
  const handleNotifs    = (v: boolean) => { setNotifs(v);   save('notifications', v) }
  const handleWallpaper = (id: string) => { setWallpaper(id); save('wallpaper', id) }
  const handleAppNotif  = (name: string, v: boolean) => {
    const next = { ...appNotifs, [name]: v }
    setAppNotifs(next)
    save('appNotifications', next)
  }

  const handleClose = () => {
    dispatch('LAPTOP_NOT_VISIBLE')
    sendNui('CloseTablet')
  }

  return (
    <div className="w-full h-full flex flex-col">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="h-[52px] shrink-0 flex items-center px-4 gap-3 border-b border-white/[0.06] bg-menu-surface">
        <button
          onClick={() => navigate('home')}
          className="w-7 h-7 flex items-center justify-center border border-white/10 bg-white/[0.03] text-white/30 hover:text-white/60 transition-colors"
        >
          <ArrowLeft size={13} />
        </button>
        <span
          className="font-display font-black tracking-[0.1em] text-[1.05rem] select-none"
          style={{ background: 'linear-gradient(90deg, #FF5C3A, #FF8C42)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
        >
          STRATA
        </span>
        <span className="font-mono text-[0.65rem] text-white/25 uppercase">/ system</span>
        <div className="flex-1" />
        <button
          onClick={handleClose}
          className="flex items-center gap-1.5 font-mono text-[0.65rem] text-white/25 hover:text-white/60 uppercase tracking-[0.05em] transition-colors"
        >
          <X size={11} /><span>ESC</span>
        </button>
      </div>

      {/* ── Content ─────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-y-auto p-5 flex flex-col gap-4">

        {/* Audio */}
        <Card title="Audio" Icon={Volume2}>
          <div className="px-4 py-4 flex items-center gap-5">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-[0.84rem] text-white/70 leading-tight">Notification Volume</p>
              <p className="font-mono text-[0.63rem] text-white/30 mt-0.5">Controls the volume of all laptop notification sounds</p>
            </div>
            <span className="font-mono text-[0.75rem] text-white/40 w-9 text-right shrink-0">{volume}%</span>
            <input
              type="range" min={0} max={100} value={volume}
              onChange={e => handleVolume(Number(e.target.value))}
              className="w-36 shrink-0"
            />
          </div>
        </Card>

        {/* Notifications */}
        <Card title="Notifications" Icon={notifs ? Bell : BellOff}>
          {/* Global */}
          <div className="px-4 py-4 flex items-center gap-4 border-b border-white/[0.06]">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-[0.84rem] text-white/70 leading-tight">Global Notifications</p>
              <p className="font-mono text-[0.63rem] text-white/30 mt-0.5">Enable or disable all laptop notifications at once</p>
            </div>
            <Toggle checked={notifs} onChange={handleNotifs} />
          </div>

          {/* Per-app */}
          {apps.filter(a => !a.fake).map(app => (
            <div key={app.name} className="px-4 py-3 flex items-center border-b border-white/[0.04] last:border-0">
              <span className={`font-medium text-[0.8rem] flex-1 pl-5 transition-colors ${notifs ? 'text-white/55' : 'text-white/25'}`}>
                {app.label}
              </span>
              <Toggle
                checked={appNotifs[app.name] !== true}
                onChange={v => handleAppNotif(app.name, !v)}
                disabled={!notifs}
              />
            </div>
          ))}
        </Card>

        {/* Appearance */}
        <Card title="Appearance" Icon={Monitor}>
          <div className="p-4 flex flex-col gap-3">
            <p className="font-mono text-[0.63rem] text-white/35 uppercase tracking-[0.05em]">Wallpaper</p>
            <div className="grid grid-cols-4 gap-2">
              {WALLPAPERS.map(w => (
                <button
                  key={w.id}
                  onClick={() => handleWallpaper(w.id)}
                  className={`flex flex-col gap-2 p-1.5 border transition-colors ${
                    wallpaper === w.id
                      ? 'border-primary/50 bg-primary/[0.04]'
                      : 'border-white/[0.06] hover:border-white/15'
                  }`}
                >
                  <div className="h-16 w-full" style={{ background: w.preview }} />
                  <span className={`font-mono text-[0.62rem] text-center uppercase tracking-[0.04em] pb-0.5 ${
                    wallpaper === w.id ? 'text-primary' : 'text-white/35'
                  }`}>
                    {w.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </Card>

      </div>
    </div>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function Card({ title, Icon, children }: {
  title: string
  Icon: React.ComponentType<{ size?: number; className?: string }>
  children: React.ReactNode
}) {
  return (
    <div className="border-l-[3px] border-l-primary bg-menu-surface">
      <div className="px-3 py-2.5 bg-menu-surface-lt border-b border-white/[0.06] flex items-center gap-2">
        <Icon size={13} className="text-white/40" />
        <span className="font-display font-bold uppercase tracking-[0.12em] text-[0.72rem] text-white/70">{title}</span>
      </div>
      {children}
    </div>
  )
}

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({ checked, onChange, disabled }: {
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}) {
  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      className={`relative w-10 h-[22px] shrink-0 overflow-hidden transition-colors ${
        disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
      } ${checked ? 'bg-primary/65' : 'bg-white/[0.06] border border-white/10'}`}
    >
      <span className={`absolute top-[3px] left-0 w-4 h-4 transition-all ${
        checked ? 'translate-x-[22px] bg-white' : 'translate-x-[3px] bg-white/25'
      }`} />
    </button>
  )
}
