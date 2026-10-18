import React, { useState, useEffect, useMemo } from 'react'
import { Phone, PhoneOff, PhoneIncoming, PhoneCall, Delete, Clock, ChevronLeft, User } from 'lucide-react'
import { useStore } from '../store'
import { sendNui } from '../nui'

type View = 'dialer' | 'history'

interface CallRecord {
  id?: number
  owner: string
  number: string
  time: number
  duration: number
  method: boolean | number
  limited?: boolean
  anonymous?: boolean
  unread?: boolean
}

export default function PhoneScreen(): React.ReactElement {
  const call = useStore((s) => s.call)
  const contacts = useStore((s) => s.contacts)
  const player = useStore((s) => s.player)

  const [view, setView] = useState<View>('dialer')
  const [dialNumber, setDialNumber] = useState('')

  const callHistory = (player.calls ?? []) as unknown as CallRecord[]

  /* If there's an active/incoming/pending call, show the call UI */
  if (call.status !== 'idle') {
    return <CallOverlay />
  }

  const contactName = (number: string): string => {
    const c = (contacts as { name: string; number: string }[]).find((c) => c.number === number)
    return c?.name ?? number
  }

  const handleDial = () => {
    if (!dialNumber.trim()) return
    sendNui('CreateCall', { number: dialNumber.trim() })
  }

  const handleDigit = (d: string) => setDialNumber((n) => n + d)
  const handleDelete = () => setDialNumber((n) => n.slice(0, -1))

  const formatDuration = (d: number): string => {
    if (d < 0) return 'Missed'
    if (d === 0) return 'No answer'
    const m = Math.floor(d / 60)
    const s = d % 60
    return `${m}:${String(s).padStart(2, '0')}`
  }

  const formatTime = (ts: number): string => {
    const d = new Date(ts * 1000)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' +
      d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
  }

  /* ── History view ───────────────────── */
  if (view === 'history') {
    return (
      <div className="flex-1 flex flex-col min-h-0">
        <div className="shrink-0 flex items-center gap-2 px-3 py-3 bg-black/30 border-b border-white/[0.06]">
          <button onClick={() => setView('dialer')} className="text-white/40 hover:text-white/70 transition-colors">
            <ChevronLeft size={16} />
          </button>
          <span className="font-display font-bold uppercase tracking-[0.1em] text-[0.72rem] text-white/70">
            Call History
          </span>
        </div>
        <div className="flex-1 overflow-y-auto flex flex-col">
          {callHistory.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2">
              <Clock size={28} className="text-white/20" />
              <span className="font-mono text-[0.65rem] text-white/20 uppercase tracking-[0.08em]">No calls</span>
            </div>
          ) : (
            callHistory.map((c, i) => {
              const outgoing = c.method === true || c.method === 1
              const missed = !outgoing && c.duration < 0
              return (
                <button
                  key={c.id ?? i}
                  onClick={() => {
                    setDialNumber(c.number)
                    setView('dialer')
                  }}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.03] transition-colors border-b border-white/[0.03]"
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${missed ? 'bg-menu-error/20' : 'bg-white/[0.06]'}`}>
                    {outgoing ? (
                      <PhoneCall size={12} className="text-white/40" />
                    ) : missed ? (
                      <PhoneOff size={12} className="text-red-400/70" />
                    ) : (
                      <PhoneIncoming size={12} className="text-menu-success/70" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <span className={`text-[0.72rem] font-medium truncate block ${missed ? 'text-red-400/80' : 'text-white/70'}`}>
                      {c.anonymous ? 'Unknown' : contactName(c.number)}
                    </span>
                    <span className="font-mono text-[0.55rem] text-white/30">
                      {formatTime(c.time)} · {formatDuration(c.duration)}
                    </span>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>
    )
  }

  /* ── Dialer view ────────────────────── */
  const DIGITS = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['*', '0', '#'],
  ]

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between px-4 py-3 bg-black/30 border-b border-white/[0.06]">
        <span className="font-display font-bold uppercase tracking-[0.1em] text-[0.72rem] text-white/70">
          Phone
        </span>
        <button onClick={() => { sendNui('ReadCalls'); setView('history') }} className="text-white/40 hover:text-white/60 transition-colors">
          <Clock size={14} />
        </button>
      </div>

      {/* Display */}
      <div className="px-4 py-5 flex items-center justify-center min-h-[60px]">
        <span className="font-mono text-[1.4rem] text-white/90 tracking-wider">
          {dialNumber || '\u00A0'}
        </span>
      </div>

      {/* Digit grid */}
      <div className="flex-1 flex flex-col gap-1 px-6">
        {DIGITS.map((row, ri) => (
          <div key={ri} className="flex-1 flex gap-1">
            {row.map((d) => (
              <button
                key={d}
                onClick={() => handleDigit(d)}
                className="flex-1 flex items-center justify-center rounded-xl text-[1.1rem] font-medium text-white/80 bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.12] transition-colors"
              >
                {d}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Action row */}
      <div className="shrink-0 flex items-center justify-center gap-6 py-4">
        <button
          onClick={handleDelete}
          className="w-10 h-10 flex items-center justify-center rounded-full text-white/40 hover:text-white/60 transition-colors"
        >
          <Delete size={18} />
        </button>
        <button
          onClick={handleDial}
          className="w-14 h-14 flex items-center justify-center rounded-full bg-[#21a500] hover:bg-[#21a500]/80 transition-colors"
        >
          <Phone size={22} className="text-white" />
        </button>
        <div className="w-10 h-10" />
      </div>
    </div>
  )
}

/* ── Call overlay (pending / incoming / active) ── */

function CallOverlay(): React.ReactElement {
  const call = useStore((s) => s.call)
  const contacts = useStore((s) => s.contacts)
  const [elapsed, setElapsed] = useState(0)

  const contactName = useMemo(() => {
    if (call.limited) return 'Unknown'
    const c = (contacts as { name: string; number: string }[]).find((c) => c.number === call.number)
    return c?.name ?? call.number
  }, [contacts, call.number, call.limited])

  useEffect(() => {
    if (call.status !== 'active' || !call.startTime) return
    const iv = setInterval(() => {
      setElapsed(Math.floor((Date.now() - call.startTime) / 1000))
    }, 1000)
    return () => clearInterval(iv)
  }, [call.status, call.startTime])

  const timeStr = `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, '0')}`

  const statusLabel =
    call.status === 'pending' ? 'Calling...' :
    call.status === 'incoming' ? 'Incoming Call' :
    timeStr

  return (
    <div className="flex-1 flex flex-col items-center justify-between py-10">
      {/* Caller info */}
      <div className="flex flex-col items-center gap-3">
        <div className="w-20 h-20 rounded-full bg-white/[0.06] flex items-center justify-center">
          <User size={36} className="text-white/30" />
        </div>
        <span className="text-[1rem] font-medium text-white/90">{contactName}</span>
        <span className={`font-mono text-[0.72rem] ${call.status === 'active' ? 'text-primary' : 'text-white/40'}`}>
          {statusLabel}
        </span>
        {call.status === 'pending' && (
          <div className="flex gap-1 mt-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"
                style={{ animationDelay: `${i * 0.3}s` }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-6">
        {call.status === 'incoming' && (
          <button
            onClick={() => sendNui('AcceptCall')}
            className="w-14 h-14 flex items-center justify-center rounded-full bg-[#21a500] hover:bg-[#21a500]/80 transition-colors"
          >
            <Phone size={22} className="text-white" />
          </button>
        )}
        <button
          onClick={() => sendNui('EndCall')}
          className="w-14 h-14 flex items-center justify-center rounded-full bg-[#e02424] hover:bg-[#e02424]/80 transition-colors"
        >
          <PhoneOff size={22} className="text-white" />
        </button>
      </div>
    </div>
  )
}
