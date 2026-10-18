export interface LaptopApp {
  name: string
  label: string
  storeLabel?: string
  icon: string
  color: string
  hidden?: boolean
  canUninstall?: boolean
  unread: number
  fake?: boolean
}

export interface AxisPage {
  id: string
  icon?: [string, string]
  label?: string
  hidden?: boolean
  permission?: string
}

export interface NotificationAction {
  event?: string
  data?: Record<string, unknown>
  label?: string
  server?: boolean
  accept?: string
  cancel?: string
  view?: string
}

export interface LaptopNotification {
  _id?: string
  title: string
  description: string
  time: number
  duration?: number
  app: string | Record<string, unknown>
  action?: NotificationAction
  data?: Record<string, unknown>
  show: boolean
}

export interface TeamMember {
  Leader: boolean
  Source: number
  SID: number
  First: string
  Last: string
}

export interface Team {
  ID: number
  State: number
  StateName: string
  Name: string
  Members: TeamMember[]
}

export interface TeamRequest {
  id: number
  time: number
  expires: number
  owner: number | string
  team: boolean
  event: string
  label: string
  description: string
  data: Record<string, unknown>
}

export interface Document {
  id: string
  title: string
  content: string
  author: string
  created_at: string
  updated_at?: string
}

export interface Receipt {
  id: string
  title: string
  amount: number
  description?: string
  author: string
  type?: string
  created_at: string
}

export interface Notice {
  id: string
  title: string
  content: string
  author: string
  created_at: string
}

export interface FleetVehicle {
  id: string | number
  plate: string
  model: string
  label?: string
  online?: boolean
  location?: { x: number; y: number; z: number }
  driver?: string
}

export interface MarketItem {
  id: number
  item: string
  coin: string
  price: number
  vpn: boolean
  qty: number
  rep?: string
  repLvl?: number
  delayed?: boolean
  itemData?: { label: string; description?: string }
}

export interface ChopVehicle {
  plate?: string
  model?: string
  label?: string
  reward?: number
  class?: string
}

export interface BoostingContract {
  id: string
  vehicle?: string
  label?: string
  class?: string
  reward?: number
  location?: { x: number; y: number; z: number }
  disabled?: boolean
}

export interface LSUDetails {
  chopList: Record<string, { id?: number; list: ChopVehicle[] }> | null
  reputations: Record<string, { level: number; label: string; xp?: number; maxXp?: number }>
  items: MarketItem[]
  banned: Record<string, unknown> | null
  canBoost: boolean
}

export interface LaptopSettings {
  volume: number
  notifications: boolean
  appNotifications: Record<string, boolean>
  wallpaper?: string
  zoom?: number
}
