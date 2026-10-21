import { useEffect, useState } from 'react'
import { ArrowLeft, Bike, Clock3, Inbox, MapPin, Navigation, Store, Timer, Wallet } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { EmptyState } from '../../components/EmptyState'
import { LoadingState } from '../../components/LoadingState'
import { StatusBadge } from '../../components/StatusBadge'
import { useResource } from '../../hooks/useResource'
import { api, errorMessage } from '../../lib/api'
import { estimateMinutes, formatKm, formatMoney } from '../../lib/format'
import type { Offer } from '../../types/api'

export function DeliveryRequest() {
  const navigate = useNavigate()
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

  const back = <button type="button" onClick={() => navigate('/motoboy/dashboard')} className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-ink"><ArrowLeft size={17} />Voltar ao dashboard</button>

  if (offer.loading) return <div className="mx-auto max-w-5xl">{back}<LoadingState /></div>
  if (!data || expired) return <div className="mx-auto max-w-5xl">{back}<Card>{error && <p role="alert" className="m-6 mb-0 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}<EmptyState icon={Inbox} title={expired ? 'O tempo para aceitar acabou' : 'Nenhuma solicitação no momento'} description={expired ? 'A corrida foi repassada para outro motoboy. Fique online para receber a próxima.' : 'Fique online no dashboard. Quando um restaurante próximo pedir um motoboy, a corrida aparece aqui.'} /></Card></div>

  const { order } = data.delivery
  const restaurantName = order.restaurant.restaurantName ?? order.restaurant.name
  const timer = `${String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:${String(secondsLeft % 60).padStart(2, '0')}`

  return <div className="mx-auto max-w-5xl">{back}
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]"><Card className="overflow-hidden"><div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 px-6 py-6"><div><div className="flex items-center gap-2"><StatusBadge status="waiting">Nova solicitação</StatusBadge><span className={`inline-flex items-center gap-1 text-xs font-medium ${secondsLeft <= 10 ? 'text-red-600' : 'text-amber-700'}`}><Timer size={14} />Expira em {timer}</span></div><h2 className="mt-4 text-2xl font-bold tracking-tight text-ink">Entrega para {order.customerName}</h2><p className="mt-1 text-sm text-muted">Pedido #{order.number} · {restaurantName}</p></div><p className="text-2xl font-bold tracking-tight text-brand">{formatMoney(order.deliveryFee)}</p></div>
      <div className="p-6"><div className="relative space-y-7 before:absolute before:bottom-6 before:left-[18px] before:top-7 before:w-px before:bg-orange-200"><div className="relative flex gap-4"><span className="z-10 grid size-9 shrink-0 place-items-center rounded-full bg-brand text-white"><Store size={17} /></span><div><p className="text-sm font-semibold text-ink">Retirar no restaurante</p><p className="mt-1 text-sm text-muted">{restaurantName}</p><p className="mt-1 text-sm text-slate-500">{order.restaurant.restaurantAddress ?? '—'}</p></div></div><div className="relative flex gap-4"><span className="z-10 grid size-9 shrink-0 place-items-center rounded-full bg-ink text-white"><MapPin size={17} /></span><div><p className="text-sm font-semibold text-ink">Entregar ao cliente</p><p className="mt-1 text-sm text-muted">{order.customerName}</p><p className="mt-1 text-sm text-slate-500">{order.customerAddress}</p></div></div></div>
        {error && <p role="alert" className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end"><Button variant="secondary" disabled={!!busy} onClick={() => respond('reject')}>{busy === 'reject' ? 'Recusando...' : 'Recusar'}</Button><Button disabled={!!busy} onClick={() => respond('accept')}>{busy === 'accept' ? 'Aceitando...' : <>Aceitar entrega <Navigation size={17} /></>}</Button></div>
      </div></Card>
      <div className="space-y-4"><Card className="p-5"><p className="text-sm font-bold text-ink">Detalhes da corrida</p><div className="mt-5 space-y-4"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-lg bg-orange-50 text-brand"><Bike size={17} /></span><div><p className="text-xs text-muted">Distância até o cliente</p><p className="text-sm font-semibold text-ink">{formatKm(data.distanceKm)}</p></div></div><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-lg bg-orange-50 text-brand"><Clock3 size={17} /></span><div><p className="text-xs text-muted">Tempo estimado</p><p className="text-sm font-semibold text-ink">~{estimateMinutes(data.distanceKm)} min</p></div></div><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-lg bg-orange-50 text-brand"><Wallet size={17} /></span><div><p className="text-xs text-muted">Você recebe</p><p className="text-sm font-semibold text-emerald-600">{formatMoney(order.deliveryFee)}</p></div></div></div></Card><p className="px-2 text-xs leading-5 text-slate-400">Se você não responder a tempo, a corrida é repassada automaticamente para o próximo motoboy mais próximo.</p></div>
    </div></div>
}
