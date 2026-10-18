import { CheckCircle, AlertCircle } from 'lucide-react'
import { useEffect } from 'react'

interface ToastProps {
  message: string
  type: 'success' | 'error'
  onDone: () => void
}

export default function Toast({ message, type, onDone }: ToastProps): React.ReactElement {
  useEffect(() => {
    const t = setTimeout(onDone, 3000)
    return () => clearTimeout(t)
  }, [onDone])

  const styles = type === 'success'
    ? 'bg-menu-success/15 border-menu-success/30 text-menu-success-lt'
    : 'bg-menu-error/20 border-menu-error-lt/40 text-red-300'

  return (
    <div className={`animate-toast-in flex items-center gap-3 px-4 py-3 border ${styles} text-sm font-medium`}>
      {type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
      <span className="text-[0.82rem]">{message}</span>
    </div>
  )
}
