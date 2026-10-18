import React, { useState, useEffect, useCallback } from 'react'
import { HandCoins, DollarSign, Car, Home, AlertTriangle, Clock, CheckCircle } from 'lucide-react'
import { useStore } from '../store'
import { sendNui } from '../nui'

interface Loan {
  id: number
  Type: string
  AssetIdentifier: string
  Defaulted: boolean | number
  InterestRate: number
  Total: number
  Remaining: number
  Paid: number
  DownPayment: number
  TotalPayments: number
  PaidPayments: number
  MissedPayments: number
  TotalMissedPayments: number
  NextPayment: number
  LastPayment: number
}

function getCreditLabel(score: number): { label: string; color: string } {
  if (score >= 1000) return { label: 'Excellent', color: '#2ecc71' }
  if (score >= 800) return { label: 'Great', color: '#27ae60' }
  if (score >= 600) return { label: 'Good', color: '#f1c40f' }
  if (score >= 400) return { label: 'Fair', color: '#f39c12' }
  if (score >= 250) return { label: 'Poor', color: '#e67e22' }
  return { label: 'Very Poor', color: '#e74c3c' }
}

export default function LoansScreen(): React.ReactElement {
  const pushAlert = useStore((s) => s.pushAlert)
  const [loans, setLoans] = useState<Loan[]>([])
  const [creditScore, setCreditScore] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const res = await sendNui('Loans:GetData', {})
      const data = await res.json()
      if (data?.loans && Array.isArray(data.loans)) setLoans(data.loans)
      else if (Array.isArray(data)) setLoans(data)
      if (typeof data?.creditScore === 'number') setCreditScore(data.creditScore)
    } catch { /* noop */ }
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handlePayment = async (loan: Loan) => {
    try {
      const res = await sendNui('Loans:Payment', { loan: loan.id })
      const result = await res.json()
      if (result?.success) {
        pushAlert(result.paidOff ? 'Loan paid off!' : `Payment of $${result.paymentAmount?.toLocaleString()} made`)
        fetchData()
      } else {
        pushAlert(result?.message ?? 'Payment failed')
      }
    } catch {
      pushAlert('Payment failed')
    }
  }

  const creditInfo = getCreditLabel(creditScore)
  const creditPct = Math.min(100, ((creditScore - 100) / (1400 - 100)) * 100)

  const formatDate = (ts: number): string => {
    if (!ts || ts <= 0) return '—'
    const d = new Date(ts * 1000)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const daysUntil = (ts: number): string => {
    if (!ts || ts <= 0) return '—'
    const diff = ts - Math.floor(Date.now() / 1000)
    if (diff <= 0) return 'Overdue'
    const days = Math.floor(diff / 86400)
    if (days === 0) return 'Today'
    if (days === 1) return '1 day'
    return `${days} days`
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="shrink-0 px-4 py-3 bg-black/30 border-b border-white/[0.06]">
        <div className="flex items-center gap-1.5">
          <HandCoins size={14} className="text-[#30a60f]" />
          <span className="font-display font-bold uppercase tracking-[0.1em] text-[0.72rem] text-white/70">Loans</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col">
        {/* Credit Score */}
        <div className="mx-4 mt-3 mb-2 p-3 bg-white/[0.02] border border-white/[0.06]">
          <div className="flex items-center justify-between mb-2">
            <span className="font-display font-bold uppercase tracking-[0.12em] text-[0.62rem] text-white/40">Credit Score</span>
            <span className="font-mono text-[0.58rem] uppercase tracking-wider" style={{ color: creditInfo.color }}>
              {creditInfo.label}
            </span>
          </div>
          <div className="flex items-end gap-2 mb-2">
            <span className="font-display font-bold text-[1.4rem] leading-none" style={{ color: creditInfo.color }}>
              {creditScore}
            </span>
            <span className="font-mono text-[0.52rem] text-white/25 pb-0.5">/ 1400</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${creditPct}%`, background: creditInfo.color }}
            />
          </div>
        </div>

        {/* Loans */}
        {loans.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2">
            <CheckCircle size={28} className="text-white/20" />
            <span className="font-mono text-[0.65rem] text-white/20 uppercase tracking-[0.08em]">
              {loading ? 'Loading...' : 'No active loans'}
            </span>
          </div>
        ) : (
          loans.map((loan) => {
            const isDefaulted = loan.Defaulted === true || loan.Defaulted === 1
            const paidOff = loan.Remaining <= 0
            const pct = loan.Total > 0 ? (loan.Paid / loan.Total) * 100 : 0
            const remainingPayments = loan.TotalPayments - loan.PaidPayments
            const paymentAmount = remainingPayments > 0 ? Math.ceil((loan.Remaining / remainingPayments) * ((100 + loan.InterestRate) / 100)) : 0

            return (
              <div key={loan.id} className="mx-4 mt-2 border-l-[3px] bg-white/[0.02]" style={{ borderLeftColor: isDefaulted ? '#e74c3c' : paidOff ? '#2ecc71' : '#30a60f' }}>
                {/* Header */}
                <div className="px-3 py-2 bg-white/[0.03] border-b border-white/[0.06] flex items-center gap-2">
                  {loan.Type === 'vehicle' ? <Car size={12} className="text-white/40" /> : <Home size={12} className="text-white/40" />}
                  <span className="font-display font-bold uppercase tracking-[0.12em] text-[0.68rem] text-white/60">
                    {loan.Type === 'vehicle' ? 'Vehicle' : 'Property'} Loan
                  </span>
                  {isDefaulted && (
                    <span className="ml-auto flex items-center gap-1 text-[0.5rem] font-mono text-red-400/70 uppercase">
                      <AlertTriangle size={9} /> Defaulted
                    </span>
                  )}
                  {paidOff && (
                    <span className="ml-auto flex items-center gap-1 text-[0.5rem] font-mono text-[#2ecc71] uppercase">
                      <CheckCircle size={9} /> Paid Off
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="px-3 py-2 flex flex-col gap-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[0.55rem] text-white/35">Total</span>
                    <span className="font-mono text-[0.68rem] text-white/70">${loan.Total?.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[0.55rem] text-white/35">Remaining</span>
                    <span className="font-mono text-[0.68rem] text-white/80">${loan.Remaining?.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[0.55rem] text-white/35">Interest</span>
                    <span className="font-mono text-[0.62rem] text-white/50">{loan.InterestRate}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[0.55rem] text-white/35">Payments</span>
                    <span className="font-mono text-[0.62rem] text-white/50">{loan.PaidPayments}/{loan.TotalPayments}</span>
                  </div>
                  {loan.MissedPayments > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[0.55rem] text-red-400/50">Missed</span>
                      <span className="font-mono text-[0.62rem] text-red-400/70">{loan.MissedPayments}</span>
                    </div>
                  )}
                  {!paidOff && loan.NextPayment > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[0.55rem] text-white/35">Next Due</span>
                      <span className="font-mono text-[0.62rem] text-white/50 flex items-center gap-1">
                        <Clock size={9} className="text-white/25" />
                        {daysUntil(loan.NextPayment)} · {formatDate(loan.NextPayment)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Progress */}
                <div className="px-3 pb-2">
                  <div className="h-1.5 rounded-full bg-white/[0.06]">
                    <div className="h-full rounded-full bg-[#30a60f]/50" style={{ width: `${Math.min(100, pct)}%` }} />
                  </div>
                </div>

                {/* Payment button */}
                {!paidOff && (
                  <div className="px-3 pb-3">
                    <button
                      onClick={() => handlePayment(loan)}
                      className="w-full h-8 rounded-lg bg-[#30a60f]/15 border border-[#30a60f]/25 text-[#30a60f] text-[0.68rem] font-semibold uppercase tracking-wider hover:bg-[#30a60f]/25 transition-colors"
                    >
                      Pay ${paymentAmount.toLocaleString()}
                    </button>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
