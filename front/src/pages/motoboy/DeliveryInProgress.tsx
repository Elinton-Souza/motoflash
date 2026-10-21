import { useState, type FormEvent } from 'react'
import { Check, CircleCheck, ClipboardList, Clock3, KeyRound, MapPin, Navigation, Store, UserRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { EmptyState } from '../../components/EmptyState'
import { Input } from '../../components/Input'
import { LoadingState } from '../../components/LoadingState'
import { MapMock } from '../../components/MapMock'
import { StatusBadge } from '../../components/StatusBadge'
import { useResource } from '../../hooks/useResource'
import { api, errorMessage } from '../../lib/api'
import { estimateMinutes, formatMoney } from '../../lib/format'
import type { CourierDelivery, Delivery } from '../../types/api'

const steps = ['Corrida aceita', 'Retirada confirmada', 'A caminho do cliente', 'Entregue']
const currentStep: Partial<Record<Delivery['status'], number>> = { COURIER_ASSIGNED: 1, PICKED_UP: 2, IN_DELIVERY: 3 }
const badge: Partial<Record<Delivery['status'], { kind: string; label: string }>> = {
  COURIER_ASSIGNED: { kind: 'accepted', label: 'A caminho da coleta' },
  PICKED_UP: { kind: 'pickup', label: 'Pedido retirado' },
  IN_DELIVERY: { kind: 'delivery', label: 'Em entrega' },
}

export function DeliveryInProgress() {
  const navigate = useNavigate()
  const active = useResource(() => api<CourierDelivery | null>('/deliveries/active'))
  const [code, setCode] = useState('')
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
  if (!delivery) return <Card className="mx-auto max-w-3xl"><EmptyState icon={ClipboardList} title="Nenhuma entrega em andamento" description="Aceite uma solicitação para começar uma corrida." action={<Button onClick={() => navigate('/motoboy/dashboard')}>Ir para o dashboard</Button>} /></Card>

  const { order } = delivery
  const restaurantName = order.restaurant.restaurantName ?? order.restaurant.name
  const step = currentStep[delivery.status] ?? 1
  const title = delivery.status === 'COURIER_ASSIGNED' ? 'Vá até o restaurante retirar o pedido' : delivery.status === 'PICKED_UP' ? 'Pedido retirado! Inicie a rota' : 'Você está a caminho do cliente'

  const validateCode = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void run(async () => {
      await api(`/deliveries/${delivery.id}/validate-code`, { method: 'POST', body: { code } })
      await active.reload()
    })
  }

  const startRoute = () => run(async () => {
    await api(`/deliveries/${delivery.id}/start-route`, { method: 'POST' })
    await active.reload()
  })

  const complete = () => run(async () => {
    const done = await api<Delivery>(`/deliveries/${delivery.id}/complete`, { method: 'POST' })
    navigate(`/motoboy/finance?completed=${Number(done.earning ?? 0)}`)
  })

  return <div className="mx-auto max-w-7xl space-y-6"><div className="flex flex-wrap items-end justify-between gap-3"><div><div className="flex items-center gap-2"><StatusBadge status={badge[delivery.status]?.kind ?? 'delivery'}>{badge[delivery.status]?.label ?? 'Em entrega'}</StatusBadge><span className="text-sm text-muted">Pedido #{order.number}</span></div><h2 className="mt-2 text-2xl font-bold tracking-tight text-ink">{title}</h2></div>{delivery.distanceKm != null && <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600"><Clock3 size={17} className="text-brand" />Tempo estimado: ~{estimateMinutes(delivery.distanceKm)} min</span>}</div>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_360px]"><div className="space-y-6"><MapMock className="min-h-[380px]" /><Card className="p-6"><p className="text-base font-bold text-ink">Progresso da entrega</p><div className="mt-6 grid gap-4 sm:grid-cols-4">{steps.map((label, index) => <div key={label} className="relative"><span className={`grid size-8 place-items-center rounded-full text-xs font-bold ${index < step ? 'bg-brand text-white' : index === step ? 'bg-orange-100 text-brand ring-1 ring-orange-200' : 'bg-slate-100 text-slate-400'}`}>{index < step ? <Check size={16} /> : index + 1}</span>{index < steps.length - 1 && <span className={`absolute left-9 top-4 hidden h-0.5 w-[calc(100%-1.5rem)] sm:block ${index < step ? 'bg-brand' : 'bg-slate-200'}`} />}<p className={`mt-2 text-xs font-medium ${index <= step ? 'text-ink' : 'text-slate-400'}`}>{label}</p></div>)}</div></Card></div>
      <div className="space-y-5">
        <Card className="p-6"><div className="flex items-start justify-between"><div><p className="text-sm font-bold text-ink">Retirada</p><p className="mt-1 text-sm text-muted">{restaurantName}</p></div><span className="grid size-10 place-items-center rounded-xl bg-orange-50 text-brand"><Store size={19} /></span></div><div className="mt-4 flex gap-3 rounded-xl bg-slate-50 p-3"><MapPin size={18} className="mt-0.5 shrink-0 text-brand" /><p className="text-sm leading-5 text-slate-600">{order.restaurant.restaurantAddress ?? '—'}</p></div></Card>
        <Card className="p-6"><div className="flex items-start justify-between"><div><p className="text-sm font-bold text-ink">Destino da entrega</p><p className="mt-1 text-sm text-muted">{order.customerName}</p></div><span className="grid size-10 place-items-center rounded-xl bg-orange-50 text-brand"><UserRound size={19} /></span></div><div className="mt-4 flex gap-3 rounded-xl bg-slate-50 p-3"><MapPin size={18} className="mt-0.5 shrink-0 text-brand" /><p className="text-sm leading-5 text-slate-600">{order.customerAddress}</p></div><p className="mt-4 text-sm text-muted">Você recebe <span className="font-bold text-emerald-600">{formatMoney(order.deliveryFee)}</span></p></Card>
        {delivery.status === 'COURIER_ASSIGNED' && <Card className="p-6"><div className="flex items-start justify-between"><div><p className="text-sm font-bold text-ink">Código de retirada</p><p className="mt-1 text-sm text-muted">Peça o código de 4 dígitos no balcão do restaurante.</p></div><KeyRound size={20} className="text-brand" /></div><form onSubmit={validateCode} className="mt-5 space-y-4"><Input id="pickup-code" label="Código" inputMode="numeric" maxLength={4} placeholder="0000" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))} className="text-center text-xl font-bold tracking-[0.4em]" /><Button type="submit" fullWidth disabled={busy || code.length !== 4}>{busy ? 'Validando...' : 'Confirmar retirada'}</Button></form></Card>}
        {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        {delivery.status === 'PICKED_UP' && <Button fullWidth disabled={busy} onClick={startRoute}><Navigation size={18} />{busy ? 'Iniciando...' : 'Iniciar rota até o cliente'}</Button>}
        {delivery.status === 'IN_DELIVERY' && <><Button fullWidth disabled={busy} onClick={complete}><CircleCheck size={18} />{busy ? 'Finalizando...' : 'Finalizar entrega'}</Button><p className="text-center text-xs text-slate-400">Finalize somente após entregar o pedido ao cliente.</p></>}
      </div></div></div>
}
