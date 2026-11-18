import type { LucideIcon } from 'lucide-react'
import { LogOut } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { Logo } from './Logo'

export type NavigationItem = { label: string; short?: string; to: string; icon: LucideIcon }

type SidebarProps = { items: NavigationItem[]; onLogout: () => void; home: string }

export function Sidebar({ items, onLogout, home }: SidebarProps) {
  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-slate-200 bg-white px-3 py-6 md:flex">
        <div className="px-3"><Logo to={home} /></div>
        <nav className="mt-8 space-y-0.5" aria-label="Navegação principal">
          {items.map(({ label, to, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-flash-soft text-brand' : 'text-slate-500 hover:bg-slate-50 hover:text-ink'}`}>
              <Icon size={18} />{label}
            </NavLink>
          ))}
        </nav>
        <button type="button" onClick={onLogout} className="mt-auto flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-ink">
          <LogOut size={18} />Sair
        </button>
      </aside>
      <nav className="fixed inset-x-0 bottom-0 z-30 grid h-16 border-t border-slate-200 bg-white md:hidden" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }} aria-label="Navegação principal">
        {items.map(({ label, short, to, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `flex flex-col items-center justify-center gap-1 text-[11px] font-semibold ${isActive ? 'text-brand' : 'text-slate-400'}`}>
            <Icon size={20} /><span className="truncate">{short ?? label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  )
}
