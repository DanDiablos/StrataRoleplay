import { useRef, useState, useCallback, useEffect } from 'react'
import { X, Maximize2, UserRound, PersonStanding, ChevronsDown } from 'lucide-react'
import { sendNui } from '../nui.ts'
import AnimationPicker from './AnimationPicker'

type CameraView = 0 | 1 | 2 | 3

interface CamDef { id: CameraView; icon: React.ReactNode; title: string }
const CAMERAS: CamDef[] = [
  { id: 0, icon: <Maximize2     size={13} />, title: 'Full View'   },
  { id: 1, icon: <UserRound     size={13} />, title: 'Head View'   },
  { id: 2, icon: <PersonStanding size={13} />, title: 'Body View'  },
  { id: 3, icon: <ChevronsDown  size={13} />, title: 'Legs View'   },
]

interface Props {
  label: string
  tabs: string[]
  activeTab: number
  onTabChange: (i: number) => void
  onClose: () => void
  hideClose?: boolean
  footer?: React.ReactNode
  children: React.ReactNode
}

export default function PedShell({ label, tabs, activeTab, onTabChange, onClose, hideClose = false, footer, children }: Props): React.ReactElement {
  const [dragging,   setDragging]   = useState(false)
  const [activeView, setActiveView] = useState<CameraView>(0)
  const lastX   = useRef(0)
  const zoomVel = useRef(0)
  const zoomRaf = useRef<number | null>(null)

  useEffect(() => {
    sendNui('GetAllDrawableVariations', {
      componentIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      propIds: [0, 1, 2, 6, 7],
    })
    return () => { if (zoomRaf.current !== null) cancelAnimationFrame(zoomRaf.current) }
  }, [])

  const startDrag = (e: React.MouseEvent) => {
    setDragging(true)
    lastX.current = e.clientX
  }

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return
    const delta = (e.clientX - lastX.current) * 0.5
    lastX.current = e.clientX
    if (Math.abs(delta) > 0.2) sendNui('RotateDelta', { delta })
  }, [dragging])

  const stopDrag = () => setDragging(false)

  const onWheel = (e: React.WheelEvent) => {
    zoomVel.current += e.deltaY > 0 ? 0.25 : -0.25
    if (zoomRaf.current !== null) return
    const tick = () => {
      if (Math.abs(zoomVel.current) < 0.05) {
        zoomVel.current = 0
        zoomRaf.current = null
        return
      }
      sendNui('Zoom', { zoom: zoomVel.current * 0.2 })
      zoomVel.current *= 0.78
      zoomRaf.current = requestAnimationFrame(tick)
    }
    zoomRaf.current = requestAnimationFrame(tick)
  }

  const setView = (id: CameraView) => {
    setActiveView(id)
    sendNui('ChangeCamera', id)
  }

  const active = 'border-primary/40 bg-primary/10 text-primary'
  const idle   = 'border-white/10 bg-white/[0.03] text-white/30 hover:text-white/60 hover:border-white/20'
  const iconBtn = 'w-7 h-7 flex items-center justify-center border transition-colors'

  return (
    <div
      className="w-screen h-screen"
      onMouseMove={onMouseMove}
      onMouseUp={stopDrag}
      onMouseLeave={stopDrag}
    >
      {/* ── Top navbar ─────────────────────────────────────────────── */}
      <div
        className="fixed top-0 left-0 right-0 z-[100] select-none"
        style={{
          height: 52,
          background: 'rgba(10,10,10,0.97)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'stretch',
        }}
      >
        {/* Left: wordmark */}
        <div
          className="flex items-center gap-2 px-5"
          style={{ borderRight: '1px solid rgba(255,255,255,0.07)' }}
        >
          <span
            className="font-display font-black tracking-[0.1em] text-[1rem]"
            style={{
              background: 'linear-gradient(90deg, #FF5C3A, #FF8C42)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            STRATA
          </span>
          <span className="font-mono text-[0.85rem]" style={{ color: 'rgba(255,255,255,0.15)' }}>/</span>
          <span className="font-mono text-[0.68rem] tracking-[0.02em]" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {label}
          </span>
        </div>

        {/* Center: tabs (truly centered) */}
        <div className="flex items-stretch">
          {tabs.map((tab, i) => (
            <button
              key={tab}
              onClick={() => onTabChange(i)}
              className="relative px-4 font-medium text-[0.72rem] uppercase tracking-[0.06em] transition-colors"
              style={{
                color: i === activeTab ? '#FF5C3A' : 'rgba(255,255,255,0.35)',
                borderRight: '1px solid rgba(255,255,255,0.05)',
              }}
              onMouseEnter={(e) => { if (i !== activeTab) e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}
              onMouseLeave={(e) => { if (i !== activeTab) e.currentTarget.style.color = 'rgba(255,255,255,0.35)' }}
            >
              {tab}
              {i === activeTab && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" />
              )}
            </button>
          ))}
        </div>

        {/* Right: camera icons + ESC/close */}
        <div
          className="flex items-center justify-end gap-1.5 px-5"
          style={{ borderLeft: '1px solid rgba(255,255,255,0.07)' }}
        >
          {CAMERAS.map(({ id, icon, title }) => (
            <button
              key={id}
              onClick={() => setView(id)}
              title={title}
              className={`${iconBtn} ${activeView === id ? active : idle}`}
            >
              {icon}
            </button>
          ))}
          <AnimationPicker />

          <div className="w-px h-5 bg-white/10 mx-1.5" />

          <span className="font-mono text-[0.58rem] uppercase tracking-[0.05em] mr-2" style={{ color: 'rgba(255,255,255,0.22)' }}>
            drag rotate · scroll zoom
          </span>

          {!hideClose && (
            <>
              <div className="w-px h-5 bg-white/10 mx-1.5" />
              <span
                className="font-mono uppercase tracking-[0.06em] text-[0.6rem] mr-1"
                style={{ color: 'rgba(255,255,255,0.30)' }}
              >
                ESC
              </span>
              <button
                onClick={onClose}
                title="Close"
                className={`${iconBtn} ${idle}`}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = 'rgba(255,255,255,0.3)' }}
              >
                <X size={13} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Body (below navbar) ───────────────────────────────────── */}
      <div className="flex h-screen pt-[52px]">
        {/* Left: transparent drag area */}
        <div
          className={`flex-1 flex flex-col justify-end pb-6 pl-6 ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          onMouseDown={startDrag}
          onWheel={onWheel}
        >
          <p className="font-mono text-[0.62rem] text-white/20 uppercase tracking-[0.5px] select-none pointer-events-none">
            Drag to rotate · Scroll to zoom
          </p>
        </div>

        {/* Right: floating card */}
        <div className="flex flex-col justify-start pt-5 pr-5 pb-5 shrink-0">
          <div
            className="flex flex-col overflow-hidden"
            style={{
              width: 380,
              maxHeight: 'calc(100vh - 92px)',
              background: 'rgba(10,10,10,0.95)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
            }}
          >
            <div className="flex-1 min-h-0 overflow-y-auto">
              {children}
            </div>
            {footer && (
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
