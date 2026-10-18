import { Plus } from 'lucide-react'
import { useStore, STATES } from '../store'
import Navbar from '../components/Navbar'
import CharacterCard from '../components/CharacterCard'
import CharacterLabels from '../components/CharacterLabels'

export default function CharactersScreen(): React.ReactElement {
  const characters     = useStore(s => s.characters)
  const characterLimit = useStore(s => s.characterLimit)
  const motd           = useStore(s => s.motd)
  const dispatch       = useStore(s => s.dispatch)

  const motdPill = motd ? (
    <div className="flex items-center gap-[7px] bg-white/[0.03] border border-primary/[0.18] px-[0.72rem] py-[0.28rem] max-w-[340px] overflow-hidden">
      <span className="font-display font-bold text-[0.65rem] uppercase tracking-[0.1em] text-primary shrink-0">MOTD</span>
      <div className="w-px h-[10px] bg-white/10 shrink-0" />
      <span className="font-mono text-[0.68rem] text-white/50 whitespace-nowrap overflow-hidden text-ellipsis">{motd}</span>
    </div>
  ) : undefined

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <Navbar subLabel="character selection" right={motdPill} />

      <CharacterLabels characters={characters} />

      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80vw] h-[50vh] pointer-events-none z-0"
        style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(255,92,58,0.08) 0%, transparent 65%)' }}
      />

      <div
        className="absolute bottom-14 left-0 right-0 flex items-end justify-center gap-2 z-[1] px-2 overflow-x-auto max-w-[95vw] mx-auto pb-1"
        style={{ scrollbarWidth: 'thin' }}
      >
        {characters.length < characterLimit && (
          <button
            type="button"
            onClick={() => dispatch('SET_STATE', { state: STATES.CREATE })}
            className="w-[220px] shrink-0 h-[100px] flex flex-col items-center justify-center gap-2 bg-[rgba(26,26,26,0.6)] border border-dashed border-white/[0.12] text-white/30 hover:border-primary/30 hover:text-primary/60 transition-all duration-200 cursor-pointer select-none"
          >
            <Plus size={22} strokeWidth={1.5} />
            <span className="font-mono text-[0.72rem] uppercase tracking-[0.08em]">New Character</span>
          </button>
        )}
        {characters.map((char, i) => (
          <CharacterCard key={char.ID ?? i} character={char} />
        ))}
      </div>

      <p className="absolute bottom-3 left-0 right-0 text-center font-mono text-[0.68rem] text-white/25 tracking-[0.06em] pointer-events-none">
        double-click to select · right-click to delete
      </p>
    </div>
  )
}
