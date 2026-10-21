import { useState, type FormEvent } from 'react'
import { ArrowLeft, Bike, Info, MapPin, Navigation, Store } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/useAuth'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { Input } from '../../components/Input'
import { LoadingState } from '../../components/LoadingState'
import { MapMock } from '../../components/MapMock'
import { StatusBadge } from '../../components/StatusBadge'
import { useResource } from '../../hooks/useResource'
import { api, errorMessage } from '../../lib/api'
import { formatRating } from '../../lib/format'
import { nearbyPoint } from '../../lib/location'
import type { ConnectedCourier, Order } from '../../types/api'

export function NewDelivery() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const couriers = useResource(() => api<ConnectedCourier[]>('/users/couriers'), { refreshMs: 5000 })
  const [form, setForm] = useState({ customerName: '', customerAddress: '', value: '', deliveryFee: '' })
  const [step, setStep] = useState('')
  const [error, setError] = useState('')

  const field = (name: keyof typeof form) => ({ value: form[name], onChange: (event: { target: { value: string } }) => setForm((current) => ({ ...current, [name]: event.target.value })) })

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = Number(form.value.replace(',', '.'))
    const deliveryFee = Number(form.deliveryFee.replace(',', '.'))
    if (!(value > 0) || !(deliveryFee >= 0)) {
      setError('Informe valores válidos para o pedido e para a taxa de entrega.')
      return
    }
    setError('')
    let order: Order | null = null
    try {
      // Coordenadas do cliente próximas ao ponto de referência (ver lib/location.ts).
      const position = nearbyPoint(1.5)
      setStep('Criando pedido...')
      order = await api<Order>('/orders', { method: 'POST', body: { customerName: form.customerName.trim(), customerAddress: form.customerAddress.trim(), customerLat: position.lat, customerLng: position.lng, value, deliveryFee } })
      setStep('Marcando pedido como pronto...')
      await api(`/orders/${order.id}/ready`, { method: 'PUT' })
      setStep('Buscando o motoboy mais próximo...')
      await api(`/orders/${order.id}/request-courier`, { method: 'POST' })
      navigate(`/restaurant/tracking?order=${order.id}`)
    } catch (err) {
      // Se o pedido já foi criado, o acompanhamento permite tentar de novo.
      if (order) navigate(`/restaurant/tracking?order=${order.id}`)
      else setError(errorMessage(err))
    } finally {
      setStep('')
    }
  }

  const list = couriers.data ?? []
  const online = list.filter((courier) => courier.courierStatus === 'ONLINE').length

  return <div className="mx-auto max-w-7xl"><button type="button" onClick={() => navigate('/restaurant/dashboard')} className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-ink"><ArrowLeft size={17} />Voltar ao dashboard</button><div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]"><Card className="p-6 sm:p-7"><div><p className="text-lg font-bold text-ink">Dados da nova entrega</p><p className="mt-1 text-sm text-muted">Preencha os dados para encontrar o melhor motoboy.</p></div>
    <form className="mt-7 space-y-5" onSubmit={submit}>
      <div className="flex gap-3 rounded-xl bg-slate-50 p-4"><Store size={18} className="mt-0.5 shrink-0 text-brand" /><div><p className="text-sm font-semibold text-ink">Coleta em {profile?.restaurantName ?? 'seu restaurante'}</p><p className="mt-0.5 text-sm text-muted">{profile?.restaurantAddress ?? 'Endereço não cadastrado'} · <Link to="/restaurant/settings" className="font-semibold text-brand hover:text-brand-dark">alterar</Link></p></div></div>
      <Input id="customer" label="Nome do cliente" placeholder="Ex.: Maria Souza" required minLength={2} {...field('customerName')} />
      <Input id="delivery" label="Endereço de entrega" placeholder="Rua, número e bairro" required minLength={3} maxLength={160} {...field('customerAddress')} />
      <div className="grid gap-5 sm:grid-cols-2"><Input id="value" label="Valor do pedido (R$)" type="number" min="0.01" step="0.01" placeholder="0,00" required {...field('value')} /><Input id="fee" label="Taxa de entrega (R$)" type="number" min="0" step="0.01" placeholder="0,00" required {...field('deliveryFee')} /></div>
      <p className="-mt-2 text-xs text-muted">A taxa de entrega é o valor repassado ao motoboy ao finalizar a corrida.</p>
      {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <Button type="submit" fullWidth disabled={!!step}>{step || 'Solicitar motoboy'}<Navigation size={17} /></Button>
    </form></Card>
    <div className="space-y-5"><MapMock className="min-h-56" /><Card className="overflow-hidden"><div className="border-b border-slate-100 px-5 py-4"><p className="font-bold text-ink">Motoboys conectados</p><p className="mt-1 text-xs text-muted">{online} disponível(is) agora.</p></div>
      {couriers.loading ? <div className="p-5"><LoadingState /></div> : list.length ? <div className="divide-y divide-slate-100">{list.map((courier) => <div key={courier.id} className={`flex items-center gap-3 px-5 py-4 ${courier.courierStatus === 'ON_DELIVERY' ? 'opacity-60' : ''}`}><span className="grid size-10 shrink-0 place-items-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">{courier.name.charAt(0)}</span><span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2"><span className="truncate text-sm font-semibold text-ink">{courier.name}</span><StatusBadge status={courier.courierStatus === 'ONLINE' ? 'available' : 'delivery'}>{courier.courierStatus === 'ONLINE' ? 'Disponível' : 'Em entrega'}</StatusBadge></span><span className="mt-1 flex items-center gap-3 text-xs text-muted"><span className="inline-flex items-center gap-1"><Bike size={12} />{courier.vehiclePlate ?? '—'}</span><span>★ {formatRating(courier.ratingAvg)}</span></span></span></div>)}</div> : <p className="flex items-center gap-2 px-5 py-6 text-sm text-muted"><MapPin size={16} className="text-brand" />Nenhum motoboy online no momento.</p>}
    </Card><p className="flex gap-2 px-1 text-xs leading-5 text-slate-500"><Info size={15} className="shrink-0 text-brand" />A corrida é enviada automaticamente ao motoboy online mais próximo (raio de 5 km). Se ele recusar ou não responder em 30 segundos, ela passa para o próximo.</p>{step && <LoadingState label={step} />}</div></div></div>
}
