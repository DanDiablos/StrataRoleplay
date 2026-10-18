import React, { useState } from 'react'
import { FileText, Plus, ChevronLeft, Trash2, Share2, Edit3, Pen } from 'lucide-react'
import { useStore } from '../store'
import { sendNui } from '../nui'

interface Doc { id: number; title: string; content: string; author?: string; time?: number; signatures?: string[] }

type View = 'list' | 'detail' | 'form'

export default function DocumentsScreen(): React.ReactElement {
  const player = useStore((s) => s.player)
  const pushAlert = useStore((s) => s.pushAlert)
  const docs = ((player as Record<string, unknown>).myDocuments ?? []) as Doc[]

  const [view, setView] = useState<View>('list')
  const [selected, setSelected] = useState<Doc | null>(null)
  const [formData, setFormData] = useState({ title: '', content: '' })
  const [editing, setEditing] = useState(false)

  const openDoc = (d: Doc) => { setSelected(d); setView('detail') }
  const openNew = () => { setFormData({ title: '', content: '' }); setEditing(false); setView('form') }
  const openEdit = (d: Doc) => { setFormData({ title: d.title, content: d.content }); setSelected(d); setEditing(true); setView('form') }

  const handleSave = () => {
    if (!formData.title.trim()) { pushAlert('Title required'); return }
    if (editing && selected) {
      sendNui('EditDocument', { id: selected.id, ...formData })
      pushAlert('Document updated')
    } else {
      sendNui('CreateDocument', formData)
      pushAlert('Document created')
    }
    setView('list')
  }

  const handleDelete = (id: number) => { sendNui('DeleteDocument', { id }); pushAlert('Document deleted'); setView('list') }
  const handleShare = (id: number) => { sendNui('ShareDocument', { id }); pushAlert('Document shared') }
  const handleSign = (id: number) => { sendNui('SignDocument', { id }); pushAlert('Document signed') }

  if (view === 'detail' && selected) {
    return (
      <div className="flex-1 flex flex-col min-h-0">
        <div className="shrink-0 flex items-center gap-2 px-3 py-3 bg-black/30 border-b border-white/[0.06]">
          <button onClick={() => setView('list')} className="text-white/40 hover:text-white/70 transition-colors"><ChevronLeft size={16} /></button>
          <span className="font-display font-bold uppercase tracking-[0.1em] text-[0.72rem] text-white/70 truncate flex-1">Document</span>
          <button onClick={() => openEdit(selected)} className="text-white/30 hover:text-white/60 transition-colors"><Edit3 size={12} /></button>
          <button onClick={() => handleDelete(selected.id)} className="text-white/25 hover:text-red-400/60 transition-colors"><Trash2 size={12} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
          <h2 className="text-[0.85rem] font-medium text-white/85">{selected.title}</h2>
          <p className="text-[0.72rem] text-white/60 leading-relaxed whitespace-pre-wrap">{selected.content}</p>
          <div className="flex gap-2 mt-2">
            <button onClick={() => handleShare(selected.id)}
              className="flex-1 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[0.65rem] font-medium text-white/50 hover:bg-white/[0.08] transition-colors flex items-center justify-center gap-1.5">
              <Share2 size={11} /> Share
            </button>
            <button onClick={() => handleSign(selected.id)}
              className="flex-1 h-8 rounded-lg bg-primary/10 border border-primary/20 text-[0.65rem] font-medium text-primary/70 hover:bg-primary/15 transition-colors flex items-center justify-center gap-1.5">
              <Pen size={11} /> Sign
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (view === 'form') {
    return (
      <div className="flex-1 flex flex-col min-h-0">
        <div className="shrink-0 flex items-center gap-2 px-3 py-3 bg-black/30 border-b border-white/[0.06]">
          <button onClick={() => setView('list')} className="text-white/40 hover:text-white/70 transition-colors"><ChevronLeft size={16} /></button>
          <span className="font-display font-bold uppercase tracking-[0.1em] text-[0.72rem] text-white/70">{editing ? 'Edit' : 'New Document'}</span>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
          <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Title..." className="h-9 px-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-[0.8rem] text-white/80 placeholder-white/25 focus:border-primary/40 transition-colors" />
          <textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="Content..." className="flex-1 min-h-[120px] p-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-[0.75rem] text-white/80 placeholder-white/25 resize-none focus:border-primary/40 transition-colors" />
        </div>
        <div className="shrink-0 px-4 pb-3">
          <button onClick={handleSave}
            className="w-full h-9 rounded-lg bg-primary/20 border border-primary/30 text-primary text-[0.75rem] font-semibold uppercase tracking-wider hover:bg-primary/30 transition-colors">
            {editing ? 'Save Changes' : 'Create Document'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="shrink-0 flex items-center justify-between px-4 py-3 bg-black/30 border-b border-white/[0.06]">
        <span className="font-display font-bold uppercase tracking-[0.1em] text-[0.72rem] text-white/70">Documents</span>
        <button onClick={openNew} className="text-primary/80 hover:text-primary transition-colors"><Plus size={16} /></button>
      </div>
      <div className="flex-1 overflow-y-auto flex flex-col">
        {docs.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2">
            <FileText size={28} className="text-white/20" />
            <span className="font-mono text-[0.65rem] text-white/20 uppercase tracking-[0.08em]">No documents</span>
          </div>
        ) : (
          docs.map((d) => (
            <button key={d.id} onClick={() => openDoc(d)}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.04] transition-colors border-b border-white/[0.03] text-left">
              <FileText size={15} className="text-[#820366]/50 shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-[0.72rem] font-medium text-white/70 truncate block">{d.title}</span>
                <span className="text-[0.58rem] text-white/30 truncate block">{d.content?.slice(0, 60)}</span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
