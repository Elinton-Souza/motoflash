import { useMemo, useState } from 'react'
import { Bike, ChevronRight, CircleDollarSign, PackageCheck, Radio, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../../components/Card'
import { EmptyState } from '../../components/EmptyState'
import { LoadingState } from '../../components/LoadingState'
import { MetricCard } from '../../components/MetricCard'
import { StatusBadge } from '../../components/StatusBadge'
import { useResource } from '../../hooks/useResource'
import { api } from '../../lib/api'
import { formatMoney, formatRating, formatRelative } from '../../lib/format'
import { maskPhone } from '../../lib/masks'
import { courierStatusInfo } from '../../lib/status'
import type { AdminCourier, CourierStatus } from '../../types/api'

const filters: Record<string, { label: string; match: (courier: AdminCourier) => boolean }> = {
  all: { label: 'Todos os status', match: () => true },
  ONLINE: { label: 'Online', match: (courier) => courier.courierStatus === 'ONLINE' },
  ON_DELIVERY: { label: 'Em entrega', match: (courier) => courier.courierStatus === 'ON_DELIVERY' },
  OFFLINE: { label: 'Offline', match: (courier) => !courier.courierStatus || courier.courierStatus === 'OFFLINE' },
}

const countBy = (list: AdminCourier[], status: CourierStatus) => list.filter((courier) => courier.courierStatus === status).length

// Gestão de entregadores: lista com status em tempo (quase) real e os
// números de cada motoboy. Clique em uma linha para ver o histórico.
export function Couriers() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  // O admin não recebe eventos de socket: a lista se atualiza a cada 15 s.
  const couriers = useResource(() => api<AdminCourier[]>('/admin/couriers'), { refreshMs: 15_000 })

  const list = useMemo(() => couriers.data ?? [], [couriers.data])
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return list.filter(filters[filter].match).filter((courier) => !term || [courier.name, courier.email, courier.vehiclePlate ?? ''].some((value) => value.toLowerCase().includes(term)))
  }, [list, filter, search])

  const totalDelivered = list.reduce((sum, courier) => sum + courier.stats.deliveredCount, 0)
  const totalPaid = list.reduce((sum, courier) => sum + courier.stats.totalEarnings, 0)

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <div>
        <p className="text-sm text-muted">Administração</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-ink">Entregadores</h2>
      </div>

      {couriers.error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{couriers.error}</p>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Entregadores cadastrados" value={String(list.length)} icon={Bike} />
        <MetricCard label="Disponíveis agora" value={String(countBy(list, 'ONLINE'))} icon={Radio} trend={`${countBy(list, 'ON_DELIVERY')} em entrega`} />
        <MetricCard label="Entregas concluídas" value={String(totalDelivered)} icon={PackageCheck} />
        <MetricCard label="Total repassado" value={formatMoney(totalPaid)} icon={CircleDollarSign} />
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-5">
          <div>
            <p className="font-bold text-ink">Lista de entregadores</p>
            <p className="mt-1 text-sm text-muted">Clique em um entregador para ver o histórico.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <label className="relative">
              <span className="sr-only">Buscar entregador</span>
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nome, e-mail ou placa" className="h-10 w-56 rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-brand" />
            </label>
            <select aria-label="Filtrar por status" value={filter} onChange={(event) => setFilter(event.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 outline-none focus:border-brand">
              {Object.entries(filters).map(([value, { label }]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>
        </div>

        {couriers.loading ? <div className="p-6"><LoadingState /></div> : filtered.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-3">Entregador</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Entregas</th>
                  <th className="px-4 py-3 text-right">Ganhos</th>
                  <th className="px-4 py-3 text-right">Aceite</th>
                  <th className="px-4 py-3 text-right">Nota</th>
                  <th className="px-4 py-3">Última entrega</th>
                  <th className="px-4 py-3"><span className="sr-only">Abrir</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((courier) => {
                  const status = courierStatusInfo(courier.courierStatus)
                  return (
                    <tr key={courier.id} onClick={() => navigate(`/admin/couriers/${courier.id}`)} className="cursor-pointer transition hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-ink">{courier.name}</p>
                        <p className="mt-0.5 text-xs text-muted">{courier.vehiclePlate ?? 'Sem placa'} · {courier.phone ? maskPhone(courier.phone) : 'Sem WhatsApp'}</p>
                      </td>
                      <td className="px-4 py-4">
                        <StatusBadge status={status.kind}>{status.label}</StatusBadge>
                        {courier.activeDelivery && <p className="mt-1 text-xs text-muted">Pedido #{courier.activeDelivery.orderNumber}</p>}
                      </td>
                      <td className="px-4 py-4 text-right font-semibold text-ink">{courier.stats.deliveredCount}</td>
                      <td className="px-4 py-4 text-right font-semibold text-ink">{formatMoney(courier.stats.totalEarnings)}</td>
                      <td className="px-4 py-4 text-right text-slate-600">{courier.stats.acceptanceRate == null ? '—' : `${courier.stats.acceptanceRate}%`}</td>
                      <td className="px-4 py-4 text-right text-slate-600">{formatRating(courier.ratingAvg)}</td>
                      <td className="px-4 py-4 text-slate-600">{formatRelative(courier.stats.lastDeliveryAt)}</td>
                      <td className="px-4 py-4 text-slate-300"><ChevronRight size={18} /></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : <EmptyState icon={Bike} title="Nenhum entregador encontrado" description={list.length ? 'Nenhum entregador corresponde à busca ou ao filtro.' : 'Os motoboys aparecem aqui assim que se cadastram.'} />}
      </Card>
    </div>
  )
}
