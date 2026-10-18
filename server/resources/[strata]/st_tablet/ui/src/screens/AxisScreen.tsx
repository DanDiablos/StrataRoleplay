import { ArrowLeft, X, Home, FileText, Receipt, MessageSquare, Car, Search, ClipboardList, Clock, CreditCard } from 'lucide-react'
import { useStore } from '../store'
import { sendNui } from '../nui'
import type { AxisPage } from '../types'

import DashboardTab from './axis/DashboardTab.tsx'
import DocumentsTab from './axis/DocumentsTab.tsx'
import ReceiptsTab from './axis/ReceiptsTab.tsx'
import NoticesTab from './axis/NoticesTab.tsx'
import FleetTab from './axis/FleetTab.tsx'
import TwitterTab from './axis/TwitterTab.tsx'
import PDMSalesTab from './axis/PDMSalesTab.tsx'
import PDMCreditTab from './axis/PDMCreditTab.tsx'
import PDMManageTab from './axis/PDMManageTab.tsx'
import PDMHistoryTab from './axis/PDMHistoryTab.tsx'
import DynastyPropertiesTab from './axis/DynastyPropertiesTab.tsx'
import DynastyCreditTab from './axis/DynastyCreditTab.tsx'
import CasinoBigWinsTab from './axis/CasinoBigWinsTab.tsx'

// ─── Maps ─────────────────────────────────────────────────────────────────────

const PAGE_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Dashboard:             Home,
  'Search/Document':     FileText,
  'Search/Receipt':      Receipt,
  'Search/ReceiptCount': Receipt,
  Tweet:                 MessageSquare,
  TweetSettings:         MessageSquare,
  FleetManagement:       Car,
  'PDM/Sales':           Car,
  'PDM/Credit':          Search,
  'PDM/Manage':          ClipboardList,
  'PDM/SalesHistory':    Clock,
  'Dynasty/Credit':      Search,
  'Dynasty/Properties':  Home,
  'Casino/BigWins':      CreditCard,
}

const PAGE_COMPONENTS: Record<string, React.ComponentType> = {
  Dashboard:             DashboardTab,
  'Search/Document':     DocumentsTab,
  'View/Document':       DocumentsTab,
  'Create/Document':     DocumentsTab,
  'Search/Receipt':      ReceiptsTab,
  'Search/ReceiptCount': ReceiptsTab,
  'View/Receipt':        ReceiptsTab,
  'Create/Receipt':      ReceiptsTab,
  'Create/Notice':       NoticesTab,
  Tweet:                 TwitterTab,
  TweetSettings:         TwitterTab,
  FleetManagement:       FleetTab,
  'PDM/Sales':           PDMSalesTab,
  'PDM/Credit':          PDMCreditTab,
  'PDM/Manage':          PDMManageTab,
  'PDM/SalesHistory':    PDMHistoryTab,
  'Dynasty/Credit':      DynastyCreditTab,
  'Dynasty/Properties':  DynastyPropertiesTab,
  'Casino/BigWins':      CasinoBigWinsTab,
}

// ─── Section helpers ──────────────────────────────────────────────────────────

function getSection(id: string): string | null {
  if (id.startsWith('PDM/'))     return 'PDM'
  if (id.startsWith('Dynasty/')) return 'Dynasty'
  if (id.startsWith('Casino/'))  return 'Casino'
  return null
}

type NavItem =
  | { kind: 'page';      page: AxisPage }
  | { kind: 'divider';   key: string    }

function buildNavItems(pages: AxisPage[]): NavItem[] {
  const items: NavItem[] = []
  let lastSection: string | null = null
  for (const page of pages) {
    const section = getSection(page.id)
    if (section !== null && section !== lastSection) {
      items.push({ kind: 'divider', key: `div-${section}` })
      lastSection = section
    }
    items.push({ kind: 'page', page })
  }
  return items
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function AxisScreen(): React.ReactElement {
  const navigate = useStore(s => s.navigate)
  const axisTab  = useStore(s => s.axisTab)
  const data     = useStore(s => s.data)
  const dispatch = useStore(s => s.dispatch)

  const businessLogo  = data.businessLogo as string | null | undefined
  const businessPages = (data.businessPages as AxisPage[] | null) ?? []

  const visibleTabs  = businessPages.filter(p => !p.hidden && p.id !== 'TweetSettings')
  const navItems     = buildNavItems(visibleTabs)
  const TabComponent = PAGE_COMPONENTS[axisTab] ?? DashboardTab

  const handleClose = () => {
    dispatch('LAPTOP_NOT_VISIBLE')
    sendNui('CloseTablet')
  }

  return (
    <div className="w-full h-full flex flex-col">

      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="h-[52px] shrink-0 flex items-center px-4 gap-3 border-b border-white/[0.06] bg-menu-surface">
        <button
          onClick={() => navigate('home')}
          className="w-7 h-7 flex items-center justify-center border border-white/10 bg-white/[0.03] text-white/30 hover:text-white/60 transition-colors"
        >
          <ArrowLeft size={13} />
        </button>

        {businessLogo ? (
          <img src={businessLogo} alt="Business" className="h-7 max-w-[80px] object-contain" />
        ) : (
          <div className="flex items-center gap-2">
            <span
              className="font-display font-black tracking-[0.1em] text-[1.05rem] select-none"
              style={{ background: 'linear-gradient(90deg, #FF5C3A, #FF8C42)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              STRATA
            </span>
            <span className="font-mono text-[0.65rem] text-white/25 uppercase">/ axis</span>
          </div>
        )}

        <div className="flex-1" />

        <button
          onClick={handleClose}
          className="flex items-center gap-1.5 font-mono text-[0.65rem] text-white/25 hover:text-white/60 uppercase tracking-[0.05em] transition-colors"
        >
          <X size={11} />
          <span>ESC</span>
        </button>
      </div>

      {/* ── Tab navbar ────────────────────────────────────────────── */}
      <div className="h-10 shrink-0 flex items-stretch bg-[#0c0c0c]">
        {visibleTabs.length === 0 ? (
          <span className="flex items-center px-4 font-mono text-[0.65rem] text-white/20 uppercase tracking-[0.04em]">
            No access
          </span>
        ) : (
          navItems.map((item, i) => {
            if (item.kind === 'divider') {
              return (
                <div key={item.key} className="flex items-center px-1">
                  <div className="w-px h-4 bg-white/[0.08]" />
                </div>
              )
            }

            const { page } = item
            const Icon     = PAGE_ICONS[page.id] ?? FileText
            const isActive = axisTab === page.id

            return (
              <button
                key={page.id}
                onClick={() => navigate('bizwiz', { axisTab: page.id })}
                className={`flex-1 flex items-center justify-center gap-2 h-full border-b-[2px] text-[0.78rem] font-medium uppercase tracking-[0.3px] whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-b-primary text-white bg-white/3'
                    : 'border-b-transparent text-white/40 hover:text-white/70 hover:bg-white/3'
                }`}
              >
                <Icon size={13} className={isActive ? 'text-primary' : 'text-white/30'} />
                {page.label}
              </button>
            )
          })
        )}
      </div>

      {/* ── Content ───────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <TabComponent />
      </div>
    </div>
  )
}
