import React, { useState, useEffect, useMemo } from 'react'
import { Megaphone, Plus, ChevronLeft, Search, Trash2, Edit3, Tag } from 'lucide-react'
import { useStore } from '../store'
import { sendNui } from '../nui'

interface Advert {
  id?: number
  source?: number
  SID?: number
  author?: string
  title?: string
  description?: string
  category?: string
  phone?: string
  time?: number
}

type View = 'list' | 'form'

const CATEGORIES = ['Vehicles', 'Properties', 'Services', 'Items', 'Jobs', 'Other']

export default function AdvertsScreen(): React.ReactElement {
  const player = useStore((s) => s.player)
  const pushAlert = useStore((s) => s.pushAlert)

  const [view, setView] = useState<View>('list')
  const [adverts, setAdverts] = useState<Record<string, Advert>>({})
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({ title: '', description: '', category: 'Other' })

  /* Fetch adverts on mount — data arrives via SET_DATA message */
  useEffect(() => {
    sendNui('GetAdverts')
  }, [])

  /* Listen for live advert updates */
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (!e.isTrusted) return
      const { type, data } = e.data ?? {}
      if (type === 'SET_DATA' && data?.type === 'adverts') {
        setAdverts(data.data ?? {})
      }
      if (type === 'ADD_DATA' && data?.type === 'adverts') {
        setAdverts((prev) => ({ ...prev, [data.key]: data.data }))
      }
      if (type === 'UPDATE_DATA' && data?.type === 'adverts') {
        setAdverts((prev) => ({ ...prev, [data.id]: data.data }))
      }
      if (type === 'REMOVE_DATA' && data?.type === 'adverts') {
        setAdverts((prev) => {
          const copy = { ...prev }
          delete copy[data.id]
          return copy
        })
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  const advertList = useMemo(() => {
    const q = search.toLowerCase()
    return Object.values(adverts)
      .filter((a) => {
        if (category && a.category !== category) return false
        return (
          (a.title ?? '').toLowerCase().includes(q) ||
          (a.description ?? '').toLowerCase().includes(q) ||
          (a.author ?? '').toLowerCase().includes(q)
        )
      })
      .sort((a, b) => (b.time ?? 0) - (a.time ?? 0))
  }, [adverts, search, category])

  const myAdvert = Object.values(adverts).find((a) => a.SID === player.SID)

  const handlePost = () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      pushAlert('Title and description required')
      return
    }
    if (editing) {
      sendNui('UpdateAdvert', formData)
      pushAlert('Ad updated')
    } else {
      sendNui('CreateAdvert', formData)
      pushAlert('Ad posted')
    }
    setView('list')
  }

  const handleDelete = () => {
    sendNui('DeleteAdvert', {})
    pushAlert('Ad deleted')
  }

  const openEdit = () => {
    if (myAdvert) {
      setFormData({
        title: myAdvert.title ?? '',
        description: myAdvert.description ?? '',
        category: myAdvert.category ?? 'Other',
      })
      setEditing(true)
    } else {
      setFormData({ title: '', description: '', category: 'Other' })
      setEditing(false)
    }
    setView('form')
  }

  const formatTime = (ts: number): string => {
    const diff = Math.floor(Date.now() / 1000) - ts
    if (diff < 3600) return `${Math.floor(diff / 60)}m`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`
    return `${Math.floor(diff / 86400)}d`
  }

  /* ── Form view ──────────────────────── */
  if (view === 'form') {
    return (
      <div className="flex-1 flex flex-col min-h-0">
        <div className="shrink-0 flex items-center gap-2 px-3 py-3 bg-black/30 border-b border-white/[0.06]">
          <button onClick={() => setView('list')} className="text-white/40 hover:text-white/70 transition-colors">
            <ChevronLeft size={16} />
          </button>
          <span className="font-display font-bold uppercase tracking-[0.1em] text-[0.72rem] text-white/70">
            {editing ? 'Edit Ad' : 'New Ad'}
          </span>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-[0.6rem] font-medium text-white/40 uppercase tracking-wider">Title</span>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ad title..."
              className="h-9 px-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-[0.8rem] text-white/80 placeholder-white/25 focus:border-primary/40 transition-colors"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[0.6rem] font-medium text-white/40 uppercase tracking-wider">Description</span>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your ad..."
              className="h-24 p-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-[0.78rem] text-white/80 placeholder-white/25 resize-none focus:border-primary/40 transition-colors"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[0.6rem] font-medium text-white/40 uppercase tracking-wider">Category</span>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setFormData({ ...formData, category: c })}
                  className={`px-2.5 py-1 rounded-full text-[0.62rem] font-medium transition-colors ${
                    formData.category === c
                      ? 'bg-primary/20 border border-primary/30 text-primary'
                      : 'bg-white/[0.04] border border-white/[0.06] text-white/50'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </label>
        </div>
        <div className="shrink-0 px-4 pb-3">
          <button
            onClick={handlePost}
            className="w-full h-9 rounded-lg bg-primary/20 border border-primary/30 text-primary text-[0.75rem] font-semibold uppercase tracking-wider hover:bg-primary/30 transition-colors"
          >
            {editing ? 'Update Ad' : 'Post Ad'}
          </button>
        </div>
      </div>
    )
  }

  /* ── List view ──────────────────────── */
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="shrink-0 flex items-center justify-between px-4 py-3 bg-black/30 border-b border-white/[0.06]">
        <span className="font-display font-bold uppercase tracking-[0.1em] text-[0.72rem] text-white/70">Ads</span>
        <div className="flex items-center gap-2">
          {myAdvert && (
            <button onClick={handleDelete} className="text-white/30 hover:text-red-400/60 transition-colors">
              <Trash2 size={13} />
            </button>
          )}
          <button onClick={openEdit} className="text-primary/80 hover:text-primary transition-colors">
            {myAdvert ? <Edit3 size={14} /> : <Plus size={16} />}
          </button>
        </div>
      </div>

      {/* Search + category filter */}
      <div className="shrink-0 px-3 py-2 flex flex-col gap-1.5">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/25" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ads..."
            className="w-full h-8 pl-8 pr-3 bg-white/[0.04] border border-white/[0.06] rounded-lg text-[0.75rem] text-white/80 placeholder-white/25 focus:border-primary/40 transition-colors"
          />
        </div>
        <div className="flex gap-1 overflow-x-auto pb-0.5">
          <button
            onClick={() => setCategory(null)}
            className={`shrink-0 px-2 py-0.5 rounded-full text-[0.55rem] font-medium transition-colors ${
              !category ? 'bg-primary/20 text-primary' : 'bg-white/[0.04] text-white/40'
            }`}
          >
            All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(category === c ? null : c)}
              className={`shrink-0 px-2 py-0.5 rounded-full text-[0.55rem] font-medium transition-colors ${
                category === c ? 'bg-primary/20 text-primary' : 'bg-white/[0.04] text-white/40'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Ad list */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        {advertList.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2">
            <Megaphone size={28} className="text-white/20" />
            <span className="font-mono text-[0.65rem] text-white/20 uppercase tracking-[0.08em]">No ads</span>
          </div>
        ) : (
          advertList.map((ad, i) => (
            <div key={ad.source ?? i} className="px-4 py-3 border-b border-white/[0.03]">
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="text-[0.75rem] font-medium text-white/80">{ad.title}</span>
                {ad.category && (
                  <span className="shrink-0 flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#870b30]/15 text-[0.5rem] font-medium text-[#870b30]">
                    <Tag size={8} />
                    {ad.category}
                  </span>
                )}
              </div>
              <p className="text-[0.68rem] text-white/50 leading-relaxed break-words">{ad.description}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="font-mono text-[0.52rem] text-white/25">{ad.author ?? 'Anonymous'}</span>
                {ad.phone && <span className="font-mono text-[0.52rem] text-white/25">· {ad.phone}</span>}
                {ad.time && <span className="font-mono text-[0.52rem] text-white/20 ml-auto">{formatTime(ad.time)}</span>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
