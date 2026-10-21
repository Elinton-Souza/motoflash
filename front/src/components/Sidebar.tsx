import type { LucideIcon } from 'lucide-react'
import { LogOut } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Logo } from './Logo'

export type NavigationItem = { label: string; to: string; icon: LucideIcon }

export function Sidebar({ items }: { items: NavigationItem[] }) {
  const navigate = useNavigate()
  return (
    <>
    <aside className="hidden min-h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white px-4 py-6 md:flex">
      <div className="px-2"><Logo /></div>
      <nav className="mt-10 space-y-1" aria-label="Navegação principal">
        {items.map(({ label, to, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${isActive ? 'bg-flash-soft text-brand' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>
            <Icon size={19} strokeWidth={2} />{label}
          </NavLink>
        ))}
      </nav>
      <button type="button" onClick={() => navigate('/')} className="mt-auto flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-800">
        <LogOut size={19} />Sair
      </button>
    </aside>
    <nav className="fixed inset-x-0 bottom-0 z-20 flex h-16 items-center justify-around border-t border-slate-200 bg-white px-2 md:hidden" aria-label="Navegação principal móvel">
      {items.slice(0, 5).map(({ label, to, icon: Icon }) => <NavLink key={to} to={to} className={({ isActive }) => `flex min-w-0 flex-col items-center gap-1 px-1 text-[10px] font-semibold ${isActive ? 'text-brand' : 'text-slate-400'}`}><Icon size={18} /><span className="max-w-15 truncate">{label}</span></NavLink>)}
    </nav>
    </>
  )
}
