import { useStore } from '../../store.ts'
import darkMap from '../../assets/hunting-map-dark.webp'
import lightMap from '../../assets/hunting-map-light.webp'

export default function ImageOverlay(): React.ReactElement | null {
  const showing = useStore(s => s.overlayShowing)
  const data = useStore(s => s.overlayData)

  if (!showing || !data || data.length === 0) return null

  const item = data[0]
  const name = item?.Name as string | undefined

  let src: string | undefined
  if (name === 'hunting_map_dark') src = darkMap
  else if (name === 'hunting_map_light') src = lightMap
  else if (typeof name === 'string' && name.startsWith('vanityitem')) {
    const meta = item?.MetaData as { CustomItemImage?: string } | undefined
    src = meta?.CustomItemImage
  }

  if (!src) return null

  return (
    <div
      className="fixed animate-fade-in pointer-events-none"
      style={{
        top: '25vh',
        left: '2vw',
        width: '25vw',
        height: '50vh',
        zIndex: 15,
      }}
    >
      <img src={src} alt="" className="w-full h-full object-contain" />
    </div>
  )
}
