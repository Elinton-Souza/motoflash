import { ArrowRight, Bike, CircleDollarSign, ClipboardList, Clock3, Plus, Store, Truck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../../components/Card'
import { EmptyState } from '../../components/EmptyState'
import { LoadingState } from '../../components/LoadingState'
import { MetricCard } from '../../components/MetricCard'
import { StatusBadge } from '../../components/StatusBadge'
import { useResource } from '../../hooks/useResource'
import { api } from '../../lib/api'
import { formatMoney, formatRelative, formatToday, isToday } from '../../lib/format'
import { isOrderActive, orderStatusInfo } from '../../lib/status'
import type { ConnectedCourier, Order } from '../../types/api'

const DELIVERY_EVENTS = ['pedido_aceito', 'codigo_validado', 'entrega_em_andamento', 'entrega_finalizada'] as const

export function RestaurantDashboard() {
  const navigate = useNavigate()
  const orders = useResource(() => api<Order[]>('/orders'), { refreshMs: 5000, events: [...DELIVERY_EVENTS] })
  const couriers = useResource(() => api<ConnectedCourier[]>('/users/couriers'), { refreshMs: 10000 })

  const list = orders.data ?? []
  const todayOrders = list.filter((order) => isToday(order.createdAt))
  const activeCount = list.filter(isOrderActive).length
  const availableCount = (couriers.data ?? []).filter((courier) => courier.courierStatus === 'ONLINE').length
  const todayCost = list.filter((order) => order.status === 'DELIVERED' && isToday(order.deliveredAt)).reduce((sum, order) => sum + Number(order.deliveryFee), 0)

  return <div className="mx-auto max-w-7xl space-y-7"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm text-muted">{formatToday()}</p><h2 className="mt-1 text-2xl font-bold tracking-tight text-ink">{activeCount ? 'Sua operação está a todo vapor.' : 'Tudo pronto para as próximas entregas.'}</h2></div><button type="button" onClick={() => navigate('/restaurant/new-delivery')} className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-white shadow-[0_10px_20px_-12px_rgba(255,59,31,0.95)] transition hover:bg-brand-dark"><Plus size={18} />Nova entrega</button></div>
    {orders.error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{orders.error}</p>}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><MetricCard label="Pedidos hoje" value={String(todayOrders.length)} icon={ClipboardList} /><MetricCard label="Em andamento" value={String(activeCount)} icon={Truck} /><MetricCard label="Motoboys disponíveis" value={String(availableCount)} icon={Bike} trend="Online agora" /><MetricCard label="Custo com entregas hoje" value={formatMoney(todayCost)} icon={CircleDollarSign} /></div>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.75fr)]"><Card className="overflow-hidden"><div className="flex items-center justify-between border-b border-slate-100 px-6 py-5"><div><p className="text-base font-bold text-ink">Pedidos recentes</p><p className="mt-1 text-sm text-muted">Clique em um pedido para acompanhar.</p></div><button type="button" onClick={() => navigate('/restaurant/finance')} className="text-sm font-bold text-brand hover:text-brand-dark">Ver todos</button></div>
      {orders.loading ? <div className="p-6"><LoadingState /></div> : list.length ? <div className="divide-y divide-slate-100">{list.slice(0, 6).map((order) => { const status = orderStatusInfo(order); return <button type="button" key={order.id} onClick={() => navigate(`/restaurant/tracking?order=${order.id}`)} className="flex w-full flex-wrap items-center justify-between gap-4 px-6 py-4 text-left transition hover:bg-slate-50"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-slate-100 text-slate-600"><Store size={18} /></span><div><p className="text-sm font-semibold text-ink">Pedido #{order.number} · {order.customerName}</p><p className="mt-1 inline-flex items-center gap-1 text-xs text-muted"><Clock3 size={13} />{formatRelative(order.createdAt)}{order.delivery?.courier && ` · ${order.delivery.courier.name}`}</p></div></div><div className="flex items-center gap-5"><p className="text-sm font-semibold text-ink">{formatMoney(order.deliveryFee)}</p><StatusBadge status={status.kind}>{status.label}</StatusBadge></div></button> })}</div> : <EmptyState icon={ClipboardList} title="Nenhum pedido ainda" description="Crie a primeira entrega para encontrar um motoboy próximo." />}
    </Card>
      <Card className="p-6"><span className="grid size-11 place-items-center rounded-xl bg-orange-50 text-brand"><Truck size={21} /></span><h3 className="mt-5 text-lg font-bold tracking-tight text-ink">Precisa de um motoboy?</h3><p className="mt-2 text-sm leading-6 text-muted">{availableCount ? `${availableCount} motoboy(s) online agora. A corrida vai para o mais próximo.` : 'Nenhum motoboy online no momento.'}</p><button type="button" onClick={() => navigate('/restaurant/new-delivery')} className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-brand hover:text-brand-dark">Criar nova entrega <ArrowRight size={16} /></button></Card></div>
  </div>
}
