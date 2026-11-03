import { useState, type FormEvent } from 'react'
import { ArrowRight, LoaderCircle } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import type { RegisterInput } from '../../auth/context'
import { usePortal } from '../../auth/usePortal'
import { useAuth } from '../../auth/useAuth'
import { Button } from '../../components/Button'
import { FormAlert } from '../../components/FormAlert'
import { Input } from '../../components/Input'
import { PasswordInput } from '../../components/PasswordInput'
import { errorMessage } from '../../lib/api'
import { isValidEmail, isValidPhone, isValidPlate, maskPhone, maskPlate, onlyDigits } from '../../lib/masks'
import { portalPaths } from '../../lib/portal'

const emptyForm = { name: '', email: '', phone: '', password: '', confirmPassword: '', restaurantName: '', restaurantAddress: '', vehiclePlate: '' }
type Field = keyof typeof emptyForm

export function Register() {
  const portal = usePortal()!
  const navigate = useNavigate()
  const { register } = useAuth()
  const [form, setForm] = useState(emptyForm)
  const [touched, setTouched] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isMotoboy = portal.key === 'motoboy'
  const size: 'lg' | 'md' = isMotoboy ? 'lg' : 'md'

  const errors: Partial<Record<Field, string>> = {}
  if (form.name.trim().length < 2) errors.name = isMotoboy ? 'Informe seu nome completo.' : 'Informe o nome do responsável.'
  if (!isValidEmail(form.email)) errors.email = 'Informe um e-mail válido.'
  if (!isValidPhone(form.phone)) errors.phone = 'Informe o WhatsApp com DDD.'
  if (form.password.length < 6) errors.password = 'A senha precisa ter pelo menos 6 caracteres.'
  if (form.confirmPassword !== form.password) errors.confirmPassword = 'As senhas não conferem.'
  if (isMotoboy && !isValidPlate(form.vehiclePlate)) errors.vehiclePlate = 'Placa inválida. Ex.: ABC1D23'
  if (!isMotoboy && form.restaurantName.trim().length < 2) errors.restaurantName = 'Informe o nome do restaurante.'
  if (!isMotoboy && form.restaurantAddress.trim().length < 5) errors.restaurantAddress = 'Informe rua, número, bairro e cidade.'

  const field = (name: Field, transform: (value: string) => string = (value) => value) => ({
    value: form[name],
    error: touched ? errors[name] : undefined,
    inputSize: size,
    onChange: (event: { target: { value: string } }) => setForm((current) => ({ ...current, [name]: transform(event.target.value) })),
  })

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setTouched(true)
    if (Object.keys(errors).length) return
    const input: RegisterInput = {
      role: portal.role,
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      phone: onlyDigits(form.phone),
      ...(isMotoboy
        ? { vehiclePlate: form.vehiclePlate }
        : { restaurantName: form.restaurantName.trim(), restaurantAddress: form.restaurantAddress.trim() }),
    }
    setError('')
    setLoading(true)
    try {
      await register(input)
      navigate(portal.home, { replace: true })
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{isMotoboy ? 'Cadastro de motoboy' : 'Cadastre seu restaurante'}</h1>
      <p className="mt-2 text-sm text-muted">{isMotoboy ? 'Leva menos de um minuto.' : 'Comece a pedir motoboys ainda hoje.'}</p>
      <form className="mt-8 space-y-4" onSubmit={submit} noValidate>
        {!isMotoboy && <>
          <Input id="restaurantName" label="Nome do restaurante" autoComplete="organization" {...field('restaurantName')} />
          <Input id="restaurantAddress" label="Endereço de coleta" placeholder="Rua, número, bairro e cidade" autoComplete="street-address" hint="Usado para encontrar os motoboys mais próximos." {...field('restaurantAddress')} />
        </>}
        <Input id="name" label={isMotoboy ? 'Nome completo' : 'Nome do responsável'} autoComplete="name" {...field('name')} />
        {isMotoboy && <Input id="vehiclePlate" label="Placa da moto" placeholder="ABC1D23" autoCapitalize="characters" {...field('vehiclePlate', maskPlate)} />}
        <Input id="phone" label="WhatsApp" type="tel" inputMode="tel" autoComplete="tel" placeholder="(11) 98888-7777" hint="Os códigos de confirmação e de recuperação de senha chegam por aqui." {...field('phone', maskPhone)} />
        <Input id="email" label="E-mail" type="email" inputMode="email" autoComplete="email" placeholder="nome@exemplo.com" {...field('email')} />
        <div className={isMotoboy ? 'space-y-4' : 'grid gap-4 sm:grid-cols-2'}>
          <PasswordInput id="password" label="Senha" autoComplete="new-password" placeholder="Mínimo de 6 caracteres" {...field('password')} />
          <PasswordInput id="confirmPassword" label="Confirmar senha" autoComplete="new-password" placeholder="Repita a senha" {...field('confirmPassword')} />
        </div>
        {error && <FormAlert>{error}</FormAlert>}
        <Button type="submit" size={size} fullWidth disabled={loading}>{loading ? <><LoaderCircle size={18} className="animate-spin" />Criando conta...</> : <>Criar conta <ArrowRight size={18} /></>}</Button>
      </form>
      <p className="mt-8 text-center text-sm text-muted">Já tem conta? <Link to={portalPaths(portal.key).login} className="font-semibold text-brand hover:text-brand-dark">Entrar</Link></p>
    </div>
  )
}
