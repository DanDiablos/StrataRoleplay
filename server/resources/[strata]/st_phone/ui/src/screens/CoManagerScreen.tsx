import React, { useState } from 'react'
import { Briefcase, Users, ChevronLeft, ChevronRight, Trash2, LogOut, Crown } from 'lucide-react'
import { useStore } from '../store'
import { sendNui } from '../nui'

interface RosterEmployee { Source: number; SID: number; First: string; Last: string; Phone: string; JobData: Record<string, unknown> }
interface Job { Id: string; Name: string; Workplace?: { Id: string; Name: string }; Grade?: { Id: string; Name: string; Level?: number } }

type View = 'jobs' | 'roster'

export default function CoManagerScreen(): React.ReactElement {
  const player = useStore((s) => s.player)
  const pushAlert = useStore((s) => s.pushAlert)

  const [view, setView] = useState<View>('jobs')
  const [activeJob, setActiveJob] = useState<Job | null>(null)
  const [roster, setRoster] = useState<Record<string, RosterEmployee[]>>({})
  const [loading, setLoading] = useState(false)

  const jobs = Array.isArray(player.Jobs) ? (player.Jobs as Job[]) : []

  const openRoster = async (job: Job) => {
    setActiveJob(job)
    setView('roster')
    setLoading(true)
    try {
      const res = await sendNui('FetchRoster', { jobId: job.Id })
      const data = await res.json()
      if (data?.rosterData) setRoster(data.rosterData)
      else if (data && typeof data === 'object') setRoster(data)
    } catch { /* noop */ }
    setLoading(false)
  }

  const handleFire = (sid: number) => {
    if (!activeJob) return
    sendNui('FireEmployee', { SID: sid, Job: { Id: activeJob.Id } })
    setRoster((prev) => {
      const copy = { ...prev }
      for (const key of Object.keys(copy)) {
        copy[key] = copy[key].filter((e) => e.SID !== sid)
      }
      return copy
    })
    pushAlert('Employee fired')
  }

  const handleQuit = () => {
    if (!activeJob) return
    sendNui('QuitJob', { JobId: activeJob.Id })
    pushAlert('Left job')
    setView('jobs')
  }

  const activeRoster = activeJob ? (roster[activeJob.Id] ?? []) : []

  if (view === 'roster' && activeJob) {
    return (
      <div className="flex-1 flex flex-col min-h-0">
        <div className="shrink-0 flex items-center gap-2 px-3 py-3 bg-black/30 border-b border-white/[0.06]">
          <button onClick={() => setView('jobs')} className="text-white/40 hover:text-white/70 transition-colors">
            <ChevronLeft size={16} />
          </button>
          <span className="font-display font-bold uppercase tracking-[0.1em] text-[0.72rem] text-white/70 flex-1 truncate">
            {activeJob.Name}
          </span>
          <button onClick={handleQuit} className="text-white/25 hover:text-red-400/60 transition-colors" title="Quit">
            <LogOut size={13} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto flex flex-col">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : activeRoster.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2">
              <Users size={28} className="text-white/20" />
              <span className="font-mono text-[0.65rem] text-white/20 uppercase tracking-[0.08em]">No employees</span>
            </div>
          ) : (
            activeRoster.map((emp) => {
              const grade = emp.JobData?.Grade as { Name?: string } | undefined
              return (
                <div key={emp.SID} className="flex items-center gap-3 px-4 py-2.5 border-b border-white/[0.03]">
                  <div className="w-7 h-7 rounded-full bg-[#db5004]/15 flex items-center justify-center shrink-0">
                    <span className="text-[0.55rem] font-bold text-[#db5004]">{emp.First?.[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[0.72rem] font-medium text-white/70 truncate block">{emp.First} {emp.Last}</span>
                    <span className="font-mono text-[0.55rem] text-white/30">{grade?.Name ?? '—'} · SID {emp.SID}</span>
                  </div>
                  <button onClick={() => handleFire(emp.SID)} className="text-white/20 hover:text-red-400/60 transition-colors">
                    <Trash2 size={11} />
                  </button>
                </div>
              )
            })
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="shrink-0 px-4 py-3 bg-black/30 border-b border-white/[0.06]">
        <div className="flex items-center gap-1.5">
          <Briefcase size={14} className="text-[#d35400]" />
          <span className="font-display font-bold uppercase tracking-[0.1em] text-[0.72rem] text-white/70">Axis</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto flex flex-col">
        {jobs.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2">
            <Briefcase size={28} className="text-white/20" />
            <span className="font-mono text-[0.65rem] text-white/20 uppercase tracking-[0.08em]">No businesses</span>
          </div>
        ) : (
          jobs.map((job) => (
            <button
              key={job.Id}
              onClick={() => openRoster(job)}
              className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors border-b border-white/[0.03]"
            >
              <div className="w-9 h-9 rounded-lg bg-[#db5004]/15 flex items-center justify-center shrink-0">
                <Briefcase size={15} className="text-[#db5004]/60" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <span className="text-[0.75rem] font-medium text-white/70 truncate block">{job.Name}</span>
                {job.Workplace?.Name && <span className="font-mono text-[0.55rem] text-white/30">{job.Workplace.Name}</span>}
              </div>
              <ChevronRight size={14} className="text-white/15" />
            </button>
          ))
        )}
      </div>
    </div>
  )
}
