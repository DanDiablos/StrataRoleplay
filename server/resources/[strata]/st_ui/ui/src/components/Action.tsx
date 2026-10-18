import { useEffect } from 'react'
import { useStore } from '../store.ts'
import DOMPurify from 'dompurify'

function parseKeyMarkup(raw: string): React.ReactNode[] {
  const clean = DOMPurify.sanitize(raw, { ALLOWED_TAGS: [] })
  const parts: React.ReactNode[] = []
  const regex = /\{key\}(.+?)\{\/key\}/gi
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(clean)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <span key={`t-${lastIndex}`} className="text-white/80 text-[0.82rem] font-medium">
          {clean.slice(lastIndex, match.index)}
        </span>,
      )
    }
    parts.push(
      <span
        key={`k-${match.index}`}
        className="inline-flex items-center justify-center font-bold text-[0.75rem] px-2 py-0.5 mx-1 min-w-[24px] text-[#FF5C3A]"
        style={{
          background: 'rgba(255,92,58,0.12)',
          border: '1px solid rgba(255,92,58,0.3)',
        }}
      >
        {match[1]}
      </span>,
    )
    lastIndex = regex.lastIndex
  }

  if (lastIndex < clean.length) {
    parts.push(
      <span key={`t-${lastIndex}`} className="text-white/80 text-[0.82rem] font-medium">
        {clean.slice(lastIndex)}
      </span>,
    )
  }

  return parts
}

export default function Action(): JSX.Element | null {
  const actionShowing = useStore(s => s.actionShowing)
  const actionMessage = useStore(s => s.actionMessage)
  const actionHiding = useStore(s => s.actionHiding)
  const actions = useStore(s => s.actions)
  const dispatch = useStore(s => s.dispatch)

  const hasLegacy = actionShowing && actionMessage
  const hasActions = actions.length > 0

  // After fade-out animation, clear the actual data
  useEffect(() => {
    if (!actionHiding) return
    const timer = setTimeout(() => {
      dispatch('CLEAR_ACTION')
      dispatch('CLEAR_ALL_ACTIONS')
    }, 300)
    return () => clearTimeout(timer)
  }, [actionHiding, dispatch])

  if (!hasLegacy && !hasActions) return null

  const allActions = [
    ...(hasLegacy ? [{ id: '__legacy', message: actionMessage }] : []),
    ...actions,
  ]

  return (
    <div
      className={`fixed pointer-events-none flex flex-col items-center gap-1.5 ${actionHiding ? 'animate-fade-out' : 'animate-fade-in'}`}
      style={{ bottom: 240, left: '50%', transform: 'translateX(-50%)', zIndex: 5 }}
    >
      <div
        className="relative overflow-hidden border"
        style={{
          background: 'rgba(10,10,10,0.92)',
          borderColor: 'rgba(255,92,58,0.25)',
        }}
      >
        {/* Left accent */}
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#FF5C3A]" />

        <div className="flex flex-col gap-2 px-4 py-2.5 pl-5">
          {allActions.map(a => (
            <div key={a.id} className="flex items-center">
              {parseKeyMarkup(a.message)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
