import type { LaptopApp, AxisPage, LaptopNotification, Team, LSUDetails, Document, Receipt, Notice, FleetVehicle } from './types'

export const MOCK_APPS: LaptopApp[] = [
  { name: 'lsunderground', label: 'Shade',   storeLabel: 'Shade',   icon: 'user-secret',  color: '#E95200', unread: 2, canUninstall: true  },
  { name: 'teams',         label: 'Crew',    storeLabel: 'Crew',    icon: 'people-group', color: '#00FF8A', unread: 0, canUninstall: true  },
  { name: 'bizwiz',        label: 'Axis',    storeLabel: 'Axis',    icon: 'business-time',color: '#135dd8', unread: 1, canUninstall: true  },
  { name: 'cameras',       label: 'Watchtower', storeLabel: 'Watchtower', icon: 'video',     color: '#FF5C3A', unread: 0, canUninstall: true  },
  { name: 'settings',      label: 'System',  storeLabel: 'System',  icon: 'gear',         color: '#18191e', unread: 0, canUninstall: false },
  { name: 'internet',      label: 'Browse',  storeLabel: 'Browse',  icon: 'globe',        color: '#1db5e7', unread: 0, canUninstall: false, fake: true },
  { name: 'files',         label: 'Vault',   storeLabel: 'Vault',   icon: 'folder-open',  color: '#D8A71E', unread: 0, canUninstall: false, fake: true },
]

export const MOCK_AXIS_PAGES: AxisPage[] = [
  { id: 'Dashboard',         label: 'Dashboard' },
  { id: 'Search/Document',   label: 'Documents',       permission: 'TABLET_VIEW_DOCUMENT' },
  { id: 'View/Document',     hidden: true },
  { id: 'Create/Document',   hidden: true },
  { id: 'View/Receipt',      hidden: true },
  { id: 'Create/Receipt',    hidden: true },
  { id: 'Create/Notice',     hidden: true },
  { id: 'Search/Receipt',    label: 'Receipts' },
  { id: 'Search/ReceiptCount', label: 'Receipt Count', permission: 'TABLET_MANAGE_RECEIPT' },
  { id: 'Tweet',             label: 'Business Tweeter',permission: 'TABLET_TWEET' },
  { id: 'TweetSettings',     label: 'Tweeter Profile', permission: 'JOB_MANAGEMENT' },
  { id: 'FleetManagement',   label: 'Fleet Management',permission: 'FLEET_MANAGEMENT' },
]

export const MOCK_PLAYER = {
  First: 'John',
  Last: 'Doe',
  SID: 12345,
  job: 'hayes',
  grade: 'Manager',
  States: ['ACCESS_LSUNDERGROUND'],
  LaptopSettings: { volume: 80, notifications: true, appNotifications: {}, wallpaper: 'default', zoom: 100 },
}

export const MOCK_JOB_DATA = {
  label: "Hayes Auto",
  grade: "Manager",
  type: "mechanic",
}

export const MOCK_NOTICES: Notice[] = [
  { id: '1', title: 'Staff Meeting',   content: 'All staff required at 5PM tonight. No exceptions.',        author: 'Manager',  created_at: '2026-04-07' },
  { id: '2', title: 'Policy Update',   content: 'Please review the updated customer service policy on file.', author: 'HR Dept', created_at: '2026-04-06' },
  { id: '3', title: 'New Vehicle In',  content: '2024 Turismo R arrived — needs prep before display.',       author: 'Manager',  created_at: '2026-04-05' },
]

export const MOCK_TEAM: Team = {
  ID: 1,
  State: 0,
  StateName: 'Available',
  Name: 'ShadowCrew',
  Members: [
    { Leader: true,  Source: 1, SID: 12345, First: 'John', Last: 'Doe'   },
    { Leader: false, Source: 2, SID: 67890, First: 'Jane', Last: 'Smith' },
    { Leader: false, Source: 3, SID: 11111, First: 'Mike', Last: 'Chen'  },
  ],
}

export const MOCK_NOTIFICATIONS: LaptopNotification[] = [
  {
    _id: 'n1',
    title: 'New Team Invite',
    description: 'You have been invited to join ShadowCrew',
    time: Date.now(),
    duration: 15000,
    app: 'teams',
    action: { accept: 'Tablet:Client:Teams:RequestNotifAccept', cancel: 'Tablet:Client:Teams:RequestNotifDeny' },
    data: { request: 1 },
    show: true,
  },
  {
    _id: 'n2',
    title: 'Your Order',
    description: '3 items waiting at today\'s pickup location.',
    time: Date.now(),
    duration: 25000,
    app: 'lsunderground',
    show: true,
  },
  {
    _id: 'n3',
    title: 'Team Deleted',
    description: 'The team you were in has been dissolved.',
    time: Date.now(),
    duration: 10000,
    app: 'teams',
    show: true,
  },
]

export const MOCK_LSU_DATA: LSUDetails = {
  chopList: {
    Public: {
      list: [
        { model: 'adder',    label: 'Adder',    reward: 15000, class: 'S+' },
        { model: 'zentorno', label: 'Zentorno', reward: 12000, class: 'S+' },
        { model: 't20',      label: 'T20',      reward: 18000, class: 'S+' },
        { model: 'kuruma',   label: 'Kuruma',   reward: 5000,  class: 'B'  },
        { model: 'sultan',   label: 'Sultan',   reward: 3500,  class: 'C'  },
        { model: 'schwartzer',label:'Schwartzer',reward: 7000, class: 'A'  },
      ],
    },
    Private: {
      list: [
        { model: 'osiris',   label: 'Osiris',   reward: 22000, class: 'S+' },
        { model: 'reaper',   label: 'Reaper',   reward: 25000, class: 'S+' },
      ],
    },
    'Chop List #1': {
      id: 1,
      list: [
        { model: 'mule',     label: 'Mule',     reward: 4000,  class: 'D' },
      ],
    },
  },
  reputations: {
    Racing:   { level: 3, label: 'Racing',   xp: 2400, maxXp: 5000 },
    Chopping: { level: 4, label: 'Chopping', xp: 8200, maxXp: 10000 },
    Boosting: { level: 2, label: 'Boosting', xp: 1100, maxXp: 3000 },
  },
  items: [
    { id: 1, item: 'racing_crappy',              coin: 'VRM',  price: 3,    vpn: false, qty: 50,  itemData: { label: 'Race Entry (Crappy)' } },
    { id: 2, item: 'racedongle',                 coin: 'VRM',  price: 20,   vpn: false, qty: -1,  rep: 'Racing',   repLvl: 2, itemData: { label: 'Race Dongle' } },
    { id: 3, item: 'harness',                    coin: 'VRM',  price: 20,   vpn: false, qty: -1,  rep: 'Racing',   repLvl: 1, itemData: { label: 'Racing Harness' } },
    { id: 4, item: 'boosting_tracking_disabler', coin: 'VRM',  price: 50,   vpn: true,  qty: 20,  itemData: { label: 'Tracking Disabler' } },
    { id: 5, item: 'fakeplates',                 coin: 'VRM',  price: 20,   vpn: true,  qty: -1,  rep: 'Racing',   repLvl: 1, itemData: { label: 'Fake Plates' } },
    { id: 6, item: 'fakeplates',                 coin: 'MALD', price: 50,   vpn: true,  qty: 5,   itemData: { label: 'Fake Plates (MALD)' } },
    { id: 7, item: 'nitrous',                    coin: 'VRM',  price: 10,   vpn: true,  qty: -1,  itemData: { label: 'Nitrous' } },
    { id: 8, item: 'choplist',                   coin: 'VRM',  price: 25,   vpn: true,  qty: 25,  rep: 'Chopping', repLvl: 3, itemData: { label: 'Chop List' } },
    { id: 9, item: 'alias_changer',              coin: 'VRM',  price: 2000, vpn: true,  qty: 2,   rep: 'Racing',   repLvl: 5, itemData: { label: 'Alias Changer' } },
  ],
  banned: null,
  canBoost: true,
}

export const MOCK_BOOSTING_CONTRACTS = [
  { id: 'c1', vehicle: 'adder',    label: 'Adder',    class: 'S+', reward: 45000 },
  { id: 'c2', vehicle: 'zentorno', label: 'Zentorno', class: 'S+', reward: 38000 },
  { id: 'c3', vehicle: 'kuruma',   label: 'Kuruma',   class: 'B',  reward: 8500  },
  { id: 'c4', vehicle: 'sultan',   label: 'Sultan',   class: 'C',  reward: 4200  },
]

export const MOCK_DOCUMENTS: Document[] = [
  { id: 'd1', title: 'Employee NDA',         content: 'By signing this document, you agree not to disclose any proprietary business information.', author: 'HR Dept',   created_at: '2026-04-01' },
  { id: 'd2', title: 'Q1 Performance Review',content: 'All employees performed above expectations in Q1. Bonus criteria met for senior staff.',       author: 'Management',created_at: '2026-03-31' },
  { id: 'd3', title: 'Workshop SOP',         content: 'Standard operating procedure for all workshop activities. Follow safety guidelines at all times.', author: 'Manager', created_at: '2026-03-20' },
]

export const MOCK_RECEIPTS: Receipt[] = [
  { id: 'r1', title: 'Vehicle Sale — Adder',      amount: 350000, author: 'J. Doe',   type: 'sale',    created_at: '2026-04-07' },
  { id: 'r2', title: 'Service — Oil Change',       amount: 250,    author: 'M. Smith', type: 'service', created_at: '2026-04-07' },
  { id: 'r3', title: 'Vehicle Sale — Zentorno',    amount: 725000, author: 'J. Doe',   type: 'sale',    created_at: '2026-04-06' },
  { id: 'r4', title: 'Parts — Replacement Brakes', amount: -1200,  author: 'M. Smith', type: 'expense', created_at: '2026-04-05' },
  { id: 'r5', title: 'Staff Wages',                amount: -8500,  author: 'HR',       type: 'expense', created_at: '2026-04-01' },
]

export const MOCK_FLEET: FleetVehicle[] = [
  { id: 1, plate: 'HAYES01', model: 'hauler',   label: 'Hauler Truck',  online: true,  driver: 'Mike C.' },
  { id: 2, plate: 'HAYES02', model: 'rumpo',    label: 'Parts Van',     online: true,  driver: 'Sarah K.' },
  { id: 3, plate: 'HAYES03', model: 'baller',   label: 'Company SUV',   online: false },
  { id: 4, plate: 'HAYES04', model: 'felon',    label: 'Loaner Sedan',  online: false },
]

export const MOCK_TWITTER = {
  profile: {
    handle: 'hayesauto',
    displayName: 'Hayes Auto',
    bio: "Los Santos' premier automotive shop. We fix it right, first time.",
    followers: 1842,
    verified: false,
  },
  tweets: [
    { id: 't1', content: '🔧 Oil change special this week — $250 flat. Book in via our website or drop by the shop!', author: 'Hayes Auto', created_at: '2026-04-07', likes: 42 },
    { id: 't2', content: '✅ Brand new Zentorno just landed in our showroom. Priced to move. Come take a look before she\'s gone!', author: 'Hayes Auto', created_at: '2026-04-06', likes: 87 },
    { id: 't3', content: 'Reminder: we are CLOSED on Sunday. Back Monday bright and early. Thanks for your support!', author: 'Hayes Auto', created_at: '2026-04-04', likes: 15 },
  ],
}

export const MOCK_PDM_STOCK = [
  { id: 1, model: 'adder',     label: 'Adder',     price: 1000000, stock: 2, category: 'Supercar' },
  { id: 2, model: 'zentorno',  label: 'Zentorno',  price: 725000,  stock: 1, category: 'Supercar' },
  { id: 3, model: 'felon',     label: 'Felon',     price: 35000,   stock: 5, category: 'Sedan'    },
  { id: 4, model: 'schafter2', label: 'Schafter V12', price: 116000, stock: 3, category: 'Sedan'  },
  { id: 5, model: 'oracle',    label: 'Oracle',    price: 28000,   stock: 0, category: 'SUV'      },
]

export const MOCK_PDM_HISTORY = [
  { id: 'h1', vehicle: 'adder',    label: 'Adder',    buyer: 'S. Parker (45678)', price: 1000000, plate: 'SPEED1',  date: '2026-04-06' },
  { id: 'h2', vehicle: 'zentorno', label: 'Zentorno', buyer: 'T. James (99001)',  price: 725000,  plate: 'ZEN420',  date: '2026-04-05' },
  { id: 'h3', vehicle: 'felon',    label: 'Felon',    buyer: 'R. Cruz (22222)',   price: 35000,   plate: 'FEL001',  date: '2026-04-03' },
]

export const MOCK_CREDIT_RESULT = {
  SID: 12345,
  name: 'John Doe',
  score: 742,
  tier: 'Good',
  income: '$12,500/mo (estimated)',
  employment: 'Hayes Auto — Manager',
}

export const MOCK_PROPERTIES = [
  { id: 'p1', address: '1 Alta St, Apt 57',       type: 'Apartment', price: 215000,  status: 'Available' },
  { id: 'p2', address: '3 Dutch London St',        type: 'House',     price: 725000,  status: 'Available' },
  { id: 'p3', address: '2 Eclipse Blvd, Unit 8',   type: 'Penthouse', price: 1500000, status: 'Sold'      },
  { id: 'p4', address: '0 Hangman Ave',            type: 'House',     price: 890000,  status: 'Available' },
]

export const MOCK_CASINO_WINS = [
  { id: 'w1', player: 'S. Parker',  game: 'Blackjack',       amount: 250000,  date: '2026-04-07', multiplier: 10  },
  { id: 'w2', player: 'T. James',   game: 'Slot Machine',    amount: 1000000, date: '2026-04-06', multiplier: 100 },
  { id: 'w3', player: 'A. Kim',     game: 'Roulette',        amount: 500000,  date: '2026-04-05', multiplier: 35  },
  { id: 'w4', player: 'R. Cruz',    game: 'Three Card Poker', amount: 180000, date: '2026-04-04' },
]

export const MOCK_TEAMS_ALL = [
  MOCK_TEAM,
  { ID: 2, State: 0, StateName: 'Available', Name: 'GhostRiders', Members: [
    { Leader: true, Source: 4, SID: 55555, First: 'Alex', Last: 'Reyes' },
    { Leader: false,Source: 5, SID: 66666, First: 'Sam',  Last: 'Park'  },
  ]},
  { ID: 3, State: 1, StateName: 'In Mission', Name: 'Syndicate', Members: [
    { Leader: true, Source: 6, SID: 77777, First: 'Chris', Last: 'Moon' },
  ]},
]

export const MOCK_REQUESTS = [
  { id: 101, time: Date.now(), expires: Date.now() + 120000, owner: 12345, team: false, event: 'Tablet:Server:Teams:Invite', label: 'New Team Invite', description: 'Join ShadowCrew', data: { invite: true, team: 1 } },
]
