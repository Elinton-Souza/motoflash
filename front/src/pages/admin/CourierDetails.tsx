import { ArrowLeft, CircleDollarSign, ClipboardList, PackageCheck, Percent, Star } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { Card } from '../../components/Card'
import { EmptyState } from '../../components/EmptyState'
import { LoadingState } from '../../components/LoadingState'
import { MetricCard } from '../../components/MetricCard'
import { StatusBadge } from '../../components/StatusBadge'
import { useResource } from '../../hooks/useResource'
import { api } from '../../lib/api'
import { formatKm, formatMoney, formatRating, formatRelative } from '../../lib/format'
import { maskPhone } from '../../lib/masks'
import { courierStatusInfo, deliveryStatusInfo } from '../../lib/status'
import type { AdminCourierDetails } from '../../types/api'

const formatDate = (value: string) => new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })

// Detalhe de um entregador: dados de cadastro, números e histórico de corridas.
export function CourierDetails() {
  const { id = '' } = useParams()
  const courier = useResource(() => api<AdminCourierDetails>(`/admin/couriers/${id}`), { key: id, refreshMs: 15_000 })
  const data = courier.data

  const back = <Link to="/admin/couriers" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-ink"><ArrowLeft size={16} />Voltar para entregadores</Link>

  if (courier.loading) return <div className="mx-auto max-w-7xl space-y-6">{back}<LoadingState /></div>
  if (!data) return <div className="mx-auto max-w-7xl space-y-6">{back}<p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{courier.error || 'Entregador não encontrado.'}</p></div>

  const status = courierStatusInfo(data.courierStatus)
  const { stats } = data
  const details = [
    { label: 'E-mail', value: data.email },
    { label: 'WhatsApp', value: data.phone ? maskPhone(data.phone) : '—' },
    { label: 'Placa', value: data.vehiclePlate ?? '—' },
    { label: 'Cadastrado em', value: formatDate(data.createdAt) },
  ]

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      {back}

      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="grid size-14 place-items-center rounded-full bg-flash-soft text-xl font-bold text-brand">{data.name.charAt(0)}</span>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-ink">{data.name}</h2>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <StatusBadge status={status.kind}>{status.label}</StatusBadge>
                {data.activeDelivery && <span className="text-xs text-muted">Na corrida do pedido #{data.activeDelivery.orderNumber} · {deliveryStatusInfo(data.activeDelivery.status).label}</span>}
              </div>
            </div>
          </div>
        </div>
        <dl className="mt-6 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2 lg:grid-cols-4">
          {details.map((item) => <div key={item.label}><dt className="text-xs font-medium text-muted">{item.label}</dt><dd className="mt-1 truncate text-sm font-semibold text-ink">{item.value}</dd></div>)}
        </dl>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Entregas concluídas" value={String(stats.deliveredCount)} icon={PackageCheck} trend={stats.lastDeliveryAt ? `Última: ${formatRelative(stats.lastDeliveryAt)}` : undefined} />
        <MetricCard label="Total ganho" value={formatMoney(stats.totalEarnings)} icon={CircleDollarSign} trend={stats.deliveredCount ? `${formatMoney(stats.averageEarning)} por entrega` : undefined} />
        <MetricCard label="Taxa de aceite" value={stats.acceptanceRate == null ? '—' : `${stats.acceptanceRate}%`} icon={Percent} trend={stats.offersReceived ? `${stats.offersAccepted} aceitas · ${stats.offersRejected} recusadas · ${stats.offersExpired} expiradas` : undefined} />
        <MetricCard label="Avaliação" value={formatRating(data.ratingAvg)} icon={Star} trend={data.ratingCount ? `${data.ratingCount} avaliação(ões)` : undefined} />
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-5">
          <p className="font-bold text-ink">Histórico de corridas</p>
          <p className="mt-1 text-sm text-muted">Últimas {data.deliveries.length} corridas aceitas por este entregador.</p>
        </div>
        {data.deliveries.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-3">Pedido</th>
                  <th className="px-4 py-3">Restaurante</th>
                  <th className="px-4 py-3">Destino</th>
                  <th className="px-4 py-3 text-right">Distância</th>
                  <th className="px-4 py-3 text-right">Ganho</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Quando</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.deliveries.map((delivery) => {
                  const info = deliveryStatusInfo(delivery.status)
                  return (
                    <tr key={delivery.id}>
                      <td className="px-6 py-4 font-semibold text-ink">#{delivery.orderNumber}</td>
                      <td className="px-4 py-4 text-slate-600">{delivery.restaurantName}</td>
                      <td className="max-w-56 truncate px-4 py-4 text-slate-600" title={delivery.customerAddress}>{delivery.customerAddress}</td>
                      <td className="px-4 py-4 text-right text-slate-600">{formatKm(delivery.distanceKm)}</td>
                      <td className="px-4 py-4 text-right font-semibold text-ink">{delivery.status === 'DELIVERED' ? formatMoney(delivery.earning) : '—'}</td>
                      <td className="px-4 py-4"><StatusBadge status={info.kind}>{info.label}</StatusBadge></td>
                      <td className="px-4 py-4 text-slate-600">{formatRelative(delivery.deliveredAt ?? delivery.acceptedAt ?? delivery.createdAt)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : <EmptyState icon={ClipboardList} title="Nenhuma corrida ainda" description="As corridas aceitas por este entregador aparecem aqui." />}
      </Card>
    </div>
  )
}
