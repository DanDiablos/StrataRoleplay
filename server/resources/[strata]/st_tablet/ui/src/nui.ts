import {
  MOCK_LSU_DATA, MOCK_DOCUMENTS, MOCK_RECEIPTS, MOCK_NOTICES,
  MOCK_FLEET, MOCK_TWITTER, MOCK_PDM_STOCK, MOCK_PDM_HISTORY,
  MOCK_PDM_STOCK as MOCK_DEALER_DATA, MOCK_CREDIT_RESULT, MOCK_PROPERTIES,
  MOCK_CASINO_WINS, MOCK_TEAMS_ALL, MOCK_REQUESTS, MOCK_BOOSTING_CONTRACTS,
} from './mock'

const DEV = import.meta.env.DEV

function mockResponse(data: unknown): Promise<Response> {
  return Promise.resolve(new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  }))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MOCK_HANDLERS: Record<string, (data: any) => unknown> = {
  // LSU
  GetLSUDetails: () => MOCK_LSU_DATA,
  'LSUNDG:Market:Checkout': () => ({ success: true, coords: { x: -297.6, y: -2598.9, z: 5.2 } }),

  // Boosting
  'Boosting:EnterQueue':     () => true,
  'Boosting:ExitQueue':      () => true,
  'Boosting:AcceptContract': () => ({ success: true }),
  'Boosting:TransferContract': () => ({ success: true }),
  'Boosting:DeclineContract':  () => true,
  'Boosting:Admin:CreateContract': () => ({ success: true }),
  'Boosting:Admin:GetBans':  () => [
    { SID: 11111, name: 'Bad Actor', reason: 'Cheating' },
    { SID: 22222, name: 'Another Guy', reason: 'Harassment' },
  ],
  'Boosting:Admin:Ban':   () => true,
  'Boosting:Admin:Unban': () => true,

  // Documents
  BusinessDocumentSearch: () => MOCK_DOCUMENTS,
  BusinessDocumentView:   () => MOCK_DOCUMENTS[0],
  BusinessDocumentCreate: () => ({ id: 'new', title: 'New Doc', author: 'You', created_at: '2026-04-07', content: '' }),
  BusinessDocumentUpdate: () => true,
  BusinessDocumentDelete: () => true,

  // Receipts
  BusinessReceiptSearch:    () => MOCK_RECEIPTS,
  BusinessReceiptView:      (d) => MOCK_RECEIPTS.find(r => r.id === d.id) ?? MOCK_RECEIPTS[0],
  BusinessReceiptCreate:    () => ({ id: 'new', title: 'New Receipt', amount: 0, author: 'You', created_at: '2026-04-07' }),
  BusinessReceiptUpdate:    () => true,
  BusinessReceiptDelete:    () => true,
  BusinessReceiptDeleteAll: () => true,

  // Notices
  CreateBusinessNotice: () => ({ id: 'new', title: 'New Notice', content: '', author: 'You', created_at: '2026-04-07' }),
  DeleteBusinessNotice: () => true,

  // BizWiz misc
  BizWizEmployeeSearch: () => [
    { SID: 12345, name: 'John Doe',   grade: 'Manager' },
    { SID: 67890, name: 'Jane Smith', grade: 'Mechanic' },
  ],
  GetBusinessTwitter:  () => MOCK_TWITTER,
  SetBusinessTwitter:  () => true,
  SendBusinessTweet:   (d) => ({
    id: `t${Date.now()}`,
    content: d.content,
    author: 'Hayes Auto',
    created_at: '2026-04-07',
    likes: 0,
  }),
  ViewVehicleFleet:    () => MOCK_FLEET,
  TrackFleetVehicle:   () => ({ x: -297.6, y: -2598.9, z: 5.2 }),
  CasinoGetBigWins:    () => MOCK_CASINO_WINS,

  // PDM
  PDMGetDealerData:       () => ({ name: 'Hayes Auto', manager: 'J. Doe', lot: 'Vehicle Lot A' }),
  PDMSaveDealerData:      () => true,
  PDMGetStock:            () => MOCK_PDM_STOCK,
  DealershipStartTestDrive: () => true,
  PDMRunCredit:           () => MOCK_CREDIT_RESULT,
  PDMStartSale:           () => ({ success: true }),
  PDMGetHistory:          () => MOCK_PDM_HISTORY,
  PDMGetOwner:            () => ({ name: 'John Doe', SID: 12345 }),

  // Dynasty
  Dyn8SearchProperties:   () => MOCK_PROPERTIES,
  Dyn8MarkProperty:       () => true,
  Dyn8StartSale:          () => ({ success: true }),
  Dyn8StartTransfer:      () => ({ success: true }),
  Dyn8RunCredit:          () => MOCK_CREDIT_RESULT,
  Dyn8ChangePropertyLocations: () => true,
  Dyn8ShowPropertyLocations:   () => true,
  Dyn8CopyID:             () => true,
  Dyn8ToggleBlips:        () => true,

  // Teams
  GetTeams:            () => MOCK_TEAMS_ALL,
  GetTeamRequests:     () => MOCK_REQUESTS,
  CreateTeam:          (d) => ({ success: true, team: { ID: 99, State: 0, StateName: 'Available', Name: d.Name, Members: [] } }),
  InviteTeamMember:    () => ({ success: true }),
  RemoveTeamMember:    () => true,
  RequestTeamInvite:   () => true,
  DeleteTeam:          () => true,
  TeamRequest:         () => true,

  // Cameras
  GetCameras: () => [
    { id: 1, label: '24/7 - Davis Cam 1',             group: 'store1', isOnline: true,  quality: 'low',     canRotate: false },
    { id: 2, label: '24/7 - Davis Cam 2',             group: 'store1', isOnline: true,  quality: 'low',     canRotate: false },
    { id: 3, label: '24/7 - N. Rockford Dr Cam 1',    group: 'store2', isOnline: true,  quality: 'low',     canRotate: false },
    { id: 4, label: '24/7 - N. Rockford Dr Cam 2',    group: 'store2', isOnline: false, quality: 'low',     canRotate: false },
    { id: 5, label: 'Vinewood Blvd Traffic',          group: 'traffic', isOnline: true, quality: 'medium',  canRotate: true  },
    { id: 6, label: 'LSPD Mission Row Lobby',         group: 'lspd',    isOnline: true, quality: 'blackandwhite', canRotate: true },
    { id: 7, label: 'LSPD Mission Row Sally Port',    group: 'lspd',    isOnline: true, quality: 'blackandwhite', canRotate: false },
    { id: 8, label: 'Pillbox Emergency Entrance',     group: 'pillbox', isOnline: false,quality: 'nightvision',   canRotate: true },
  ],
  ViewCamera: () => ({ ok: true }),

  // Settings
  UpdateSetting: () => true,

  // Close
  CloseTablet:  () => 'OK',
  AcceptPopup:  () => 'OK',
  CancelPopup:  () => 'OK',
  CDExpired:    () => 'OK',
}

export const sendNui = (event: string, data: Record<string, unknown> = {}): Promise<Response> => {
  if (DEV) {
    const handler = MOCK_HANDLERS[event]
    const result = handler ? handler(data) : null
    console.log(`[NUI] ${event}`, data, '→', result)
    return mockResponse(result)
  }

  return fetch(`https://st_tablet/${event}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}
