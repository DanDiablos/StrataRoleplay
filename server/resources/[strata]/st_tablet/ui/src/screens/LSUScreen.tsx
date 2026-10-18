import { useEffect, useState } from 'react'
import { ArrowLeft, X, Eye, ShoppingCart, Car, Scissors } from 'lucide-react'
import { sendNui } from '../nui'
import { useStore } from '../store'
import Loader from '../components/Loader.tsx'
import type { LSUDetails } from '../types'
import { MOCK_LSU_DATA } from '../mock'

const DEV = import.meta.env.DEV

import MarketTab from './lsu/MarketTab.tsx'
import BoostingTab from './lsu/BoostingTab.tsx'
import ChoppingTab from './lsu/ChoppingTab.tsx'

const TABS = [
  { id: 'market',   label: 'Market',   Icon: ShoppingCart },
  { id: 'boosting', label: 'Boosting', Icon: Car },
  { id: 'chopping', label: 'Chopping', Icon: Scissors },
]

export default function LSUScreen(): React.ReactElement {
  const navigate  = useStore(s => s.navigate)
  const lsuTab    = useStore(s => s.lsuTab)
  const dispatch  = useStore(s => s.dispatch)
  const [loading, setLoading]   = useState(true)
  const [lsuData, setLsuData]   = useState<LSUDetails | null>(null)

  useEffect(() => {
    if (DEV) {
      setLsuData(MOCK_LSU_DATA)
      setLoading(false)
      return
    }
    const load = async () => {
      setLoading(true)
      try {
        const r = await sendNui('GetLSUDetails', {})
        const result = await r.json()
        if (result) setLsuData(result as LSUDetails)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleClose = () => {
    dispatch('LAPTOP_NOT_VISIBLE')
    sendNui('CloseTablet')
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Top bar */}
      <div className="h-[52px] flex items-center px-4 border-b border-white/[0.06] bg-menu-surface shrink-0 gap-3">
        <button
          onClick={() => navigate('home')}
          className="w-7 h-7 flex items-center justify-center border border-white/10 bg-white/[0.03] text-white/30 hover:text-white/60 transition-colors"
        >
          <ArrowLeft size={13} />
        </button>

        <div className="flex items-center gap-2">
          <Eye size={15} style={{ color: '#E95200' }} />
          <span
            className="font-display font-bold uppercase tracking-[0.1em] text-[0.9rem]"
            style={{ color: '#E95200' }}
          >
            LS Underground
          </span>
        </div>

        <div className="flex-1" />

        <button
          onClick={handleClose}
          className="flex items-center gap-1.5 font-mono text-[0.65rem] text-white/25 hover:text-white/60 uppercase tracking-[0.05em] transition-colors"
        >
          <X size={11} />
          <span>ESC</span>
        </button>
      </div>

      {/* Tab bar */}
      <div className="h-10 flex items-stretch border-b border-white/[0.06] bg-menu-surface shrink-0">
        {TABS.map(({ id, label, Icon }) => {
          const active = lsuTab === id
          return (
            <button
              key={id}
              onClick={() => navigate('lsu', { lsuTab: id })}
              className={`flex-1 flex items-center justify-center gap-2 h-full font-medium uppercase tracking-[0.06em] text-[0.78rem] transition-colors border-b-2 ${
                active
                  ? 'border-b-primary text-white/90'
                  : 'border-b-transparent text-white/35 hover:text-white/65'
              }`}
            >
              <Icon size={12} />
              {label}
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <Loader />
          </div>
        ) : (
          <>
            <div className={lsuTab !== 'market' ? 'hidden' : 'h-full'}>
              <MarketTab lsuData={lsuData} />
            </div>
            <div className={lsuTab !== 'boosting' ? 'hidden' : 'h-full'}>
              <BoostingTab lsuData={lsuData} />
            </div>
            <div className={lsuTab !== 'chopping' ? 'hidden' : 'h-full'}>
              <ChoppingTab lsuData={lsuData} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
