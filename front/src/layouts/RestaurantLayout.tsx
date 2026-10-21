import { ChartNoAxesCombined, LayoutDashboard, MapPinned, Settings, Truck } from 'lucide-react'
import { Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { LiveNotice } from '../components/LiveNotice'
import type { RealtimeEvent } from '../lib/realtime'
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
  const section = useLocation().pathname.split('/').pop() ?? 'dashboard'
  const { user, profile } = useAuth()
  return <div className="flex min-h-screen"><LiveNotice build={buildNotice} /><Sidebar items={items} /><div className="min-w-0 flex-1"><Header title={titles[section] ?? 'MotoFlash'} name={profile?.restaurantName ?? user?.name ?? ''} role="Restaurante" /><main className="p-5 pb-24 md:p-8"><Outlet /></main></div></div>
}
