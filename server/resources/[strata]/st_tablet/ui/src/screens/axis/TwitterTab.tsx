import { useState, useEffect } from 'react'
import { MessageSquare, Send } from 'lucide-react'
import { sendNui } from '../../nui'
import ActionBtn from '../../components/ActionBtn.tsx'
import Loader from '../../components/Loader.tsx'

interface TweetPost {
  id: string
  content: string
  author: string
  created_at: string
  likes?: number
}

interface TwitterProfile {
  handle: string
  displayName?: string
  bio?: string
  followers?: number
  verified?: boolean
}

export default function TwitterTab(): React.ReactElement {
  const [loading, setLoading]             = useState(true)
  const [tweets, setTweets]               = useState<TweetPost[]>([])
  const [profile, setProfile]             = useState<TwitterProfile | null>(null)
  const [content, setContent]             = useState('')
  const [handle, setHandle]               = useState('')
  const [displayName, setDisplayName]     = useState('')
  const [bio, setBio]                     = useState('')
  const [saving, setSaving]               = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const r = await sendNui('GetBusinessTwitter', {})
        const result = await r.json()
        if (result) {
          setTweets(result.tweets ?? [])
          setProfile(result.profile ?? null)
          if (result.profile) {
            setHandle(result.profile.handle ?? '')
            setDisplayName(result.profile.displayName ?? '')
            setBio(result.profile.bio ?? '')
          }
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const doTweet = async () => {
    if (!content.trim()) return
    setSaving(true)
    try {
      const r = await sendNui('SendBusinessTweet', { content })
      const result = await r.json()
      if (result) {
        setContent('')
        setTweets(t => [result, ...t])
      }
    } finally {
      setSaving(false)
    }
  }

  const doSaveProfile = async () => {
    setSaving(true)
    try {
      await sendNui('SetBusinessTwitter', { handle, displayName, bio })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="h-full flex items-center justify-center"><Loader /></div>
  )

  const previewName   = displayName || handle || 'Display Name'
  const previewHandle = handle || 'handle'
  const initial       = previewName[0]?.toUpperCase() ?? '?'

  return (
    <div className="h-full flex overflow-hidden">

      {/* ── Left: compose + feed ──────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col p-5 gap-3.5">

        {/* Compose */}
        <div className="bg-menu-surface border border-white/[0.06] p-3 flex flex-col gap-2 shrink-0">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="What's happening at your business?"
            rows={3}
            maxLength={280}
            className="w-full bg-transparent text-[0.84rem] text-white/80 placeholder-white/25 resize-none"
          />
          <div className="flex items-center justify-between">
            <span className="font-mono text-[0.65rem] text-white/25">{content.length}/280</span>
            <ActionBtn onClick={doTweet} variant="primary" disabled={saving || !content.trim()}>
              <Send size={11} className="inline mr-1" />
              Tweet
            </ActionBtn>
          </div>
        </div>

        {/* Feed */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 pr-1">
          {tweets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <MessageSquare size={28} className="text-white/20" />
              <span className="font-mono text-[0.72rem] text-white/20 uppercase tracking-[0.06em]">No tweets yet</span>
            </div>
          ) : (
            tweets.map(t => (
              <div key={t.id} className="px-4 py-3 bg-menu-surface border-b border-white/[0.04] last:border-0">
                <span className="text-[0.84rem] text-white/80 leading-snug block mb-1.5">{t.content}</span>
                <span className="font-mono text-[0.62rem] text-white/30">{t.author} · {t.created_at}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Right: profile panel ──────────────────────────────────── */}
      <div className="w-[260px] shrink-0 border-l border-white/[0.06] overflow-y-auto">

        {/* Profile preview */}
        <div className="p-4 border-b border-white/[0.06] flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1da1f2]/10 border border-[#1da1f2]/20 flex items-center justify-center shrink-0">
              <span className="font-display font-bold text-[0.9rem] text-[#1da1f2]/60">{initial}</span>
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-[0.84rem] text-white/85 truncate">{previewName}</span>
                {profile?.verified && <span className="text-[#1da1f2] text-[0.72rem] shrink-0">✓</span>}
              </div>
              <span className="font-mono text-[0.63rem] text-white/35">@{previewHandle}</span>
            </div>
          </div>
          {profile?.followers != null && (
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-[0.78rem] text-white/60">{profile.followers.toLocaleString()}</span>
              <span className="font-mono text-[0.6rem] text-white/25 uppercase tracking-[0.04em]">followers</span>
            </div>
          )}
        </div>

        {/* Edit fields */}
        <div className="p-4 flex flex-col gap-3">
          <span className="font-display font-bold uppercase tracking-[0.12em] text-[0.65rem] text-white/40">
            Profile Settings
          </span>
          <Field label="Handle (@)">
            <input value={handle} onChange={e => setHandle(e.target.value)} placeholder="businesshandle"
              className="h-9 px-3 w-full bg-menu-surface-lt border border-white/10 text-[0.84rem] text-white/80 placeholder-white/25 focus:border-primary/50 transition-colors" />
          </Field>
          <Field label="Display Name">
            <input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Business Name"
              className="h-9 px-3 w-full bg-menu-surface-lt border border-white/10 text-[0.84rem] text-white/80 placeholder-white/25 focus:border-primary/50 transition-colors" />
          </Field>
          <Field label="Bio">
            <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Business bio…" rows={4}
              className="px-3 py-2 w-full bg-menu-surface-lt border border-white/10 text-[0.82rem] text-white/80 placeholder-white/25 focus:border-primary/50 transition-colors" />
          </Field>
          <ActionBtn onClick={doSaveProfile} variant="primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save Profile'}
          </ActionBtn>
        </div>

      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-mono text-[0.63rem] text-white/35 uppercase tracking-[0.05em]">{label}</label>
      {children}
    </div>
  )
}
