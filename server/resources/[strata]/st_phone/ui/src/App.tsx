import React, { useEffect } from 'react'
import { useStore } from './store'
import { sendNui } from './nui'
import PhoneShell from './components/PhoneShell'
import Loader from './components/Loader'
import CalculatorScreen from './screens/CalculatorScreen'
import ContactsScreen from './screens/ContactsScreen'
import SettingsScreen from './screens/SettingsScreen'
import StoreScreen from './screens/StoreScreen'
import PhoneScreen from './screens/PhoneScreen'
import MessagesScreen from './screens/MessagesScreen'
import EmailScreen from './screens/EmailScreen'
import TwitterScreen from './screens/TwitterScreen'
import ChatterScreen from './screens/ChatterScreen'
import AdvertsScreen from './screens/AdvertsScreen'
import BankScreen from './screens/BankScreen'
import LoansScreen from './screens/LoansScreen'
import CryptoScreen from './screens/CryptoScreen'
import CoManagerScreen from './screens/CoManagerScreen'
import LaborScreen from './screens/LaborScreen'
import ServicesScreen from './screens/ServicesScreen'
import GarageScreen from './screens/GarageScreen'
import Dyn8Screen from './screens/Dyn8Screen'
import HomeManageScreen from './screens/HomeManageScreen'
import PingEmScreen from './screens/PingEmScreen'
import ChopperScreen from './screens/ChopperScreen'
import DocumentsScreen from './screens/DocumentsScreen'
import MediaScreen from './screens/MediaScreen'
import MusicScreen from './screens/MusicScreen'
import RedlineScreen from './screens/RedlineScreen'
import BluelineScreen from './screens/BluelineScreen'
import { MOCK_APPS, MOCK_PLAYER, MOCK_CONTACTS, MOCK_TIME, MOCK_NOTIFICATIONS, MOCK_EMAILS, MOCK_MESSAGE_THREADS, MOCK_CALL_HISTORY } from './mock'

/* ── Placeholder screens for apps not yet built ──────── */

function PlaceholderApp(): React.ReactElement {
  const currentApp = useStore((s) => s.currentApp)
  const apps = useStore((s) => s.apps)
  const app = currentApp ? apps[currentApp] : null

  return (
    <div className="flex-1 flex flex-col">
      {/* App header bar */}
      <div className="shrink-0 px-4 py-3 bg-black/30 border-b border-white/[0.06]">
        <span className="font-display font-bold uppercase tracking-[0.1em] text-[0.72rem] text-white/70">
          {app?.label ?? currentApp}
        </span>
      </div>
      {/* Placeholder content */}
      <div className="flex-1 flex flex-col items-center justify-center gap-2.5">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center opacity-30"
          style={{ background: app?.color ?? '#333' }}
        >
          <span className="text-white text-2xl font-display font-bold">
            {(app?.label ?? '?')[0]}
          </span>
        </div>
        <span className="font-mono text-[0.65rem] text-white/20 uppercase tracking-[0.08em]">
          Coming Soon
        </span>
      </div>
    </div>
  )
}

/* ── App screens registry (populated as apps are built) ── */

const APP_SCREENS: Record<string, React.ComponentType> = {
  calculator: CalculatorScreen,
  contacts: ContactsScreen,
  settings: SettingsScreen,
  store: StoreScreen,
  phone: PhoneScreen,
  messages: MessagesScreen,
  email: EmailScreen,
  twitter: TwitterScreen,
  chatter: ChatterScreen,
  adverts: AdvertsScreen,
  bank: BankScreen,
  loans: LoansScreen,
  crypto: CryptoScreen,
  comanager: CoManagerScreen,
  labor: LaborScreen,
  services: ServicesScreen,
  garage: GarageScreen,
  dyn8: Dyn8Screen,
  homemanage: HomeManageScreen,
  pingem: PingEmScreen,
  chopper: ChopperScreen,
  documents: DocumentsScreen,
  media: MediaScreen,
  music: MusicScreen,
  redline: RedlineScreen,
  blueline: BluelineScreen,
}

/* ── Main App ──────────────────────────────────────────── */

export default function App(): React.ReactElement | null {
  const hidden = useStore((s) => s.hidden)
  const locked = useStore((s) => s.locked)
  const dispatch = useStore((s) => s.dispatch)
  const currentApp = useStore((s) => s.currentApp)
  const goHome = useStore((s) => s.goHome)

  /* NUI message listener */
  useEffect(() => {
    const handler = (e: MessageEvent<{ type?: string; data?: Record<string, unknown> }>) => {
      if (!e.isTrusted) return
      const { type, data } = e.data ?? {}
      if (type) dispatch(type, data ?? {})
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [dispatch])

  /* Dev mode — seed mock data */
  useEffect(() => {
    if (!import.meta.env.DEV) return
    dispatch('SET_APPS', MOCK_APPS as unknown as Record<string, unknown>)
    dispatch('SET_DATA', { type: 'player', data: MOCK_PLAYER } as Record<string, unknown>)
    dispatch('SET_DATA', { type: 'contacts', data: MOCK_CONTACTS } as Record<string, unknown>)
    dispatch('SET_DATA', { type: 'emails', data: MOCK_EMAILS } as Record<string, unknown>)
    dispatch('SET_DATA', { type: 'calls', data: MOCK_CALL_HISTORY } as Record<string, unknown>)
    dispatch('SET_MESSAGE_THREADS', { threads: MOCK_MESSAGE_THREADS } as Record<string, unknown>)
    dispatch('SET_TIME', MOCK_TIME as unknown as Record<string, unknown>)
    for (const n of MOCK_NOTIFICATIONS) {
      dispatch('NOTIF_ADD', { notification: n } as Record<string, unknown>)
    }
    dispatch('PHONE_VISIBLE')
  }, [])

  /* ESC key → close phone */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (locked) {
          sendNui('ClosePhone')
          dispatch('PHONE_NOT_VISIBLE')
        } else if (currentApp) {
          goHome()
        } else {
          sendNui('ClosePhone')
          dispatch('PHONE_NOT_VISIBLE')
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [locked, currentApp, goHome, dispatch])

  const call = useStore((s) => s.call)
  const peekNotif = useStore((s) => s.peekNotif)

  /* Resolve current app screen */
  const Screen = currentApp ? (APP_SCREENS[currentApp] ?? PlaceholderApp) : null
  const appScreen = Screen ? <Screen /> : null

  /* Three states:
     - open: phone fully visible
     - peek: phone closed but something needs attention (call, notification)
     - hidden: completely off-screen */
  const isOpen = !hidden
  const isPeek = hidden && (call.status !== 'idle' || peekNotif !== null)

  /* Scale the phone up for 1440p+ screens */
  const scale = window.innerHeight >= 1440 ? 1.3 : 1
  const FRAME_H = 743
  const PEEK_VISIBLE = 170 // pre-scale px of phone top visible during peek (matches 1440p look)

  let translateY = `translateY(${Math.round(FRAME_H * scale + 48)}px)` // hidden — must use scaled height
  if (isOpen) translateY = 'translateY(0)'
  if (isPeek) translateY = `translateY(${Math.round((FRAME_H - PEEK_VISIBLE) * scale)}px)`

  return (
    <div
      className="fixed bottom-2 right-6 z-[400]"
      style={{
        transform: `${translateY} scale(${scale})`,
        transformOrigin: 'bottom right',
        transition: 'transform 0.4s ease-out',
      }}
    >
      <PhoneShell appScreen={appScreen} />
    </div>
  )
}
