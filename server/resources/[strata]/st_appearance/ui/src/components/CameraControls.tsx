import { useState } from 'react'
import { sendNui } from '../nui.ts'

type CameraView = 0 | 1 | 2 | 3

const VIEWS: { id: CameraView; label: string }[] = [
  { id: 0, label: 'Full' },
  { id: 1, label: 'Head' },
  { id: 2, label: 'Body' },
  { id: 3, label: 'Legs' },
]

export default function CameraControls(): React.ReactElement {
  const [activeView, setActiveView] = useState<CameraView>(0)

  const setView = (id: CameraView) => {
    setActiveView(id)
    sendNui('ChangeCamera', id)
  }

  const btn  = 'px-3 py-1.5 border font-medium text-[0.72rem] uppercase tracking-[0.06em] transition-colors'
  const act  = 'border-primary/40 bg-primary/15 text-primary'
  const idle = 'border-white/15 bg-black/50 text-white/40 hover:bg-black/70 hover:text-white/60'

  return (
    <div className="flex flex-col gap-2 select-none">
      <div className="flex gap-1.5">
        {VIEWS.map(({ id, label }) => (
          <button key={id} onClick={() => setView(id)} className={`${btn} ${activeView === id ? act : idle}`}>
            {label}
          </button>
        ))}
        <button onClick={() => sendNui('Animation', {})} className={`${btn} ${idle}`} title="Toggle Animation">
          Anim
        </button>
      </div>
      <p className="font-mono text-[0.62rem] text-white/20 uppercase tracking-[0.5px]">
        Drag to rotate · Scroll to zoom
      </p>
    </div>
  )
}
