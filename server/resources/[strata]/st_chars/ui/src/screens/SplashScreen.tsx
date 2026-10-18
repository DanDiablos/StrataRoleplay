import React, { useEffect, useRef, useState } from 'react'
import { useStore } from '../store'
import { sendNui } from '../nui'
import Navbar from '../components/Navbar'

interface Particle {
  x:       number
  y:       number
  r:       number
  speed:   number
  drift:   number
  opacity: number
  coral:   boolean
}

export default function SplashScreen(): React.ReactElement {
  const playerName = useStore(s => s.playerName)
  const dispatch   = useStore(s => s.dispatch)
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const animRef    = useRef<number>(0)
  const [visible, setVisible] = useState(true)
  const dismissed  = useRef(false)

  const dismiss = (e: MouseEvent | KeyboardEvent) => {
    if (dismissed.current) return
    if (e.type === 'keydown' && (e as KeyboardEvent).which !== 13 && (e as KeyboardEvent).which !== 32) return
    dismissed.current = true
    setVisible(false)
  }

  useEffect(() => {
    window.addEventListener('click', dismiss)
    window.addEventListener('keydown', dismiss)
    return () => {
      window.removeEventListener('click', dismiss)
      window.removeEventListener('keydown', dismiss)
    }
  }, [])

  useEffect(() => {
    if (!visible) {
      const t = setTimeout(() => {
        sendNui('DismissSplash')
      }, 350)
      return () => clearTimeout(t)
    }
  }, [visible])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const mkParticle = (randomY: boolean): Particle => {
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

    const particles: Particle[] = Array.from({ length: 500 }, () => mkParticle(true))

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
        if (p.y + p.r < 0) particles[i] = mkParticle(false)
        if (p.x < -10) p.x = canvas.width + 10
        if (p.x > canvas.width + 10) p.x = -10
      }
      animRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden cursor-pointer select-none transition-opacity duration-300"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />

      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80vw] h-[55vh] pointer-events-none z-[1]"
        style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(255,92,58,0.08) 0%, transparent 65%)' }}
      />

      <Navbar
        subLabel="welcome"
        right={<span className="font-mono text-[0.68rem] text-white/30 tracking-[0.02em]">discord.gg/stratarp</span>}
      />

      <div className="relative z-[2] flex flex-col items-center gap-4 text-center">
        <div className="flex items-baseline gap-[0.15em] leading-none">
          <span className="font-display font-black text-[clamp(3.5rem,8vw,5.5rem)] text-white leading-none tracking-[-0.02em]">
            STRATA
          </span>
          <span
            className="font-display font-black text-[clamp(3.5rem,8vw,5.5rem)] leading-none tracking-[-0.02em]"
            style={{ background: 'linear-gradient(90deg,#FF5C3A,#FF8C42)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            RP
          </span>
        </div>

        <p className="font-sans italic text-[1.05rem] text-white/40 m-0 tracking-[0.01em]">
          — your city awaits —
        </p>

        {playerName && (
          <p
            className="font-display font-black text-[clamp(2rem,4.5vw,2.8rem)] tracking-[-0.02em] leading-none m-0"
            style={{ background: 'linear-gradient(90deg,#FF5C3A,#FF8C42)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            {playerName}
          </p>
        )}

        <div className="flex items-center gap-[10px] w-[180px]">
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg,transparent,rgba(255,92,58,0.35))' }} />
          <span className="font-mono text-[0.5rem] text-primary/50 leading-none">◆</span>
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg,rgba(255,92,58,0.35),transparent)' }} />
        </div>

        <div className="flex items-center gap-1.5">
          {(['Enter', 'Space', 'Click'] as const).map((k) => (
            <React.Fragment key={k}>
              {k !== 'Enter' && <span className="font-mono text-[0.65rem] text-white/[0.18]">·</span>}
              <span className="font-mono text-[0.72rem] font-medium text-white/90 tracking-[0.08em] uppercase bg-black/40 border border-white/[0.12] px-2.5 py-[3px]">
                {k}
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}
