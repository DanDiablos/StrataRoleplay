import { useState, useEffect } from 'react'
import { useStore } from '../../store.ts'

function formatTime(ms: number): string {
  if (ms <= 0) return '0:00'
  const totalSec = Math.ceil(ms / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function Key({ children }: { children: string }): React.ReactElement {
  return (
    <span
      className="inline-flex items-center justify-center font-bold text-[0.85em] px-2 py-0.5 mx-1 min-w-[24px] text-[#FF5C3A]"
      style={{
        background: 'rgba(255,92,58,0.12)',
        border: '1px solid rgba(255,92,58,0.3)',
      }}
    >
      {children}
    </span>
  )
}

function Timer({ ms }: { ms: number }): React.ReactElement {
  return (
    <span className="font-mono font-bold text-[#FF5C3A] ml-1.5">
      {formatTime(ms)}
    </span>
  )
}

export default function DeathTexts(): React.ReactElement | null {
  const isDeathTexts = useStore(s => s.isDeathTexts)
  const isReleasing = useStore(s => s.isReleasing)
  const deathTime = useStore(s => s.deathTime)
  const releaseTimer = useStore(s => s.releaseTimer)
  const releaseType = useStore(s => s.releaseType)
  const releaseKey = useStore(s => s.releaseKey)
  const helpKey = useStore(s => s.helpKey)
  const medicalPrice = useStore(s => s.medicalPrice)

  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    if (!isDeathTexts) return
    const id = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(id)
  }, [isDeathTexts])

  if (!isDeathTexts || !releaseType || !releaseTimer) return null

  const remaining = releaseTimer - now
  const canRelease = remaining <= 0

  // Medical help available 2 minutes after death
  const helpAvailableAt = deathTime + 1000 * 60 * 2
  const helpRemaining = helpAvailableAt - now
  const canCallHelp = helpRemaining <= 0

  if (isReleasing) {
    const text =
      releaseType === 'knockout' ? 'Standing Up...' :
      releaseType === 'hospital' || releaseType === 'hospital_rp' ? 'Getting Up...' :
      'Respawning...'

    return (
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 40 }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <span className="font-display font-bold text-[1.2rem] text-white/80 uppercase tracking-widest drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,1)]">
            {text}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div
      className="fixed left-0 right-0 flex flex-col items-center pointer-events-none animate-fade-in"
      style={{ bottom: 150, zIndex: 40 }}
    >
      <div
        className="relative flex flex-col items-center gap-2 px-6 py-4 border border-white/[0.08]"
        style={{ background: 'rgba(10,10,10,0.85)', boxShadow: '0 4px 24px rgba(0,0,0,0.5)' }}
      >
        {/* Left accent */}
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary" />

        {/* Main line */}
        <div className="text-[0.95rem] font-bold text-white/80 uppercase tracking-wider drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,1)] flex items-center">
          {releaseType === 'knockout' && (
            canRelease ? (
              <span className="flex items-center">
                Press <Key>{releaseKey}</Key> To Stand Up
              </span>
            ) : (
              <span className="flex items-center">
                Unconscious — Stand Up In <Timer ms={remaining} />
              </span>
            )
          )}

          {releaseType === 'death' && (
            canRelease ? (
              <span className="flex items-center">
                Press <Key>{releaseKey}</Key> To Respawn
                <span className="font-mono text-white/40 ml-1.5">(${medicalPrice})</span>
              </span>
            ) : (
              <span className="flex items-center">
                Downed — Respawn Available In <Timer ms={remaining} />
              </span>
            )
          )}

          {releaseType === 'hospital' && (
            canRelease ? (
              <span className="flex items-center">
                Press <Key>{releaseKey}</Key> To Get Out Of Bed
              </span>
            ) : (
              <span className="flex items-center">
                Being Treated <Timer ms={remaining} />
              </span>
            )
          )}

          {releaseType === 'hospital_rp' && (
            <span className="flex items-center">
              Press <Key>{releaseKey}</Key> To Get Out Of Bed
            </span>
          )}
        </div>

        {/* Secondary line — medical help (death type only) */}
        {releaseType === 'death' && (
          <div className="text-[0.72rem] text-white/40 uppercase tracking-wider flex items-center">
            {canCallHelp ? (
              <span className="flex items-center">
                Press <Key>{helpKey}</Key> To Call For Medical Assistance
              </span>
            ) : (
              <span className="flex items-center">
                Medical Assistance Available In <Timer ms={helpRemaining} />
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
