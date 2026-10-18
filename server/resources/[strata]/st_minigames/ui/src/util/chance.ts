import type { GameType } from '../types'
import CHARSETS from '../games/Pattern/charsets'

const KEYMAP = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

export function getRandomChance(
  type: GameType,
  difficulty: number | undefined,
  extra: unknown = null,
): unknown {
  switch (type) {
    case 'skillbar':
      return Math.floor(Math.random() * (difficulty ?? 10)) + 35
    case 'scanner': {
      const d = difficulty ?? 0
      const total = Number(extra) || 20
      const min = d === 0 ? 1 : 1 + d
      const max = total - d
      return Math.floor(Math.random() * (max - min + 1 - d)) + min
    }
    case 'sequencer': {
      const d = difficulty ?? 4
      const arr: number[] = []
      while (arr.length < d) {
        const r = Math.floor(Math.random() * 12) + 1
        if (arr[arr.length - 1] !== r) arr.push(r)
      }
      return arr
    }
    case 'memory': {
      const d = difficulty ?? 5
      const total = Number(extra) || 9
      const arr: number[] = []
      while (arr.length < d) {
        const r = Math.floor(Math.random() * total) + 1
        if (arr.indexOf(r) === -1) arr.push(r)
      }
      return arr
    }
    case 'keypad':
      return String(extra ?? '')
        .split('')
        .filter((c) => Boolean(c))
        .map((c) => Number(c))
    case 'pattern': {
      const name = typeof extra === 'string' && extra in CHARSETS ? extra : 'alphanumer'
      return CHARSETS[name]
    }
    default:
      return extra
  }
}

export function getRandomKey(type: GameType): string[] | string[][] {
  switch (type) {
    case 'skillbar':
      return ['e', 'E']
    case 'round': {
      const keys = ['1', '2', '3']
      return [keys[Math.floor(Math.random() * keys.length)]]
    }
    case 'scanner': {
      const k = KEYMAP[Math.floor(Math.random() * KEYMAP.length)]
      return [k.toLowerCase(), k.toUpperCase()]
    }
    default:
      return ['e', 'E']
  }
}
