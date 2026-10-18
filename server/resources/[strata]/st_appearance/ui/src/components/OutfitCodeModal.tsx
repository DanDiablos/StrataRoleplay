import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Copy, Check, Download } from 'lucide-react'

interface Props {
  open: boolean
  mode: 'export' | 'import'
  code?: string
  onImport: (code: string) => void
  onClose: () => void
}

function copyToClipboard(text: string): void {
  const ta = document.createElement('textarea')
  ta.value = text
  ta.style.position = 'fixed'
  ta.style.opacity = '0'
  document.body.appendChild(ta)
  ta.select()
  document.execCommand('copy')
  document.body.removeChild(ta)
}

export default function OutfitCodeModal({ open, mode, code, onImport, onClose }: Props): React.ReactElement | null {
  const [inputValue, setInputValue] = useState('')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!open) {
      setInputValue('')
      setCopied(false)
      setError('')
    }
  }, [open])

  useEffect(() => {
    if (open && mode === 'export' && textareaRef.current) {
      textareaRef.current.select()
    }
  }, [open, mode])

  if (!open) return null

  const handleCopy = () => {
    if (!code) return
    copyToClipboard(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleImport = () => {
    const trimmed = inputValue.trim()
    if (!trimmed) {
      setError('Please paste an outfit code')
      return
    }
    try {
      const decoded = JSON.parse(atob(trimmed))
      if (!decoded.components && !decoded.props) {
        setError('Invalid outfit code')
        return
      }
      onImport(trimmed)
    } catch {
      setError('Invalid outfit code')
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="w-[420px] bg-menu-surface border border-white/10 flex flex-col animate-fade-in">
        <div className="flex items-center justify-between px-4 py-3 bg-menu-bg/60 border-b border-white/[0.06]">
          <span className="font-display font-bold uppercase tracking-[2px] text-[0.78rem] text-white/70">
            {mode === 'export' ? 'Export Outfit Code' : 'Import Outfit Code'}
          </span>
          <button onClick={onClose} className="text-white/30 hover:text-white/70 transition-colors">
            <X size={14} />
          </button>
        </div>

        <div className="px-4 py-4 flex flex-col gap-3">
          {mode === 'export' ? (
            <>
              <p className="text-[0.75rem] text-white/40 uppercase tracking-[0.5px]">
                Share this code to transfer your outfit
              </p>
              <textarea
                ref={textareaRef}
                readOnly
                value={code ?? ''}
                className="h-24 px-3 py-2 bg-menu-surface-lt border border-white/10 text-[0.78rem] text-white/60 font-mono resize-none focus:border-primary/50 transition-colors"
                onClick={(e) => (e.target as HTMLTextAreaElement).select()}
              />
              <button
                onClick={handleCopy}
                className="flex items-center justify-center gap-2 py-2 px-4 border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 text-[0.82rem] font-semibold uppercase tracking-[0.3px] transition-colors"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy Code'}
              </button>
            </>
          ) : (
            <>
              <p className="text-[0.75rem] text-white/40 uppercase tracking-[0.5px]">
                Paste an outfit code to apply it
              </p>
              <textarea
                value={inputValue}
                onChange={(e) => { setInputValue(e.target.value); setError('') }}
                placeholder="Paste outfit code here..."
                className="h-24 px-3 py-2 bg-menu-surface-lt border border-white/10 text-[0.78rem] text-white/80 font-mono resize-none placeholder-white/25 focus:border-primary/50 transition-colors"
              />
              {error && (
                <span className="text-[0.72rem] text-red-400/80">{error}</span>
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleImport}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-4 border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 text-[0.82rem] font-semibold uppercase tracking-[0.3px] transition-colors"
                >
                  <Download size={14} />
                  Apply
                </button>
                <button
                  onClick={onClose}
                  className="py-2 px-4 border border-white/10 bg-white/[0.03] text-white/50 hover:bg-white/[0.07] text-[0.82rem] font-semibold uppercase tracking-[0.3px] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
