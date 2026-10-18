import React, { useState } from 'react'
import { Volume2, Bell, Palette, User, ChevronRight, ChevronLeft, Check, Image, BellOff } from 'lucide-react'
import { useStore } from '../store'
import { sendNui } from '../nui'

type View = 'main' | 'sounds' | 'notifications' | 'colors' | 'personal' | 'wallpaper'

const RINGTONES = ['default', 'ringtone_1', 'ringtone_2', 'ringtone_3', 'ringtone_4', 'ringtone_5']
const TEXT_TONES = ['default', 'text_1', 'text_2', 'text_3', 'text_4', 'text_5']
const ACCENT_COLORS = ['#FF5C3A', '#E95200', '#c4b404', '#268f3a', '#05737d', '#1258a3', '#8800c7', '#870b30', '#59E5F7', '#63e6be']

const WALLPAPERS: { id: string; label: string; css: string }[] = [
  { id: 'default',    label: 'Default',    css: 'linear-gradient(165deg, #111111 0%, #0a0a0a 100%)' },
  { id: 'ember',      label: 'Ember',      css: 'linear-gradient(135deg, #1a0a05 0%, #2d0f06 30%, #FF5C3A 100%)' },
  { id: 'ocean',      label: 'Ocean',      css: 'linear-gradient(165deg, #020c1b 0%, #0a2540 40%, #1258a3 100%)' },
  { id: 'aurora',     label: 'Aurora',     css: 'linear-gradient(150deg, #041c14 0%, #05372a 40%, #1abc9c 100%)' },
  { id: 'twilight',   label: 'Twilight',   css: 'linear-gradient(160deg, #0d0415 0%, #2d1050 45%, #8800c7 100%)' },
  { id: 'midnight',   label: 'Midnight',   css: 'linear-gradient(180deg, #0a0a0f 0%, #121220 50%, #1c1c3a 100%)' },
  { id: 'sunset',     label: 'Sunset',     css: 'linear-gradient(140deg, #1a0505 0%, #6b1515 40%, #f09348 100%)' },
  { id: 'storm',      label: 'Storm',      css: 'linear-gradient(155deg, #08080a 0%, #1a1a24 45%, #3a3a5c 100%)' },
  { id: 'neon',       label: 'Neon',       css: 'linear-gradient(135deg, #0a0014 0%, #1a003a 40%, #59E5F7 100%)' },
  { id: 'forest',     label: 'Forest',     css: 'linear-gradient(170deg, #050a05 0%, #0f1f0a 45%, #268f3a 100%)' },
  { id: 'rose',       label: 'Rose',       css: 'linear-gradient(145deg, #140508 0%, #2d0a15 40%, #870b30 100%)' },
  { id: 'solar',      label: 'Solar',      css: 'linear-gradient(160deg, #0f0a00 0%, #2a1a00 40%, #c4b404 100%)' },
]

export default function SettingsScreen(): React.ReactElement {
  const player = useStore((s) => s.player)
  const dispatch = useStore((s) => s.dispatch)
  const pushAlert = useStore((s) => s.pushAlert)
  const apps = useStore((s) => s.apps)

  const settings = player.PhoneSettings ?? {}
  const [view, setView] = useState<View>('main')

  const updateSetting = (type: string, val: unknown) => {
    sendNui('UpdateSetting', { type, val })
    dispatch('UPDATE_DATA', { type: 'player', id: 'PhoneSettings', key: type, data: val })
  }

  const testSound = (val: string) => {
    sendNui('TestSound', { val })
  }

  /* ── Sounds ─────────────────────────── */
  if (view === 'sounds') {
    return (
      <SubPage title="Sounds" onBack={() => setView('main')}>
        {/* Volume */}
        <SectionLabel label="Volume" />
        <div className="px-4 py-3">
          <input
            type="range"
            min={0}
            max={100}
            value={settings.volume ?? 50}
            onChange={(e) => updateSetting('volume', Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between mt-1">
            <span className="font-mono text-[0.58rem] text-white/30">0</span>
            <span className="font-mono text-[0.58rem] text-white/50">{settings.volume ?? 50}</span>
            <span className="font-mono text-[0.58rem] text-white/30">100</span>
          </div>
        </div>

        {/* Ringtone */}
        <SectionLabel label="Ringtone" />
        {RINGTONES.map((r) => (
          <SelectRow
            key={r}
            label={r.replace(/_/g, ' ')}
            selected={settings.ringtone === r}
            onClick={() => {
              updateSetting('ringtone', r)
              testSound(r)
            }}
          />
        ))}

        {/* Text tone */}
        <SectionLabel label="Text Tone" />
        {TEXT_TONES.map((t) => (
          <SelectRow
            key={t}
            label={t.replace(/_/g, ' ')}
            selected={settings.textTone === t}
            onClick={() => {
              updateSetting('textTone', t)
              testSound(t)
            }}
          />
        ))}
      </SubPage>
    )
  }

  /* ── Notifications ──────────────────── */
  if (view === 'notifications') {
    const notifSettings = (settings.notifications ?? {}) as Record<string, boolean>
    const appList = Object.values(apps).filter((a) => a.name !== 'settings' && a.name !== 'store' && a.name !== 'calculator')

    return (
      <SubPage title="Notifications" onBack={() => setView('main')}>
        <div className="px-3 py-2">
          <span className="text-[0.6rem] text-white/30">Toggle notifications per app</span>
        </div>
        {appList.map((app) => {
          const enabled = notifSettings[app.name] !== false
          return (
            <button
              key={app.name}
              onClick={() => {
                const updated = { ...notifSettings, [app.name]: !enabled }
                updateSetting('notifications', updated)
              }}
              className="flex items-center gap-3 px-4 py-2.5 w-full hover:bg-white/[0.03] transition-colors border-b border-white/[0.03]"
            >
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                style={{ background: app.color }}
              >
                <span className="text-white text-[0.5rem] font-bold">{app.label[0]}</span>
              </div>
              <span className="flex-1 text-left text-[0.72rem] font-medium text-white/70">{app.label}</span>
              <div
                className={`w-8 h-4 rounded-full transition-colors flex items-center px-0.5 ${
                  enabled ? 'bg-primary/50' : 'bg-white/10'
                }`}
              >
                <div
                  className={`w-3 h-3 rounded-full bg-white transition-transform ${
                    enabled ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </div>
            </button>
          )
        })}
      </SubPage>
    )
  }

  /* ── Colors ─────────────────────────── */
  if (view === 'colors') {
    const current = settings.colors?.accent ?? '#FF5C3A'

    return (
      <SubPage title="Accent Color" onBack={() => setView('main')}>
        <div className="px-4 py-4">
          <div className="flex flex-wrap gap-3">
            {ACCENT_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => {
                  updateSetting('colors', { accent: c })
                  pushAlert('Accent color updated')
                }}
                className={`w-10 h-10 rounded-xl transition-all ${
                  current === c ? 'ring-2 ring-white/40 ring-offset-2 ring-offset-menu-bg' : ''
                }`}
                style={{ background: c }}
              >
                {current === c && (
                  <Check size={16} className="mx-auto text-white drop-shadow" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <SectionLabel label="Preview" />
        <div className="px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: current }}>
            <Palette size={16} className="text-white" />
          </div>
          <div>
            <span className="text-[0.72rem] font-medium" style={{ color: current }}>Accent Color</span>
            <p className="font-mono text-[0.6rem] text-white/40">{current}</p>
          </div>
        </div>
      </SubPage>
    )
  }

  /* ── Wallpaper ───────────────────────── */
  if (view === 'wallpaper') {
    const current = settings.wallpaper ?? 'default'

    return (
      <SubPage title="Wallpaper" onBack={() => setView('main')}>
        <div className="px-4 py-4 grid grid-cols-3 gap-2.5">
          {WALLPAPERS.map((wp) => (
            <button
              key={wp.id}
              onClick={() => {
                updateSetting('wallpaper', wp.id)
                pushAlert('Wallpaper updated')
              }}
              className={`relative h-[90px] rounded-lg overflow-hidden transition-all ${
                current === wp.id ? 'ring-2 ring-primary ring-offset-2 ring-offset-menu-bg' : 'ring-1 ring-white/10'
              }`}
              style={{ background: wp.css }}
            >
              {current === wp.id && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <Check size={16} className="text-white drop-shadow" />
                </div>
              )}
              <span className="absolute bottom-1 left-0 right-0 text-center font-mono text-[0.5rem] text-white/50">
                {wp.label}
              </span>
            </button>
          ))}
        </div>
      </SubPage>
    )
  }

  /* ── Personal info ──────────────────── */
  if (view === 'personal') {
    const fullName = [player.First, player.Last].filter(Boolean).join(' ') || '—'
    return (
      <SubPage title="Personal Info" onBack={() => setView('main')}>
        <InfoRow label="Name" value={fullName} />
        <InfoRow label="SID" value={String(player.SID ?? '—')} />
        <InfoRow label="Phone" value={player.Phone ?? '—'} />
        <InfoRow label="Apartment" value={player.ApartmentLabel ?? '—'} />
      </SubPage>
    )
  }

  /* ── Main menu ──────────────────────── */
  const dnd = settings.dnd === true

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="shrink-0 px-4 py-3 bg-black/30 border-b border-white/[0.06]">
        <span className="font-display font-bold uppercase tracking-[0.1em] text-[0.72rem] text-white/70">
          Settings
        </span>
      </div>
      <div className="flex-1 overflow-y-auto flex flex-col">
        {/* DND toggle */}
        <button
          onClick={() => {
            updateSetting('dnd', !dnd)
            pushAlert(dnd ? 'Do Not Disturb off' : 'Do Not Disturb on')
          }}
          className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors border-b border-white/[0.03]"
        >
          <span className={dnd ? 'text-primary' : 'text-white/40'}><BellOff size={15} /></span>
          <span className="flex-1 text-left text-[0.78rem] font-medium text-white/70">Do Not Disturb</span>
          <div
            className={`w-8 h-4 rounded-full transition-colors flex items-center px-0.5 ${
              dnd ? 'bg-primary/50' : 'bg-white/10'
            }`}
          >
            <div
              className={`w-3 h-3 rounded-full bg-white transition-transform ${
                dnd ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </div>
        </button>

        <MenuItem icon={<Volume2 size={15} />} label="Sounds" onClick={() => setView('sounds')} />
        <MenuItem icon={<Bell size={15} />} label="Notifications" onClick={() => setView('notifications')} />
        <MenuItem icon={<Image size={15} />} label="Wallpaper" onClick={() => setView('wallpaper')} />
        <MenuItem icon={<Palette size={15} />} label="Accent Color" onClick={() => setView('colors')} />
        <MenuItem icon={<User size={15} />} label="Personal Info" onClick={() => setView('personal')} />

        <div className="mt-auto px-4 py-4 flex flex-col items-center gap-0.5 border-t border-white/[0.04]">
          <span className="font-display font-bold uppercase tracking-[0.12em] text-[0.62rem] text-white/40">
            StrataPhone X
          </span>
          <span className="font-mono text-[0.55rem] text-white/25 tracking-wide">
            StrataWare 2.0
          </span>
        </div>
      </div>
    </div>
  )
}

/* ── Shared sub-components ─────────────── */

function SubPage({
  title,
  onBack,
  children,
}: {
  title: string
  onBack: () => void
  children: React.ReactNode
}): React.ReactElement {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="shrink-0 flex items-center gap-2 px-3 py-3 bg-black/30 border-b border-white/[0.06]">
        <button onClick={onBack} className="text-white/40 hover:text-white/70 transition-colors">
          <ChevronLeft size={16} />
        </button>
        <span className="font-display font-bold uppercase tracking-[0.1em] text-[0.72rem] text-white/70">
          {title}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto flex flex-col">{children}</div>
    </div>
  )
}

function MenuItem({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
}): React.ReactElement {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors border-b border-white/[0.03]"
    >
      <span className="text-white/40">{icon}</span>
      <span className="flex-1 text-left text-[0.78rem] font-medium text-white/70">{label}</span>
      <ChevronRight size={14} className="text-white/20" />
    </button>
  )
}

function SectionLabel({ label }: { label: string }): React.ReactElement {
  return (
    <div className="px-4 pt-4 pb-1.5">
      <span className="font-display font-bold uppercase tracking-[0.12em] text-[0.6rem] text-white/35">
        {label}
      </span>
    </div>
  )
}

function SelectRow({
  label,
  selected,
  onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}): React.ReactElement {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2.5 w-full hover:bg-white/[0.03] transition-colors border-b border-white/[0.03]"
    >
      <span className={`flex-1 text-left text-[0.72rem] font-medium capitalize ${selected ? 'text-primary' : 'text-white/60'}`}>
        {label}
      </span>
      {selected && <Check size={13} className="text-primary" />}
    </button>
  )
}

function InfoRow({ label, value }: { label: string; value: string }): React.ReactElement {
  return (
    <div className="flex items-center px-4 py-2.5 border-b border-white/[0.03]">
      <span className="w-[90px] shrink-0 font-mono text-[0.6rem] uppercase tracking-[0.05em] text-white/35">
        {label}
      </span>
      <span className="font-mono text-[0.68rem] text-white/70">{value}</span>
    </div>
  )
}
