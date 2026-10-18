import { useEffect } from 'react'
import { useStore } from './store.ts'

import HudShell from './components/hud/HudShell.tsx'
import Dead from './components/overlays/Dead.tsx'
import Blindfold from './components/overlays/Blindfold.tsx'
import DeathTexts from './components/overlays/DeathTexts.tsx'
import Flashbang from './components/overlays/Flashbang.tsx'
import InfoOverlay from './components/overlays/InfoOverlay.tsx'
import ImageOverlay from './components/overlays/ImageOverlay.tsx'
import GemTable from './components/overlays/GemTable.tsx'
import Arcade from './components/overlays/Arcade.tsx'
import Notifications from './components/Notifications.tsx'
import Action from './components/Action.tsx'
import Progress from './components/Progress.tsx'
import ThirdEye from './components/ThirdEye.tsx'
import InteractionMenu from './components/InteractionMenu.tsx'
import ListMenu from './components/dialogs/ListMenu.tsx'
import InputDialog from './components/dialogs/InputDialog.tsx'
import ConfirmDialog from './components/dialogs/ConfirmDialog.tsx'
import MethDialog from './components/dialogs/MethDialog.tsx'
import Settings from './components/dialogs/Settings.tsx'

export default function App(): React.ReactElement | null {
  const hidden = useStore(s => s.hidden)
  const dispatch = useStore(s => s.dispatch)

  useEffect(() => {
    const handler = (e: MessageEvent<{ type?: string; data?: Record<string, unknown> }>) => {
      if (!e.isTrusted) return
      const { type, data } = e.data
      if (type) dispatch(type, data ?? {})
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [dispatch])

  if (hidden) return null

  return (
    <>
      {/* Dark background for browser dev — transparent in FiveM CEF */}
      {import.meta.env.DEV && (
        <div className="fixed inset-0 bg-[#1a1a2e]" style={{ zIndex: -1 }} />
      )}
      <Dead />
      <Blindfold />
      <Flashbang />
      <DeathTexts />
      <InfoOverlay />
      <ImageOverlay />
      <HudShell />
      <Notifications />
      <Action />
      <ListMenu />
      <InputDialog />
      <ConfirmDialog />
      <MethDialog />
      <Progress />
      <ThirdEye />
      <InteractionMenu />
      <GemTable />
      <Arcade />
      <Settings />
    </>
  )
}
