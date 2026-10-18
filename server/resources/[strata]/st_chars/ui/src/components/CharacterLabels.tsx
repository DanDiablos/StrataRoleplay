import { useState, useEffect, useCallback } from 'react'
import { useStore } from '../store'
import { sendNui } from '../nui'
import type { Character, Job } from '../store'

interface PedPosition {
  slot:    number
  visible: boolean
  headX:   number
  headY:   number
  feetX:   number
  feetY:   number
}

function getJobLabel(jobs: Job[] | undefined): string {
  if (!jobs?.length) return 'Unemployed'
  if (jobs.length === 1) return jobs[0].Workplace?.Name ?? jobs[0].Name
  return `${jobs.length} Jobs`
}

interface CharacterLabelsProps {
  characters: Character[]
}

export default function CharacterLabels({ characters }: CharacterLabelsProps): React.ReactElement | null {
  const dispatch = useStore(s => s.dispatch)
  const [positions, setPositions] = useState<PedPosition[]>([])

  useEffect(() => {
    const handler = (e: MessageEvent<{ type?: string; data?: { positions?: PedPosition[] } }>) => {
      if (!e.isTrusted) return
      if (e.data?.type === 'SET_PED_POSITIONS') {
        setPositions(e.data.data?.positions ?? [])
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  const handleSelect = useCallback((character: Character) => {
    dispatch('LOADING_SHOW', { message: 'Getting Spawn Points' })
    dispatch('SELECT_CHARACTER', { character })
    sendNui('SelectCharacter', { id: character.ID })
  }, [dispatch])

  if (!positions.length) return null

  const slotXNudge: Record<number, number> = { 1: -2.5 }

  return (
    <div className="fixed inset-0 pointer-events-none z-10">
      {positions.map((pos) => {
        if (!pos.visible) return null

        const char    = characters[pos.slot - 1] ?? null
        const xNudge  = slotXNudge[pos.slot] ?? 0
        const headPct = { x: pos.headX * 100, y: pos.headY * 100 }
        const feetPct = { x: pos.feetX * 100, y: pos.feetY * 100 }
        const bodyH   = Math.max((feetPct.y - headPct.y) * window.innerHeight / 100, 40)

        const hitStyle: React.CSSProperties = {
          left:   `${headPct.x + xNudge}vw`,
          top:    `${headPct.y}vh`,
          height: bodyH,
        }

        if (char) {
          return (
            <div
              key={pos.slot}
              className="absolute -translate-x-1/2 pointer-events-auto cursor-pointer flex flex-col items-center justify-start min-w-[72px] group"
              style={hitStyle}
              onDoubleClick={() => handleSelect(char)}
            >
              <div className="bg-[rgba(14,14,14,0.80)] border border-white/[0.08] px-[11px] py-[5px] text-center mb-1 transition-all duration-150 group-hover:border-primary/35 group-hover:shadow-[0_0_12px_rgba(255,92,58,0.12)]">
                <div className="font-mono text-[0.72rem] text-primary tracking-[0.05em] leading-[1.3]">#{char.SID}</div>
                <div className="font-display font-bold text-[0.82rem] text-white tracking-[-0.01em] leading-[1.25] whitespace-nowrap">{char.First} {char.Last}</div>
                <div className="font-mono text-[0.68rem] text-white/70 leading-[1.3] mt-px whitespace-nowrap">{getJobLabel(char.Jobs)}</div>
              </div>
              <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[5px] border-l-transparent border-r-transparent border-t-primary/45" />
            </div>
          )
        }

        return (
          <div
            key={pos.slot}
            className="absolute -translate-x-1/2 pointer-events-none flex flex-col items-center justify-start min-w-[72px]"
            style={hitStyle}
          >
            <div className="flex flex-col items-center gap-[5px] pointer-events-none">
              <div style={{ animation: 'float-arrow 1.8s ease-in-out infinite' }} className="flex flex-col items-center gap-[3px]">
                <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[7px] border-l-transparent border-r-transparent border-t-white/35" />
                <div className="w-px h-[10px] bg-white/[0.18]" />
              </div>
              <div
                className="bg-[rgba(14,14,14,0.60)] border border-white/10 px-3 py-[5px] text-center"
                style={{ animation: 'pulse-border 2.4s ease-in-out infinite' }}
              >
                <div className="font-mono text-[0.70rem] text-white/40 tracking-[0.07em] whitespace-nowrap">Empty Slot</div>
              </div>
              <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-l-transparent border-r-transparent border-t-white/15 mt-0.5" />
            </div>
          </div>
        )
      })}
    </div>
  )
}
