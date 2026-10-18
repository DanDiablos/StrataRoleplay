import React from 'react'
import { Home, ChevronLeft } from 'lucide-react'
import { useStore } from '../store'

export default function Footer(): React.ReactElement {
  const goHome = useStore((s) => s.goHome)
  const goBack = useStore((s) => s.goBack)
  const currentApp = useStore((s) => s.currentApp)

  return (
    <div className="flex items-center justify-center gap-6 h-10 mb-3 shrink-0 bg-black/30">
      {/* Back — only visible when there's something to go back to */}
      <button
        onClick={goBack}
        className={`w-8 h-8 flex items-center justify-center text-white/30 hover:text-white/60 transition-opacity duration-150 ${
          currentApp ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <ChevronLeft size={16} />
      </button>

      {/* Home */}
      <button
        onClick={goHome}
        className="w-9 h-9 flex items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/40 hover:text-white/70 hover:bg-white/8 transition-colors"
      >
        <Home size={15} />
      </button>

      {/* Placeholder right side for symmetry */}
      <div className="w-8 h-8" />
    </div>
  )
}
