import { X } from 'lucide-react'
import { useStore } from '../store.ts'

export default function Toast(): React.ReactElement | null {
  const toasts      = useStore(s => s.toasts)
  const removeToast = useStore(s => s.removeToast)

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-6 right-6 z-[400] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`animate-toast-in flex items-center gap-3 px-4 py-3 border min-w-[280px] max-w-[360px] pointer-events-auto ${
            t.type === 'success'
              ? 'bg-menu-success/15 border-menu-success/30 text-menu-success-lt'
              : 'bg-menu-error/20 border-menu-error-lt/40 text-red-300'
          } text-[0.85rem] font-medium`}
        >
          <span className="flex-1">{t.message}</span>
          <button
            onClick={() => removeToast(t.id)}
            className="text-current opacity-50 hover:opacity-100 transition-opacity shrink-0"
          >
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  )
}
