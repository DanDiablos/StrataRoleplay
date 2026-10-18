import { Eye } from 'lucide-react'
import { useStore } from '../store.ts'
import { sendNui } from '../nui.ts'

export default function ThirdEye(): React.ReactElement | null {
  const showing = useStore(s => s.eyeShowing)
  const menuOpen = useStore(s => s.eyeMenuOpen)
  const menu = useStore(s => s.eyeMenu)

  if (!showing) return null

  const handleAction = (item: typeof menu[number]) => {
    sendNui('targetingAction', { event: item.event, data: item.data ?? {} })
  }

  const handleClose = () => {
    sendNui('targetingAction', { close: true })
  }

  return (
    <div
      className="fixed pointer-events-none animate-fade-in"
      style={{
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 70,
      }}
    >
      {/* Eye icon */}
      <div className="flex flex-col items-center">
        <Eye
          size={menuOpen ? 28 : 22}
          className="text-primary transition-all duration-150"
          style={{ filter: 'drop-shadow(0 0 6px rgba(255,92,58,0.4))' }}
        />

        {/* Menu items */}
        {menuOpen && menu.length > 0 && (
          <div className="flex flex-col gap-1 mt-3 pointer-events-auto">
            {menu.map((item, i) => (
              <button
                key={i}
                onClick={() => handleAction(item)}
                className="flex items-center gap-2 px-3 py-1.5 bg-[rgba(10,10,10,0.9)] border border-white/8 text-white/70 hover:bg-primary/10 hover:text-white/90 transition-colors whitespace-nowrap"
              >
                {item.icon && (
                  <span className="text-primary text-[0.75rem]">{item.icon}</span>
                )}
                <span className="text-[0.78rem] font-medium">{item.text}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
