interface Props {
  text?: string
  static?: boolean
}

export default function Loader({ text, static: isStatic }: Props): React.ReactElement {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${isStatic ? 'absolute inset-0' : 'flex-1 h-full'}`}>
      <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      {text && (
        <span className="text-white/40 text-[11px] font-medium uppercase tracking-[0.3px]">
          {text}
        </span>
      )}
    </div>
  )
}
