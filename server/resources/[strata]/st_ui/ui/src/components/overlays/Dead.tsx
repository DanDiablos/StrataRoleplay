import { useStore } from '../../store.ts'

export default function Dead(): React.ReactElement | null {
  const isDead = useStore(s => s.isDead)
  const blindfolded = useStore(s => s.blindfolded)

  if (!isDead || blindfolded) return null

  return (
    <div
      className="fixed inset-0 pointer-events-none animate-fade-in"
      style={{ background: '#1a0e0e50', zIndex: 10 }}
    />
  )
}
