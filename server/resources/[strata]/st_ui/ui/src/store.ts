import { create } from 'zustand'
import { sendNui } from './nui.ts'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface HudConfig {
  layout: string
  statusType: string
  buffsAnchor: string
  buffsAnchor2: string
  showRPM: boolean
  hideCrossStreet: boolean
  hideCompassBg: boolean
  largeBars: boolean
  minimapAnchor: boolean
  transparentBg: boolean
  vehicle: string
  maskRadio: boolean
  condenseAlignment: string
  circleNumbers: boolean
}

export interface MinimapPosition {
  leftX: number
  rightX: number
  topY: number
  bottomY: number
  width: number
  height: number
}

export interface Status {
  name: string
  max: number
  value: number
  icon: string
  color: string
  flash: boolean
  options?: { hideZero?: boolean; hideHigh?: boolean; force?: string }
}

export interface BuffDef {
  icon: string
  color: string
  duration: number
  type: string
}

export interface BuffInstance {
  buff: string
  override: string | null
  val: number
  applied?: number
  options?: { customMax?: number; interval?: number }
}

export interface Notification {
  _id: number | string
  type: string
  message: string
  icon: string
  duration: number
  created: number
  hide: boolean
  style?: { alert?: string; body?: string; progress?: string }
}

export interface Action2Item {
  id: string
  message: string
}

export interface ListMenuItem {
  label: string
  description?: string
  event?: string
  data?: Record<string, unknown>
  submenu?: string
  disabled?: boolean
  actions?: { event: string; icon: string; data?: Record<string, unknown> }[]
}

export interface ListMenu {
  label: string
  items: ListMenuItem[]
  headerAction?: { event: string; icon: string; data?: Record<string, unknown> }
}

export interface InputField {
  id: string
  type: string
  label?: string
  options?: Record<string, unknown>
  config?: { select?: { value: string; label: string }[] }
}

export interface InteractionItem {
  id: string | number
  label: string
  icon: string
  action?: string
  shouldShow?: boolean
  labelFunc?: string
  [key: string]: unknown
}

export interface EyeMenuItem {
  icon: string
  text: string
  event: string
  data?: Record<string, unknown>
}

export interface InfoOverlayData {
  label: string
  icon?: string
  sub?: string
  live?: boolean
  description: string | { keys: string[]; label: string }[]
}

export interface MethConfig {
  tableId: number
  ingredients: number
  cookTimeMax: number
}

/* ------------------------------------------------------------------ */
/*  Store                                                              */
/* ------------------------------------------------------------------ */

export interface StoreState {
  // App
  hidden: boolean
  blindfolded: boolean
  flashbanged: { duration: number; strength: number } | false
  isDead: boolean
  isDeathTexts: boolean
  isReleasing: boolean
  deathTime: number
  releaseTimer: number
  releaseType: string
  releaseKey: string
  helpKey: string
  medicalPrice: number
  sniper: boolean
  armed: boolean

  // HUD
  hudShowing: boolean
  voip: number
  voipIcon: string
  talking: number
  ammo: { visible: boolean; clip: number; reserve: number; weapon: number }
  settingsOpen: boolean
  config: HudConfig
  position: MinimapPosition

  // Status
  health: number
  maxHealth: number
  armor: number
  statuses: Status[]
  buffDefs: Record<string, BuffDef>
  buffs: BuffInstance[]

  // Vehicle
  vehicleShowing: boolean
  ignition: boolean
  nos: number
  speed: number
  rpm: number
  speedMeasure: string
  seatbelt: boolean
  seatbeltHide: boolean
  cruise: boolean
  checkEngine: boolean
  engineHealth: number
  fuel: number
  fuelHide: boolean

  // Location
  locationShowing: boolean
  location: { main: string; cross: string; area: string; direction: string; heading?: number }
  heading: number
  shifted: boolean

  // Notifications
  notifRunningId: number
  notifications: Notification[]

  // Progress
  progressShowing: boolean
  progressLabel: string
  progressDuration: number
  progressCancelled: boolean
  progressFailed: boolean
  progressFinished: boolean
  progressStartTime: number

  // Action (legacy)
  actionShowing: boolean
  actionMessage: string
  actionHiding: boolean

  // Action2
  actions: Action2Item[]

  // List menu
  listShowing: boolean
  listActive: string
  listStack: string[]
  listMenus: Record<string, ListMenu>

  // Input
  inputShowing: boolean
  inputEvent: string
  inputTitle: string
  inputLabel: string
  inputData: unknown
  inputOptions: InputField[]

  // Confirm
  confirmShowing: boolean
  confirmYes: string
  confirmNo: string
  confirmData: unknown
  confirmTitle: string
  confirmDescription: string
  confirmDenyLabel: string
  confirmAcceptLabel: string

  // Interaction
  interactionShow: boolean
  interactionItems: InteractionItem[]
  interactionLayer: number

  // Third eye
  eyeShowing: boolean
  eyeIcon: string
  eyeMenuOpen: boolean
  eyeMenu: EyeMenuItem[]

  // Info overlay
  infoOverlayShowing: boolean
  infoOverlayInfo: InfoOverlayData | null

  // Overlay
  overlayShowing: boolean
  overlayData: Record<string, unknown>[]

  // Gem table
  gemTableShowing: boolean
  gemTableInfo: number

  // Meth
  methShowing: boolean
  methConfig: MethConfig

  // Arcade
  arcadeShowing: boolean
  arcadeMatchInfo: { matchEnd: number; matchLabel: string }
  arcadeTeam1: { current: number; max: number }
  arcadeTeam2: { current: number; max: number }

  // Dispatch
  dispatch: (type: string, payload?: Record<string, unknown>) => void
}

const DEFAULT_CONFIG: HudConfig = {
  layout: 'default',
  statusType: 'bars',
  buffsAnchor: 'default',
  buffsAnchor2: 'default',
  showRPM: true,
  hideCrossStreet: false,
  hideCompassBg: false,
  largeBars: false,
  minimapAnchor: false,
  transparentBg: false,
  vehicle: 'wurk',
  maskRadio: false,
  condenseAlignment: 'compass',
  circleNumbers: false,
}

const DEFAULT_POSITION: MinimapPosition = {
  leftX: 0, rightX: 0, topY: 0, bottomY: 0, width: 0, height: 0,
}

const IS_DEV = import.meta.env.DEV

export const useStore = create<StoreState>((set, get) => ({
  // App
  hidden: !IS_DEV,
  blindfolded: false,
  flashbanged: false,
  isDead: false,
  isDeathTexts: false,
  isReleasing: false,
  deathTime: 0,
  releaseTimer: 0,
  releaseType: '',
  releaseKey: '',
  helpKey: '',
  medicalPrice: 1500,
  sniper: false,
  armed: false,

  // HUD
  hudShowing: IS_DEV,
  voip: IS_DEV ? 2 : 0,
  voipIcon: '',
  talking: 0,
  ammo: IS_DEV
    ? { visible: true, clip: 24, reserve: 120, weapon: 1 }
    : { visible: false, clip: 0, reserve: 0, weapon: 0 },
  settingsOpen: false,
  config: { ...DEFAULT_CONFIG },
  position: { ...DEFAULT_POSITION },

  // Status
  health: IS_DEV ? 350 : 200,
  maxHealth: IS_DEV ? 400 : 200,
  armor: IS_DEV ? 65 : 0,
  statuses: IS_DEV
    ? [
        { name: 'hunger', max: 100, value: 72, icon: '', color: '#FB8607', flash: true, options: {} },
        { name: 'thirst', max: 100, value: 45, icon: '', color: '#2B78FC', flash: true, options: {} },
        { name: 'stress', max: 100, value: 15, icon: '', color: '#FE2436', flash: false, options: { hideZero: true } },
      ]
    : [],
  buffDefs: IS_DEV
    ? {
        prog_mod:     { icon: 'mug-hot',           color: '#D6451A', duration: 15000, type: 'timed' },
        heal_ticks:   { icon: 'suitcase-medical',  color: '#52984a', duration: 20000, type: 'timed' },
        armor_ticks:  { icon: 'dumbbell',          color: '#4056b3', duration: 20000, type: 'timed' },
        weakness:     { icon: 'bandage',           color: '#FF0049', duration: -1,    type: 'permanent' },
        speed:        { icon: 'bolt-lightning',    color: '#8419C2', duration: 12000, type: 'timed' },
      }
    : {},
  buffs: IS_DEV
    ? [
        { buff: 'prog_mod',    override: null, val: 0, applied: Date.now(), options: {} },
        { buff: 'heal_ticks',  override: null, val: 0, applied: Date.now(), options: { customMax: 50 } },
        { buff: 'armor_ticks', override: null, val: 0, applied: Date.now(), options: { customMax: 30 } },
        { buff: 'weakness',    override: null, val: 0, applied: Date.now(), options: {} },
        { buff: 'speed',       override: null, val: 0, applied: Date.now(), options: {} },
      ]
    : [],

  // Vehicle
  vehicleShowing: IS_DEV,
  ignition: IS_DEV,
  nos: IS_DEV ? 40 : 0,
  speed: IS_DEV ? 87 : 0,
  rpm: IS_DEV ? 0.62 : 0,
  speedMeasure: 'MPH',
  seatbelt: IS_DEV,
  seatbeltHide: false,
  cruise: false,
  checkEngine: false,
  engineHealth: IS_DEV ? 85 : 100,
  fuel: IS_DEV ? 73 : 100,
  fuelHide: false,

  // Location
  locationShowing: IS_DEV,
  location: IS_DEV
    ? { main: 'Vinewood Blvd', cross: 'Alta St', area: 'Vinewood', direction: 'NW', heading: 315 }
    : { main: '', cross: '', area: '', direction: 'N', heading: 0 },
  heading: 0,
  shifted: false,

  // Notifications
  notifRunningId: 0,
  notifications: IS_DEV
    ? [
        { _id: 1, type: 'success', message: 'Vehicle stored in garage.', icon: '', duration: 30000, created: Date.now(), hide: false },
        { _id: 2, type: 'error', message: 'You cannot do that right now.', icon: '', duration: 30000, created: Date.now() - 2000, hide: false },
      ]
    : [],

  // Progress
  progressShowing: false,
  progressLabel: '',
  progressDuration: 0,
  progressCancelled: false,
  progressFailed: false,
  progressFinished: false,
  progressStartTime: 0,

  // Action (legacy)
  actionShowing: false,
  actionMessage: '',
  actionHiding: false,

  // Action2
  actions: IS_DEV
    ? [{ id: 'interact', message: '{key}E{/key} Search Trunk' }]
    : [],

  // List menu
  listShowing: false,
  listActive: '',
  listStack: [],
  listMenus: {},

  // Input
  inputShowing: false,
  inputEvent: '',
  inputTitle: '',
  inputLabel: '',
  inputData: null,
  inputOptions: [],

  // Confirm
  confirmShowing: false,
  confirmYes: '',
  confirmNo: '',
  confirmData: null,
  confirmTitle: '',
  confirmDescription: '',
  confirmDenyLabel: 'No',
  confirmAcceptLabel: 'Yes',

  // Interaction
  interactionShow: false,
  interactionItems: [],
  interactionLayer: 0,

  // Third eye
  eyeShowing: false,
  eyeIcon: '',
  eyeMenuOpen: false,
  eyeMenu: [],

  // Info overlay
  infoOverlayShowing: false,
  infoOverlayInfo: null,

  // Overlay
  overlayShowing: false,
  overlayData: [],

  // Gem table
  gemTableShowing: false,
  gemTableInfo: 0,

  // Meth
  methShowing: false,
  methConfig: { tableId: 0, ingredients: 0, cookTimeMax: 10 },

  // Arcade
  arcadeShowing: false,
  arcadeMatchInfo: { matchEnd: 0, matchLabel: '' },
  arcadeTeam1: { current: 0, max: 25 },
  arcadeTeam2: { current: 0, max: 25 },

  /* ---------------------------------------------------------------- */
  /*  dispatch — handles all NUI messages from Lua                     */
  /* ---------------------------------------------------------------- */
  dispatch: (type, payload = {}) => {
    const p = payload as Record<string, unknown>

    switch (type) {
      /* ---- App ---- */
      case 'APP_SHOW':
        set({ hidden: false })
        break
      case 'APP_HIDE':
        set({ hidden: true })
        break
      case 'RESET_UI':
        set({
          confirmShowing: false,
          inputShowing: false,
          methShowing: false,
          overlayShowing: false,
          sniper: false,
          armed: false,
          settingsOpen: false,
        })
        break
      case 'CLOSE_UI':
        set({
          confirmShowing: false,
          inputShowing: false,
          methShowing: false,
          overlayShowing: false,
        })
        break

      /* ---- Death ---- */
      case 'SET_DEAD':
        set({ isDead: p.state as boolean })
        break
      case 'DO_DEATH_TEXT': {
        // Lua sends Unix seconds (GetCloudTimeAsInt); convert to ms for Date.now() comparisons
        const dt = (p.deathTime as number) * 1000
        const rt = (p.timer as number) * 1000
        set({
          isDeathTexts: true,
          isReleasing: false,
          deathTime: dt,
          releaseTimer: rt,
          releaseType: p.type as string,
          releaseKey: p.key as string,
          helpKey: p.f1Key as string,
          medicalPrice: (p.medicalPrice as number) ?? 1500,
        })
      }
        break
      case 'DO_DEATH_RELEASING':
        set({ isReleasing: true })
        break
      case 'HIDE_DEATH_TEXT':
        set({ isDeathTexts: false, isReleasing: false })
        break

      /* ---- Blindfold / Flashbang / Scope ---- */
      case 'SET_BLINDFOLD':
        set({ blindfolded: p.state as boolean })
        break
      case 'SET_FLASHBANGED':
        set({ flashbanged: { duration: (p.duration as number) ?? 3000, strength: (p.strength as number) ?? 0.8 } })
        break
      case 'CLEAR_FLASHBANGED':
        set({ flashbanged: false })
        break
      case 'SHOW_SCOPE':
        set({ sniper: true })
        break
      case 'HIDE_SCOPE':
        set({ sniper: false })
        break
      case 'ARMED':
        set({ armed: p.state as boolean })
        break

      /* ---- HUD ---- */
      case 'SHOW_HUD': {
        const u: Partial<StoreState> = { hudShowing: true, hidden: false }
        if (p.hp !== undefined) u.health = p.hp as number
        if (p.maxHp !== undefined) u.maxHealth = p.maxHp as number
        if (p.armor !== undefined) u.armor = p.armor as number
        if (p.fuel !== undefined) u.fuel = p.fuel as number
        if (p.fuelHide !== undefined) u.fuelHide = p.fuelHide as boolean
        set(u)
        break
      }
      case 'HIDE_HUD':
        set({ hudShowing: false })
        break
      case 'TOGGLE_HUD':
        set(s => ({ hudShowing: !s.hudShowing }))
        break
      case 'SET_CONFIG':
        set({ config: { ...DEFAULT_CONFIG, ...(p.config as Partial<HudConfig>) } })
        break
      case 'UPDATE_MM_POS':
        set({ position: p.position as MinimapPosition })
        break

      /* ---- Status ---- */
      case 'UPDATE_HP':
        set({
          health: p.hp as number,
          maxHealth: p.maxHp as number,
          armor: p.armor as number,
        })
        break
      case 'REGISTER_STATUS': {
        const status = p.status as Status
        set(s => {
          const exists = s.statuses.find(st => st.name === status.name)
          if (exists) return { statuses: s.statuses.map(st => st.name === status.name ? { ...st, ...status } : st) }
          return { statuses: [...s.statuses, status] }
        })
        break
      }
      case 'UPDATE_STATUS': {
        const status = p.status as Status
        set(s => ({
          statuses: s.statuses.map(st => st.name === status.name ? { ...st, ...status } : st),
        }))
        break
      }
      case 'UPDATE_STATUS_VALUE':
        set(s => ({
          statuses: s.statuses.map(st => st.name === p.name ? { ...st, value: p.value as number } : st),
        }))
        break
      case 'UPDATE_STATUSES':
        set({ statuses: p.statuses as Status[] })
        break
      case 'RESET_STATUSES':
        set({ statuses: [] })
        break

      /* ---- Buffs ---- */
      case 'REGISTER_BUFF':
        set(s => ({
          buffDefs: { ...s.buffDefs, [p.id as string]: p.data as BuffDef },
        }))
        break
      case 'BUFF_APPLIED':
        set(s => ({
          buffs: [...s.buffs, { ...(p.instance as BuffInstance), applied: Date.now() }],
        }))
        break
      case 'BUFF_APPLIED_UNIQUE': {
        const inst = p.instance as BuffInstance
        set(s => {
          const idx = s.buffs.findIndex(b => b.buff === inst.buff)
          if (idx >= 0) {
            const next = [...s.buffs]
            next[idx] = { ...inst, applied: Date.now() }
            return { buffs: next }
          }
          return { buffs: [...s.buffs, { ...inst, applied: Date.now() }] }
        })
        break
      }
      case 'BUFF_UPDATED':
        set(s => ({
          buffs: s.buffs.map(b => b.buff === (p.id as string) ? { ...b, val: p.val as number } : b),
        }))
        break
      case 'REMOVE_BUFF_BY_TYPE':
        set(s => ({ buffs: s.buffs.filter(b => b.buff !== (p.type as string)) }))
        break
      case 'UI_RESET':
        set({ buffs: [], statuses: [] })
        break

      /* ---- VOIP / Ammo ---- */
      case 'SET_VOIP_LEVEL': {
        const u: Partial<StoreState> = {}
        if (p.level !== undefined) u.voip = p.level as number
        if (p.icon !== undefined) u.voipIcon = p.icon as string
        if (p.talking !== undefined) {
          const t = p.talking
          u.talking = t === true || t === '1' ? 1 : t === '2' ? 2 : t === false ? 0 : Number(t) || 0
        }
        set(u)
        break
      }
      case 'UPDATE_AMMO':
        set({
          ammo: {
            visible: p.visible as boolean,
            clip: p.clip as number,
            reserve: p.reserve as number,
            weapon: p.weapon as number,
          },
        })
        break

      /* ---- Vehicle ---- */
      case 'SHOW_VEHICLE':
        set({ vehicleShowing: true })
        break
      case 'HIDE_VEHICLE':
        set({ vehicleShowing: false })
        break
      case 'TOGGLE_VEHICLE':
        set(s => ({ vehicleShowing: !s.vehicleShowing }))
        break
      case 'UPDATE_IGNITION':
        set({ ignition: p.ignition as boolean })
        break
      case 'UPDATE_RPM':
        set({ rpm: p.rpm as number })
        break
      case 'UPDATE_SPEED':
        set({ speed: p.speed as number })
        break
      case 'UPDATE_SPEED_MEASURE':
        set({ speedMeasure: p.measurement as string })
        break
      case 'UPDATE_SEATBELT':
        set({ seatbelt: p.seatbelt as boolean })
        break
      case 'SHOW_SEATBELT':
        set({ seatbeltHide: false })
        break
      case 'HIDE_SEATBELT':
        set({ seatbeltHide: true })
        break
      case 'UPDATE_CRUISE':
        set({ cruise: p.cruise as boolean })
        break
      case 'UPDATE_ENGINELIGHT':
        set({
          checkEngine: p.checkEngine as boolean,
          ...(p.engineHealth !== undefined ? { engineHealth: p.engineHealth as number } : {}),
        })
        break
      case 'UPDATE_FUEL': {
        const u: Partial<StoreState> = {}
        if (p.fuel !== undefined) u.fuel = p.fuel as number
        if (p.fuelHide !== undefined) u.fuelHide = p.fuelHide as boolean
        set(u)
        break
      }
      case 'SHOW_FUEL':
        set({ fuelHide: false })
        break
      case 'HIDE_FUEL':
        set({ fuelHide: true })
        break
      case 'UPDATE_NOS':
        set({ nos: p.nos as number })
        break

      /* ---- Location ---- */
      case 'TOGGLE_LOC':
        set({ locationShowing: p.state as boolean })
        break
      case 'UPDATE_LOCATION': {
        const loc = p.location as StoreState['location']
        set({ locationShowing: true, location: loc, ...(typeof loc.heading === 'number' ? { heading: loc.heading } : {}) })
        break
      }
      case 'UPDATE_HEADING':
        set({ heading: p.heading as number })
        break
      case 'SHIFT_LOCATION':
        set(s => ({
          shifted: p.shift as boolean,
          ...(p.position ? { position: p.position as MinimapPosition } : {}),
        }))
        break

      /* ---- Notifications ---- */
      case 'ADD_ALERT': {
        const n = p.notification as Partial<Notification>
        set(s => {
          if (n._id) {
            const exists = s.notifications.find(x => x._id === n._id)
            if (exists) {
              return {
                notifications: s.notifications.map(x =>
                  x._id === n._id ? { ...x, ...n, hide: false } : x
                ),
              }
            }
          }
          const id = n._id ?? s.notifRunningId + 1
          return {
            notifRunningId: typeof id === 'number' ? id : s.notifRunningId + 1,
            notifications: [
              ...s.notifications,
              {
                _id: id,
                type: n.type ?? 'info',
                message: n.message ?? '',
                icon: n.icon ?? '',
                duration: n.duration ?? 5000,
                created: Date.now(),
                hide: false,
                style: n.style,
              },
            ],
          }
        })
        break
      }
      case 'REMOVE_ALERT':
        set(s => ({
          notifications: s.notifications.filter(n => n._id !== p.id),
        }))
        break
      case 'HIDE_ALERT':
        set(s => ({
          notifications: s.notifications.map(n =>
            n._id === p.id ? { ...n, hide: true } : n
          ),
        }))
        break
      case 'CLEAR_ALERTS':
        set({ notifications: [] })
        break

      /* ---- Progress ---- */
      case 'START_PROGRESS':
        set({
          progressShowing: true,
          progressLabel: p.label as string,
          progressDuration: p.duration as number,
          progressCancelled: false,
          progressFailed: false,
          progressFinished: false,
          progressStartTime: Date.now(),
        })
        break
      case 'CANCEL_PROGRESS':
        set({ progressCancelled: true })
        break
      case 'FAILED_PROGRESS':
        set({ progressFailed: true })
        break
      case 'FINISH_PROGRESS':
        set({ progressFinished: true })
        sendNui('Progress:Finish')
        break
      case 'HIDE_PROGRESS':
        set({ progressShowing: false })
        break

      /* ---- Action (legacy) ---- */
      case 'SHOW_ACTION':
        set({ actionShowing: true, actionHiding: false, actionMessage: p.message as string })
        break
      case 'HIDE_ACTION':
        set({ actionHiding: true })
        break
      case 'CLEAR_ACTION':
        set({ actionShowing: false, actionHiding: false, actionMessage: '' })
        break

      /* ---- Action2 ---- */
      case 'ADD_ACTION':
        set(s => ({
          actionHiding: false,
          actions: [...s.actions.filter(a => a.id !== (p.id as string)), { id: p.id as string, message: p.message as string }],
        }))
        break
      case 'REMOVE_ACTION': {
        const remaining = get().actions.filter(a => a.id !== (p.id as string))
        if (remaining.length === 0 && !get().actionShowing) {
          // Last item removed — keep data, start fade-out
          set({ actionHiding: true })
        } else {
          set({ actions: remaining })
        }
        break
      }
      case 'REMOVE_ALL_ACTIONS':
        set({ actionHiding: true })
        break
      case 'CLEAR_ALL_ACTIONS':
        set({ actions: [], actionHiding: false })
        break

      /* ---- List menu ---- */
      case 'SET_LIST_MENU': {
        const menus = p.menus as Record<string, ListMenu>
        const keys = Object.keys(menus)
        set({
          listShowing: true,
          listMenus: menus,
          listActive: 'main' in menus ? 'main' : keys[0] ?? '',
          listStack: [],
        })
        break
      }
      case 'CHANGE_MENU':
        set(s => ({
          listStack: [...s.listStack, s.listActive],
          listActive: p.menu as string,
        }))
        break
      case 'LIST_GO_BACK':
        set(s => {
          const stack = [...s.listStack]
          const prev = stack.pop() ?? s.listActive
          return { listStack: stack, listActive: prev }
        })
        break
      case 'CLOSE_LIST_MENU':
        set({ listShowing: false })
        break

      /* ---- Input ---- */
      case 'SHOW_INPUT':
        set({
          inputShowing: true,
          inputEvent: p.event as string,
          inputTitle: p.title as string,
          inputLabel: p.label as string,
          inputData: p.data,
          inputOptions: (p.options ?? p.inputs) as InputField[],
        })
        break
      case 'CLOSE_INPUT':
        set({ inputShowing: false })
        break

      /* ---- Confirm ---- */
      case 'SHOW_CONFIRM':
        set({
          confirmShowing: true,
          confirmYes: p.yes as string,
          confirmNo: p.no as string,
          confirmData: p.data,
          confirmTitle: p.title as string,
          confirmDescription: p.description as string,
          confirmDenyLabel: (p.denyLabel as string) ?? 'No',
          confirmAcceptLabel: (p.acceptLabel as string) ?? 'Yes',
        })
        break
      case 'CLOSE_CONFIRM':
        set({ confirmShowing: false })
        break

      /* ---- Interaction ---- */
      case 'SHOW_INTERACTION_MENU':
        set(s => ({ interactionShow: p.toggle !== undefined ? (p.toggle as boolean) : !s.interactionShow }))
        break
      case 'SET_INTERACTION_LAYER':
        set({ interactionLayer: p.layer as number })
        break
      case 'SET_INTERACTION_MENU_ITEMS':
        set({ interactionItems: p.items as InteractionItem[] })
        break

      /* ---- Third eye ---- */
      case 'SHOW_EYE':
        set({
          eyeShowing: true,
          eyeIcon: (p.icon as string) ?? '',
          eyeMenu: (p.menu as EyeMenuItem[]) ?? [],
        })
        break
      case 'HIDE_EYE':
        set({ eyeShowing: false, eyeMenuOpen: false })
        break
      case 'OPEN_MENU':
        set({
          eyeMenuOpen: true,
          eyeIcon: (p.icon as string) ?? get().eyeIcon,
          eyeMenu: (p.menu as EyeMenuItem[]) ?? get().eyeMenu,
        })
        break
      case 'CLOSE_MENU':
        set({ eyeMenuOpen: false })
        break

      /* ---- Info overlay ---- */
      case 'SHOW_INFO_OVERLAY':
        set({ infoOverlayShowing: true, infoOverlayInfo: p.info as InfoOverlayData })
        break
      case 'CLOSE_INFO_OVERLAY':
        set({ infoOverlayShowing: false })
        break

      /* ---- Overlay ---- */
      case 'SHOW_OVERLAY':
        set({ overlayShowing: true, overlayData: (p.data ?? [p]) as Record<string, unknown>[] })
        break
      case 'HIDE_OVERLAY':
        set({ overlayShowing: false })
        break

      /* ---- Gem table ---- */
      case 'SHOW_GEM_TABLE':
        set({ gemTableShowing: true, gemTableInfo: p.info as number })
        break
      case 'CLOSE_GEM_TABLE':
        set({ gemTableShowing: false })
        break

      /* ---- Meth ---- */
      case 'OPEN_METH':
        set({ methShowing: true, methConfig: p.config as MethConfig })
        break
      case 'CLOSE_METH':
        set({ methShowing: false })
        break

      /* ---- Arcade ---- */
      case 'ARCADE_START_MATCH':
        set({
          arcadeShowing: true,
          arcadeMatchInfo: { matchEnd: p.end as number, matchLabel: p.gamemode as string },
          arcadeTeam1: { current: 0, max: p.objectiveMax as number },
          arcadeTeam2: { current: 0, max: p.objectiveMax as number },
        })
        break
      case 'TEAM_1_ADD_OBJ':
        set(s => ({ arcadeTeam1: { ...s.arcadeTeam1, current: s.arcadeTeam1.current + ((p.amt as number) ?? 1) } }))
        break
      case 'TEAM_2_ADD_OBJ':
        set(s => ({ arcadeTeam2: { ...s.arcadeTeam2, current: s.arcadeTeam2.current + ((p.amt as number) ?? 1) } }))
        break

      /* ---- Settings ---- */
      case 'TOGGLE_SETTINGS':
        set({ settingsOpen: p.state as boolean })
        break
    }
  },
}))
