import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useStore } from '../../store.ts'
import { sendNui } from '../../nui.ts'
import StepControl from '../StepControl.tsx'
import SectionHeader from '../SectionHeader.tsx'

const FACES_ID = 0

interface Props {
  showModelSelector?: boolean
}

export default function BodyTab({ showModelSelector }: Props): React.ReactElement | null {
  const ped             = useStore((s) => s.ped)
  const whitelistedPeds = useStore((s) => s.whitelistedPeds)
  const drawables       = useStore((s) => s.drawables.components[FACES_ID])
  const setComponent    = useStore((s) => s.setComponent)
  const isNaked         = useStore((s) => s.isNaked)
  const setNaked        = useStore((s) => s.setNaked)

  const [dropOpen, setDropOpen] = useState(false)
  const dropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    sendNui('GetNumberOfPedDrawableVariations', { componentId: FACES_ID })
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (!ped) return null

  const facesComp   = ped.customization.components['face'] ?? { drawableId: 0, textureId: 0 }
  const facesOptions = drawables ?? [facesComp.drawableId]

  const handleFaces = (value: number) => {
    setComponent('face', 'drawableId', value)
    sendNui('SetPedComponentVariation', { name: 'face', type: 'drawableId', value })
    sendNui('GetNumberOfPedTextureVariations', { componentId: FACES_ID, drawableId: value, textureId: 0 })
    setComponent('face', 'textureId', 0)
  }

  const handleModel = (model: string) => {
    setDropOpen(false)
    sendNui('SetPed', { value: model })
  }

  const toggleNaked = () => {
    const next = !isNaked
    setNaked(next)
    sendNui('ToggleNekked', next)
  }

  return (
    <div className="pb-2">
      {showModelSelector && whitelistedPeds.length > 0 && (
        <>
          <SectionHeader title="Model" />
          <div className="px-4 py-3" ref={dropRef}>
            <div className="relative">
              <button
                onClick={() => setDropOpen((o) => !o)}
                className="w-full h-9 px-3 bg-menu-surface-lt border border-white/10 flex items-center justify-between text-[0.85rem] text-white/70 hover:border-white/20 transition-colors"
              >
                <span className="font-mono text-[0.75rem]">{ped.model || 'Select model…'}</span>
                <ChevronDown size={14} className={`text-white/30 transition-transform ${dropOpen ? 'rotate-180' : ''}`} />
              </button>
              {dropOpen && (
                <div className="absolute top-full left-0 right-0 z-50 bg-menu-surface border border-white/10 border-t-0 max-h-48 overflow-y-auto">
                  {whitelistedPeds.map((m) => (
                    <button
                      key={m}
                      onClick={() => handleModel(m)}
                      className={`w-full px-3 py-2 text-left font-mono text-[0.75rem] transition-colors ${
                        m === ped.model
                          ? 'text-primary bg-primary/8'
                          : 'text-white/60 hover:bg-menu-surface-lt hover:text-white/80'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <SectionHeader title="Skin" />
      <StepControl label="Face Mesh" value={facesComp.drawableId} options={facesOptions} onChange={handleFaces} />

      <SectionHeader title="Preview" />
      <div className="px-4 py-3">
        <button
          onClick={toggleNaked}
          className={`w-full py-2 border font-medium text-[0.8rem] uppercase tracking-[0.06em] transition-colors ${
            isNaked
              ? 'border-primary/40 bg-primary/10 text-primary'
              : 'border-white/10 bg-white/[0.03] text-white/50 hover:bg-white/[0.07]'
          }`}
        >
          {isNaked ? 'Restore Clothes' : 'Preview Naked'}
        </button>
      </div>
    </div>
  )
}
