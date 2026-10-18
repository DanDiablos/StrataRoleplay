import React, { useState, useEffect, useRef } from 'react'
import { X, ChevronRight } from 'lucide-react'
import { useStore } from '../store'
import { sendNui } from '../nui'
import { getAppIcon } from '../appIcons'

export default function Notifications(): React.ReactElement | null {
  const notifications = useStore((s) => s.notifications)
  const apps = useStore((s) => s.apps)
  const dispatch = useStore((s) => s.dispatch)
  const openApp = useStore((s) => s.openApp)

  const [hiding, setHiding] = useState<Set<string>>(new Set())
  const [leavingAll, setLeavingAll] = useState(false)
  const prevCount = useRef(0)

  const visible = notifications.filter((n) => n.show && !hiding.has(n.id))

  /* Track when visible goes to 0 to allow fade-out to finish */
  const [rendered, setRendered] = useState(false)
  useEffect(() => {
    if (visible.length > 0) {
      setRendered(true)
      prevCount.current = visible.length
    }
  }, [visible.length])

  if (visible.length === 0 && !leavingAll) {
    if (rendered) setRendered(false)
    return null
  }

  const dismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const notif = visible.find((n) => n.id === id)
    if (notif?.persistent) return
    if (visible.filter((n) => !n.persistent).length === 1) {
      // Last dismissable one — fade entire panel only if no persistent remain
      if (visible.length === 1) {
        setLeavingAll(true)
        setTimeout(() => {
          dispatch('NOTIF_HIDE', { id })
          setLeavingAll(false)
        }, 200)
      } else {
        setHiding((s) => new Set(s).add(id))
        setTimeout(() => {
          dispatch('NOTIF_HIDE', { id })
          setHiding((s) => { const next = new Set(s); next.delete(id); return next })
        }, 200)
      }
    } else {
      setHiding((s) => new Set(s).add(id))
      setTimeout(() => {
        dispatch('NOTIF_HIDE', { id })
        setHiding((s) => { const next = new Set(s); next.delete(id); return next })
      }, 200)
    }
  }

  const dismissAll = (e: React.MouseEvent) => {
    e.stopPropagation()
    const dismissable = visible.filter((n) => !n.persistent)
    if (dismissable.length === 0) return
    setLeavingAll(true)
    setTimeout(() => {
      for (const n of dismissable) dispatch('NOTIF_HIDE', { id: n.id })
      setLeavingAll(false)
    }, 200)
  }

  const handleTap = (notif: (typeof visible)[0]) => {
    if (notif.persistent) return
    const action = notif.action as Record<string, unknown> | undefined
    if (action?.view && typeof action.view === 'string') {
      openApp(notif.app, action.view)
    } else if (action && Array.isArray(action) && action.length > 0) {
      sendNui((action[0] as { event: string }).event)
    } else if (notif.app) {
      openApp(notif.app)
    }
    dispatch('NOTIF_HIDE', { id: notif.id })
  }

  const shown = leavingAll ? notifications.filter((n) => n.show) : visible

  return (
    <div
      className={`absolute top-0 left-0 right-0 z-30 flex flex-col pointer-events-none transition-all duration-200 ${
        leavingAll ? 'opacity-0 -translate-y-2' : 'opacity-100 translate-y-0'
      }`}
    >
      {/* Notification cards */}
      <div className="flex flex-col gap-1 px-3 pt-2 pb-2 pointer-events-auto">
        {shown.slice(0, 4).map((notif) => {
          const appLabel = apps[notif.app]?.label ?? notif.app
          const isHiding = hiding.has(notif.id)
          return (
            <div
              key={notif.id}
              onClick={() => handleTap(notif)}
              className={`flex items-center gap-2.5 px-2.5 py-2 cursor-pointer bg-[rgba(10,10,10,0.92)] border border-white/[0.08] hover:bg-[rgba(20,20,20,0.95)] transition-all duration-200 ${
                isHiding ? 'opacity-0 -translate-x-4 max-h-0 py-0 my-0 border-transparent overflow-hidden' : 'opacity-100 translate-x-0 max-h-20'
              }`}
            >
              {/* App icon */}
              {(() => { const AppIcon = getAppIcon(notif.app); return (
              <div
                className="w-7 h-7 flex items-center justify-center shrink-0"
                style={{ background: (apps[notif.app]?.color ?? '#333') + '25' }}
              >
                <AppIcon size={11} style={{ color: apps[notif.app]?.color ?? '#666' }} />
              </div>
              ) })()}

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[0.6rem] font-medium text-white/40 uppercase tracking-wide">
                    {appLabel}
                  </span>
                </div>
                <p className="text-[0.68rem] font-medium text-white/80 truncate leading-tight mt-0.5">
                  {notif.title}
                </p>
                {notif.description && (
                  <p className="text-[0.58rem] text-white/35 truncate leading-tight mt-0.5">
                    {notif.description}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                {notif.persistent ? null : notif.action && (('view' in notif.action) || (Array.isArray(notif.action) && notif.action.length > 0)) ? (
                  <ChevronRight size={12} className="text-white/20" />
                ) : (
                  <button
                    onClick={(e) => dismiss(notif.id, e)}
                    className="w-5 h-5 flex items-center justify-center bg-white/[0.06] border border-white/10 text-white/40 hover:text-white/70 hover:bg-white/10 transition-colors"
                  >
                    <X size={10} />
                  </button>
                )}
              </div>
            </div>
          )
        })}

        {/* Overflow indicator */}
        {shown.length > 4 && (
          <span className="text-center text-[0.52rem] text-white/20 font-mono uppercase tracking-wider py-0.5">
            +{shown.length - 4} more
          </span>
        )}

        {/* Clear all */}
        {shown.length > 1 && (
          <button
            onClick={dismissAll}
            className="self-center text-[0.55rem] font-medium text-white/60 hover:text-primary uppercase tracking-wider transition-colors py-1.5 px-3 bg-[rgba(10,10,10,0.92)] border border-white/[0.08]"
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  )
}
