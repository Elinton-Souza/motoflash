import { useState } from 'react'
import { ArrowRight, Bike, CircleDollarSign, Clock3, LocateFixed, LocateOff, MapPin, PackageCheck, Power, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import { Card } from '../../components/Card'
import { FormAlert } from '../../components/FormAlert'
import { LoadingState } from '../../components/LoadingState'
import { MetricCard } from '../../components/MetricCard'
import { StatusBadge } from '../../components/StatusBadge'
import { useResource } from '../../hooks/useResource'
import { useMotoboyContext } from '../../hooks/useMotoboyContext'
import { api, errorMessage } from '../../lib/api'
import { estimateMinutes, formatKm, formatMoney, formatToday, isSameDay, lastDays, weekdayShort } from '../../lib/format'
import { readPosition } from '../../lib/gps'
import type { CourierDailySummary, CourierDelivery, Offer } from '../../types/api'

export function MotoboyDashboard() {
  const navigate = useNavigate()
  const { gps } = useMotoboyContext()
  const { user, profile, refreshProfile } = useAuth()
  const daily = useResource(() => api<CourierDailySummary>('/finance/courier/daily'), { events: ['novo_pedido_disponivel'] })
  const history = useResource(() => api<CourierDelivery[]>('/finance/courier/history'))
  const offer = useResource(() => api<Offer | null>('/deliveries/offers/pending'), { refreshMs: 5000, events: ['novo_pedido_disponivel'] })
  const active = useResource(() => api<CourierDelivery | null>('/deliveries/active'), { refreshMs: 10000 })
  const [toggling, setToggling] = useState(false)
  const [toggleError, setToggleError] = useState('')
  const [approximate, setApproximate] = useState(false)

  const status = profile?.courierStatus ?? 'OFFLINE'
  const online = status !== 'OFFLINE'

  async function toggleOnline() {
    setToggling(true)
    setToggleError('')
    try {
      // Antes de ficar online, envia a posição atual: é ela que coloca o
      // motoboy na busca por proximidade.
      if (!online) {
        const { point, mode } = await readPosition()
        setApproximate(mode === 'approximate')
        await api('/users/me/location', { method: 'PUT', body: point })
      }
      await api('/users/me/status', { method: 'PUT', body: { status: online ? 'OFFLINE' : 'ONLINE' } })
      await refreshProfile()
      await offer.reload()
    } catch (err) {
      setToggleError(errorMessage(err))
    } finally {
      setToggling(false)
    }
  }

  const days = lastDays(7)
  const earningsByDay = days.map((day) =>
    (history.data ?? []).filter((d) => d.deliveredAt && isSameDay(new Date(d.deliveredAt), day)).reduce((sum, d) => sum + Number(d.earning ?? 0), 0),
  )
  const maxEarning = Math.max(...earningsByDay, 1)
  const weekTotal = earningsByDay.reduce((sum, value) => sum + value, 0)
  const pending = offer.data
  const firstName = (profile?.name ?? user?.name ?? '').split(' ')[0]

  const gpsLine = !online
    ? null
    : gps.status === 'watching'
      ? { icon: LocateFixed, text: `GPS ativo${gps.accuracy ? ` · precisão de ${Math.round(gps.accuracy)} m` : ''}`, tone: 'text-emerald-700' }
      : gps.status === 'error' || approximate
        ? { icon: LocateOff, text: gps.error || 'GPS indisponível: usando localização aproximada.', tone: 'text-amber-700' }
        : { icon: LocateFixed, text: 'Buscando sinal de GPS...', tone: 'text-muted' }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted">{formatToday()}</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-ink">Olá, {firstName}!</h2>
      </div>

      <Card className="p-5">
        <button
          type="button"
          disabled={toggling || status === 'ON_DELIVERY' || !profile}
          onClick={toggleOnline}
          className={`flex h-16 w-full items-center justify-between rounded-2xl px-5 text-left text-base font-bold transition disabled:opacity-70 ${online ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'}`}
        >
          <span className="flex items-center gap-3"><Power size={22} />{toggling ? 'Atualizando...' : status === 'ON_DELIVERY' ? 'Em entrega' : online ? 'Você está online' : 'Você está offline'}</span>
          <span className="text-sm font-semibold opacity-80">{status === 'ON_DELIVERY' ? '' : online ? 'Toque para pausar' : 'Toque para rodar'}</span>
        </button>
        {gpsLine && <p className={`mt-3 flex items-center gap-2 text-sm ${gpsLine.tone}`}><gpsLine.icon size={16} />{gpsLine.text}</p>}
        {toggleError && <div className="mt-3"><FormAlert>{toggleError}</FormAlert></div>}
      </Card>

      {active.data ? (
        <Card className="overflow-hidden border-brand/40">
          <div className="flex items-center justify-between gap-3 px-5 pt-5"><p className="font-bold text-ink">Entrega em andamento</p><StatusBadge status="delivery">Em andamento</StatusBadge></div>
          <p className="px-5 pt-1 text-sm text-muted">Pedido #{active.data.order.number} · {active.data.order.restaurant.restaurantName ?? active.data.order.restaurant.name}</p>
          <button type="button" onClick={() => navigate('/motoboy/delivery')} className="mt-4 flex w-full items-center justify-between bg-brand px-5 py-4 text-base font-bold text-white">Continuar corrida <ArrowRight size={20} /></button>
        </Card>
      ) : pending ? (
        <Card className="overflow-hidden border-brand/40">
          <div className="flex items-start justify-between gap-3 px-5 pt-5">
            <div><p className="font-bold text-ink">Nova corrida disponível</p><p className="mt-1 text-sm text-muted">{pending.delivery.order.restaurant.restaurantName ?? pending.delivery.order.restaurant.name}</p></div>
            <p className="text-xl font-bold text-emerald-600">{formatMoney(pending.delivery.order.deliveryFee)}</p>
          </div>
          <div className="flex gap-5 px-5 pt-3 text-sm text-slate-600"><span className="inline-flex items-center gap-1.5"><MapPin size={16} className="text-brand" />{formatKm(pending.distanceKm)} até a coleta</span><span className="inline-flex items-center gap-1.5"><Clock3 size={16} className="text-brand" />~{estimateMinutes(pending.distanceKm)} min</span></div>
          <button type="button" onClick={() => navigate('/motoboy/request')} className="mt-4 flex w-full items-center justify-between bg-brand px-5 py-4 text-base font-bold text-white">Ver corrida <ArrowRight size={20} /></button>
        </Card>
      ) : (
        <Card className="flex flex-col items-center px-6 py-10 text-center">
          <span className="grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-500"><Bike size={23} /></span>
          <h3 className="mt-4 font-bold text-ink">{online ? 'Aguardando corridas' : 'Você está offline'}</h3>
          <p className="mt-1.5 max-w-sm text-sm leading-6 text-muted">{online ? 'Quando um restaurante perto de você pedir um motoboy, a corrida aparece aqui.' : 'Fique online para receber corridas próximas.'}</p>
          {online && <div className="mt-5"><LoadingState label="Procurando corridas..." /></div>}
        </Card>
      )}

      {daily.error && <FormAlert>{daily.error}</FormAlert>}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <MetricCard label="Ganhos hoje" value={formatMoney(daily.data?.totalEarnings)} icon={CircleDollarSign} />
        <MetricCard label="Entregas hoje" value={String(daily.data?.totalDeliveries ?? 0)} icon={PackageCheck} />
        <div className="col-span-2 lg:col-span-1"><MetricCard label="Média por entrega" value={formatMoney(daily.data?.averageEarning)} icon={TrendingUp} /></div>
      </div>

      <Card className="p-5">
        <div className="flex items-baseline justify-between"><p className="font-bold text-ink">Últimos 7 dias</p><p className="text-sm font-semibold text-ink">{formatMoney(weekTotal)}</p></div>
        <div className="mt-6 flex h-24 items-end gap-2" aria-label="Ganhos dos últimos 7 dias">
          {earningsByDay.map((value, index) => <span key={index} title={formatMoney(value)} className={`flex-1 rounded-t-md ${index === 6 ? 'bg-brand' : 'bg-orange-100'}`} style={{ height: `${Math.max(4, (value / maxEarning) * 96)}px` }} />)}
        </div>
        <div className="mt-2 flex justify-between text-xs capitalize text-slate-400"><span>{weekdayShort(days[0])}</span><span>Hoje</span></div>
        <button type="button" onClick={() => navigate('/motoboy/finance')} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-brand hover:text-brand-dark">Ver ganhos <ArrowRight size={16} /></button>
      </Card>
    </div>
  )
}
