import { Bell, ChevronDown } from 'lucide-react'

type HeaderProps = { title: string; name: string; role: string }

export function Header({ title, name, role }: HeaderProps) {
  return (
    <header className="flex h-[72px] items-center justify-between border-b border-slate-200 bg-white px-5 md:h-20 md:px-8">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-ink">{title}</h1>
        <p className="mt-0.5 text-xs text-muted">{role}</p>
      </div>
      <div className="flex items-center gap-4">
        <button type="button" className="relative grid size-10 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100" aria-label="Notificações">
          <Bell size={19} />
          <span className="absolute right-2.5 top-2.5 size-1.5 rounded-full bg-brand ring-2 ring-white" />
        </button>
        <div className="flex items-center gap-2.5 border-l border-slate-200 pl-4">
          <span className="grid size-9 place-items-center rounded-full bg-orange-100 text-sm font-bold text-brand">{name.charAt(0)}</span>
          <div className="hidden text-left sm:block"><p className="text-sm font-semibold text-ink">{name}</p><p className="text-xs text-muted">{role}</p></div>
          <ChevronDown size={16} className="text-slate-400" />
        </div>
      </div>
    </header>
  )
}
