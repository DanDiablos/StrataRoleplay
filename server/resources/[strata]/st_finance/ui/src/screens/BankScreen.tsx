import { useEffect, useState } from 'react'
import { X, Plus } from 'lucide-react'
import { useStore } from '../store.ts'
import { sendNui } from '../nui.ts'
import AccountButton from '../components/AccountButton.tsx'
import AccountDetail from '../components/AccountDetail.tsx'
import CreateAccountModal from '../components/modals/CreateAccountModal.tsx'
import type { Account } from '../store.ts'

const BRAND_LABELS: Record<string, string> = {
  fleeca:   'Fleeca Bank',
  maze:     'Maze Bank',
  blaineco: 'Blaine County Savings',
}

function SectionLabel({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <div className="px-3 py-1.5 border-b border-white/[0.04]">
      <span className="font-display font-bold uppercase tracking-[0.12em] text-[0.65rem] text-white/25">
        {children}
      </span>
    </div>
  )
}

export default function BankScreen(): React.ReactElement {
  const brand          = useStore(s => s.brand)
  const character      = useStore(s => s.character)
  const accounts       = useStore(s => s.accounts)
  const selectedId     = useStore(s => s.selectedAccount)
  const selectAccount  = useStore(s => s.selectAccount)
  const dispatch       = useStore(s => s.dispatch)
  const addToast       = useStore(s => s.addToast)

  const [loading,  setLoading]  = useState(true)
  const [creating, setCreating] = useState(false)

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

  const personal      = accounts.filter(a => a.Type === 'personal')
  const savings       = accounts.filter(a => a.Type === 'personal_savings')
  const organization  = accounts.filter(a => a.Type === 'organization')
  const selectedAccount = accounts.find(a => a.Account === selectedId) ?? null

  const formatCash = (n: number) => '$' + Math.floor(n).toLocaleString('en-US')

  const handleClose = () => {
    dispatch('APP_HIDE')
    sendNui('Close').catch(() => {})
  }

  return (
    <div className="w-[80vw] h-[85vh] flex flex-col bg-menu-bg border border-white/[0.08]">
      {/* Titlebar */}
      <div className="h-[52px] flex items-center px-5 shrink-0 bg-[#0a0a0a] border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <span
            className="font-display font-black tracking-[0.1em] text-[1.1rem]"
            style={{ background: 'linear-gradient(90deg, #FF5C3A, #FF8C42)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            STRATA
          </span>
          <span className="font-mono text-[0.68rem] text-white/30">
            / {BRAND_LABELS[brand] ?? 'Bank'}
          </span>
        </div>

        <div className="flex-1" />

        {character && (
          <span className="font-mono text-[0.72rem] text-white/35 mr-5">
            Cash on hand:{' '}
            <span className="text-menu-success-lt">{formatCash(character.Cash)}</span>
          </span>
        )}

        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-1.5 mr-3 px-[14px] py-[5px] border border-white/10 bg-white/5 text-white/50 hover:bg-primary/10 hover:border-primary/35 hover:text-[#FF8C42] text-[0.78rem] font-semibold uppercase tracking-[0.06em] transition-colors"
        >
          <Plus size={11} /> New Account
        </button>

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

      {/* Content */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-[260px] shrink-0 border-r border-white/[0.06] overflow-y-auto bg-menu-surface">
          {loading ? (
            <div className="flex items-center justify-center h-24">
              <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {personal.length > 0 && (
                <>
                  <SectionLabel>Personal</SectionLabel>
                  {personal.map(a => (
                    <AccountButton
                      key={a.Account} account={a}
                      isSelected={selectedId === a.Account}
                      onClick={() => selectAccount(selectedId === a.Account ? null : a.Account)}
                    />
                  ))}
                </>
              )}
              {savings.length > 0 && (
                <>
                  <SectionLabel>Savings</SectionLabel>
                  {savings.map(a => (
                    <AccountButton
                      key={a.Account} account={a}
                      isSelected={selectedId === a.Account}
                      onClick={() => selectAccount(selectedId === a.Account ? null : a.Account)}
                    />
                  ))}
                </>
              )}
              {organization.length > 0 && (
                <>
                  <SectionLabel>Organization</SectionLabel>
                  {organization.map(a => (
                    <AccountButton
                      key={a.Account} account={a}
                      isSelected={selectedId === a.Account}
                      onClick={() => selectAccount(selectedId === a.Account ? null : a.Account)}
                    />
                  ))}
                </>
              )}
              {accounts.length === 0 && (
                <div className="flex items-center justify-center h-24">
                  <span className="font-mono text-[0.7rem] text-white/20 uppercase tracking-[0.06em]">No accounts</span>
                </div>
              )}
            </>
          )}
        </aside>

        {/* Main panel */}
        <main className="flex-1 min-w-0 overflow-hidden bg-menu-surface">
          {selectedAccount ? (
            <AccountDetail account={selectedAccount} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <span className="font-mono text-[0.75rem] text-white/20 uppercase tracking-[0.08em]">
                Select an account
              </span>
            </div>
          )}
        </main>
      </div>

      {creating && <CreateAccountModal onClose={() => setCreating(false)} />}
    </div>
  )
}
