import { useEffect } from 'react'
import { useStore } from './store'
import type { GameType } from './types'
import Skillbar from './games/Skillbar'
import Keypad from './games/Keypad'
import Scanner from './games/Scanner'
import Sequencer from './games/Sequencer'
import Memory from './games/Memory'
import Scrambler from './games/Scrambler'
import Round from './games/Round'
import Keymaster from './games/Keymaster'
import Aim from './games/Aim'
import Tracking from './games/Tracking'
import Pattern from './games/Pattern'
import Icons from './games/Icons'
import Captcha from './games/Captcha'
import DevHarness from './DevHarness'

const GAMES: Partial<Record<GameType, React.ComponentType>> = {
  skillbar: Skillbar,
  keypad: Keypad,
  scanner: Scanner,
  sequencer: Sequencer,
  memory: Memory,
  scrambler: Scrambler,
  round: Round,
  keymaster: Keymaster,
  aim: Aim,
  tracking: Tracking,
  pattern: Pattern,
  icons: Icons,
  captcha: Captcha,
}

export default function App(): React.ReactElement | null {
  const hidden = useStore((s) => s.hidden)
  const game = useStore((s) => s.game)
  const dispatch = useStore((s) => s.dispatch)

  useEffect(() => {
    const handler = (e: MessageEvent<{ type?: string; data?: Record<string, unknown> }>) => {
      if (!e.isTrusted) return
      const { type, data } = e.data ?? {}
      if (type) dispatch(type, data ?? {})
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [dispatch])

  const Screen = game ? GAMES[game.type] : null
  const showFallback = !hidden && game && !Screen

  return (
    <>
      {import.meta.env.DEV && <DevHarness />}
      {!hidden && Screen && <Screen />}
      {showFallback && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
          <div className="px-6 py-4 bg-menu-surface border border-white/10 font-mono text-[0.8rem] text-white/60">
            minigame <span className="text-primary">{game!.type}</span> not yet ported
          </div>
        </div>
      )}
    </>
  )
}
