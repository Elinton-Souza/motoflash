import { Bike, CircleDollarSign, House, UserRound } from 'lucide-react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { Header } from '../components/Header'
import { LiveNotice } from '../components/LiveNotice'
import { Sidebar, type NavigationItem } from '../components/Sidebar'
import { useCourierGps } from '../hooks/useCourierGps'
import type { MotoboyOutletContext } from '../hooks/useMotoboyContext'

const items: NavigationItem[] = [
  { label: 'Início', to: '/motoboy/dashboard', icon: House },
  { label: 'Corrida', to: '/motoboy/delivery', icon: Bike },
  { label: 'Ganhos', to: '/motoboy/finance', icon: CircleDollarSign },
  { label: 'Perfil', to: '/motoboy/profile', icon: UserRound },
]

const titles: Record<string, string> = { dashboard: 'Início', request: 'Nova corrida', delivery: 'Corrida', finance: 'Ganhos', profile: 'Meu perfil' }

export function MotoboyLayout() {
  const navigate = useNavigate()
  const section = useLocation().pathname.split('/').pop() ?? 'dashboard'
  const { user, profile, logout } = useAuth()
  // O GPS fica ligado enquanto o motoboy está online ou em entrega.
  const gps = useCourierGps(!!profile && profile.courierStatus !== 'OFFLINE')

  const leave = () => {
    logout()
    navigate('/entrar/motoboy', { replace: true })
  }

  return (
    <div className="flex min-h-screen bg-page">
      <LiveNotice build={(event) => (event === 'novo_pedido_disponivel' && section !== 'request' ? { text: 'Nova corrida disponível perto de você!', to: '/motoboy/request', linkLabel: 'Ver corrida' } : null)} />
      <Sidebar items={items} onLogout={leave} home="/motoboy/dashboard" />
      <div className="min-w-0 flex-1">
        <Header title={titles[section] ?? 'MotoFlash'} name={profile?.name ?? user?.name ?? ''} role="Motoboy" onLogout={leave} />
        <main className="mx-auto max-w-5xl p-4 pb-24 md:p-8"><Outlet context={{ gps } satisfies MotoboyOutletContext} /></main>
      </div>
    </div>
  )
}
