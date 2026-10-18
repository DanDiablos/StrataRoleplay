import { create } from 'zustand'

export interface Job {
  Name: string
  Grade: { Name: string }
  Workplace?: { Name: string }
}

export interface Character {
  ID: number
  SID: string | number
  First: string
  Last: string
  Last_played?: number
  LastPlayed?: number
  Jobs?: Job[]
  Cash?: number | null
}

export interface Spawn {
  id: string
  label: string
  icon?: string
  loggedOffTime?: number
}

export interface Country {
  value: string
  label: string
}

export const STATES = {
  SPLASH:     'STATE_SPLASH',
  CHARACTERS: 'STATE_CHARACTERS',
  CREATE:     'STATE_CREATE',
  SPAWN:      'STATE_SPAWN',
} as const

export type AppState = typeof STATES[keyof typeof STATES]

interface StoreState {
  hidden:         boolean
  appState:       AppState
  playerName:     string
  characters:     Character[]
  selected:       Character | null
  characterLimit: number
  motd:           string | null
  spawns:         Spawn[]
  selectedSpawn:  Spawn | null
  loading:        boolean
  loadingMessage: string
  dispatch:       (type: string, payload?: Record<string, unknown>) => void
}

export const useStore = create<StoreState>((set) => ({
  hidden:         !import.meta.env.DEV,
  appState:       STATES.SPLASH,
  playerName:     '',
  characters:     [],
  selected:       null,
  characterLimit: 3,
  motd:           null,
  spawns:         [],
  selectedSpawn:  null,
  loading:        false,
  loadingMessage: '',

  dispatch: (type, payload = {}) => {
    switch (type) {
      case 'APP_SHOW':
        set({ hidden: false, playerName: (payload.playerName as string) ?? '', appState: STATES.SPLASH })
        break
      case 'APP_HIDE':
        set({ hidden: true })
        break
      case 'APP_UNHIDE':
        set({ hidden: false })
        break
      case 'SET_DATA':
        set({
          characters:     (payload.characters as Character[])  ?? [],
          characterLimit: (payload.characterLimit as number)   ?? 3,
          motd:           (payload.motd as string | null)      ?? null,
        })
        break
      case 'SET_STATE':
        set({ appState: (payload.state as AppState) })
        break
      case 'LOADING_SHOW':
        set({ loading: true, loadingMessage: (payload.message as string) ?? '' })
        break
      case 'LOADING_HIDE':
        set({ loading: false, loadingMessage: '' })
        break
      case 'CREATE_CHARACTER':
        if (payload.character) {
          set(s => ({ characters: [...s.characters, payload.character as Character] }))
        }
        break
      case 'DELETE_CHARACTER':
        set(s => ({ characters: s.characters.filter(c => c.ID !== (payload.id as number)) }))
        break
      case 'SELECT_CHARACTER':
        set({ selected: (payload.character as Character) ?? (payload as unknown as Character) })
        break
      case 'DESELECT_CHARACTER':
        set({ selected: null })
        break
      case 'UPDATE_PLAYED':
        set(s => ({
          characters: s.characters.map(c =>
            s.selected && c.ID === s.selected.ID ? { ...c, LastPlayed: Date.now() } : c
          ),
        }))
        break
      case 'SET_SPAWNS':
        set({ spawns: (payload.spawns as Spawn[]) ?? [] })
        break
      case 'SELECT_SPAWN':
        set({ selectedSpawn: (payload.spawn as Spawn) ?? (payload as unknown as Spawn) })
        break
      case 'DESELECT_SPAWN':
        set({ selectedSpawn: null })
        break
      default:
        break
    }
  },
}))
