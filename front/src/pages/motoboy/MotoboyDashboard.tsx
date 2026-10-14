import { useState } from 'react'
import { ArrowRight, Bike, CircleDollarSign, Clock3, MapPin, PackageCheck, Power, ReceiptText, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../../components/Card'
import { MetricCard } from '../../components/MetricCard'
import { StatusBadge } from '../../components/StatusBadge'
import { motoboyMock } from '../../data/motoboyMock'
import { deliveryMock } from '../../data/deliveriesMock'

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export function MotoboyDashboard() {
  const navigate = useNavigate()
  const [online, setOnline] = useState(motoboyMock.status === 'online')

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-sm text-muted">Segunda-feira, 21 de setembro</p><h2 className="mt-1 text-2xl font-bold tracking-tight text-ink">Olá, João! Pronto para rodar?</h2></div>
        <button type="button" onClick={() => setOnline((value) => !value)} className={`inline-flex h-11 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition ${online ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-slate-100 text-slate-600 ring-1 ring-slate-200'}`}><Power size={17} />{online ? 'Você está online' : 'Você está offline'}<span className={`size-2 rounded-full ${online ? 'bg-emerald-500' : 'bg-slate-400'}`} /></button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Ganhos hoje" value={money.format(motoboyMock.todayEarnings)} icon={CircleDollarSign} trend="+12% comparado a ontem" />
        <MetricCard label="Entregas hoje" value={String(motoboyMock.todayDeliveries)} icon={PackageCheck} trend="2 a mais que ontem" />
        <MetricCard label="Despesas hoje" value={money.format(motoboyMock.todayExpenses)} icon={ReceiptText} />
        <MetricCard label="Saldo do dia" value={money.format(motoboyMock.balance)} icon={TrendingUp} trend="Seu melhor resultado da semana" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.8fr)]">
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-5"><div><p className="text-base font-bold text-ink">Nova solicitação disponível</p><p className="mt-1 text-sm text-muted">Uma entrega próxima de você está aguardando.</p></div><StatusBadge status={online ? 'online' : 'waiting'}>{online ? 'Disponível agora' : 'Fique online'}</StatusBadge></div>
          <div className="p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div className="flex gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-orange-50 text-brand"><Bike size={21} /></span><div><p className="font-semibold text-ink">{deliveryMock.restaurant}</p><p className="mt-1 text-sm text-muted">Retirada em {deliveryMock.pickupAddress}</p></div></div><p className="text-lg font-bold text-brand">{money.format(deliveryMock.value)}</p></div>
            <div className="my-5 h-px bg-slate-100" />
            <div className="flex flex-wrap items-center justify-between gap-4"><div className="flex gap-5 text-sm text-slate-600"><span className="inline-flex items-center gap-1.5"><MapPin size={16} className="text-brand" />{deliveryMock.distance}</span><span className="inline-flex items-center gap-1.5"><Clock3 size={16} className="text-brand" />{deliveryMock.estimatedTime}</span></div><button type="button" disabled={!online} onClick={() => navigate('/motoboy/request')} className="inline-flex items-center gap-2 text-sm font-bold text-brand transition hover:text-brand-dark disabled:cursor-not-allowed disabled:opacity-50">Ver detalhes <ArrowRight size={17} /></button></div>
          </div>
        </Card>
        <Card className="p-6"><p className="text-base font-bold text-ink">Resumo da semana</p><p className="mt-1 text-sm text-muted">Seu desempenho nos últimos 7 dias.</p><div className="mt-7 flex items-end gap-2" aria-label="Gráfico ilustrativo de ganhos semanais">{[45, 65, 42, 78, 55, 88, 70].map((height, index) => <span key={index} className={`flex-1 rounded-t-md ${index === 6 ? 'bg-brand' : 'bg-orange-100'}`} style={{ height: `${height}px` }} />)}</div><div className="mt-3 flex justify-between text-xs text-slate-400"><span>Seg</span><span>Dom</span></div><button type="button" onClick={() => navigate('/motoboy/finance')} className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-brand hover:text-brand-dark">Ver financeiro <ArrowRight size={16} /></button></Card>
      </div>
    </div>
  )
}
