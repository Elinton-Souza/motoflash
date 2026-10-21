import { useState } from 'react'
import { ArrowRight, Bike, CircleDollarSign, Clock3, MapPin, PackageCheck, Power, Star, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import { Card } from '../../components/Card'
import { LoadingState } from '../../components/LoadingState'
import { MetricCard } from '../../components/MetricCard'
import { StatusBadge } from '../../components/StatusBadge'
import { useResource } from '../../hooks/useResource'
import { api, errorMessage } from '../../lib/api'
import { estimateMinutes, formatKm, formatMoney, formatRating, formatToday, isSameDay, lastDays, weekdayShort } from '../../lib/format'
import { nearbyPoint } from '../../lib/location'
import type { CourierDailySummary, CourierDelivery, Offer, Profile } from '../../types/api'

export function MotoboyDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const profile = useResource(() => api<Profile>('/users/me'))
  const daily = useResource(() => api<CourierDailySummary>('/finance/courier/daily'))
  const history = useResource(() => api<CourierDelivery[]>('/finance/courier/history'))
  const offer = useResource(() => api<Offer | null>('/deliveries/offers/pending'), { refreshMs: 5000, events: ['novo_pedido_disponivel'] })
  const active = useResource(() => api<CourierDelivery | null>('/deliveries/active'), { refreshMs: 10000 })
  const [toggling, setToggling] = useState(false)
  const [toggleError, setToggleError] = useState('')

  const status = profile.data?.courierStatus ?? 'OFFLINE'
  const online = status !== 'OFFLINE'

  async function toggleOnline() {
    setToggling(true)
    setToggleError('')
    try {
      // Ao ficar online, envia a posição atual usada na busca por proximidade.
      if (!online) await api('/users/me/location', { method: 'PUT', body: nearbyPoint(0.8) })
      await api('/users/me/status', { method: 'PUT', body: { status: online ? 'OFFLINE' : 'ONLINE' } })
      await profile.reload()
      await offer.reload()
    } catch (err) {
      setToggleError(errorMessage(err))
    } finally {
      setToggling(false)
    }
  }

  const days = lastDays(7)
  const earningsByDay = days.map((day) => (history.data ?? []).filter((d) => d.deliveredAt && isSameDay(new Date(d.deliveredAt), day)).reduce((sum, d) => sum + Number(d.earning ?? 0), 0))
  const maxEarning = Math.max(...earningsByDay, 1)
  const weekTotal = earningsByDay.reduce((sum, value) => sum + value, 0)
  const pending = offer.data
  const firstName = (profile.data?.name ?? user?.name ?? '').split(' ')[0]

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-sm text-muted">{formatToday()}</p><h2 className="mt-1 text-2xl font-bold tracking-tight text-ink">Olá, {firstName}! {online ? 'Bora rodar?' : 'Pronto para rodar?'}</h2></div>
        <div className="flex flex-col items-end gap-1">
          <button type="button" disabled={toggling || status === 'ON_DELIVERY' || profile.loading} onClick={toggleOnline} className={`inline-flex h-11 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition disabled:opacity-70 ${online ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'}`}><Power size={17} />{status === 'ON_DELIVERY' ? 'Em entrega' : online ? 'Você está online' : 'Você está offline'}<span className={`size-2 rounded-full ${online ? 'bg-emerald-500' : 'bg-slate-400'}`} /></button>
          {toggleError && <p className="text-xs text-red-600">{toggleError}</p>}
        </div>
      </div>
      {daily.error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{daily.error}</p>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Ganhos hoje" value={formatMoney(daily.data?.totalEarnings)} icon={CircleDollarSign} />
        <MetricCard label="Entregas hoje" value={String(daily.data?.totalDeliveries ?? 0)} icon={PackageCheck} />
        <MetricCard label="Média por entrega" value={formatMoney(daily.data?.averageEarning)} icon={TrendingUp} />
        <MetricCard label="Sua avaliação" value={`★ ${formatRating(profile.data?.ratingAvg)}`} icon={Star} />
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.8fr)]">
        <Card className="overflow-hidden">
          {active.data ? <>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-5"><div><p className="text-base font-bold text-ink">Entrega em andamento</p><p className="mt-1 text-sm text-muted">Pedido #{active.data.order.number} · {active.data.order.restaurant.restaurantName ?? active.data.order.restaurant.name}</p></div><StatusBadge status="delivery">Em andamento</StatusBadge></div>
            <div className="flex flex-wrap items-center justify-between gap-4 p-6"><p className="flex items-center gap-2 text-sm text-slate-600"><MapPin size={16} className="text-brand" />{active.data.order.customerAddress}</p><button type="button" onClick={() => navigate('/motoboy/delivery')} className="inline-flex items-center gap-2 text-sm font-bold text-brand hover:text-brand-dark">Continuar entrega <ArrowRight size={17} /></button></div>
          </> : pending ? <>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-5"><div><p className="text-base font-bold text-ink">Nova solicitação disponível</p><p className="mt-1 text-sm text-muted">Uma entrega próxima de você está aguardando.</p></div><StatusBadge status="online">Disponível agora</StatusBadge></div>
            <div className="p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div className="flex gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-orange-50 text-brand"><Bike size={21} /></span><div><p className="font-semibold text-ink">{pending.delivery.order.restaurant.restaurantName ?? pending.delivery.order.restaurant.name}</p><p className="mt-1 text-sm text-muted">Retirada em {pending.delivery.order.restaurant.restaurantAddress ?? '—'}</p></div></div><p className="text-lg font-bold text-brand">{formatMoney(pending.delivery.order.deliveryFee)}</p></div>
              <div className="my-5 h-px bg-slate-100" />
              <div className="flex flex-wrap items-center justify-between gap-4"><div className="flex gap-5 text-sm text-slate-600"><span className="inline-flex items-center gap-1.5"><MapPin size={16} className="text-brand" />{formatKm(pending.distanceKm)}</span><span className="inline-flex items-center gap-1.5"><Clock3 size={16} className="text-brand" />~{estimateMinutes(pending.distanceKm)} min</span></div><button type="button" onClick={() => navigate('/motoboy/request')} className="inline-flex items-center gap-2 text-sm font-bold text-brand transition hover:text-brand-dark">Ver detalhes <ArrowRight size={17} /></button></div>
            </div>
          </> : <div className="flex flex-col items-center px-6 py-12 text-center">
            <span className="grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-500"><Bike size={23} /></span>
            <h3 className="mt-4 text-base font-bold text-ink">{online ? 'Aguardando novas solicitações' : 'Você está offline'}</h3>
            <p className="mt-1.5 max-w-sm text-sm leading-6 text-muted">{online ? 'Assim que um restaurante próximo pedir um motoboy, a corrida aparece aqui.' : 'Fique online para começar a receber corridas próximas.'}</p>
            {online && <div className="mt-5"><LoadingState label="Procurando corridas..." /></div>}
          </div>}
        </Card>
        <Card className="p-6"><p className="text-base font-bold text-ink">Resumo da semana</p><p className="mt-1 text-sm text-muted">{formatMoney(weekTotal)} nos últimos 7 dias.</p><div className="mt-7 flex h-24 items-end gap-2" aria-label="Ganhos dos últimos 7 dias">{earningsByDay.map((value, index) => <span key={index} title={formatMoney(value)} className={`flex-1 rounded-t-md ${index === 6 ? 'bg-brand' : 'bg-orange-100'}`} style={{ height: `${Math.max(4, (value / maxEarning) * 96)}px` }} />)}</div><div className="mt-3 flex justify-between text-xs capitalize text-slate-400"><span>{weekdayShort(days[0])}</span><span>Hoje</span></div><button type="button" onClick={() => navigate('/motoboy/finance')} className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-brand hover:text-brand-dark">Ver financeiro <ArrowRight size={16} /></button></Card>
      </div>
    </div>
  )
}
