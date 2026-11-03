import { useState, type FormEvent } from 'react'
import { ArrowRight, LoaderCircle, MessageCircle } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { usePortal } from '../../auth/usePortal'
import { Button } from '../../components/Button'
import { FormAlert } from '../../components/FormAlert'
import { Input } from '../../components/Input'
import { PasswordInput } from '../../components/PasswordInput'
import { api, errorMessage } from '../../lib/api'
import { isValidEmail, onlyDigits } from '../../lib/masks'
import { portalPaths } from '../../lib/portal'

type ForgotResponse = { message: string; sentTo?: string | null; devCode?: string }

// Recuperação de senha em duas etapas: e-mail -> código no WhatsApp + nova senha.
export function ForgotPassword() {
  const portal = usePortal()!
  const navigate = useNavigate()
  const paths = portalPaths(portal.key)
  const size: 'lg' | 'md' = portal.key === 'motoboy' ? 'lg' : 'md'

  const [step, setStep] = useState<'email' | 'code'>('email')
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState<ForgotResponse | null>(null)
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [touched, setTouched] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function run(action: () => Promise<void>) {
    setError('')
    setLoading(true)
    try {
      await action()
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  function requestCode(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault()
    setTouched(true)
    if (!isValidEmail(email)) return
    void run(async () => {
      const result = await api<ForgotResponse>('/auth/forgot-password', { method: 'POST', body: { email: email.trim() } })
      setSent(result)
      setTouched(false)
      setStep('code')
    })
  }

  const codeError = code.length !== 6 ? 'Digite os 6 números do código.' : undefined
  const passwordError = password.length < 6 ? 'A senha precisa ter pelo menos 6 caracteres.' : undefined
  const confirmError = confirm !== password ? 'As senhas não conferem.' : undefined

  function resetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setTouched(true)
    if (codeError || passwordError || confirmError) return
    void run(async () => {
      await api('/auth/reset-password', { method: 'POST', body: { email: email.trim(), code, password } })
      navigate(paths.login, { replace: true, state: { notice: 'Senha alterada. Entre com a nova senha.' } })
    })
  }

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Recuperar senha</h1>
      {step === 'email' ? <>
        <p className="mt-2 text-sm text-muted">Informe o e-mail da conta. Enviaremos um código para o WhatsApp cadastrado.</p>
        <form className="mt-8 space-y-5" onSubmit={requestCode} noValidate>
          <Input id="email" label="E-mail" type="email" inputMode="email" autoComplete="username" placeholder="nome@exemplo.com" inputSize={size} value={email} onChange={(event) => setEmail(event.target.value)} error={touched && !isValidEmail(email) ? 'Informe um e-mail válido.' : undefined} />
          {error && <FormAlert>{error}</FormAlert>}
          <Button type="submit" size={size} fullWidth disabled={loading}>{loading ? <><LoaderCircle size={18} className="animate-spin" />Enviando...</> : <>Enviar código <MessageCircle size={18} /></>}</Button>
        </form>
      </> : <>
        <p className="mt-2 text-sm text-muted">{sent?.sentTo ? <>Se o e-mail estiver cadastrado, o código foi enviado para o WhatsApp <strong className="text-ink">{sent.sentTo}</strong>.</> : sent?.message}</p>
        <form className="mt-8 space-y-4" onSubmit={resetPassword} noValidate>
          {sent?.devCode && <FormAlert tone="info">Modo de teste (WhatsApp não configurado): o código é <strong className="tracking-widest">{sent.devCode}</strong>.</FormAlert>}
          <Input id="code" label="Código de 6 dígitos" inputMode="numeric" autoComplete="one-time-code" placeholder="000000" maxLength={6} inputSize={size} className="text-center text-xl font-bold tracking-[0.4em]" value={code} onChange={(event) => setCode(onlyDigits(event.target.value).slice(0, 6))} error={touched ? codeError : undefined} />
          <PasswordInput id="password" label="Nova senha" autoComplete="new-password" placeholder="Mínimo de 6 caracteres" inputSize={size} value={password} onChange={(event) => setPassword(event.target.value)} error={touched ? passwordError : undefined} />
          <PasswordInput id="confirm" label="Confirmar nova senha" autoComplete="new-password" inputSize={size} value={confirm} onChange={(event) => setConfirm(event.target.value)} error={touched ? confirmError : undefined} />
          {error && <FormAlert>{error}</FormAlert>}
          <Button type="submit" size={size} fullWidth disabled={loading}>{loading ? <><LoaderCircle size={18} className="animate-spin" />Salvando...</> : <>Salvar nova senha <ArrowRight size={18} /></>}</Button>
          <button type="button" disabled={loading} onClick={() => requestCode()} className="w-full text-center text-sm font-semibold text-brand hover:text-brand-dark disabled:opacity-60">Não recebi, enviar outro código</button>
        </form>
      </>}
      <p className="mt-8 text-center text-sm text-muted">Lembrou a senha? <Link to={paths.login} className="font-semibold text-brand hover:text-brand-dark">Voltar para o login</Link></p>
    </div>
  )
}
