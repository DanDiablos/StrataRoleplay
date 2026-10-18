import React, { useState, useEffect } from 'react'
import { Bitcoin, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft, Send, ChevronLeft } from 'lucide-react'
import { useStore } from '../store'
import { sendNui } from '../nui'

interface Coin {
  Short: string
  Name: string
  Price: number
  Change: number
  Owned?: number
}

type View = 'list' | 'trade'

export default function CryptoScreen(): React.ReactElement {
  const pushAlert = useStore((s) => s.pushAlert)

  const [coins, setCoins] = useState<Coin[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<View>('list')
  const [selected, setSelected] = useState<Coin | null>(null)
  const [action, setAction] = useState<'buy' | 'sell' | 'transfer'>('buy')
  const [amount, setAmount] = useState('')
  const [target, setTarget] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const res = await sendNui('GetCryptoCoins', {})
        const data = await res.json()
        if (Array.isArray(data)) setCoins(data)
      } catch { /* noop */ }
      setLoading(false)
    }
    load()
  }, [])

  const refreshCoins = async () => {
    try {
      const res = await sendNui('GetCryptoCoins', {})
      const data = await res.json()
      if (Array.isArray(data)) setCoins(data)
    } catch { /* noop */ }
  }

  const openTrade = (coin: Coin, act: 'buy' | 'sell' | 'transfer') => {
    setSelected(coin)
    setAction(act)
    setAmount('')
    setTarget('')
    setView('trade')
  }

  const handleTrade = async () => {
    if (!selected || !amount) return
    const qty = Number(amount)
    if (isNaN(qty) || qty <= 0) return
    try {
      let res: Response
      if (action === 'buy') {
        res = await sendNui('BuyCrypto', { Short: selected.Short, Quantity: qty })
      } else if (action === 'sell') {
        res = await sendNui('SellCrypto', { Short: selected.Short, Quantity: qty })
      } else {
        if (!target) return
        res = await sendNui('TransferCrypto', { Short: selected.Short, Target: target, Quantity: qty })
      }
      const result = await res!.json()
      if (result) {
        pushAlert(action === 'buy' ? `Bought ${qty} ${selected.Short}` : action === 'sell' ? `Sold ${qty} ${selected.Short}` : `Transferred ${qty} ${selected.Short}`)
      } else {
        pushAlert('Transaction failed')
      }
    } catch {
      pushAlert('Transaction failed')
    }
    setView('list')
    refreshCoins()
  }

  /* ── Trade view ─────────────────────── */
  if (view === 'trade' && selected) {
    return (
      <div className="flex-1 flex flex-col min-h-0">
        <div className="shrink-0 flex items-center gap-2 px-3 py-3 bg-black/30 border-b border-white/[0.06]">
          <button onClick={() => setView('list')} className="text-white/40 hover:text-white/70 transition-colors">
            <ChevronLeft size={16} />
          </button>
          <span className="font-display font-bold uppercase tracking-[0.1em] text-[0.72rem] text-white/70">
            {action === 'buy' ? 'Buy' : action === 'sell' ? 'Sell' : 'Transfer'} {selected.Short}
          </span>
        </div>
        <div className="px-4 py-4 flex flex-col gap-3">
          <div className="text-center py-3">
            <span className="font-mono text-[1.2rem] text-white/80">${selected.Price?.toLocaleString()}</span>
            <span className="block font-mono text-[0.6rem] text-white/35 mt-1">{selected.Name}</span>
          </div>
          <label className="flex flex-col gap-1">
            <span className="text-[0.6rem] font-medium text-white/40 uppercase tracking-wider">Quantity</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="h-9 px-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-[0.8rem] text-white/80 placeholder-white/25 focus:border-primary/40 transition-colors font-mono"
            />
          </label>
          {action === 'transfer' && (
            <label className="flex flex-col gap-1">
              <span className="text-[0.6rem] font-medium text-white/40 uppercase tracking-wider">Recipient SID</span>
              <input
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="SID..."
                className="h-9 px-3 bg-white/[0.04] border border-white/[0.08] rounded-lg text-[0.8rem] text-white/80 placeholder-white/25 focus:border-primary/40 transition-colors font-mono"
              />
            </label>
          )}
          <button
            onClick={handleTrade}
            className="h-9 rounded-lg bg-[#354f34]/30 border border-[#354f34]/40 text-[#60eb50] text-[0.75rem] font-semibold uppercase tracking-wider hover:bg-[#354f34]/40 transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    )
  }

  /* ── List view ──────────────────────── */
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="shrink-0 px-4 py-3 bg-black/30 border-b border-white/[0.06]">
        <div className="flex items-center gap-1.5">
          <Bitcoin size={14} className="text-[#f39c12]" />
          <span className="font-display font-bold uppercase tracking-[0.1em] text-[0.72rem] text-white/70">CoinVault</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col">
        {coins.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2">
            <Bitcoin size={28} className="text-white/20" />
            <span className="font-mono text-[0.65rem] text-white/20 uppercase tracking-[0.08em]">
              {loading ? 'Loading...' : 'No coins'}
            </span>
          </div>
        ) : (
          coins.map((coin) => (
            <div key={coin.Short} className="px-4 py-3 border-b border-white/[0.03]">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[0.72rem] font-bold text-white/80">{coin.Short}</span>
                  <span className="text-[0.6rem] text-white/35">{coin.Name}</span>
                </div>
                <div className="flex items-center gap-1">
                  {coin.Change >= 0 ? (
                    <TrendingUp size={11} className="text-menu-success-lt/70" />
                  ) : (
                    <TrendingDown size={11} className="text-red-400/60" />
                  )}
                  <span className={`font-mono text-[0.58rem] ${coin.Change >= 0 ? 'text-menu-success-lt/70' : 'text-red-400/60'}`}>
                    {coin.Change >= 0 ? '+' : ''}{coin.Change?.toFixed(2)}%
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[0.85rem] text-white/80">${coin.Price?.toLocaleString()}</span>
                {(coin.Owned ?? 0) > 0 && (
                  <span className="font-mono text-[0.58rem] text-white/35">Owned: {coin.Owned}</span>
                )}
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => openTrade(coin, 'buy')} className="flex-1 h-7 rounded text-[0.58rem] font-medium bg-menu-success/12 text-menu-success-lt/70 hover:bg-menu-success/20 transition-colors flex items-center justify-center gap-1">
                  <ArrowDownLeft size={10} /> Buy
                </button>
                <button onClick={() => openTrade(coin, 'sell')} className="flex-1 h-7 rounded text-[0.58rem] font-medium bg-menu-error/12 text-red-400/60 hover:bg-menu-error/20 transition-colors flex items-center justify-center gap-1">
                  <ArrowUpRight size={10} /> Sell
                </button>
                <button onClick={() => openTrade(coin, 'transfer')} className="flex-1 h-7 rounded text-[0.58rem] font-medium bg-white/[0.04] text-white/40 hover:bg-white/[0.08] transition-colors flex items-center justify-center gap-1">
                  <Send size={10} /> Send
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
