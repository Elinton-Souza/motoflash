import type { InputHTMLAttributes, ReactNode } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
  error?: string
  hint?: string
  // Elemento à direita do campo (ex.: botão de mostrar senha).
  trailing?: ReactNode
  inputSize?: 'md' | 'lg'
}

export function Input({ label, id, error, hint, trailing, inputSize = 'md', className = '', ...props }: InputProps) {
  const height = inputSize === 'lg' ? 'h-14 text-base' : 'h-12 text-sm'
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">{label}</label>
      <div className="relative">
        <input
          id={id}
          aria-invalid={!!error}
          aria-describedby={error || hint ? `${id}-help` : undefined}
          className={`${height} w-full rounded-xl border bg-white px-3.5 text-ink outline-none transition placeholder:text-slate-400 focus:ring-4 disabled:bg-slate-50 disabled:text-slate-500 ${trailing ? 'pr-12' : ''} ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : 'border-slate-200 focus:border-brand focus:ring-orange-100'} ${className}`}
          {...props}
        />
        {trailing && <div className="absolute inset-y-0 right-2 flex items-center">{trailing}</div>}
      </div>
      {(error || hint) && <p id={`${id}-help`} className={`text-xs ${error ? 'text-red-600' : 'text-muted'}`}>{error ?? hint}</p>}
    </div>
  )
}
