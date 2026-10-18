import { useState, useEffect } from 'react'
import { Pencil, Users, ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from 'lucide-react'
import { useStore, type Account, type Transaction } from '../store.ts'
import { sendNui } from '../nui.ts'
import TransactionRow from './TransactionRow.tsx'
import DepositModal from './modals/DepositModal.tsx'
import WithdrawModal from './modals/WithdrawModal.tsx'
import TransferModal from './modals/TransferModal.tsx'
import RenameModal from './modals/RenameModal.tsx'
import JointOwnersModal from './modals/JointOwnersModal.tsx'

const formatCurrency = (n: number) => '$' + Math.floor(n).toLocaleString('en-US')

const TYPE_LABELS: Record<string, string> = {
  personal:          'Checking',
  personal_savings:  'Savings',
  organization:      'Organization',
}

interface Props {
  account: Account
}

export default function AccountDetail({ account }: Props): React.ReactElement {
  const character = useStore(s => s.character)

  const [transactions,     setTransactions]     = useState<Transaction[]>([])
  const [moreTransactions, setMoreTransactions] = useState(false)
  const [txLoading,        setTxLoading]        = useState(account.Permissions.TRANSACTIONS)

  const [depositing,     setDepositing]     = useState(false)
  const [withdrawing,    setWithdrawing]    = useState(false)
  const [transferring,   setTransferring]   = useState(false)
  const [renaming,       setRenaming]       = useState(false)
  const [managingOwners, setManagingOwners] = useState(false)

  useEffect(() => {
    setTransactions([])
    setMoreTransactions(false)

    if (!account.Permissions.TRANSACTIONS) {
      setTxLoading(false)
      return
    }

    let cancelled = false
    setTxLoading(true)

    sendNui<{ data: Transaction[]; more: boolean }>('Bank:GetTransactions', {
      account: account.Account, offset: 0, perPage: 15,
    }).then(res => {
      if (cancelled) return
      if (res.data) {
        setTransactions(res.data)
        setMoreTransactions(res.more)
      }
    }).finally(() => {
      if (!cancelled) setTxLoading(false)
    })

    return () => { cancelled = true }
  }, [account.Account])

  const loadMore = async () => {
    if (txLoading) return
    setTxLoading(true)
    const res = await sendNui<{ data: Transaction[]; more: boolean }>('Bank:GetTransactions', {
      account: account.Account, offset: transactions.length, perPage: 15,
    })
    if (res.data) {
      setTransactions(prev => [...prev, ...res.data])
      setMoreTransactions(res.more)
    }
    setTxLoading(false)
  }

  const prependTransaction = (tx: Transaction) => {
    setTransactions(prev => [tx, ...prev.slice(0, 14)])
  }

  const canDeposit   = account.Permissions.DEPOSIT
  const canWithdraw  = account.Permissions.WITHDRAW && account.Balance > 0
  const canTransfer  = account.Permissions.WITHDRAW && account.Balance > 0
  const canRename    = account.Type !== 'organization' && account.Permissions.MANAGE
  const canManageOwners = account.Type === 'personal_savings'
    && account.Owner === character?.SID
    && account.Permissions.MANAGE

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/[0.06] shrink-0">
        <h2 className="font-display font-bold text-[1.05rem] text-white/90 truncate">{account.Name}</h2>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="font-mono text-[0.67rem] text-white/35 uppercase tracking-[0.05em]">
            {TYPE_LABELS[account.Type] ?? account.Type}
          </span>
          <span className="text-white/15">·</span>
          <span className="font-mono text-[0.67rem] text-white/35">#{account.Account}</span>
        </div>
      </div>

      {/* Balance row */}
      <div className="px-5 py-3.5 border-b border-white/[0.06] shrink-0 flex items-end gap-6">
        <div>
          <div className="font-mono text-[0.65rem] uppercase tracking-[0.06em] text-white/35 mb-1">Available Balance</div>
          <div className={`font-mono text-[1.5rem] font-medium leading-none ${
            account.Permissions.BALANCE ? 'text-menu-success-lt' : 'text-white/30'
          }`}>
            {account.Permissions.BALANCE ? formatCurrency(account.Balance) : '???'}
          </div>
        </div>
        {character && (
          <div className="ml-auto text-right">
            <div className="font-mono text-[0.65rem] uppercase tracking-[0.06em] text-white/35 mb-1">Cash on Hand</div>
            <div className="font-mono text-[1rem] text-white/55 leading-none">{formatCurrency(character.Cash)}</div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 py-2.5 border-b border-white/[0.06] shrink-0 flex items-center gap-2 flex-wrap">
        {canRename && (
          <button
            onClick={() => setRenaming(true)}
            className="flex items-center gap-1.5 px-[14px] py-[5px] border border-white/10 bg-white/5 text-white/55 hover:bg-primary/10 hover:border-primary/35 hover:text-[#FF8C42] text-[0.78rem] font-semibold uppercase tracking-[0.06em] transition-colors"
          >
            <Pencil size={11} /> Rename
          </button>
        )}
        {canManageOwners && (
          <button
            onClick={() => setManagingOwners(true)}
            className="flex items-center gap-1.5 px-[14px] py-[5px] border border-white/10 bg-white/5 text-white/55 hover:bg-primary/10 hover:border-primary/35 hover:text-[#FF8C42] text-[0.78rem] font-semibold uppercase tracking-[0.06em] transition-colors"
          >
            <Users size={11} /> Joint Owners
          </button>
        )}

        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => setDepositing(true)}
            disabled={!canDeposit}
            className="flex items-center gap-1.5 px-[14px] py-[5px] border border-primary/35 bg-primary/8 text-[#FF8C42] hover:bg-primary/15 text-[0.78rem] font-semibold uppercase tracking-[0.06em] transition-colors disabled:opacity-30 disabled:pointer-events-none"
          >
            <ArrowDownLeft size={11} /> Deposit
          </button>
          <button
            onClick={() => setWithdrawing(true)}
            disabled={!canWithdraw}
            className="flex items-center gap-1.5 px-[14px] py-[5px] border border-white/10 bg-white/5 text-white/55 hover:bg-white/10 text-[0.78rem] font-semibold uppercase tracking-[0.06em] transition-colors disabled:opacity-30 disabled:pointer-events-none"
          >
            <ArrowUpRight size={11} /> Withdraw
          </button>
          <button
            onClick={() => setTransferring(true)}
            disabled={!canTransfer}
            className="flex items-center gap-1.5 px-[14px] py-[5px] border border-white/10 bg-white/5 text-white/55 hover:bg-white/10 text-[0.78rem] font-semibold uppercase tracking-[0.06em] transition-colors disabled:opacity-30 disabled:pointer-events-none"
          >
            <ArrowLeftRight size={11} /> Transfer
          </button>
        </div>
      </div>

      {/* Transactions */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <div className="px-4 py-2 bg-menu-surface-lt border-b border-white/[0.06] shrink-0">
          <span className="font-display font-bold uppercase tracking-[0.12em] text-[0.68rem] text-white/40">
            Recent Transactions
          </span>
        </div>

        {!account.Permissions.TRANSACTIONS ? (
          <div className="flex-1 flex items-center justify-center">
            <span className="font-mono text-[0.72rem] text-white/20 uppercase tracking-[0.06em]">
              No transaction access
            </span>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {txLoading && transactions.length === 0 ? (
              <div className="flex items-center justify-center h-32">
                <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            ) : transactions.length > 0 ? (
              <>
                {transactions.map((t, i) => (
                  <TransactionRow key={`${account.Account}-${i}`} transaction={t} />
                ))}
                {moreTransactions && transactions.length < 100 && (
                  <button
                    onClick={loadMore} disabled={txLoading}
                    className="w-full py-3 font-mono text-[0.7rem] uppercase tracking-[0.06em] text-white/30 hover:text-white/60 hover:bg-menu-surface-lt transition-colors border-t border-white/[0.04] disabled:opacity-40"
                  >
                    {txLoading ? 'Loading…' : 'Load More'}
                  </button>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-32">
                <span className="font-mono text-[0.72rem] text-white/20 uppercase tracking-[0.06em]">
                  No recent transactions
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {depositing     && <DepositModal     account={account} onClose={() => setDepositing(false)}     onTransaction={prependTransaction} />}
      {withdrawing    && <WithdrawModal    account={account} onClose={() => setWithdrawing(false)}    onTransaction={prependTransaction} />}
      {transferring   && <TransferModal    account={account} onClose={() => setTransferring(false)}   onTransaction={prependTransaction} />}
      {renaming       && <RenameModal      account={account} onClose={() => setRenaming(false)} />}
      {managingOwners && <JointOwnersModal account={account} onClose={() => setManagingOwners(false)} />}
    </div>
  )
}
