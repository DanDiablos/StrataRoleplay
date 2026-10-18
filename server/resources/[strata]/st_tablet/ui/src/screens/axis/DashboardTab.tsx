import { useStore } from '../../store'
import type { Notice } from '../../types'

export default function DashboardTab(): React.ReactElement {
  const data = useStore(s => s.data)

  const player   = data.player as Record<string, unknown> | undefined
  const notices  = (data.businessNotices as Notice[] | null) ?? []
  const jobData  = data.jobData as Record<string, unknown> | undefined

  const jobLabel = (jobData?.label as string) ?? (player?.job as string) ?? '—'
  const grade    = (jobData?.grade as string) ?? (player?.grade as string) ?? '—'
  const name     = player
    ? `${player.First ?? ''} ${player.Last ?? ''}`.trim()
    : '—'

  return (
    <div className="h-full overflow-y-auto p-5 flex flex-col gap-4">
      {/* Identity card */}
      <div className="border-l-[3px] border-l-primary bg-menu-surface">
        <div className="px-3 py-2 bg-menu-surface-lt border-b border-white/[0.06]">
          <span className="font-display font-bold uppercase tracking-[0.12em] text-[0.72rem] text-white/70">
            Employee Profile
          </span>
        </div>
        <div className="divide-y divide-white/[0.06]">
          <Row label="Name" value={name} />
          <Row label="Job" value={jobLabel} />
          <Row label="Grade" value={String(grade)} />
        </div>
      </div>

      {/* Notices */}
      <div className="border-l-[3px] border-l-primary bg-menu-surface">
        <div className="px-3 py-2 bg-menu-surface-lt border-b border-white/[0.06]">
          <span className="font-display font-bold uppercase tracking-[0.12em] text-[0.72rem] text-white/70">
            Notices ({notices.length})
          </span>
        </div>
        {notices.length === 0 ? (
          <div className="px-3 py-6 text-center">
            <span className="font-mono text-[0.68rem] text-white/20 uppercase tracking-[0.06em]">
              No notices
            </span>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {notices.map(n => (
              <div key={n.id} className="px-3 py-3 flex flex-col gap-1">
                <span className="font-medium text-[0.82rem] text-white/80">{n.title}</span>
                <span className="text-[0.75rem] text-white/45 leading-snug">{n.content}</span>
                <span className="font-mono text-[0.62rem] text-white/25 mt-0.5">
                  {n.author} · {n.created_at}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center px-3 py-[9px]">
      <span className="w-[120px] shrink-0 font-mono text-[0.68rem] uppercase tracking-[0.05em] text-white/40">{label}</span>
      <span className="font-mono text-[0.75rem] text-white/80">{value}</span>
    </div>
  )
}
