import { LayoutDashboard, Users, UserMinus, Search, Package, Car, CarFront, DoorClosed, LucideIcon } from 'lucide-react'
import { useStore, Screen } from '../store.ts'

interface NavItem {
  screen: Screen
  label: string
  icon: LucideIcon
  minLevel?: number
}

const NAV_ITEMS: NavItem[] = [
  { screen: 'dashboard',       label: 'Dashboard',       icon: LayoutDashboard },
  { screen: 'players',         label: 'Players',         icon: Users           },
  { screen: 'disconnected',    label: 'Disconnected',    icon: UserMinus       },
  { screen: 'characters',      label: 'Characters',      icon: Search          },
  { screen: 'items',           label: 'Items',           icon: Package         },
  { screen: 'vehicles',        label: 'Vehicles',        icon: Car,  minLevel: 75 },
  { screen: 'current-vehicle', label: 'Current Vehicle', icon: CarFront, minLevel: 75 },
  { screen: 'doorlocks',       label: 'Doorlocks',       icon: DoorClosed      },
]

export default function NavBar(): React.ReactElement {
  const screen = useStore((s) => s.screen)
  const compact = useStore((s) => s.compact)
  const permissionLevel = useStore((s) => s.permissionLevel)
  const navigate = useStore((s) => s.navigate)

  const activeScreen = screen === 'view-player' ? 'players'
    : screen === 'view-vehicle' ? 'vehicles'
    : screen === 'view-doorlock' ? 'doorlocks'
    : screen

  const visibleItems = NAV_ITEMS.filter((item) => !item.minLevel || permissionLevel >= item.minLevel)

  if (compact) {
    return (
      <div className="flex flex-col shrink-0 w-[52px] bg-[#0c0c0c] border-r border-white/[0.06] overflow-y-auto">
        {visibleItems.map((item) => {
          const Icon = item.icon
          const isActive = item.screen === activeScreen
          return (
            <button
              key={item.screen}
              onClick={() => navigate(item.screen)}
              title={item.label}
              className={`flex items-center justify-center w-full h-10 transition-colors border-l-[3px]
                ${isActive
                  ? 'border-l-primary text-primary bg-white/3'
                  : 'border-l-transparent text-white/30 hover:text-white/60 hover:bg-white/3'
                }`}
            >
              <Icon size={15} />
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div className="h-10 flex items-stretch shrink-0 bg-[#0c0c0c]">
      {visibleItems.map((item) => {
        const Icon = item.icon
        const isActive = item.screen === activeScreen
        return (
          <button
            key={item.screen}
            onClick={() => navigate(item.screen)}
            className={`flex-1 flex items-center justify-center gap-2 h-full border-b-[2px] text-[0.78rem] font-medium uppercase tracking-[0.3px] whitespace-nowrap transition-colors
              ${isActive
                ? 'border-b-primary text-white bg-white/3'
                : 'border-b-transparent text-white/40 hover:text-white/70 hover:bg-white/3'
              }`}
          >
            <Icon size={13} className={isActive ? 'text-primary' : 'text-white/30'} />
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
