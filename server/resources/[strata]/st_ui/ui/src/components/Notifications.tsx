import { useEffect } from 'react'
import { useStore } from '../store.ts'
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react'
import DOMPurify from 'dompurify'
import parse from 'html-react-parser'

const TYPE_COLORS: Record<string, string> = {
  success: '#52984a',
  error: '#a13434',
  warning: '#f09348',
  info: '#4a9eff',
}

const TYPE_ICONS: Record<string, React.ComponentType<{ size: number; className?: string }>> = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

function timeAgo(created: number, now: number): string {
  const sec = Math.floor((now - created) / 1000)
  if (sec < 60) return 'just now'
  const min = Math.floor(sec / 60)
  return `${min}m ago`
}

export default function Notifications(): React.ReactElement | null {
  const notifications = useStore(s => s.notifications)
  const dispatch = useStore(s => s.dispatch)

  // Auto-remove timed notifications
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []

    notifications.forEach(n => {
      if (n.duration > 0 && !n.hide) {
        const elapsed = Date.now() - n.created
        const remaining = n.duration - elapsed

        if (remaining <= 0) {
          dispatch('HIDE_ALERT', { id: n._id })
        } else {
          const t = setTimeout(() => {
            dispatch('HIDE_ALERT', { id: n._id })
          }, remaining)
          timers.push(t)
        }
      }
    })

    return () => timers.forEach(clearTimeout)
  }, [notifications, dispatch])

  // Remove hidden notifications after animation
  useEffect(() => {
    const hidden = notifications.filter(n => n.hide)
    if (hidden.length === 0) return

    const timers = hidden.map(n =>
      setTimeout(() => dispatch('REMOVE_ALERT', { id: n._id }), 300),
    )
    return () => timers.forEach(clearTimeout)
  }, [notifications, dispatch])

  if (notifications.length === 0) return null

  // Sort: permanent first, then by created desc
  const sorted = [...notifications].sort((a, b) => {
    const aPerm = a.duration <= 0
    const bPerm = b.duration <= 0
    if (aPerm !== bPerm) return aPerm ? -1 : 1
    return b.created - a.created
  })

  return (
    <div
      className="fixed flex flex-col gap-2 pointer-events-none"
      style={{ top: 16, right: 16, width: 320, zIndex: 80 }}
    >
      {sorted.map(n => (
        <NotificationItem key={n._id} notification={n} />
      ))}
    </div>
  )
}

function NotificationItem({
  notification: n,
}: {
  notification: {
    _id: string | number
    type: string
    message: string
    icon: string
    duration: number
    created: number
    hide: boolean
    style?: { alert?: string; body?: string; progress?: string }
  }
}): React.ReactElement {
  const color = TYPE_COLORS[n.type] ?? TYPE_COLORS.info
  const Icon = TYPE_ICONS[n.type] ?? Info
  const isPermanent = n.duration <= 0

  const remainingMs = n.duration > 0 ? Math.max(0, n.duration - (Date.now() - n.created)) : 0
  const startPct = n.duration > 0 ? (remainingMs / n.duration) * 100 : 100

  return (
    <div
      className={`relative overflow-hidden border ${n.hide ? 'animate-fade-out' : 'animate-toast-in'}`}
      style={{
        background: 'rgba(10,10,10,0.92)',
        borderColor: `${color}40`,
      }}
    >
      {/* Left accent */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px]"
        style={{ background: color }}
      />

      <div className="flex items-start gap-3 px-4 py-3 pl-5">
        <Icon size={16} className="shrink-0 mt-0.5" style={{ color }} />
        <div className="flex-1 min-w-0">
          <div className="text-[0.82rem] text-white/80 leading-snug">
            {parse(DOMPurify.sanitize(n.message))}
          </div>
          <span className="text-[0.6rem] text-white/25 mt-1 block">
            {isPermanent ? 'pinned' : timeAgo(n.created, Date.now())}
          </span>
        </div>
      </div>

      {/* Progress bar — CSS animation from current width to 0 */}
      {n.duration > 0 && (
        <div
          className="absolute bottom-0 left-0 h-[2px]"
          style={{
            width: `${startPct}%`,
            background: color,
            animation: `notif-drain ${remainingMs}ms linear forwards`,
          }}
        />
      )}
    </div>
  )
}
