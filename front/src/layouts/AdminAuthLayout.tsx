import type { ReactNode } from 'react'
import { ChevronLeft, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Logo } from '../components/Logo'

// Acesso do administrador: tela simples e centralizada, separada dos
// acessos de motoboy e restaurante.
export function AdminAuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col bg-page px-6 py-7 sm:px-12">
      <div className="flex items-center justify-between">
        <Logo compact />
        <Link to="/" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-ink"><ChevronLeft size={16} />Trocar perfil</Link>
      </div>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
        <span className="mb-6 inline-flex size-12 items-center justify-center rounded-2xl bg-ink text-flash"><ShieldCheck size={24} /></span>
        {children}
      </div>
    </main>
  )
}
