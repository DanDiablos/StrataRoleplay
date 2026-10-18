import React, { useState } from 'react'
import { MapPin, Send } from 'lucide-react'
import { useStore } from '../store'
import { sendNui } from '../nui'

export default function PingEmScreen(): React.ReactElement {
  const pushAlert = useStore((s) => s.pushAlert)
  const contacts = useStore((s) => s.contacts) as unknown as { name: string; number: string }[]
  const [target, setTarget] = useState('')

  const handleSend = () => {
    if (!target.trim()) return
    sendNui('PingEm:Send', { target: target.trim() })
    pushAlert('Ping sent')
    setTarget('')
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="shrink-0 px-4 py-3 bg-black/30 border-b border-white/[0.06]">
        <div className="flex items-center gap-1.5">
          <MapPin size={14} className="text-[#e74c3c]" />
          <span className="font-display font-bold uppercase tracking-[0.1em] text-[0.72rem] text-white/70">Ping</span>
        </div>
      </div>
      <div className="px-4 py-4 flex flex-col gap-3">
        <p className="text-[0.68rem] text-white/40 leading-relaxed">Send your location to another player by State ID.</p>
        <input type="text" value={target} onChange={(e) => setTarget(e.target.value)}
          placeholder="State ID..."
          className="h-9 px-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-[0.8rem] text-white/80 placeholder-white/25 focus:border-primary/40 transition-colors font-mono" />
        <button onClick={handleSend}
          className="h-9 rounded-lg bg-[#e3db02]/15 border border-[#e3db02]/25 text-[#e3db02] text-[0.75rem] font-semibold uppercase tracking-wider hover:bg-[#e3db02]/25 transition-colors flex items-center justify-center gap-2">
          <Send size={13} /> Send Location
        </button>
      </div>
      {contacts.length > 0 && (
        <div className="flex-1 overflow-y-auto px-4">
          <span className="font-display font-bold uppercase tracking-[0.12em] text-[0.6rem] text-white/30 block mb-2">Quick Send</span>
          {contacts.map((c) => (
            <button key={c.number} onClick={() => { setTarget(c.number) }}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-white/[0.04] transition-colors">
              <span className="text-[0.68rem] text-white/60">{c.name}</span>
              <span className="font-mono text-[0.55rem] text-white/25 ml-auto">{c.number}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
