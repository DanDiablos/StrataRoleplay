import React, { useState, useEffect } from 'react'
import { Heart, Image, RefreshCw, Send, Smile, ChevronLeft, BadgeCheck } from 'lucide-react'
import { useStore } from '../store'
import { sendNui } from '../nui'

interface Tweet {
  id: number
  time: number
  source: number
  SID: number
  author: { name: string }
  content: string
  image?: string
  likes: Record<string, boolean>
  retweet?: number
  verified?: boolean
}

type View = 'feed' | 'compose'

export default function TwitterScreen(): React.ReactElement {
  const player = useStore((s) => s.player)
  const dispatch = useStore((s) => s.dispatch)

  const [view, setView] = useState<View>('feed')
  const [tweets, setTweets] = useState<Tweet[]>([])
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState('')
  const [tweetCount, setTweetCount] = useState(0)

  /* Load tweets on mount */
  useEffect(() => {
    const load = async () => {
      try {
        const countRes = await sendNui('Twitter:GetCount', {})
        try { const c = await countRes.json(); if (typeof c === 'number') setTweetCount(c) } catch {}
        const tweetsRes = await sendNui('Twitter:GetTweets', { offset: 0 })
        try { const t = await tweetsRes.json(); if (Array.isArray(t)) setTweets(t) } catch {}
      } catch { /* noop */ }
      setLoading(false)
    }
    load()

    // Listen for live tweet updates from Lua
    const handler = (e: MessageEvent) => {
      if (!e.isTrusted) return
      const { type, data } = e.data ?? {}
      if (type === 'RECEIVED_NEW_TWEET' && data) {
        setTweets((prev) => [data as Tweet, ...prev])
      } else if (type === 'CLEAR_TWEETS') {
        setTweets([])
      } else if (type === 'REMOVE_ACCOUNT_TWEETS' && data) {
        setTweets((prev) => prev.filter((t) => t.author?.name !== (data as { name: string })?.name))
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  const handlePost = () => {
    if (!content.trim()) return
    sendNui('SendTweet', { content: content.trim(), image: '', retweet: null })
    setContent('')
    setView('feed')
  }

  const formatTime = (ts: number): string => {
    const now = Math.floor(Date.now() / 1000)
    const diff = now - ts
    if (diff < 60) return 'now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`
    return `${Math.floor(diff / 86400)}d`
  }

  /* ── Compose view ───────────────────── */
  if (view === 'compose') {
    return (
      <div className="flex-1 flex flex-col min-h-0">
        <div className="shrink-0 flex items-center gap-2 px-3 py-3 bg-black/30 border-b border-white/[0.06]">
          <button onClick={() => setView('feed')} className="text-white/40 hover:text-white/70 transition-colors">
            <ChevronLeft size={16} />
          </button>
          <span className="font-display font-bold uppercase tracking-[0.1em] text-[0.72rem] text-white/70">
            New Post
          </span>
          <div className="flex-1" />
          <button
            onClick={handlePost}
            disabled={!content.trim()}
            className="px-3 py-1 rounded-full bg-[#c4b404]/20 border border-[#c4b404]/30 text-[0.68rem] font-semibold text-[#c4b404] disabled:opacity-30 hover:bg-[#c4b404]/30 transition-colors"
          >
            Post
          </button>
        </div>
        <div className="flex-1 px-4 py-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, 280))}
            placeholder="What's happening?"
            className="w-full h-32 p-3 bg-white/[0.03] border border-white/[0.06] rounded-lg text-[0.78rem] text-white/80 placeholder-white/25 resize-none focus:border-[#c4b404]/40 transition-colors"
            autoFocus
          />
          <div className="flex items-center justify-between mt-2">
            <span className="font-mono text-[0.58rem] text-white/30">{content.length}/280</span>
          </div>
        </div>
      </div>
    )
  }

  /* ── Feed view ──────────────────────── */
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="shrink-0 flex items-center justify-between px-4 py-3 bg-black/30 border-b border-white/[0.06]">
        <div className="flex items-center gap-1.5">
          <Smile size={14} className="text-[#3498db]" />
          <span className="font-display font-bold uppercase tracking-[0.1em] text-[0.72rem] text-white/70">
            Tweeter
          </span>
        </div>
        <button
          onClick={() => setView('compose')}
          className="w-7 h-7 flex items-center justify-center rounded-full bg-[#c4b404]/15 text-[#c4b404] hover:bg-[#c4b404]/25 transition-colors"
        >
          <Send size={12} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col">
        {tweets.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2">
            <Smile size={28} className="text-white/20" />
            <span className="font-mono text-[0.65rem] text-white/20 uppercase tracking-[0.08em]">
              {loading ? 'Loading...' : 'No posts yet'}
            </span>
          </div>
        ) : (
          tweets.map((tweet) => (
            <div key={tweet.id} className="px-4 py-3 border-b border-white/[0.03]">
              {/* Author row */}
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-7 h-7 rounded-full bg-[#c4b404]/15 flex items-center justify-center shrink-0">
                  <span className="text-[0.55rem] font-bold text-[#c4b404]">
                    {tweet.author.name?.[0]?.toUpperCase() ?? '?'}
                  </span>
                </div>
                <div className="flex items-center gap-1 min-w-0">
                  <span className="text-[0.72rem] font-medium text-white/80 truncate">{tweet.author.name}</span>
                  {tweet.verified && <BadgeCheck size={11} className="text-[#c4b404] shrink-0" />}
                </div>
                <span className="font-mono text-[0.5rem] text-white/25 ml-auto shrink-0">{formatTime(tweet.time)}</span>
              </div>

              {/* Content */}
              <p className="text-[0.72rem] text-white/70 leading-relaxed break-words">{tweet.content}</p>

              {/* Image */}
              {tweet.image && (
                <div className="mt-2 rounded-lg overflow-hidden bg-white/[0.03] border border-white/[0.04]">
                  <img src={tweet.image} alt="" className="w-full max-h-[150px] object-cover" />
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-4 mt-2">
                <button className="flex items-center gap-1 text-white/25 hover:text-red-400/60 transition-colors">
                  <Heart size={12} />
                  <span className="font-mono text-[0.5rem]">{Object.keys(tweet.likes ?? {}).length}</span>
                </button>
                {tweet.retweet && (
                  <div className="flex items-center gap-1 text-white/20">
                    <RefreshCw size={11} />
                    <span className="font-mono text-[0.5rem]">RT</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
