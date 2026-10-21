import { Check, CircleCheck, Clock3, Copy, MapPin, Navigation, PackageCheck, UserRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { MapMock } from '../../components/MapMock'
import { StatusBadge } from '../../components/StatusBadge'
import { deliveryMock } from '../../data/deliveriesMock'

const steps = ['Retirada confirmada', 'A caminho do cliente', 'Entregar pedido', 'Finalizar entrega']

export function DeliveryInProgress() {
  const navigate = useNavigate()
  return <div className="mx-auto max-w-7xl space-y-6"><div className="flex flex-wrap items-end justify-between gap-3"><div><div className="flex items-center gap-2"><StatusBadge status="delivery">Em entrega</StatusBadge><span className="text-sm text-muted">Pedido {deliveryMock.id}</span></div><h2 className="mt-2 text-2xl font-bold tracking-tight text-ink">Você está a caminho do cliente</h2></div><span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600"><Clock3 size={17} className="text-brand" />Chegada estimada: 8 min</span></div>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_360px]"><div className="space-y-6"><MapMock className="min-h-[380px]" /><Card className="p-6"><p className="text-base font-bold text-ink">Progresso da entrega</p><div className="mt-6 grid gap-4 sm:grid-cols-4">{steps.map((step, index) => <div key={step} className="relative"><span className={`grid size-8 place-items-center rounded-full text-xs font-bold ${index < 2 ? 'bg-brand text-white' : index === 2 ? 'bg-orange-100 text-brand ring-1 ring-orange-200' : 'bg-slate-100 text-slate-400'}`}>{index < 2 ? <Check size={16} /> : index + 1}</span>{index < steps.length - 1 && <span className={`absolute left-9 top-4 hidden h-0.5 w-[calc(100%-1.5rem)] sm:block ${index < 1 ? 'bg-brand' : 'bg-slate-200'}`} />}<p className={`mt-2 text-xs font-medium ${index <= 2 ? 'text-ink' : 'text-slate-400'}`}>{step}</p></div>)}</div></Card></div>
      <div className="space-y-5"><Card className="p-6"><div className="flex items-start justify-between"><div><p className="text-sm font-bold text-ink">Destino da entrega</p><p className="mt-1 text-sm text-muted">{deliveryMock.customer}</p></div><span className="grid size-10 place-items-center rounded-xl bg-orange-50 text-brand"><UserRound size={19} /></span></div><div className="mt-5 flex gap-3 rounded-xl bg-slate-50 p-3"><MapPin size={18} className="mt-0.5 shrink-0 text-brand" /><p className="text-sm leading-5 text-slate-600">{deliveryMock.deliveryAddress}</p></div><button type="button" className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-brand hover:text-brand-dark"><Navigation size={16} />Abrir rota simulada</button></Card>
        <Card className="p-6"><div className="flex items-start justify-between"><div><p className="text-sm font-bold text-ink">Código da entrega</p><p className="mt-1 text-sm text-muted">Confirme com o cliente antes de finalizar.</p></div><PackageCheck size={20} className="text-brand" /></div><div className="mt-5 flex items-center justify-between rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3"><span className="text-xl font-bold tracking-[0.22em] text-ink">4819</span><button type="button" className="text-slate-400 hover:text-brand" aria-label="Copiar código"><Copy size={17} /></button></div></Card>
        <Button fullWidth onClick={() => navigate('/motoboy/finance?completed=1')}><CircleCheck size={18} />Finalizar entrega</Button>
        <p className="text-center text-xs text-slate-400">Finalize somente após entregar o pedido ao cliente.</p>
      </div></div></div>
}
