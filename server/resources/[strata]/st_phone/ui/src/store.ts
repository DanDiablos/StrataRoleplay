import { create } from 'zustand'

/* ── Types ─────────────────────────────────────────── */

export interface PhoneApp {
  name: string
  label: string
  storeLabel?: string
  icon: string
  color: string
  canUninstall: boolean
  internal?: string[]
  requirements?: Record<string, unknown>
  unread?: number
}

export interface Notification {
  id: string
  title: string
  description: string
  time: number
  duration?: number
  app: string
  icon?: string
  color?: string
  action?: { view: string } | { label: string; event: string }[]
  data?: Record<string, unknown>
  show: boolean
  persistent?: boolean
}

export interface Alert {
  id: number
  text: string
}

export interface CallState {
  status: 'idle' | 'pending' | 'incoming' | 'active'
  number: string
  limited: boolean
  startTime: number
}

export interface MessageThread {
  id: number
  owner: string
  number: string
  method: number
  time: number
  message: string
  count: number
  unread: boolean
}

export interface Message {
  id: number
  owner: string
  number: string
  method: number
  unread: boolean
  time: number
  message: string
}

export interface Email {
  id: number
  owner: string
  sender: string
  subject: string
  body: string
  time: number
  unread: boolean
  flags?: Record<string, unknown>
  expires?: number
}

export interface PhoneTime {
  hour: number
  minute: number
}

export interface PlayerData {
  SID?: number
  Name?: string
  First?: string
  Last?: string
  Phone?: string
  Apartment?: number
  ApartmentLabel?: string
  PhoneSettings?: {
    zoom?: number
    volume?: number
    colors?: { accent?: string }
    wallpaper?: string
    ringtone?: string
    textTone?: string
    notifications?: Record<string, boolean>
    dnd?: boolean
  }
  PhoneCase?: string
  PhonePosition?: { x: number; y: number }
  Apps?: {
    home: string[][]
    dock: string[]
    installed: string[]
  }
  States?: Record<string, unknown>
  Jobs?: Record<string, unknown>
  [key: string]: unknown
}

/* ── Store ─────────────────────────────────────────── */

interface PhoneState {
  /* visibility */
  hidden: boolean
  limited: boolean

  /* phone chrome */
  locked: boolean
  time: PhoneTime
  expanded: boolean

  /* apps registry */
  apps: Record<string, PhoneApp>

  /* data layer */
  player: PlayerData
  contacts: Record<string, unknown>[]
  permissions: Record<string, unknown>

  /* navigation */
  currentApp: string | null
  currentRoute: string | null
  navHistory: string[]
  homePage: number

  /* call state */
  call: CallState

  /* messages */
  messageThreads: MessageThread[]
  messages: Record<string, Message[]> // keyed by phone number

  /* emails */
  emails: Email[]

  /* notifications & alerts */
  notifications: Notification[]
  peekNotif: Notification | null
  alerts: Alert[]
  alertSeq: number

  /* dispatch — single entry point for all NUI messages */
  dispatch: (type: string, payload?: Record<string, unknown>) => void

  /* navigation helpers */
  openApp: (app: string, route?: string | null) => void
  goHome: () => void
  goBack: () => void
  setHomePage: (page: number) => void

  /* alert helper */
  pushAlert: (text: string) => void
}

let alertTimer: ReturnType<typeof setTimeout> | null = null
let peekTimer: ReturnType<typeof setTimeout> | null = null

export const useStore = create<PhoneState>((set, get) => ({
  hidden: true,
  limited: false,
  locked: true,
  time: { hour: 12, minute: 0 },
  expanded: false,
  apps: {},
  player: {},
  contacts: [],
  permissions: {},
  currentApp: null,
  currentRoute: null,
  navHistory: [],
  homePage: 0,
  call: { status: 'idle', number: '', limited: false, startTime: 0 },
  messageThreads: [],
  messages: {},
  emails: [],
  notifications: [],
  peekNotif: null,
  alerts: [],
  alertSeq: 0,

  dispatch: (type, payload = {}) => {
    switch (type) {
      /* ── Visibility ──────────────────────────── */
      case 'PHONE_VISIBLE':
        if (peekTimer) { clearTimeout(peekTimer); peekTimer = null }
        set({ hidden: false, limited: false, locked: true, peekNotif: null })
        break
      case 'PHONE_VISIBLE_LIMITED':
        set({ hidden: false, limited: true, locked: false })
        break
      case 'UNLOCK':
        set({ locked: false })
        break
      case 'PHONE_NOT_VISIBLE':
      case 'PHONE_NOT_VISIBLE_FORCED':
        if (peekTimer) { clearTimeout(peekTimer); peekTimer = null }
        {
          const persistentNotif = get().notifications.find((n) => n.persistent && n.show)
          set({
            hidden: true,
            locked: true,
            currentApp: null,
            currentRoute: null,
            navHistory: [],
            peekNotif: persistentNotif ?? null,
          })
        }
        /* After the slide-out animation (400ms), tell Lua the cooldown expired */
        setTimeout(() => {
          fetch('https://st_phone/CDExpired', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
          }).catch(() => {})
        }, 450)
        break

      /* ── Time ────────────────────────────────── */
      case 'SET_TIME': {
        const t = payload as unknown as PhoneTime
        if (t && typeof t.hour === 'number') set({ time: t })
        break
      }

      /* ── Apps registry ───────────────────────── */
      case 'SET_APPS': {
        const raw = payload as unknown as Record<string, PhoneApp>
        set({ apps: raw })
        break
      }

      /* ── Data CRUD ───────────────────────────── */
      case 'SET_DATA': {
        const { type: dtype, data } = payload as { type: string; data: unknown }
        if (dtype === 'player') {
          set({ player: data as PlayerData })
        } else if (dtype === 'contacts') {
          set({ contacts: data as Record<string, unknown>[] })
        } else if (dtype === 'emails') {
          set({ emails: data as Email[] })
        } else if (dtype === 'calls') {
          // call history stored in player data
          set((s) => ({ player: { ...s.player, calls: data } }))
        } else {
          set((s) => ({ player: { ...s.player, [dtype]: data } }))
        }
        break
      }
      case 'ADD_DATA': {
        const { type: atype, data: adata } = payload as { type: string; data: unknown; key?: string }
        if (atype === 'contacts') {
          set((s) => ({ contacts: [...s.contacts, adata as Record<string, unknown>] }))
        } else if (atype === 'emails') {
          set((s) => ({ emails: [adata as Email, ...s.emails] }))
        } else {
          set((s) => {
            const arr = Array.isArray(s.player[atype]) ? (s.player[atype] as Record<string, unknown>[]) : []
            return { player: { ...s.player, [atype]: [...arr, adata as Record<string, unknown>] } }
          })
        }
        break
      }
      case 'UPDATE_DATA': {
        const { type: utype, id, data: udata, key } = payload as {
          type: string
          id?: string
          data: unknown
          key?: string
        }
        if (utype === 'player' && id) {
          if (key) {
            set((s) => {
              const section = (s.player[id] ?? {}) as Record<string, unknown>
              return { player: { ...s.player, [id]: { ...section, [key]: udata } } }
            })
          } else {
            set((s) => ({ player: { ...s.player, [id]: udata } }))
          }
        } else if (utype === 'contacts' && id) {
          set((s) => ({
            contacts: s.contacts.map((c) =>
              String(c.id ?? c.Id) === String(id) ? { ...c, ...(udata as Record<string, unknown>) } : c
            ),
          }))
        } else if (id) {
          set((s) => {
            const arr = Array.isArray(s.player[utype]) ? (s.player[utype] as Record<string, unknown>[]) : []
            return {
              player: {
                ...s.player,
                [utype]: arr.map((item) =>
                  String(item.id ?? item.Id) === String(id) ? { ...item, ...(udata as Record<string, unknown>) } : item
                ),
              },
            }
          })
        }
        break
      }
      case 'REMOVE_DATA': {
        const { type: rtype, id: rid } = payload as { type: string; id: string }
        if (rtype === 'emails') {
          set((s) => ({ emails: s.emails.filter((e) => String(e.id) !== String(rid)) }))
        } else if (rtype === 'contacts') {
          set((s) => ({
            contacts: s.contacts.filter((c) => String(c.id ?? c.Id) !== String(rid)),
          }))
        } else {
          set((s) => {
            const arr = Array.isArray(s.player[rtype]) ? (s.player[rtype] as Record<string, unknown>[]) : []
            return {
              player: {
                ...s.player,
                [rtype]: arr.filter((item) => String(item.id ?? item.Id) !== String(rid)),
              },
            }
          })
        }
        break
      }
      /* ── Optimistic UI updates ──────────── */
      case 'MARK_EMAIL_READ': {
        const { id: eid } = payload as { id: number }
        set((s) => ({
          emails: s.emails.map((e) => (e.id === eid ? { ...e, unread: false } : e)),
        }))
        break
      }
      case 'MARK_THREAD_READ': {
        const { number: tnum } = payload as { number: string }
        set((s) => ({
          messageThreads: s.messageThreads.map((t) =>
            t.number === tnum ? { ...t, unread: false } : t
          ),
        }))
        break
      }
      case 'REMOVE_THREAD': {
        const { number: rnum } = payload as { number: string }
        set((s) => ({
          messageThreads: s.messageThreads.filter((t) => t.number !== rnum),
          messages: (() => { const m = { ...s.messages }; delete m[rnum]; return m })(),
        }))
        break
      }

      case 'RESET_DATA':
        set({ player: {}, contacts: [], permissions: {} })
        break

      /* ── UI state ────────────────────────────── */
      case 'SET_POSITION':
        break
      case 'SET_EXPANDED':
        set({ expanded: !!(payload as { expanded: boolean }).expanded })
        break
      case 'LOAD_PERMS':
        set({ permissions: payload as Record<string, unknown> })
        break
      case 'CLEAR_HISTORY':
        set({ navHistory: [], currentApp: null, currentRoute: null })
        break

      /* ── Calls ─────────────────────────────────── */
      case 'SET_CALL_PENDING': {
        const { number } = payload as { number: string }
        set({ call: { status: 'pending', number, limited: false, startTime: 0 } })
        break
      }
      case 'SET_CALL_INCOMING': {
        const { number, limited } = payload as { number: string; limited: boolean }
        set({ call: { status: 'incoming', number, limited: !!limited, startTime: 0 } })
        break
      }
      case 'SET_CALL_ACTIVE':
        set((s) => ({ call: { ...s.call, status: 'active', startTime: Date.now() } }))
        break
      case 'END_CALL':
        set((s) => ({
          call: { status: 'idle', number: '', limited: false, startTime: 0 },
          peekNotif: s.peekNotif?.app === 'phone' ? null : s.peekNotif,
        }))
        break

      /* ── Messages ───────────────────────────────── */
      case 'SET_MESSAGE_THREADS': {
        const threads = (payload as { threads?: MessageThread[] }).threads ?? (payload as unknown as MessageThread[])
        set({ messageThreads: Array.isArray(threads) ? threads : [] })
        break
      }
      case 'RECEIVED_NEW_MESSAGE': {
        const msg = payload as unknown as Message
        if (!msg?.number) break
        set((s) => ({
          messages: {
            ...s.messages,
            [msg.number]: [...(s.messages[msg.number] ?? []), msg],
          },
        }))
        break
      }
      case 'UPDATE_THREAD_IF_EXISTS': {
        const thread = payload as unknown as MessageThread
        if (!thread?.number) break
        set((s) => {
          const idx = s.messageThreads.findIndex((t) => t.number === thread.number)
          if (idx >= 0) {
            const copy = [...s.messageThreads]
            copy[idx] = { ...copy[idx], ...thread }
            return { messageThreads: copy }
          }
          return { messageThreads: [thread, ...s.messageThreads] }
        })
        break
      }
      case 'ADD_UNREAD':
        break

      /* ── Notifications ───────────────────────── */
      case 'NOTIF_ADD': {
        const n = (payload as { notification: Notification }).notification
        if (!n) break
        const id = n.id ?? (n.app + ':' + (n.data?.id ?? Date.now()))
        const isPersistent = n.persistent === true || Number(n.duration) === -1
        const notif: Notification = { ...n, id, show: n.show !== false, persistent: isPersistent }
        set((s) => {
          const exists = s.notifications.findIndex((x) => x.id === id)
          if (exists >= 0) {
            const copy = [...s.notifications]
            copy[exists] = notif
            return { notifications: copy }
          }
          return { notifications: [notif, ...s.notifications] }
        })
        /* Peek the phone if it's hidden */
        if (get().hidden) {
          if (peekTimer) clearTimeout(peekTimer)
          set({ peekNotif: notif })
          if (!isPersistent) {
            peekTimer = setTimeout(() => {
              set((s) => (s.peekNotif?.id === id ? { peekNotif: null } : {}))
            }, 4000)
          }
        }
        break
      }
      case 'NOTIF_UPDATE': {
        const { id: nid, title, description } = payload as {
          id: string
          title?: string
          description?: string
        }
        const updates = { ...(title ? { title } : {}), ...(description ? { description } : {}) }
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.id === nid ? { ...n, ...updates } : n
          ),
          peekNotif: s.peekNotif?.id === nid ? { ...s.peekNotif, ...updates } : s.peekNotif,
        }))
        break
      }
      case 'NOTIF_HIDE': {
        const { id: hid } = payload as { id: string }
        set((s) => ({
          notifications: s.notifications.map((n) => (n.id === hid ? { ...n, show: false } : n)),
          peekNotif: s.peekNotif?.id === hid ? null : s.peekNotif,
        }))
        break
      }
      case 'NOTIF_DISMISS_ALL':
        set({ notifications: [], peekNotif: null })
        break

      /* ── Alerts ──────────────────────────────── */
      case 'ALERTS_RESET':
        set({ alerts: [] })
        break

      /* ── Full reset ──────────────────────────── */
      case 'UI_RESET':
        set({
          hidden: true,
          limited: false,
          currentApp: null,
          currentRoute: null,
          navHistory: [],
          notifications: [],
          alerts: [],
          player: {},
          contacts: [],
          permissions: {},
          apps: {},
          call: { status: 'idle', number: '', limited: false, startTime: 0 },
          messageThreads: [],
          messages: {},
          emails: [],
        })
        break
    }
  },

  openApp: (app, route = null) => {
    const state = get()
    const entry = state.currentApp
      ? `${state.currentApp}:${state.currentRoute ?? ''}`
      : `home:${state.homePage}`
    set({
      currentApp: app,
      currentRoute: route,
      navHistory: [...state.navHistory, entry],
    })
  },

  goHome: () => {
    set({ currentApp: null, currentRoute: null, navHistory: [] })
  },

  goBack: () => {
    const state = get()
    const history = [...state.navHistory]
    const prev = history.pop()
    if (!prev || prev.startsWith('home')) {
      const page = prev ? Number(prev.split(':')[1]) || 0 : state.homePage
      set({ currentApp: null, currentRoute: null, navHistory: [], homePage: page })
      return
    }
    const [app, route] = prev.split(':')
    set({ currentApp: app, currentRoute: route || null, navHistory: history })
  },

  setHomePage: (page) => {
    set({ homePage: page })
  },

  pushAlert: (text) => {
    const seq = get().alertSeq + 1
    const alert: Alert = { id: seq, text }
    set((s) => ({ alerts: [...s.alerts, alert], alertSeq: seq }))
    if (alertTimer) clearTimeout(alertTimer)
    alertTimer = setTimeout(() => {
      set((s) => ({ alerts: s.alerts.filter((a) => a.id !== seq) }))
    }, 2500)
  },
}))
