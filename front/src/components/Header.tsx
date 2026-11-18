import type { ReactNode } from 'react'
import { LogOut } from 'lucide-react'

type HeaderProps = { title: string; name: string; role: string; onLogout: () => void; extra?: ReactNode }

export function Header({ title, name, role, onLogout, extra }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-5 backdrop-blur md:h-[72px] md:px-8">
      <h1 className="truncate text-lg font-bold tracking-tight text-ink md:text-xl">{title}</h1>
      <div className="flex items-center gap-3">
        {extra}
        <div className="hidden items-center gap-2.5 sm:flex">
          <span className="grid size-9 place-items-center rounded-full bg-flash-soft text-sm font-bold text-brand">{name.charAt(0)}</span>
          <div className="text-left"><p className="max-w-40 truncate text-sm font-semibold text-ink">{name}</p><p className="text-xs text-muted">{role}</p></div>
        </div>
        <button type="button" onClick={onLogout} className="grid size-10 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-ink md:hidden" aria-label="Sair"><LogOut size={19} /></button>
      </div>
    </header>
  )
}
