import { useState } from 'react'
import { Bell, Plus, Trash2 } from 'lucide-react'
import { sendNui } from '../../nui'
import { useStore } from '../../store'
import ActionBtn from '../../components/ActionBtn.tsx'
import Modal from '../../components/Modal.tsx'
import Loader from '../../components/Loader.tsx'
import type { Notice } from '../../types'

export default function NoticesTab(): React.ReactElement {
  const data = useStore(s => s.data)
  const notices = (data.businessNotices as Notice[] | null) ?? []
  const [creating, setCreating] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')

  const doCreate = async () => {
    if (!newTitle.trim()) return
    setLoading(true)
    try {
      const r = await sendNui('CreateBusinessNotice', { title: newTitle, content: newContent })
      const result = await r.json()
      if (result) {
        setCreating(false)
        setNewTitle(''); setNewContent('')
      }
    } finally {
      setLoading(false)
    }
  }

  const doDelete = async (id: string) => {
    await sendNui('DeleteBusinessNotice', { id })
  }

  return (
    <div className="h-full flex flex-col p-5 gap-3.5">
      {/* Header row */}
      <div className="flex items-center justify-between shrink-0">
        <span className="font-display font-bold uppercase tracking-[0.12em] text-[0.72rem] text-white/50">
          Board Notices
        </span>
        <ActionBtn onClick={() => setCreating(true)} variant="primary">
          <Plus size={13} className="inline mr-1" />
          Post Notice
        </ActionBtn>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 pr-1">
        {notices.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <Bell size={28} className="text-white/20" />
            <span className="font-mono text-[0.72rem] text-white/20 uppercase tracking-[0.06em]">No notices posted</span>
          </div>
        ) : (
          notices.map(n => (
            <div key={n.id} className="border-l-[3px] border-l-primary bg-menu-surface">
              <div className="px-3 py-3 flex flex-col gap-1.5">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-medium text-[0.84rem] text-white/85">{n.title}</span>
                  <button
                    onClick={() => doDelete(n.id)}
                    className="w-5 h-5 flex items-center justify-center text-white/20 hover:text-red-300/60 transition-colors shrink-0"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
                {n.content && (
                  <span className="text-[0.78rem] text-white/50 leading-snug">{n.content}</span>
                )}
                <span className="font-mono text-[0.62rem] text-white/25">
                  {n.author} · {n.created_at}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {creating && (
        <Modal title="Post Notice" onClose={() => setCreating(false)}>
          <div className="p-4 flex flex-col gap-3">
            <Field label="Title">
              <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Notice title…"
                className="h-9 px-3 w-full bg-menu-surface-lt border border-white/10 text-[0.88rem] text-white/80 placeholder-white/25 focus:border-primary/50 transition-colors" />
            </Field>
            <Field label="Content">
              <textarea value={newContent} onChange={e => setNewContent(e.target.value)} placeholder="Notice content…" rows={5}
                className="px-3 py-2 w-full bg-menu-surface-lt border border-white/10 text-[0.84rem] text-white/80 placeholder-white/25 focus:border-primary/50 transition-colors" />
            </Field>
            <div className="flex justify-end gap-2 pt-1">
              <ActionBtn onClick={doCreate} variant="primary" disabled={loading || !newTitle.trim()}>
                {loading ? 'Posting…' : 'Post'}
              </ActionBtn>
              <ActionBtn onClick={() => setCreating(false)}>Cancel</ActionBtn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-mono text-[0.65rem] text-white/40 uppercase tracking-[0.05em]">{label}</label>
      {children}
    </div>
  )
}
