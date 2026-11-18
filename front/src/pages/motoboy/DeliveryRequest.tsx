import { useEffect, useState } from 'react'
import { ArrowLeft, Inbox, MapPin, Store } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { EmptyState } from '../../components/EmptyState'
import { FormAlert } from '../../components/FormAlert'
import { LiveMap, MapLegend, type MapPoint } from '../../components/LiveMap'
import { LoadingState } from '../../components/LoadingState'
import { useResource } from '../../hooks/useResource'
import { useMotoboyContext } from '../../hooks/useMotoboyContext'
import { api, errorMessage } from '../../lib/api'
import { estimateMinutes, formatKm, formatMoney } from '../../lib/format'
import { distanceKm, hasPoint } from '../../lib/geo'
import type { Offer } from '../../types/api'

export function DeliveryRequest() {
  const navigate = useNavigate()
  const { gps } = useMotoboyContext()
  const offer = useResource(() => api<Offer | null>('/deliveries/offers/pending'), { refreshMs: 4000, events: ['novo_pedido_disponivel'] })
  const [now, setNow] = useState(() => Date.now())
  const [busy, setBusy] = useState<'accept' | 'reject' | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const data = offer.data
  const secondsLeft = data ? Math.max(0, Math.ceil((new Date(data.expiresAt).getTime() - now) / 1000)) : 0
  const expired = !!data && secondsLeft === 0

  async function respond(action: 'accept' | 'reject') {
    if (!data) return
    setBusy(action)
    setError('')
    try {
      await api(`/deliveries/offers/${data.id}/${action}`, { method: 'POST' })
      navigate(action === 'accept' ? '/motoboy/delivery' : '/motoboy/dashboard')
    } catch (err) {
      setError(errorMessage(err))
      await offer.reload()
    } finally {
      setBusy(null)
    }
  }

  const back = <button type="button" onClick={() => navigate('/motoboy/dashboard')} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-ink"><ArrowLeft size={17} />Início</button>

  if (offer.loading) return <div>{back}<LoadingState /></div>
  if (!data || expired) {
    return <div>{back}<Card>
      {error && <div className="m-5 mb-0"><FormAlert>{error}</FormAlert></div>}
      <EmptyState icon={Inbox} title={expired ? 'O tempo para aceitar acabou' : 'Nenhuma corrida no momento'} description={expired ? 'A corrida foi repassada para outro motoboy. Fique online para receber a próxima.' : 'Fique online. Quando um restaurante próximo pedir um motoboy, a corrida aparece aqui.'} />
    </Card></div>
  }

  const { order } = data.delivery
  const restaurantName = order.restaurant.restaurantName ?? order.restaurant.name
  const restaurantPoint = hasPoint(order.restaurant.restaurantLat, order.restaurant.restaurantLng)
  const customerPoint = { lat: order.customerLat, lng: order.customerLng }
  const tripKm = restaurantPoint ? distanceKm(restaurantPoint, customerPoint) : null

  const points: MapPoint[] = [
    ...(gps.position ? [{ ...gps.position, kind: 'courier' as const, label: 'Você' }] : []),
    ...(restaurantPoint ? [{ ...restaurantPoint, kind: 'restaurant' as const, label: restaurantName }] : []),
    { ...customerPoint, kind: 'customer', label: 'Região do cliente' },
  ]
  const progress = Math.min(100, (secondsLeft / 30) * 100)

  return (
    <div className="space-y-4">
      {back}
      <Card className="overflow-hidden">
        <div className="h-1.5 bg-slate-100"><div className={`h-full transition-all duration-1000 ${secondsLeft <= 10 ? 'bg-red-500' : 'bg-brand'}`} style={{ width: `${progress}%` }} /></div>
        <div className="flex items-start justify-between gap-4 p-5">
          <div>
            <p className={`text-sm font-semibold ${secondsLeft <= 10 ? 'text-red-600' : 'text-brand'}`}>Responda em {secondsLeft}s</p>
            <h2 className="mt-1 text-xl font-bold text-ink">{restaurantName}</h2>
            <p className="mt-0.5 text-sm text-muted">Pedido #{order.number}</p>
          </div>
          <div className="text-right"><p className="text-xs text-muted">Você recebe</p><p className="text-2xl font-bold text-emerald-600">{formatMoney(order.deliveryFee)}</p></div>
        </div>
        <div className="grid grid-cols-3 border-t border-slate-100 text-center">
          <div className="p-3"><p className="text-xs text-muted">Até a coleta</p><p className="mt-0.5 font-bold text-ink">{formatKm(data.distanceKm)}</p></div>
          <div className="border-x border-slate-100 p-3"><p className="text-xs text-muted">Coleta → cliente</p><p className="mt-0.5 font-bold text-ink">{formatKm(tripKm)}</p></div>
          <div className="p-3"><p className="text-xs text-muted">Tempo total</p><p className="mt-0.5 font-bold text-ink">~{estimateMinutes(data.distanceKm + (tripKm ?? 0))} min</p></div>
        </div>
      </Card>

      <LiveMap points={points} route={restaurantPoint ? [restaurantPoint, customerPoint] : undefined} className="h-56 md:h-72" />
      <MapLegend kinds={['courier', 'restaurant', 'customer']} />

      <Card className="space-y-4 p-5">
        <p className="flex gap-3 text-sm"><Store size={18} className="mt-0.5 shrink-0 text-brand" /><span><span className="font-semibold text-ink">Retirada:</span> <span className="text-muted">{order.restaurant.restaurantAddress ?? '—'}</span></span></p>
        <p className="flex gap-3 text-sm"><MapPin size={18} className="mt-0.5 shrink-0 text-ink" /><span><span className="font-semibold text-ink">Entrega:</span> <span className="text-muted">{order.customerAddress}</span></span></p>
      </Card>

      {error && <FormAlert>{error}</FormAlert>}
      <div className="grid grid-cols-[1fr_2fr] gap-3">
        <Button size="lg" variant="secondary" disabled={!!busy} onClick={() => respond('reject')}>{busy === 'reject' ? '...' : 'Recusar'}</Button>
        <Button size="lg" variant="success" disabled={!!busy} onClick={() => respond('accept')}>{busy === 'accept' ? 'Aceitando...' : 'Aceitar corrida'}</Button>
      </div>
      <p className="text-center text-xs text-slate-400">Sem resposta em 30 segundos, a corrida vai para o próximo motoboy.</p>
    </div>
  )
}
