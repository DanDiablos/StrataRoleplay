import { useStore } from '../../store.ts'
import { sendNui } from '../../nui.ts'
import StepControl from '../StepControl.tsx'
import SectionHeader from '../SectionHeader.tsx'

interface CompDef { name: string; id: number; label: string }
interface PropDef  { name: string; id: number; label: string }

const COMP_ACCESSORIES: CompDef[] = [
  { name: 'mask',        id: 1, label: 'Mask'       },
  { name: 'accessory',   id: 7, label: 'Neck / Acc' },
]

const PROPS: PropDef[] = [
  { name: 'hat',      id: 0, label: 'Hat'      },
  { name: 'glass',    id: 1, label: 'Glasses'  },
  { name: 'ear',      id: 2, label: 'Earring'  },
  { name: 'watch',    id: 6, label: 'Watch'    },
  { name: 'bracelet', id: 7, label: 'Bracelet' },
]

function CompRow({ def }: { def: CompDef }): React.ReactElement {
  const ped              = useStore((s) => s.ped)
  const drawables        = useStore((s) => s.drawables.components[def.id])
  const textureMax       = useStore((s) => s.textures.components[`${def.id}`])
  const setComponent     = useStore((s) => s.setComponent)
  const locked           = useStore((s) => s.componentLocks[def.name] ?? false)
  const toggleLock       = useStore((s) => s.toggleComponentLock)

  const comp    = ped?.customization.components[def.name] ?? { drawableId: 0, textureId: 0 }
  const drawOpts = drawables ?? [comp.drawableId]
  const texOpts  = Array.from({ length: textureMax ?? 1 }, (_, i) => i)

  const handleDrawable = (value: number) => {
    setComponent(def.name, 'drawableId', value)
    sendNui('SetPedComponentVariation', { name: def.name, type: 'drawableId', value })
    sendNui('GetNumberOfPedTextureVariations', { componentId: def.id, drawableId: value, textureId: 0 })
    setComponent(def.name, 'textureId', 0)
    sendNui('SetPedComponentVariation', { name: def.name, type: 'textureId', value: 0 })
  }

  const handleTexture = (value: number) => {
    setComponent(def.name, 'textureId', value)
    sendNui('SetPedComponentVariation', { name: def.name, type: 'textureId', value })
  }

  return (
    <>
      <StepControl label={def.label} value={comp.drawableId} options={drawOpts} onChange={handleDrawable} locked={locked} onToggleLock={() => toggleLock(def.name)} />
      {texOpts.length > 1 && (
        <StepControl label="↳ Texture" value={comp.textureId} options={texOpts} onChange={handleTexture} secondary />
      )}
    </>
  )
}

function PropRow({ def }: { def: PropDef }): React.ReactElement {
  const ped        = useStore((s) => s.ped)
  const drawables  = useStore((s) => s.drawables.props[def.id])
  const textureMax = useStore((s) => s.textures.props[`${def.id}`])
  const setProp    = useStore((s) => s.setProp)
  const locked     = useStore((s) => s.propLocks[def.name] ?? false)
  const toggleLock = useStore((s) => s.togglePropLock)

  const prop     = ped?.customization.props[def.name] ?? { drawableId: -1, textureId: 0 }
  const drawOpts = [-1, ...(drawables ?? [])]
  const texOpts  = Array.from({ length: textureMax ?? 1 }, (_, i) => i)

  const handleDrawable = (value: number) => {
    setProp(def.name, 'drawableId', value)
    sendNui('SetPedPropIndex', { name: def.name, type: 'drawableId', value })
    if (value >= 0) sendNui('GetNumberOfPedPropTextureVariations', { componentId: def.id, drawableId: value, textureId: 0 })
    setProp(def.name, 'textureId', 0)
    sendNui('SetPedPropIndex', { name: def.name, type: 'textureId', value: 0 })
  }

  const handleTexture = (value: number) => {
    setProp(def.name, 'textureId', value)
    sendNui('SetPedPropIndex', { name: def.name, type: 'textureId', value })
  }

  return (
    <>
      <StepControl label={def.label} value={prop.drawableId} options={drawOpts} onChange={handleDrawable} noneLabel="None" locked={locked} onToggleLock={() => toggleLock(def.name)} />
      {prop.drawableId >= 0 && texOpts.length > 1 && (
        <StepControl label="↳ Texture" value={prop.textureId} options={texOpts} onChange={handleTexture} secondary />
      )}
    </>
  )
}

export default function AccessoriesTab(): React.ReactElement {
  return (
    <div className="pb-2">
      <SectionHeader title="Clothing" />
      {COMP_ACCESSORIES.map((def) => <CompRow key={def.name} def={def} />)}
      <SectionHeader title="Props" />
      {PROPS.map((def) => <PropRow key={def.name} def={def} />)}
    </div>
  )
}
