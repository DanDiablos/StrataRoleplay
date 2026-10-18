import { create } from 'zustand'

export type Screen =
  | 'dashboard'
  | 'players'
  | 'disconnected'
  | 'characters'
  | 'items'
  | 'vehicles'
  | 'current-vehicle'
  | 'doorlocks'
  | 'view-player'
  | 'view-vehicle'
  | 'view-doorlock'

export interface User {
  Source: number
  Name: string
  AccountID: number
  Identifier: string
  Level: number
  Discord?: string
  Mention?: string
  GameName?: string
  StaffGroup?: string
  Avatar?: string
}

export interface ToastItem {
  id: number
  type: 'success' | 'error'
  message: string
}

let _toastId = 0

interface AppStore {
  hidden: boolean
  compact: boolean
  opacity: boolean
  user: User | null
  permission: string
  permissionName: string
  permissionLevel: number
  screen: Screen
  viewId: string | null
  toasts: ToastItem[]
  dispatch: (type: string, payload?: Record<string, unknown>) => void
  navigate: (screen: Screen, viewId?: string | null) => void
  addToast: (type: 'success' | 'error', message: string) => void
  removeToast: (id: number) => void
}

export const useStore = create<AppStore>((set, get) => ({
  hidden: !import.meta.env.DEV,
  compact: false,
  opacity: false,
  user: import.meta.env.DEV
    ? { Source: 1, Name: 'Dev User', AccountID: 1, Identifier: 'license:dev', Level: 100 }
    : null,
  permission: import.meta.env.DEV ? 'management' : '',
  permissionName: import.meta.env.DEV ? 'Management' : '',
  permissionLevel: import.meta.env.DEV ? 100 : 0,
  screen: 'dashboard',
  viewId: null,
  toasts: [],

  dispatch: (type, payload = {}) => {
    switch (type) {
      case 'APP_SHOW':
        set({ hidden: false, opacity: false })
        break
      case 'APP_HIDE':
        set({ hidden: true, opacity: false })
        break
      case 'TOGGLE_COMPACT':
        set((s) => ({ compact: !s.compact }))
        break
      case 'SET_OPACITY_MODE':
        set({ opacity: Boolean((payload as { state?: boolean }).state) })
        break
      case 'SET_USERDATA':
        set({
          user: (payload as { user: User }).user ?? null,
          permission: (payload as { permission?: string }).permission ?? '',
          permissionName: (payload as { permissionName?: string }).permissionName ?? '',
          permissionLevel: (payload as { permissionLevel?: number }).permissionLevel ?? 0,
        })
        break
      case 'LOGOUT':
        set({
          hidden: true,
          compact: false,
          opacity: false,
          user: null,
          permission: '',
          permissionName: '',
          permissionLevel: 0,
          screen: 'dashboard',
          viewId: null,
        })
        break
    }
  },

  navigate: (screen, viewId = null) => {
    set({ screen, viewId })
  },

  addToast: (type, message) => {
    const id = ++_toastId
    set((s) => ({ toasts: [...s.toasts, { id, type, message }] }))
    setTimeout(() => get().removeToast(id), 3500)
  },

  removeToast: (id) => {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
  },
}))
