import { useMemo, useState } from 'react'
import { Bike, CircleDollarSign, ClipboardList, PackageCheck, RotateCcw, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../../components/Card'
import { EmptyState } from '../../components/EmptyState'
import { LoadingState } from '../../components/LoadingState'
import { MetricCard } from '../../components/MetricCard'
import { StatusBadge } from '../../components/StatusBadge'
import { useResource } from '../../hooks/useResource'
import { api } from '../../lib/api'
import { formatMoney, formatRelative, isSameDay, lastDays, weekdayShort } from '../../lib/format'
import { isOrderActive, isOrderFailed, orderStatusInfo } from '../../lib/status'
import type { Order, RestaurantFinanceSummary } from '../../types/api'

const filters: Record<string, { label: string; match: (order: Order) => boolean }> = {
  all: { label: 'Todos os status', match: () => true },
  completed: { label: 'Concluídas', match: (order) => order.status === 'DELIVERED' },
  active: { label: 'Em andamento', match: isOrderActive },
  failed: { label: 'Sem motoboy / canceladas', match: isOrderFailed },
}

export function RestaurantFinance() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')
  const orders = useResource(() => api<Order[]>('/orders'), { events: ['entrega_finalizada'] })
  const summary = useResource(() => api<RestaurantFinanceSummary>('/finance/restaurant/summary'), { events: ['entrega_finalizada'] })

  const list = useMemo(() => orders.data ?? [], [orders.data])
  const filtered = useMemo(() => list.filter(filters[filter].match), [list, filter])
  const delivered = list.filter((order) => order.status === 'DELIVERED')
  const totalCost = delivered.reduce((sum, order) => sum + Number(order.deliveryFee), 0)
  const days = lastDays(7)
  const perDay = days.map((day) => delivered.filter((order) => order.deliveredAt && isSameDay(new Date(order.deliveredAt), day)).length)
  const maxPerDay = Math.max(...perDay, 1)

  return <div className="mx-auto max-w-7xl space-y-7"><div><p className="text-sm text-muted">Resumo da operação</p><h2 className="mt-1 text-2xl font-bold tracking-tight text-ink">Histórico e financeiro</h2></div>
    {orders.error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{orders.error}</p>}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><MetricCard label="Total de pedidos" value={String(list.length)} icon={ClipboardList} /><MetricCard label="Entregas concluídas" value={String(delivered.length)} icon={PackageCheck} /><MetricCard label="Sem motoboy / canceladas" value={String(list.filter(isOrderFailed).length)} icon={RotateCcw} /><MetricCard label="Custo total com entregas" value={formatMoney(totalCost)} icon={CircleDollarSign} trend={delivered.length ? `${formatMoney(totalCost / delivered.length)} por entrega` : undefined} /></div>
    <div className="grid gap-6 xl:grid-cols-2"><Card className="p-6"><div className="flex items-center justify-between"><div><p className="font-bold text-ink">Entregas por dia</p><p className="mt-1 text-sm text-muted">Últimos 7 dias</p></div><TrendingUp size={20} className="text-brand" /></div><div className="mt-8 flex h-36 items-end gap-3">{perDay.map((count, index) => <div key={index} className="flex h-full flex-1 flex-col items-center justify-end gap-2"><span className="text-[10px] font-semibold text-slate-500">{count || ''}</span><span className={`w-full rounded-t-md ${index === 6 ? 'bg-brand' : 'bg-orange-100'}`} style={{ height: `${Math.max(4, (count / maxPerDay) * 100)}%` }} /><span className="text-[10px] capitalize text-slate-400">{index === 6 ? 'Hoje' : weekdayShort(days[index])}</span></div>)}</div></Card>
      <Card className="p-6"><p className="font-bold text-ink">Repasses de hoje por motoboy</p><p className="mt-1 text-sm text-muted">{summary.data ? `${summary.data.totalDeliveries} entrega(s) · ${formatMoney(summary.data.totalDeliveryFees)} em taxas` : 'Carregando...'}</p>{summary.data?.byCourier.length ? <div className="mt-5 divide-y divide-slate-100">{summary.data.byCourier.map((item) => <div key={item.courierId} className="flex items-center justify-between py-3"><span className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-full bg-orange-50 text-brand"><Bike size={16} /></span><span><span className="block text-sm font-semibold text-ink">{item.courierName}</span><span className="text-xs text-muted">{item.deliveries} entrega(s)</span></span></span><span className="text-sm font-bold text-ink">{formatMoney(item.totalPaidOut)}</span></div>)}</div> : <p className="mt-8 text-sm text-muted">Nenhuma entrega concluída hoje.</p>}</Card></div>
    <Card className="overflow-hidden"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-5"><div><p className="font-bold text-ink">Histórico de entregas</p><p className="mt-1 text-sm text-muted">Clique em um pedido para ver os detalhes.</p></div><select aria-label="Filtrar por status" value={filter} onChange={(event) => setFilter(event.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 outline-none focus:border-brand">{Object.entries(filters).map(([value, { label }]) => <option key={value} value={value}>{label}</option>)}</select></div>
      {orders.loading ? <div className="p-6"><LoadingState /></div> : filtered.length ? <div className="divide-y divide-slate-100">{filtered.map((order) => { const status = orderStatusInfo(order); return <button type="button" key={order.id} onClick={() => navigate(`/restaurant/tracking?order=${order.id}`)} className="flex w-full flex-wrap items-center justify-between gap-4 px-6 py-4 text-left transition hover:bg-slate-50"><div><p className="text-sm font-semibold text-ink">Pedido #{order.number} <span className="font-normal text-muted">· {order.customerName}</span></p><p className="mt-1 text-xs text-muted">{formatRelative(order.createdAt)} · {order.delivery?.courier?.name ?? '—'}</p></div><div className="flex items-center gap-5"><p className="text-sm font-semibold text-ink">{formatMoney(order.status === 'DELIVERED' ? order.deliveryFee : 0)}</p><StatusBadge status={status.kind}>{status.label}</StatusBadge></div></button> })}</div> : <EmptyState icon={ClipboardList} title="Nenhuma entrega encontrada" description="Não há pedidos com este status." />}
    </Card></div>
}
