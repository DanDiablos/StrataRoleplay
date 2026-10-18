import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  page: number
  pages: number
  onChange: (p: number) => void
}

export default function Pagination({ page, pages, onChange }: Props): React.ReactElement | null {
  if (pages <= 1) return null

  const items: Array<number | '...'> = []
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || Math.abs(i - page) <= 1) items.push(i)
    else if (items[items.length - 1] !== '...') items.push('...')
  }

  return (
    <div className="flex items-center justify-center gap-1 shrink-0 pt-2">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="w-7 h-7 flex items-center justify-center border border-white/10 bg-white/3 text-white/40 hover:text-white/70 hover:bg-white/7 disabled:opacity-30 disabled:pointer-events-none transition-colors"
      >
        <ChevronLeft size={12} />
      </button>
      {items.map((item, i) =>
        item === '...' ? (
          <span key={`e${i}`} className="w-7 h-7 flex items-center justify-center text-white/25 text-xs font-mono">
            …
          </span>
        ) : (
          <button
            key={item}
            onClick={() => onChange(item)}
            className={`w-7 h-7 flex items-center justify-center border text-[0.72rem] font-mono transition-colors
              ${item === page
                ? 'border-primary/40 bg-primary/10 text-primary'
                : 'border-white/10 bg-white/3 text-white/40 hover:text-white/70 hover:bg-white/7'
              }`}
          >
            {item}
          </button>
        )
      )}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page === pages}
        className="w-7 h-7 flex items-center justify-center border border-white/10 bg-white/3 text-white/40 hover:text-white/70 hover:bg-white/7 disabled:opacity-30 disabled:pointer-events-none transition-colors"
      >
        <ChevronRight size={12} />
      </button>
    </div>
  )
}
