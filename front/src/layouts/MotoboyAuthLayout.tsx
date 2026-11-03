import type { ReactNode } from 'react'
import { ChevronLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Logo } from '../components/Logo'

// Acesso do motoboy: pensado para o celular, com campos e botões grandes.
// No computador, a mesma tela aparece centralizada no formato de celular.
export function MotoboyAuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-ink md:grid md:place-items-center md:py-10">
      <div className="flex min-h-screen w-full flex-col md:min-h-0 md:max-w-md md:overflow-hidden md:rounded-[2rem] md:shadow-2xl">
        <header className="px-6 pb-8 pt-6 text-white">
          <div className="flex items-center justify-between">
            <Logo compact />
            <Link to="/" className="inline-flex items-center gap-1 text-sm font-medium text-white/70 hover:text-white"><ChevronLeft size={16} />Trocar perfil</Link>
          </div>
          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-flash">MotoFlash para motoboys</p>
          <p className="mt-2 text-2xl font-bold leading-tight">Corridas perto de você, ganhos na palma da mão.</p>
        </header>
        <section className="flex-1 rounded-t-[2rem] bg-white px-6 pb-10 pt-8 md:rounded-b-[2rem]">{children}</section>
      </div>
    </main>
  )
}
