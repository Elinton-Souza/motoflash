import { Outlet } from 'react-router-dom'
import { Bike, MapPin, Route } from 'lucide-react'
import { Logo } from '../components/Logo'

export function AuthLayout() {
  return (
    <main className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(420px,48%)]">
      <section className="relative hidden overflow-hidden bg-ink px-16 py-12 text-white lg:flex lg:flex-col">
        <Logo />
        <div className="relative z-10 my-auto max-w-md">
          <span className="mb-6 inline-flex size-14 items-center justify-center rounded-2xl bg-brand shadow-[0_15px_35px_-12px_rgba(255,59,31,0.7)]"><Bike size={29} /></span>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-flash">Entregas sem pausa</p>
          <h1 className="mt-4 text-5xl font-bold leading-[1.08] tracking-tight">A cidade se move com você.</h1>
          <p className="mt-6 max-w-sm text-base leading-7 text-slate-300">Uma operação de entregas simples, rápida e transparente para restaurantes e motoboys.</p>
        </div>
        <div className="absolute -bottom-20 -right-16 size-96 rounded-full border-[48px] border-white/5" />
        <div className="absolute bottom-16 right-16 grid size-20 place-items-center rounded-full border border-white/15 bg-white/10 text-flash"><Route size={32} /></div>
        <div className="absolute right-44 top-32 grid size-12 place-items-center rounded-full bg-brand text-white"><MapPin size={21} /></div>
        <p className="relative z-10 text-sm text-slate-400">© 2026 MotoFlash. Tudo em movimento.</p>
      </section>
      <section className="flex min-h-screen flex-col bg-page px-6 py-7 sm:px-10 lg:px-[clamp(3rem,7vw,8rem)]">
        <div className="lg:hidden"><Logo /></div>
        <div className="mx-auto flex w-full max-w-md flex-1 items-center"><Outlet /></div>
        <p className="text-center text-xs text-slate-400 lg:text-left">MotoFlash · Gestão inteligente de entregas</p>
      </section>
    </main>
  )
}
