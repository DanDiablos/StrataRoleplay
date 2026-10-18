import { X, CheckCircle, AlertCircle } from 'lucide-react'
import { useStore, ToastItem } from '../store.ts'

function ToastCard({ toast }: { toast: ToastItem }): React.ReactElement {
  const removeToast = useStore((s) => s.removeToast)
  const isSuccess = toast.type === 'success'

  return (
    <div
      className={`animate-toast-in flex items-center gap-3 px-4 py-3 border text-sm font-medium
        ${isSuccess
          ? 'bg-menu-success/15 border-menu-success/30 text-menu-success-lt'
          : 'bg-menu-error/20 border-menu-error-lt/40 text-red-300'
        }`}
    >
      {isSuccess
        ? <CheckCircle size={14} className="shrink-0" />
        : <AlertCircle size={14} className="shrink-0" />
      }
      <span className="flex-1 text-[0.82rem]">{toast.message}</span>
      <button
        onClick={() => removeToast(toast.id)}
        className="text-white/30 hover:text-white/70 shrink-0"
      >
        <X size={12} />
      </button>
    </div>
  )
}

export default function Toast(): React.ReactElement | null {
  const toasts = useStore((s) => s.toasts)
  if (toasts.length === 0) return null

  return (
    <div className="absolute bottom-4 right-4 z-[500] flex flex-col gap-2 w-[320px]">
      {toasts.map((t) => <ToastCard key={t.id} toast={t} />)}
    </div>
  )
}
