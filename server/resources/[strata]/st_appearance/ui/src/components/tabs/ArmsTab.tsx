import { useStore } from '../../store.ts'
import { sendNui } from '../../nui.ts'
import StepControl from '../StepControl.tsx'
import SectionHeader from '../SectionHeader.tsx'

interface CompDef { name: string; id: number; label: string }

const ARMS: CompDef[] = [
  { name: 'torso', id: 3, label: 'Arms / Torso' },
]

function ArmRow({ def }: { def: CompDef }): React.ReactElement {
  const ped          = useStore((s) => s.ped)
  const drawables    = useStore((s) => s.drawables.components[def.id])
  const textureMax   = useStore((s) => s.textures.components[`${def.id}`])
  const setComponent = useStore((s) => s.setComponent)

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
      <StepControl label={def.label} value={comp.drawableId} options={drawOpts} onChange={handleDrawable} />
      {texOpts.length > 1 && (
        <StepControl label="↳ Texture" value={comp.textureId} options={texOpts} onChange={handleTexture} secondary />
      )}
    </>
  )
}

export default function ArmsTab(): React.ReactElement {
  return (
    <div className="pb-2">
      <SectionHeader title="Arms" />
      {ARMS.map((def) => <ArmRow key={def.name} def={def} />)}
    </div>
  )
}
