import { useState, useEffect } from 'react'
import { CreditCard, Trophy } from 'lucide-react'
import { sendNui } from '../../nui'
import Loader from '../../components/Loader.tsx'

interface BigWin {
  id: string | number
  player: string
  game: string
  amount: number
  date: string
  multiplier?: number
}

export default function CasinoBigWinsTab(): React.ReactElement {
  const [loading, setLoading] = useState(true)
  const [wins, setWins]       = useState<BigWin[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const r = await sendNui('CasinoGetBigWins', {})
        const result = await r.json()
        setWins(Array.isArray(result) ? result : [])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const fmtAmount = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

  if (loading) return (
    <div className="h-full flex items-center justify-center"><Loader /></div>
  )

  return (
    <div className="h-full flex flex-col p-5 gap-3.5">
      <div className="flex items-center gap-2 shrink-0">
        <Trophy size={14} className="text-menu-warning" />
        <span className="font-display font-bold uppercase tracking-[0.12em] text-[0.72rem] text-white/50">
          Big Wins ({wins.length})
        </span>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 pr-1">
        {wins.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <CreditCard size={28} className="text-white/20" />
            <span className="font-mono text-[0.72rem] text-white/20 uppercase tracking-[0.06em]">No big wins recorded</span>
          </div>
        ) : (
          wins.map((w, i) => (
            <div key={w.id ?? i} className="flex items-center gap-3 px-4 py-3 bg-menu-surface border-b border-white/[0.04] last:border-0">
              <div className="w-8 h-8 flex items-center justify-center bg-menu-warning/10 border border-menu-warning/20 shrink-0">
                <span className="font-mono text-[0.7rem] text-menu-warning font-medium">#{i + 1}</span>
              </div>
              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <span className="font-medium text-[0.84rem] text-white/80">{w.player}</span>
                <span className="font-mono text-[0.65rem] text-white/35">{w.game} · {w.date}</span>
              </div>
              <div className="flex flex-col items-end gap-0.5">
                <span className="font-mono text-[0.85rem] text-menu-warning font-medium">
                  {fmtAmount(w.amount)}
                </span>
                {w.multiplier && (
                  <span className="font-mono text-[0.62rem] text-white/30">{w.multiplier}×</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
