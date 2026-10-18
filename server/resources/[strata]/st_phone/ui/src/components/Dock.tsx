import React from 'react'
import { useStore } from '../store'
import AppIcon from './AppIcon'

export default function Dock(): React.ReactElement {
  const player = useStore((s) => s.player)
  const apps = useStore((s) => s.apps)
  const openApp = useStore((s) => s.openApp)

  const dockApps = (player.Apps?.dock ?? [])
    .map((name) => apps[name])
    .filter(Boolean)

  if (dockApps.length === 0) return <></>

  return (
    <div className="shrink-0 mx-3 mb-2 px-3 py-2 rounded-2xl bg-white/[0.06] backdrop-filter-none flex items-center justify-around">
      {dockApps.map((app) => (
        <AppIcon
          key={app.name}
          app={app}
          size="dock"
          onClick={() => openApp(app.name)}
        />
      ))}
    </div>
  )
}
