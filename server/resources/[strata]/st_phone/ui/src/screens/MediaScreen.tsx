import React, { useState, useEffect } from 'react'
import { Image, Trash2 } from 'lucide-react'
import { useStore } from '../store'
import { sendNui } from '../nui'

interface Photo { id: number; url?: string; image_url?: string; time?: number }

export default function MediaScreen(): React.ReactElement {
  const pushAlert = useStore((s) => s.pushAlert)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Photo | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await sendNui('Media:GetMedia', {})
        const data = await res.json()
        if (Array.isArray(data)) setPhotos(data)
      } catch { /* noop */ }
      setLoading(false)
    }
    load()
  }, [])

  const handleDelete = (id: number) => {
    sendNui('Media:DeleteMedia', { id })
    setPhotos((prev) => prev.filter((p) => p.id !== id))
    setSelected(null)
    pushAlert('Photo deleted')
  }

  if (selected) {
    return (
      <div className="flex-1 flex flex-col min-h-0">
        <div className="shrink-0 flex items-center justify-between px-4 py-3 bg-black/30 border-b border-white/[0.06]">
          <button onClick={() => setSelected(null)} className="text-[0.65rem] font-medium text-white/50">Back</button>
          <button onClick={() => handleDelete(selected.id)} className="text-white/25 hover:text-red-400/60 transition-colors"><Trash2 size={13} /></button>
        </div>
        <div className="flex-1 flex items-center justify-center p-2 bg-black/20">
          <img src={selected.image_url ?? selected.url} alt="" className="max-w-full max-h-full object-contain rounded-lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="shrink-0 px-4 py-3 bg-black/30 border-b border-white/[0.06]">
        <div className="flex items-center gap-1.5">
          <Image size={14} className="text-[#59E5F7]" />
          <span className="font-display font-bold uppercase tracking-[0.1em] text-[0.72rem] text-white/70">Media</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {photos.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 h-full">
            <Image size={28} className="text-white/20" />
            <span className="font-mono text-[0.65rem] text-white/20 uppercase tracking-[0.08em]">{loading ? 'Loading...' : 'No photos'}</span>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-0.5 p-0.5">
            {photos.map((p) => (
              <button key={p.id} onClick={() => setSelected(p)} className="aspect-square overflow-hidden bg-white/[0.03]">
                <img src={p.image_url ?? p.url} alt="" className="w-full h-full object-cover hover:opacity-80 transition-opacity" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
