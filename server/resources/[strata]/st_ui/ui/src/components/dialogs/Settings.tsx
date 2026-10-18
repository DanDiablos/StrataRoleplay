import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { useStore } from '../../store.ts'
import { sendNui } from '../../nui.ts'
import type { HudConfig } from '../../store.ts'

export default function Settings(): React.ReactElement | null {
  const settingsOpen = useStore(s => s.settingsOpen)
  const config = useStore(s => s.config)
  const dispatch = useStore(s => s.dispatch)

  const [local, setLocal] = useState<HudConfig>({ ...config })
  const [mounted, setMounted] = useState(false)
  const [hiding, setHiding] = useState(false)

  useEffect(() => {
    if (settingsOpen) {
      setLocal({ ...config })
      setHiding(false)
      setMounted(true)
    }
  }, [settingsOpen, config])

  useEffect(() => {
    if (!mounted || hiding) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [mounted, hiding])

  if (!mounted) return null

  const doClose = () => {
    setHiding(true)
    setTimeout(() => {
      setMounted(false)
      setHiding(false)
      sendNui('CloseUI')
      dispatch('TOGGLE_SETTINGS', { state: false })
    }, 150)
  }

  const handleClose = () => doClose()

  const handleSave = () => {
    sendNui('SaveConfig', { ...local })
    dispatch('SET_CONFIG', { config: local })
    doClose()
  }

  const update = <K extends keyof HudConfig>(key: K, value: HudConfig[K]) => {
    setLocal(prev => ({ ...prev, [key]: value }))
  }

  return createPortal(
    <div className={`fixed inset-0 flex items-center justify-center ${hiding ? 'animate-fade-out' : 'animate-fade-in'}`} style={{ zIndex: 150 }}>
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      <div
        className="relative w-[520px] flex flex-col border border-white/[0.08]"
        style={{ background: 'rgba(10,10,10,0.95)', boxShadow: '0 8px 32px rgba(0,0,0,0.7)' }}
      >
        {/* Left accent */}
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary" />

        {/* Header */}
        <div className="flex items-center justify-between px-4 pl-5 h-[52px] bg-menu-surface-lt border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <span
              className="font-display font-black tracking-[0.1em] text-[0.82rem]"
              style={{
                background: 'linear-gradient(90deg, #FF5C3A, #FF8C42)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              STRATA
            </span>
            <span className="font-mono text-[0.68rem] text-white/30">/ HUD Settings</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white/20 text-[0.6rem] uppercase tracking-wider font-mono">ESC</span>
            <button
              onClick={handleClose}
              className="w-7 h-7 flex items-center justify-center border border-white/10 bg-white/[0.03] text-white/30 hover:text-[#FE2436] hover:border-[#FE2436]/40 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 pl-5 flex flex-col gap-3.5 max-h-[70vh] overflow-y-auto">
          {/* Status Layout */}
          <SettingsSection title="Status Layout">
            <SettingsSelect
              label="Layout"
              value={local.layout}
              onChange={v => update('layout', v)}
              options={[{ value: 'default', label: 'Default' }]}
            />
            <SettingsSelect
              label="Status Type"
              value={local.statusType}
              onChange={v => update('statusType', v)}
              options={[
                { value: 'bars', label: 'Bars' },
                { value: 'circles', label: 'Circles' },
              ]}
            />
          </SettingsSection>

          {/* Compass */}
          <SettingsSection title="Compass">
            <SettingsCheckbox
              label="Hide Compass Background"
              checked={local.hideCompassBg}
              onChange={v => update('hideCompassBg', v)}
            />
            <SettingsCheckbox
              label="Hide Cross Street"
              checked={local.hideCrossStreet}
              onChange={v => update('hideCrossStreet', v)}
            />
          </SettingsSection>

          {/* General */}
          <SettingsSection title="General">
            <SettingsCheckbox
              label="Mask Radio Channel"
              checked={local.maskRadio}
              onChange={v => update('maskRadio', v)}
            />
          </SettingsSection>

          {/* Vehicle */}
          <SettingsSection title="Vehicle">
            <SettingsSelect
              label="Vehicle Layout"
              value={local.vehicle}
              onChange={v => update('vehicle', v)}
              options={[{ value: 'wurk', label: 'Wurk' }]}
            />
          </SettingsSection>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-4 pl-5 py-3 border-t border-white/[0.06]">
          <button
            onClick={handleClose}
            className="px-[14px] py-[5px] border text-[0.8rem] font-semibold border-white/10 bg-white/[0.04] text-white/60 hover:bg-primary/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-[14px] py-[5px] border text-[0.8rem] font-semibold border-primary/35 bg-primary/8 text-[#FF8C42] hover:bg-primary/15 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }): React.ReactElement {
  return (
    <div className="bg-white/[0.02] border border-white/[0.06]">
      <div className="px-3 py-2 border-b border-white/[0.06]">
        <span className="font-display font-bold uppercase tracking-[0.12em] text-[0.72rem] text-white/40">
          {title}
        </span>
      </div>
      <div className="px-3 py-1.5 flex flex-col">
        {children}
      </div>
    </div>
  )
}

function SettingsSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}): React.ReactElement {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const close = () => setOpen(false)
    window.addEventListener('mousedown', close)
    return () => window.removeEventListener('mousedown', close)
  }, [open])

  const selected = options.find(o => o.value === value)

  return (
    <div className="flex items-center justify-between px-3 py-[9px] border-b border-white/[0.04] last:border-0">
      <span className="font-mono text-[0.68rem] text-white/40 uppercase tracking-[0.05em]">{label}</span>
      <div className="relative" onMouseDown={e => e.stopPropagation()}>
        <button
          onClick={() => setOpen(!open)}
          className="h-7 px-2.5 flex items-center gap-2 bg-white/[0.03] border border-white/10 text-[0.78rem] text-white/70 hover:border-primary/50 transition-colors"
        >
          <span>{selected?.label ?? value}</span>
          <span className="text-white/30 text-[0.55rem]">&#9662;</span>
        </button>
        {open && (
          <div
            className="absolute right-0 top-full mt-1 min-w-[120px] border border-white/[0.08]"
            style={{ background: 'rgba(15,15,15,0.98)', zIndex: 10 }}
          >
            {options.map(o => (
              <div
                key={o.value}
                onClick={() => { onChange(o.value); setOpen(false) }}
                className={`px-3 py-1.5 text-[0.78rem] cursor-pointer transition-colors border-b border-white/[0.04] last:border-0 ${
                  o.value === value ? 'text-primary bg-primary/8' : 'text-white/70 hover:bg-primary/10'
                }`}
              >
                {o.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function SettingsCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}): React.ReactElement {
  return (
    <label className="flex items-center justify-between px-3 py-[9px] border-b border-white/[0.04] last:border-0 cursor-pointer">
      <span className="font-mono text-[0.68rem] text-white/40 uppercase tracking-[0.05em]">{label}</span>
      <div
        onClick={() => onChange(!checked)}
        className={`w-8 h-4 rounded-full relative transition-colors cursor-pointer ${
          checked ? 'bg-primary/40' : 'bg-white/10'
        }`}
      >
        <div
          className={`absolute top-0.5 w-3 h-3 rounded-full transition-all ${
            checked ? 'left-[18px] bg-primary' : 'left-0.5 bg-white/30'
          }`}
        />
      </div>
    </label>
  )
}
