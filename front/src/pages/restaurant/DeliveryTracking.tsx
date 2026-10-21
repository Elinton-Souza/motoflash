import { useState } from 'react'
import { AlertTriangle, ArrowLeft, Bike, Check, ClipboardList, Clock3, KeyRound, MapPin, Phone, RotateCcw, UserRound } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { EmptyState } from '../../components/EmptyState'
import { LoadingState } from '../../components/LoadingState'
import { MapMock } from '../../components/MapMock'
import { StatusBadge } from '../../components/StatusBadge'
import { useResource } from '../../hooks/useResource'
import { api, errorMessage } from '../../lib/api'
import { estimateMinutes, formatKm, formatMoney, formatRating, formatRelative } from '../../lib/format'
import { isOrderActive, orderStatusInfo } from '../../lib/status'
import type { DeliveryStatus, Order } from '../../types/api'

const trackingSteps = ['Buscando motoboy', 'Motoboy a caminho da coleta', 'Pedido retirado', 'A caminho do cliente', 'Entregue']
const stepByStatus: Partial<Record<DeliveryStatus, number>> = { SEARCHING_COURIER: 0, COURIER_ASSIGNED: 1, PICKED_UP: 2, IN_DELIVERY: 3, DELIVERED: 4 }

export function DeliveryTracking() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const orders = useResource(() => api<Order[]>('/orders'), { refreshMs: 3000, events: ['pedido_aceito', 'codigo_validado', 'entrega_em_andamento', 'entrega_finalizada'] })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const list = orders.data ?? []
  const selectedId = params.get('order')
  // Sem pedido na URL, mostra a entrega ativa mais recente (ou o último pedido).
  const order = list.find((item) => item.id === selectedId) ?? (selectedId ? undefined : list.find(isOrderActive) ?? list[0])

  async function requestCourier(target: Order) {
    setBusy(true)
    setError('')
    try {
      if (target.status === 'PREPARING') await api(`/orders/${target.id}/ready`, { method: 'PUT' })
      await api(`/orders/${target.id}/request-courier`, { method: 'POST' })
      await orders.reload()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const back = <button type="button" onClick={() => navigate('/restaurant/dashboard')} className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-ink"><ArrowLeft size={17} />Voltar ao dashboard</button>
  if (orders.loading) return <div className="mx-auto max-w-7xl">{back}<LoadingState /></div>
  if (!order) return <div className="mx-auto max-w-7xl">{back}<Card><EmptyState icon={ClipboardList} title="Nenhuma entrega para acompanhar" description="Crie uma nova entrega para acompanhar o motoboy em tempo real." action={<Button onClick={() => navigate('/restaurant/new-delivery')}>Nova entrega</Button>} /></Card></div>

  const delivery = order.delivery
  const status = orderStatusInfo(order)
  const step = delivery ? stepByStatus[delivery.status] ?? 0 : -1
  const done = order.status === 'DELIVERED'
  const noCourier = delivery?.status === 'NO_COURIER_FOUND'
  const courier = delivery?.courier

  return <div className="mx-auto max-w-7xl">{back}
    <div className="flex flex-wrap items-end justify-between gap-4"><div><div className="flex items-center gap-2"><StatusBadge status={status.kind}>{status.label}</StatusBadge><span className="text-sm text-muted">Pedido #{order.number} · {formatRelative(order.createdAt)}</span></div><h2 className="mt-2 text-2xl font-bold tracking-tight text-ink">{done ? 'Pedido entregue com sucesso' : 'Acompanhe sua entrega'}</h2></div>
      <div className="flex flex-wrap items-center gap-4">{!done && delivery?.distanceKm != null && <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600"><Clock3 size={17} className="text-brand" />Previsão: ~{estimateMinutes(delivery.distanceKm)} min</span>}
        <select aria-label="Escolher pedido" value={order.id} onChange={(event) => setParams({ order: event.target.value })} className="h-10 max-w-64 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 outline-none focus:border-brand">{list.slice(0, 20).map((item) => <option key={item.id} value={item.id}>#{item.number} · {item.customerName}</option>)}</select></div></div>
    <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_360px]"><div className="space-y-6"><MapMock className="min-h-[360px]" />
      {noCourier && <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-900"><div className="flex gap-3"><AlertTriangle size={20} className="mt-0.5 shrink-0" /><div><p className="font-bold">Nenhum motoboy disponível por perto</p><p className="mt-0.5 text-sm">Nenhum motoboy online aceitou a corrida. Tente novamente quando houver motoboys conectados.</p></div></div><Button disabled={busy} onClick={() => requestCourier(order)}><RotateCcw size={16} />{busy ? 'Buscando...' : 'Buscar novamente'}</Button></div>}
      {!delivery && !done && <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4"><p className="text-sm text-slate-600">Este pedido ainda não tem um motoboy solicitado.</p><Button disabled={busy} onClick={() => requestCourier(order)}>{busy ? 'Solicitando...' : 'Solicitar motoboy'}</Button></div>}
      {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <Card className="p-6"><p className="font-bold text-ink">Status da entrega</p><div className="mt-6 grid gap-4 sm:grid-cols-5">{trackingSteps.map((label, index) => <div key={label} className="relative"><span className={`grid size-8 place-items-center rounded-full text-xs font-bold ${index < step || (done && index === step) ? 'bg-brand text-white' : index === step ? 'bg-orange-100 text-brand ring-1 ring-orange-200' : 'bg-slate-100 text-slate-400'}`}>{index < step || (done && index === step) ? <Check size={16} /> : index + 1}</span>{index < trackingSteps.length - 1 && <span className={`absolute left-9 top-4 hidden h-0.5 w-[calc(100%-1.5rem)] sm:block ${index < step ? 'bg-brand' : 'bg-slate-200'}`} />}<p className={`mt-2 text-xs font-medium ${index <= step ? 'text-ink' : 'text-slate-400'}`}>{label}</p></div>)}</div>{delivery?.status === 'SEARCHING_COURIER' && <div className="mt-6"><LoadingState label="Aguardando um motoboy aceitar a corrida..." /></div>}</Card></div>
      <div className="space-y-5">
        <Card className="p-6"><div className="flex justify-between"><div><p className="text-sm font-bold text-ink">Motoboy responsável</p><p className="mt-1 text-sm text-muted">{courier ? `${courier.name} · ★ ${formatRating(courier.ratingAvg)}` : 'Aguardando aceite'}</p></div><span className="grid size-10 place-items-center rounded-xl bg-orange-50 text-brand"><Bike size={19} /></span></div>{courier && <div className="mt-5 space-y-2 text-sm text-slate-600"><p className="flex items-center gap-2"><Bike size={15} className="text-brand" />Placa {courier.vehiclePlate ?? '—'} · {formatKm(delivery?.distanceKm)}</p>{courier.phone && <p className="flex items-center gap-2"><Phone size={15} className="text-brand" />{courier.phone}</p>}</div>}</Card>
        <Card className="p-6"><div className="flex justify-between"><div><p className="text-sm font-bold text-ink">Cliente</p><p className="mt-1 text-sm text-muted">{order.customerName}</p></div><UserRound size={19} className="text-brand" /></div><p className="mt-5 flex gap-2 text-sm leading-5 text-slate-600"><MapPin size={17} className="shrink-0 text-brand" />{order.customerAddress}</p><div className="mt-4 flex justify-between text-sm"><span className="text-muted">Valor do pedido</span><span className="font-semibold text-ink">{formatMoney(order.value)}</span></div><div className="mt-1 flex justify-between text-sm"><span className="text-muted">Taxa de entrega</span><span className="font-semibold text-ink">{formatMoney(order.deliveryFee)}</span></div></Card>
        {!done && <Card className="p-6"><div className="flex justify-between"><div><p className="text-sm font-bold text-ink">Código de retirada</p><p className="mt-1 text-sm text-muted">Informe ao motoboy no balcão.</p></div><KeyRound size={19} className="text-brand" /></div><p className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-center text-2xl font-bold tracking-[0.3em] text-ink">{order.pickupCode}</p></Card>}
        {done && <Button fullWidth onClick={() => navigate('/restaurant/finance')}><Check size={18} />Ver histórico / financeiro</Button>}
      </div></div></div>
}
