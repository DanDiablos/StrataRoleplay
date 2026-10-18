import { Search } from 'lucide-react'

interface SearchInputProps {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
}

export default function SearchInput({ value, onChange, placeholder = 'Search…', className = '' }: SearchInputProps): React.ReactElement {
  return (
    <div className={`relative flex items-center ${className}`}>
      <Search size={13} className="absolute left-3 text-white/25 pointer-events-none" />
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 w-full pl-8 pr-3 bg-menu-surface-lt border border-white/10 text-[0.88rem] text-white/80 placeholder-white/25 focus:border-primary/50 transition-colors"
      />
    </div>
  )
}
