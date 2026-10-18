import { useStore } from '../../store.ts'
import DOMPurify from 'dompurify'
import parse from 'html-react-parser'

export default function InfoOverlay(): JSX.Element | null {
  const showing = useStore(s => s.infoOverlayShowing)
  const info = useStore(s => s.infoOverlayInfo)

  if (!showing || !info) return null

  const renderDescription = () => {
    if (!info.description) return null

    // Hints array
    if (Array.isArray(info.description)) {
      return (
        <div className="flex flex-col gap-2 px-4 py-3 pl-5">
          {info.description.map((hint, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {hint.keys.map((k: string, ki: number) => (
                  <span key={ki}>
                    {ki > 0 && <span className="text-white/20 mx-0.5">/</span>}
                    <span
                      className="inline-flex items-center justify-center font-bold text-[0.7rem] px-2 py-0.5 min-w-[22px] text-[#FF5C3A]"
                      style={{
                        background: 'rgba(255,92,58,0.12)',
                        border: '1px solid rgba(255,92,58,0.3)',
                      }}
                    >
                      {k}
                    </span>
                  </span>
                ))}
              </div>
              <span className="text-[0.75rem] font-bold text-white/50 drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,1)]">
                {hint.label}
              </span>
            </div>
          ))}
        </div>
      )
    }

    // String — parse "Key: Value" lines from <br> separated text
    const raw = DOMPurify.sanitize(info.description as string)
    const lines = raw.split(/<br\s*\/?>/i).filter(Boolean)

    return (
      <div className="flex flex-col px-4 py-3 pl-5">
        {lines.map((line, i) => {
          const colonIdx = line.indexOf(':')
          if (colonIdx > 0) {
            const label = line.slice(0, colonIdx).trim()
            const value = line.slice(colonIdx + 1).trim()
            return (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-white/[0.04] last:border-0">
                <span className="text-[0.7rem] font-bold text-white/30 uppercase drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,1)]">
                  {label}
                </span>
                <span className="text-[0.75rem] font-bold text-white/80 drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,1)]">
                  {parse(value)}
                </span>
              </div>
            )
          }
          return (
            <div key={i} className="py-1.5 text-[0.75rem] font-bold text-white/50 drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,1)]">
              {parse(line)}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div
      className="fixed animate-fade-in pointer-events-none"
      style={{ right: 24, top: '30%', width: 280, zIndex: 20 }}
    >
      <div
        className="relative border overflow-hidden"
        style={{
          background: 'rgba(10,10,10,0.92)',
          borderColor: 'rgba(255,92,58,0.25)',
        }}
      >
        {/* Left accent */}
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#FF5C3A]" />

        {/* Header */}
        <div className="px-4 py-3 pl-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {info.icon && (
                <span className="text-[1rem]">{info.icon}</span>
              )}
              <span className="text-[0.82rem] font-bold text-white/80 drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,1)]">
                {info.label}
              </span>
            </div>
            {info.live && (
              <div className="flex items-center gap-1.5">
                <div className="w-[6px] h-[6px] rounded-full bg-[#FE2436] animate-flash" />
                <span className="text-[0.6rem] font-bold text-[#FE2436]/70 uppercase drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,1)]">
                  LIVE
                </span>
              </div>
            )}
          </div>
          {info.sub && (
            <span className="text-[0.65rem] font-bold text-white/30 mt-0.5 block drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,1)]">
              {info.sub}
            </span>
          )}
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-white/[0.06]" />

        {renderDescription()}
      </div>
    </div>
  )
}
