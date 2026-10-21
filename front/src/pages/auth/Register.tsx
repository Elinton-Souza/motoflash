import { useState, type FormEvent } from 'react'
import { ArrowRight, ChevronLeft, LoaderCircle } from 'lucide-react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { homeFor, type RegisterInput } from '../../auth/context'
import { useAuth } from '../../auth/useAuth'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { errorMessage } from '../../lib/api'

export function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [params] = useSearchParams()
  const role = params.get('role')
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', restaurantName: '', restaurantAddress: '', vehiclePlate: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (role !== 'MOTOBOY' && role !== 'RESTAURANT') return <Navigate to="/select-profile" replace />
  const isRestaurant = role === 'RESTAURANT'
  const field = (name: keyof typeof form) => ({ value: form[name], onChange: (event: { target: { value: string } }) => setForm((current) => ({ ...current, [name]: event.target.value })) })

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (form.password.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres.')
      return
    }
    const input: RegisterInput = {
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      phone: form.phone.trim() || undefined,
      role: isRestaurant ? 'RESTAURANT' : 'MOTOBOY',
      ...(isRestaurant
        ? { restaurantName: form.restaurantName.trim(), restaurantAddress: form.restaurantAddress.trim() }
        : { vehiclePlate: form.vehiclePlate.trim().toUpperCase() }),
    }
    setError('')
    setLoading(true)
    try {
      const user = await register(input)
      navigate(homeFor(user.role), { replace: true })
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <Link to="/select-profile" className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-ink"><ChevronLeft size={17} />Trocar perfil</Link>
      <div className="mb-8">
        <p className="text-sm font-semibold text-brand">{isRestaurant ? 'Conta de restaurante' : 'Conta de motoboy'}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink">Crie sua conta</h1>
      </div>
      <form className="space-y-4" onSubmit={submit}>
        <Input id="name" label={isRestaurant ? 'Nome do responsável' : 'Nome completo'} required minLength={2} {...field('name')} />
        {isRestaurant && <>
          <Input id="restaurantName" label="Nome do restaurante" required {...field('restaurantName')} />
          <Input id="restaurantAddress" label="Endereço de coleta" placeholder="Rua, número e bairro" required {...field('restaurantAddress')} />
        </>}
        {!isRestaurant && <Input id="vehiclePlate" label="Placa da moto" placeholder="ABC1D23" maxLength={10} required {...field('vehiclePlate')} />}
        <div className="grid gap-4 sm:grid-cols-2">
          <Input id="email" label="E-mail" type="email" autoComplete="username" required {...field('email')} />
          <Input id="phone" label="Telefone" placeholder="(11) 99999-9999" {...field('phone')} />
        </div>
        <Input id="password" label="Senha" type="password" autoComplete="new-password" placeholder="Mínimo de 6 caracteres" required {...field('password')} />
        {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2.5 text-xs text-red-700">{error}</p>}
        <Button type="submit" fullWidth disabled={loading}>{loading ? <><LoaderCircle size={17} className="animate-spin" />Criando conta...</> : <>Criar conta <ArrowRight size={17} /></>}</Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">Já possui conta? <Link to="/" className="font-semibold text-brand hover:text-brand-dark">Entrar</Link></p>
    </div>
  )
}
