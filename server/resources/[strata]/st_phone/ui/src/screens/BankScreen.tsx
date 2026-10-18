import React, { useState, useEffect, useCallback } from 'react'
import { Landmark, ArrowUpRight, ArrowDownLeft, Receipt, ChevronLeft, Send, DollarSign, Wallet, Building2, PiggyBank, ChevronRight } from 'lucide-react'
import { useStore } from '../store'
import { sendNui } from '../nui'

interface Account {
  Account: number
  Name: string
  Balance: number
  Type: string
  Owner: string
  Permissions: Record<string, boolean>
  JointOwners?: string[]
}

interface Bill {
  Id: number
  Name: string
  Amount: number
  Description?: string
  Timestamp?: number
}

interface Transaction {
  Type: string
  Account: number
  Title: string
  Timestamp: number
  Amount: number
  Description: string
}

type View = 'main' | 'account' | 'transfer' | 'bills' | 'transactions'

function accountIcon(type: string) {
  if (type === 'personal_savings') return <PiggyBank size={13} className="text-[#27ae60]" />
  if (type === 'organization') return <Building2 size={13} className="text-[#3498db]" />
  return <Wallet size={13} className="text-[#27ae60]" />
}

function accountLabel(a: Account): string {
  if (a.Type === 'personal') return 'Checking'
  if (a.Type === 'personal_savings') return a.Name || 'Savings'
  return a.Name || 'Organization'
}

export default function BankScreen(): React.ReactElement {
  const pushAlert = useStore((s) => s.pushAlert)

  const [view, setView] = useState<View>('main')
  const [accounts, setAccounts] = useState<Account[]>([])
  const [bills, setBills] = useState<Bill[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Account | null>(null)
  const [transferData, setTransferData] = useState({ target: '', amount: '', description: '' })
  const [txPage, setTxPage] = useState(1)
  const [txHasMore, setTxHasMore] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const res = await sendNui('Banking:GetData', {})
      const data = await res.json()
      if (Array.isArray(data?.accounts)) setAccounts(data.accounts)
      else if (Array.isArray(data)) setAccounts(data)
      if (Array.isArray(data?.pendingBills)) setBills(data.pendingBills)
    } catch { /* noop */ }
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const openAccount = (a: Account) => { setSelected(a); setView('account') }

  const openTransfer = () => {
    setTransferData({ target: '', amount: '', description: '' })
    setView('transfer')
  }

  const handleTransfer = async () => {
    if (!selected || !transferData.target || !transferData.amount) return
    try {
      const res = await sendNui('Banking:Transfer', {
        action: 'TRANSFER',
        account: selected.Account,
        target: transferData.target,
        targetType: true,
        amount: Number(transferData.amount),
        description: transferData.description || undefined,
      })
      const result = await res.json()
      if (result) {
        pushAlert('Transfer sent')
        fetchData()
      } else {
        pushAlert('Transfer failed')
      }
    } catch {
      pushAlert('Transfer failed')
    }
    setView('account')
  }

  const handleAcceptBill = async (bill: Bill) => {
    try {
      const res = await sendNui('Banking:AcceptBill', { bill: bill.Id })
      const result = await res.json()
      if (result) {
        setBills((prev) => prev.filter((b) => b.Id !== bill.Id))
        pushAlert('Bill paid')
        fetchData()
      } else {
        pushAlert('Payment failed — insufficient funds')
      }
    } catch {
      pushAlert('Payment failed')
    }
  }

  const handleDismissBill = (bill: Bill) => {
    sendNui('Banking:DismissBill', { bill: bill.Id })
    setBills((prev) => prev.filter((b) => b.Id !== bill.Id))
  }

  const loadTransactions = async (acct: Account, page: number) => {
    setView('transactions')
    setTxPage(page)
    try {
      const res = await sendNui('Banking:GetTransactions', { account: acct.Account, perPage: 20, page })
      const data = await res.json()
      if (data?.data && Array.isArray(data.data)) {
        setTransactions(data.data)
        setTxHasMore(data.more === true)
      }
    } catch { /* noop */ }
  }

  const totalBalance = accounts.reduce((s, a) => s + (a.Balance ?? 0), 0)
  const checking = accounts.find((a) => a.Type === 'personal')

  /* ── Transfer ───────────────────────── */
  if (view === 'transfer' && selected) {
    return (
      <SubPage title="Transfer" onBack={() => setView('account')}>
        <div className="px-4 py-4 flex flex-col gap-3">
          <div className="px-3 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg">
            <span className="text-[0.55rem] text-white/30 uppercase tracking-wider">From</span>
            <span className="block text-[0.72rem] font-medium text-white/70 mt-0.5">{accountLabel(selected)}</span>
            <span className="font-mono text-[0.6rem] text-white/40">${selected.Balance?.toLocaleString()}</span>
          </div>
          <label className="flex flex-col gap-1">
            <span className="text-[0.6rem] font-medium text-white/40 uppercase tracking-wider">Recipient State ID</span>
            <input
              type="text"
              value={transferData.target}
              onChange={(e) => setTransferData({ ...transferData, target: e.target.value })}
              placeholder="State ID..."
              className="h-9 px-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-[0.8rem] text-white/80 placeholder-white/25 focus:border-primary/40 transition-colors font-mono"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[0.6rem] font-medium text-white/40 uppercase tracking-wider">Amount</span>
            <input
              type="number"
              value={transferData.amount}
              onChange={(e) => setTransferData({ ...transferData, amount: e.target.value })}
              placeholder="$0"
              className="h-9 px-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-[0.8rem] text-white/80 placeholder-white/25 focus:border-primary/40 transition-colors font-mono"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[0.6rem] font-medium text-white/40 uppercase tracking-wider">Description</span>
            <input
              type="text"
              value={transferData.description}
              onChange={(e) => setTransferData({ ...transferData, description: e.target.value })}
              placeholder="Optional..."
              className="h-9 px-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-[0.8rem] text-white/80 placeholder-white/25 focus:border-primary/40 transition-colors"
            />
          </label>
          <button
            onClick={handleTransfer}
            className="h-9 rounded-lg bg-[#268f3a]/20 border border-[#268f3a]/30 text-[#268f3a] text-[0.75rem] font-semibold uppercase tracking-wider hover:bg-[#268f3a]/30 transition-colors"
          >
            Send Transfer
          </button>
        </div>
      </SubPage>
    )
  }

  /* ── Bills ──────────────────────────── */
  if (view === 'bills') {
    return (
      <SubPage title="Bills" onBack={() => setView('main')}>
        {bills.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2">
            <Receipt size={28} className="text-white/20" />
            <span className="font-mono text-[0.65rem] text-white/20 uppercase tracking-[0.08em]">No bills</span>
          </div>
        ) : (
          bills.map((b) => (
            <div key={b.Id} className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.03]">
              <div className="flex-1 min-w-0">
                <span className="text-[0.72rem] font-medium text-white/70">{b.Name || 'Bill'}</span>
                {b.Description && <p className="text-[0.6rem] text-white/35 truncate">{b.Description}</p>}
              </div>
              <span className="font-mono text-[0.72rem] text-red-400/70 shrink-0">${b.Amount?.toLocaleString()}</span>
              <div className="flex gap-1">
                <button onClick={() => handleAcceptBill(b)} className="px-2 py-1 rounded text-[0.55rem] font-medium bg-menu-success/15 text-menu-success-lt/70 hover:bg-menu-success/25 transition-colors">Pay</button>
                <button onClick={() => handleDismissBill(b)} className="px-2 py-1 rounded text-[0.55rem] font-medium bg-menu-error/15 text-red-400/60 hover:bg-menu-error/25 transition-colors">Dismiss</button>
              </div>
            </div>
          ))
        )}
      </SubPage>
    )
  }

  /* ── Transactions ───────────────────── */
  if (view === 'transactions' && selected) {
    return (
      <SubPage title="Transactions" onBack={() => setView('account')}>
        {transactions.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2">
            <DollarSign size={28} className="text-white/20" />
            <span className="font-mono text-[0.65rem] text-white/20 uppercase tracking-[0.08em]">No transactions</span>
          </div>
        ) : (
          <>
            {transactions.map((t, i) => {
              const isCredit = t.Type === 'deposit' || t.Type === 'transfer' || t.Type === 'paycheck' || t.Type === 'bill'
              return (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5 border-b border-white/[0.03]">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center ${isCredit ? 'bg-menu-success/15' : 'bg-menu-error/15'}`}>
                    {isCredit ? <ArrowDownLeft size={12} className="text-menu-success-lt/70" /> : <ArrowUpRight size={12} className="text-red-400/60" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[0.68rem] font-medium text-white/65 truncate block">{t.Title}</span>
                    {t.Description && <span className="text-[0.55rem] text-white/30 truncate block">{t.Description}</span>}
                    <span className="font-mono text-[0.5rem] text-white/20">
                      {new Date(t.Timestamp * 1000).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <span className={`font-mono text-[0.72rem] shrink-0 ${isCredit ? 'text-menu-success-lt/70' : 'text-red-400/60'}`}>
                    {isCredit ? '+' : '-'}${Math.abs(t.Amount).toLocaleString()}
                  </span>
                </div>
              )
            })}
            <div className="flex items-center justify-center gap-3 py-3">
              {txPage > 1 && (
                <button onClick={() => loadTransactions(selected, txPage - 1)} className="px-3 py-1.5 text-[0.6rem] font-medium bg-white/[0.04] text-white/50 hover:bg-white/[0.08] transition-colors rounded">
                  Previous
                </button>
              )}
              <span className="font-mono text-[0.55rem] text-white/25">Page {txPage}</span>
              {txHasMore && (
                <button onClick={() => loadTransactions(selected, txPage + 1)} className="px-3 py-1.5 text-[0.6rem] font-medium bg-white/[0.04] text-white/50 hover:bg-white/[0.08] transition-colors rounded">
                  Next
                </button>
              )}
            </div>
          </>
        )}
      </SubPage>
    )
  }

  /* ── Account detail ─────────────────── */
  if (view === 'account' && selected) {
    return (
      <SubPage title={accountLabel(selected)} onBack={() => { setSelected(null); setView('main') }}>
        <div className="mx-4 mt-3 p-4 rounded-xl bg-gradient-to-br from-[#268f3a]/15 to-[#268f3a]/5 border border-[#268f3a]/20">
          <span className="text-[0.55rem] font-medium text-white/35 uppercase tracking-wider block mb-0.5">Balance</span>
          <span className="font-mono text-[1.3rem] font-bold text-white/90">${selected.Balance?.toLocaleString()}</span>
          <span className="font-mono text-[0.5rem] text-white/25 block mt-1">Account #{selected.Account}</span>
        </div>

        <div className="px-4 mt-3 flex flex-col gap-1">
          {selected.Permissions?.WITHDRAW && (
            <ActionRow icon={<Send size={13} />} label="Transfer" onClick={openTransfer} />
          )}
          {selected.Permissions?.TRANSACTIONS && (
            <ActionRow icon={<DollarSign size={13} />} label="Transactions" onClick={() => loadTransactions(selected, 1)} />
          )}
        </div>

        {selected.JointOwners && selected.JointOwners.length > 0 && (
          <div className="mx-4 mt-3">
            <span className="text-[0.55rem] font-medium text-white/30 uppercase tracking-wider block mb-1.5">Joint Owners</span>
            {selected.JointOwners.map((sid) => (
              <div key={sid} className="flex items-center gap-2 px-3 py-2 bg-white/[0.02] border-b border-white/[0.04]">
                <span className="font-mono text-[0.65rem] text-white/50">SID {sid}</span>
              </div>
            ))}
          </div>
        )}
      </SubPage>
    )
  }

  /* ── Main ───────────────────────────── */
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="shrink-0 px-4 py-3 bg-black/30 border-b border-white/[0.06]">
        <div className="flex items-center gap-1.5">
          <Landmark size={14} className="text-[#27ae60]" />
          <span className="font-display font-bold uppercase tracking-[0.1em] text-[0.72rem] text-white/70">Maze Bank</span>
        </div>
      </div>

      {/* Balance card */}
      <div className="mx-4 mt-4 p-4 rounded-xl bg-gradient-to-br from-[#268f3a]/15 to-[#268f3a]/5 border border-[#268f3a]/20">
        <span className="text-[0.6rem] font-medium text-white/40 uppercase tracking-wider block mb-1">Total Balance</span>
        <span className="font-mono text-[1.4rem] font-bold text-white/90">
          ${loading ? '—' : totalBalance.toLocaleString()}
        </span>
      </div>

      {/* Accounts */}
      <div className="px-4 mt-4 flex flex-col gap-1">
        <span className="text-[0.55rem] font-medium text-white/30 uppercase tracking-wider mb-0.5">Accounts</span>
        {accounts.map((a) => (
          <button
            key={a.Account}
            onClick={() => openAccount(a)}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.04] hover:bg-white/[0.06] transition-colors"
          >
            {accountIcon(a.Type)}
            <span className="flex-1 text-left text-[0.72rem] font-medium text-white/60">{accountLabel(a)}</span>
            <span className="font-mono text-[0.72rem] text-white/80">${a.Balance?.toLocaleString()}</span>
            <ChevronRight size={12} className="text-white/20" />
          </button>
        ))}
      </div>

      {/* Quick actions */}
      <div className="px-4 mt-4 flex flex-col gap-1">
        <span className="text-[0.55rem] font-medium text-white/30 uppercase tracking-wider mb-0.5">Quick Actions</span>
        {checking && (
          <ActionRow icon={<Send size={13} />} label="Transfer" onClick={() => { setSelected(checking); openTransfer() }} />
        )}
        <ActionRow icon={<Receipt size={13} />} label={`Bills${bills.length > 0 ? ` (${bills.length})` : ''}`} onClick={() => setView('bills')} />
      </div>
    </div>
  )
}

function SubPage({ title, onBack, children }: { title: string; onBack: () => void; children: React.ReactNode }): React.ReactElement {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="shrink-0 flex items-center gap-2 px-3 py-3 bg-black/30 border-b border-white/[0.06]">
        <button onClick={onBack} className="text-white/40 hover:text-white/70 transition-colors"><ChevronLeft size={16} /></button>
        <span className="font-display font-bold uppercase tracking-[0.1em] text-[0.72rem] text-white/70">{title}</span>
      </div>
      <div className="flex-1 overflow-y-auto flex flex-col">{children}</div>
    </div>
  )
}

function ActionRow({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }): React.ReactElement {
  return (
    <button onClick={onClick} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] transition-colors">
      <span className="text-white/40">{icon}</span>
      <span className="text-[0.72rem] font-medium text-white/65">{label}</span>
    </button>
  )
}
