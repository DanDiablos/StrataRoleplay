import { Search, X } from 'lucide-react'

interface Props {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  onSearch?: () => void
  className?: string
}

export default function SearchInput({ value, onChange, placeholder = 'Search…', onSearch, className = '' }: Props): React.ReactElement {
  return (
    <div className={`relative flex-1 ${className}`}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') onSearch?.() }}
        placeholder={placeholder}
        className="w-full h-9 pl-3 pr-8 bg-menu-surface-lt border border-white/10 text-[0.88rem] text-white/80 placeholder:text-white/25 focus:border-primary/50 transition-colors"
      />
      <div className="absolute right-2 top-1/2 -translate-y-1/2">
        {value ? (
          <button
            onClick={() => onChange('')}
            className="text-white/30 hover:text-white/70 transition-colors"
          >
            <X size={12} />
          </button>
        ) : (
          <button
            onClick={onSearch}
            className={`transition-colors ${onSearch ? 'text-white/40 hover:text-primary' : 'text-white/20 pointer-events-none'}`}
          >
            <Search size={12} />
          </button>
        )}
      </div>
    </div>
  )
}
