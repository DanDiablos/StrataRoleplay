import React, { useState, useEffect } from 'react'
import { Scissors, ShieldAlert, Zap, ChevronRight, Lock } from 'lucide-react'
import { sendNui } from '../nui'

interface RepLevel { level: number; label?: string; value: number }
interface Reputation { id: string; label: string; value: number; current: RepLevel; next: RepLevel }
interface ChopItem { label?: string; model?: string; payout?: number; class?: string }
interface ChopperData {
  chopList?: Record<string, ChopItem[] | { id: string; list: ChopItem[] }>
  reputations?: Reputation[]
  banned?: boolean
  canBoost?: boolean
}

export default function ChopperScreen(): React.ReactElement {
  const [data, setData] = useState<ChopperData | null>(null)
  const [loading, setLoading] = useState(true)
  const [openList, setOpenList] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await sendNui('GetChopperDetails', { phone: true })
        const d = await res.json()
        if (d) setData(d as ChopperData)
      } catch { /* noop */ }
      setLoading(false)
    }
    load()
  }, [])

  const rep = data?.reputations?.[0]
  const progressPct = rep && rep.next.value > rep.current.value
    ? ((rep.value - rep.current.value) / (rep.next.value - rep.current.value)) * 100
    : rep ? 100 : 0

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="shrink-0 px-4 py-3 bg-black/30 border-b border-white/[0.06]">
        <div className="flex items-center gap-1.5">
          <Scissors size={14} className="text-[#8800c7]" />
          <span className="font-display font-bold uppercase tracking-[0.1em] text-[0.72rem] text-white/70">Scrapyard</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : !data ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2">
            <Lock size={28} className="text-white/20" />
            <span className="font-mono text-[0.65rem] text-white/20 uppercase tracking-[0.08em]">No access</span>
          </div>
        ) : (
          <>
            {/* Status badges */}
            {(data.banned || data.canBoost) && (
              <div className="flex gap-2 px-4 mt-3">
                {data.banned && (
                  <span className="flex items-center gap-1 px-2 py-1 bg-menu-error/15 border border-menu-error-lt/30 text-red-300/70 text-[0.55rem] font-mono uppercase">
                    <ShieldAlert size={10} /> Banned
                  </span>
                )}
                {data.canBoost && (
                  <span className="flex items-center gap-1 px-2 py-1 bg-[#8800c7]/15 border border-[#8800c7]/30 text-[#c77dff] text-[0.55rem] font-mono uppercase">
                    <Zap size={10} /> Boost Access
                  </span>
                )}
              </div>
            )}

            {/* Reputation */}
            {rep && (
              <div className="mx-4 mt-3 border-l-[3px] border-l-[#8800c7] bg-white/[0.02]">
                <div className="px-3 py-2 bg-white/[0.03] border-b border-white/[0.06]">
                  <span className="font-display font-bold uppercase tracking-[0.12em] text-[0.68rem] text-white/60">
                    {rep.label}
                  </span>
                </div>
                <div className="px-3 py-3">
                  <div className="flex items-end justify-between mb-1">
                    <span className="font-mono text-[0.62rem] text-[#c77dff]">
                      {rep.current.label ?? `Level ${rep.current.level}`}
                    </span>
                    <span className="font-mono text-[0.5rem] text-white/25">
                      {rep.next.label !== 'Done!' ? `Next: ${rep.next.label ?? `Level ${rep.next.level}`}` : 'Max Level'}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.06] mb-1.5">
                    <div className="h-full rounded-full bg-[#8800c7]/60" style={{ width: `${Math.min(100, progressPct)}%` }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[0.5rem] text-white/25">{rep.value?.toLocaleString()} XP</span>
                    <span className="font-mono text-[0.5rem] text-white/25">{rep.next.value?.toLocaleString()} XP</span>
                  </div>
                </div>
              </div>
            )}

            {/* Chop Lists */}
            {data.chopList && Object.keys(data.chopList).length > 0 ? (
              <div className="px-4 mt-3">
                <span className="font-display font-bold uppercase tracking-[0.12em] text-[0.62rem] text-white/35 block mb-1.5">
                  Chop Lists
                </span>
                {Object.entries(data.chopList).map(([name, list]) => {
                  const items = Array.isArray(list) ? list : (list as { list: ChopItem[] })?.list ?? []
                  const isOpen = openList === name
                  return (
                    <div key={name} className="mb-1">
                      <button
                        onClick={() => setOpenList(isOpen ? null : name)}
                        className="w-full flex items-center gap-2 px-3 py-2.5 bg-white/[0.03] border border-white/[0.04] hover:bg-white/[0.06] transition-colors"
                      >
                        <span className="flex-1 text-left text-[0.72rem] font-medium text-white/60">{name}</span>
                        <span className="font-mono text-[0.52rem] text-white/25">{items.length} vehicles</span>
                        <ChevronRight size={12} className={`text-white/20 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                      </button>
                      {isOpen && items.length > 0 && (
                        <div className="border border-t-0 border-white/[0.04] bg-white/[0.01]">
                          {items.map((item, i) => (
                            <div key={i} className="flex items-center px-3 py-2 border-b border-white/[0.03] last:border-0">
                              <span className="flex-1 text-[0.65rem] text-white/55">{item.label ?? item.model ?? 'Unknown'}</span>
                              {item.payout != null && (
                                <span className="font-mono text-[0.6rem] text-[#8800c7]">${item.payout.toLocaleString()}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : !rep ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-2">
                <Scissors size={28} className="text-white/20" />
                <span className="font-mono text-[0.65rem] text-white/20 uppercase tracking-[0.08em]">No data available</span>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}
