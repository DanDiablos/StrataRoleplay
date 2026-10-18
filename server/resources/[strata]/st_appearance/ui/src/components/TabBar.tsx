interface Props {
  tabs: string[]
  active: number
  onChange: (i: number) => void
}

export default function TabBar({ tabs, active, onChange }: Props): React.ReactElement {
  return (
    <div className="h-10 flex items-stretch border-b border-white/[0.07] bg-[rgba(0,0,0,0.2)] shrink-0">
      {tabs.map((tab, i) => (
        <button
          key={tab}
          onClick={() => onChange(i)}
          className={`flex-1 font-medium uppercase tracking-[0.06em] text-[0.72rem] transition-colors relative ${
            i === active ? 'text-primary' : 'text-white/35 hover:text-white/60'
          }`}
        >
          {tab}
          {i === active && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" />
          )}
        </button>
      ))}
    </div>
  )
}
