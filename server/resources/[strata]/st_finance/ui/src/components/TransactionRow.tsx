import { useState } from 'react'
import {
  ArrowDownLeft, ArrowUpRight, ArrowLeftRight,
  AlertTriangle, BadgeCheck, Receipt, Banknote, HelpCircle,
} from 'lucide-react'
import Modal from './Modal.tsx'
import type { Transaction } from '../store.ts'

const formatCurrency = (n: number) => '$' + Math.floor(n).toLocaleString('en-US')
const formatDate = (ts: number) =>
  new Date(ts * 1000).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  })

const CREDIT_TYPES = new Set(['deposit', 'fine_profit', 'paycheck'])

interface TxStyle {
  Icon: React.ComponentType<{ size?: number; className?: string }>
  color: string
  bg: string
}

const TX_STYLE: Record<string, TxStyle> = {
  deposit:     { Icon: ArrowDownLeft,  color: 'text-menu-success-lt', bg: 'bg-menu-success/15 border-menu-success/25' },
  withdraw:    { Icon: ArrowUpRight,   color: 'text-red-400',         bg: 'bg-menu-error/15 border-menu-error-lt/25' },
  transfer:    { Icon: ArrowLeftRight, color: 'text-menu-warning',    bg: 'bg-menu-warning/10 border-menu-warning/25' },
  fine:        { Icon: AlertTriangle,  color: 'text-red-400',         bg: 'bg-menu-error/15 border-menu-error-lt/25' },
  fine_profit: { Icon: BadgeCheck,     color: 'text-menu-success-lt', bg: 'bg-menu-success/15 border-menu-success/25' },
  bill:        { Icon: Receipt,        color: 'text-red-400',         bg: 'bg-menu-error/15 border-menu-error-lt/25' },
  paycheck:    { Icon: Banknote,       color: 'text-menu-success-lt', bg: 'bg-menu-success/15 border-menu-success/25' },
}

const DEFAULT_STYLE: TxStyle = { Icon: HelpCircle, color: 'text-white/30', bg: 'bg-white/5 border-white/10' }

interface Props {
  transaction: Transaction
}

export default function TransactionRow({ transaction }: Props): React.ReactElement {
  const [viewing, setViewing] = useState(false)
  const { Icon, color, bg } = TX_STYLE[transaction.Type] ?? DEFAULT_STYLE
  const isCredit = CREDIT_TYPES.has(transaction.Type)

  return (
    <>
      <div
        onClick={() => setViewing(true)}
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-menu-surface-lt transition-colors border-b border-white/[0.04] last:border-0"
      >
        <div className={`w-7 h-7 flex items-center justify-center shrink-0 border ${bg}`}>
          <Icon size={13} className={color} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-[0.82rem] text-white/80 truncate">{transaction.Title}</div>
          <div className="font-mono text-[0.67rem] text-white/30">{formatDate(transaction.Timestamp)}</div>
        </div>
        <div className="text-right shrink-0">
          <div className={`font-mono text-[0.82rem] font-medium ${isCredit ? 'text-menu-success-lt' : 'text-red-400'}`}>
            {isCredit ? '+' : '-'}{formatCurrency(transaction.Amount)}
          </div>
          {transaction.Description && (
            <div className="font-mono text-[0.67rem] text-white/25 max-w-[180px] truncate">
              {transaction.Description}
            </div>
          )}
        </div>
      </div>

      <Modal open={viewing} title="Transaction Details" onClose={() => setViewing(false)}>
        <div className="flex flex-col -my-1">
          {([
            ['Title',       transaction.Title],
            ['Type',        transaction.Type],
            ['Amount',      (isCredit ? '+' : '-') + formatCurrency(transaction.Amount)],
            ['Date',        formatDate(transaction.Timestamp)],
            ['Description', transaction.Description || 'No description'],
          ] as [string, string][]).map(([label, value]) => (
            <div key={label} className="flex items-start py-[9px] border-b border-white/[0.06] last:border-0">
              <span className="w-[110px] shrink-0 font-mono text-[0.68rem] uppercase tracking-[0.05em] text-white/40">{label}</span>
              <span className="font-mono text-[0.75rem] text-white/80">{value}</span>
            </div>
          ))}
        </div>
      </Modal>
    </>
  )
}
