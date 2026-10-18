import { useState, useRef, useEffect, useCallback } from 'react'
import { ChevronDown, ChevronUp, Shuffle, Square } from 'lucide-react'
import { useStore } from '../store'
import { sendNui } from '../nui'

export default function RandomizerControls(): React.ReactElement {
  const [expanded, setExpanded] = useState(true)
  const running  = useStore((s) => s.randomizerRunning)
  const speed    = useStore((s) => s.randomizerSpeed)
  const setRunning = useStore((s) => s.setRandomizerRunning)
  const setSpeed   = useStore((s) => s.setRandomizerSpeed)
  const intervalRef = useRef<number | null>(null)

  const doRandomize = useCallback(() => {
    const s = useStore.getState()
    const lockedComponents = Object.entries(s.componentLocks)
      .filter(([, v]) => v)
      .map(([k]) => k)
    const lockedProps = Object.entries(s.propLocks)
      .filter(([, v]) => v)
      .map(([k]) => k)
    sendNui('RandomizeOutfit', { lockedComponents, lockedProps })
  }, [])

  useEffect(() => {
    if (running) {
      doRandomize()
      intervalRef.current = window.setInterval(doRandomize, speed * 1000)
    }
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [running, speed, doRandomize])

  const toggle = () => {
    if (running) {
      setRunning(false)
    } else {
      setExpanded(true)
      setRunning(true)
    }
  }

  return (
    <div className="border-b border-white/[0.06]">
      {/* Header */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className="flex items-center w-full px-4 py-2 hover:bg-white/[0.03] transition-colors"
      >
        <Shuffle size={11} className={`mr-2 ${running ? 'text-primary' : 'text-white/30'}`} />
        <span className="flex-1 text-left font-display font-bold uppercase tracking-[0.12em] text-[0.68rem] text-white/50">
          Randomizer
        </span>
        {running && (
          <span className="font-mono text-[0.6rem] text-primary/60 mr-2 uppercase">Active</span>
        )}
        {expanded
          ? <ChevronUp size={12} className="text-white/30" />
          : <ChevronDown size={12} className="text-white/30" />
        }
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-3 flex flex-col gap-2.5">
          {/* Speed slider */}
          <div className="flex items-center gap-3">
            <span className="font-mono text-[0.62rem] text-white/40 uppercase tracking-[0.05em] w-[52px] shrink-0">
              Speed
            </span>
            <input
              type="range"
              min={3}
              max={10}
              step={0.5}
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="flex-1"
            />
            <span className="font-mono text-[0.65rem] text-white/60 w-[32px] text-right">
              {speed}s
            </span>
          </div>

          {/* Start / Stop button */}
          <button
            onClick={toggle}
            className={`w-full py-2 flex items-center justify-center gap-2 border text-[0.78rem] font-semibold uppercase tracking-[0.06em] transition-colors ${
              running
                ? 'border-red-500/35 bg-red-500/[0.08] text-red-400 hover:bg-red-500/15'
                : 'border-primary/35 bg-primary/[0.08] text-[#FF8C42] hover:bg-primary/15'
            }`}
          >
            {running ? <Square size={12} /> : <Shuffle size={12} />}
            {running ? 'Stop' : 'Randomize'}
          </button>

          <p className="font-mono text-[0.55rem] text-white/20 uppercase tracking-[0.04em] leading-relaxed">
            Lock items with the lock icon to keep them during randomization
          </p>
        </div>
      )}
    </div>
  )
}
