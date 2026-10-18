import React from 'react'

interface LoaderProps {
  text?: string
}

export default function Loader({ text }: LoaderProps): React.ReactElement {
  return (
    <div className="flex flex-col items-center justify-center gap-2.5 h-full">
      <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      {text && (
        <span className="font-mono text-[0.65rem] text-white/20 uppercase tracking-[0.08em]">{text}</span>
      )}
    </div>
  )
}
