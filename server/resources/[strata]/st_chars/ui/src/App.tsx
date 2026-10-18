import { useEffect } from 'react'
import { useStore, STATES } from './store'
import Loader from './components/Loader'
import SplashScreen from './screens/SplashScreen'
import CharactersScreen from './screens/CharactersScreen'
import CreateScreen from './screens/CreateScreen'
import SpawnScreen from './screens/SpawnScreen'

const SCREENS: Record<string, React.ComponentType> = {
  [STATES.SPLASH]:     SplashScreen,
  [STATES.CHARACTERS]: CharactersScreen,
  [STATES.CREATE]:     CreateScreen,
  [STATES.SPAWN]:      SpawnScreen,
}

export default function App(): React.ReactElement | null {
  const hidden   = useStore(s => s.hidden)
  const appState = useStore(s => s.appState)
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

  const Screen = SCREENS[appState] ?? SplashScreen

  return (
    <>
      <Screen />
      <Loader />
    </>
  )
}
