interface Props {
  title: string
}

export default function SectionHeader({ title }: Props): React.ReactElement {
  return (
    <div className="px-4 py-2 bg-menu-surface border-y border-white/[0.05] mt-2 first:mt-0">
      <span className="font-display font-bold uppercase tracking-[0.12em] text-[0.7rem] text-white/45">
        {title}
      </span>
    </div>
  )
}
