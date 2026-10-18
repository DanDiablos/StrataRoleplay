import { Wallet, PiggyBank, Building2 } from 'lucide-react'
import type { Account } from '../store.ts'

const formatCurrency = (n: number) => '$' + Math.floor(n).toLocaleString('en-US')

const ICONS = {
  personal:          Wallet,
  personal_savings:  PiggyBank,
  organization:      Building2,
}

interface Props {
  account: Account
  isSelected: boolean
  onClick: () => void
}

export default function AccountButton({ account, isSelected, onClick }: Props): React.ReactElement {
  const Icon = ICONS[account.Type] ?? Wallet

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-3 cursor-pointer transition-colors border-b border-white/[0.04] last:border-0 border-l-[3px] ${
        isSelected
          ? 'border-l-primary bg-primary/5'
          : 'border-l-transparent hover:bg-menu-surface-lt'
      }`}
    >
      <div className={`w-8 h-8 flex items-center justify-center shrink-0 border ${
        isSelected ? 'border-primary/30 bg-primary/10' : 'border-white/10 bg-white/5'
      }`}>
        <Icon size={13} className={isSelected ? 'text-primary' : 'text-white/40'} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-[0.82rem] text-white/80 truncate">{account.Name}</div>
        <div className={`font-mono text-[0.7rem] ${account.Permissions.BALANCE ? 'text-menu-success-lt' : 'text-white/25'}`}>
          {account.Permissions.BALANCE ? formatCurrency(account.Balance) : '???'}
        </div>
      </div>
    </div>
  )
}
