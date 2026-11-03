import type { ReactNode } from 'react'
import { ChevronLeft, KeyRound, MapPinned, Timer } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Logo } from '../components/Logo'

const highlights = [
  { icon: Timer, text: 'Motoboy mais próximo em segundos' },
  { icon: MapPinned, text: 'Acompanhamento no mapa em tempo real' },
  { icon: KeyRound, text: 'Códigos de confirmação na retirada e na entrega' },
]

// Acesso do restaurante: tela larga para o computador do balcão.
export function RestaurantAuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-screen bg-page lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <aside className="hidden flex-col justify-between bg-ink px-14 py-12 text-white lg:flex">
        <Logo />
        <div className="max-w-md">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-flash">MotoFlash para restaurantes</p>
          <h1 className="mt-4 text-4xl font-bold leading-tight">Suas entregas saindo do balcão sem telefonema.</h1>
          <ul className="mt-10 space-y-4">
            {highlights.map(({ icon: Icon, text }) => <li key={text} className="flex items-center gap-3 text-sm text-slate-300"><span className="grid size-9 place-items-center rounded-lg bg-white/10 text-flash"><Icon size={17} /></span>{text}</li>)}
          </ul>
        </div>
        <p className="text-xs text-slate-500">© 2026 MotoFlash</p>
      </aside>
      <section className="flex min-h-screen flex-col px-6 py-7 sm:px-12">
        <div className="flex items-center justify-between">
          <div className="lg:invisible"><Logo compact /></div>
          <Link to="/" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-ink"><ChevronLeft size={16} />Trocar perfil</Link>
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 items-center py-10">{children}</div>
      </section>
    </main>
  )
}
