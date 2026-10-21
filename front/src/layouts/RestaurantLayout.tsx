import { ChartNoAxesCombined, LayoutDashboard, MapPinned, Settings, Truck } from 'lucide-react'
import { Outlet, useLocation } from 'react-router-dom'
import { Header } from '../components/Header'
import { Sidebar, type NavigationItem } from '../components/Sidebar'

const items: NavigationItem[] = [
  { label: 'Dashboard', to: '/restaurant/dashboard', icon: LayoutDashboard },
  { label: 'Nova entrega', to: '/restaurant/new-delivery', icon: Truck },
  { label: 'Acompanhamento', to: '/restaurant/tracking', icon: MapPinned },
  { label: 'Histórico / Financeiro', to: '/restaurant/finance', icon: ChartNoAxesCombined },
  { label: 'Configurações', to: '/restaurant/settings', icon: Settings },
]

const titles: Record<string, string> = { dashboard: 'Visão geral', 'new-delivery': 'Nova entrega', tracking: 'Acompanhamento da entrega', finance: 'Histórico e financeiro', settings: 'Configurações' }

export function RestaurantLayout() {
  const section = useLocation().pathname.split('/').pop() ?? 'dashboard'
  return <div className="flex min-h-screen"><Sidebar items={items} /><div className="min-w-0 flex-1"><Header title={titles[section] ?? 'MotoFlash'} name="Sabor & Cia" role="Restaurante" /><main className="p-5 pb-24 md:p-8"><Outlet /></main></div></div>
}
