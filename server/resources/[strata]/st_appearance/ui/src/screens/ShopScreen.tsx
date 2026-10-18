import { useState } from 'react'
import { useStore } from '../store.ts'
import { sendNui } from '../nui.ts'
import { Upload, Download } from 'lucide-react'
import PedShell from '../components/PedShell.tsx'
import SaveModal from '../components/SaveModal.tsx'
import OutfitCodeModal from '../components/OutfitCodeModal'
import ClothesTab from '../components/tabs/ClothesTab.tsx'
import AccessoriesTab from '../components/tabs/AccessoriesTab.tsx'
import ArmsTab from '../components/tabs/ArmsTab.tsx'

const TABS = ['Clothes', 'Accessories', 'Arms']

export default function ShopScreen(): React.ReactElement {
  const dispatch = useStore((s) => s.dispatch)
  const pricing  = useStore((s) => s.pricing)
  const [tab,       setTab]       = useState(0)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving,    setSaving]    = useState(false)
  const [codeModal, setCodeModal] = useState<{ mode: 'export' | 'import'; code?: string } | null>(null)

  const price = pricing['SHOP']

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

  const handleExport = () => {
    const ped = useStore.getState().ped
    if (!ped) return
    const outfitData = {
      components: ped.customization.components,
      props: ped.customization.props,
      colors: ped.customization.colors,
      overlay: ped.customization.overlay,
    }
    const code = btoa(JSON.stringify(outfitData))
    setCodeModal({ mode: 'export', code })
  }

  const handleImport = async (code: string) => {
    try {
      const data = JSON.parse(atob(code))
      await sendNui('ImportOutfitCode', data)
      setCodeModal(null)
    } catch {
      // error handled in modal
    }
  }

  const priceLabel = price
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price)
    : null

  const iconBtn = 'w-7 h-7 flex items-center justify-center border border-white/10 bg-white/[0.03] text-white/30 hover:text-white/60 hover:border-white/20 transition-colors'

  const footer = (
    <div className="flex items-center gap-2 px-4 py-3">
      <button onClick={() => setCodeModal({ mode: 'import' })} title="Import Outfit Code" className={iconBtn}>
        <Download size={13} />
      </button>
      <button onClick={handleExport} title="Export Outfit Code" className={iconBtn}>
        <Upload size={13} />
      </button>
      <div className="flex-1" />
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
        className="px-[14px] py-[5px] border border-primary/35 bg-primary/[0.08] text-[0.8rem] font-semibold text-[#FF8C42] hover:bg-primary/15 transition-colors"
      >
        Purchase
      </button>
    </div>
  )

  return (
    <>
      <PedShell
        label="shop"
        tabs={TABS}
        activeTab={tab}
        onTabChange={setTab}
        onClose={handleClose}
        footer={footer}
      >
        <div className={tab !== 0 ? 'hidden' : ''}><ClothesTab /></div>
        <div className={tab !== 1 ? 'hidden' : ''}><AccessoriesTab /></div>
        <div className={tab !== 2 ? 'hidden' : ''}><ArmsTab /></div>
      </PedShell>

      <SaveModal
        open={modalOpen}
        appState="SHOP"
        price={price}
        saving={saving}
        onConfirm={handleConfirm}
        onClose={() => setModalOpen(false)}
      />

      <OutfitCodeModal
        open={codeModal !== null}
        mode={codeModal?.mode ?? 'export'}
        code={codeModal?.code}
        onImport={handleImport}
        onClose={() => setCodeModal(null)}
      />
    </>
  )
}
