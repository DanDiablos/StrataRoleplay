import { X, Bell, Check, XCircle } from 'lucide-react'
import { useStore } from '../store'
import { sendNui } from '../nui'
import type { LaptopNotification } from '../types'

interface NotificationsProps {
  onClose: () => void
}

function NotifItem({ notif }: { notif: LaptopNotification }) {
  const dispatch = useStore(s => s.dispatch)

  const handleAction = (type: 'accept' | 'cancel') => {
    if (!notif.action || !notif.data) return
    const eventKey = type === 'accept' ? notif.action.accept : notif.action.cancel
    if (!eventKey) return
    sendNui('AcceptPopup', {
      event: eventKey,
      data: { ...(notif.data as object), server: false },
    })
    if (notif._id) dispatch('NOTIF_HIDE', { id: notif._id })
  }

  const handleDismiss = () => {
    if (notif._id) dispatch('NOTIF_HIDE', { id: notif._id })
    else dispatch('NOTIF_DISMISS_ALL', {})
  }

  const appName = typeof notif.app === 'string' ? notif.app : 'system'
  const hasActions = notif.action && (notif.action.accept || notif.action.cancel)

  return (
    <div className="border-b border-white/[0.06] last:border-0 animate-slide-in">
      <div className="px-4 py-3 flex flex-col gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-0.5 flex-1 min-w-0">
            <span className="font-medium text-[0.82rem] text-white/90 leading-snug">{notif.title}</span>
            {notif.description && (
              <span className="text-[0.75rem] text-white/50 leading-snug">{notif.description}</span>
            )}
          </div>
          <button
            onClick={handleDismiss}
            className="w-5 h-5 flex items-center justify-center text-white/20 hover:text-white/60 transition-colors shrink-0 mt-0.5"
          >
            <X size={11} />
          </button>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[0.62rem] text-white/25 uppercase tracking-[0.05em]">{appName}</span>
          {hasActions && (
            <div className="flex items-center gap-1 ml-auto">
              {notif.action?.accept && (
                <button
                  onClick={() => handleAction('accept')}
                  className="flex items-center gap-1 px-2 py-0.5 border border-menu-success/40 bg-menu-success/10 text-menu-success-lt text-[0.68rem] font-medium hover:bg-menu-success/20 transition-colors"
                >
                  <Check size={9} />
                  Accept
                </button>
              )}
              {notif.action?.cancel && (
                <button
                  onClick={() => handleAction('cancel')}
                  className="flex items-center gap-1 px-2 py-0.5 border border-menu-error-lt/40 bg-menu-error/15 text-red-300/70 text-[0.68rem] font-medium hover:bg-menu-error/25 transition-colors"
                >
                  <XCircle size={9} />
                  Deny
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Notifications({ onClose }: NotificationsProps): React.ReactElement {
  const notifications = useStore(s => s.notifications)
  const dispatch = useStore(s => s.dispatch)

  const visible = notifications.filter(n => n.show)

  return (
    <div className="w-[300px] h-full flex flex-col border-l border-white/[0.06] bg-menu-surface animate-slide-in shrink-0">
      {/* Header */}
      <div className="h-[44px] flex items-center px-4 border-b border-white/[0.06] shrink-0">
        <Bell size={13} className="text-white/40 mr-2" />
        <span className="font-display font-bold uppercase tracking-[2px] text-[0.72rem] text-white/60 flex-1">
          Notifications
        </span>
        {visible.length > 0 && (
          <button
            onClick={() => dispatch('NOTIF_DISMISS_ALL', {})}
            className="font-mono text-[0.62rem] text-white/25 hover:text-white/60 uppercase tracking-[0.05em] mr-2 transition-colors"
          >
            Clear all
          </button>
        )}
        <button
          onClick={onClose}
          className="w-5 h-5 flex items-center justify-center text-white/20 hover:text-white/60 transition-colors"
        >
          <X size={12} />
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
            <Bell size={24} className="text-white/15" />
            <span className="font-mono text-[0.68rem] text-white/20 uppercase tracking-[0.08em]">No notifications</span>
          </div>
        ) : (
          visible.map((n, i) => (
            <NotifItem key={n._id ?? i} notif={n} />
          ))
        )}
      </div>
    </div>
  )
}
