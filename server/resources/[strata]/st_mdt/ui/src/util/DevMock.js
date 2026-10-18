// ── Dev-only mock data ────────────────────────────────────────────────────────
// Provides fake Nui responses so every page renders with realistic data
// in the local dev server. Never imported in production.

const mock = (data) => ({ json: () => Promise.resolve(data) });
const mockDelay = (data, ms = 120) =>
    new Promise((r) => setTimeout(() => r(mock(data)), ms));

// ── Shared people ─────────────────────────────────────────────────────────────
const PEOPLE = [
    {
        _id: 'abc001', SID: 10, First: 'James', Last: 'Carter', Phone: '555-210-4421',
        Gender: 0, DOB: '1988-06-14T00:00:00.000Z', Origin: 'United States',
        Callsign: 404, Qualifications: ['fto', 'swat'],
        Job: { Id: 'police', Name: 'Police', Workplace: { Id: 'lspd', Name: 'Los Santos Police Department' }, Grade: { Id: 'sergeant', Name: 'Sergeant' } },
        Licenses: { Drivers: { Active: true, Points: 4 }, Weapons: { Active: true }, Hunting: { Active: true }, Fishing: { Active: false } },
        Flags: [],
    },
    {
        _id: 'abc002', SID: 11, First: 'Maria', Last: 'Vasquez', Phone: '555-318-7760',
        Gender: 1, DOB: '1993-11-02T00:00:00.000Z', Origin: 'Mexico',
        Callsign: null, Qualifications: [],
        Job: null,
        Licenses: { Drivers: { Active: true, Points: 8 }, Weapons: { Active: false }, Hunting: { Active: false }, Fishing: { Active: false } },
        Flags: [{ Type: 'caution', Severity: 'warning', Description: 'Known associate of Vagos', Date: Date.now() - 86400000 * 3 }],
    },
    {
        _id: 'abc003', SID: 12, First: 'Devon', Last: 'Harris', Phone: '555-901-3345',
        Gender: 0, DOB: '1995-03-28T00:00:00.000Z', Origin: 'Jamaica',
        Callsign: null, Qualifications: [],
        Job: null,
        Licenses: { Drivers: { Active: false, Points: 22 }, Weapons: { Active: false }, Hunting: { Active: false }, Fishing: { Active: false } },
        Flags: [],
    },
];

// ── Charges ───────────────────────────────────────────────────────────────────
export const CHARGES = [
    { id: 'ch001', title: 'Reckless Driving', type: 1, jail: 0, fine: 500, points: 3 },
    { id: 'ch002', title: 'Speeding', type: 1, jail: 0, fine: 250, points: 2 },
    { id: 'ch003', title: 'Assault', type: 2, jail: 6, fine: 2500, points: 0 },
    { id: 'ch004', title: 'Battery', type: 2, jail: 8, fine: 3000, points: 0 },
    { id: 'ch005', title: 'Grand Theft Auto', type: 3, jail: 30, fine: 10000, points: 0 },
    { id: 'ch006', title: 'Possession of Illegal Firearm', type: 3, jail: 20, fine: 7500, points: 0 },
    { id: 'ch007', title: 'Fleeing & Evading (Vehicle)', type: 2, jail: 10, fine: 4000, points: 5 },
    { id: 'ch008', title: 'Robbery', type: 3, jail: 40, fine: 15000, points: 0 },
    { id: 'ch009', title: 'Drug Possession', type: 2, jail: 12, fine: 3500, points: 0 },
    { id: 'ch010', title: 'Drug Trafficking', type: 3, jail: 60, fine: 25000, points: 0 },
    { id: 'ch011', title: 'Failure to Stop', type: 1, jail: 0, fine: 150, points: 1 },
    { id: 'ch012', title: 'Obstruction of Justice', type: 2, jail: 5, fine: 2000, points: 0 },
    { id: 'ch013', title: 'Murder', type: 3, jail: 120, fine: 0, points: 0 },
    { id: 'ch014', title: 'Attempted Murder', type: 3, jail: 80, fine: 0, points: 0 },
    { id: 'ch015', title: 'Vandalism', type: 1, jail: 0, fine: 750, points: 0 },
];

// ── Notices ───────────────────────────────────────────────────────────────────
const NOTICES = [
    {
        id: 'n001', title: 'All Units — 10-4 Compliance Reminder', restricted: 'police',
        creator: 1, created: Date.now() - 3600000 * 2,
    },
    {
        id: 'n002', title: 'Traffic Unit Meeting — Saturday 1800', restricted: 'police',
        creator: 1, created: Date.now() - 86400000,
    },
    {
        id: 'n003', title: 'New Use of Force Policy Effective Immediately', restricted: 'government',
        creator: 1, created: Date.now() - 86400000 * 2,
    },
];

// ── Warrants ──────────────────────────────────────────────────────────────────
const WARRANTS = [
    {
        id: 'w001', title: 'Arrest Warrant — Devon Harris', state: 'active',
        expires: Date.now() + 86400000 * 5,
        creatorName: 'J. Carter',
        created: Date.now() - 86400000,
        notes: 'Suspect evaded on foot after traffic stop. Armed and dangerous.',
        suspect: { First: 'Devon', Last: 'Harris', SID: 12 },
    },
    {
        id: 'w002', title: 'Search Warrant — 214 Grove St', state: 'active',
        expires: Date.now() + 86400000 * 2,
        creatorName: 'M. Vasquez',
        created: Date.now() - 3600000 * 6,
        notes: 'Evidence of drug manufacturing on premises.',
        suspect: { First: 'Unknown', Last: 'Occupant', SID: 0 },
    },
    {
        id: 'w003', title: 'Arrest Warrant — Marcus Webb', state: 'active',
        expires: Date.now() + 86400000 * 1,
        creatorName: 'J. Carter',
        created: Date.now() - 86400000 * 3,
        notes: 'Multiple counts of armed robbery.',
        suspect: { First: 'Marcus', Last: 'Webb', SID: 99 },
    },
];

// ── BOLOs ─────────────────────────────────────────────────────────────────────
const BOLOS = [
    {
        _id: 'b001', title: 'Black Bravado Gauntlet', type: 'car',
        summary: 'Involved in hit and run on Rockford Hills. Plate: 9XAB441.',
        description: 'Vehicle was seen leaving the scene at high speed northbound on Vinewood Blvd.',
        time: Date.now() - 3600000,
        author: { First: 'James', Last: 'Carter', Callsign: 404, SID: 10 },
    },
    {
        _id: 'b002', title: 'Male, Red Hoodie, Armed', type: 'person',
        summary: 'Suspect fled robbery at Fleeca Bank, Mirror Park.',
        description: 'Hispanic male, ~6ft, red hoodie, dark jeans. Last seen running towards the train yard.',
        time: Date.now() - 7200000,
        author: { First: 'James', Last: 'Carter', Callsign: 404, SID: 10 },
    },
];

// ── Gov workers ───────────────────────────────────────────────────────────────
const GOV_WORKERS = [
    { First: 'Alexandra', Last: 'Price', Grade: 'Judge', SID: 50, Phone: '555-000-1111', Workplace: 'DOJ' },
    { First: 'Samuel', Last: 'Ortega', Grade: 'District Attorney', SID: 51, Phone: '555-000-2222', Workplace: 'dattorney' },
    { First: 'Naomi', Last: 'Fletcher', Grade: 'Public Defender', SID: 52, Phone: '555-000-3333', Workplace: 'dattorney' },
];

// ── Reports ───────────────────────────────────────────────────────────────────
const REPORT_LIST = [
    { _id: 'r001', id: 1001, type: 0, title: 'Fleeing & Evading — Devon Harris', creatorName: 'J. Carter', created: Date.now() - 3600000 },
    { _id: 'r002', id: 1002, type: 0, title: 'Armed Robbery — Fleeca Bank Mirror Park', creatorName: 'J. Carter', created: Date.now() - 7200000 },
    { _id: 'r003', id: 1003, type: 1, title: 'Ongoing Investigation — Vagos Activity Grove St', creatorName: 'M. Reyes', created: Date.now() - 86400000 },
    { _id: 'r004', id: 1004, type: 2, title: 'Civilian Complaint — Excessive Force Allegation', creatorName: 'T. McTest', created: Date.now() - 86400000 * 2 },
    { _id: 'r005', id: 1005, type: 0, title: 'Traffic Pursuit — Suspect Apprehended', creatorName: 'J. Carter', created: Date.now() - 86400000 * 3 },
];

const REPORT_VIEW = {
    id: 1001, type: 0, title: 'Fleeing & Evading — Devon Harris',
    notes: '<p>Units responded to a report of a reckless driver on Olympic Fwy. Upon contact, suspect attempted to flee in a black Gauntlet.</p><p>Pursuit lasted approximately 8 minutes. Suspect eventually stopped and was taken into custody without further incident. Contraband recovered from vehicle.</p>',
    created: Date.now() - 3600000,
    creatorName: 'J. Carter',
    allowAttorney: false,
    primaries: [PEOPLE[0]],
    people: [],
    evidence: [
        { id: 'ev001', type: 'photo', label: 'Scene photo', value: 'https://via.placeholder.com/400x300' },
        { id: 'ev002', type: 'casing', label: '9mm casing', value: 'CASE-001' },
    ],
    suspects: [
        {
            SID: 12, First: 'Devon', Last: 'Harris', plea: 'guilty', sentenced: true,
            jail: 10, fine: 4000, points: 5, doc: false,
            revoked: { weapons: false, drivers: true, hunting: false, fishing: false },
            reduction: { type: false, value: 0 },
            charges: [
                { id: 'ch007', count: 1 },
                { id: 'ch011', count: 1 },
            ],
            Licenses: { Drivers: { Active: true, Points: 18 }, Weapons: { Active: false } },
        },
    ],
    suspectsOverturned: [],
    paroleData: [],
};

// ── Vehicles ──────────────────────────────────────────────────────────────────
const VEHICLES = [
    {
        _id: 'v001', RegisteredPlate: '9XAB441', VIN: 'VIN00000001',
        Make: 'Bravado', Model: 'Gauntlet', State: 1, Type: 1,
        Owner: { First: 'Devon', Last: 'Harris', Char: 'abc003', Type: 0, Id: 12 },
        Purchase: { Time: Date.now() - 86400000 * 30, Type: 'Owned' },
        Location: 'Out',
        Flags: [{ Type: 'stolen', Severity: 'error', Description: 'BOLO — involved in hit and run', Date: Date.now() - 3600000, Author: { First: 'James', Last: 'Carter', Callsign: 404 } }],
        Damage: [],
        Properties: { color1: [10, 10, 10], color2: [8, 8, 8], fuelLevel: 55, engineHealth: 980, bodyHealth: 850 },
    },
    {
        _id: 'v002', RegisteredPlate: '4TRX920', VIN: 'VIN00000002',
        Make: 'Declasse', Model: 'Tornado', State: 1, Type: 1,
        Owner: { First: 'Maria', Last: 'Vasquez', Char: 'abc002', Type: 0, Id: 11 },
        Purchase: { Time: Date.now() - 86400000 * 90, Type: 'Owned' },
        Location: 'Garaged',
        Flags: [],
        Damage: [{ Description: 'Front bumper damage', Date: Date.now() - 86400000 * 5 }],
        Properties: { color1: [180, 30, 30], color2: [20, 20, 20], fuelLevel: 80, engineHealth: 1000, bodyHealth: 960 },
    },
];

// ── Firearms ──────────────────────────────────────────────────────────────────
const FIREARMS = [
    {
        _id: 'f001', Serial: 'SN-88921-A', Model: 'Pistol', Make: 'Vom Feuer',
        Owner: { First: 'Devon', Last: 'Harris', SID: 12 },
        Flags: [{ Type: 'stolen', Severity: 'error', Description: 'Reported stolen 3 months ago' }],
        Registered: false,
    },
];

// ── Roster ────────────────────────────────────────────────────────────────────
const mkJob = (gradeId, gradeName, workplaceId, workplaceName, jobId = 'police') => ({
    Id: jobId, Name: 'Police',
    Workplace: { Id: workplaceId, Name: workplaceName },
    Grade: { Id: gradeId, Name: gradeName },
});

const ROSTER = [
    { SID: 1,  First: 'Testy',  Last: 'McTest',  Callsign: 400, Qualifications: ['fto'],         Phone: '121-195-9016', active: true,  Jobs: [mkJob('chief',    'Chief',                  'lspd', 'Los Santos Police Department')] },
    { SID: 10, First: 'James',  Last: 'Carter',   Callsign: 404, Qualifications: ['fto', 'swat'], Phone: '555-210-4421', active: true,  Jobs: [mkJob('sergeant', 'Sergeant',               'lspd', 'Los Santos Police Department')] },
    { SID: 20, First: 'Lena',   Last: 'Park',     Callsign: 210, Qualifications: [],              Phone: '555-441-8812', active: false, Jobs: [mkJob('officer',  'Officer',                'lspd', 'Los Santos Police Department')] },
    { SID: 21, First: 'Rico',   Last: 'Santos',   Callsign: 215, Qualifications: ['fto'],         Phone: '555-320-7734', active: true,  Jobs: [mkJob('corporal', 'Corporal',               'lspd', 'Los Santos Police Department')] },
    { SID: 22, First: 'Hannah', Last: 'Moore',    Callsign: 330, Qualifications: [],              Phone: '555-118-9920', active: false, Jobs: [mkJob('pofficer', 'Probationary Officer',   'lspd', 'Los Santos Police Department')] },
    { SID: 23, First: 'Marcus', Last: 'Webb',     Callsign: 112, Qualifications: ['swat'],        Phone: '555-229-0041', active: true,  Jobs: [mkJob('detective','Detective',              'lspd', 'Los Santos Police Department')] },
    { SID: 24, First: 'Aisha',  Last: 'Thompson', Callsign: 501, Qualifications: ['fto'],         Phone: '555-774-3390', active: true,  Jobs: [mkJob('lieutenant','Lieutenant',            'lspd', 'Los Santos Police Department')] },
];

// ── Event router ──────────────────────────────────────────────────────────────
export const mockSend = (event, data = {}) => {
    switch (event) {
        case 'GetHomeData':
            return mockDelay({ warrants: WARRANTS, notices: NOTICES, govWorkers: GOV_WORKERS });

        case 'Search': {
            const map = {
                people:  { data: PEOPLE, pages: 1 },
                vehicle: { data: VEHICLES, pages: 1 },
                firearm: { data: FIREARMS, pages: 1 },
                warrant: { data: WARRANTS, pages: 1 },
                report:  { data: REPORT_LIST, pages: 1 },
            };
            return mockDelay(map[data.type] ?? { data: [], pages: 1 });
        }

        case 'View':
            if (data.type === 'report') return mockDelay(REPORT_VIEW);
            if (data.type === 'notice') return mockDelay({ ...NOTICES[0], description: '<p>All officers are reminded to submit use-of-force reports within 24 hours of any incident.</p>' });
            if (data.type === 'vehicle') return mockDelay(VEHICLES[0]);
            if (data.type === 'people')  return mockDelay(PEOPLE[0]);
            if (data.type === 'warrant') return mockDelay(WARRANTS[0]);
            if (data.type === 'firearm') return mockDelay(FIREARMS[0]);
            return mockDelay(null);

        case 'InputSearch':
            return mockDelay(data.type === 'people' ? PEOPLE : []);

        case 'InputSearchSID':
            return mockDelay(PEOPLE.filter(p => String(p.SID) === String(data.term)));

        case 'RosterView':
            return mockDelay(ROSTER);

        case 'RosterSelect':
            return mockDelay(ROSTER.find(o => o.SID === data.person) ?? ROSTER[0]);

        case 'GetCharges':
            return mockDelay(CHARGES);

        case 'GetPermissions':
            return mockDelay({ MDT_INCIDENT_REPORT: { name: 'Incident Report', restrict: { job: 'police' } } });

        default:
            return mockDelay(true);
    }
};

// ── Store bootstrap ───────────────────────────────────────────────────────────
// Dispatches initial data into Redux so dashboard widgets, suspect cards, etc.
// all render without waiting for a Nui event.
export const bootstrapDevData = (store) => {
    const dispatch = store.dispatch;

    dispatch({ type: 'SET_DATA', payload: { type: 'charges',    data: CHARGES } });
    dispatch({ type: 'SET_DATA', payload: { type: 'warrants',   data: WARRANTS } });
    dispatch({ type: 'SET_DATA', payload: { type: 'notices',    data: NOTICES } });
    dispatch({ type: 'SET_DATA', payload: { type: 'govWorkers', data: GOV_WORKERS } });
    dispatch({ type: 'SET_DATA', payload: { type: 'bolos',      data: BOLOS } });
    dispatch({ type: 'SET_DATA', payload: { type: 'homeLastFetch', data: Date.now() } });
};
