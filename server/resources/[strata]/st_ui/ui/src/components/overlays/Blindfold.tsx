import { useStore } from '../../store.ts'
import blindfoldImg from '../../assets/blindfold.webp'

export default function Blindfold(): React.ReactElement | null {
  const blindfolded = useStore(s => s.blindfolded)

  if (!blindfolded) return null

  return (
    <div
      className="fixed inset-0 pointer-events-none animate-fade-in"
      style={{
        background: '#000000e6',
        zIndex: 50,
      }}
    >
      <img
        src={blindfoldImg}
        alt=""
        className="w-full h-full object-cover"
        style={{ opacity: 0.99 }}
      />
    </div>
  )
}
