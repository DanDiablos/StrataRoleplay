import { useState } from 'react'
import { FileText, Plus, Trash2, Eye, Edit } from 'lucide-react'
import { sendNui } from '../../nui'
import { useStore } from '../../store'
import SearchInput from '../../components/SearchInput.tsx'
import ActionBtn from '../../components/ActionBtn.tsx'
import Modal from '../../components/Modal.tsx'
import Loader from '../../components/Loader.tsx'
import type { Document } from '../../types'

type Mode = 'list' | 'view' | 'create' | 'edit'

export default function DocumentsTab(): React.ReactElement {
  const axisTab = useStore(s => s.axisTab)
  const [search, setSearch]     = useState('')
  const [loading, setLoading]   = useState(false)
  const [docs, setDocs]         = useState<Document[]>([])
  const [searched, setSearched] = useState(false)
  const [mode, setMode]         = useState<Mode>('list')
  const [selected, setSelected] = useState<Document | null>(null)
  const [editTitle, setEditTitle]   = useState('')
  const [editContent, setEditContent] = useState('')

  const canCreate = axisTab === 'Search/Document'

  const doSearch = async () => {
    setLoading(true)
    setSearched(true)
    try {
      const r = await sendNui('BusinessDocumentSearch', { query: search })
      const result = await r.json()
      setDocs(Array.isArray(result) ? result : [])
    } finally {
      setLoading(false)
    }
  }

  const doView = async (doc: Document) => {
    setLoading(true)
    try {
      const r = await sendNui('BusinessDocumentView', { id: doc.id })
      const result = await r.json()
      if (result) {
        setSelected({ ...doc, content: result.content ?? doc.content })
        setMode('view')
      }
    } finally {
      setLoading(false)
    }
  }

  const doCreate = async () => {
    if (!editTitle.trim()) return
    setLoading(true)
    try {
      const r = await sendNui('BusinessDocumentCreate', { title: editTitle, content: editContent })
      const result = await r.json()
      if (result) {
        setMode('list')
        setEditTitle('')
        setEditContent('')
        doSearch()
      }
    } finally {
      setLoading(false)
    }
  }

  const doUpdate = async () => {
    if (!selected) return
    setLoading(true)
    try {
      await sendNui('BusinessDocumentUpdate', { id: selected.id, title: editTitle, content: editContent })
      setMode('list')
      doSearch()
    } finally {
      setLoading(false)
    }
  }

  const doDelete = async (id: string) => {
    setLoading(true)
    try {
      await sendNui('BusinessDocumentDelete', { id })
      setDocs(d => d.filter(x => x.id !== id))
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setEditTitle('')
    setEditContent('')
    setMode('create')
  }

  const openEdit = (doc: Document) => {
    setSelected(doc)
    setEditTitle(doc.title)
    setEditContent(doc.content ?? '')
    setMode('edit')
  }

  return (
    <div className="h-full flex flex-col p-5 gap-3.5">
      {/* Search row */}
      <div className="flex gap-2 shrink-0">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search documents…"
          className="flex-1"
        />
        <ActionBtn onClick={doSearch} disabled={loading}>Search</ActionBtn>
        {canCreate && (
          <ActionBtn onClick={openCreate} variant="primary" disabled={loading}>
            <Plus size={13} className="inline mr-1" />
            New
          </ActionBtn>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 pr-1">
        {loading && (
          <div className="flex justify-center py-8"><Loader /></div>
        )}
        {!loading && searched && docs.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <FileText size={28} className="text-white/20" />
            <span className="font-mono text-[0.72rem] text-white/20 uppercase tracking-[0.06em]">No documents found</span>
          </div>
        )}
        {!loading && docs.map(doc => (
          <div
            key={doc.id}
            className="flex items-center gap-3 px-4 py-3 bg-menu-surface hover:bg-primary/[0.06] transition-colors border-b border-white/[0.04] last:border-0 cursor-pointer"
            onClick={() => doView(doc)}
          >
            <FileText size={14} className="text-white/30 shrink-0" />
            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
              <span className="font-medium text-[0.84rem] text-white/80 truncate">{doc.title}</span>
              <span className="font-mono text-[0.65rem] text-white/30">{doc.author} · {doc.created_at}</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={e => { e.stopPropagation(); openEdit(doc) }}
                className="w-6 h-6 flex items-center justify-center border border-white/10 text-white/25 hover:text-white/60 transition-colors"
              >
                <Edit size={11} />
              </button>
              <button
                onClick={e => { e.stopPropagation(); doDelete(doc.id) }}
                className="w-6 h-6 flex items-center justify-center border border-menu-error-lt/30 text-red-300/40 hover:text-red-300/70 transition-colors"
              >
                <Trash2 size={11} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* View modal */}
      {mode === 'view' && selected && (
        <Modal title={selected.title} onClose={() => setMode('list')}>
          <div className="p-4 flex flex-col gap-3">
            <div className="font-mono text-[0.65rem] text-white/30">
              {selected.author} · {selected.created_at}
            </div>
            <div className="text-[0.84rem] text-white/75 leading-relaxed whitespace-pre-wrap border border-white/[0.06] p-3 bg-menu-surface-lt min-h-[120px]">
              {selected.content || <span className="text-white/25 italic">No content</span>}
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <ActionBtn onClick={() => { openEdit(selected); }} variant="primary">Edit</ActionBtn>
              <ActionBtn onClick={() => setMode('list')}>Close</ActionBtn>
            </div>
          </div>
        </Modal>
      )}

      {/* Create/edit modal */}
      {(mode === 'create' || mode === 'edit') && (
        <Modal
          title={mode === 'create' ? 'New Document' : 'Edit Document'}
          onClose={() => setMode('list')}
          width="w-[560px]"
        >
          <div className="p-4 flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="font-mono text-[0.65rem] text-white/40 uppercase tracking-[0.05em]">Title</label>
              <input
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                placeholder="Document title…"
                className="h-9 px-3 bg-menu-surface-lt border border-white/10 text-[0.88rem] text-white/80 placeholder-white/25 focus:border-primary/50 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-mono text-[0.65rem] text-white/40 uppercase tracking-[0.05em]">Content</label>
              <textarea
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                placeholder="Document content…"
                rows={8}
                className="px-3 py-2 bg-menu-surface-lt border border-white/10 text-[0.84rem] text-white/80 placeholder-white/25 focus:border-primary/50 transition-colors leading-relaxed"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <ActionBtn
                onClick={mode === 'create' ? doCreate : doUpdate}
                variant="primary"
                disabled={loading || !editTitle.trim()}
              >
                {loading ? 'Saving…' : 'Save'}
              </ActionBtn>
              <ActionBtn onClick={() => setMode('list')}>Cancel</ActionBtn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
