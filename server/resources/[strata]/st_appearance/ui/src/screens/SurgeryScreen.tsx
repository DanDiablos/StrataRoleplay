import { useState } from 'react'
import { useStore } from '../store.ts'
import { sendNui } from '../nui.ts'
import PedShell from '../components/PedShell.tsx'
import SaveModal from '../components/SaveModal.tsx'
import FaceTab from '../components/tabs/FaceTab.tsx'
import BodyTab from '../components/tabs/BodyTab.tsx'
import HairTab from '../components/tabs/HairTab.tsx'

const TABS = ['Face', 'Body', 'Hair']

export default function SurgeryScreen(): React.ReactElement {
  const dispatch = useStore((s) => s.dispatch)
  const pricing  = useStore((s) => s.pricing)
  const [tab,       setTab]       = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving,    setSaving]    = useState(false)

  const price = pricing['SURGERY']

  const handleClose = () => {
    sendNui('StopAnimation', {})
    dispatch('APP_HIDE')
    sendNui('Cancel')
  }

  const handleConfirm = async () => {
    setSaving(true)
    await sendNui('Save')
    setSaving(false)
    setModalOpen(false)
    dispatch('APP_HIDE')
  }

  const priceLabel = price
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price)
    : null

  const footer = (
    <div className="flex items-center gap-2 px-4 py-3">
      {priceLabel && (
        <span className="font-mono text-[0.75rem] text-menu-warning mr-1">{priceLabel}</span>
      )}
      <button
        onClick={handleClose}
        className="px-[14px] py-[5px] border border-white/10 bg-white/[0.03] text-[0.8rem] font-semibold text-white/50 hover:bg-white/[0.07] transition-colors"
      >
        Cancel
      </button>
      <button
        onClick={() => setModalOpen(true)}
        className="flex-1 px-[14px] py-[5px] border border-primary/35 bg-primary/[0.08] text-[0.8rem] font-semibold text-[#FF8C42] hover:bg-primary/15 transition-colors"
      >
        Confirm Surgery
      </button>
    </div>
  )

  return (
    <>
      <PedShell
        label="surgery"
        tabs={TABS}
        activeTab={tab}
        onTabChange={setTab}
        onClose={handleClose}
        footer={footer}
      >
        <div className={tab !== 0 ? 'hidden' : ''}><FaceTab /></div>
        <div className={tab !== 1 ? 'hidden' : ''}><BodyTab /></div>
        <div className={tab !== 2 ? 'hidden' : ''}><HairTab /></div>
      </PedShell>

      <SaveModal
        open={modalOpen}
        appState="SURGERY"
        price={price}
        saving={saving}
        onConfirm={handleConfirm}
        onClose={() => setModalOpen(false)}
      />
    </>
  )
}
