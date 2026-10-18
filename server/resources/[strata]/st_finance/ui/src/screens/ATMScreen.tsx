import { useEffect, useState } from 'react'
import { X, ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { useStore } from '../store.ts'
import { sendNui } from '../nui.ts'
import AccountButton from '../components/AccountButton.tsx'
import DepositModal from '../components/modals/DepositModal.tsx'
import WithdrawModal from '../components/modals/WithdrawModal.tsx'
import type { Account, Transaction } from '../store.ts'

const BRAND_LABELS: Record<string, string> = {
  fleeca:   'Fleeca',
  maze:     'Maze Bank',
  blaineco: 'Blaine Co.',
}

const formatCurrency = (n: number) => '$' + Math.floor(n).toLocaleString('en-US')

const TYPE_LABELS: Record<string, string> = {
  personal:         'Checking',
  personal_savings: 'Savings',
  organization:     'Organization',
}

export default function ATMScreen(): React.ReactElement {
  const brand         = useStore(s => s.brand)
  const accounts      = useStore(s => s.accounts)
  const selectedId    = useStore(s => s.selectedAccount)
  const selectAccount = useStore(s => s.selectAccount)
  const dispatch      = useStore(s => s.dispatch)
  const addToast      = useStore(s => s.addToast)

  const [loading, setLoading] = useState(true)

  const [depositing,  setDepositing]  = useState(false)
  const [withdrawing, setWithdrawing] = useState(false)

  useEffect(() => {
    sendNui<{ accounts: Account[] }>('Bank:Fetch', {}).then(res => {
      if (res?.accounts) {
        dispatch('SET_DATA', { type: 'accounts', data: res.accounts as unknown as Record<string, unknown> })
      } else {
        addToast('error', 'Error loading accounts')
      }
    }).catch(() => {
      addToast('error', 'Error loading accounts')
    }).finally(() => setLoading(false))
  }, [])

  const selectedAccount = accounts.find(a => a.Account === selectedId) ?? null

  const handleClose = () => {
    dispatch('APP_HIDE')
    sendNui('Close').catch(() => {})
  }

  const noopTransaction = (_tx: Transaction) => {}

  return (
    <div className="w-[400px] flex flex-col bg-menu-bg border border-white/[0.08]">
      {/* Titlebar */}
      <div className="h-[52px] flex items-center px-4 shrink-0 bg-[#0a0a0a] border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <span
            className="font-display font-black tracking-[0.1em] text-[1.1rem]"
            style={{ background: 'linear-gradient(90deg, #FF5C3A, #FF8C42)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            STRATA
          </span>
          <span className="font-mono text-[0.68rem] text-white/30">
            / ATM · {BRAND_LABELS[brand] ?? 'ATM'}
          </span>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <span className="font-mono text-[0.65rem] text-white/15 uppercase tracking-[0.5px]">ESC</span>
          <button
            onClick={handleClose}
            className="w-7 h-7 flex items-center justify-center border border-white/10 bg-white/5 text-white/30 hover:text-white/70 hover:border-white/25 transition-colors"
          >
            <X size={12} />
          </button>
        </div>
      </div>

      {/* Account list */}
      <div className="border-b border-white/[0.06] bg-menu-surface max-h-[220px] overflow-y-auto">
        <div className="px-3 py-1.5 border-b border-white/[0.04]">
          <span className="font-display font-bold uppercase tracking-[0.12em] text-[0.65rem] text-white/25">
            Accounts
          </span>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-16">
            <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : accounts.length > 0 ? (
          accounts.map(a => (
            <AccountButton
              key={a.Account} account={a}
              isSelected={selectedId === a.Account}
              onClick={() => selectAccount(selectedId === a.Account ? null : a.Account)}
            />
          ))
        ) : (
          <div className="flex items-center justify-center h-16">
            <span className="font-mono text-[0.7rem] text-white/20 uppercase tracking-[0.06em]">No accounts</span>
          </div>
        )}
      </div>

      {/* Account detail */}
      {selectedAccount && (
        <div className="bg-menu-surface">
          {/* Info */}
          <div className="px-4 py-4 border-b border-white/[0.06]">
            <div className="font-display font-bold text-[0.95rem] text-white/85 truncate">{selectedAccount.Name}</div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono text-[0.67rem] text-white/35 uppercase tracking-[0.05em]">
                {TYPE_LABELS[selectedAccount.Type] ?? selectedAccount.Type}
              </span>
              <span className="text-white/15">·</span>
              <span className="font-mono text-[0.67rem] text-white/35">#{selectedAccount.Account}</span>
            </div>
            <div className={`font-mono text-[1.3rem] font-medium mt-2 leading-none ${
              selectedAccount.Permissions.BALANCE ? 'text-menu-success-lt' : 'text-white/30'
            }`}>
              {selectedAccount.Permissions.BALANCE ? formatCurrency(selectedAccount.Balance) : '???'}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 p-4">
            <button
              onClick={() => setDepositing(true)}
              disabled={!selectedAccount.Permissions.DEPOSIT}
              className="flex-1 flex items-center justify-center gap-2 py-3 border border-primary/35 bg-primary/8 text-[#FF8C42] hover:bg-primary/15 text-[0.82rem] font-semibold uppercase tracking-[0.06em] transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
              <ArrowDownLeft size={14} /> Deposit
            </button>
            <button
              onClick={() => setWithdrawing(true)}
              disabled={!selectedAccount.Permissions.WITHDRAW || selectedAccount.Balance === 0}
              className="flex-1 flex items-center justify-center gap-2 py-3 border border-white/10 bg-white/5 text-white/55 hover:bg-white/10 text-[0.82rem] font-semibold uppercase tracking-[0.06em] transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
              <ArrowUpRight size={14} /> Withdraw
            </button>
          </div>
        </div>
      )}

      {depositing  && selectedAccount && (
        <DepositModal  account={selectedAccount} onClose={() => setDepositing(false)}  onTransaction={noopTransaction} />
      )}
      {withdrawing && selectedAccount && (
        <WithdrawModal account={selectedAccount} onClose={() => setWithdrawing(false)} onTransaction={noopTransaction} />
      )}
    </div>
  )
}
