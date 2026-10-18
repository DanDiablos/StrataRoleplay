import React, { useState, useMemo, useEffect, useRef } from 'react'
import { Mail, ChevronLeft, Trash2, MapPin, ExternalLink, MailOpen } from 'lucide-react'
import { useStore } from '../store'
import { sendNui } from '../nui'
import type { Email } from '../store'

type View = 'list' | 'detail'

export default function EmailScreen(): React.ReactElement {
  const emails = useStore((s) => s.emails)
  const dispatch = useStore((s) => s.dispatch)
  const pushAlert = useStore((s) => s.pushAlert)
  const currentRoute = useStore((s) => s.currentRoute)

  const [view, setView] = useState<View>('list')
  const [selected, setSelected] = useState<Email | null>(null)
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return emails
      .filter((e) =>
        e.subject?.toLowerCase().includes(q) ||
        e.sender?.toLowerCase().includes(q) ||
        e.body?.toLowerCase().includes(q)
      )
      .sort((a, b) => b.time - a.time)
  }, [emails, search])

  /* Auto-open email if routed from a notification (e.g. "view/123") */
  const routeHandled = useRef(false)
  useEffect(() => {
    if (routeHandled.current || !currentRoute) return
    const match = currentRoute.match(/^view\/(.+)$/)
    if (match) {
      const email = emails.find((e) => String(e.id) === match[1])
      if (email) {
        routeHandled.current = true
        openEmail(email)
      }
    }
  }, [currentRoute, emails])

  const openEmail = (e: Email) => {
    setSelected(e)
    setView('detail')
    if (e.unread) {
      sendNui('ReadEmail', { id: e.id })
      dispatch('MARK_EMAIL_READ', { id: e.id })
    }
  }

  const deleteEmail = (e: Email) => {
    sendNui('DeleteEmail', { id: e.id })
    dispatch('REMOVE_DATA', { type: 'emails', id: String(e.id) })
    pushAlert('Email deleted')
    setView('list')
    setSelected(null)
  }

  const handleGPS = (flags: Record<string, unknown>) => {
    if (flags?.location) {
      sendNui('GPSRoute', { location: flags.location })
      pushAlert('GPS waypoint set')
    }
  }

  const handleHyperlink = (e: Email) => {
    if (e.flags?.hyperlink) {
      sendNui('Hyperlink', { hyperlink: e.flags.hyperlink, id: e.id })
    }
  }

  const formatTime = (ts: number): string => {
    const d = new Date(ts * 1000)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' +
      d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
  }

  /* ── Detail view ────────────────────── */
  if (view === 'detail' && selected) {
    return (
      <div className="flex-1 flex flex-col min-h-0">
        <div className="shrink-0 flex items-center gap-2 px-3 py-3 bg-black/30 border-b border-white/[0.06]">
          <button onClick={() => setView('list')} className="text-white/40 hover:text-white/70 transition-colors">
            <ChevronLeft size={16} />
          </button>
          <span className="font-display font-bold uppercase tracking-[0.1em] text-[0.72rem] text-white/70 truncate flex-1">
            Email
          </span>
          <button onClick={() => deleteEmail(selected)} className="text-white/25 hover:text-red-400/60 transition-colors">
            <Trash2 size={13} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
          {/* Subject */}
          <h2 className="text-[0.85rem] font-medium text-white/90 leading-snug">{selected.subject}</h2>

          {/* Sender & time */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#10909c]/30 flex items-center justify-center shrink-0">
              <Mail size={12} className="text-[#10909c]" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[0.68rem] font-medium text-white/70 truncate block">{selected.sender}</span>
              <span className="font-mono text-[0.55rem] text-white/30">{formatTime(selected.time)}</span>
            </div>
          </div>

          {/* Body */}
          <div className="bg-white/[0.02] rounded-lg p-3 border border-white/[0.04]">
            <p className="text-[0.72rem] text-white/65 leading-relaxed whitespace-pre-wrap break-words">
              {selected.body}
            </p>
          </div>

          {/* Action buttons */}
          {selected.flags && (
            <div className="flex flex-col gap-1.5">
              {'location' in selected.flags && selected.flags.location != null && (
                <button
                  onClick={() => handleGPS(selected.flags!)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-primary/10 border border-primary/20 text-[0.72rem] font-medium text-primary/80 hover:bg-primary/15 transition-colors"
                >
                  <MapPin size={13} />
                  Set GPS Waypoint
                </button>
              )}
              {'hyperlink' in selected.flags && selected.flags.hyperlink != null && (
                <button
                  onClick={() => handleHyperlink(selected)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[0.72rem] font-medium text-white/60 hover:bg-white/[0.06] transition-colors"
                >
                  <ExternalLink size={13} />
                  Open Link
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  /* ── List view ──────────────────────── */
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="shrink-0 px-4 py-3 bg-black/30 border-b border-white/[0.06]">
        <span className="font-display font-bold uppercase tracking-[0.1em] text-[0.72rem] text-white/70">Email</span>
      </div>

      <div className="shrink-0 px-3 py-2">
        <div className="relative">
          <Mail size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/25" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search emails..."
            className="w-full h-8 pl-8 pr-3 bg-white/[0.04] border border-white/[0.06] rounded-lg text-[0.75rem] text-white/80 placeholder-white/25 focus:border-primary/40 transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col">
        {filtered.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2">
            <Mail size={28} className="text-white/20" />
            <span className="font-mono text-[0.65rem] text-white/20 uppercase tracking-[0.08em]">No emails</span>
          </div>
        ) : (
          filtered.map((e) => (
            <button
              key={e.id}
              onClick={() => openEmail(e)}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.04] transition-colors border-b border-white/[0.03] text-left"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${e.unread ? 'bg-[#10909c]/25' : 'bg-white/[0.04]'}`}>
                {e.unread ? (
                  <Mail size={13} className="text-[#10909c]" />
                ) : (
                  <MailOpen size={13} className="text-white/25" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[0.68rem] font-medium truncate ${e.unread ? 'text-white/90' : 'text-white/55'}`}>
                    {e.sender}
                  </span>
                  <span className="font-mono text-[0.5rem] text-white/25 shrink-0">{formatTime(e.time)}</span>
                </div>
                <span className={`text-[0.68rem] truncate block ${e.unread ? 'text-white/70' : 'text-white/40'}`}>
                  {e.subject}
                </span>
                <span className="text-[0.58rem] text-white/25 truncate block">{e.body}</span>
              </div>
              {e.unread && <div className="w-1.5 h-1.5 rounded-full bg-[#10909c] shrink-0" />}
            </button>
          ))
        )}
      </div>
    </div>
  )
}
