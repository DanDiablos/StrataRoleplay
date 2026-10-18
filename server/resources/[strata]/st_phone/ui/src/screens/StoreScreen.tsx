import React, { useMemo, useState } from 'react'
import { Download, Trash2, Search, Package } from 'lucide-react'
import { useStore } from '../store'
import { sendNui } from '../nui'

export default function StoreScreen(): React.ReactElement {
  const apps = useStore((s) => s.apps)
  const player = useStore((s) => s.player)
  const pushAlert = useStore((s) => s.pushAlert)
  const [search, setSearch] = useState('')

  const installed = player.Apps?.installed ?? []

  const storeApps = useMemo(() => {
    const q = search.toLowerCase()
    return Object.values(apps)
      .filter((a) => a.canUninstall) // only show apps that can be managed
      .filter((a) => a.label.toLowerCase().includes(q) || a.name.toLowerCase().includes(q))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [apps, search])

  const handleInstall = (name: string) => {
    sendNui('Install', { app: name })
    pushAlert('App installed')
  }

  const handleUninstall = (name: string) => {
    sendNui('Uninstall', { app: name })
    pushAlert('App uninstalled')
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="shrink-0 px-4 py-3 bg-black/30 border-b border-white/[0.06]">
        <span className="font-display font-bold uppercase tracking-[0.1em] text-[0.72rem] text-white/70">
          App Store
        </span>
      </div>

      {/* Search */}
      <div className="shrink-0 px-3 py-2">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/25" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search apps..."
            className="w-full h-8 pl-8 pr-3 bg-white/[0.04] border border-white/[0.06] rounded-lg text-[0.75rem] text-white/80 placeholder-white/25 focus:border-primary/40 transition-colors"
          />
        </div>
      </div>

      {/* App list */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        {storeApps.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2">
            <Package size={28} className="text-white/20" />
            <span className="font-mono text-[0.65rem] text-white/20 uppercase tracking-[0.08em]">
              No apps found
            </span>
          </div>
        ) : (
          storeApps.map((app) => {
            const isInstalled = installed.includes(app.name)
            return (
              <div
                key={app.name}
                className="flex items-center gap-3 px-4 py-2.5 border-b border-white/[0.03]"
              >
                {/* Icon */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: app.color }}
                >
                  <span className="text-white text-[0.65rem] font-bold">{app.label[0]}</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <span className="text-[0.75rem] font-medium text-white/80 truncate block">
                    {app.storeLabel ?? app.label}
                  </span>
                  <span className="font-mono text-[0.58rem] text-white/30">{app.name}</span>
                </div>

                {/* Action */}
                {isInstalled ? (
                  <button
                    onClick={() => handleUninstall(app.name)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-menu-error-lt/30 bg-menu-error/10 text-red-400/60 hover:text-red-400 hover:bg-menu-error/20 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                ) : (
                  <button
                    onClick={() => handleInstall(app.name)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary/70 hover:text-primary hover:bg-primary/20 transition-colors"
                  >
                    <Download size={13} />
                  </button>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
