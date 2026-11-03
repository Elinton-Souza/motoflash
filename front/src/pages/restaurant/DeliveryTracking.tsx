import { useEffect, useState } from 'react'
import { AlertTriangle, ArrowLeft, Bike, Check, ClipboardList, KeyRound, MapPin, MessageCircle, Phone, RotateCcw, UserRound, X } from 'lucide-react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { EmptyState } from '../../components/EmptyState'
import { FormAlert } from '../../components/FormAlert'
import { LiveMap, MapLegend, type MapPoint } from '../../components/LiveMap'
import { LoadingState } from '../../components/LoadingState'
import { StatusBadge } from '../../components/StatusBadge'
import { WhatsAppCodeButton } from '../../components/WhatsAppCodeButton'
import { useResource } from '../../hooks/useResource'
import { api, errorMessage } from '../../lib/api'
import { formatMoney, formatRating, formatRelative } from '../../lib/format'
import { hasPoint, type LatLng } from '../../lib/geo'
import { maskPhone } from '../../lib/masks'
import { subscribe } from '../../lib/realtime'
import { isOrderActive, orderStatusInfo } from '../../lib/status'
import type { DeliveryStatus, Order, WhatsAppResult } from '../../types/api'

const trackingSteps = ['Buscando motoboy', 'A caminho da coleta', 'Pedido retirado', 'A caminho do cliente', 'Entregue']
const stepByStatus: Partial<Record<DeliveryStatus, number>> = { SEARCHING_COURIER: 0, COURIER_ASSIGNED: 1, PICKED_UP: 2, IN_DELIVERY: 3, DELIVERED: 4 }

type LocationEvent = { orderId?: string; lat?: number; lng?: number }

export function DeliveryTracking() {
  const navigate = useNavigate()
  const location = useLocation()
  const [params, setParams] = useSearchParams()
  const orders = useResource(() => api<Order[]>('/orders'), { refreshMs: 5000, events: ['pedido_aceito', 'codigo_validado', 'entrega_em_andamento', 'entrega_finalizada'] })
  const [livePosition, setLivePosition] = useState<Record<string, LatLng>>({})
  const [routeInfo, setRouteInfo] = useState<{ km: number; minutes: number } | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const createdWhatsapp = (location.state as { whatsapp?: WhatsAppResult } | null)?.whatsapp ?? null

  // Posição do motoboy em tempo real, enviada pelo GPS do celular dele.
  useEffect(() => subscribe((event, payload) => {
    if (event !== 'localizacao_motoboy_atualizada') return
    const { orderId, lat, lng } = (payload ?? {}) as LocationEvent
    if (orderId && lat != null && lng != null) setLivePosition((current) => ({ ...current, [orderId]: { lat, lng } }))
  }), [])

  const list = orders.data ?? []
  const selectedId = params.get('order')
  // Sem pedido na URL, mostra a entrega ativa mais recente (ou o último pedido).
  const order = list.find((item) => item.id === selectedId) ?? (selectedId ? undefined : list.find(isOrderActive) ?? list[0])

  async function run(action: () => Promise<unknown>) {
    setBusy(true)
    setError('')
    try {
      await action()
      await orders.reload()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const back = <button type="button" onClick={() => navigate('/restaurant/orders')} className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-ink"><ArrowLeft size={17} />Pedidos</button>
  if (orders.loading) return <div>{back}<LoadingState /></div>
  if (!order) return <div>{back}<Card><EmptyState icon={ClipboardList} title="Nenhuma entrega para acompanhar" description="Crie uma nova entrega para acompanhar o motoboy em tempo real." action={<Button onClick={() => navigate('/restaurant/new-delivery')}>Nova entrega</Button>} /></Card></div>

  const delivery = order.delivery
  const status = orderStatusInfo(order)
  const step = delivery ? stepByStatus[delivery.status] ?? 0 : -1
  const done = order.status === 'DELIVERED'
  const canceled = order.status === 'CANCELED'
  const noCourier = delivery?.status === 'NO_COURIER_FOUND'
  const courier = delivery?.courier
  const canCancel = !done && !canceled && (!delivery || delivery.status === 'SEARCHING_COURIER' || noCourier)

  const restaurantPoint = hasPoint(order.restaurant?.restaurantLat, order.restaurant?.restaurantLng)
  const customerPoint = { lat: order.customerLat, lng: order.customerLng }
  const courierPoint = livePosition[order.id] ?? hasPoint(courier?.currentLat, courier?.currentLng)
  const showCourier = !!courierPoint && !!delivery && ['COURIER_ASSIGNED', 'PICKED_UP', 'IN_DELIVERY'].includes(delivery.status)
  const points: MapPoint[] = [
    ...(restaurantPoint ? [{ ...restaurantPoint, kind: 'restaurant' as const, label: order.restaurant?.restaurantName ?? 'Restaurante' }] : []),
    { ...customerPoint, kind: 'customer', label: order.customerName },
    ...(showCourier && courierPoint ? [{ ...courierPoint, kind: 'courier' as const, label: courier?.name ?? 'Motoboy' }] : []),
  ]
  const route = showCourier && courierPoint
    ? delivery?.status === 'COURIER_ASSIGNED' && restaurantPoint ? [courierPoint, restaurantPoint] : [courierPoint, customerPoint]
    : restaurantPoint ? [restaurantPoint, customerPoint] : undefined

  return (
    <div>
      {back}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2"><StatusBadge status={status.kind}>{status.label}</StatusBadge><span className="text-sm text-muted">Pedido #{order.number} · {formatRelative(order.createdAt)}</span></div>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink">{done ? 'Pedido entregue' : canceled ? 'Pedido cancelado' : `Entrega para ${order.customerName}`}</h2>
        </div>
        <select aria-label="Escolher pedido" value={order.id} onChange={(event) => setParams({ order: event.target.value })} className="h-10 max-w-64 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 outline-none focus:border-brand">
          {list.slice(0, 30).map((item) => <option key={item.id} value={item.id}>#{item.number} · {item.customerName}</option>)}
        </select>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <LiveMap points={points} route={route} onRoute={setRouteInfo} className="h-[360px] md:h-[420px]" />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <MapLegend kinds={showCourier ? ['restaurant', 'customer', 'courier'] : ['restaurant', 'customer']} />
            {routeInfo && !done && !canceled && <p className="text-xs font-semibold text-ink">{showCourier ? 'Motoboy chega' : 'Trajeto'} em ~{routeInfo.minutes + (showCourier ? 0 : 5)} min</p>}
          </div>

          {noCourier && <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-900">
            <div className="flex gap-3"><AlertTriangle size={20} className="mt-0.5 shrink-0" /><div><p className="font-bold">Nenhum motoboy disponível por perto</p><p className="mt-0.5 text-sm">Tente novamente quando houver motoboys online.</p></div></div>
            <Button disabled={busy} onClick={() => run(() => api(`/orders/${order.id}/request-courier`, { method: 'POST' }))}><RotateCcw size={16} />{busy ? 'Buscando...' : 'Buscar novamente'}</Button>
          </div>}
          {!delivery && !done && !canceled && <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4">
            <p className="text-sm text-slate-600">Este pedido ainda não tem motoboy solicitado.</p>
            <Button disabled={busy} onClick={() => run(async () => {
              if (order.status === 'PREPARING') await api(`/orders/${order.id}/ready`, { method: 'PUT' })
              await api(`/orders/${order.id}/request-courier`, { method: 'POST' })
            })}>{busy ? 'Solicitando...' : 'Solicitar motoboy'}</Button>
          </div>}
          {error && <FormAlert>{error}</FormAlert>}

          {!canceled && <Card className="p-6">
            <p className="font-bold text-ink">Fluxo do pedido</p>
            <ol className="mt-5 grid gap-4 sm:grid-cols-5">
              {trackingSteps.map((label, index) => {
                const complete = index < step || (done && index === step)
                return <li key={label} className="relative flex items-center gap-3 sm:block">
                  <span className={`grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold ${complete ? 'bg-brand text-white' : index === step ? 'bg-orange-100 text-brand ring-1 ring-orange-200' : 'bg-slate-100 text-slate-400'}`}>{complete ? <Check size={16} /> : index + 1}</span>
                  {index < trackingSteps.length - 1 && <span className={`absolute left-9 top-4 hidden h-0.5 w-[calc(100%-1.5rem)] sm:block ${index < step ? 'bg-brand' : 'bg-slate-200'}`} />}
                  <p className={`text-xs font-medium sm:mt-2 ${index <= step ? 'text-ink' : 'text-slate-400'}`}>{label}</p>
                </li>
              })}
            </ol>
            {delivery?.status === 'SEARCHING_COURIER' && <div className="mt-5"><LoadingState label="Aguardando um motoboy aceitar a corrida..." /></div>}
          </Card>}
        </div>

        <div className="space-y-4">
          {!done && !canceled && <Card className="p-5">
            <div className="flex items-start justify-between"><div><p className="text-sm font-bold text-ink">Código de retirada</p><p className="mt-0.5 text-xs text-muted">O motoboy digita este código no balcão.</p></div><KeyRound size={18} className="text-brand" /></div>
            <p className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 py-3 text-center text-3xl font-bold tracking-[0.35em] text-ink">{order.pickupCode}</p>
          </Card>}

          {order.deliveryCode && !canceled && <Card className="p-5">
            <div className="flex items-start justify-between"><div><p className="text-sm font-bold text-ink">Código do cliente</p><p className="mt-0.5 text-xs text-muted">{done ? 'Confirmado na entrega.' : 'O cliente informa ao motoboy para finalizar.'}</p></div><MessageCircle size={18} className="text-[#25d366]" /></div>
            <p className="mt-4 text-center text-2xl font-bold tracking-[0.35em] text-slate-500">{order.deliveryCode}</p>
            {!done && <div className="mt-4"><WhatsAppCodeButton key={order.id} orderId={order.id} initial={order.id === selectedId ? createdWhatsapp : null} /></div>}
          </Card>}

          <Card className="p-5">
            <div className="flex items-start justify-between"><div><p className="text-sm font-bold text-ink">Motoboy</p><p className="mt-0.5 text-sm text-muted">{courier ? `${courier.name} · ★ ${formatRating(courier.ratingAvg)}` : 'Aguardando aceite'}</p></div><Bike size={18} className="text-brand" /></div>
            {courier && <div className="mt-4 space-y-2 text-sm text-slate-600">
              <p>Placa {courier.vehiclePlate ?? '—'}</p>
              {courier.phone && <a href={`tel:+${courier.phone}`} className="flex items-center gap-2 font-semibold text-brand"><Phone size={15} />{maskPhone(courier.phone)}</a>}
            </div>}
          </Card>

          <Card className="p-5">
            <div className="flex items-start justify-between"><div><p className="text-sm font-bold text-ink">Cliente</p><p className="mt-0.5 text-sm text-muted">{order.customerName}{order.customerPhone ? ` · ${maskPhone(order.customerPhone)}` : ''}</p></div><UserRound size={18} className="text-brand" /></div>
            <p className="mt-4 flex gap-2 text-sm leading-5 text-slate-600"><MapPin size={16} className="shrink-0 text-brand" />{order.customerAddress}</p>
            <div className="mt-4 space-y-1 border-t border-slate-100 pt-3 text-sm">
              <p className="flex justify-between"><span className="text-muted">Valor do pedido</span><span className="font-semibold text-ink">{formatMoney(order.value)}</span></p>
              <p className="flex justify-between"><span className="text-muted">Taxa de entrega</span><span className="font-semibold text-ink">{formatMoney(order.deliveryFee)}</span></p>
            </div>
          </Card>

          {canCancel && <Button variant="ghost" fullWidth disabled={busy} onClick={() => run(() => api(`/orders/${order.id}/cancel`, { method: 'POST' }))}><X size={16} />Cancelar pedido</Button>}
          {done && <Button fullWidth onClick={() => navigate('/restaurant/finance')}>Ver financeiro</Button>}
        </div>
      </div>
    </div>
  )
}
