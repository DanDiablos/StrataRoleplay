import { useEffect, useState } from 'react'
import { sendNui } from '../nui.ts'

interface HistoryEntry { count: number; time: number }
interface PlayerData {
  current: number
  max: number
  queue: number
  history?: HistoryEntry[]
}

function AreaChart({ data }: { data: HistoryEntry[] }): React.ReactElement {
  if (data.length < 2) return <div className="flex items-center justify-center h-full text-white/15 text-xs font-mono">no data</div>
  const max = Math.max(...data.map((d) => d.count), 1)
  const W = 1000
  const H = 100
  const pts = data.map((d, i) => ({
    x: (i / (data.length - 1)) * W,
    y: H - (d.count / max) * H * 0.9,
  }))
  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const areaPath = `${linePath} L${W},${H} L0,${H} Z`

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full h-full">
      <defs>
        <linearGradient id="areaGrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#FF5C3A" stopOpacity={0.25} />
          <stop offset="100%" stopColor="#FF5C3A" stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#areaGrad)" />
      <path d={linePath} fill="none" stroke="#FF5C3A" strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

export default function DashboardScreen(): React.ReactElement {
  const [data, setData] = useState<PlayerData | null>(null)

  useEffect(() => {
    const load = () => sendNui<PlayerData>('GetPlayerHistory', {}).then(setData).catch(() => {})
    load()
  }, [])

  const current = data?.current ?? 0
  const max = data?.max ?? 0
  const queue = data?.queue ?? 0
  const pct = max > 0 ? Math.floor((current / max) * 100) : 0

  return (
    <div className="flex flex-col gap-5 p-5 h-full overflow-y-auto">
      {/* Stat cards */}
      <div className="flex gap-3 shrink-0">
        {[
          { label: 'Online Players', value: current },
          { label: 'Players in Queue', value: queue },
          { label: 'Server Capacity', value: max },
        ].map(({ label, value }) => (
          <div key={label} className="flex-1 bg-menu-surface border-l-[3px] border-l-primary p-4 flex flex-col gap-1">
            <span className="font-display font-bold text-[0.72rem] uppercase tracking-[0.12em] text-white/50">{label}</span>
            <span className="font-display font-black text-[2rem] leading-none tracking-[-0.02em] text-white">{value}</span>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="shrink-0 bg-menu-surface px-4 py-3 flex items-center gap-4">
        <span className="font-display font-bold text-[0.68rem] uppercase tracking-[0.12em] text-white/40 shrink-0">Capacity</span>
        <div className="flex-1 h-[6px] bg-white/8">
          <div
            className="h-full transition-all duration-500"
            style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #FF5C3A, #FF8C42, #FFB347)' }}
          />
        </div>
        <span className="font-mono text-[0.72rem] text-white/50 shrink-0">{pct}%</span>
      </div>

      {/* History chart */}
      <div className="flex-1 min-h-0 bg-menu-surface border-l-[3px] border-l-primary flex flex-col">
        <div className="px-4 py-3 bg-menu-surface-lt shrink-0">
          <span className="font-display font-bold text-[0.72rem] uppercase tracking-[0.12em] text-white/60">
            Player History
          </span>
        </div>
        <div className="flex-1 p-4">
          <AreaChart data={data?.history ?? []} />
        </div>
      </div>
    </div>
  )
}
