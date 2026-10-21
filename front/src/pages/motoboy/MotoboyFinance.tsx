import { useMemo, useState } from 'react'
import { CircleCheck, CircleDollarSign, ClipboardList, PackageCheck, TrendingUp, Wallet } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { Card } from '../../components/Card'
import { EmptyState } from '../../components/EmptyState'
import { LoadingState } from '../../components/LoadingState'
import { MetricCard } from '../../components/MetricCard'
import { StatusBadge } from '../../components/StatusBadge'
import { useResource } from '../../hooks/useResource'
import { api } from '../../lib/api'
import { formatMoney, formatRelative, startOfDay } from '../../lib/format'
import type { CourierDelivery } from '../../types/api'

const periods = { today: { label: 'Hoje', days: 1 }, week: { label: 'Últimos 7 dias', days: 7 }, month: { label: 'Últimos 30 dias', days: 30 } }
type Period = keyof typeof periods

export function MotoboyFinance() {
  const [searchParams] = useSearchParams()
  const [period, setPeriod] = useState<Period>('today')
  const history = useResource(() => api<CourierDelivery[]>('/finance/courier/history'))
  const completedEarning = searchParams.get('completed')

  const all = useMemo(() => history.data ?? [], [history.data])
  const filtered = useMemo(() => {
    const from = startOfDay(new Date()).getTime() - (periods[period].days - 1) * 86_400_000
    return all.filter((delivery) => delivery.deliveredAt && new Date(delivery.deliveredAt).getTime() >= from)
  }, [all, period])

  const earnings = filtered.reduce((sum, delivery) => sum + Number(delivery.earning ?? 0), 0)
  const allTime = all.reduce((sum, delivery) => sum + Number(delivery.earning ?? 0), 0)

  return <div className="mx-auto max-w-7xl space-y-7">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm text-muted">Resumo do período</p><h2 className="mt-1 text-2xl font-bold tracking-tight text-ink">Seu financeiro</h2></div><select aria-label="Período" value={period} onChange={(event) => setPeriod(event.target.value as Period)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 outline-none focus:border-brand">{Object.entries(periods).map(([value, { label }]) => <option key={value} value={value}>{label}</option>)}</select></div>
    {completedEarning !== null && <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-800"><CircleCheck size={20} className="mt-0.5 shrink-0" /><div><p className="font-bold">Entrega finalizada com sucesso!</p><p className="mt-0.5 text-sm">{formatMoney(Number(completedEarning))} foram adicionados aos seus ganhos de hoje.</p></div></div>}
    {history.error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{history.error}</p>}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><MetricCard label="Ganhos do período" value={formatMoney(earnings)} icon={CircleDollarSign} /><MetricCard label="Entregas concluídas" value={String(filtered.length)} icon={PackageCheck} /><MetricCard label="Média por entrega" value={formatMoney(filtered.length ? earnings / filtered.length : 0)} icon={TrendingUp} /><MetricCard label="Total acumulado" value={formatMoney(allTime)} icon={Wallet} trend={`${all.length} entregas no total`} /></div>
    <Card className="overflow-hidden"><div className="border-b border-slate-100 px-6 py-5"><p className="text-base font-bold text-ink">Entregas realizadas</p><p className="mt-1 text-sm text-muted">{periods[period].label}</p></div>
      {history.loading ? <div className="p-6"><LoadingState /></div> : filtered.length ? <div className="divide-y divide-slate-100">{filtered.map((delivery) => <div key={delivery.id} className="flex flex-wrap items-center justify-between gap-4 px-6 py-4"><div><p className="text-sm font-semibold text-ink">{delivery.order.restaurant.restaurantName ?? delivery.order.restaurant.name} <span className="font-normal text-muted">· Pedido #{delivery.order.number}</span></p><p className="mt-1 text-xs text-muted">{delivery.order.customerName} · {formatRelative(delivery.deliveredAt)}</p></div><div className="flex items-center gap-5"><p className="text-sm font-bold text-emerald-600">+ {formatMoney(delivery.earning)}</p><StatusBadge status="completed">Concluída</StatusBadge></div></div>)}</div> : <EmptyState icon={ClipboardList} title="Nenhuma entrega encontrada" description="Você ainda não concluiu entregas neste período." />}
    </Card></div>
}
