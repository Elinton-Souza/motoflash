import { useState, type FormEvent } from 'react'
import { ArrowLeft, Bike, Info, Navigation, Store } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import { AddressSearch } from '../../components/AddressSearch'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { FormAlert } from '../../components/FormAlert'
import { Input } from '../../components/Input'
import { LiveMap, MapLegend, type MapPoint } from '../../components/LiveMap'
import { StatusBadge } from '../../components/StatusBadge'
import { useResource } from '../../hooks/useResource'
import { api, errorMessage } from '../../lib/api'
import { formatKm, formatRating } from '../../lib/format'
import { hasPoint, type AddressSuggestion } from '../../lib/geo'
import { isValidPhone, maskPhone, onlyDigits } from '../../lib/masks'
import type { ConnectedCourier, CreatedOrder } from '../../types/api'

const emptyForm = { customerName: '', customerPhone: '', customerAddress: '', value: '', deliveryFee: '' }

export function NewDelivery() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const couriers = useResource(() => api<ConnectedCourier[]>('/users/couriers'), { refreshMs: 5000 })
  const [form, setForm] = useState(emptyForm)
  const [place, setPlace] = useState<AddressSuggestion | null>(null)
  const [routeInfo, setRouteInfo] = useState<{ km: number; minutes: number } | null>(null)
  const [touched, setTouched] = useState(false)
  const [step, setStep] = useState('')
  const [error, setError] = useState('')

  const value = Number(form.value.replace(',', '.'))
  const deliveryFee = Number(form.deliveryFee.replace(',', '.'))
  const errors = {
    customerName: form.customerName.trim().length < 2 ? 'Informe o nome do cliente.' : undefined,
    customerPhone: !isValidPhone(form.customerPhone) ? 'Informe o WhatsApp do cliente com DDD.' : undefined,
    customerAddress: form.customerAddress.trim().length < 5 ? 'Informe o endereço de entrega.' : undefined,
    value: !(value > 0) ? 'Informe o valor do pedido.' : undefined,
    deliveryFee: form.deliveryFee === '' || !(deliveryFee >= 0) ? 'Informe a taxa de entrega.' : undefined,
  }
  const show = (name: keyof typeof errors) => (touched ? errors[name] : undefined)
  const field = (name: keyof typeof form, transform: (text: string) => string = (text) => text) => ({
    value: form[name],
    error: show(name as keyof typeof errors),
    onChange: (event: { target: { value: string } }) => setForm((current) => ({ ...current, [name]: transform(event.target.value) })),
  })

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setTouched(true)
    if (Object.values(errors).some(Boolean)) return
    setError('')
    let order: CreatedOrder | null = null
    try {
      setStep('Criando pedido...')
      order = await api<CreatedOrder>('/orders', {
        method: 'POST',
        body: {
          customerName: form.customerName.trim(),
          customerPhone: onlyDigits(form.customerPhone),
          customerAddress: form.customerAddress.trim(),
          ...(place ? { customerLat: place.lat, customerLng: place.lng } : {}),
          value,
          deliveryFee,
        },
      })
      await api(`/orders/${order.id}/ready`, { method: 'PUT' })
      setStep('Buscando o motoboy mais próximo...')
      await api(`/orders/${order.id}/request-courier`, { method: 'POST' })
      navigate(`/restaurant/tracking?order=${order.id}`, { state: { whatsapp: order.whatsapp } })
    } catch (err) {
      // Se o pedido já foi criado, o acompanhamento permite tentar de novo.
      if (order) navigate(`/restaurant/tracking?order=${order.id}`, { state: { whatsapp: order.whatsapp } })
      else setError(errorMessage(err))
    } finally {
      setStep('')
    }
  }

  const restaurantPoint = hasPoint(profile?.restaurantLat, profile?.restaurantLng)
  const points: MapPoint[] = [
    ...(restaurantPoint ? [{ ...restaurantPoint, kind: 'restaurant' as const, label: profile?.restaurantName ?? 'Restaurante' }] : []),
    ...(place ? [{ lat: place.lat, lng: place.lng, kind: 'customer' as const, label: form.customerName || 'Cliente' }] : []),
  ]
  const list = couriers.data ?? []
  const available = list.filter((courier) => courier.courierStatus === 'ONLINE').length

  return (
    <div>
      <button type="button" onClick={() => navigate('/restaurant/dashboard')} className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-ink"><ArrowLeft size={17} />Voltar</button>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
        <Card className="p-6 sm:p-7">
          <h2 className="text-lg font-bold text-ink">Nova entrega</h2>
          <p className="mt-1 text-sm text-muted">O cliente recebe pelo WhatsApp o código que vai informar ao motoboy.</p>
          <form className="mt-6 space-y-5" onSubmit={submit} noValidate>
            <div className="flex gap-3 rounded-xl bg-slate-50 p-4">
              <Store size={18} className="mt-0.5 shrink-0 text-brand" />
              <div className="text-sm"><p className="font-semibold text-ink">Coleta em {profile?.restaurantName ?? 'seu restaurante'}</p><p className="mt-0.5 text-muted">{profile?.restaurantAddress ?? 'Endereço não cadastrado'} · <Link to="/restaurant/settings" className="font-semibold text-brand hover:text-brand-dark">alterar</Link></p></div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Input id="customer" label="Nome do cliente" placeholder="Ex.: Maria Souza" {...field('customerName')} />
              <Input id="customerPhone" label="WhatsApp do cliente" type="tel" inputMode="tel" placeholder="(11) 98888-7777" {...field('customerPhone', maskPhone)} />
            </div>
            <AddressSearch id="address" label="Endereço de entrega" value={form.customerAddress} error={show('customerAddress')} onChange={(text) => setForm((current) => ({ ...current, customerAddress: text }))} onSelect={setPlace} />
            <div className="grid gap-5 sm:grid-cols-2">
              <Input id="value" label="Valor do pedido (R$)" type="number" inputMode="decimal" min="0.01" step="0.01" placeholder="0,00" {...field('value')} />
              <Input id="fee" label="Taxa de entrega (R$)" type="number" inputMode="decimal" min="0" step="0.01" placeholder="0,00" hint="Valor repassado ao motoboy." {...field('deliveryFee')} />
            </div>
            {error && <FormAlert>{error}</FormAlert>}
            <Button type="submit" fullWidth disabled={!!step}>{step || <>Solicitar motoboy <Navigation size={17} /></>}</Button>
          </form>
        </Card>

        <div className="space-y-4">
          <LiveMap points={points} route={restaurantPoint && place ? [restaurantPoint, place] : undefined} onRoute={setRouteInfo} className="h-72" />
          <div className="flex items-center justify-between gap-3">
            <MapLegend kinds={['restaurant', 'customer']} />
            {routeInfo && <p className="text-xs font-semibold text-ink">{formatKm(routeInfo.km)} · ~{routeInfo.minutes + 5} min</p>}
          </div>
          {!restaurantPoint && <FormAlert tone="info">O endereço do restaurante ainda não foi localizado no mapa. Confira em Configurações.</FormAlert>}

          <Card className="overflow-hidden">
            <div className="border-b border-slate-100 px-5 py-4"><p className="font-bold text-ink">Motoboys conectados</p><p className="mt-0.5 text-xs text-muted">{available} disponível(is) agora</p></div>
            {list.length ? (
              <ul className="divide-y divide-slate-100">
                {list.map((courier) => (
                  <li key={courier.id} className={`flex items-center gap-3 px-5 py-3 ${courier.courierStatus === 'ON_DELIVERY' ? 'opacity-60' : ''}`}>
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">{courier.name.charAt(0)}</span>
                    <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-ink">{courier.name}</span><span className="flex items-center gap-2 text-xs text-muted"><Bike size={12} />{courier.vehiclePlate ?? '—'} · ★ {formatRating(courier.ratingAvg)}</span></span>
                    <StatusBadge status={courier.courierStatus === 'ONLINE' ? 'online' : 'delivery'}>{courier.courierStatus === 'ONLINE' ? 'Livre' : 'Em entrega'}</StatusBadge>
                  </li>
                ))}
              </ul>
            ) : <p className="px-5 py-5 text-sm text-muted">{couriers.loading ? 'Carregando...' : 'Nenhum motoboy online no momento.'}</p>}
          </Card>
          <p className="flex gap-2 px-1 text-xs leading-5 text-slate-500"><Info size={15} className="shrink-0 text-brand" />A corrida vai para o motoboy livre mais próximo do restaurante (até 5 km). Sem resposta em 30 segundos, passa para o próximo.</p>
        </div>
      </div>
    </div>
  )
}
