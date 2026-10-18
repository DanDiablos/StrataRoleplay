import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { useStore } from '../../store.ts'
import { sendNui } from '../../nui.ts'
import DOMPurify from 'dompurify'
import parse from 'html-react-parser'

export default function ListMenu(): JSX.Element | null {
  const showing = useStore(s => s.listShowing)
  const active = useStore(s => s.listActive)
  const stack = useStore(s => s.listStack)
  const menus = useStore(s => s.listMenus)
  const dispatch = useStore(s => s.dispatch)

  const [search, setSearch] = useState('')

  useEffect(() => { setSearch('') }, [active])

  useEffect(() => {
    if (!showing) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        sendNui('ListMenu:Close')
        dispatch('CLOSE_LIST_MENU')
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [showing, dispatch])

  if (!showing) return null

  const menu = menus[active]
  if (!menu) return null

  const filtered = menu.items.filter(item => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      item.label?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q)
    )
  })

  const handleBack = () => {
    sendNui('ListMenu:Back')
    dispatch('LIST_GO_BACK')
  }

  const handleClose = () => {
    sendNui('ListMenu:Close')
    dispatch('CLOSE_LIST_MENU')
  }

  const handleClick = (item: typeof menu.items[number]) => {
    if (item.disabled) return
    if (item.submenu) {
      sendNui('ListMenu:SubMenu', { submenu: item.submenu })
      dispatch('CHANGE_MENU', { menu: item.submenu })
    } else if (item.event) {
      sendNui('ListMenu:Clicked', { event: item.event, data: item.data ?? {} })
    }
  }

  const handleActionClick = (e: React.MouseEvent, action: { event: string; data?: Record<string, unknown> }) => {
    e.stopPropagation()
    sendNui('ListMenu:Clicked', { event: action.event, data: action.data ?? {} })
  }

  return createPortal(
    <div className="fixed inset-0 flex justify-end items-center pr-4 animate-fade-in" style={{ zIndex: 100 }}>
      <div
        className="relative flex flex-col border overflow-hidden max-h-[80vh]"
        style={{
          width: 320,
          background: 'rgba(10,10,10,0.92)',
          borderColor: 'rgba(255,92,58,0.25)',
        }}
      >
        {/* Left accent */}
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#FF5C3A]" />

        {/* Header */}
        <div className="flex items-center justify-between px-4 shrink-0 relative pl-5" style={{ height: 48 }}>
          <div className="flex items-center gap-3">
            {stack.length > 0 && (
              <button
                onClick={handleBack}
                className="w-7 h-7 flex items-center justify-center border border-white/10 bg-white/[0.03] text-white/30 hover:text-white/60 transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
            )}
            <span className="text-[0.82rem] font-bold text-white/80 drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,1)]">
              {menu.label}
            </span>
          </div>
          <button
            onClick={handleClose}
            className="w-7 h-7 flex items-center justify-center border border-white/10 bg-white/[0.03] text-white/30 hover:text-[#FE2436] hover:border-[#FE2436]/40 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-white/[0.06]" />

        {/* Search */}
        <div className="px-3 py-2.5 shrink-0 pl-5">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/20" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full h-8 pl-8 pr-3 bg-black/30 rounded-[4px] border-none text-[0.78rem] text-white/80 placeholder-white/20 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {filtered.map((item, i) => (
            <div
              key={i}
              onClick={() => handleClick(item)}
              onMouseEnter={() => {
                if (item.event) sendNui('ListMenu:Hover', { event: item.event, data: item.data ?? {} })
              }}
              className={`flex items-center gap-3 px-4 py-2.5 pl-5 cursor-pointer border-b border-white/[0.04] last:border-0 transition-colors ${
                item.disabled ? 'opacity-30 pointer-events-none' : 'hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex-1 min-w-0">
                <span className="text-[0.78rem] font-bold text-white/80 block truncate drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,1)]">
                  {item.label}
                </span>
                {item.description && (
                  <span className="text-[0.65rem] text-white/30 block truncate mt-0.5">
                    {parse(DOMPurify.sanitize(item.description))}
                  </span>
                )}
              </div>
              {item.actions && item.actions.length > 0 && (
                <div className="flex gap-1 shrink-0">
                  {item.actions.map((action, ai) => (
                    <button
                      key={ai}
                      onClick={(e) => handleActionClick(e, action)}
                      className="w-7 h-7 flex items-center justify-center border border-white/10 bg-white/[0.03] text-white/30 hover:text-white/60 transition-colors"
                    >
                      <span className="text-[0.65rem]">{action.icon}</span>
                    </button>
                  ))}
                </div>
              )}
              {item.submenu && (
                <ChevronRight size={13} className="text-white/20 shrink-0" />
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="flex items-center justify-center h-24">
              <span className="text-[0.7vw] font-bold text-white/20 uppercase tracking-wider drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,1)]">
                No results
              </span>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
