import { ArrowRight, Bike, Building2, ChevronLeft, CircleCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Logo } from '../../components/Logo'

const profiles = [
  { title: 'Sou Motoboy', description: 'Receba solicitações, acompanhe corridas e controle seus ganhos.', icon: Bike, to: '/motoboy/dashboard', hint: 'Quero fazer entregas' },
  { title: 'Sou Restaurante', description: 'Solicite entregadores e acompanhe suas entregas em um só lugar.', icon: Building2, to: '/restaurant/dashboard', hint: 'Quero enviar pedidos' },
]

export function SelectProfile() {
  return (
    <main className="min-h-screen bg-page px-6 py-7 sm:px-10">
      <div className="mx-auto max-w-5xl"><div className="flex items-center justify-between"><Logo /><Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-ink"><ChevronLeft size={17} />Voltar</Link></div>
        <section className="mx-auto mt-20 max-w-2xl text-center"><p className="text-sm font-semibold text-brand">Primeiro acesso</p><h1 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">Como você vai usar a MotoFlash?</h1><p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-muted">Escolha seu perfil para acessar uma experiência criada para a sua rotina.</p></section>
        <section className="mx-auto mt-10 grid max-w-4xl gap-5 md:grid-cols-2">
          {profiles.map(({ title, description, icon: Icon, to, hint }) => <Link key={title} to={to} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-7 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:border-brand/50 hover:shadow-xl hover:shadow-slate-200/60">
            <div className="grid size-14 place-items-center rounded-2xl bg-orange-50 text-brand transition group-hover:bg-brand group-hover:text-white"><Icon size={27} /></div>
            <h2 className="mt-8 text-xl font-bold tracking-tight text-ink">{title}</h2><p className="mt-2 min-h-12 text-sm leading-6 text-muted">{description}</p>
            <span className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-brand">{hint}<ArrowRight size={17} className="transition group-hover:translate-x-1" /></span>
          </Link>)}
        </section>
        <p className="mx-auto mt-10 flex items-center justify-center gap-2 text-center text-xs text-slate-400"><CircleCheck size={15} className="text-emerald-500" />Você poderá alternar seu perfil mais tarde.</p>
      </div>
    </main>
  )
}
