import { ArrowLeft, ArrowRight, RotateCw, Lock, Globe, X, ChevronLeft, ChevronRight, Newspaper, Radio, Flag, Ghost, Building2, Package } from 'lucide-react'
import { useStore } from '../store'
import { sendNui } from '../nui'

interface Site {
  id:          string
  label:       string
  url:         string
  description: string
  color:       string
  Icon:        React.ComponentType<{ size?: number; style?: React.CSSProperties }>
}

const SITES: Site[] = [
  { id: 'lsnews',        label: 'LS News',        url: 'ls-net://lsnews',        description: 'City news & announcements',        color: '#1a90d4', Icon: Newspaper },
  { id: 'weazel',        label: 'Weazel News',     url: 'ls-net://weazel',        description: 'Breaking news & celebrity gossip', color: '#d4a017', Icon: Radio     },
  { id: 'lsurracing',    label: 'LSUR Racing',     url: 'ls-net://lsurracing',    description: 'Competitive street racing league', color: '#FF5C3A', Icon: Flag      },
  { id: 'lsunderground', label: 'LS Underground',  url: 'ls-net://lsunderground', description: 'Dark web marketplace',             color: '#52984a', Icon: Ghost     },
  { id: 'cityhall',      label: 'City Hall',        url: 'ls-net://cityhall',      description: 'Government services & permits',   color: '#7c4dcc', Icon: Building2 },
  { id: 'blackmarket',   label: 'Black Market',     url: 'ls-net://blackmarket',   description: 'Restricted access only',          color: '#c0392b', Icon: Package   },
]

const RECENT = [
  'ls-net://weazel/story/vinewood-scandal-32',
  'ls-net://lsurracing/event/weekly-invitational',
  'ls-net://cityhall/permits/vehicle-registration',
]

export default function InternetScreen(): React.ReactElement {
  const navigate = useStore(s => s.navigate)
  const dispatch = useStore(s => s.dispatch)

  const handleClose = () => {
    dispatch('LAPTOP_NOT_VISIBLE')
    sendNui('CloseTablet')
  }

  return (
    <div className="w-full h-full flex flex-col">

      {/* ── STRATA header ───────────────────────────────────────── */}
      <div className="h-[52px] shrink-0 flex items-center px-4 gap-3 border-b border-white/[0.06] bg-menu-surface">
        <button
          onClick={() => navigate('home')}
          className="w-7 h-7 flex items-center justify-center border border-white/10 bg-white/[0.03] text-white/30 hover:text-white/60 transition-colors"
        >
          <ArrowLeft size={13} />
        </button>
        <span
          className="font-display font-black tracking-[0.1em] text-[1.05rem] select-none"
          style={{ background: 'linear-gradient(90deg, #FF5C3A, #FF8C42)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
        >
          STRATA
        </span>
        <span className="font-mono text-[0.65rem] text-white/25 uppercase">/ browser</span>
        <div className="flex-1" />
        <button
          onClick={handleClose}
          className="flex items-center gap-1.5 font-mono text-[0.65rem] text-white/25 hover:text-white/60 uppercase tracking-[0.05em] transition-colors"
        >
          <X size={11} /><span>ESC</span>
        </button>
      </div>

      {/* ── Browser chrome ──────────────────────────────────────── */}
      <div className="h-10 shrink-0 flex items-center px-3 gap-2 border-b border-white/[0.06] bg-menu-surface-lt">

        {/* Browser navigation (decorative — no history yet) */}
        <div className="flex items-center gap-0.5 shrink-0">
          <button className="w-6 h-6 flex items-center justify-center text-white/15 cursor-default" tabIndex={-1}>
            <ChevronLeft size={14} />
          </button>
          <button className="w-6 h-6 flex items-center justify-center text-white/15 cursor-default" tabIndex={-1}>
            <ChevronRight size={14} />
          </button>
          <button className="w-6 h-6 flex items-center justify-center text-white/30 hover:text-white/60 transition-colors">
            <RotateCw size={11} />
          </button>
        </div>

        {/* Address bar */}
        <div className="flex-1 h-[26px] flex items-center gap-2 px-3 bg-menu-bg border border-white/[0.08] hover:border-white/[0.14] transition-colors cursor-text">
          <Lock size={9} className="text-menu-success/70 shrink-0" />
          <span className="font-mono text-[0.67rem] text-white/35 flex-1 truncate select-none">
            ls-net://home
          </span>
          <Globe size={10} className="text-[#1db5e7]/35 shrink-0" />
        </div>
      </div>

      {/* ── Bookmarks bar ───────────────────────────────────────── */}
      <div className="h-[27px] shrink-0 flex items-center gap-1.5 px-3 border-b border-white/[0.04]" style={{ background: 'rgba(14,14,16,0.7)' }}>
        {SITES.slice(0, 5).map(site => (
          <button
            key={site.id}
            className="flex items-center gap-1.5 h-[17px] px-2.5 border border-white/[0.06] bg-transparent hover:bg-white/[0.04] transition-colors"
          >
            <site.Icon size={9} style={{ color: `${site.color}99` }} />
            <span className="font-mono text-[0.58rem] text-white/30 hover:text-white/55 uppercase tracking-[0.04em] transition-colors">
              {site.label}
            </span>
          </button>
        ))}
      </div>

      {/* ── Page content ────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col items-center py-7 px-8 gap-6" style={{ background: '#0d0d0f' }}>

        {/* Logo */}
        <div className="flex flex-col items-center gap-2 mt-1">
          <div className="flex items-center gap-3">
            <Globe size={24} style={{ color: 'rgba(29,181,231,0.45)' }} />
            <span
              className="font-display font-black tracking-[0.14em] text-[1.8rem] select-none"
              style={{ background: 'linear-gradient(90deg, #1db5e7 0%, #0e8db5 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              BROWSER
            </span>
          </div>
          <span className="font-mono text-[0.61rem] text-white/18 uppercase tracking-[0.14em]">
            Los Santos' Premier Information Superhighway
          </span>
        </div>

        {/* Site speed-dial grid */}
        <div className="grid grid-cols-3 gap-2.5 w-full" style={{ maxWidth: '580px' }}>
          {SITES.map(site => (
            <button
              key={site.id}
              className="flex flex-col border border-white/[0.06] bg-menu-surface hover:border-white/[0.12] transition-colors text-left overflow-hidden group"
            >
              {/* Colored icon area */}
              <div
                className="h-[58px] flex items-center justify-center shrink-0"
                style={{ background: `linear-gradient(160deg, ${site.color}1f 0%, ${site.color}09 100%)` }}
              >
                <site.Icon size={22} style={{ color: `${site.color}c0` }} />
              </div>

              {/* Text area */}
              <div className="px-3 py-2 border-t border-white/[0.05] flex flex-col gap-0.5">
                <span className="font-medium uppercase tracking-[0.06em] text-[0.72rem] text-white/65 group-hover:text-white/88 transition-colors leading-tight">
                  {site.label}
                </span>
                <span className="font-mono text-[0.56rem] text-white/22 uppercase tracking-[0.03em] leading-tight">
                  {site.description}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Recently visited */}
        <div className="w-full flex flex-col gap-1.5" style={{ maxWidth: '580px' }}>
          <span className="font-mono text-[0.59rem] text-white/18 uppercase tracking-[0.1em]">Recently Visited</span>
          <div className="border border-white/[0.05] bg-menu-surface divide-y divide-white/[0.04] flex flex-col">
            {RECENT.map(url => (
              <div
                key={url}
                className="flex items-center gap-3 px-3 py-2 hover:bg-menu-surface-lt cursor-pointer transition-colors"
              >
                <Globe size={10} className="text-white/18 shrink-0" />
                <span className="font-mono text-[0.63rem] text-white/30 truncate flex-1">{url}</span>
                <ArrowRight size={10} className="text-white/12 shrink-0" />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
