import React, { useMemo, useCallback, useRef, useState } from 'react'
import { useStore } from '../store'
import AppIcon from '../components/AppIcon'
import Dock from '../components/Dock'
import Notifications from '../components/Notifications'
import { sendNui } from '../nui'
import type { PhoneApp } from '../store'

const APPS_PER_PAGE = 12 // 3 cols × 4 rows
const SWIPE_THRESHOLD = 40

export default function HomeScreen(): React.ReactElement {
  const player = useStore((s) => s.player)
  const apps = useStore((s) => s.apps)
  const openApp = useStore((s) => s.openApp)
  const pushAlert = useStore((s) => s.pushAlert)
  const page = useStore((s) => s.homePage)
  const setPage = useStore((s) => s.setHomePage)

  const [contextMenu, setContextMenu] = useState<{
    app: PhoneApp
    x: number
    y: number
  } | null>(null)

  /* Drag offset for live feedback while swiping */
  const [dragOffset, setDragOffset] = useState(0)
  const [transitioning, setTransitioning] = useState(false)

  /* Build flat list of home apps — layout order first, then any installed apps not in layout */
  const homeApps = useMemo(() => {
    const homePages = player.Apps?.home ?? []
    const installed = player.Apps?.installed ?? []
    const flat: PhoneApp[] = []
    const seen = new Set<string>()

    /* Add apps from the home layout in order */
    for (const pg of homePages) {
      for (const name of pg) {
        const app = apps[name]
        if (app && !seen.has(name)) {
          flat.push(app)
          seen.add(name)
        }
      }
    }

    /* Append any installed apps not already in the layout */
    for (const name of installed) {
      if (!seen.has(name)) {
        const app = apps[name]
        if (app) {
          flat.push(app)
          seen.add(name)
        }
      }
    }

    /* Also ensure default (non-uninstallable) apps always appear */
    for (const app of Object.values(apps)) {
      if (!app.canUninstall && !seen.has(app.name)) {
        flat.push(app)
        seen.add(app.name)
      }
    }

    return flat
  }, [player.Apps?.home, player.Apps?.installed, apps])

  /* Pagination */
  const totalPages = Math.max(1, Math.ceil(homeApps.length / APPS_PER_PAGE))
  const safePage = Math.min(page, totalPages - 1)

  /* Build pages array */
  const pages = useMemo(() => {
    const result: PhoneApp[][] = []
    for (let i = 0; i < totalPages; i++) {
      result.push(homeApps.slice(i * APPS_PER_PAGE, (i + 1) * APPS_PER_PAGE))
    }
    return result
  }, [homeApps, totalPages])

  /* Mouse drag swipe */
  const dragStartX = useRef<number | null>(null)
  const dragged = useRef(false)

  const onMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return
    dragStartX.current = e.clientX
    dragged.current = false
    setTransitioning(false)
  }

  const onMouseMove = (e: React.MouseEvent) => {
    if (dragStartX.current === null) return
    const delta = dragStartX.current - e.clientX
    setDragOffset(-delta)
  }

  const commitSwipe = (delta: number) => {
    setDragOffset(0)
    if (Math.abs(delta) > SWIPE_THRESHOLD) {
      dragged.current = true
      setTransitioning(true)
      if (delta > 0 && safePage < totalPages - 1) setPage(safePage + 1)
      else if (delta < 0 && safePage > 0) setPage(safePage - 1)
      else setTransitioning(true) // snap back
    }
  }

  const onMouseUp = (e: React.MouseEvent) => {
    if (dragStartX.current === null) return
    const delta = dragStartX.current - e.clientX
    dragStartX.current = null
    commitSwipe(delta)
  }

  const onMouseLeave = () => {
    if (dragStartX.current === null) return
    dragStartX.current = null
    setDragOffset(0)
  }

  /* Touch swipe */
  const touchStartX = useRef(0)

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    setTransitioning(false)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    const delta = touchStartX.current - e.touches[0].clientX
    setDragOffset(-delta)
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    const delta = touchStartX.current - e.changedTouches[0].clientX
    commitSwipe(delta)
  }

  /* Scroll pages (with cooldown to prevent skipping) */
  const wheelLock = useRef(false)
  const onWheel = (e: React.WheelEvent) => {
    if (wheelLock.current) return
    wheelLock.current = true
    setTimeout(() => { wheelLock.current = false }, 400)
    setTransitioning(true)
    if (e.deltaY > 0 && safePage < totalPages - 1) setPage(safePage + 1)
    if (e.deltaY < 0 && safePage > 0) setPage(safePage - 1)
  }

  /* Context menu */
  const onContextMenu = useCallback(
    (e: React.MouseEvent, app: PhoneApp) => {
      e.preventDefault()
      e.stopPropagation()
      setContextMenu({ app, x: e.clientX, y: e.clientY })
    },
    []
  )

  const closeContext = () => setContextMenu(null)

  const handleDockToggle = (app: PhoneApp) => {
    const dock = player.Apps?.dock ?? []
    const inDock = dock.includes(app.name)
    if (inDock) {
      sendNui('Dock', { app: app.name, action: 'remove' })
      pushAlert(`${app.label} removed from dock`)
    } else if (dock.length < 4) {
      sendNui('Dock', { app: app.name, action: 'add' })
      pushAlert(`${app.label} added to dock`)
    } else {
      pushAlert('Dock is full (max 4)')
    }
    closeContext()
  }

  const handleUninstall = (app: PhoneApp) => {
    if (!app.canUninstall) return
    sendNui('Uninstall', { app: app.name })
    pushAlert(`${app.label} uninstalled`)
    closeContext()
  }

  const trackX = -(safePage / totalPages) * 100 + (dragOffset / (334 * totalPages)) * 100

  return (
    <div
      className="flex-1 flex flex-col relative select-none overflow-hidden"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onWheel={onWheel}
      onClick={contextMenu ? closeContext : undefined}
    >
      {/* Sliding track — all pages side by side */}
      <div
        className="flex-1 flex min-h-0"
        style={{
          transform: `translateX(${trackX}%)`,
          transition: transitioning || dragOffset === 0 ? 'transform 0.3s ease-out' : 'none',
          width: `${totalPages * 100}%`,
        }}
        onTransitionEnd={() => setTransitioning(false)}
      >
        {pages.map((pageApps, pageIdx) => (
          <div
            key={pageIdx}
            className="px-4 pt-14 grid grid-cols-3 gap-x-2 gap-y-4 content-start"
            style={{ width: `${100 / totalPages}%` }}
          >
            {pageApps.map((app) => (
              <AppIcon
                key={app.name}
                app={app}
                onClick={() => {
                  if (dragged.current) { dragged.current = false; return }
                  openApp(app.name)
                }}
                onContextMenu={(e) => onContextMenu(e, app)}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Page dots */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 py-2 shrink-0">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => { setTransitioning(true); setPage(i) }}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                i === safePage ? 'bg-primary w-3' : 'bg-white/20'
              }`}
            />
          ))}
        </div>
      )}

      {/* Notifications — floats over the grid */}
      <Notifications />

      {/* Dock */}
      <Dock />

      {/* Context menu */}
      {contextMenu && (
        <div
          className="fixed z-[200] w-36 py-1 rounded-lg bg-menu-surface border border-white/10 shadow-xl animate-fade-in"
          style={{ left: contextMenu.x - 120, top: contextMenu.y - 10 }}
        >
          <CtxItem
            label="Open"
            onClick={() => {
              openApp(contextMenu.app.name)
              closeContext()
            }}
          />
          <CtxItem
            label={
              (player.Apps?.dock ?? []).includes(contextMenu.app.name)
                ? 'Remove from Dock'
                : 'Add to Dock'
            }
            onClick={() => handleDockToggle(contextMenu.app)}
          />
          {contextMenu.app.canUninstall && (
            <CtxItem
              label="Uninstall"
              danger
              onClick={() => handleUninstall(contextMenu.app)}
            />
          )}
        </div>
      )}
    </div>
  )
}

function CtxItem({
  label,
  onClick,
  danger,
}: {
  label: string
  onClick: () => void
  danger?: boolean
}): React.ReactElement {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-1.5 text-[0.7rem] font-medium transition-colors ${
        danger
          ? 'text-red-400/80 hover:bg-menu-error/20'
          : 'text-white/70 hover:bg-white/[0.06]'
      }`}
    >
      {label}
    </button>
  )
}
