import { create } from 'zustand'
import type { GameConfig } from './types'
import { getRandomChance, getRandomKey } from './util/chance'

export type GameStatus = 'idle' | 'playing' | 'finished' | 'failed'

interface State {
  hidden: boolean
  game: GameConfig | null
  status: GameStatus
  started: number | null
  dispatch: (type: string, payload?: Record<string, unknown>) => void
  finish: () => void
  fail: () => void
  hide: () => void
}

export const useStore = create<State>((set) => ({
  hidden: !import.meta.env.DEV,
  game: null,
  status: 'idle',
  started: null,

  dispatch: (type, payload = {}) => {
    switch (type) {
      case 'SHOW_GAME': {
        const incoming = (payload as { game?: GameConfig }).game
        if (!incoming) return
        const game: GameConfig = {
          ...incoming,
          chance: getRandomChance(incoming.type, incoming.difficulty, incoming.total),
          key: incoming.randomKey ? getRandomKey(incoming.type) : ['e', 'E'],
        }
        set({ hidden: false, game, status: 'playing', started: Date.now() })
        break
      }
      case 'HIDE_GAME':
        set({ hidden: true, game: null, status: 'idle', started: null })
        break
      case 'FINISH_GAME':
        set({ status: 'finished' })
        break
      case 'FAIL_GAME':
        set({ status: 'failed' })
        break
    }
  },

  finish: () => set({ status: 'finished' }),
  fail: () => set({ status: 'failed' }),
  hide: () => set({ hidden: true, game: null, status: 'idle', started: null }),
}))
