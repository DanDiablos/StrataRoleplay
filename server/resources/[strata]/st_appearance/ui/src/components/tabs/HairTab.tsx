import { useStore } from '../../store.ts'
import { sendNui } from '../../nui.ts'
import StepControl from '../StepControl.tsx'
import SliderRow from '../SliderRow.tsx'
import SectionHeader from '../SectionHeader.tsx'

const HAIR_ID    = 2
const COLOR_64   = Array.from({ length: 64 }, (_, i) => i)
const EYEBROW_34 = Array.from({ length: 34 }, (_, i) => i)
const FACIAL_29  = Array.from({ length: 29 }, (_, i) => i)
const CHEST_17   = Array.from({ length: 17 }, (_, i) => i)

export default function HairTab(): React.ReactElement | null {
  const ped            = useStore((s) => s.ped)
  const drawables      = useStore((s) => s.drawables.components[HAIR_ID])
  const textureMax     = useStore((s) => s.textures.components[`${HAIR_ID}`])
  const hairColorsMax  = useStore((s) => s.hairColorsMax)
  const overlaysMax    = useStore((s) => s.hairOverlaysMax)
  const setComponent   = useStore((s) => s.setComponent)
  const setHairColor   = useStore((s) => s.setHairColor)
  const setHairOverlay = useStore((s) => s.setHairOverlay)
  const setOverlay     = useStore((s) => s.setOverlay)

  if (!ped) return null

  const hair      = ped.customization.components['hair'] ?? { drawableId: 0, textureId: 0 }
  const colors    = ped.customization.colors
  const overlay   = ped.customization.overlay
  const hairOvIdx = ped.customization.hairOverlay ?? 0

  const hairOptions    = drawables ?? [hair.drawableId]
  const textureOptions = Array.from({ length: textureMax ?? 1 }, (_, i) => i)
  const colorOptions   = Array.from({ length: hairColorsMax }, (_, i) => i)
  const overlayOptions = Array.from({ length: overlaysMax }, (_, i) => i)

  const handleDrawable = (value: number) => {
    setComponent('hair', 'drawableId', value)
    sendNui('SetPedComponentVariation', { name: 'hair', type: 'drawableId', value })
    sendNui('GetNumberOfPedTextureVariations', { componentId: HAIR_ID, drawableId: value, textureId: 0 })
    setComponent('hair', 'textureId', 0)
    sendNui('SetPedComponentVariation', { name: 'hair', type: 'textureId', value: 0 })
  }

  const handleTexture = (value: number) => {
    setComponent('hair', 'textureId', value)
    sendNui('SetPedComponentVariation', { name: 'hair', type: 'textureId', value })
  }

  const handleHairOverlay = (value: number) => {
    setHairOverlay(value)
    sendNui('SetPedHairOverlay', { value })
  }

  const handleColor = (name: string, colorType: string, value: number) => {
    setHairColor(name, colorType, value)
    sendNui('SetPedHairColor', { name, type: colorType, value })
    sendNui('GetPedHairRgbColor', { colorId: value, type: colorType, name })
  }

  const handleOverlay = (key: string, extraType: string, raw: number) => {
    const value = extraType === 'opacity' ? raw / 100 : raw
    setOverlay(key, extraType, value)
    sendNui('SetPedHeadOverlay', { type: key, extraType, value })
  }

  return (
    <div className="pb-2">
      <SectionHeader title="Hair Style" />
      <StepControl label="Style"   value={hair.drawableId} options={hairOptions}    onChange={handleDrawable} />
      {textureOptions.length > 1 && (
        <StepControl label="↳ Texture" value={hair.textureId} options={textureOptions} onChange={handleTexture} secondary />
      )}
      {overlayOptions.length > 0 && (
        <StepControl label="Overlay" value={hairOvIdx} options={overlayOptions} onChange={handleHairOverlay} />
      )}

      <SectionHeader title="Hair Color" />
      <StepControl
        label="Primary"
        value={colors['hair']?.['color1']?.index ?? 0}
        options={colorOptions}
        onChange={(v) => handleColor('hair', 'color1', v)}
      />
      <StepControl
        label="Highlight"
        value={colors['hair']?.['color2']?.index ?? 0}
        options={colorOptions}
        onChange={(v) => handleColor('hair', 'color2', v)}
      />

      <SectionHeader title="Eyebrows" />
      <StepControl label="Style"   value={overlay['eyebrows']?.index ?? 0} options={EYEBROW_34} onChange={(v) => handleOverlay('eyebrows', 'index', v)} />
      <SliderRow   label="Opacity" value={Math.round((overlay['eyebrows']?.opacity ?? 1) * 100)} min={0} max={100} onChange={(v) => handleOverlay('eyebrows', 'opacity', v)} />
      <StepControl label="Color"   value={overlay['eyebrows']?.color1 ?? 0} options={COLOR_64}  onChange={(v) => handleOverlay('eyebrows', 'color1', v)} />

      <SectionHeader title="Facial Hair" />
      <StepControl label="Style"   value={overlay['facialhair']?.index ?? 0}  options={FACIAL_29} onChange={(v) => handleOverlay('facialhair', 'index',  v)} />
      <SliderRow   label="Opacity" value={Math.round((overlay['facialhair']?.opacity ?? 0) * 100)} min={0} max={100} onChange={(v) => handleOverlay('facialhair', 'opacity', v)} />
      <StepControl label="Color"   value={overlay['facialhair']?.color1 ?? 0} options={COLOR_64}  onChange={(v) => handleOverlay('facialhair', 'color1', v)} />
      <StepControl label="Color 2" value={overlay['facialhair']?.color2 ?? 0} options={COLOR_64}  onChange={(v) => handleOverlay('facialhair', 'color2', v)} />

      <SectionHeader title="Chest Hair" />
      <StepControl label="Style"   value={overlay['chesthair']?.index ?? 0}  options={CHEST_17} onChange={(v) => handleOverlay('chesthair', 'index',  v)} />
      <SliderRow   label="Opacity" value={Math.round((overlay['chesthair']?.opacity ?? 0) * 100)} min={0} max={100} onChange={(v) => handleOverlay('chesthair', 'opacity', v)} />
      <StepControl label="Color"   value={overlay['chesthair']?.color1 ?? 0} options={COLOR_64} onChange={(v) => handleOverlay('chesthair', 'color1', v)} />
    </div>
  )
}
