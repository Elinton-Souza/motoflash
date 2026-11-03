import { ArrowRight, Bike, Store } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Logo } from '../../components/Logo'
import { portalPaths } from '../../lib/portal'

const options = [
  { title: 'Sou motoboy', description: 'Receba corridas próximas e acompanhe seus ganhos.', icon: Bike, to: portalPaths('motoboy').login },
  { title: 'Sou restaurante', description: 'Peça um motoboy e acompanhe a entrega no mapa.', icon: Store, to: portalPaths('restaurante').login },
]

// Porta de entrada: cada perfil segue para o seu próprio acesso.
export function Welcome() {
  return (
    <main className="flex min-h-screen flex-col bg-page px-6 py-7">
      <Logo />
      <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center py-12">
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">Como você usa a MotoFlash?</h1>
        <p className="mt-3 text-muted">Escolha o seu perfil para entrar.</p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {options.map(({ title, description, icon: Icon, to }) => (
            <Link key={to} to={to} className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-brand/60">
              <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-flash-soft text-brand transition group-hover:bg-brand group-hover:text-white"><Icon size={26} /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-lg font-bold text-ink">{title}</span>
                <span className="mt-1 block text-sm leading-5 text-muted">{description}</span>
              </span>
              <ArrowRight size={20} className="shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand" />
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
