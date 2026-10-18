import React, { useState, useMemo } from 'react'
import { Search, Plus, Phone, MessageSquare, ChevronLeft, Trash2, Star, X, User } from 'lucide-react'
import { useStore } from '../store'
import { sendNui } from '../nui'

interface Contact {
  id: number
  name: string
  number: string
  color?: string
  avatar?: string
  favorite?: boolean
}

type View = 'list' | 'detail' | 'form'

const COLORS = ['#FF5C3A', '#268f3a', '#1258a3', '#c4b404', '#870b30', '#8800c7', '#05737d', '#db5004', '#59E5F7', '#63e6be']

export default function ContactsScreen(): React.ReactElement {
  const contacts = useStore((s) => s.contacts) as unknown as Contact[]
  const openApp = useStore((s) => s.openApp)
  const pushAlert = useStore((s) => s.pushAlert)

  const [view, setView] = useState<View>('list')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Contact | null>(null)
  const [formData, setFormData] = useState({ name: '', number: '', color: COLORS[0], favorite: false })
  const [editing, setEditing] = useState(false)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    const list = contacts.filter(
      (c) => c.name?.toLowerCase().includes(q) || c.number?.includes(q)
    )
    return list.sort((a, b) => {
      if (a.favorite && !b.favorite) return -1
      if (!a.favorite && b.favorite) return 1
      return (a.name ?? '').localeCompare(b.name ?? '')
    })
  }, [contacts, search])

  const openDetail = (c: Contact) => {
    setSelected(c)
    setView('detail')
  }

  const openAdd = () => {
    setFormData({ name: '', number: '', color: COLORS[Math.floor(Math.random() * COLORS.length)], favorite: false })
    setEditing(false)
    setView('form')
  }

  const openEdit = (c: Contact) => {
    setFormData({ name: c.name, number: c.number, color: c.color ?? COLORS[0], favorite: c.favorite ?? false })
    setSelected(c)
    setEditing(true)
    setView('form')
  }

  const handleSave = () => {
    if (!formData.name.trim() || !formData.number.trim()) {
      pushAlert('Name and number are required')
      return
    }
    if (editing && selected) {
      sendNui('UpdateContact', { id: selected.id, ...formData })
      pushAlert('Contact updated')
    } else {
      sendNui('CreateContact', formData)
      pushAlert('Contact created')
    }
    setView('list')
  }

  const handleDelete = (c: Contact) => {
    sendNui('DeleteContact', { id: c.id })
    pushAlert('Contact deleted')
    setView('list')
  }

  const handleCall = (number: string) => {
    openApp('phone', `call:${number}`)
  }

  const handleText = (number: string) => {
    openApp('messages', `convo:${number}`)
  }

  const back = () => {
    if (view === 'detail' || view === 'form') setView('list')
  }

  /* ── List view ──────────────────────────── */
  if (view === 'list') {
    return (
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-4 py-3 bg-black/30 border-b border-white/[0.06]">
          <span className="font-display font-bold uppercase tracking-[0.1em] text-[0.72rem] text-white/70">
            Contacts
          </span>
          <button onClick={openAdd} className="text-primary/80 hover:text-primary transition-colors">
            <Plus size={16} />
          </button>
        </div>

        {/* Search */}
        <div className="shrink-0 px-3 py-2">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/25" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search contacts..."
              className="w-full h-8 pl-8 pr-3 bg-white/[0.04] border border-white/[0.06] rounded-lg text-[0.75rem] text-white/80 placeholder-white/25 focus:border-primary/40 transition-colors"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          {filtered.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2">
              <User size={28} className="text-white/20" />
              <span className="font-mono text-[0.65rem] text-white/20 uppercase tracking-[0.08em]">
                No contacts
              </span>
            </div>
          ) : (
            filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => openDetail(c)}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.04] transition-colors border-b border-white/[0.03] last:border-0"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[0.65rem] font-bold text-white/90"
                  style={{ background: c.color ?? '#333' }}
                >
                  {c.name?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[0.75rem] font-medium text-white/80 truncate">{c.name}</span>
                    {c.favorite && <Star size={10} className="text-yellow-400/70 shrink-0 fill-yellow-400/70" />}
                  </div>
                  <span className="font-mono text-[0.6rem] text-white/35">{c.number}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    )
  }

  /* ── Detail view ────────────────────────── */
  if (view === 'detail' && selected) {
    return (
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="shrink-0 flex items-center gap-2 px-3 py-3 bg-black/30 border-b border-white/[0.06]">
          <button onClick={back} className="text-white/40 hover:text-white/70 transition-colors">
            <ChevronLeft size={16} />
          </button>
          <span className="font-display font-bold uppercase tracking-[0.1em] text-[0.72rem] text-white/70">
            Contact
          </span>
        </div>

        {/* Profile */}
        <div className="flex flex-col items-center gap-3 pt-8 pb-6">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white/90"
            style={{ background: selected.color ?? '#333' }}
          >
            {selected.name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-[0.9rem] font-medium text-white/90">{selected.name}</span>
            <span className="font-mono text-[0.7rem] text-white/40">{selected.number}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-4 pb-6">
          <ActionCircle icon={<Phone size={16} />} label="Call" color="#21a500" onClick={() => handleCall(selected.number)} />
          <ActionCircle icon={<MessageSquare size={16} />} label="Text" color="#ff0000" onClick={() => handleText(selected.number)} />
        </div>

        {/* Manage */}
        <div className="px-4 flex flex-col gap-1">
          <button
            onClick={() => openEdit(selected)}
            className="w-full text-left px-3 py-2.5 rounded-lg bg-white/[0.03] text-[0.72rem] font-medium text-white/60 hover:bg-white/[0.06] transition-colors"
          >
            Edit Contact
          </button>
          <button
            onClick={() => handleDelete(selected)}
            className="w-full text-left px-3 py-2.5 rounded-lg bg-menu-error/10 text-[0.72rem] font-medium text-red-400/70 hover:bg-menu-error/20 transition-colors"
          >
            Delete Contact
          </button>
        </div>
      </div>
    )
  }

  /* ── Form view (add / edit) ─────────────── */
  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="shrink-0 flex items-center gap-2 px-3 py-3 bg-black/30 border-b border-white/[0.06]">
        <button onClick={back} className="text-white/40 hover:text-white/70 transition-colors">
          <ChevronLeft size={16} />
        </button>
        <span className="font-display font-bold uppercase tracking-[0.1em] text-[0.72rem] text-white/70">
          {editing ? 'Edit Contact' : 'New Contact'}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {/* Name */}
        <label className="flex flex-col gap-1">
          <span className="text-[0.6rem] font-medium text-white/40 uppercase tracking-wider">Name</span>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Contact name"
            className="h-9 px-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-[0.8rem] text-white/80 placeholder-white/25 focus:border-primary/40 transition-colors"
          />
        </label>

        {/* Number */}
        <label className="flex flex-col gap-1">
          <span className="text-[0.6rem] font-medium text-white/40 uppercase tracking-wider">Number</span>
          <input
            type="text"
            value={formData.number}
            onChange={(e) => setFormData({ ...formData, number: e.target.value })}
            placeholder="555-000-0000"
            className="h-9 px-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-[0.8rem] text-white/80 placeholder-white/25 focus:border-primary/40 transition-colors font-mono"
          />
        </label>

        {/* Color picker */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[0.6rem] font-medium text-white/40 uppercase tracking-wider">Color</span>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setFormData({ ...formData, color: c })}
                className={`w-7 h-7 rounded-full transition-all ${
                  formData.color === c ? 'ring-2 ring-white/40 ring-offset-1 ring-offset-menu-bg' : ''
                }`}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>

        {/* Favorite toggle */}
        <button
          onClick={() => setFormData({ ...formData, favorite: !formData.favorite })}
          className="flex items-center gap-2 py-2"
        >
          <Star
            size={14}
            className={formData.favorite ? 'text-yellow-400 fill-yellow-400' : 'text-white/25'}
          />
          <span className="text-[0.72rem] font-medium text-white/60">Favorite</span>
        </button>
      </div>

      {/* Save */}
      <div className="shrink-0 px-4 pb-3">
        <button
          onClick={handleSave}
          className="w-full h-9 rounded-lg bg-primary/20 border border-primary/30 text-primary text-[0.75rem] font-semibold uppercase tracking-wider hover:bg-primary/30 transition-colors"
        >
          {editing ? 'Save Changes' : 'Create Contact'}
        </button>
      </div>
    </div>
  )
}

function ActionCircle({
  icon,
  label,
  color,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  color: string
  onClick: () => void
}): React.ReactElement {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1.5">
      <div
        className="w-11 h-11 rounded-full flex items-center justify-center text-white/90 hover:brightness-110 transition-all"
        style={{ background: color + '30', border: `1px solid ${color}40` }}
      >
        {icon}
      </div>
      <span className="text-[0.58rem] font-medium text-white/50 uppercase tracking-wider">{label}</span>
    </button>
  )
}
