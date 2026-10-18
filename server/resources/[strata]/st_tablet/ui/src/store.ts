import { create } from 'zustand'
import type { LaptopApp, LaptopNotification, LSUDetails } from './types'
import {
  MOCK_APPS, MOCK_AXIS_PAGES, MOCK_PLAYER, MOCK_JOB_DATA,
  MOCK_NOTICES, MOCK_TEAM, MOCK_NOTIFICATIONS, MOCK_BOOSTING_CONTRACTS,
} from './mock'

const DEV = import.meta.env.DEV

const devData: Record<string, unknown> = DEV ? {
  player:            MOCK_PLAYER,
  jobData:           MOCK_JOB_DATA,
  businessLogo:      null,
  businessPages:     MOCK_AXIS_PAGES,
  businessNotices:   MOCK_NOTICES,
  myGroup:           MOCK_TEAM,
  boostingContracts: MOCK_BOOSTING_CONTRACTS,
  disabledBoostingContracts: [],
  onDuty:            true,
} : {}

interface StoreState {
  hidden: boolean
  locked: boolean
  screen: string
  axisTab: string
  lsuTab: string
  apps: LaptopApp[]
  time: string | null
  perms: Record<string, Record<string, boolean>>
  notifications: LaptopNotification[]
  data: Record<string, unknown>
  lsuData: LSUDetails | null
  dispatch: (type: string, payload?: unknown) => void
  navigate: (screen: string, opts?: { axisTab?: string; lsuTab?: string }) => void
}

export const useStore = create<StoreState>((set) => ({
  hidden: !DEV,
  locked: true,
  screen: 'home',
  axisTab: 'Dashboard',
  lsuTab: 'market',
  apps: DEV ? MOCK_APPS : [],
  time: DEV ? '14:32' : null,
  perms: {},
  notifications: DEV ? MOCK_NOTIFICATIONS : [],
  data: devData,
  lsuData: null,

  navigate: (screen, opts) =>
    set(state => ({
      screen,
      axisTab: opts?.axisTab ?? state.axisTab,
      lsuTab: opts?.lsuTab ?? state.lsuTab,
    })),

  dispatch: (type, payload) => {
    switch (type) {
      case 'LAPTOP_VISIBLE':
        set({ hidden: false, screen: 'home', locked: true })
        break

      case 'UNLOCK':
        set({ locked: false })
        break

      case 'LAPTOP_NOT_VISIBLE':
      case 'LAPTOP_NOT_VISIBLE_FORCED':
        set({ hidden: true, screen: 'home', axisTab: 'Dashboard', lsuTab: 'market', locked: true })
        break

      case 'ALERTS_RESET':
        break

      case 'SET_APPS': {
        const raw = payload
        const arr = Array.isArray(raw) ? raw as LaptopApp[] : Object.values(raw as Record<string, LaptopApp>)
        set({ apps: arr })
        break
      }

      case 'SET_TIME': {
        const t = payload as { hour: number; minute: number }
        set({ time: `${String(t.hour).padStart(2, '0')}:${String(t.minute).padStart(2, '0')}` })
        break
      }

      case 'SET_DATA': {
        const p = payload as { type: string; data: unknown }
        set(state => ({ data: { ...state.data, [p.type]: p.data } }))
        break
      }

      case 'ADD_DATA': {
        const p = payload as { type: string; data: unknown; key?: string }
        set(state => {
          const current = state.data[p.type]
          if (Array.isArray(current)) {
            return { data: { ...state.data, [p.type]: [...current, p.data] } }
          }
          return { data: { ...state.data, [p.type]: [p.data] } }
        })
        break
      }

      case 'UPDATE_DATA': {
        const p = payload as { type: string; id: string; data: unknown }
        set(state => {
          const current = state.data[p.type]
          if (Array.isArray(current)) {
            return {
              data: {
                ...state.data,
                [p.type]: current.map((item: Record<string, unknown>) =>
                  item.id === p.id ? { ...item, ...(p.data as object) } : item
                ),
              },
            }
          }
          return state
        })
        break
      }

      case 'REMOVE_DATA': {
        const p = payload as { type: string; id: string }
        set(state => {
          const current = state.data[p.type]
          if (Array.isArray(current)) {
            return {
              data: {
                ...state.data,
                [p.type]: current.filter((item: unknown) => {
                  if (typeof item === 'string') return item !== p.id
                  if (typeof item === 'object' && item !== null)
                    return (item as Record<string, unknown>).id !== p.id
                  return true
                }),
              },
            }
          }
          return state
        })
        break
      }

      case 'RESET_DATA':
        set({ data: {}, lsuData: null })
        break

      case 'CLOSE_ALL_APPS':
      case 'CLEAR_HISTORY':
        set({ screen: 'home', axisTab: 'Dashboard', lsuTab: 'market' })
        break

      case 'NAV':
        if (typeof payload === 'string') set({ screen: payload })
        break

      case 'LOAD_PERMS':
        set({ perms: payload as Record<string, Record<string, boolean>> })
        break

      case 'NOTIF_ADD': {
        const p = payload as { notification: LaptopNotification }
        if (!p?.notification) break
        const notif = p.notification
        set(state => {
          if (notif._id) {
            const exists = state.notifications.find(n => n._id === notif._id)
            if (exists) {
              return { notifications: state.notifications.map(n => n._id === notif._id ? { ...notif } : n) }
            }
          }
          return { notifications: [...state.notifications, notif] }
        })
        break
      }

      case 'NOTIF_UPDATE': {
        const p = payload as { id: string; title: string; description: string }
        set(state => ({
          notifications: state.notifications.map(n =>
            n._id === p.id ? { ...n, title: p.title, description: p.description } : n
          ),
        }))
        break
      }

      case 'NOTIF_HIDE': {
        const p = payload as { id: string }
        set(state => ({
          notifications: state.notifications.map(n =>
            n._id === p.id ? { ...n, show: false } : n
          ),
        }))
        break
      }

      case 'NOTIF_DISMISS_ALL':
        set({ notifications: [] })
        break

      case 'UI_RESET':
        set({ hidden: true, screen: 'home', locked: true, notifications: [], data: {}, apps: [], lsuData: null })
        break
    }
  },
}))
