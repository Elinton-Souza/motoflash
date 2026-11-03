import { useState, type FormEvent } from 'react'
import { Check, CircleCheck, ClipboardList, KeyRound, MapPin, Navigation, Phone, Store, UserRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { EmptyState } from '../../components/EmptyState'
import { FormAlert } from '../../components/FormAlert'
import { Input } from '../../components/Input'
import { LiveMap, MapLegend, type MapPoint } from '../../components/LiveMap'
import { LoadingState } from '../../components/LoadingState'
import { useResource } from '../../hooks/useResource'
import { useMotoboyContext } from '../../hooks/useMotoboyContext'
import { api, errorMessage } from '../../lib/api'
import { formatMoney } from '../../lib/format'
import { googleMapsLink, hasPoint, wazeLink, type LatLng } from '../../lib/geo'
import { onlyDigits } from '../../lib/masks'
import type { CourierDelivery, Delivery } from '../../types/api'

const steps = ['Ir à coleta', 'Retirar', 'Levar ao cliente', 'Entregar']
const currentStep: Partial<Record<Delivery['status'], number>> = { COURIER_ASSIGNED: 0, PICKED_UP: 1, IN_DELIVERY: 2 }

function NavigateButtons({ to }: { to: LatLng }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <a href={googleMapsLink(to)} target="_blank" rel="noreferrer" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50"><Navigation size={17} />Google Maps</a>
      <a href={wazeLink(to)} target="_blank" rel="noreferrer" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50"><Navigation size={17} />Waze</a>
    </div>
  )
}

export function DeliveryInProgress() {
  const navigate = useNavigate()
  const { gps } = useMotoboyContext()
  const { refreshProfile } = useAuth()
  const active = useResource(() => api<CourierDelivery | null>('/deliveries/active'))
  const [pickupCode, setPickupCode] = useState('')
  const [customerCode, setCustomerCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function run(action: () => Promise<void>) {
    setBusy(true)
    setError('')
    try {
      await action()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  if (active.loading) return <LoadingState />
  const delivery = active.data
  if (!delivery) {
    return <Card><EmptyState icon={ClipboardList} title="Nenhuma corrida em andamento" description="Fique online no início para receber corridas." action={<Button onClick={() => navigate('/motoboy/dashboard')}>Ir para o início</Button>} /></Card>
  }

  const { order } = delivery
  const restaurantName = order.restaurant.restaurantName ?? order.restaurant.name
  const restaurantPoint = hasPoint(order.restaurant.restaurantLat, order.restaurant.restaurantLng)
  const customerPoint = { lat: order.customerLat, lng: order.customerLng }
  const goingToRestaurant = delivery.status === 'COURIER_ASSIGNED'
  const step = currentStep[delivery.status] ?? 0

  // A rota até o cliente só aparece depois da retirada confirmada com o código.
  const target = goingToRestaurant ? restaurantPoint : customerPoint
  const points: MapPoint[] = [
    ...(gps.position ? [{ ...gps.position, kind: 'courier' as const, label: 'Você' }] : []),
    ...(restaurantPoint ? [{ ...restaurantPoint, kind: 'restaurant' as const, label: restaurantName }] : []),
    ...(!goingToRestaurant ? [{ ...customerPoint, kind: 'customer' as const, label: order.customerName }] : []),
  ]
  const route = gps.position && target ? [gps.position, target] : !goingToRestaurant && restaurantPoint ? [restaurantPoint, customerPoint] : undefined

  const validatePickup = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void run(async () => {
      await api(`/deliveries/${delivery.id}/validate-code`, { method: 'POST', body: { code: pickupCode } })
      await active.reload()
    })
  }

  const startRoute = () => run(async () => {
    await api(`/deliveries/${delivery.id}/start-route`, { method: 'POST' })
    await active.reload()
  })

  const complete = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void run(async () => {
      const done = await api<Delivery>(`/deliveries/${delivery.id}/complete`, { method: 'POST', body: { code: customerCode } })
      await refreshProfile()
      navigate(`/motoboy/finance?completed=${Number(done.earning ?? 0)}`)
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted">Pedido #{order.number}</p>
          <h2 className="mt-0.5 text-xl font-bold text-ink">{goingToRestaurant ? `Vá até ${restaurantName}` : delivery.status === 'PICKED_UP' ? 'Pedido retirado!' : `Entregue para ${order.customerName.split(' ')[0]}`}</h2>
        </div>
        <p className="text-lg font-bold text-emerald-600">{formatMoney(order.deliveryFee)}</p>
      </div>

      <ol className="grid grid-cols-4 gap-1.5" aria-label="Etapas da corrida">
        {steps.map((label, index) => (
          <li key={label}>
            <span className={`block h-1.5 rounded-full ${index < step ? 'bg-brand' : index === step ? 'bg-brand/50' : 'bg-slate-200'}`} />
            <span className={`mt-1.5 flex items-center gap-1 text-[11px] font-medium ${index <= step ? 'text-ink' : 'text-slate-400'}`}>{index < step && <Check size={12} />}{label}</span>
          </li>
        ))}
      </ol>

      <LiveMap points={points} route={route} className="h-64 md:h-80" />
      <MapLegend kinds={goingToRestaurant ? ['courier', 'restaurant'] : ['courier', 'restaurant', 'customer']} />
      {target && <NavigateButtons to={target} />}

      {goingToRestaurant ? (
        <Card className="space-y-4 p-5">
          <p className="flex gap-3 text-sm"><Store size={18} className="mt-0.5 shrink-0 text-brand" /><span><span className="font-semibold text-ink">{restaurantName}</span><br /><span className="text-muted">{order.restaurant.restaurantAddress ?? '—'}</span></span></p>
          <form onSubmit={validatePickup} className="space-y-3 border-t border-slate-100 pt-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-ink"><KeyRound size={17} className="text-brand" />Peça o código de retirada no balcão</p>
            <Input id="pickup-code" label="Código de retirada" inputMode="numeric" autoComplete="one-time-code" maxLength={4} placeholder="0000" inputSize="lg" value={pickupCode} onChange={(event) => setPickupCode(onlyDigits(event.target.value).slice(0, 4))} className="text-center text-2xl font-bold tracking-[0.5em]" />
            {error && <FormAlert>{error}</FormAlert>}
            <Button type="submit" size="lg" fullWidth disabled={busy || pickupCode.length !== 4}>{busy ? 'Validando...' : 'Confirmar retirada'}</Button>
          </form>
        </Card>
      ) : (
        <Card className="space-y-4 p-5">
          <p className="flex gap-3 text-sm"><UserRound size={18} className="mt-0.5 shrink-0 text-ink" /><span><span className="font-semibold text-ink">{order.customerName}</span><br /><span className="text-muted">{order.customerAddress}</span></span></p>
          {order.customerPhone && <a href={`tel:+${order.customerPhone}`} className="inline-flex items-center gap-2 text-sm font-semibold text-brand"><Phone size={16} />Ligar para o cliente</a>}
          {delivery.status === 'PICKED_UP' ? <>
            {error && <FormAlert>{error}</FormAlert>}
            <Button size="lg" fullWidth disabled={busy} onClick={startRoute}><MapPin size={20} />{busy ? 'Iniciando...' : 'Iniciar rota até o cliente'}</Button>
          </> : (
            <form onSubmit={complete} className="space-y-3 border-t border-slate-100 pt-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-ink"><KeyRound size={17} className="text-brand" />Peça ao cliente o código que ele recebeu no WhatsApp</p>
              <Input id="customer-code" label="Código do cliente" inputMode="numeric" autoComplete="one-time-code" maxLength={4} placeholder="0000" inputSize="lg" value={customerCode} onChange={(event) => setCustomerCode(onlyDigits(event.target.value).slice(0, 4))} className="text-center text-2xl font-bold tracking-[0.5em]" />
              {error && <FormAlert>{error}</FormAlert>}
              <Button type="submit" size="lg" variant="success" fullWidth disabled={busy || customerCode.length !== 4}><CircleCheck size={20} />{busy ? 'Finalizando...' : 'Finalizar entrega'}</Button>
            </form>
          )}
        </Card>
      )}
    </div>
  )
}
