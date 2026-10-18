import React from 'react'
import { Music } from 'lucide-react'
import { useStore } from '../store'
import { sendNui } from '../nui'

export default function MusicScreen(): React.ReactElement {
  const pushAlert = useStore((s) => s.pushAlert)

  const handleRoyalties = () => {
    sendNui('Music:SendRoyalties', {})
    pushAlert('Royalties collected')
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="shrink-0 px-4 py-3 bg-black/30 border-b border-white/[0.06]">
        <div className="flex items-center gap-1.5">
          <Music size={14} className="text-[#63e6be]" />
          <span className="font-display font-bold uppercase tracking-[0.1em] text-[0.72rem] text-white/70">Music</span>
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
        <div className="w-16 h-16 rounded-2xl bg-[#63e6be]/10 flex items-center justify-center">
          <Music size={28} className="text-[#63e6be]/50" />
        </div>
        <p className="text-[0.68rem] text-white/40 text-center leading-relaxed">
          Manage your music royalties. Collect earnings from your published tracks.
        </p>
        <button onClick={handleRoyalties}
          className="w-full h-9 rounded-lg bg-[#63e6be]/15 border border-[#63e6be]/25 text-[#63e6be] text-[0.75rem] font-semibold uppercase tracking-wider hover:bg-[#63e6be]/25 transition-colors">
          Collect Royalties
        </button>
      </div>
    </div>
  )
}
