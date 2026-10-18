import React, { useState, useEffect, useCallback } from 'react'
import { Pickaxe, Users, Play, ChevronLeft, Crown, UserPlus, LogOut, Trash2, UserCheck, Square } from 'lucide-react'
import { useStore } from '../store'
import { sendNui } from '../nui'

interface LaborJob { id: string; label: string; description?: string; pay?: number; slots?: number }
interface GroupMember { ID: number; First: string; Last: string }
interface Workgroup { Creator: GroupMember; Members: GroupMember[]; Working?: boolean; Job?: string }

type Tab = 'jobs' | 'groups'

export default function LaborScreen(): React.ReactElement {
  const pushAlert = useStore((s) => s.pushAlert)
  const player = useStore((s) => s.player)
  const notifications = useStore((s) => s.notifications)
  const [tab, setTab] = useState<Tab>('jobs')
  const [jobs, setJobs] = useState<LaborJob[]>([])
  const [groups, setGroups] = useState<Workgroup[]>([])
  const [loading, setLoading] = useState(true)

  const mySource = player.Source as number | undefined

  const fetchData = useCallback(async () => {
    try {
      const res = await sendNui('GetLaborDetails', {})
      const data = await res.json()
      const rawJobs = data?.jobs ?? data
      const jobList = Array.isArray(rawJobs) ? rawJobs : (rawJobs && typeof rawJobs === 'object' ? Object.values(rawJobs) : [])
      setJobs(jobList
        .filter((j: Record<string, unknown>) => !j.Restricted && !j.restricted)
        .map((j: Record<string, unknown>) => ({
          id: (j.Id ?? j.id ?? '') as string,
          label: (j.Name ?? j.label ?? '') as string,
          description: (j.Description ?? j.description ?? '') as string,
          pay: (j.Salary ?? j.pay ?? 0) as number,
          slots: (j.Limit ?? j.slots ?? 0) as number,
        })))
      const rawGroups = data?.groups
      if (Array.isArray(rawGroups)) setGroups(rawGroups)
    } catch { /* noop */ }
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const myGroup = groups.find(
    (g) => g.Creator?.ID === mySource || g.Members?.some((m) => m.ID === mySource)
  )
  const isLeader = myGroup?.Creator?.ID === mySource

  const handleCreateGroup = async () => {
    await sendNui('CreateWorkgroup', {})
    pushAlert('Workgroup created')
    fetchData()
  }

  const handleDisband = async () => {
    await sendNui('DisbandWorkgroup', {})
    pushAlert('Workgroup disbanded')
    fetchData()
  }

  const handleLeave = async () => {
    if (!myGroup) return
    await sendNui('LeaveWorkgroup', { Creator: { ID: myGroup.Creator.ID } })
    pushAlert('Left workgroup')
    fetchData()
  }

  const handleJoin = async (group: Workgroup) => {
    await sendNui('JoinWorkgroup', { Creator: { ID: group.Creator.ID } })
    pushAlert('Join request sent')
    fetchData()
  }

  const activeJobNotif = notifications.find((n) => n.id === 'LABOR_OBJ' && n.show)

  const handleStartJob = async (jobId: string, asGroup: boolean) => {
    await sendNui('StartLaborJob', { job: jobId, isWorkgroup: asGroup || undefined })
    pushAlert('Started job')
  }

  const handleQuitJob = async (jobId: string) => {
    await sendNui('QuitLaborJob', { job: jobId })
    pushAlert('Quit job')
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="shrink-0 px-4 py-3 bg-black/30 border-b border-white/[0.06]">
        <div className="flex items-center gap-1.5">
          <Pickaxe size={14} className="text-[#05737d]" />
          <span className="font-display font-bold uppercase tracking-[0.1em] text-[0.72rem] text-white/70">Jobs</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="shrink-0 flex border-b border-white/[0.06]">
        <button
          onClick={() => setTab('jobs')}
          className={`flex-1 py-2 text-[0.62rem] font-medium uppercase tracking-wider transition-colors ${
            tab === 'jobs' ? 'text-[#05737d] border-b-2 border-[#05737d]' : 'text-white/35 hover:text-white/50'
          }`}
        >
          Jobs
        </button>
        <button
          onClick={() => setTab('groups')}
          className={`flex-1 py-2 text-[0.62rem] font-medium uppercase tracking-wider transition-colors ${
            tab === 'groups' ? 'text-[#05737d] border-b-2 border-[#05737d]' : 'text-white/35 hover:text-white/50'
          }`}
        >
          Groups
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        {tab === 'jobs' ? (
          /* ── Jobs tab ──────────────────────── */
          <>
            {activeJobNotif && (
              <div className="mx-3 mt-3 mb-1 border-l-[3px] border-l-primary bg-primary/[0.06] flex items-center gap-3 px-3 py-2.5">
                <div className="flex-1 min-w-0">
                  <span className="font-display font-bold uppercase tracking-[0.12em] text-[0.62rem] text-primary/80 block">Active Job</span>
                  <span className="text-[0.68rem] text-white/60 truncate block">{activeJobNotif.description || activeJobNotif.title}</span>
                </div>
                <button
                  onClick={() => {
                    const match = jobs.find((j) => activeJobNotif.description?.includes(j.label) || activeJobNotif.title?.includes(j.label))
                    if (match) handleQuitJob(match.id)
                    else if (jobs.length > 0) handleQuitJob(jobs[0].id)
                  }}
                  className="shrink-0 px-2.5 py-1.5 rounded bg-menu-error/15 border border-menu-error-lt/30 text-red-300/70 text-[0.58rem] font-medium flex items-center gap-1 hover:bg-menu-error/25 transition-colors"
                >
                  <Square size={9} /> Quit
                </button>
              </div>
            )}
            {jobs.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-2">
                <Pickaxe size={28} className="text-white/20" />
                <span className="font-mono text-[0.65rem] text-white/20 uppercase tracking-[0.08em]">
                  {loading ? 'Loading...' : 'No jobs available'}
                </span>
              </div>
            ) : (
              jobs.map((job) => (
                <div key={job.id} className="px-4 py-3 border-b border-white/[0.03]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[0.75rem] font-medium text-white/75">{job.label}</span>
                    {job.pay != null && job.pay > 0 && (
                      <span className="font-mono text-[0.62rem] text-[#05737d]">${job.pay}</span>
                    )}
                  </div>
                  {job.description && <p className="text-[0.65rem] text-white/40 mb-2">{job.description}</p>}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStartJob(job.id, false)}
                      className="flex-1 h-7 rounded text-[0.58rem] font-medium bg-[#05737d]/15 text-[#05737d] hover:bg-[#05737d]/25 transition-colors flex items-center justify-center gap-1"
                    >
                      <Play size={10} /> Start
                    </button>
                    {isLeader && (
                      <button
                        onClick={() => handleStartJob(job.id, true)}
                        className="flex-1 h-7 rounded text-[0.58rem] font-medium bg-[#05737d]/10 text-[#05737d]/70 hover:bg-[#05737d]/20 transition-colors flex items-center justify-center gap-1"
                      >
                        <Users size={10} /> Start as Group
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </>
        ) : (
          /* ── Groups tab ────────────────────── */
          <>
            {/* My group */}
            {myGroup ? (
              <div className="mx-3 mt-3 mb-2 border-l-[3px] border-l-[#05737d] bg-white/[0.02]">
                <div className="px-3 py-2 bg-white/[0.03] border-b border-white/[0.06] flex items-center justify-between">
                  <span className="font-display font-bold uppercase tracking-[0.12em] text-[0.68rem] text-white/60">
                    Your Group
                  </span>
                  {isLeader ? (
                    <button onClick={handleDisband} className="text-red-400/50 hover:text-red-400/80 transition-colors">
                      <Trash2 size={12} />
                    </button>
                  ) : (
                    <button onClick={handleLeave} className="text-white/30 hover:text-white/60 transition-colors">
                      <LogOut size={12} />
                    </button>
                  )}
                </div>
                <div className="px-3 py-2 flex flex-col gap-1">
                  {/* Leader */}
                  <div className="flex items-center gap-2 py-1.5">
                    <Crown size={11} className="text-[#f39c12] shrink-0" />
                    <span className="text-[0.72rem] font-medium text-white/75">
                      {myGroup.Creator.First} {myGroup.Creator.Last}
                    </span>
                    <span className="font-mono text-[0.5rem] text-white/25">Leader</span>
                  </div>
                  {/* Members */}
                  {myGroup.Members?.map((m) => (
                    <div key={m.ID} className="flex items-center gap-2 py-1.5 border-t border-white/[0.04]">
                      <UserCheck size={11} className="text-white/30 shrink-0" />
                      <span className="text-[0.72rem] font-medium text-white/60">
                        {m.First} {m.Last}
                      </span>
                    </div>
                  ))}
                  {(!myGroup.Members || myGroup.Members.length === 0) && (
                    <span className="text-[0.6rem] text-white/25 py-1">No members yet</span>
                  )}
                </div>
                {myGroup.Working && myGroup.Job && (
                  <div className="px-3 py-1.5 bg-[#05737d]/10 border-t border-[#05737d]/20">
                    <span className="font-mono text-[0.58rem] text-[#05737d]">Working: {myGroup.Job}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="mx-3 mt-3 mb-2">
                <button
                  onClick={handleCreateGroup}
                  className="w-full h-9 rounded-lg bg-[#05737d]/15 border border-[#05737d]/25 text-[#05737d] text-[0.72rem] font-semibold uppercase tracking-wider hover:bg-[#05737d]/25 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Users size={13} /> Create Workgroup
                </button>
              </div>
            )}

            {/* Other groups */}
            {!myGroup && groups.length > 0 && (
              <div className="px-3 mt-1">
                <span className="font-display font-bold uppercase tracking-[0.12em] text-[0.62rem] text-white/35 block mb-1.5">
                  Available Groups
                </span>
                {groups
                  .filter((g) => !g.Working && g.Members && g.Members.length < 4)
                  .map((g) => (
                    <div key={g.Creator.ID} className="flex items-center gap-2.5 px-3 py-2.5 bg-white/[0.02] border-b border-white/[0.04] last:border-0">
                      <div className="flex-1 min-w-0">
                        <span className="text-[0.72rem] font-medium text-white/65 block truncate">
                          {g.Creator.First} {g.Creator.Last}&apos;s Group
                        </span>
                        <span className="font-mono text-[0.52rem] text-white/25">
                          {(g.Members?.length ?? 0) + 1}/5 members
                        </span>
                      </div>
                      <button
                        onClick={() => handleJoin(g)}
                        className="w-7 h-7 flex items-center justify-center bg-[#05737d]/15 border border-[#05737d]/25 text-[#05737d] hover:bg-[#05737d]/25 transition-colors"
                      >
                        <UserPlus size={12} />
                      </button>
                    </div>
                  ))}
                {groups.filter((g) => !g.Working && g.Members && g.Members.length < 4).length === 0 && (
                  <div className="flex flex-col items-center justify-center gap-2 py-8">
                    <Users size={24} className="text-white/15" />
                    <span className="font-mono text-[0.6rem] text-white/20 uppercase tracking-[0.08em]">No groups available</span>
                  </div>
                )}
              </div>
            )}

            {!myGroup && groups.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center gap-2">
                <Users size={28} className="text-white/20" />
                <span className="font-mono text-[0.65rem] text-white/20 uppercase tracking-[0.08em]">No active groups</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
