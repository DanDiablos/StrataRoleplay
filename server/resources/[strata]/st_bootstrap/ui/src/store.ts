import { create } from 'zustand'

interface HandoverData {
  name?: string
  priority?: number
  priorityMessage?: string
}

declare global {
  interface Window {
    nuiHandoverData?: HandoverData
  }
}

interface BootState {
  playerName: string
  priority: number
  priorityMessage: string
  loadProgress: number
  loadingText: string
  setPlayerData: (name: string, priority: number, priorityMessage: string) => void
  setLoadProgress: (pct: number, text: string) => void
}

const handover: HandoverData = window?.nuiHandoverData ?? {}

export const useStore = create<BootState>((set) => ({
  playerName:      handover.name            ?? '',
  priority:        handover.priority        ?? 0,
  priorityMessage: handover.priorityMessage ?? '',
  loadProgress:    0,
  loadingText:     'Connecting',

  setPlayerData: (name, priority, priorityMessage) =>
    set({ playerName: name, priority, priorityMessage }),

  setLoadProgress: (pct, text) =>
    set({ loadProgress: pct, loadingText: text }),
}))
