import { create } from 'zustand'

const isDev = import.meta.env.DEV

let msgId = 0

export interface Suggestion {
  name: string
  help?: string
  params?: Array<{ name: string; help?: string }>
}

export interface OocAuthor {
  First: string
  Last: string
  SID: string
}

export interface EmergencyAuthor {
  First?: string
  Last?: string
  SID?: string
  Phone?: string
  Anonymous?: boolean
  Reply?: string
}

export type MessageAuthor = string | OocAuthor | EmergencyAuthor

export interface ChatMessage {
  id: number
  type?: string
  message?: string
  author?: MessageAuthor
  args?: string[]
  color?: [number, number, number]
}

interface StoreState {
  open: boolean
  messages: ChatMessage[]
  suggestions: Suggestion[]
  history: string[]
  pushHistory: (msg: string) => void
  dispatch: (type: string, payload?: Record<string, unknown>) => void
}

const DEV_MESSAGES: ChatMessage[] = [
  { id: ++msgId, type: 'chat',      message: 'Hello world!',             author: 'PlayerOne' },
  { id: ++msgId, type: 'ooc',       message: 'This is an OOC message',   author: { First: 'John', Last: 'Doe', SID: '1234' } },
  { id: ++msgId, type: 'system',    message: 'Server restarting in 5min' },
  { id: ++msgId, type: 'server',    message: 'Welcome to the server!' },
  { id: ++msgId, type: '911',       message: 'Armed robbery at Maze Bank', author: { First: 'Jane', Last: 'Smith', SID: '5678', Phone: '555-1234' } },
  { id: ++msgId, type: '311',       message: 'Suspicious vehicle on Route 1', author: { First: 'Bob', Last: 'Jones', SID: '9999', Phone: '555-5678' } },
  { id: ++msgId, type: '411',       message: 'All units respond to downtown' },
  { id: ++msgId, type: 'dispatch',  message: 'Unit 4 heading to scene' },
  { id: ++msgId, type: 'broadcast', message: 'Server event starting soon!' },
  { id: ++msgId, type: 'tests',     message: 'Blood Type: A+, Alcohol: 0.00' },
]

export const useStore = create<StoreState>((set) => ({
  open:        isDev,
  messages:    isDev ? DEV_MESSAGES : [],
  suggestions: isDev ? [
    { name: '/me',  help: 'RP action' },
    { name: '/ooc', help: 'Out of character' },
    { name: '/tp',  help: 'Teleport to coords' },
  ] : [],
  history: [],

  pushHistory: (msg) => set(s => {
    if (!msg) return s
    const trimmed = s.history[s.history.length - 1] === msg
      ? s.history
      : [...s.history, msg]
    return { history: trimmed.slice(-50) }
  }),

  dispatch: (type, payload = {}) => {
    switch (type) {
      case 'ON_OPEN':
        set({ open: true })
        break

      case 'ON_SCREEN_STATE_CHANGE':
        if (payload.shouldHide) {
          set({ open: false })
        }
        break

      case 'ON_MESSAGE': {
        const msg = payload.message as ChatMessage | undefined
        if (!msg) break
        set(s => ({
          messages: [...s.messages.slice(-99), { ...msg, id: ++msgId }],
        }))
        break
      }

      case 'ON_CLEAR':
        set({ messages: [] })
        break

      case 'ON_SUGGESTION_ADD': {
        const suggestion = payload.suggestion as Suggestion | undefined
        if (!suggestion) break
        set(s => {
          const existingIdx = s.suggestions.findIndex(sg => sg.name === suggestion.name)
          if (existingIdx >= 0) {
            // Prefer the version with params — server sends richer data than client RefreshCommands
            const existing = s.suggestions[existingIdx]
            if (!existing.params?.length && suggestion.params?.length) {
              const updated = [...s.suggestions]
              updated[existingIdx] = suggestion
              return { suggestions: updated }
            }
            return s
          }
          return { suggestions: [...s.suggestions, suggestion] }
        })
        break
      }

      case 'ON_SUGGESTION_REMOVE':
        set(s => ({
          suggestions: s.suggestions.filter(sg => sg.name !== payload.name),
        }))
        break

      case 'ON_COMMANDS_RESET':
        set({ suggestions: [] })
        break
    }
  },
}))
