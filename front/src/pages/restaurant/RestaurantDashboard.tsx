import { ArrowRight, Bike, CircleDollarSign, ClipboardList, Clock3, Plus, Store, Truck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../../components/Card'
import { MetricCard } from '../../components/MetricCard'
import { StatusBadge } from '../../components/StatusBadge'
import { restaurantMock } from '../../data/restaurantMock'

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const recentOrders = [
  { id: '#1028', customer: 'Camila Ferreira', value: 'R$ 14,00', status: 'Em andamento', kind: 'delivery' as const, time: 'há 4 min' },
  { id: '#1027', customer: 'Rodrigo Nunes', value: 'R$ 12,50', status: 'Aguardando motoboy', kind: 'waiting' as const, time: 'há 9 min' },
  { id: '#1026', customer: 'Marina Lima', value: 'R$ 16,00', status: 'Concluída', kind: 'completed' as const, time: 'há 18 min' },
]

export function RestaurantDashboard() {
  const navigate = useNavigate()
  return <div className="mx-auto max-w-7xl space-y-7"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm text-muted">Segunda-feira, 21 de setembro</p><h2 className="mt-1 text-2xl font-bold tracking-tight text-ink">Sua operação está a todo vapor.</h2></div><button type="button" onClick={() => navigate('/restaurant/new-delivery')} className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-white shadow-[0_10px_20px_-12px_rgba(255,59,31,0.95)] transition hover:bg-brand-dark"><Plus size={18} />Nova entrega</button></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><MetricCard label="Pedidos hoje" value={String(restaurantMock.todayOrders)} icon={ClipboardList} trend="+18% comparado a ontem" /><MetricCard label="Em andamento" value={String(restaurantMock.activeDeliveries)} icon={Truck} /><MetricCard label="Motoboys disponíveis" value={String(restaurantMock.availableMotoboys)} icon={Bike} trend="Na sua região agora" /><MetricCard label="Custo com entregas" value={money.format(restaurantMock.deliveryCost)} icon={CircleDollarSign} /></div>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.75fr)]"><Card className="overflow-hidden"><div className="flex items-center justify-between border-b border-slate-100 px-6 py-5"><div><p className="text-base font-bold text-ink">Pedidos recentes</p><p className="mt-1 text-sm text-muted">Acompanhe a movimentação de hoje.</p></div><button type="button" onClick={() => navigate('/restaurant/tracking')} className="text-sm font-bold text-brand hover:text-brand-dark">Ver todos</button></div><div className="divide-y divide-slate-100">{recentOrders.map((order) => <div key={order.id} className="flex flex-wrap items-center justify-between gap-4 px-6 py-4"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-slate-100 text-slate-600"><Store size={18} /></span><div><p className="text-sm font-semibold text-ink">Pedido {order.id} · {order.customer}</p><p className="mt-1 inline-flex items-center gap-1 text-xs text-muted"><Clock3 size={13} />{order.time}</p></div></div><div className="flex items-center gap-5"><p className="text-sm font-semibold text-ink">{order.value}</p><StatusBadge status={order.kind}>{order.status}</StatusBadge></div></div>)}</div></Card>
      <Card className="p-6"><span className="grid size-11 place-items-center rounded-xl bg-orange-50 text-brand"><Truck size={21} /></span><h3 className="mt-5 text-lg font-bold tracking-tight text-ink">Precisa de um motoboy?</h3><p className="mt-2 text-sm leading-6 text-muted">Encontre entregadores disponíveis e acompanhe cada etapa do pedido.</p><button type="button" onClick={() => navigate('/restaurant/new-delivery')} className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-brand hover:text-brand-dark">Criar nova entrega <ArrowRight size={16} /></button></Card></div>
  </div>
}
