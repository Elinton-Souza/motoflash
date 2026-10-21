import { useState, type FormEvent } from 'react'
import { ArrowLeft, Check, MapPin, Navigation } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { Input } from '../../components/Input'
import { LoadingState } from '../../components/LoadingState'
import { MapMock } from '../../components/MapMock'
import { StatusBadge } from '../../components/StatusBadge'

const riders = [
  { id: '1', name: 'João Silva', distance: '0,8 km', rating: '4,9', status: 'available' as const },
  { id: '2', name: 'Mateus Rocha', distance: '1,3 km', rating: '4,8', status: 'available' as const },
  { id: '3', name: 'Ana Souza', distance: '2,1 km', rating: '4,9', status: 'delivery' as const },
]

export function NewDelivery() {
  const navigate = useNavigate()
  const [selectedRider, setSelectedRider] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedRider) { setError('Selecione um motoboy disponível para solicitar a entrega.'); return }
    setError('')
    setLoading(true)
    window.setTimeout(() => navigate('/restaurant/tracking'), 600)
  }

  return <div className="mx-auto max-w-7xl"><button type="button" onClick={() => navigate('/restaurant/dashboard')} className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-ink"><ArrowLeft size={17} />Voltar ao dashboard</button><div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]"><Card className="p-6 sm:p-7"><div><p className="text-lg font-bold text-ink">Dados da nova entrega</p><p className="mt-1 text-sm text-muted">Preencha os dados para encontrar o melhor motoboy.</p></div><form className="mt-7 space-y-5" onSubmit={submit}><div className="grid gap-5 sm:grid-cols-2"><Input id="customer" label="Nome do cliente" placeholder="Ex.: Maria Souza" required /><Input id="phone" label="Telefone" placeholder="(11) 99999-9999" required /></div><Input id="pickup" label="Endereço de coleta" defaultValue="Av. Paulista, 1000" required /><Input id="delivery" label="Endereço de entrega" placeholder="Rua, número e bairro" required /><div><label htmlFor="reference" className="block text-sm font-medium text-slate-700">Ponto de referência</label><textarea id="reference" rows={3} placeholder="Ex.: Portão azul ao lado da farmácia" className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-4 focus:ring-orange-100" /></div><Input id="value" label="Valor da entrega" type="number" step="0.01" placeholder="0,00" required />{error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}<Button type="submit" fullWidth disabled={loading}>{loading ? 'Solicitando motoboy...' : 'Solicitar motoboy'}<Navigation size={17} /></Button></form></Card>
    <div className="space-y-5"><MapMock className="min-h-56" /><Card className="overflow-hidden"><div className="border-b border-slate-100 px-5 py-4"><p className="font-bold text-ink">Motoboys próximos</p><p className="mt-1 text-xs text-muted">3 profissionais encontrados na região.</p></div><div className="divide-y divide-slate-100">{riders.map((rider) => <button type="button" key={rider.id} disabled={rider.status === 'delivery'} onClick={() => setSelectedRider(rider.id)} className={`flex w-full items-center gap-3 px-5 py-4 text-left transition disabled:cursor-not-allowed disabled:opacity-55 ${selectedRider === rider.id ? 'bg-orange-50' : 'hover:bg-slate-50'}`}><span className={`grid size-10 shrink-0 place-items-center rounded-full text-sm font-bold ${selectedRider === rider.id ? 'bg-brand text-white' : 'bg-slate-100 text-slate-600'}`}>{selectedRider === rider.id ? <Check size={18} /> : rider.name.charAt(0)}</span><span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2"><span className="truncate text-sm font-semibold text-ink">{rider.name}</span><StatusBadge status={rider.status}>{rider.status === 'available' ? 'Disponível' : 'Em entrega'}</StatusBadge></span><span className="mt-1 flex items-center gap-3 text-xs text-muted"><span className="inline-flex items-center gap-1"><MapPin size={12} />{rider.distance}</span><span>★ {rider.rating}</span></span></span></button>)}</div></Card>{loading && <LoadingState label="Enviando solicitação ao motoboy..." />}</div></div></div>
}
