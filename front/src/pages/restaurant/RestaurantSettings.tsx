import { useState, type FormEvent } from 'react'
import type { Profile } from '../../types/api'
import { Building2, Save, SlidersHorizontal } from 'lucide-react'
import { useAuth } from '../../auth/useAuth'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { Input } from '../../components/Input'
import { LoadingState } from '../../components/LoadingState'
import { api, errorMessage } from '../../lib/api'

// Regras fixas da plataforma (back/src/services/DeliveryService.ts).
const platformRules = [
  ['Raio de busca de motoboys', '5 km a partir do cliente'],
  ['Tempo para o motoboy aceitar', '30 segundos, depois repassa ao próximo'],
  ['Confirmação de retirada', 'Código de 4 dígitos gerado em cada pedido'],
]

export function RestaurantSettings() {
  const { profile } = useAuth()
  return profile ? <SettingsForm key={profile.id} profile={profile} /> : <LoadingState />
}

function SettingsForm({ profile }: { profile: Profile }) {
  const { refreshProfile } = useAuth()
  const [form, setForm] = useState({ restaurantName: profile.restaurantName ?? '', name: profile.name, phone: profile.phone ?? '', restaurantAddress: profile.restaurantAddress ?? '' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setSaved(false)
    setError('')
    try {
      await api('/users/me', { method: 'PUT', body: { restaurantName: form.restaurantName.trim(), name: form.name.trim(), phone: form.phone.trim(), restaurantAddress: form.restaurantAddress.trim() } })
      await refreshProfile()
      setSaved(true)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const field = (name: keyof typeof form) => ({ value: form[name], onChange: (event: { target: { value: string } }) => setForm((current) => ({ ...current, [name]: event.target.value })) })

  return <div className="mx-auto max-w-4xl space-y-6"><div><p className="text-sm text-muted">Preferências da operação</p><h2 className="mt-1 text-2xl font-bold tracking-tight text-ink">Configurações</h2></div>
    <Card className="p-6 sm:p-7"><div className="flex gap-3"><span className="grid size-10 place-items-center rounded-xl bg-orange-50 text-brand"><Building2 size={20} /></span><div><p className="font-bold text-ink">Dados do restaurante</p><p className="mt-1 text-sm text-muted">Informações exibidas aos motoboys parceiros.</p></div></div><form onSubmit={submit} className="mt-7 space-y-5"><div className="grid gap-5 sm:grid-cols-2"><Input id="restaurant" label="Nome do restaurante" required {...field('restaurantName')} /><Input id="phone" label="Telefone" placeholder="(11) 3333-4455" {...field('phone')} /></div><div className="grid gap-5 sm:grid-cols-2"><Input id="owner" label="Responsável" required minLength={2} {...field('name')} /><Input id="email" label="E-mail" value={profile.email} disabled /></div><Input id="address" label="Endereço de coleta padrão" required {...field('restaurantAddress')} />{saved && <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">Configurações salvas com sucesso.</p>}{error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}<Button type="submit" disabled={saving}>{saving ? 'Salvando...' : <><Save size={17} />Salvar alterações</>}</Button></form></Card>
    <Card className="p-6 sm:p-7"><div className="flex gap-3"><span className="grid size-10 place-items-center rounded-xl bg-orange-50 text-brand"><SlidersHorizontal size={20} /></span><div><p className="font-bold text-ink">Regras de entrega</p><p className="mt-1 text-sm text-muted">Definidas pela plataforma MotoFlash.</p></div></div><div className="mt-5 divide-y divide-slate-100">{platformRules.map(([label, value]) => <div key={label} className="flex flex-wrap items-center justify-between gap-3 py-4"><p className="text-sm font-semibold text-ink">{label}</p><p className="text-sm text-muted">{value}</p></div>)}</div></Card></div>
}
