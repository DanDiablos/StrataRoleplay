import { useState } from 'react'
import { Search, User } from 'lucide-react'
import { sendNui } from '../../nui'
import ActionBtn from '../../components/ActionBtn.tsx'
import Loader from '../../components/Loader.tsx'

interface CreditResult {
  SID: number | string
  name: string
  score: number
  tier: string
  notes?: string
}

export default function PDMCreditTab(): React.ReactElement {
  const [sid, setSid]           = useState('')
  const [loading, setLoading]   = useState(false)
  const [result, setResult]     = useState<CreditResult | null>(null)
  const [error, setError]       = useState('')

  const doSearch = async () => {
    if (!sid.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const r = await sendNui('PDMRunCredit', { SID: sid })
      const res = await r.json()
      if (res && typeof res === 'object') {
        setResult(res as CreditResult)
      } else {
        setError('No record found for that SID.')
      }
    } finally {
      setLoading(false)
    }
  }

  const tierColor = (tier: string) => {
    const t = tier?.toLowerCase()
    if (t === 'excellent' || t === 'good') return 'text-menu-success-lt'
    if (t === 'fair') return 'text-menu-warning'
    return 'text-red-300/80'
  }

  return (
    <div className="h-full flex flex-col p-5 gap-4">
      <span className="font-display font-bold uppercase tracking-[0.12em] text-[0.72rem] text-white/50 shrink-0">
        Run Credit Check
      </span>

      <div className="flex gap-2 shrink-0">
        <input
          value={sid}
          onChange={e => setSid(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && doSearch()}
          placeholder="Enter SID…"
          className="flex-1 h-9 px-3 bg-menu-surface-lt border border-white/10 text-[0.88rem] text-white/80 placeholder-white/25 focus:border-primary/50 transition-colors"
        />
        <ActionBtn onClick={doSearch} variant="primary" disabled={loading || !sid.trim()}>
          <Search size={13} className="inline mr-1" />
          Check
        </ActionBtn>
      </div>

      {loading && <div className="flex justify-center py-8"><Loader /></div>}
      {error && <span className="font-mono text-[0.72rem] text-red-300/60">{error}</span>}

      {result && !loading && (
        <div className="border-l-[3px] border-l-primary bg-menu-surface">
          <div className="px-3 py-2 bg-menu-surface-lt border-b border-white/[0.06]">
            <span className="font-display font-bold uppercase tracking-[0.12em] text-[0.72rem] text-white/70">
              Credit Report
            </span>
          </div>
          <div className="divide-y divide-white/[0.06]">
            <Row label="Name" value={result.name} />
            <Row label="SID" value={String(result.SID)} />
            <Row label="Score" value={String(result.score)} />
            <div className="flex items-center px-3 py-[9px]">
              <span className="w-[120px] shrink-0 font-mono text-[0.68rem] uppercase tracking-[0.05em] text-white/40">Tier</span>
              <span className={`font-mono text-[0.8rem] font-medium ${tierColor(result.tier)}`}>{result.tier}</span>
            </div>
            {result.notes && <Row label="Notes" value={result.notes} />}
          </div>
        </div>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center px-3 py-[9px]">
      <span className="w-[120px] shrink-0 font-mono text-[0.68rem] uppercase tracking-[0.05em] text-white/40">{label}</span>
      <span className="font-mono text-[0.75rem] text-white/80">{value}</span>
    </div>
  )
}
