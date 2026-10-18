export type GameType =
  | 'skillbar'
  | 'round'
  | 'scanner'
  | 'sequencer'
  | 'keypad'
  | 'scrambler'
  | 'memory'
  | 'aim'
  | 'captcha'
  | 'keymaster'
  | 'pattern'
  | 'icons'
  | 'tracking'

export interface GameEvents {
  onFail?: string
  onSuccess?: string
  onPerfect?: string
}

export interface GameConfig {
  type: GameType
  timer?: number | number[]
  limit?: number
  countdown?: number
  difficulty?: number
  difficulty2?: number
  total?: number
  rate?: number
  cols?: number
  rows?: number
  errors?: number
  chances?: number
  size?: number
  maxSize?: number
  accuracy?: number
  isMoving?: boolean
  mask?: boolean
  shuffled?: boolean
  delay?: number
  randomKey?: boolean
  needsMouse?: boolean
  events: GameEvents
  chance?: unknown
  key?: string[] | string[][]
  [extra: string]: unknown
}
