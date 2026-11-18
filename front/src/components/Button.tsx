import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'success'
  size?: 'md' | 'lg'
  fullWidth?: boolean
}

const variants = {
  primary: 'bg-brand text-white hover:bg-brand-dark focus-visible:outline-brand',
  secondary: 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-slate-400',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-slate-400',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:outline-emerald-600',
}

const sizes = {
  md: 'h-11 rounded-xl px-4 text-sm',
  // Alvo de toque grande para o motoboy (uso com uma mão, em movimento).
  lg: 'h-14 rounded-2xl px-5 text-base',
}

export function Button({ children, variant = 'primary', size = 'md', fullWidth = false, className = '', disabled, ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-60 ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${variants[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
