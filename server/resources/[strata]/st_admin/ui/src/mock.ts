/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Dev-only mock NUI responses. Only imported when import.meta.env.DEV is true.
 */

const now = () => Math.floor(Date.now() / 1000)

const MOCK_HISTORY = Array.from({ length: 48 }, (_, i) => ({
  count: Math.max(0, Math.round(20 + Math.sin(i / 4) * 14 + Math.random() * 6)),
  time: now() - (48 - i) * 300,
}))

const MOCK_PLAYERS = [
  { Source: 1,  AccountID: 1001, Name: 'John Martinez',   GameName: 'J_Martinez',  Discord: '181234567890',  Mention: '@jmartinez',  StaffGroup: 'Admin',      Level: 90,  Character: { First: 'James',  Last: 'Calloway', SID: 1042 } },
  { Source: 2,  AccountID: 1002, Name: 'Sarah Chen',      GameName: 'S_Chen',      Discord: '281234567891',  Mention: '@schen',      StaffGroup: undefined,    Level: 0,   Character: { First: 'Emily',  Last: 'Nguyen',   SID: 2187 } },
  { Source: 3,  AccountID: 1003, Name: 'Marcus Johnson',  GameName: 'M_Johnson',   Discord: '381234567892',  Mention: '@mjohnson',   StaffGroup: undefined,    Level: 0,   Character: undefined },
  { Source: 4,  AccountID: 1004, Name: 'Aisha Williams',  GameName: 'A_Williams',  Discord: '481234567893',  Mention: '@awilliams',  StaffGroup: 'Moderator',  Level: 75,  Character: { First: 'Ava',    Last: 'Torres',   SID: 3301 } },
  { Source: 5,  AccountID: 1005, Name: 'Tyler Brooks',    GameName: 'T_Brooks',    Discord: '581234567894',  Mention: '@tbrooks',    StaffGroup: undefined,    Level: 0,   Character: { First: 'Liam',   Last: 'Stone',    SID: 4455 } },
  { Source: 6,  AccountID: 1006, Name: 'Priya Patel',     GameName: 'P_Patel',     Discord: '681234567895',  Mention: '@ppatel',     StaffGroup: undefined,    Level: 0,   Character: undefined },
  { Source: 7,  AccountID: 1007, Name: 'Devon Cross',     GameName: 'D_Cross',     Discord: '781234567896',  Mention: '@dcross',     StaffGroup: undefined,    Level: 0,   Character: { First: 'Noah',   Last: 'Harper',   SID: 5562 } },
  { Source: 8,  AccountID: 1008, Name: 'Zoe Nakamura',    GameName: 'Z_Nakamura',  Discord: '881234567897',  Mention: '@znakamura',  StaffGroup: undefined,    Level: 0,   Character: { First: 'Sofia',  Last: 'Reed',     SID: 6670 } },
]

const MOCK_DISCONNECTED = [
  { Source: 101, AccountID: 2001, Name: 'Ryan Foster',    DisconnectedTime: now() - 180,  Character: { First: 'Jake',   Last: 'Miller',  SID: 7701 } },
  { Source: 102, AccountID: 2002, Name: 'Olivia Grant',   DisconnectedTime: now() - 900,  Character: undefined },
  { Source: 103, AccountID: 2003, Name: 'Carlos Reyes',   DisconnectedTime: now() - 3600, Character: { First: 'Diego',  Last: 'Vega',    SID: 8812 } },
  { Source: 104, AccountID: 2004, Name: 'Hannah Kim',     DisconnectedTime: now() - 7200, Character: { First: 'Grace',  Last: 'Park',    SID: 9923 } },
]

const MOCK_CHARACTERS = [
  { SID: 1042, First: 'James',  Last: 'Calloway', Online: 1, Identifier: 'license:abc123', AccountID: 1001 },
  { SID: 2187, First: 'Emily',  Last: 'Nguyen',   Online: 1, Identifier: 'license:def456', AccountID: 1002 },
  { SID: 3301, First: 'Ava',    Last: 'Torres',   Online: 1, Identifier: 'license:ghi789', AccountID: 1004 },
  { SID: 4455, First: 'Liam',   Last: 'Stone',    Online: 1, Identifier: 'license:jkl012', AccountID: 1005 },
  { SID: 5562, First: 'Noah',   Last: 'Harper',   Online: 1, Identifier: 'license:mno345', AccountID: 1007 },
  { SID: 7701, First: 'Jake',   Last: 'Miller',   Online: 0, Identifier: 'license:pqr678', AccountID: 2001 },
  { SID: 8812, First: 'Diego',  Last: 'Vega',     Online: 0, Identifier: 'license:stu901', AccountID: 2003 },
  { SID: 9923, First: 'Grace',  Last: 'Park',     Online: 0, Identifier: 'license:vwx234', AccountID: 2004 },
]

const MOCK_ITEMS = [
  { name: 'weapon_pistol',       label: 'Pistol',              type: 'weapon', weapon: true,  stack: false },
  { name: 'weapon_smg',          label: 'SMG',                 type: 'weapon', weapon: true,  stack: false },
  { name: 'weapon_carbinerifle', label: 'Carbine Rifle',       type: 'weapon', weapon: true,  stack: false },
  { name: 'ammo_pistol',         label: 'Pistol Ammo',         type: 'ammo',   ammo: true,    stack: true  },
  { name: 'ammo_rifle',          label: 'Rifle Ammo',          type: 'ammo',   ammo: true,    stack: true  },
  { name: 'bandage',             label: 'Bandage',             type: 'item',   stack: true  },
  { name: 'firstaidkit',         label: 'First Aid Kit',       type: 'item',   stack: false },
  { name: 'water_bottle',        label: 'Water Bottle',        type: 'food',   stack: true  },
  { name: 'burger',              label: 'Burger',              type: 'food',   stack: true  },
  { name: 'lockpick',            label: 'Lockpick',            type: 'item',   stack: true  },
  { name: 'thermite',            label: 'Thermite',            type: 'item',   stack: false },
  { name: 'c4',                  label: 'C4 Explosive',        type: 'item',   stack: false },
  { name: 'scrap_metal',         label: 'Scrap Metal',         type: 'item',   stack: true  },
  { name: 'copper_ore',          label: 'Copper Ore',          type: 'material', stack: true },
  { name: 'phone',               label: 'Phone',               type: 'item',   stack: false },
  { name: 'id_card',             label: 'ID Card',             type: 'item',   stack: false },
]

const MOCK_VEHICLES = [
  { Entity: 201, Make: 'Benefactor', Model: 'Schwartzer', Plate: 'STRATA01', VIN: 'VIN00001ABC', OwnerId: 1001, Owned: true },
  { Entity: 202, Make: 'Ocelot',     Model: 'F620',       Plate: 'SANYO42',  VIN: 'VIN00002DEF', OwnerId: 1002, Owned: true },
  { Entity: 203, Make: 'Vapid',      Model: 'Dominator',  Plate: 'NOOWNER',  VIN: 'VIN00003GHI', OwnerId: undefined, Owned: false },
  { Entity: 204, Make: 'Lampadati',  Model: 'Felon',      Plate: 'FELO01',   VIN: 'VIN00004JKL', OwnerId: 1004, Owned: true },
  { Entity: 205, Make: 'Ubermacht',  Model: 'Sentinel',   Plate: 'SENT99',   VIN: 'VIN00005MNO', OwnerId: 1005, Owned: true },
]

const MOCK_VEHICLE_DATA = {
  Entity: 201, EntityModel: '0x3E5F3A5C', Make: 'Benefactor', Model: 'Schwartzer',
  Plate: 'STRATA01', VIN: 'VIN00001ABC', Owned: true, Owner: { Id: 1001 },
  Value: 95000, Fuel: 78, Seat: 0, Heading: 184.3,
  Coords: { x: 253.4, y: -710.2, z: 30.1 },
  Damage: { Engine: 850, Body: 920 },
  DamagedParts: { Axle: 1000, Radiator: 1000, Transmission: 870, FuelInjectors: 1000, Brakes: 950, Clutch: 1000, Electronics: 1000 },
}

const MOCK_DOORLOCKS = [
  { id: 1,  name: 'LSPD Front Door',       state: 1, coords: { x: 457.1,  y: -992.4,  z: 30.7 }, groups: { police: 0 } },
  { id: 2,  name: 'LSPD Side Entrance',    state: 0, coords: { x: 461.3,  y: -985.1,  z: 30.7 }, groups: { police: 0 } },
  { id: 3,  name: 'MRPD Garage',           state: 1, coords: { x: 469.8,  y: -1009.7, z: 26.5 }, groups: { police: 1 } },
  { id: 4,  name: 'Hospital Entrance',     state: 0, coords: { x: 307.9,  y: -594.6,  z: 43.3 }, groups: { ambulance: 0, police: 0 } },
  { id: 5,  name: 'Bank Vault',            state: 1, coords: { x: 149.5,  y: -1044.3, z: 29.4 }, groups: {} },
  { id: 6,  name: 'Mechanic Shop',         state: 0, coords: { x: -344.8, y: -131.7,  z: 38.7 }, groups: { mechanic: 0 } },
]

const MOCK_DOORLOCK_DATA = {
  id: 1, name: 'LSPD Front Door', state: 1,
  coords: { x: 457.1, y: -992.4, z: 30.7 }, heading: 184.2,
  model: '0xC7748AAB', maxDistance: 2.5, doorRate: 1.0,
  auto: false, lockpick: false, hideUi: false, holdOpen: false, onduty: true, passcode: null,
  groups: { police: 0 }, lockSound: '', unlockSound: '', workplace: 'lspd', permissions: '',
}

const MOCK_PLAYER_DATA = {
  Source: 1, AccountID: 1001, Name: 'John Martinez', GameName: 'J_Martinez',
  Discord: '181234567890', Mention: '@jmartinez', Identifier: 'license:abc123def456',
  StaffGroup: 'Admin', Level: 90,
  Character: { First: 'James', Last: 'Calloway', SID: 1042, DOB: '1990-06-15', Phone: '555-0101',
    Coords: { x: 253.4, y: -710.2, z: 30.1, h: 184.3 } },
  Vehicle: { Make: 'Benefactor', Model: 'Schwartzer', Plate: 'STRATA01', Entity: 201 },
  Characters: [
    { SID: 1042, First: 'James',  Last: 'Calloway', DOB: '1990-06-15', Phone: '555-0101', Cash: 12500,
      Jobs: [{ Name: 'Police', Grade: { Name: 'Officer' } }], LastPlayed: now() - 120, Deleted: false },
    { SID: 1099, First: 'Victor', Last: 'Crane',    DOB: '1985-11-22', Phone: '555-0202', Cash: 4200,
      Jobs: [], LastPlayed: now() - 86400 * 14, Deleted: false },
    { SID: 1100, First: 'Ghost',  Last: 'Account',  DOB: '2000-01-01', Phone: undefined,  Cash: 0,
      Jobs: [], LastPlayed: now() - 86400 * 90, Deleted: true },
  ],
}

const MOCK_JOBS = [
  {
    id: 'police', name: 'Police',
    grades: [
      { id: 'cadet',   name: 'Cadet',   level: 0, workplaceId: 'lspd', workplaceName: 'LSPD' },
      { id: 'officer', name: 'Officer', level: 1, workplaceId: 'lspd', workplaceName: 'LSPD' },
      { id: 'senior',  name: 'Senior Officer', level: 2, workplaceId: 'lspd', workplaceName: 'LSPD' },
      { id: 'det',     name: 'Detective', level: 3, workplaceId: 'lspd', workplaceName: 'LSPD' },
      { id: 'lt',      name: 'Lieutenant', level: 4, workplaceId: 'lspd', workplaceName: 'LSPD' },
    ],
  },
  {
    id: 'ambulance', name: 'EMS',
    grades: [
      { id: 'trainee', name: 'Trainee', level: 0, workplaceId: 'pillbox', workplaceName: 'Pillbox Medical' },
      { id: 'emt',     name: 'EMT',     level: 1, workplaceId: 'pillbox', workplaceName: 'Pillbox Medical' },
      { id: 'doctor',  name: 'Doctor',  level: 2, workplaceId: 'pillbox', workplaceName: 'Pillbox Medical' },
    ],
  },
  {
    id: 'mechanic', name: 'Mechanic',
    grades: [
      { id: 'apprentice', name: 'Apprentice', level: 0 },
      { id: 'tech',       name: 'Technician', level: 1 },
      { id: 'senior',     name: 'Senior Tech', level: 2 },
    ],
  },
]

// ---------------------------------------------------------------------------
// Main mock handler — called by sendNui in DEV mode
// ---------------------------------------------------------------------------
export function mockNui<T = unknown>(event: string, data: Record<string, unknown> | number): T {
  switch (event) {
    // Dashboard
    case 'GetPlayerHistory':
      return { current: MOCK_PLAYERS.length, max: 64, queue: 3, history: MOCK_HISTORY } as T

    // Players / Disconnected
    case 'GetPlayerList':
      return (typeof data === 'object' && data.disconnected ? MOCK_DISCONNECTED : MOCK_PLAYERS) as T

    // Characters
    case 'GetAllPlayersByCharacter':
      return { players: MOCK_CHARACTERS, pages: MOCK_CHARACTERS.length } as T

    // Items
    case 'Admin:GetItemDatabase':
      return MOCK_ITEMS as T

    // Vehicles
    case 'GetVehicleList':
      return MOCK_VEHICLES as T

    case 'GetCurrentVehicle':
    case 'GetVehicle':
      return MOCK_VEHICLE_DATA as T

    // Doorlocks
    case 'GetDoorLocks':
      return MOCK_DOORLOCKS as T

    case 'GetDoorLockById':
      return MOCK_DOORLOCK_DATA as T

    // Player detail
    case 'GetPlayer':
      return MOCK_PLAYER_DATA as T

    // Job database
    case 'Admin:GetJobDatabase':
      return MOCK_JOBS as T

    // Actions — always succeed
    case 'ActionPlayer':
    case 'KickPlayer':
    case 'BanPlayer':
    case 'ActionVehicle':
    case 'CurrentVehicleAction':
    case 'Admin:GiveJob':
    case 'Admin:GiveItem':
    case 'CreateDoorLock':
    case 'UpdateDoorLock':
    case 'DeleteDoorLock':
    case 'ToggleDoorLockState':
      return { success: true, message: `${event} OK (mock)` } as T

    case 'TeleportToDoorLock':
    case 'StartAddDoorLock':
    case 'CopyClipboard':
    case 'ToggleNoClip':
    case 'ToggleInvisible':
    case 'ToggleIDs':
      return {} as T

    default:
      console.warn('[mock] unhandled NUI event:', event, data)
      return {} as T
  }
}
