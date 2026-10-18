import { useState } from 'react'
import { useStore } from '../store.ts'
import { sendNui } from '../nui.ts'
import PedShell from '../components/PedShell.tsx'
import SaveModal from '../components/SaveModal.tsx'
import FaceTab from '../components/tabs/FaceTab.tsx'
import BodyTab from '../components/tabs/BodyTab.tsx'
import HairTab from '../components/tabs/HairTab.tsx'
import MakeupTab from '../components/tabs/MakeupTab.tsx'
import ClothesTab from '../components/tabs/ClothesTab.tsx'
import AccessoriesTab from '../components/tabs/AccessoriesTab.tsx'
import TattoosTab from '../components/tabs/TattoosTab.tsx'

const TABS = ['Face', 'Body', 'Hair', 'Makeup', 'Clothes', 'Accessories', 'Tattoos']

export default function CreatorScreen(): React.ReactElement {
  const dispatch = useStore((s) => s.dispatch)
  const [tab,       setTab]       = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving,    setSaving]    = useState(false)

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

  const footer = (
    <div className="flex items-center gap-2 px-4 py-3">
      <button
        onClick={() => setModalOpen(true)}
        className="flex-1 px-[14px] py-[5px] border border-primary/35 bg-primary/[0.08] text-[0.8rem] font-semibold text-[#FF8C42] hover:bg-primary/15 transition-colors"
      >
        Create Character
      </button>
    </div>
  )

  return (
    <>
      <PedShell
        label="creator"
        tabs={TABS}
        activeTab={tab}
        onTabChange={setTab}
        onClose={handleClose}
        hideClose
        footer={footer}
      >
        <div className={tab !== 0 ? 'hidden' : ''}><FaceTab /></div>
        <div className={tab !== 1 ? 'hidden' : ''}><BodyTab showModelSelector /></div>
        <div className={tab !== 2 ? 'hidden' : ''}><HairTab /></div>
        <div className={tab !== 3 ? 'hidden' : ''}><MakeupTab /></div>
        <div className={tab !== 4 ? 'hidden' : ''}><ClothesTab /></div>
        <div className={tab !== 5 ? 'hidden' : ''}><AccessoriesTab /></div>
        <div className={tab !== 6 ? 'hidden' : ''}><TattoosTab /></div>
      </PedShell>

      <SaveModal
        open={modalOpen}
        appState="CREATOR"
        saving={saving}
        onConfirm={handleConfirm}
        onClose={() => setModalOpen(false)}
      />
    </>
  )
}
