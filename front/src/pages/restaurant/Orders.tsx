import { useMemo, useState } from 'react'
import { ChevronRight, ClipboardList, Plus, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { EmptyState } from '../../components/EmptyState'
import { FormAlert } from '../../components/FormAlert'
import { LoadingState } from '../../components/LoadingState'
import { StatusBadge } from '../../components/StatusBadge'
import { useResource } from '../../hooks/useResource'
import { api, errorMessage } from '../../lib/api'
import { formatMoney, formatRelative } from '../../lib/format'
import { isOrderActive, isOrderFailed, orderStatusInfo } from '../../lib/status'
import type { Order } from '../../types/api'

const filters = {
  all: { label: 'Todos', match: () => true },
  active: { label: 'Em andamento', match: isOrderActive },
  pending: { label: 'Sem motoboy', match: (order: Order) => !order.delivery || order.delivery.status === 'NO_COURIER_FOUND' },
  delivered: { label: 'Entregues', match: (order: Order) => order.status === 'DELIVERED' },
  canceled: { label: 'Cancelados', match: (order: Order) => order.status === 'CANCELED' },
} satisfies Record<string, { label: string; match: (order: Order) => boolean }>

type Filter = keyof typeof filters

// Fila de pedidos do restaurante: todos os pedidos com status ao vivo e
// ação rápida para pedir motoboy quando ainda não há um.
export function Orders() {
  const navigate = useNavigate()
  const orders = useResource(() => api<Order[]>('/orders'), { refreshMs: 5000, events: ['pedido_aceito', 'codigo_validado', 'entrega_em_andamento', 'entrega_finalizada'] })
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const list = useMemo(() => orders.data ?? [], [orders.data])
  const visible = useMemo(() => {
    const text = query.trim().toLowerCase()
    return list.filter(filters[filter].match).filter((order) => !text || order.customerName.toLowerCase().includes(text) || String(order.number).includes(text))
  }, [list, filter, query])

  async function requestCourier(order: Order) {
    setBusyId(order.id)
    setError('')
    try {
      if (order.status === 'PREPARING') await api(`/orders/${order.id}/ready`, { method: 'PUT' })
      await api(`/orders/${order.id}/request-courier`, { method: 'POST' })
      await orders.reload()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-xs">
          <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar cliente ou nº do pedido" aria-label="Buscar pedido" className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none focus:border-brand focus:ring-4 focus:ring-orange-100" />
        </div>
        <Button onClick={() => navigate('/restaurant/new-delivery')}><Plus size={18} />Nova entrega</Button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Filtrar pedidos">
        {(Object.keys(filters) as Filter[]).map((key) => {
          const count = list.filter(filters[key].match).length
          return <button key={key} type="button" role="tab" aria-selected={filter === key} onClick={() => setFilter(key)} className={`h-9 shrink-0 rounded-full px-4 text-sm font-semibold transition ${filter === key ? 'bg-ink text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'}`}>{filters[key].label} <span className="opacity-60">{count}</span></button>
        })}
      </div>

      {error && <FormAlert>{error}</FormAlert>}
      <Card className="overflow-hidden">
        {orders.loading ? <div className="p-6"><LoadingState /></div> : visible.length ? (
          <ul className="divide-y divide-slate-100">
            {visible.map((order) => {
              const status = orderStatusInfo(order)
              const needsCourier = !isOrderFailed(order) && !order.delivery && order.status !== 'DELIVERED'
              const retry = order.delivery?.status === 'NO_COURIER_FOUND'
              return (
                <li key={order.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                  <button type="button" onClick={() => navigate(`/restaurant/tracking?order=${order.id}`)} className="flex min-w-0 flex-1 items-center gap-4 text-left">
                    <span className="w-14 shrink-0 text-sm font-bold text-slate-400">#{order.number}</span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-ink">{order.customerName}</span>
                      <span className="block truncate text-xs text-muted">{formatRelative(order.createdAt)} · {order.customerAddress}{order.delivery?.courier ? ` · ${order.delivery.courier.name}` : ''}</span>
                    </span>
                  </button>
                  <span className="hidden text-sm font-semibold text-ink sm:block">{formatMoney(order.value)}</span>
                  <StatusBadge status={status.kind}>{status.label}</StatusBadge>
                  {needsCourier || retry
                    ? <Button variant="secondary" disabled={busyId === order.id} onClick={() => requestCourier(order)}>{busyId === order.id ? 'Buscando...' : retry ? 'Buscar de novo' : 'Pedir motoboy'}</Button>
                    : <button type="button" onClick={() => navigate(`/restaurant/tracking?order=${order.id}`)} className="grid size-9 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-ink" aria-label={`Acompanhar pedido ${order.number}`}><ChevronRight size={18} /></button>}
                </li>
              )
            })}
          </ul>
        ) : <EmptyState icon={ClipboardList} title={list.length ? 'Nenhum pedido neste filtro' : 'Nenhum pedido ainda'} description={list.length ? 'Troque o filtro ou a busca.' : 'Crie a primeira entrega para encontrar um motoboy próximo.'} />}
      </Card>
    </div>
  )
}
