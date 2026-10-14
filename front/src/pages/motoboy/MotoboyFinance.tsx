import { useMemo, useState } from 'react'
import { CircleCheck, CircleDollarSign, ClipboardList, PackageCheck, ReceiptText, TrendingUp } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { Card } from '../../components/Card'
import { EmptyState } from '../../components/EmptyState'
import { MetricCard } from '../../components/MetricCard'
import { StatusBadge } from '../../components/StatusBadge'

const deliveries = [
  { id: '#1023', place: 'Burger House', customer: 'Maria Souza', value: 'R$ 12,00', date: 'Hoje, agora', status: 'completed', label: 'Concluída' },
  { id: '#1018', place: 'Sabor & Cia', customer: 'Paulo Mendes', value: 'R$ 15,50', date: 'Hoje, 10:20', status: 'completed', label: 'Concluída' },
  { id: '#1011', place: 'Pizzaria Napoli', customer: 'Clara Dias', value: 'R$ 13,00', date: 'Hoje, 09:05', status: 'completed', label: 'Concluída' },
]

export function MotoboyFinance() {
  const [searchParams] = useSearchParams()
  const [period, setPeriod] = useState('today')
  const [status, setStatus] = useState('all')
  const completed = searchParams.get('completed') === '1'
  const filtered = useMemo(() => status === 'all' ? deliveries : deliveries.filter((delivery) => delivery.status === status), [status])
  return <div className="mx-auto max-w-7xl space-y-7"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm text-muted">Resumo do período</p><h2 className="mt-1 text-2xl font-bold tracking-tight text-ink">Seu financeiro</h2></div><div className="flex gap-2"><select value={period} onChange={(event) => setPeriod(event.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 outline-none focus:border-brand"><option value="today">Hoje</option><option value="week">Esta semana</option><option value="month">Este mês</option></select><select value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 outline-none focus:border-brand"><option value="all">Todos status</option><option value="completed">Concluídas</option><option value="cancelled">Canceladas</option></select></div></div>{completed && <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-800"><CircleCheck size={20} className="mt-0.5 shrink-0" /><div><p className="font-bold">Entrega finalizada com sucesso!</p><p className="mt-0.5 text-sm">R$ 12,00 foram adicionados aos seus ganhos de hoje.</p></div></div>}<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><MetricCard label="Ganhos do período" value="R$ 120,00" icon={CircleDollarSign} trend="+12% esta semana" /><MetricCard label="Entregas concluídas" value="8" icon={PackageCheck} /><MetricCard label="Despesas" value="R$ 30,00" icon={ReceiptText} /><MetricCard label="Saldo" value="R$ 90,00" icon={TrendingUp} /></div><Card className="overflow-hidden"><div className="border-b border-slate-100 px-6 py-5"><p className="text-base font-bold text-ink">Entregas recentes</p><p className="mt-1 text-sm text-muted">Movimentações do período selecionado.</p></div>{filtered.length ? <div className="divide-y divide-slate-100">{filtered.map((delivery) => <div key={delivery.id} className="flex flex-wrap items-center justify-between gap-4 px-6 py-4"><div><p className="text-sm font-semibold text-ink">{delivery.place} <span className="font-normal text-muted">· {delivery.id}</span></p><p className="mt-1 text-xs text-muted">{delivery.customer} · {delivery.date}</p></div><div className="flex items-center gap-5"><p className="text-sm font-bold text-emerald-600">+ {delivery.value}</p><StatusBadge status={delivery.status}>{delivery.label}</StatusBadge></div></div>)}</div> : <EmptyState icon={ClipboardList} title="Nenhuma entrega encontrada" description="Não há entregas com esse status no período selecionado." />}</Card></div>
}
