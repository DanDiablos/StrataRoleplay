import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useStore } from '../../store.ts'
import { sendNui } from '../../nui.ts'

const INGREDIENT_LABELS = [
  'Acetone', 'Battery Acid', 'Iodine Crystals', 'Sulfuric Acid',
  'Phosphorous', 'Gasoline', 'Lithium', 'Anhydrous Ammonia',
]

export default function MethDialog(): React.ReactElement | null {
  const showing = useStore(s => s.methShowing)
  const config = useStore(s => s.methConfig)
  const dispatch = useStore(s => s.dispatch)

  const [ingredients, setIngredients] = useState<number[]>([])
  const [cookTime, setCookTime] = useState(1)

  useEffect(() => {
    if (showing) {
      setIngredients(Array(config.ingredients).fill(0))
      setCookTime(1)
    }
  }, [showing, config.ingredients])

  useEffect(() => {
    if (!showing) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleCancel()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [showing])

  if (!showing) return null

  const handleCancel = () => {
    sendNui('Meth:Cancel')
    dispatch('CLOSE_METH')
  }

  const handleSubmit = () => {
    sendNui('Meth:Start', {
      tableId: config.tableId,
      ingredients,
      cookTime,
    })
    dispatch('CLOSE_METH')
  }

  const setIngredient = (idx: number, val: number) => {
    setIngredients(prev => {
      const next = [...prev]
      next[idx] = val
      return next
    })
  }

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center animate-fade-in" style={{ zIndex: 120 }}>
      <div className="absolute inset-0 bg-black/40" onClick={handleCancel} />
      <div
        className="relative w-[440px] border border-white/8"
        style={{ background: 'rgba(10,10,10,0.95)' }}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-white/[0.06] bg-menu-surface-lt">
          <span className="font-display font-bold uppercase tracking-[0.12em] text-[0.78rem] text-white/70">
            Select Ingredient Mixture
          </span>
        </div>

        {/* Sliders */}
        <div className="px-4 py-4 flex flex-col gap-4">
          {ingredients.map((val, i) => (
            <div key={i} className="flex flex-col gap-1">
              <div className="flex justify-between">
                <span className="font-mono text-[0.68rem] text-white/40 uppercase">
                  {INGREDIENT_LABELS[i] ?? `Ingredient ${i + 1}`}
                </span>
                <span className="font-mono text-[0.68rem] text-white/60">{val}</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={val}
                onChange={e => setIngredient(i, Number(e.target.value))}
              />
            </div>
          ))}

          {/* Cook time */}
          <div className="flex flex-col gap-1 mt-2 pt-3 border-t border-white/[0.06]">
            <div className="flex justify-between">
              <span className="font-mono text-[0.68rem] text-white/40 uppercase">Cook Time</span>
              <span className="font-mono text-[0.68rem] text-white/60">{cookTime} min</span>
            </div>
            <input
              type="range"
              min={1}
              max={config.cookTimeMax || 10}
              value={cookTime}
              onChange={e => setCookTime(Number(e.target.value))}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-4 py-3 border-t border-white/[0.06]">
          <button
            onClick={handleCancel}
            className="px-[14px] py-[5px] border text-[0.8rem] font-semibold border-menu-error-lt/40 bg-menu-error/15 text-red-300/70 hover:bg-menu-error/25 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-[14px] py-[5px] border text-[0.8rem] font-semibold border-primary/35 bg-primary/8 text-[#FF8C42] hover:bg-primary/15 transition-colors"
          >
            Start Cook
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
