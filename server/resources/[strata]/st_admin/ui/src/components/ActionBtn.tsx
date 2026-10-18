interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'danger' | 'primary'
  children: React.ReactNode
}

export default function ActionBtn({ variant = 'default', children, className = '', ...props }: Props): React.ReactElement {
  const base = 'px-[14px] py-[5px] border text-[0.8rem] font-semibold transition-colors disabled:opacity-30 disabled:pointer-events-none'
  const variants = {
    default: 'border-white/10 bg-white/4 text-white/60 hover:bg-primary/10 hover:border-primary/30 hover:text-white',
    danger:  'border-menu-error-lt/40 bg-menu-error/15 text-red-300/70 hover:bg-menu-error/35 hover:border-menu-error-lt/60 hover:text-red-200',
    primary: 'border-primary/35 bg-primary/8 text-[#FF8C42] hover:bg-primary/18 hover:border-primary/50 hover:text-white',
  }
  return (
    <button {...props} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </button>
  )
}
