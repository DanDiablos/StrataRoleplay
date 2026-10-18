import { useStore } from '../../store.ts'
import { sendNui } from '../../nui.ts'
import StepControl from '../StepControl.tsx'
import SectionHeader from '../SectionHeader.tsx'
import RandomizerControls from '../RandomizerControls'

interface CompDef { name: string; id: number; label: string; section: string }

const CLOTHES: CompDef[] = [
  { name: 'torso2',     id: 11, label: 'Jacket',     section: 'Upper Body' },
  { name: 'torso',      id: 3,  label: 'Torso',      section: 'Upper Body' },
  { name: 'undershirt', id: 8,  label: 'Undershirt',  section: 'Upper Body' },
  { name: 'leg',        id: 4,  label: 'Legs',        section: 'Lower Body' },
  { name: 'shoes',      id: 6,  label: 'Shoes',       section: 'Lower Body' },
  { name: 'bag',        id: 5,  label: 'Bag',         section: 'Equipment'  },
  { name: 'badge',      id: 10, label: 'Badge',       section: 'Equipment'  },
  { name: 'kevlar',     id: 9,  label: 'Kevlar',      section: 'Equipment'  },
]

const SECTIONS = ['Upper Body', 'Lower Body', 'Equipment']

function ComponentRow({ def }: { def: CompDef }): React.ReactElement {
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

export default function ClothesTab(): React.ReactElement {
  return (
    <div className="pb-2">
      <RandomizerControls />
      {SECTIONS.map((section) => (
        <div key={section}>
          <SectionHeader title={section} />
          {CLOTHES.filter((c) => c.section === section).map((def) => (
            <ComponentRow key={def.name} def={def} />
          ))}
        </div>
      ))}
    </div>
  )
}
