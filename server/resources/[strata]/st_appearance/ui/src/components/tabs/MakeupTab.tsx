import { useStore } from '../../store.ts'
import { sendNui } from '../../nui.ts'
import StepControl from '../StepControl.tsx'
import SliderRow from '../SliderRow.tsx'
import SectionHeader from '../SectionHeader.tsx'

const COLOR_64 = Array.from({ length: 64 }, (_, i) => i)

interface OverlayDef { key: string; label: string; maxIndex: number; hasColor1?: boolean }

const OVERLAYS: OverlayDef[] = [
  { key: 'blemish',               label: 'Blemish',           maxIndex: 23           },
  { key: 'freckles',              label: 'Freckles',          maxIndex: 17           },
  { key: 'complexion',            label: 'Complexion',        maxIndex: 11           },
  { key: 'sundamage',              label: 'Sun Damage',        maxIndex: 10           },
  { key: 'ageing',                label: 'Ageing',            maxIndex: 14           },
  { key: 'bodyblemish',           label: 'Body Blemish',      maxIndex: 11           },
  { key: 'addbodyblemish',        label: 'Add. Body Blemish', maxIndex: 11           },
  { key: 'makeup',                label: 'Makeup',            maxIndex: 74, hasColor1: true },
  { key: 'blush',                 label: 'Blush',             maxIndex: 6,  hasColor1: true },
  { key: 'lipstick',              label: 'Lipstick',          maxIndex: 9,  hasColor1: true },
]

export default function MakeupTab(): React.ReactElement | null {
  const ped        = useStore((s) => s.ped)
  const setOverlay = useStore((s) => s.setOverlay)

  if (!ped) return null
  const { overlay } = ped.customization

  const handle = (key: string, extraType: string, raw: number) => {
    const value = extraType === 'opacity' ? raw / 100 : raw
    setOverlay(key, extraType, value)
    sendNui('SetPedHeadOverlay', { type: key, extraType, value })
  }

  return (
    <div className="pb-2">
      {OVERLAYS.map(({ key, label, maxIndex, hasColor1 }) => {
        const entry       = overlay[key]
        const indexOptions = Array.from({ length: maxIndex + 1 }, (_, i) => i)
        return (
          <div key={key}>
            <SectionHeader title={label} />
            <StepControl label="Style"   value={entry?.index ?? 0} options={indexOptions} onChange={(v) => handle(key, 'index',   v)} />
            <SliderRow   label="Opacity" value={Math.round((entry?.opacity ?? 0) * 100)} min={0} max={100} onChange={(v) => handle(key, 'opacity', v)} />
            {hasColor1 && (
              <StepControl label="Color" value={entry?.color1 ?? 0} options={COLOR_64} onChange={(v) => handle(key, 'color1', v)} />
            )}
          </div>
        )
      })}
    </div>
  )
}
