import type { PhoneApp, PlayerData, PhoneTime, Notification, Email, MessageThread } from './store'

export const MOCK_TIME: PhoneTime = { hour: 14, minute: 37 }

export const MOCK_APPS: Record<string, PhoneApp> = {
  phone:      { name: 'phone',      label: 'Phone',      icon: 'phone',      color: '#2ecc71', canUninstall: false, internal: ['call:number?', 'recent'] },
  messages:   { name: 'messages',   label: 'Messages',   icon: 'messages',   color: '#3498db', canUninstall: false, internal: ['new', 'convo:number?'] },
  contacts:   { name: 'contacts',   label: 'Contacts',   icon: 'contacts',   color: '#e67e22', canUninstall: false, internal: ['add:number?', 'view:id', 'caller:id'] },
  store:      { name: 'store',      label: 'App Store',  icon: 'store',      color: '#9b59b6', canUninstall: false },
  settings:   { name: 'settings',   label: 'Settings',   icon: 'settings',   color: '#7f8c8d', canUninstall: false, internal: ['software', 'profile', 'app_notifs', 'sounds', 'wallpaper', 'colors'] },
  email:      { name: 'email',      label: 'Email',      icon: 'email',      color: '#1abc9c', canUninstall: false, internal: ['view:id?'] },
  bank:       { name: 'bank',       label: 'Maze Bank',  icon: 'bank',       color: '#27ae60', canUninstall: true,  internal: ['view:account', 'bill'] },
  loans:      { name: 'loans',      label: 'Loans',      icon: 'loans',      color: '#16a085', canUninstall: true,  internal: ['view:loan'] },
  twitter:    { name: 'twitter',    label: 'Tweeter',    icon: 'twitter',    color: '#3498db', canUninstall: true,  internal: ['profile'] },
  chatter:    { name: 'chatter',    label: 'Yapper',     icon: 'chatter',    color: '#8e44ad', canUninstall: true,  internal: ['channel:channel', 'join:channel', 'config:channel', 'invites'] },
  adverts:    { name: 'adverts',    label: 'Ads',        icon: 'adverts',    color: '#e74c3c', canUninstall: true,  internal: ['view:id', 'category-view:category', 'add', 'edit'] },
  redline:    { name: 'redline',    label: 'Nitro',      icon: 'redline',    color: '#c0392b', canUninstall: true },
  blueline:   { name: 'blueline',   label: 'Pursuit',    icon: 'blueline',   color: '#2980b9', canUninstall: true },
  comanager:  { name: 'comanager',  label: 'Axis',       icon: 'comanager',  color: '#d35400', canUninstall: false, internal: ['view:jobId'] },
  labor:      { name: 'labor',      label: 'Jobs',       icon: 'labor',      color: '#2c3e50', canUninstall: true },
  crypto:     { name: 'crypto',     label: 'CoinVault',  icon: 'crypto',     color: '#f39c12', canUninstall: true },
  dyn8:       { name: 'dyn8',       label: 'Dynasty 8',  icon: 'dyn8',       color: '#27ae60', canUninstall: true },
  homemanage: { name: 'homemanage', label: 'Properties', icon: 'homemanage', color: '#8e44ad', canUninstall: true },
  garage:     { name: 'garage',     label: 'Garage',     icon: 'garage',     color: '#2ecc71', canUninstall: true,  internal: ['view:vin'] },
  pingem:     { name: 'pingem',     label: 'Ping',       icon: 'pingem',     color: '#e74c3c', canUninstall: true },
  calculator: { name: 'calculator', label: 'Calculator', icon: 'calculator', color: '#34495e', canUninstall: true },
  documents:  { name: 'documents',  label: 'Documents',  icon: 'documents',  color: '#9b59b6', canUninstall: true,  internal: ['view:id', 'new', 'edit:id'] },
  services:   { name: 'services',   label: 'Services',   icon: 'services',   color: '#FF5C3A', canUninstall: true },
  chopper:    { name: 'chopper',    label: 'Scrapyard',  icon: 'chopper',    color: '#c0392b', canUninstall: true },
  media:      { name: 'media',      label: 'Media',      icon: 'media',      color: '#e91e63', canUninstall: true },
  music:      { name: 'music',      label: 'Music',      icon: 'music',      color: '#1abc9c', canUninstall: true },
}

export const MOCK_PLAYER: PlayerData = {
  SID: 1,
  Name: 'John Smith',
  Phone: '555-123-4567',
  PhoneSettings: {
    zoom: 1,
    volume: 50,
    colors: { accent: '#FF5C3A' },
    wallpaper: 'default',
    ringtone: 'default',
    textTone: 'default',
    notifications: {},
    dnd: false,
  },
  PhoneCase: 'default',
  PhonePosition: { x: 0, y: 0 },
  Apps: {
    home: [
      ['phone', 'messages', 'contacts', 'email', 'bank', 'twitter', 'chatter', 'adverts', 'settings', 'store', 'calculator', 'documents'],
      ['crypto', 'garage', 'labor', 'comanager', 'dyn8', 'homemanage', 'loans', 'services', 'redline', 'blueline', 'pingem', 'chopper'],
      ['media', 'music'],
    ],
    dock: ['phone', 'messages', 'contacts', 'bank'],
    installed: Object.keys(MOCK_APPS),
  },
  States: {},
  Jobs: { police: { grade: 0 } },
  Cash: 12450,
}

export const MOCK_CONTACTS = [
  { id: 1, name: 'Jane Doe',      number: '555-987-6543', color: '#FF5C3A' },
  { id: 2, name: 'Mike Johnson',   number: '555-222-3344', color: '#268f3a' },
  { id: 3, name: 'Sarah Williams', number: '555-111-9988', color: '#1258a3' },
  { id: 4, name: 'Mechanic Shop',  number: '555-444-5566', color: '#c4b404' },
  { id: 5, name: 'Los Santos PD',  number: '555-911-0000', color: '#870b30' },
]

const now = Math.floor(Date.now() / 1000)

export const MOCK_EMAILS: Email[] = [
  {
    id: 1,
    owner: '1',
    sender: 'noreply@mazebank.com',
    subject: 'Account Statement Available',
    body: 'Your monthly account statement is now available. Log in to Maze Bank to view your transactions and balances.\n\nThank you for banking with Maze Bank.',
    time: now - 3600,
    unread: true,
  },
  {
    id: 2,
    owner: '1',
    sender: 'hr@dynasty8.com',
    subject: 'Property Listing Approved',
    body: 'Your property listing at 123 Vinewood Blvd has been approved and is now live on Dynasty 8.\n\nExpected viewings: 3-5 per week.',
    time: now - 86400,
    unread: false,
  },
  {
    id: 3,
    owner: '1',
    sender: 'dispatch@lspd.gov',
    subject: 'Community Meeting Notice',
    body: 'You are invited to attend the quarterly community meeting at City Hall.\n\nDate: This Saturday\nTime: 2:00 PM\nLocation: City Hall, Conference Room B',
    time: now - 172800,
    unread: false,
    flags: { location: { x: 235.0, y: -410.0 } },
  },
]

export const MOCK_MESSAGE_THREADS: MessageThread[] = [
  {
    id: 101,
    owner: '555-123-4567',
    number: '555-987-6543',
    method: 0,
    time: now - 300,
    message: 'Hey, are you coming to the meeting?',
    count: 8,
    unread: true,
  },
  {
    id: 102,
    owner: '555-123-4567',
    number: '555-222-3344',
    method: 1,
    time: now - 7200,
    message: 'I dropped off the parts at the shop',
    count: 3,
    unread: false,
  },
  {
    id: 103,
    owner: '555-123-4567',
    number: '555-444-5566',
    method: 0,
    time: now - 43200,
    message: 'Your vehicle is ready for pickup',
    count: 5,
    unread: false,
  },
]

export const MOCK_CALL_HISTORY = [
  { id: 1, owner: '555-123-4567', number: '555-987-6543', time: now - 1800, duration: 124, method: true },
  { id: 2, owner: '555-123-4567', number: '555-222-3344', time: now - 3600, duration: -1,  method: false },
  { id: 3, owner: '555-123-4567', number: '555-911-0000', time: now - 7200, duration: 45,  method: true },
  { id: 4, owner: '555-123-4567', number: '555-111-9988', time: now - 14400, duration: 0,  method: false },
  { id: 5, owner: '555-123-4567', number: '555-444-5566', time: now - 86400, duration: 312, method: true },
]

export const MOCK_INCOMING_CALL = {
  number: '555-987-6543',
  limited: false,
}

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'messages:1',
    title: 'Jane Doe',
    description: 'Hey, are you coming to the meeting?',
    time: Date.now() - 120000,
    app: 'messages',
    color: '#3498db',
    show: true,
  },
  {
    id: 'twitter:1',
    title: 'Tweeter',
    description: '@weazel_news: Breaking news in Los Santos!',
    time: Date.now() - 300000,
    app: 'twitter',
    color: '#3498db',
    show: true,
  },
  {
    id: 'bank:1',
    title: 'Maze Bank',
    description: 'You received a transfer of $2,500',
    time: Date.now() - 600000,
    app: 'bank',
    color: '#27ae60',
    show: true,
  },
]
