import { create } from 'zustand'

export interface Character {
  ID: number
  SID: number
  First: string
  Last: string
  Cash: number
}

export interface AccountPermissions {
  MANAGE: boolean
  BALANCE: boolean
  WITHDRAW: boolean
  DEPOSIT: boolean
  TRANSACTIONS: boolean
  BILL: boolean
}

export interface Account {
  Account: string
  Balance: number
  Type: 'personal' | 'personal_savings' | 'organization'
  Owner: number
  Name: string
  Permissions: AccountPermissions
  JointOwners: number[]
}

export interface Transaction {
  Type: string
  Amount: number
  Account: string
  Title: string
  Description: string
  Timestamp: number
  TransactionAccount: string | false
  Data: { character: number }
}

export interface ToastItem {
  id: number
  type: 'success' | 'error'
  message: string
}

let _toastId = 0

interface AppStore {
  hidden: boolean
  appMode: 'BANK' | 'ATM'
  brand: string
  character: Character | null
  accounts: Account[]
  selectedAccount: string | null
  toasts: ToastItem[]

  dispatch: (type: string, payload?: Record<string, unknown>) => void
  selectAccount: (id: string | null) => void
  updateAccount: (id: string, data: Account) => void
  addAccount: (account: Account) => void
  updateCash: (cash: number) => void
  addToast: (type: 'success' | 'error', message: string) => void
  removeToast: (id: number) => void
}

export const useStore = create<AppStore>((set, get) => ({
  hidden: !import.meta.env.DEV,
  appMode: 'BANK',
  brand: 'fleeca',
  character: import.meta.env.DEV
    ? { ID: 1, SID: 100, First: 'Dev', Last: 'User', Cash: 5000 }
    : null,
  accounts: [],
  selectedAccount: null,
  toasts: [],

  dispatch: (type, payload = {}) => {
    switch (type) {
      case 'SET_APP':
        set({
          hidden: false,
          appMode: (payload.app as 'BANK' | 'ATM') ?? 'BANK',
          brand: (payload.brand as string) ?? 'fleeca',
          selectedAccount: null,
        })
        break
      case 'APP_HIDE':
        set({ hidden: true, selectedAccount: null })
        break
      case 'SET_DATA': {
        const t = payload.type as string
        if (t === 'character') {
          set({ character: payload.data as unknown as Character })
        } else if (t === 'accounts') {
          set({ accounts: payload.data as unknown as Account[] })
        }
        break
      }
    }
  },

  selectAccount: (id) => set({ selectedAccount: id }),

  updateAccount: (id, data) =>
    set(s => ({ accounts: s.accounts.map(a => a.Account === id ? data : a) })),

  addAccount: (account) =>
    set(s => ({ accounts: [...s.accounts, account] })),

  updateCash: (cash) =>
    set(s => s.character ? { character: { ...s.character, Cash: cash } } : {}),

  addToast: (type, message) => {
    const id = ++_toastId
    set(s => ({ toasts: [...s.toasts, { id, type, message }] }))
    setTimeout(() => get().removeToast(id), 3500)
  },

  removeToast: (id) =>
    set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),
}))
