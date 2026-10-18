import type { Account, Transaction } from './store.ts'

const now = Date.now() / 1000

const ACCOUNTS: Account[] = [
  {
    Account: '100001',
    Balance: 4820,
    Type: 'personal',
    Owner: 100,
    Name: 'Personal Checking',
    Permissions: { MANAGE: true, BALANCE: true, WITHDRAW: true, DEPOSIT: true, TRANSACTIONS: true, BILL: false },
    JointOwners: [],
  },
  {
    Account: '100002',
    Balance: 37500,
    Type: 'personal_savings',
    Owner: 100,
    Name: 'Emergency Fund',
    Permissions: { MANAGE: true, BALANCE: true, WITHDRAW: true, DEPOSIT: true, TRANSACTIONS: true, BILL: false },
    JointOwners: [101, 204],
  },
  {
    Account: '200001',
    Balance: 148250,
    Type: 'organization',
    Owner: 1,
    Name: 'LSPD — Operations',
    Permissions: { MANAGE: false, BALANCE: true, WITHDRAW: false, DEPOSIT: true, TRANSACTIONS: true, BILL: true },
    JointOwners: [],
  },
  {
    Account: '200002',
    Balance: 0,
    Type: 'organization',
    Owner: 2,
    Name: 'LSPD — Evidence',
    Permissions: { MANAGE: false, BALANCE: false, WITHDRAW: false, DEPOSIT: true, TRANSACTIONS: false, BILL: false },
    JointOwners: [],
  },
]

const TRANSACTIONS: Record<string, Transaction[]> = {
  '100001': [
    { Type: 'paycheck',    Amount: 1200,  Account: '100001', Title: 'LSPD Paycheck',           Description: '4h 10m on duty',         Timestamp: now - 3600,     TransactionAccount: false,    Data: { character: 100 } },
    { Type: 'withdraw',    Amount: 500,   Account: '100001', Title: 'Cash Withdrawal',          Description: 'No description',         Timestamp: now - 7200,     TransactionAccount: false,    Data: { character: 100 } },
    { Type: 'deposit',     Amount: 250,   Account: '100001', Title: 'Cash Deposit',             Description: 'selling some stuff',     Timestamp: now - 14400,    TransactionAccount: false,    Data: { character: 100 } },
    { Type: 'fine',        Amount: 750,   Account: '100001', Title: 'Traffic Fine',             Description: 'Speeding — Route 68',    Timestamp: now - 86400,    TransactionAccount: false,    Data: { character: 100 } },
    { Type: 'transfer',    Amount: 1000,  Account: '100001', Title: 'Outgoing Bank Transfer',   Description: 'To: 100002',             Timestamp: now - 90000,    TransactionAccount: '100002', Data: { character: 100 } },
    { Type: 'paycheck',    Amount: 1100,  Account: '100001', Title: 'LSPD Paycheck',           Description: '3h 50m on duty',         Timestamp: now - 172800,   TransactionAccount: false,    Data: { character: 100 } },
    { Type: 'bill',        Amount: 3200,  Account: '100001', Title: 'Hospital Bill',            Description: 'Emergency treatment',    Timestamp: now - 259200,   TransactionAccount: false,    Data: { character: 100 } },
    { Type: 'deposit',     Amount: 600,   Account: '100001', Title: 'Cash Deposit',             Description: 'No description',         Timestamp: now - 345600,   TransactionAccount: false,    Data: { character: 100 } },
    { Type: 'fine_profit', Amount: 112,   Account: '100001', Title: 'Fine Profit Share',        Description: 'Traffic stop payout',    Timestamp: now - 432000,   TransactionAccount: false,    Data: { character: 100 } },
    { Type: 'withdraw',    Amount: 200,   Account: '100001', Title: 'Cash Withdrawal',          Description: 'No description',         Timestamp: now - 518400,   TransactionAccount: false,    Data: { character: 100 } },
    { Type: 'paycheck',    Amount: 950,   Account: '100001', Title: 'LSPD Paycheck',           Description: '3h 15m on duty',         Timestamp: now - 604800,   TransactionAccount: false,    Data: { character: 100 } },
    { Type: 'transfer',    Amount: 500,   Account: '100001', Title: 'Incoming Bank Transfer',   Description: 'From: 100002',           Timestamp: now - 691200,   TransactionAccount: '100002', Data: { character: 100 } },
    { Type: 'fine',        Amount: 1500,  Account: '100001', Title: 'Criminal Fine',            Description: 'Assault charge',         Timestamp: now - 777600,   TransactionAccount: false,    Data: { character: 100 } },
    { Type: 'deposit',     Amount: 400,   Account: '100001', Title: 'Cash Deposit',             Description: 'No description',         Timestamp: now - 864000,   TransactionAccount: false,    Data: { character: 100 } },
    { Type: 'paycheck',    Amount: 1050,  Account: '100001', Title: 'LSPD Paycheck',           Description: '3h 35m on duty',         Timestamp: now - 950400,   TransactionAccount: false,    Data: { character: 100 } },
  ],
  '100002': [
    { Type: 'transfer',    Amount: 1000,  Account: '100002', Title: 'Incoming Bank Transfer',   Description: 'From: 100001',           Timestamp: now - 90000,    TransactionAccount: '100001', Data: { character: 100 } },
    { Type: 'deposit',     Amount: 5000,  Account: '100002', Title: 'Cash Deposit',             Description: 'Monthly savings',        Timestamp: now - 604800,   TransactionAccount: false,    Data: { character: 100 } },
    { Type: 'transfer',    Amount: 500,   Account: '100002', Title: 'Outgoing Bank Transfer',   Description: 'To: 100001',             Timestamp: now - 691200,   TransactionAccount: '100001', Data: { character: 100 } },
  ],
  '200001': [
    { Type: 'fine_profit', Amount: 562,   Account: '200001', Title: 'Fine Profit Share',        Description: '8 fines — July 4th',    Timestamp: now - 3600,     TransactionAccount: false,    Data: { character: 100 } },
    { Type: 'fine_profit', Amount: 338,   Account: '200001', Title: 'Fine Profit Share',        Description: '5 fines — July 3rd',    Timestamp: now - 86400,    TransactionAccount: false,    Data: { character: 100 } },
    { Type: 'deposit',     Amount: 10000, Account: '200001', Title: 'Government Allocation',    Description: 'Weekly budget',          Timestamp: now - 172800,   TransactionAccount: false,    Data: { character: 100 } },
    { Type: 'withdraw',    Amount: 2500,  Account: '200001', Title: 'Equipment Purchase',       Description: 'Body armour restock',    Timestamp: now - 259200,   TransactionAccount: false,    Data: { character: 100 } },
  ],
}

let _nextAccount = 100003

export function mockNui<T>(event: string, data: Record<string, unknown> = {}): T {
  switch (event) {
    case 'Bank:Fetch':
      return { accounts: ACCOUNTS } as T

    case 'Bank:GetTransactions': {
      const acc    = data.account as string
      const offset = (data.offset as number) ?? 0
      const per    = (data.perPage as number) ?? 15
      const all    = TRANSACTIONS[acc] ?? []
      const page   = all.slice(offset, offset + per)
      return { data: page, more: offset + per < all.length } as T
    }

    case 'Bank:Deposit': {
      const acc    = ACCOUNTS.find(a => a.Account === data.account)
      const amount = data.amount as number
      if (acc) acc.Balance += amount
      return { state: true, balance: acc?.Balance ?? 0 } as T
    }

    case 'Bank:Withdraw': {
      const acc    = ACCOUNTS.find(a => a.Account === data.account)
      const amount = data.amount as number
      if (acc) acc.Balance -= amount
      return { state: true, balance: acc?.Balance ?? 0 } as T
    }

    case 'Bank:Transfer': {
      const acc    = ACCOUNTS.find(a => a.Account === data.account)
      const amount = data.amount as number
      if (acc) acc.Balance -= amount
      return { state: true, balance: acc?.Balance ?? 0 } as T
    }

    case 'Bank:Register': {
      const newAcc: Account = {
        Account: String(_nextAccount++),
        Balance: 0,
        Type: 'personal_savings',
        Owner: 100,
        Name: data.name as string,
        Permissions: { MANAGE: true, BALANCE: true, WITHDRAW: true, DEPOSIT: true, TRANSACTIONS: true, BILL: false },
        JointOwners: [],
      }
      ACCOUNTS.push(newAcc)
      return newAcc as T
    }

    case 'Bank:Rename': {
      const acc = ACCOUNTS.find(a => a.Account === data.account)
      if (acc) acc.Name = data.name as string
      return true as T
    }

    case 'Bank:AddJoint': {
      const acc = ACCOUNTS.find(a => a.Account === data.account)
      if (acc) acc.JointOwners.push(data.target as number)
      return true as T
    }

    case 'Bank:RemoveJoint': {
      const acc = ACCOUNTS.find(a => a.Account === data.account)
      if (acc) acc.JointOwners = acc.JointOwners.filter(o => o !== data.target)
      return true as T
    }

    default:
      return {} as T
  }
}
