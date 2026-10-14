import { Bike, CircleDollarSign, ClipboardList, LayoutDashboard, UserRound } from 'lucide-react'
import { Outlet, useLocation } from 'react-router-dom'
import { Header } from '../components/Header'
import { Sidebar, type NavigationItem } from '../components/Sidebar'

const items: NavigationItem[] = [
  { label: 'Dashboard', to: '/motoboy/dashboard', icon: LayoutDashboard },
  { label: 'Nova solicitação', to: '/motoboy/request', icon: Bike },
  { label: 'Entregas', to: '/motoboy/delivery', icon: ClipboardList },
  { label: 'Financeiro', to: '/motoboy/finance', icon: CircleDollarSign },
  { label: 'Perfil', to: '/motoboy/profile', icon: UserRound },
]

const titles: Record<string, string> = { dashboard: 'Visão geral', request: 'Nova solicitação', delivery: 'Entrega em andamento', finance: 'Histórico e financeiro', profile: 'Meu perfil' }

export function MotoboyLayout() {
  const section = useLocation().pathname.split('/').pop() ?? 'dashboard'
  return <div className="flex min-h-screen"><Sidebar items={items} /><div className="min-w-0 flex-1"><Header title={titles[section] ?? 'MotoFlash'} name="João Silva" role="Motoboy" /><main className="p-5 pb-24 md:p-8"><Outlet /></main></div></div>
}
