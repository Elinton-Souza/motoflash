import { useState, type FormEvent } from 'react'
import { ArrowRight, LoaderCircle } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { usePortal } from '../../auth/usePortal'
import { useAuth } from '../../auth/useAuth'
import { Button } from '../../components/Button'
import { FormAlert } from '../../components/FormAlert'
import { Input } from '../../components/Input'
import { PasswordInput } from '../../components/PasswordInput'
import { errorMessage } from '../../lib/api'
import { isValidEmail } from '../../lib/masks'
import { portalPaths } from '../../lib/portal'

export function Login() {
  const portal = usePortal()!
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [touched, setTouched] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  // Mensagem vinda de outra tela (ex.: senha redefinida).
  const notice = (location.state as { notice?: string } | null)?.notice

  const isMotoboy = portal.key === 'motoboy'
  const size: 'lg' | 'md' = isMotoboy ? 'lg' : 'md'
  const paths = portalPaths(portal.key)
  const emailError = touched && !isValidEmail(email) ? 'Informe um e-mail válido.' : undefined
  const passwordError = touched && !password ? 'Informe sua senha.' : undefined

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setTouched(true)
    if (!isValidEmail(email) || !password) return
    setError('')
    setLoading(true)
    try {
      await login(email.trim(), password, portal.role)
      navigate(portal.home, { replace: true })
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">{isMotoboy ? 'Entrar' : 'Acesso do restaurante'}</h1>
      <p className="mt-2 text-sm text-muted">{isMotoboy ? 'Use o e-mail e a senha do seu cadastro.' : 'Entre para pedir motoboys e acompanhar suas entregas.'}</p>
      <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
        {notice && <FormAlert tone="success">{notice}</FormAlert>}
        <Input id="email" label="E-mail" type="email" inputMode="email" autoComplete="username" placeholder="nome@exemplo.com" inputSize={size} value={email} onChange={(event) => setEmail(event.target.value)} error={emailError} />
        <div>
          <PasswordInput id="password" label="Senha" autoComplete="current-password" placeholder="Sua senha" inputSize={size} value={password} onChange={(event) => setPassword(event.target.value)} error={passwordError} />
          <Link to={paths.forgot} className="mt-2 inline-block text-sm font-semibold text-brand hover:text-brand-dark">Esqueci minha senha</Link>
        </div>
        {error && <FormAlert>{error}</FormAlert>}
        <Button type="submit" size={size} fullWidth disabled={loading}>{loading ? <><LoaderCircle size={18} className="animate-spin" />Entrando...</> : <>Entrar <ArrowRight size={18} /></>}</Button>
      </form>
      <p className="mt-8 text-center text-sm text-muted">Ainda não tem conta? <Link to={paths.register} className="font-semibold text-brand hover:text-brand-dark">Cadastre-se</Link></p>
    </div>
  )
}
