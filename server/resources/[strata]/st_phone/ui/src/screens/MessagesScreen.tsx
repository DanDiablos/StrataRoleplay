import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Search, ChevronLeft, Send, MessageSquare, Plus, Trash2 } from 'lucide-react'
import { useStore } from '../store'
import { sendNui } from '../nui'
import type { MessageThread, Message } from '../store'

type View = 'threads' | 'convo' | 'new'

export default function MessagesScreen(): React.ReactElement {
  const threads = useStore((s) => s.messageThreads)
  const storedMessages = useStore((s) => s.messages)
  const contacts = useStore((s) => s.contacts)
  const player = useStore((s) => s.player)
  const dispatch = useStore((s) => s.dispatch)
  const pushAlert = useStore((s) => s.pushAlert)

  const currentRoute = useStore((s) => s.currentRoute)

  const [view, setView] = useState<View>('threads')
  const [search, setSearch] = useState('')
  const [activeNumber, setActiveNumber] = useState('')
  const [convoMessages, setConvoMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const routeHandled = useRef(false)

  const myPhone = player.Phone ?? ''

  const contactName = (number: string): string => {
    const c = (contacts as { name: string; number: string }[]).find((c) => c.number === number)
    return c?.name ?? number
  }

  /* Load threads on mount */
  useEffect(() => {
    sendNui('Messages:InitLoad').then(() => setLoading(false))
  }, [])

  /* Auto-open conversation if routed from a notification (e.g. "convo/555-123-4567") */
  useEffect(() => {
    if (routeHandled.current || !currentRoute) return
    const match = currentRoute.match(/^convo\/(.+)$/)
    if (match) {
      routeHandled.current = true
      openConvo(match[1])
    }
  }, [currentRoute])

  /* Merge server-pushed messages into convo */
  useEffect(() => {
    const pushed = storedMessages[activeNumber]
    if (pushed && pushed.length > 0) {
      setConvoMessages((prev) => {
        const ids = new Set(prev.map((m) => m.id))
        const fresh = pushed.filter((m) => !ids.has(m.id))
        return [...prev, ...fresh]
      })
    }
  }, [storedMessages, activeNumber])

  /* Scroll to bottom on new messages */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [convoMessages])

  const filteredThreads = useMemo(() => {
    const q = search.toLowerCase()
    return threads
      .filter((t) => {
        const name = contactName(t.number).toLowerCase()
        return name.includes(q) || t.number.includes(q) || t.message.toLowerCase().includes(q)
      })
      .sort((a, b) => b.time - a.time)
  }, [threads, search, contacts])

  const openConvo = async (number: string) => {
    setActiveNumber(number)
    setView('convo')
    setConvoMessages([])
    sendNui('ReadConvo', { number })
    dispatch('MARK_THREAD_READ', { number })
    try {
      const res = await sendNui('Messages:LoadTexts', { number, offset: 0 })
      const data = await res.json()
      if (Array.isArray(data)) {
        setConvoMessages(data.reverse())
      }
    } catch {
      // NUI fetch may not return JSON in-game, messages arrive via events
    }
  }

  const handleSend = () => {
    const target = view === 'new' ? newNumber.trim() : activeNumber
    if (!target || !input.trim()) return
    const msg = {
      owner: myPhone,
      number: target,
      message: input.trim(),
      time: Math.floor(Date.now() / 1000),
    }
    sendNui('SendMessage', msg)
    // Optimistic add
    const local: Message = {
      id: Date.now(),
      owner: myPhone,
      number: target,
      method: 1,
      unread: false,
      time: msg.time,
      message: msg.message,
    }
    setConvoMessages((prev) => [...prev, local])
    setInput('')
    if (view === 'new') {
      setActiveNumber(target)
      setView('convo')
    }
  }

  const handleDelete = (number: string) => {
    sendNui('DeleteConvo', { number })
    dispatch('REMOVE_THREAD', { number })
    pushAlert('Conversation deleted')
    setView('threads')
  }

  const formatTime = (ts: number): string => {
    const now = Date.now() / 1000
    const diff = now - ts
    if (diff < 60) return 'Now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`
    return new Date(ts * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  /* ── New message ────────────────────── */
  if (view === 'new') {
    return (
      <div className="flex-1 flex flex-col min-h-0">
        <div className="shrink-0 flex items-center gap-2 px-3 py-3 bg-black/30 border-b border-white/[0.06]">
          <button onClick={() => setView('threads')} className="text-white/40 hover:text-white/70 transition-colors">
            <ChevronLeft size={16} />
          </button>
          <span className="font-display font-bold uppercase tracking-[0.1em] text-[0.72rem] text-white/70">New Message</span>
        </div>
        <div className="px-3 py-2 border-b border-white/[0.04]">
          <input
            type="text"
            value={newNumber}
            onChange={(e) => setNewNumber(e.target.value)}
            placeholder="Phone number..."
            className="w-full h-8 px-3 bg-white/[0.04] border border-white/[0.06] rounded-lg text-[0.75rem] text-white/80 placeholder-white/25 focus:border-primary/40 transition-colors font-mono"
            autoFocus
          />
        </div>
        <div className="flex-1" />
        <InputBar input={input} setInput={setInput} onSend={handleSend} />
      </div>
    )
  }

  /* ── Conversation view ──────────────── */
  if (view === 'convo') {
    return (
      <div className="flex-1 flex flex-col min-h-0">
        <div className="shrink-0 flex items-center gap-2 px-3 py-3 bg-black/30 border-b border-white/[0.06]">
          <button onClick={() => setView('threads')} className="text-white/40 hover:text-white/70 transition-colors">
            <ChevronLeft size={16} />
          </button>
          <div className="flex-1 min-w-0">
            <span className="font-display font-bold uppercase tracking-[0.1em] text-[0.72rem] text-white/70 truncate block">
              {contactName(activeNumber)}
            </span>
            <span className="font-mono text-[0.55rem] text-white/30">{activeNumber}</span>
          </div>
          <button onClick={() => handleDelete(activeNumber)} className="text-white/25 hover:text-red-400/60 transition-colors">
            <Trash2 size={13} />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-1.5">
          {convoMessages.map((m) => {
            const sent = m.method === 1
            return (
              <div key={m.id} className={`flex ${sent ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-[0.72rem] leading-relaxed ${
                    sent
                      ? 'bg-primary/20 text-white/85 rounded-br-md'
                      : 'bg-white/[0.06] text-white/75 rounded-bl-md'
                  }`}
                >
                  <p className="break-words">{m.message}</p>
                  <span className={`block text-[0.5rem] mt-1 ${sent ? 'text-primary/40 text-right' : 'text-white/25'}`}>
                    {formatTime(m.time)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        <InputBar input={input} setInput={setInput} onSend={handleSend} />
      </div>
    )
  }

  /* ── Thread list ────────────────────── */
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="shrink-0 flex items-center justify-between px-4 py-3 bg-black/30 border-b border-white/[0.06]">
        <span className="font-display font-bold uppercase tracking-[0.1em] text-[0.72rem] text-white/70">Messages</span>
        <button onClick={() => setView('new')} className="text-primary/80 hover:text-primary transition-colors">
          <Plus size={16} />
        </button>
      </div>

      <div className="shrink-0 px-3 py-2">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/25" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search messages..."
            className="w-full h-8 pl-8 pr-3 bg-white/[0.04] border border-white/[0.06] rounded-lg text-[0.75rem] text-white/80 placeholder-white/25 focus:border-primary/40 transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col">
        {filteredThreads.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2">
            <MessageSquare size={28} className="text-white/20" />
            <span className="font-mono text-[0.65rem] text-white/20 uppercase tracking-[0.08em]">
              {loading ? 'Loading...' : 'No messages'}
            </span>
          </div>
        ) : (
          filteredThreads.map((t) => (
            <button
              key={t.number}
              onClick={() => openConvo(t.number)}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.04] transition-colors border-b border-white/[0.03]"
            >
              <div className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center shrink-0">
                <MessageSquare size={13} className={t.unread ? 'text-primary' : 'text-white/30'} />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[0.72rem] font-medium truncate ${t.unread ? 'text-white/90' : 'text-white/60'}`}>
                    {contactName(t.number)}
                  </span>
                  <span className="font-mono text-[0.5rem] text-white/25 shrink-0">{formatTime(t.time)}</span>
                </div>
                <span className="text-[0.6rem] text-white/35 truncate block">{t.message}</span>
              </div>
              {t.unread && <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
            </button>
          ))
        )}
      </div>
    </div>
  )
}

function InputBar({
  input,
  setInput,
  onSend,
}: {
  input: string
  setInput: (v: string) => void
  onSend: () => void
}): React.ReactElement {
  return (
    <div className="shrink-0 flex items-center gap-2 px-3 py-2 border-t border-white/[0.06]">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSend()}
        placeholder="Type a message..."
        className="flex-1 h-8 px-3 bg-white/[0.04] border border-white/[0.06] rounded-full text-[0.72rem] text-white/80 placeholder-white/25 focus:border-primary/40 transition-colors"
      />
      <button
        onClick={onSend}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
      >
        <Send size={13} />
      </button>
    </div>
  )
}
