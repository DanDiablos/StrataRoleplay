import React, { useState, useEffect, useMemo } from 'react'
import { Phone, PhoneOff, PhoneIncoming, User, ChevronRight, X } from 'lucide-react'
import { useStore } from '../store'
import { sendNui } from '../nui'
import { getAppIcon } from '../appIcons'

export default function PeekBanner(): React.ReactElement | null {
  const call = useStore((s) => s.call)
  const peekNotif = useStore((s) => s.peekNotif)

  const hasCall = call.status !== 'idle'
  const hasNotif = peekNotif !== null

  if (!hasCall && !hasNotif) return null

  /* Call takes priority */
  if (hasCall) return <CallBannerInner />

  return <NotifBannerInner />
}

/* ── Notification banner ────────────────────────────── */

function NotifBannerInner(): React.ReactElement | null {
  const peekNotif = useStore((s) => s.peekNotif)
  const apps = useStore((s) => s.apps)
  const dispatch = useStore((s) => s.dispatch)

  if (!peekNotif) return null

  const appLabel = apps[peekNotif.app]?.label ?? peekNotif.app

  const handleTap = () => {
    if (peekNotif.persistent) return
    const action = peekNotif.action as Record<string, unknown> | undefined
    if (action && Array.isArray(action) && action.length > 0) {
      sendNui((action[0] as { event: string }).event)
    }
    dispatch('NOTIF_HIDE', { id: peekNotif.id })
  }

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (peekNotif.persistent) return
    dispatch('NOTIF_HIDE', { id: peekNotif.id })
  }

  return (
    <div className="absolute top-7 left-0 right-0 z-50 px-3 pt-1.5 animate-fade-in">
      <div
        onClick={handleTap}
        className="flex items-center gap-2.5 pl-3 pr-2 py-2.5 cursor-pointer"
        style={{
          background: 'rgba(10,10,10,0.92)',
          border: `1px solid rgba(255,255,255,0.08)`,
        }}
      >
        {/* App icon */}
        {(() => { const AppIcon = getAppIcon(peekNotif.app); const color = apps[peekNotif.app]?.color ?? '#666'; return (
        <div
          className="w-8 h-8 flex items-center justify-center shrink-0"
          style={{
            background: color + '20',
            border: `1px solid ${color}30`,
          }}
        >
          <AppIcon size={14} style={{ color }} />
        </div>
        ) })()}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[0.55rem] font-medium text-white/35 uppercase tracking-wide">{appLabel}</span>
            {peekNotif.persistent && (
              <span className="text-[0.45rem] font-mono text-primary/60 uppercase tracking-wider">Active</span>
            )}
          </div>
          <p className="text-[0.72rem] font-medium text-white/90 truncate leading-tight mt-0.5">
            {peekNotif.title}
          </p>
          {peekNotif.description && (
            <p className="text-[0.55rem] text-white/35 truncate leading-tight mt-0.5">
              {peekNotif.description}
            </p>
          )}
        </div>

        {/* Action */}
        {peekNotif.persistent ? null : peekNotif.action && (('view' in peekNotif.action) || (Array.isArray(peekNotif.action) && peekNotif.action.length > 0)) ? (
          <ChevronRight size={14} className="text-white/20 shrink-0" />
        ) : (
          <button
            onClick={handleDismiss}
            className="w-6 h-6 flex items-center justify-center bg-white/[0.06] border border-white/10 text-white/40 hover:text-white/70 hover:bg-white/10 transition-colors shrink-0"
          >
            <X size={12} />
          </button>
        )}
      </div>
    </div>
  )
}

/* ── Call banner ────────────────────────────────────── */

function CallBannerInner(): React.ReactElement {
  const call = useStore((s) => s.call)
  const contacts = useStore((s) => s.contacts)
  const [elapsed, setElapsed] = useState(0)

  const contactName = useMemo(() => {
    if (call.limited) return 'Unknown'
    const c = (contacts as { name: string; number: string }[]).find((c) => c.number === call.number)
    return c?.name ?? call.number
  }, [contacts, call.number, call.limited])

  useEffect(() => {
    if (call.status !== 'active' || !call.startTime) { setElapsed(0); return }
    const iv = setInterval(() => {
      setElapsed(Math.floor((Date.now() - call.startTime) / 1000))
    }, 1000)
    return () => clearInterval(iv)
  }, [call.status, call.startTime])

  const timeStr = `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, '0')}`
  const isIncoming = call.status === 'incoming'
  const isActive = call.status === 'active'
  const isPending = call.status === 'pending'

  return (
    <div className="absolute top-7 left-0 right-0 z-50 px-3 pt-1.5 animate-fade-in">
      <div
        className="flex items-center gap-2.5 pl-3 pr-2 py-2.5 border relative"
        style={{
          background: isIncoming ? 'rgba(10,10,10,0.95)' : 'rgba(10,10,10,0.92)',
          borderColor: isIncoming ? 'rgba(46,204,113,0.35)' : 'rgba(255,255,255,0.08)',
          boxShadow: isIncoming ? '0 0 20px rgba(46,204,113,0.08)' : 'none',
        }}
      >
        <div
          className="w-8 h-8 flex items-center justify-center shrink-0"
          style={{
            background: isIncoming ? 'rgba(46,204,113,0.12)' : 'rgba(255,255,255,0.05)',
            border: isIncoming ? '1px solid rgba(46,204,113,0.25)' : '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {isIncoming ? (
            <PhoneIncoming size={14} className="text-[#2ecc71]" />
          ) : (
            <User size={14} className="text-white/40" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[0.72rem] font-medium text-white/90 truncate">{contactName}</p>
          <p className="font-mono text-[0.55rem] text-white/40 mt-0.5">
            {isIncoming && 'Incoming call'}
            {isPending && 'Calling...'}
            {isActive && <span className="text-primary">{timeStr}</span>}
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {isIncoming && (
            <button
              onClick={() => sendNui('AcceptCall')}
              className="w-7 h-7 flex items-center justify-center bg-[#2ecc71]/20 border border-[#2ecc71]/30 text-[#2ecc71] hover:bg-[#2ecc71]/30 transition-colors"
            >
              <Phone size={13} />
            </button>
          )}
          <button
            onClick={() => sendNui('EndCall')}
            className="w-7 h-7 flex items-center justify-center bg-[#e02424]/20 border border-[#e02424]/30 text-[#e74c3c] hover:bg-[#e02424]/30 transition-colors"
          >
            <PhoneOff size={13} />
          </button>
        </div>

        {isIncoming && (
          <div className="absolute inset-0 border border-[#2ecc71]/20 animate-ping pointer-events-none" />
        )}
      </div>
    </div>
  )
}
