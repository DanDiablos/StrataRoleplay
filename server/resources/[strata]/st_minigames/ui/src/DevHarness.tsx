import { useStore } from './store'
import type { GameConfig } from './types'

const PRESETS: Record<string, GameConfig> = {
  skillbar: {
    type: 'skillbar',
    timer: 3000,
    difficulty: 10,
    randomKey: false,
    events: {},
  },
  keypad: {
    type: 'keypad',
    limit: 10000,
    countdown: 3,
    difficulty: 4,
    total: 1234,
    mask: false,
    events: {},
  },
  scanner: {
    type: 'scanner',
    timer: 80,
    total: 20,
    difficulty: 2,
    limit: 25000,
    countdown: 3,
    randomKey: true,
    events: { onPerfect: 'something' },
  },
  sequencer: {
    type: 'sequencer',
    timer: 500,
    limit: 6000,
    countdown: 3,
    difficulty: 4,
    events: {},
  },
  memory: {
    type: 'memory',
    limit: 15000,
    timer: 3000,
    cols: 3,
    rows: 3,
    errors: 3,
    difficulty: 4,
    total: 9,
    countdown: 3,
    events: {},
  },
  scrambler: {
    type: 'scrambler',
    limit: 25000,
    timer: 3000,
    chance: 3,
    difficulty: 12,
    countdown: 3,
    events: {},
  },
  round: {
    type: 'round',
    rate: 0.8,
    difficulty: 6,
    randomKey: true,
    events: {},
  },
  keymaster: {
    type: 'keymaster',
    countdown: 3,
    timer: [2500, 3500],
    limit: 20000,
    difficulty: 4,
    chances: 5,
    shuffled: false,
    events: {},
  },
  aim: {
    type: 'aim',
    countdown: 3,
    limit: 12000,
    timer: 1200,
    size: 10,
    maxSize: 60,
    difficulty: 30,
    accuracy: 50,
    isMoving: false,
    events: {},
  },
  tracking: {
    type: 'tracking',
    countdown: 3,
    delay: 2000,
    limit: 15000,
    difficulty: 4,
    events: {},
  },
  pattern: {
    type: 'pattern',
    countdown: 3,
    timer: 3000,
    limit: 35000,
    size: 6,
    difficulty: 4,
    difficulty2: 2,
    chance: 'braille',
    events: {},
  },
  icons: {
    type: 'icons',
    countdown: 3,
    timer: 5,
    delay: 1500,
    limit: 15000,
    difficulty: 8,
    difficulty2: 4,
    events: {},
  },
  captcha: {
    type: 'captcha',
    countdown: 3,
    timer: 5000,
    limit: 25000,
    difficulty: 4,
    difficulty2: 2,
    events: {},
  },
}

export default function DevHarness(): React.ReactElement {
  const dispatch = useStore((s) => s.dispatch)
  return (
    <div className="fixed top-3 left-3 z-[9999] flex gap-2 p-2 bg-menu-surface border border-white/10">
      {Object.keys(PRESETS).map((k) => (
        <button
          key={k}
          className="px-3 py-1 border border-white/15 bg-white/5 hover:bg-primary/15 text-[0.72rem] font-medium uppercase tracking-[0.08em]"
          onClick={() => dispatch('SHOW_GAME', { game: PRESETS[k] })}
        >
          {k}
        </button>
      ))}
      <button
        className="px-3 py-1 border border-white/15 bg-white/5 hover:bg-menu-error/25 text-[0.72rem] font-medium uppercase tracking-[0.08em]"
        onClick={() => dispatch('HIDE_GAME')}
      >
        hide
      </button>
    </div>
  )
}
