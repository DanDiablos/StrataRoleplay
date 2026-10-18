import { useEffect, useRef, useState } from 'react'
import bgImage from './assets/bg.jpg'
import { useStore } from './store.ts'

const VERSION = 'v1.0.0'

interface Track {
  title:  string
  artist: string
  src:    string
}

const TRACKS: Track[] = [
  { title: 'Nightfall',     artist: 'Sanyo',    src: 'assets/music/track1.mp3' },
  { title: 'City Lights',   artist: 'Sanyo',    src: 'assets/music/track2.mp3' },
  { title: 'After Hours',   artist: 'Sanyo',    src: 'assets/music/track3.mp3' },
  { title: 'Coastline',     artist: 'Sanyo',    src: 'assets/music/track4.mp3' },
  { title: 'Overpass',      artist: 'Sanyo',    src: 'assets/music/track5.mp3' },
]

const TIPS: string[] = [
  "No previous charges. Keep it clean.",
  "Jobs, gangs, and legitimate paths — choose your story.",
  "Every action has a consequence. RP accordingly.",
  "The city doesn't forget. Neither do we.",
  "Community-first roleplay. Respect the scene.",
  "Your character. Your choices. Your reputation.",
]

const LOADING_STAGES: [number, string][] = [
  [0,   "Connecting"],
  [10,  "Starting"],
  [20,  "Initializing"],
  [30,  "Loading components"],
  [40,  "Loading assets"],
  [50,  "Loading data files"],
  [60,  "Initializing game"],
  [70,  "Loading resources"],
  [80,  "Loading textures"],
  [90,  "Finalizing"],
  [100, "Cleaning up"],
]

function getLoadingText(progress: number): string {
  let text = LOADING_STAGES[0][1]
  for (const [threshold, label] of LOADING_STAGES) {
    if (progress >= threshold) text = label
  }
  return text
}

interface Particle {
  x: number
  y: number
  r: number
  speed: number
  drift: number
  opacity: number
  coral: boolean
}

function makeParticle(canvas: HTMLCanvasElement, randomY: boolean): Particle {
  const large = Math.random() > 0.82
  return {
    x:       Math.random() * canvas.width,
    y:       randomY ? Math.random() * canvas.height : canvas.height + 6,
    r:       large ? Math.random() * 2.5 + 1.5 : Math.random() * 1.1 + 0.3,
    speed:   Math.random() * 0.38 + 0.1,
    drift:   (Math.random() - 0.5) * 0.22,
    opacity: large ? Math.random() * 0.18 + 0.04 : Math.random() * 0.52 + 0.12,
    coral:   Math.random() > 0.38,
  }
}

// SVG icon paths
const DISCORD_PATH = "M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.045.033.057a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"
const TIKTOK_PATH = "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"
const X_PATH = "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"

interface SocialBtnProps {
  href: string
  title: string
  path: string
}

function SocialBtn({ href, title, path }: SocialBtnProps): React.ReactElement {
  return (
    <button
      className="bg-transparent border-0 cursor-pointer p-[7px] text-white/40 flex items-center justify-center transition-colors duration-150 hover:text-primary"
      title={title}
      onClick={() => window.open(href, '_blank')}
    >
      <svg className="w-[14px] h-[14px] fill-current" viewBox="0 0 24 24">
        <path d={path} />
      </svg>
    </button>
  )
}

interface NuiMessage {
  eventName?: string
  action?: string
  data?: Record<string, unknown>
  loadFraction?: number
}

export default function App(): React.ReactElement {
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const animFrameRef = useRef<number>(0)

  const playerName      = useStore(s => s.playerName)
  const priority        = useStore(s => s.priority)
  const priorityMessage = useStore(s => s.priorityMessage)
  const loadProgress    = useStore(s => s.loadProgress)
  const loadingText     = useStore(s => s.loadingText)
  const setPlayerData   = useStore(s => s.setPlayerData)
  const setLoadProgress = useStore(s => s.setLoadProgress)

  const [tipIndex,   setTipIndex]   = useState<number>(0)
  const [tipVisible, setTipVisible] = useState<boolean>(true)
  const [clock,      setClock]      = useState<string>(() => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))

  // Music player
  const audioRef                  = useRef<HTMLAudioElement | null>(null)
  const [trackIdx, setTrackIdx]   = useState<number>(0)
  const [playing,  setPlaying]    = useState<boolean>(true)
  const [volume,   setVolume]     = useState<number>(0.4)
  const [listOpen, setListOpen]   = useState<boolean>(false)
  const currentTrack              = TRACKS[trackIdx]

  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    a.volume = volume
  }, [volume])

  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    if (playing) a.play().catch(() => setPlaying(false))
    else         a.pause()
  }, [playing, trackIdx])

  const nextTrack = () => setTrackIdx(i => (i + 1) % TRACKS.length)
  const prevTrack = () => setTrackIdx(i => (i - 1 + TRACKS.length) % TRACKS.length)

  useEffect(() => {
    const id = setInterval(() => {
      setClock(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
    }, 30_000)
    return () => clearInterval(id)
  }, [])

  // Particle canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const particles: Particle[] = Array.from({ length: 500 }, () => makeParticle(canvas, true))

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.coral
          ? `rgba(255,92,58,${p.opacity})`
          : `rgba(255,179,71,${p.opacity})`
        ctx.fill()

        p.y -= p.speed
        p.x += p.drift

        if (p.y + p.r < 0) particles[i] = makeParticle(canvas, false)
        if (p.x < -10)               p.x = canvas.width + 10
        if (p.x > canvas.width + 10) p.x = -10
      }
      animFrameRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animFrameRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  // Tip rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setTipVisible(false)
      setTimeout(() => {
        setTipIndex(i => (i + 1) % TIPS.length)
        setTipVisible(true)
      }, 550)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // NUI messages (loadProgress from engine + playerData from Lua)
  useEffect(() => {
    const handleMessage = (event: MessageEvent<NuiMessage>) => {
      if (!event.data || typeof event.data !== 'object') return
      const { eventName, action, data } = event.data

      if (eventName === 'loadProgress') {
        const pct = Math.min((event.data.loadFraction ?? 0) * 100, 100)
        setLoadProgress(pct, getLoadingText(pct))
        return
      }

      if ((eventName || action) === 'playerData' && data) {
        setPlayerData(
          (data.name            as string)  ?? '',
          (data.priority        as number)  ?? 0,
          (data.priorityMessage as string)  ?? '',
        )
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [setLoadProgress, setPlayerData])

  return (
    <div className="relative w-screen h-screen overflow-hidden flex flex-col items-center justify-center bg-black">
      {/* Animated background (Ken Burns) */}
      <div
        className="absolute inset-0 z-0 bg-ken-burns"
        style={{
          backgroundImage:    `url(${bgImage})`,
          backgroundSize:     'cover',
          backgroundPosition: 'center',
        }}
      />
      {/* Drifting color haze */}
      <div
        className="absolute inset-0 z-0 pointer-events-none bg-haze"
        style={{
          background:
            'radial-gradient(ellipse 60% 45% at 30% 60%, rgba(255,92,58,0.22), transparent 60%), ' +
            'radial-gradient(ellipse 50% 40% at 75% 35%, rgba(120,80,255,0.18), transparent 65%), ' +
            'radial-gradient(ellipse 40% 35% at 55% 80%, rgba(255,179,71,0.14), transparent 60%)',
        }}
      />

      {/* Slow light sweep */}
      <div
        className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
      >
        <div
          className="absolute top-0 left-0 h-full w-1/3 bg-sweep"
          style={{
            background:
              'linear-gradient(100deg, transparent 0%, rgba(255,255,255,0.12) 50%, transparent 100%)',
          }}
        />
      </div>

      {/* Breathing vignette */}
      <div
        className="absolute inset-0 z-0 pointer-events-none bg-vignette"
        style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)' }}
      />

      {/* Particle canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />

      {/* Radial glow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none z-[1]"
        style={{
          width:      '80vw',
          height:     '50vh',
          background: 'radial-gradient(ellipse at 50% 100%, rgba(255,92,58,0.08) 0%, transparent 65%)',
        }}
      />

      {/* Top bar */}
      <div
        className="absolute top-0 left-0 right-0 z-[3] h-[60px] grid items-stretch px-8 ls-enter"
        style={{
          gridTemplateColumns: 'auto auto 1fr auto',
          background:          'rgba(10,10,10,0.92)',
          borderBottom:        '1px solid rgba(255,255,255,0.07)',
        }}
      >
        {/* Wordmark */}
        <div
          className="flex items-center pr-6"
          style={{ borderRight: '1px solid rgba(255,255,255,0.07)' }}
        >
          <span className="font-display font-black text-[1.05rem] bg-gradient-to-r from-primary to-[#FF8C42] bg-clip-text text-transparent">
            STRATA
          </span>
          <span className="font-mono text-[0.85rem] text-white/[0.12] mx-[0.28rem]">/</span>
          <span className="font-mono text-[0.68rem] text-white/30 tracking-[0.02em]">loading</span>
          <span className="font-mono text-[0.62rem] text-white/25 tracking-[0.05em] ml-3 px-1.5 py-[2px] border border-white/10">
            {VERSION}
          </span>
        </div>

        {/* Inline music player */}
        <div className="flex items-center gap-3 pl-6" style={{ borderLeft: '1px solid rgba(255,255,255,0.07)' }}>
          {/* Equalizer */}
          <div className="flex items-end gap-[3px] h-4 w-6 shrink-0">
            {[0, 1, 2, 3].map(i => (
              <div
                key={i}
                className="flex-1 origin-bottom h-full"
                style={{
                  background: 'linear-gradient(180deg, #FF5C3A, #FF8C42)',
                  animation:  playing ? `music-bar 0.9s ease-in-out ${i * 0.12}s infinite` : 'none',
                  transform:  playing ? undefined : 'scaleY(0.2)',
                }}
              />
            ))}
          </div>

          {/* Track info */}
          <div className="flex flex-col leading-tight min-w-[130px] max-w-[180px]">
            <span className="font-display font-bold uppercase tracking-[0.08em] text-[0.72rem] text-white/90 truncate">
              {currentTrack.title}
            </span>
            <span className="font-mono text-[0.58rem] text-white/40 tracking-[0.05em] uppercase truncate">
              {currentTrack.artist}
            </span>
          </div>

          {/* Transport */}
          <div className="flex items-center gap-1">
            <button
              onClick={prevTrack}
              className="w-6 h-6 flex items-center justify-center border border-white/10 bg-white/[0.03] text-white/50 hover:text-white hover:border-primary/40 hover:bg-primary/10 transition-colors"
              title="Previous"
            >
              <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
            </button>
            <button
              onClick={() => setPlaying(p => !p)}
              className="w-6 h-6 flex items-center justify-center border border-primary/40 bg-primary/15 text-primary hover:bg-primary/25 transition-colors"
              title={playing ? 'Pause' : 'Play'}
            >
              {playing
                ? <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current"><path d="M6 5h4v14H6zm8 0h4v14h-4z"/></svg>
                : <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current"><path d="M8 5v14l11-7z"/></svg>}
            </button>
            <button
              onClick={nextTrack}
              className="w-6 h-6 flex items-center justify-center border border-white/10 bg-white/[0.03] text-white/50 hover:text-white hover:border-primary/40 hover:bg-primary/10 transition-colors"
              title="Next"
            >
              <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current"><path d="M6 6l8.5 6L6 18zM16 6h2v12h-2z"/></svg>
            </button>
            <button
              onClick={() => setListOpen(v => !v)}
              className={`w-6 h-6 flex items-center justify-center border transition-colors ${
                listOpen
                  ? 'border-primary/40 bg-primary/15 text-primary'
                  : 'border-white/10 bg-white/[0.03] text-white/50 hover:text-white hover:border-primary/40 hover:bg-primary/10'
              }`}
              title="Playlist"
            >
              <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current"><path d="M3 6h14v2H3zm0 5h14v2H3zm0 5h10v2H3zm16-8l5 3-5 3z"/></svg>
            </button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-2 pl-3 border-l border-white/[0.07]">
            <svg viewBox="0 0 24 24" className="w-3 h-3 fill-white/40">
              <path d="M3 10v4h4l5 5V5L7 10H3zm13.5 2a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4z"/>
            </svg>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={e => setVolume(parseFloat(e.target.value))}
              className="w-14"
            />
          </div>
        </div>

        {/* Spacer */}
        <div />

        {/* Right: socials + discord link */}
        <div
          className="flex items-center gap-3 pl-6"
          style={{ borderLeft: '1px solid rgba(255,255,255,0.07)' }}
        >
          <button
            onClick={() => window.open('https://strataroleplay.com', '_blank')}
            className="font-display font-bold uppercase tracking-[0.12em] text-[0.68rem] text-white/70 hover:text-primary border border-white/10 hover:border-primary/40 bg-white/[0.03] hover:bg-primary/10 px-3 py-[6px] transition-colors"
          >
            Visit Website
          </button>
          <div className="w-px h-[18px] bg-white/[0.07]" />
          <div className="flex items-center gap-0.5">
            <SocialBtn href="https://discord.gg/stratarp"         title="Discord" path={DISCORD_PATH} />
            <SocialBtn href="https://tiktok.com/@placeholder"     title="TikTok"  path={TIKTOK_PATH}  />
            <SocialBtn href="https://x.com/placeholder"           title="X"       path={X_PATH}       />
          </div>
          <div className="w-px h-[18px] bg-white/[0.07]" />
          <span className="font-mono text-[0.68rem] text-white/30 tracking-[0.02em]">
            discord.gg/stratarp
          </span>
          <div className="w-px h-[18px] bg-white/[0.07]" />
          <span className="font-mono text-[0.68rem] text-white/50 tracking-[0.05em]">
            {clock}
          </span>
        </div>
      </div>

      {/* Center */}
      <div className="relative z-[2] flex flex-col items-center gap-4 text-center ls-enter-slow">
        {/* Wordmark */}
        <div className="flex items-baseline gap-[0.15em] leading-none">
          <span
            className="font-display font-black text-white"
            style={{ fontSize: 'clamp(3.5rem, 8vw, 5.5rem)', letterSpacing: '-0.02em' }}
          >
            STRATA
          </span>
          <span
            className="font-display font-black bg-gradient-to-r from-primary to-[#FF8C42] bg-clip-text text-transparent"
            style={{ fontSize: 'clamp(3.5rem, 8vw, 5.5rem)', letterSpacing: '-0.02em' }}
          >
            RP
          </span>
        </div>

        {/* Welcome */}
        {playerName && (
          <p
            className="font-sans text-[1.15rem] font-normal text-white/80 m-0 ls-enter-slow"
            style={{ animationDelay: '0.12s' }}
          >
            Welcome back, <span className="font-semibold text-white">{playerName}</span>
          </p>
        )}

        {/* Tip card */}
        <div
          className="px-[18px] py-2.5 max-w-[480px] border ls-enter-slow"
          style={{
            background:     'rgba(0,0,0,0.38)',
            borderColor:    'rgba(255,255,255,0.10)',
            animationDelay: '0.2s',
          }}
        >
          <p
            className={`font-sans text-base text-white/70 m-0 transition-all duration-500 ${
              tipVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
            }`}
          >
            {TIPS[tipIndex]}
          </p>
        </div>
      </div>

      {/* Priority badge */}
      {priority > 0 && priorityMessage && (
        <div
          className="absolute bottom-[52px] right-5 z-[2] flex flex-col gap-[0.18rem] border min-w-[220px] px-[0.85rem] py-[0.55rem] ls-enter"
          style={{
            background:     'rgba(0,0,0,0.38)',
            borderColor:    'rgba(255,255,255,0.10)',
            animationDelay: '0.3s',
          }}
        >
          <span className="font-display font-bold text-[0.82rem] uppercase tracking-[0.12em] text-white/70">
            Priority
          </span>
          <span className="font-mono text-base text-primary">{priority}</span>
          <span className="font-sans text-base text-white/80">{priorityMessage}</span>
        </div>
      )}

      {/* Music audio element */}
      <audio ref={audioRef} src={currentTrack.src} onEnded={nextTrack} autoPlay />

      {/* Playlist popover (anchored under navbar) */}
      {listOpen && (
        <div
          className="absolute top-[64px] z-[4] w-[300px] border"
          style={{
            left:        'calc(260px)',
            background:  'rgba(10,10,10,0.95)',
            borderColor: 'rgba(255,255,255,0.08)',
          }}
        >
          <div className="px-3 py-2 border-b border-white/[0.06] bg-white/[0.02] flex items-center justify-between">
            <span className="font-display font-bold uppercase tracking-[0.12em] text-[0.7rem] text-white/70">
              Playlist
            </span>
            <span className="font-mono text-[0.6rem] text-white/30 tracking-[0.05em]">
              {TRACKS.length} TRACKS
            </span>
          </div>
          <div className="flex flex-col max-h-[220px] overflow-y-auto">
            {TRACKS.map((t, i) => {
              const active = i === trackIdx
              return (
                <button
                  key={i}
                  onClick={() => { setTrackIdx(i); setPlaying(true) }}
                  className={`flex items-center gap-3 px-3 py-[7px] border-b border-white/[0.04] last:border-0 text-left transition-colors ${
                    active ? 'bg-primary/8' : 'hover:bg-white/[0.04]'
                  }`}
                >
                  <span className={`font-mono text-[0.62rem] tracking-[0.05em] w-4 shrink-0 ${active ? 'text-primary' : 'text-white/30'}`}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className={`font-sans font-medium text-[0.75rem] flex-1 truncate ${active ? 'text-white' : 'text-white/70'}`}>
                    {t.title}
                  </span>
                  <span className="font-mono text-[0.6rem] text-white/30 tracking-[0.05em] uppercase">
                    {t.artist}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Bottom progress bar */}
      <div
        className="absolute bottom-0 left-0 right-0 z-[2] ls-enter"
        style={{ animationDelay: '0.2s' }}
      >
        <div className="flex justify-between items-center px-5 pb-1.5">
          <span className="font-mono text-[0.9rem] text-white/80">{loadingText}</span>
          <span className="font-mono text-[0.9rem] text-primary">{Math.round(loadProgress)}%</span>
        </div>
        <div className="w-full h-1 overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <div
            className="h-full transition-[width] duration-300 ease-out"
            style={{
              width:      `${loadProgress}%`,
              background: 'linear-gradient(135deg, #FF5C3A, #FF8C42, #FFB347)',
            }}
          />
        </div>
      </div>
    </div>
  )
}
