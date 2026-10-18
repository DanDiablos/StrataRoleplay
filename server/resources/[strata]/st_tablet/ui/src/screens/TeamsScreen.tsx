import { useState, useEffect } from 'react'
import { ArrowLeft, X, Users, Plus, UserX, UserPlus, Trash2, LogIn, Search, Bell, Shield } from 'lucide-react'
import { sendNui } from '../nui'
import { useStore } from '../store'
import ActionBtn from '../components/ActionBtn.tsx'
import Modal from '../components/Modal.tsx'
import Loader from '../components/Loader.tsx'
import type { Team, TeamMember, TeamRequest } from '../types'

// ─── State colour mapping ─────────────────────────────────────────────────────

const STATE_COLORS: Record<number, string> = {
  0: '#00FF8A',
  1: '#FF8C42',
  2: '#ef4444',
}

// ─── MemberCard ───────────────────────────────────────────────────────────────

interface MemberCardProps {
  member:    TeamMember
  amLeader:  boolean
  onKick:    (m: TeamMember) => void
}

function MemberCard({ member, amLeader, onKick }: MemberCardProps): React.ReactElement {
  const initials = `${member.First?.[0] ?? ''}${member.Last?.[0] ?? ''}`
  return (
    <div className={`relative flex flex-col gap-2.5 p-3 border transition-colors ${
      member.Leader
        ? 'bg-[#00FF8A]/[0.03] border-[#00FF8A]/20 border-l-[2px] border-l-[#00FF8A]/50'
        : 'bg-menu-surface border-white/[0.06]'
    }`}>
      <div className="flex items-center gap-2.5">
        <div className={`w-9 h-9 flex items-center justify-center text-[0.75rem] font-mono shrink-0 ${
          member.Leader ? 'bg-[#00FF8A]/10 text-[#00FF8A]/80' : 'bg-white/[0.05] text-white/40'
        }`}>
          {initials}
        </div>
        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
          <span className="font-medium text-[0.82rem] text-white/80 truncate leading-tight">
            {member.First} {member.Last}
          </span>
          <span className={`font-mono text-[0.6rem] uppercase tracking-[0.05em] ${
            member.Leader ? 'text-[#00FF8A]/50' : 'text-white/25'
          }`}>
            {member.Leader ? 'Leader' : 'Member'}
          </span>
        </div>
        {amLeader && !member.Leader && (
          <button
            onClick={() => onKick(member)}
            className="w-6 h-6 flex items-center justify-center border border-menu-error-lt/25 text-red-300/30 hover:text-red-300/60 hover:border-menu-error-lt/40 transition-colors shrink-0"
          >
            <UserX size={10} />
          </button>
        )}
      </div>
      <div className="flex items-center justify-between pt-1.5 border-t border-white/[0.05]">
        <span className="font-mono text-[0.6rem] text-white/20">SID {member.SID}</span>
        {member.Leader && <Shield size={9} className="text-[#00FF8A]/40" />}
      </div>
    </div>
  )
}

// ─── TeamRow ──────────────────────────────────────────────────────────────────

interface TeamRowProps {
  team:    Team
  isMine:  boolean
  canJoin: boolean
  onJoin:  (id: number) => void
}

function TeamRow({ team, isMine, canJoin, onJoin }: TeamRowProps): React.ReactElement {
  const color = STATE_COLORS[team.State] ?? 'rgba(255,255,255,0.3)'
  return (
    <div className={`flex items-center gap-2 px-3 py-2.5 border-b border-white/[0.06] last:border-0 transition-colors ${
      isMine
        ? 'bg-[#00FF8A]/[0.04] border-l-[2px] border-l-[#00FF8A]/35'
        : 'hover:bg-menu-surface-lt'
    }`}>
      <span className="text-[0.5rem] shrink-0" style={{ color }}>●</span>
      <span className="font-medium text-[0.8rem] text-white/75 flex-1 min-w-0 truncate">{team.Name}</span>
      <span className="font-mono text-[0.6rem] text-white/25 shrink-0">
        {team.Members.length}/5
      </span>
      {isMine && (
        <span className="font-mono text-[0.55rem] text-[#00FF8A]/45 uppercase shrink-0 tracking-[0.06em]">Mine</span>
      )}
      {canJoin && (
        <button
          onClick={() => onJoin(team.ID)}
          className="shrink-0 flex items-center gap-1 px-1.5 py-0.5 border border-primary/30 bg-primary/[0.06] text-[#FF8C42] text-[0.65rem] hover:bg-primary/12 transition-colors"
        >
          <LogIn size={9} />
          Join
        </button>
      )}
    </div>
  )
}

// ─── RequestRow ───────────────────────────────────────────────────────────────

interface RequestRowProps {
  req:       TeamRequest
  onRespond: (id: number, action: 'accept' | 'deny') => void
}

function RequestRow({ req, onRespond }: RequestRowProps): React.ReactElement {
  return (
    <div className="px-3 py-2.5 border-b border-white/[0.04] last:border-0">
      <p className="font-medium text-[0.78rem] text-white/70 leading-tight mb-0.5">{req.label}</p>
      <p className="font-mono text-[0.6rem] text-white/30 leading-snug mb-2">{req.description}</p>
      <div className="flex gap-1">
        <button
          onClick={() => onRespond(req.id, 'deny')}
          className="flex-1 py-1 text-[0.68rem] font-medium uppercase tracking-[0.04em] border border-menu-error-lt/30 bg-menu-error/[0.08] text-red-300/55 hover:bg-menu-error/18 transition-colors"
        >
          Deny
        </button>
        <button
          onClick={() => onRespond(req.id, 'accept')}
          className="flex-1 py-1 text-[0.68rem] font-medium uppercase tracking-[0.04em] border border-[#00FF8A]/25 bg-[#00FF8A]/[0.06] text-[#00FF8A]/60 hover:bg-[#00FF8A]/12 transition-colors"
        >
          Accept
        </button>
      </div>
    </div>
  )
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function TeamsScreen(): React.ReactElement {
  const navigate = useStore(s => s.navigate)
  const data     = useStore(s => s.data)
  const dispatch = useStore(s => s.dispatch)

  const myGroup = data.myGroup as Team | null | undefined
  const player  = data.player  as { SID?: number } | undefined
  const mySID   = player?.SID

  // Derive leader status from member list
  const myMember = myGroup?.Members.find(m => m.SID === mySID)
  const amLeader = myMember?.Leader ?? false

  const [allTeams,   setAllTeams]   = useState<Team[]>([])
  const [requests,   setRequests]   = useState<TeamRequest[]>([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [creating,   setCreating]   = useState(false)
  const [newName,    setNewName]    = useState('')
  const [showInvite, setShowInvite] = useState(false)
  const [inviteSid,  setInviteSid]  = useState('')
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [tr, rr] = await Promise.all([
        sendNui('GetTeams', {}),
        sendNui('GetTeamRequests', {}),
      ])
      const teams = await tr.json()
      const reqs  = await rr.json()
      setAllTeams(Array.isArray(teams) ? teams : [])
      setRequests(Array.isArray(reqs)  ? reqs  : [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleCreate = async () => {
    if (!newName.trim() || submitting) return
    setSubmitting(true)
    try {
      const r   = await sendNui('CreateTeam', { Name: newName })
      const res = await r.json()
      if (res?.success) { setCreating(false); setNewName('') }
    } finally {
      setSubmitting(false)
    }
  }

  const handleInvite = async () => {
    if (!inviteSid.trim() || submitting) return
    setSubmitting(true)
    try {
      await sendNui('InviteTeamMember', { SID: inviteSid })
      setShowInvite(false)
      setInviteSid('')
    } finally {
      setSubmitting(false)
    }
  }

  const handleKick = async (member: TeamMember) => {
    await sendNui('RemoveTeamMember', { SID: member.SID, Source: member.Source })
  }

  const handleLeave = async () => {
    if (!myGroup || !mySID) return
    const me = myGroup.Members.find(m => m.SID === mySID)
    if (me) await sendNui('RemoveTeamMember', { SID: me.SID, Source: me.Source })
  }

  const handleDelete = async () => {
    await sendNui('DeleteTeam', {})
  }

  const handleRequest = async (id: number, action: 'accept' | 'deny') => {
    await sendNui('TeamRequest', { id, action })
    setRequests(r => r.filter(req => req.id !== id))
  }

  const handleJoin = async (teamId: number) => {
    await sendNui('RequestTeamInvite', teamId)
  }

  const handleClose = () => {
    dispatch('LAPTOP_NOT_VISIBLE')
    sendNui('CloseTablet')
  }

  const filteredTeams = allTeams.filter(t =>
    !search || t.Name.toLowerCase().includes(search.toLowerCase())
  )

  const stateColor  = myGroup ? (STATE_COLORS[myGroup.State] ?? 'rgba(255,255,255,0.3)') : null
  const memberCount = myGroup?.Members.length ?? 0

  return (
    <div className="w-full h-full flex flex-col">

      {/* ── Header ──────────────────────────────────────────────────── */}
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
        <span className="font-mono text-[0.65rem] text-white/25 uppercase">/ crew</span>

        {myGroup && stateColor && (
          <div className="flex items-center gap-1.5 ml-1">
            <span className="text-[0.45rem]" style={{ color: stateColor }}>●</span>
            <span className="font-mono text-[0.65rem] text-white/35 uppercase tracking-[0.05em]">
              {myGroup.StateName}
            </span>
          </div>
        )}

        <div className="flex-1" />

        {requests.length > 0 && (
          <div className="flex items-center gap-1 px-2 py-1 bg-primary/[0.08] border border-primary/25">
            <Bell size={10} className="text-primary" />
            <span className="font-mono text-[0.62rem] text-primary">{requests.length}</span>
          </div>
        )}

        <button
          onClick={load}
          className="font-mono text-[0.62rem] text-white/20 hover:text-white/50 uppercase tracking-[0.04em] transition-colors"
        >
          Refresh
        </button>

        <button
          onClick={handleClose}
          className="flex items-center gap-1.5 font-mono text-[0.65rem] text-white/25 hover:text-white/60 uppercase tracking-[0.05em] transition-colors ml-1"
        >
          <X size={11} /><span>ESC</span>
        </button>
      </div>

      {/* ── Body ────────────────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 flex overflow-hidden">

        {/* Left: My Crew ──────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-white/[0.06]">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader />
            </div>

          ) : myGroup ? (
            <>
              {/* Team header */}
              <div className="px-5 py-4 border-b border-white/[0.06] bg-menu-surface-lt shrink-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display font-black uppercase tracking-[0.08em] text-[1.05rem] text-white/90 leading-none">
                      {myGroup.Name}
                    </h2>
                    <p className="font-mono text-[0.6rem] text-white/25 mt-1.5 uppercase tracking-[0.04em]">
                      ID #{myGroup.ID}
                    </p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    {amLeader && (
                      <ActionBtn onClick={() => setShowInvite(true)}>
                        <UserPlus size={11} className="inline mr-1" />
                        Invite
                      </ActionBtn>
                    )}
                    {amLeader ? (
                      <ActionBtn onClick={handleDelete} variant="danger">
                        <Trash2 size={11} className="inline mr-1" />
                        Delete
                      </ActionBtn>
                    ) : (
                      <ActionBtn onClick={handleLeave} variant="danger">Leave</ActionBtn>
                    )}
                  </div>
                </div>

                {/* Capacity bar */}
                <div className="flex items-center gap-2.5 mt-3.5">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-[3px] w-8 transition-colors ${
                          i < memberCount ? 'bg-[#00FF8A]/70' : 'bg-white/10'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-mono text-[0.6rem] text-white/25">{memberCount}/5 members</span>
                </div>
              </div>

              {/* Member grid */}
              <div className="flex-1 min-h-0 overflow-y-auto p-4">
                <div className="grid grid-cols-2 gap-2">
                  {myGroup.Members.map(m => (
                    <MemberCard key={m.SID} member={m} amLeader={amLeader} onKick={handleKick} />
                  ))}
                </div>
              </div>
            </>

          ) : (
            /* No team */
            <div className="flex-1 flex flex-col items-center justify-center gap-5 p-8">
              <div className="w-[60px] h-[60px] flex items-center justify-center border border-white/[0.06] bg-menu-surface">
                <Users size={22} className="text-white/20" />
              </div>
              <div className="text-center">
                <p className="font-display font-bold uppercase tracking-[0.1em] text-[0.88rem] text-white/45">
                  No Active Crew
                </p>
                <p className="font-mono text-[0.65rem] text-white/22 mt-1.5 leading-relaxed">
                  Form a crew or request to join one from the list
                </p>
              </div>
              <ActionBtn onClick={() => setCreating(true)} variant="primary">
                <Plus size={11} className="inline mr-1" />
                Form Crew
              </ActionBtn>
            </div>
          )}
        </div>

        {/* Right: Browse + Requests ───────────────────────────────── */}
        <div className="w-[260px] shrink-0 flex flex-col">

          {/* Search bar */}
          <div className="px-3 py-2.5 border-b border-white/[0.06] bg-menu-surface shrink-0">
            <div className="flex items-center justify-between mb-2">
              <span className="font-display font-bold uppercase tracking-[0.12em] text-[0.65rem] text-white/35">All Crews</span>
              <span className="font-mono text-[0.6rem] text-white/20">{filteredTeams.length}</span>
            </div>
            <div className="relative">
              <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search crews…"
                className="w-full h-8 pl-7 pr-3 bg-menu-surface-lt border border-white/10 text-[0.8rem] text-white/70 placeholder-white/20 focus:border-white/20 transition-colors"
              />
            </div>
          </div>

          {/* Teams list */}
          <div className={`overflow-y-auto ${requests.length > 0 ? '' : 'flex-1'}`}>
            {loading ? null : filteredTeams.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <Users size={20} className="text-white/15" />
                <span className="font-mono text-[0.65rem] text-white/18 uppercase">No crews</span>
              </div>
            ) : (
              filteredTeams.map(t => (
                <TeamRow
                  key={t.ID}
                  team={t}
                  isMine={myGroup?.ID === t.ID}
                  canJoin={!myGroup && t.State === 0 && t.Members.length < 5}
                  onJoin={handleJoin}
                />
              ))
            )}
          </div>

          {/* Requests section */}
          {requests.length > 0 && (
            <>
              <div className="px-3 py-2 bg-menu-surface-lt border-y border-white/[0.06] shrink-0">
                <div className="flex items-center gap-1.5">
                  <Bell size={10} className="text-primary" />
                  <span className="font-display font-bold uppercase tracking-[0.12em] text-[0.65rem] text-white/35">
                    Requests ({requests.length})
                  </span>
                </div>
              </div>
              <div className="overflow-y-auto" style={{ maxHeight: '240px' }}>
                {requests.map(req => (
                  <RequestRow key={req.id} req={req} onRespond={handleRequest} />
                ))}
              </div>
            </>
          )}

          {/* Bottom fill when no requests */}
          {requests.length === 0 && <div className="flex-1" />}
        </div>
      </div>

      {/* ── Modals ──────────────────────────────────────────────────── */}
      {creating && (
        <Modal title="Form a Crew" onClose={() => setCreating(false)}>
          <div className="p-4 flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[0.65rem] text-white/40 uppercase tracking-[0.05em]">Crew Name</label>
              <input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                placeholder="Enter name (no spaces)…"
                maxLength={20}
                className="h-9 px-3 w-full bg-menu-surface-lt border border-white/10 text-[0.88rem] text-white/80 placeholder-white/25 focus:border-primary/50 transition-colors"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <ActionBtn onClick={() => setCreating(false)}>Cancel</ActionBtn>
              <ActionBtn onClick={handleCreate} variant="primary" disabled={submitting || !newName.trim()}>
                Create
              </ActionBtn>
            </div>
          </div>
        </Modal>
      )}

      {showInvite && (
        <Modal title="Invite Member" onClose={() => setShowInvite(false)}>
          <div className="p-4 flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[0.65rem] text-white/40 uppercase tracking-[0.05em]">Player SID</label>
              <input
                value={inviteSid}
                onChange={e => setInviteSid(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleInvite()}
                placeholder="Enter SID…"
                className="h-9 px-3 w-full bg-menu-surface-lt border border-white/10 text-[0.88rem] text-white/80 placeholder-white/25 focus:border-primary/50 transition-colors"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <ActionBtn onClick={() => setShowInvite(false)}>Cancel</ActionBtn>
              <ActionBtn onClick={handleInvite} variant="primary" disabled={submitting || !inviteSid.trim()}>
                Send Invite
              </ActionBtn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
