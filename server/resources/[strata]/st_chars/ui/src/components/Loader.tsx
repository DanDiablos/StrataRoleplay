import { useStore } from '../store'
import Navbar from './Navbar'

export default function Loader(): React.ReactElement | null {
  const loading = useStore(s => s.loading)
  const message = useStore(s => s.loadingMessage)

  if (!loading) return null

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-transparent">
      <Navbar subLabel="loading" />

      <div className="flex items-baseline gap-[0.15em] leading-none mb-5">
        <span className="font-display font-black text-[clamp(3rem,6vw,4.5rem)] text-white leading-none">
          STRATA
        </span>
        <span
          className="font-display font-black text-[clamp(3rem,6vw,4.5rem)] leading-none"
          style={{ background: 'linear-gradient(90deg,#FF5C3A,#FF8C42)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
        >
          RP
        </span>
      </div>

      {message && (
        <p className="font-mono text-[0.82rem] font-medium text-white/90 tracking-[0.08em] m-0 bg-black/40 border border-white/[0.12] px-3 py-1">
          {message}
        </p>
      )}

      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/[0.07] overflow-hidden">
        <div
          className="h-full w-1/4"
          style={{
            background: 'linear-gradient(90deg,#FF5C3A,#FF8C42,#FFB347)',
            animation: 'loader-sweep 1.4s ease-in-out infinite',
          }}
        />
      </div>
    </div>
  )
}
