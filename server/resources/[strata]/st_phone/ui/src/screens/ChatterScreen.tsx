import React, { useState, useEffect, useRef } from 'react'
import { MessageCircle, Plus, ChevronLeft, Send, Settings, Trash2, LogOut, UserPlus, Mail } from 'lucide-react'
import { useStore } from '../store'
import { sendNui } from '../nui'

interface ChatterGroup {
  id: string
  label: string
  icon?: string
  owner: number
  joined_date?: number
  last_message?: string
}

interface ChatterMessage {
  group: string
  author: number
  message: string
  timestamp: number
  authorName?: string
}

interface ChatterInvite {
  sender: number
  group: string
  label: string
  icon?: string
  timestamp: number
}

type View = 'groups' | 'chat' | 'create' | 'invites' | 'config'

export default function ChatterScreen(): React.ReactElement {
  const player = useStore((s) => s.player)
  const pushAlert = useStore((s) => s.pushAlert)

  const [view, setView] = useState<View>('groups')
  const [groups, setGroups] = useState<ChatterGroup[]>([])
  const [invites, setInvites] = useState<ChatterInvite[]>([])
  const [activeGroup, setActiveGroup] = useState<ChatterGroup | null>(null)
  const [messages, setMessages] = useState<ChatterMessage[]>([])
  const [input, setInput] = useState('')
  const [newLabel, setNewLabel] = useState('')
  const [inviteSid, setInviteSid] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  /* Fetch groups/invites on mount — data arrives via CHATTER_SET messages */
  useEffect(() => {
    sendNui('Chatter:GetData')
  }, [])

  /* Listen for chatter events */
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (!e.isTrusted) return
      const { type, data } = e.data ?? {}
      if (type === 'CHATTER_SET_GROUPS') setGroups(data?.groups ?? [])
      if (type === 'CHATTER_SET_INVITES') setInvites(data?.invites ?? [])
      if (type === 'CHATTER_NEW_MESSAGE' && data) {
        setMessages((prev) => [...prev, data as ChatterMessage])
      }
      if (type === 'CHATTER_GROUP_DELETED' && data?.group) {
        setGroups((prev) => prev.filter((g) => g.id !== data.group))
        if (activeGroup?.id === data.group) setView('groups')
      }
      if (type === 'CHATTER_UPDATE_GROUP' && data?.group) {
        setGroups((prev) => prev.map((g) => g.id === data.group.id ? { ...g, ...data.group } : g))
      }
      if (type === 'CHATTER_RECEIVE_INVITE' && data?.invite) {
        setInvites((prev) => [...prev, data.invite])
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [activeGroup])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages])

  const openChat = async (group: ChatterGroup) => {
    setActiveGroup(group)
    setMessages([])
    setView('chat')
    try {
      const res = await sendNui('Chatter:LoadMessages', { channel: group.id, offset: 0 })
      const data = await res.json()
      if (Array.isArray(data)) setMessages(data)
    } catch { /* noop */ }
  }

  const handleSend = () => {
    if (!input.trim() || !activeGroup) return
    sendNui('Chatter:SendMessage', { channel: activeGroup.id, message: input.trim() })
    const local: ChatterMessage = {
      group: activeGroup.id,
      author: player.SID ?? 0,
      message: input.trim(),
      timestamp: Math.floor(Date.now() / 1000),
      authorName: player.Name ?? 'You',
    }
    setMessages((prev) => [...prev, local])
    setInput('')
  }

  const handleCreate = () => {
    if (!newLabel.trim()) return
    sendNui('Chatter:CreateGroup', { label: newLabel.trim() })
    pushAlert('Group created')
    setNewLabel('')
    setView('groups')
  }

  const handleLeave = (id: string) => {
    sendNui('Chatter:LeaveGroup', { id })
    setGroups((prev) => prev.filter((g) => g.id !== id))
    pushAlert('Left group')
    setView('groups')
  }

  const handleDelete = (id: string) => {
    sendNui('Chatter:DeleteGroup', { id })
    setGroups((prev) => prev.filter((g) => g.id !== id))
    pushAlert('Group deleted')
    setView('groups')
  }

  const handleInvite = () => {
    if (!inviteSid.trim() || !activeGroup) return
    sendNui('Chatter:Invite:Send', { sid: Number(inviteSid), channel: activeGroup.id })
    pushAlert('Invite sent')
    setInviteSid('')
  }

  const handleAcceptInvite = (group: string) => {
    sendNui('Chatter:Invite:Accept', { id: group })
    setInvites((prev) => prev.filter((i) => i.group !== group))
    pushAlert('Invite accepted')
  }

  const handleDeclineInvite = (group: string) => {
    sendNui('Chatter:Invite:Decline', { id: group })
    setInvites((prev) => prev.filter((i) => i.group !== group))
  }

  const formatTime = (ts: number): string => {
    const diff = Math.floor(Date.now() / 1000) - ts
    if (diff < 60) return 'now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`
    return `${Math.floor(diff / 86400)}d`
  }

  /* ── Create view ────────────────────── */
  if (view === 'create') {
    return (
      <div className="flex-1 flex flex-col min-h-0">
        <div className="shrink-0 flex items-center gap-2 px-3 py-3 bg-black/30 border-b border-white/[0.06]">
          <button onClick={() => setView('groups')} className="text-white/40 hover:text-white/70 transition-colors">
            <ChevronLeft size={16} />
          </button>
          <span className="font-display font-bold uppercase tracking-[0.1em] text-[0.72rem] text-white/70">New Group</span>
        </div>
        <div className="px-4 py-4 flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-[0.6rem] font-medium text-white/40 uppercase tracking-wider">Group Name</span>
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Enter group name..."
              className="h-9 px-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-[0.8rem] text-white/80 placeholder-white/25 focus:border-primary/40 transition-colors"
              autoFocus
            />
          </label>
          <button
            onClick={handleCreate}
            className="h-9 rounded-lg bg-primary/20 border border-primary/30 text-primary text-[0.75rem] font-semibold uppercase tracking-wider hover:bg-primary/30 transition-colors"
          >
            Create Group
          </button>
        </div>
      </div>
    )
  }

  /* ── Invites view ───────────────────── */
  if (view === 'invites') {
    return (
      <div className="flex-1 flex flex-col min-h-0">
        <div className="shrink-0 flex items-center gap-2 px-3 py-3 bg-black/30 border-b border-white/[0.06]">
          <button onClick={() => setView('groups')} className="text-white/40 hover:text-white/70 transition-colors">
            <ChevronLeft size={16} />
          </button>
          <span className="font-display font-bold uppercase tracking-[0.1em] text-[0.72rem] text-white/70">Invites</span>
        </div>
        <div className="flex-1 overflow-y-auto flex flex-col">
          {invites.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2">
              <Mail size={28} className="text-white/20" />
              <span className="font-mono text-[0.65rem] text-white/20 uppercase tracking-[0.08em]">No invites</span>
            </div>
          ) : (
            invites.map((inv) => (
              <div key={inv.group} className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.03]">
                <div className="w-8 h-8 rounded-lg bg-[#2d2835] flex items-center justify-center shrink-0">
                  <MessageCircle size={13} className="text-white/40" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[0.72rem] font-medium text-white/70 truncate block">{inv.label}</span>
                  <span className="font-mono text-[0.55rem] text-white/30">SID: {inv.sender}</span>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleAcceptInvite(inv.group)}
                    className="px-2 py-1 rounded text-[0.58rem] font-medium bg-menu-success/15 text-menu-success-lt/80 hover:bg-menu-success/25 transition-colors"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleDeclineInvite(inv.group)}
                    className="px-2 py-1 rounded text-[0.58rem] font-medium bg-menu-error/15 text-red-400/60 hover:bg-menu-error/25 transition-colors"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    )
  }

  /* ── Chat view ──────────────────────── */
  if (view === 'chat' && activeGroup) {
    const isOwner = activeGroup.owner === (player.SID ?? 0)
    return (
      <div className="flex-1 flex flex-col min-h-0">
        <div className="shrink-0 flex items-center gap-2 px-3 py-3 bg-black/30 border-b border-white/[0.06]">
          <button onClick={() => setView('groups')} className="text-white/40 hover:text-white/70 transition-colors">
            <ChevronLeft size={16} />
          </button>
          <span className="font-display font-bold uppercase tracking-[0.1em] text-[0.72rem] text-white/70 truncate flex-1">
            {activeGroup.label}
          </span>
          <div className="flex items-center gap-1">
            {/* Invite member */}
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={inviteSid}
                onChange={(e) => setInviteSid(e.target.value)}
                placeholder="SID"
                className="w-12 h-6 px-1.5 bg-white/[0.04] border border-white/[0.06] rounded text-[0.58rem] text-white/60 placeholder-white/20 font-mono text-center"
              />
              <button onClick={handleInvite} className="text-white/30 hover:text-primary transition-colors">
                <UserPlus size={12} />
              </button>
            </div>
            {isOwner ? (
              <button onClick={() => handleDelete(activeGroup.id)} className="text-white/25 hover:text-red-400/60 transition-colors ml-1">
                <Trash2 size={12} />
              </button>
            ) : (
              <button onClick={() => handleLeave(activeGroup.id)} className="text-white/25 hover:text-menu-warning transition-colors ml-1">
                <LogOut size={12} />
              </button>
            )}
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-1.5">
          {messages.map((m, i) => {
            const isMe = m.author === (player.SID ?? 0)
            return (
              <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-[0.72rem] leading-relaxed ${
                  isMe ? 'bg-[#2d2835] text-white/80 rounded-br-md' : 'bg-white/[0.06] text-white/70 rounded-bl-md'
                }`}>
                  {!isMe && <span className="block text-[0.55rem] font-medium text-[#2d2835] mb-0.5">{m.authorName ?? `SID ${m.author}`}</span>}
                  <p className="break-words">{m.message}</p>
                  <span className="block text-[0.48rem] text-white/20 mt-0.5">{formatTime(m.timestamp)}</span>
                </div>
              </div>
            )
          })}
        </div>

        <div className="shrink-0 flex items-center gap-2 px-3 py-2 border-t border-white/[0.06]">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1 h-8 px-3 bg-white/[0.04] border border-white/[0.06] rounded-full text-[0.72rem] text-white/80 placeholder-white/25 focus:border-primary/40 transition-colors"
          />
          <button onClick={handleSend} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#2d2835] text-white/60 hover:text-white transition-colors">
            <Send size={13} />
          </button>
        </div>
      </div>
    )
  }

  /* ── Groups list ────────────────────── */
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="shrink-0 flex items-center justify-between px-4 py-3 bg-black/30 border-b border-white/[0.06]">
        <span className="font-display font-bold uppercase tracking-[0.1em] text-[0.72rem] text-white/70">Yapper</span>
        <div className="flex items-center gap-2">
          {invites.length > 0 && (
            <button onClick={() => setView('invites')} className="relative text-white/40 hover:text-white/60 transition-colors">
              <Mail size={14} />
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary flex items-center justify-center">
                <span className="text-[0.4rem] font-bold text-white">{invites.length}</span>
              </div>
            </button>
          )}
          <button onClick={() => setView('create')} className="text-primary/80 hover:text-primary transition-colors">
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col">
        {groups.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2">
            <MessageCircle size={28} className="text-white/20" />
            <span className="font-mono text-[0.65rem] text-white/20 uppercase tracking-[0.08em]">No groups</span>
          </div>
        ) : (
          groups.map((g) => (
            <button
              key={g.id}
              onClick={() => openChat(g)}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.04] transition-colors border-b border-white/[0.03]"
            >
              <div className="w-9 h-9 rounded-lg bg-[#2d2835] flex items-center justify-center shrink-0">
                <MessageCircle size={15} className="text-white/40" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <span className="text-[0.72rem] font-medium text-white/70 truncate block">{g.label}</span>
                {g.last_message && (
                  <span className="text-[0.58rem] text-white/30 truncate block">{g.last_message}</span>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
