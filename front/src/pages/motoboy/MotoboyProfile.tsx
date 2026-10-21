import { useEffect, useState, type FormEvent } from 'react'
import type { Profile } from '../../types/api'
import { BadgeCheck, Bike, CalendarDays, Save } from 'lucide-react'
import { useAuth } from '../../auth/useAuth'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { Input } from '../../components/Input'
import { LoadingState } from '../../components/LoadingState'
import { StatusBadge } from '../../components/StatusBadge'
import { api, errorMessage } from '../../lib/api'
import { formatRating } from '../../lib/format'

const statusLabel = { ONLINE: ['online', 'Online'], ON_DELIVERY: ['delivery', 'Em entrega'], OFFLINE: ['waiting', 'Offline'] } as const

export function MotoboyProfile() {
  const { profile, refreshProfile } = useAuth()

  useEffect(() => {
    refreshProfile().catch(() => undefined)
  }, [refreshProfile])

  return profile ? <ProfileForm key={profile.id} profile={profile} /> : <LoadingState />
}

function ProfileForm({ profile }: { profile: Profile }) {
  const { refreshProfile } = useAuth()
  const [form, setForm] = useState({ name: profile.name, phone: profile.phone ?? '', vehiclePlate: profile.vehiclePlate ?? '' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setSaved(false)
    setError('')
    try {
      await api('/users/me', { method: 'PUT', body: { name: form.name.trim(), phone: form.phone.trim(), vehiclePlate: form.vehiclePlate.trim().toUpperCase() } })
      await refreshProfile()
      setSaved(true)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const [badgeKind, badgeLabel] = statusLabel[profile.courierStatus ?? 'OFFLINE']
  const field = (name: keyof typeof form) => ({ value: form[name], onChange: (event: { target: { value: string } }) => setForm((current) => ({ ...current, [name]: event.target.value })) })

  return <div className="mx-auto max-w-4xl space-y-6"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm text-muted">Conta MotoFlash</p><h2 className="mt-1 text-2xl font-bold tracking-tight text-ink">Meu perfil</h2></div><StatusBadge status={badgeKind}>{badgeLabel}</StatusBadge></div>
    <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]"><Card className="flex flex-col items-center p-6 text-center"><span className="grid size-20 place-items-center rounded-full bg-orange-100 text-2xl font-bold text-brand">{profile.name.charAt(0)}</span><h3 className="mt-4 font-bold text-ink">{profile.name}</h3><p className="mt-1 text-sm text-muted">Motoboy parceiro</p><div className="mt-5 flex items-center gap-1 text-sm font-semibold text-amber-600">★ {formatRating(profile.ratingAvg)} <span className="font-normal text-muted">({profile.ratingCount} avaliações)</span></div></Card>
      <Card className="p-6 sm:p-7"><p className="font-bold text-ink">Informações pessoais</p><p className="mt-1 text-sm text-muted">Mantenha seus dados atualizados.</p><form onSubmit={submit} className="mt-6 space-y-5"><div className="grid gap-5 sm:grid-cols-2"><Input id="name" label="Nome completo" required minLength={2} {...field('name')} /><Input id="phone" label="Telefone" placeholder="(11) 99999-9999" {...field('phone')} /></div><div className="grid gap-5 sm:grid-cols-2"><Input id="email" label="E-mail" type="email" value={profile.email} disabled /><Input id="plate" label="Placa da moto" maxLength={10} {...field('vehiclePlate')} /></div>{saved && <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">Dados atualizados com sucesso.</p>}{error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}<Button type="submit" disabled={saving}>{saving ? 'Salvando...' : <><Save size={17} />Salvar alterações</>}</Button></form></Card></div>
    <div className="grid gap-4 sm:grid-cols-3">
      <Card className="p-5"><Bike size={20} className="text-brand" /><p className="mt-4 text-sm font-bold text-ink">Veículo</p><p className="mt-1 text-xs text-muted">{profile.vehiclePlate ? `Placa ${profile.vehiclePlate}` : 'Placa não informada'}</p></Card>
      <Card className="p-5"><CalendarDays size={20} className="text-brand" /><p className="mt-4 text-sm font-bold text-ink">Parceiro desde</p><p className="mt-1 text-xs text-muted">{new Date(profile.createdAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p></Card>
      <Card className="p-5"><BadgeCheck size={20} className="text-brand" /><p className="mt-4 text-sm font-bold text-ink">Situação</p><p className="mt-1 text-xs text-muted">{badgeLabel}</p></Card>
    </div></div>
}
