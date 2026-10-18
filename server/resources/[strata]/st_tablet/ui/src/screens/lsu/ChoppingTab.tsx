import { useState } from 'react'
import { Scissors, ChevronDown, ChevronUp } from 'lucide-react'
import type { LSUDetails, ChopVehicle } from '../../types'

interface Props {
  lsuData: LSUDetails | null
}

export default function ChoppingTab({ lsuData }: Props): React.ReactElement {
  const chopList = lsuData?.chopList
  const reps     = lsuData?.reputations ?? {}
  const chopRep  = reps['Chopping']
  const [expanded, setExpanded] = useState<string | null>(null)

  if (!chopList || Object.keys(chopList).length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3">
        <Scissors size={32} className="text-white/20" />
        <span className="font-display font-bold uppercase tracking-[0.1em] text-[0.82rem] text-white/40">
          No Chop Lists
        </span>
        <span className="font-mono text-[0.68rem] text-white/25 text-center max-w-xs">
          You need a Chopping reputation of level 3 or the ACCESS_CHOPPER state to view vehicle lists.
        </span>
        {chopRep && (
          <span className="font-mono text-[0.72rem] text-white/40 mt-1">
            Current Level: {chopRep.level}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col p-5 gap-4 overflow-y-auto">
      {/* Reputation */}
      {chopRep && (
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 border border-white/[0.06] bg-menu-surface">
            <Scissors size={12} className="text-primary/70" />
            <span className="font-mono text-[0.72rem] text-white/60">
              Chopping Level {chopRep.level}
            </span>
          </div>
        </div>
      )}

      {/* Lists */}
      {Object.entries(chopList).map(([listName, listData]) => {
        const vehicles: ChopVehicle[] = Array.isArray(listData)
          ? listData
          : (listData as { list: ChopVehicle[] }).list ?? []
        const isOpen = expanded === listName

        return (
          <div key={listName} className="border-l-[3px] border-l-primary bg-menu-surface">
            <button
              onClick={() => setExpanded(isOpen ? null : listName)}
              className="w-full px-3 py-2.5 flex items-center gap-2 bg-menu-surface-lt border-b border-white/[0.06] hover:bg-white/[0.02] transition-colors"
            >
              <span className="font-display font-bold uppercase tracking-[0.12em] text-[0.72rem] text-white/70 flex-1 text-left">
                {listName} ({vehicles.length})
              </span>
              {isOpen ? <ChevronUp size={13} className="text-white/40" /> : <ChevronDown size={13} className="text-white/40" />}
            </button>

            {isOpen && (
              <div className="divide-y divide-white/[0.04]">
                {vehicles.length === 0 ? (
                  <div className="px-4 py-4 text-center">
                    <span className="font-mono text-[0.68rem] text-white/20">No vehicles in this list</span>
                  </div>
                ) : (
                  vehicles.map((v, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-2.5">
                      <Scissors size={12} className="text-white/25 shrink-0" />
                      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                        <span className="font-medium text-[0.82rem] text-white/75">
                          {v.label ?? v.model ?? 'Unknown'}
                        </span>
                        {v.model && v.label && (
                          <span className="font-mono text-[0.62rem] text-white/30 uppercase">{v.model}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        {v.class && (
                          <span className="font-mono text-[0.62rem] bg-white/[0.05] px-1.5 py-0.5 text-white/40 uppercase">
                            {v.class}
                          </span>
                        )}
                        {v.reward != null && (
                          <span className="font-mono text-[0.72rem] text-menu-success-lt">
                            ${v.reward.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
