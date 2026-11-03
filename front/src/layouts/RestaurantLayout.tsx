import { ChartNoAxesCombined, ClipboardList, LayoutDashboard, MapPinned, Plus, Settings } from 'lucide-react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { Header } from '../components/Header'
import { LiveNotice } from '../components/LiveNotice'
import { Sidebar, type NavigationItem } from '../components/Sidebar'
import type { RealtimeEvent } from '../lib/realtime'

const items: NavigationItem[] = [
  { label: 'Visão geral', short: 'Início', to: '/restaurant/dashboard', icon: LayoutDashboard },
  { label: 'Pedidos', to: '/restaurant/orders', icon: ClipboardList },
  { label: 'Nova entrega', short: 'Nova', to: '/restaurant/new-delivery', icon: Plus },
  { label: 'Acompanhamento', short: 'Mapa', to: '/restaurant/tracking', icon: MapPinned },
  { label: 'Financeiro', to: '/restaurant/finance', icon: ChartNoAxesCombined },
  { label: 'Configurações', short: 'Ajustes', to: '/restaurant/settings', icon: Settings },
]

const titles: Record<string, string> = { dashboard: 'Visão geral', orders: 'Pedidos', 'new-delivery': 'Nova entrega', tracking: 'Acompanhamento', finance: 'Financeiro', settings: 'Configurações' }

type DeliveryEventPayload = { orderId?: string; courierName?: string }

function buildNotice(event: RealtimeEvent, payload: unknown) {
  const { orderId, courierName } = (payload ?? {}) as DeliveryEventPayload
  const to = orderId ? `/restaurant/tracking?order=${orderId}` : '/restaurant/tracking'
  if (event === 'pedido_aceito') return { text: `${courierName ?? 'Um motoboy'} aceitou a sua entrega.`, to, linkLabel: 'Acompanhar' }
  if (event === 'codigo_validado') return { text: 'Código confirmado: o motoboy retirou o pedido.', to, linkLabel: 'Acompanhar' }
  if (event === 'entrega_finalizada') return { text: 'Entrega finalizada com sucesso!', to, linkLabel: 'Ver detalhes' }
  return null
}

export function RestaurantLayout() {
  const navigate = useNavigate()
  const section = useLocation().pathname.split('/').pop() ?? 'dashboard'
  const { user, profile, logout } = useAuth()

  const leave = () => {
    logout()
    navigate('/entrar/restaurante', { replace: true })
  }

  return (
    <div className="flex min-h-screen bg-page">
      <LiveNotice build={buildNotice} />
      <Sidebar items={items} onLogout={leave} home="/restaurant/dashboard" />
      <div className="min-w-0 flex-1">
        <Header title={titles[section] ?? 'MotoFlash'} name={profile?.restaurantName ?? user?.name ?? ''} role="Restaurante" onLogout={leave} />
        <main className="mx-auto max-w-7xl p-4 pb-24 md:p-8"><Outlet /></main>
      </div>
    </div>
  )
}
