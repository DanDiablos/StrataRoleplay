import { useStore } from '../../store.ts'
import { sendNui } from '../../nui.ts'
import SliderRow from '../SliderRow.tsx'
import StepControl from '../StepControl.tsx'
import SectionHeader from '../SectionHeader.tsx'

const FACE_FEATURES = [
  'Nose Width', 'Nose Peak Height', 'Nose Peak Length', 'Nose Bone Height',
  'Nose Peak Lowering', 'Nose Bone Twist', 'Eyebrow Height', 'Eyebrow Depth',
  'Cheekbone Height', 'Cheekbone Width', 'Cheeks Width', 'Eyes Opening',
  'Lips Thickness', 'Jaw Bone Width', 'Jaw Bone Placement', 'Chin Bone Length',
  'Chin Bone Drop', 'Chin Bone Effect', 'Neck Thickness', 'Extra',
]

const EYE_OPTIONS    = Array.from({ length: 31 }, (_, i) => i)
const PARENT_OPTIONS = Array.from({ length: 46 }, (_, i) => i)

export default function FaceTab(): React.ReactElement | null {
  const ped          = useStore((s) => s.ped)
  const setHeadBlend = useStore((s) => s.setHeadBlend)
  const setFeature   = useStore((s) => s.setFaceFeature)
  const setEyeColor  = useStore((s) => s.setEyeColor)

  if (!ped) return null
  const { face } = ped.customization

  const handleBlend = (faceKey: 'face1' | 'face2' | 'face3', type: 'index' | 'texture' | 'mix', raw: number) => {
    const value = type === 'mix' ? raw / 100 : raw
    setHeadBlend(faceKey, type, value)
    sendNui('SetPedHeadBlendData', { face: faceKey, type, value })
  }

  const handleFeature = (index: number, value: number) => {
    setFeature(index, value)
    sendNui('SetPedFaceFeature', { index, value })
  }

  const handleEye = (value: number) => {
    setEyeColor(value)
    sendNui('SetPedEyeColor', { value })
  }

  return (
    <div className="pb-2">
      {(['face1', 'face2', 'face3'] as const).map((fk, fi) => (
        <div key={fk}>
          <SectionHeader title={fi === 0 ? 'Parent A' : fi === 1 ? 'Parent B' : 'Skin Parent'} />
          <StepControl label="Shape" value={face[fk].index}   options={PARENT_OPTIONS} onChange={(v) => handleBlend(fk, 'index',   v)} />
          <StepControl label="Skin"  value={face[fk].texture} options={PARENT_OPTIONS} onChange={(v) => handleBlend(fk, 'texture', v)} />
          <SliderRow   label="Mix"   value={Math.round(face[fk].mix * 100)} min={0} max={100} onChange={(v) => handleBlend(fk, 'mix', v)} />
        </div>
      ))}

      <SectionHeader title="Eyes" />
      <StepControl label="Eye Color" value={face.eyeColor} options={EYE_OPTIONS} onChange={handleEye} />

      <SectionHeader title="Face Features" />
      {FACE_FEATURES.map((name, i) => (
        <SliderRow
          key={i}
          label={name}
          value={face.features[i] ?? 50}
          min={0} max={100}
          onChange={(v) => handleFeature(i, v)}
        />
      ))}
    </div>
  )
}
