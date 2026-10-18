import {
  ArrowLeft, X, Folder, FolderOpen, FileText, Terminal, Film,
  Image as ImageIcon, Settings as ConfigIcon, List, LayoutGrid,
  Search, ChevronRight, HardDrive,
} from 'lucide-react'
import { useState } from 'react'
import { useStore } from '../store'
import { sendNui } from '../nui'

interface FileEntry {
  name: string
  type: string
  size: string
  date: string
  Icon: React.ComponentType<{ size?: number; className?: string }>
}

interface FolderDef {
  name: string
  files: FileEntry[]
}

const FOLDERS: FolderDef[] = [
  {
    name: 'Documents',
    files: [
      { name: 'Contracts.doc',         type: 'Document',    size: '24 KB',  date: '2026-04-01', Icon: FileText  },
      { name: 'Employee_List.doc',      type: 'Document',    size: '18 KB',  date: '2026-03-28', Icon: FileText  },
      { name: 'Security_Protocol.doc',  type: 'Document',    size: '31 KB',  date: '2026-03-15', Icon: FileText  },
    ],
  },
  {
    name: 'Downloads',
    files: [
      { name: 'vpn_setup.exe',          type: 'Application', size: '2.1 MB', date: '2026-03-20', Icon: Terminal  },
      { name: 'decryptor_v2.exe',       type: 'Application', size: '890 KB', date: '2026-04-02', Icon: Terminal  },
    ],
  },
  {
    name: 'Media',
    files: [
      { name: 'evidence_001.jpg',       type: 'Image',       size: '3.2 MB', date: '2026-04-03', Icon: ImageIcon },
      { name: 'clip_heist.mp4',         type: 'Video',       size: '128 MB', date: '2026-04-05', Icon: Film      },
    ],
  },
  {
    name: 'System',
    files: [
      { name: 'boot.cfg',               type: 'Config',      size: '4 KB',   date: '2026-01-10', Icon: ConfigIcon },
      { name: 'network.log',            type: 'Log',         size: '156 KB', date: '2026-04-06', Icon: FileText  },
    ],
  },
]

export default function FilesScreen(): React.ReactElement {
  const navigate = useStore(s => s.navigate)
  const dispatch = useStore(s => s.dispatch)

  const [folder,   setFolder]   = useState('Documents')
  const [search,   setSearch]   = useState('')
  const [view,     setView]     = useState<'list' | 'grid'>('list')
  const [selected, setSelected] = useState<string | null>(null)

  const handleClose = () => {
    dispatch('LAPTOP_NOT_VISIBLE')
    sendNui('CloseTablet')
  }

  const switchFolder = (name: string) => { setFolder(name); setSelected(null); setSearch('') }

  const current = FOLDERS.find(f => f.name === folder) ?? FOLDERS[0]
  const files   = current.files.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="w-full h-full flex flex-col">

      {/* ── STRATA header ─────────────────────────────────────── */}
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
        <span className="font-mono text-[0.65rem] text-white/25 uppercase">/ vault</span>
        <div className="flex-1" />
        <button
          onClick={handleClose}
          className="flex items-center gap-1.5 font-mono text-[0.65rem] text-white/25 hover:text-white/60 uppercase tracking-[0.05em] transition-colors"
        >
          <X size={11} /><span>ESC</span>
        </button>
      </div>

      {/* ── Body ──────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 flex overflow-hidden">

        {/* Sidebar */}
        <div className="w-[175px] shrink-0 flex flex-col border-r border-white/[0.06] bg-menu-surface">

          <div className="px-3 pt-3 pb-2 shrink-0">
            <span className="font-display font-bold uppercase tracking-[0.12em] text-[0.65rem] text-white/30">
              Folders
            </span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {FOLDERS.map(f => {
              const active = f.name === folder
              return (
                <button
                  key={f.name}
                  onClick={() => switchFolder(f.name)}
                  className={`w-full flex items-center gap-2.5 px-3 py-[9px] transition-colors border-l-[3px] ${
                    active
                      ? 'border-l-primary bg-primary/[0.06]'
                      : 'border-l-transparent hover:bg-white/[0.03]'
                  }`}
                >
                  {active
                    ? <FolderOpen size={13} style={{ color: '#D8A71E' }} className="shrink-0" />
                    : <Folder     size={13} style={{ color: '#D8A71Eaa' }} className="shrink-0" />
                  }
                  <span className={`font-medium text-[0.78rem] uppercase tracking-[0.04em] truncate flex-1 text-left ${
                    active ? 'text-white/85' : 'text-white/50'
                  }`}>
                    {f.name}
                  </span>
                  <span className="font-mono text-[0.6rem] text-white/20 shrink-0">{f.files.length}</span>
                </button>
              )
            })}
          </div>

          {/* Storage indicator */}
          <div className="px-3 py-3 border-t border-white/[0.06] shrink-0">
            <div className="flex items-center gap-1.5 mb-2">
              <HardDrive size={10} className="text-white/25" />
              <span className="font-mono text-[0.59rem] text-white/25 uppercase tracking-[0.05em]">Storage</span>
              <span className="font-mono text-[0.59rem] text-white/20 ml-auto">12.4 / 50 GB</span>
            </div>
            <div className="h-[3px] bg-white/[0.07] w-full overflow-hidden">
              <div className="h-full" style={{ width: '24.8%', background: 'rgba(255,92,58,0.5)' }} />
            </div>
          </div>
        </div>

        {/* Content pane */}
        <div className="flex-1 min-w-0 flex flex-col bg-menu-bg">

          {/* Toolbar */}
          <div className="h-10 shrink-0 flex items-center gap-2 px-4 border-b border-white/[0.06] bg-menu-surface-lt">

            {/* Breadcrumb */}
            <div className="flex items-center gap-1 shrink-0">
              <span className="font-mono text-[0.62rem] uppercase tracking-[0.04em] text-white/25">Vault</span>
              <ChevronRight size={10} className="text-white/15" />
              <span className="font-mono text-[0.62rem] uppercase tracking-[0.04em] text-white/50">{folder}</span>
            </div>

            <div className="flex-1" />

            {/* Search */}
            <div className="flex items-center gap-1.5 h-[26px] px-2.5 bg-menu-bg border border-white/[0.08] hover:border-white/[0.14] transition-colors">
              <Search size={10} className="text-white/25 shrink-0" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search files..."
                className="bg-transparent text-[0.67rem] text-white/60 placeholder-white/20 font-mono w-[130px]"
              />
            </div>

            {/* View toggle */}
            <div className="flex items-center shrink-0">
              <button
                onClick={() => setView('list')}
                className={`w-7 h-7 flex items-center justify-center border transition-colors ${
                  view === 'list'
                    ? 'border-primary/40 bg-primary/[0.08] text-primary'
                    : 'border-white/10 text-white/30 hover:text-white/55'
                }`}
              >
                <List size={11} />
              </button>
              <button
                onClick={() => setView('grid')}
                className={`w-7 h-7 flex items-center justify-center border border-l-0 transition-colors ${
                  view === 'grid'
                    ? 'border-primary/40 bg-primary/[0.08] text-primary'
                    : 'border-white/10 text-white/30 hover:text-white/55'
                }`}
              >
                <LayoutGrid size={11} />
              </button>
            </div>
          </div>

          {/* File area — list */}
          {view === 'list' && (
            <div className="flex-1 min-h-0 overflow-y-auto flex flex-col">

              {/* Column headers */}
              <div className="flex items-center px-4 py-1.5 border-b border-white/[0.05] shrink-0 bg-menu-surface-lt/60 sticky top-0">
                <span className="font-mono text-[0.58rem] uppercase tracking-[0.06em] text-white/25 flex-1">Name</span>
                <span className="font-mono text-[0.58rem] uppercase tracking-[0.06em] text-white/25 w-24 text-right">Type</span>
                <span className="font-mono text-[0.58rem] uppercase tracking-[0.06em] text-white/25 w-20 text-right">Size</span>
                <span className="font-mono text-[0.58rem] uppercase tracking-[0.06em] text-white/25 w-28 text-right">Modified</span>
              </div>

              {files.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 flex-1">
                  <Folder size={28} className="text-white/12" />
                  <span className="font-mono text-[0.65rem] text-white/18 uppercase tracking-[0.06em]">No files found</span>
                </div>
              ) : (
                files.map(file => (
                  <button
                    key={file.name}
                    onClick={() => setSelected(s => s === file.name ? null : file.name)}
                    className={`flex items-center px-4 py-2.5 border-b border-white/[0.03] last:border-0 transition-colors w-full ${
                      selected === file.name
                        ? 'bg-primary/[0.07]'
                        : 'hover:bg-menu-surface'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <file.Icon
                        size={13}
                        className={selected === file.name ? 'text-primary/70 shrink-0' : 'text-white/28 shrink-0'}
                      />
                      <span className={`font-mono text-[0.72rem] truncate ${
                        selected === file.name ? 'text-white/85' : 'text-white/55'
                      }`}>
                        {file.name}
                      </span>
                    </div>
                    <span className="font-mono text-[0.63rem] text-white/25 w-24 text-right shrink-0">{file.type}</span>
                    <span className="font-mono text-[0.63rem] text-white/25 w-20 text-right shrink-0">{file.size}</span>
                    <span className="font-mono text-[0.63rem] text-white/18 w-28 text-right shrink-0">{file.date}</span>
                  </button>
                ))
              )}
            </div>
          )}

          {/* File area — grid */}
          {view === 'grid' && (
            <div className="flex-1 min-h-0 overflow-y-auto p-4">
              {files.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 h-full">
                  <Folder size={28} className="text-white/12" />
                  <span className="font-mono text-[0.65rem] text-white/18 uppercase tracking-[0.06em]">No files found</span>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2.5">
                  {files.map(file => (
                    <button
                      key={file.name}
                      onClick={() => setSelected(s => s === file.name ? null : file.name)}
                      className={`flex flex-col items-center gap-2 p-3 border transition-colors ${
                        selected === file.name
                          ? 'border-primary/40 bg-primary/[0.06]'
                          : 'border-white/[0.06] hover:border-white/12 hover:bg-menu-surface'
                      }`}
                    >
                      <file.Icon
                        size={24}
                        className={selected === file.name ? 'text-primary/70' : 'text-white/28'}
                      />
                      <div className="flex flex-col items-center gap-0.5 w-full">
                        <span className={`font-mono text-[0.6rem] text-center truncate w-full leading-tight ${
                          selected === file.name ? 'text-white/80' : 'text-white/45'
                        }`}>
                          {file.name}
                        </span>
                        <span className="font-mono text-[0.55rem] text-white/20">{file.size}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
