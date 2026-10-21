import { useState, type FormEvent } from 'react'
import { ArrowRight, Eye, EyeOff, LoaderCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'

export function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!email.trim() || !password.trim()) {
      setError('Preencha seu e-mail ou telefone e sua senha para continuar.')
      return
    }
    setError('')
    setLoading(true)
    window.setTimeout(() => navigate('/select-profile'), 550)
  }

  return (
    <div className="w-full">
      <div className="mb-9">
        <p className="text-sm font-semibold text-brand">Bem-vindo de volta</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">Entre na sua conta</h1>
        <p className="mt-3 text-sm leading-6 text-muted">Acesse sua operação e mantenha as entregas em movimento.</p>
      </div>
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <Input id="login" label="E-mail ou telefone" type="text" autoComplete="username" placeholder="nome@exemplo.com" value={email} onChange={(event) => setEmail(event.target.value)} error={error && !email ? 'Informe seu acesso.' : undefined} />
        <div className="relative">
          <Input id="password" label="Senha" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Digite sua senha" value={password} onChange={(event) => setPassword(event.target.value)} error={error && !password ? 'Informe sua senha.' : undefined} />
          <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-9 grid size-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}>
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
        <div className="flex justify-end"><button type="button" className="text-sm font-semibold text-brand hover:text-brand-dark">Esqueci minha senha</button></div>
        {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2.5 text-xs text-red-700">{error}</p>}
        <Button type="submit" fullWidth disabled={loading}>{loading ? <><LoaderCircle size={17} className="animate-spin" />Entrando...</> : <>Entrar <ArrowRight size={17} /></>}</Button>
      </form>
      <p className="mt-8 text-center text-sm text-muted">Ainda não possui uma conta? <button type="button" className="font-semibold text-brand hover:text-brand-dark">Criar conta</button></p>
    </div>
  )
}
