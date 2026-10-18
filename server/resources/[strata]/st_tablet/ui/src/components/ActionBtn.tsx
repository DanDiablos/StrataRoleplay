interface ActionBtnProps {
  onClick?: () => void
  variant?: 'default' | 'primary' | 'danger' | 'success'
  disabled?: boolean
  children: React.ReactNode
  className?: string
  type?: 'button' | 'submit'
}

export default function ActionBtn({
  onClick, variant = 'default', disabled, children, className = '', type = 'button'
}: ActionBtnProps): React.ReactElement {
  const base = 'px-[14px] py-[5px] border text-[0.8rem] font-semibold transition-colors disabled:opacity-40 disabled:pointer-events-none'

  const variants = {
    default: 'border-white/10 bg-white/4 text-white/60 hover:bg-white/8',
    primary: 'border-primary/35 bg-primary/8 text-[#FF8C42] hover:bg-primary/15',
    danger:  'border-menu-error-lt/40 bg-menu-error/15 text-red-300/70 hover:bg-menu-error/25',
    success: 'border-menu-success/40 bg-menu-success/10 text-menu-success-lt hover:bg-menu-success/20',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  )
}
