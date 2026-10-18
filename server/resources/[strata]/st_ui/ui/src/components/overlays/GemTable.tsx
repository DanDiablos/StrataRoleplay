import { useStore } from '../../store.ts'

export default function GemTable(): React.ReactElement | null {
  const showing = useStore(s => s.gemTableShowing)
  const info = useStore(s => s.gemTableInfo)

  if (!showing) return null

  return (
    <div className="fixed inset-x-0 top-0 pointer-events-none animate-fade-in" style={{ zIndex: 25 }}>
      {/* Top bar */}
      <div
        className="w-full flex items-center justify-center"
        style={{ height: 60, background: 'rgba(0,0,0,0.85)' }}
      >
        <span className="font-display font-bold text-[2rem] text-white/90 uppercase tracking-widest">
          SAGMA Gem Table
        </span>
      </div>

      {/* Bottom bar */}
      <div className="fixed inset-x-0 bottom-0" style={{ zIndex: 25 }}>
        <div
          className="w-full flex items-center justify-center"
          style={{ height: 50, background: 'rgba(0,0,0,0.85)' }}
        >
          <span className="font-display font-bold text-[1.25rem] text-white/80 uppercase tracking-wider">
            Appraised Gem Quality: {info}%
          </span>
        </div>
      </div>
    </div>
  )
}
