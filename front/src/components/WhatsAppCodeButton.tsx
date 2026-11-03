import { useState } from 'react'
import { Check, MessageCircle } from 'lucide-react'
import { api, errorMessage } from '../lib/api'
import type { WhatsAppResult } from '../types/api'

// Reenvia ao cliente o código de confirmação. Sem envio automático
// configurado no servidor, mostra o link para enviar pelo WhatsApp Web/app.
export function WhatsAppCodeButton({ orderId, initial }: { orderId: string; initial?: WhatsAppResult | null }) {
  const [result, setResult] = useState<WhatsAppResult | null>(initial ?? null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function resend() {
    setBusy(true)
    setError('')
    try {
      setResult(await api<WhatsAppResult>(`/orders/${orderId}/notify-customer`, { method: 'POST' }))
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-2">
      {result?.sent && <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-700"><Check size={14} />Código enviado ao cliente pelo WhatsApp.</p>}
      {result && !result.sent && result.link && (
        <a href={result.link} target="_blank" rel="noreferrer" className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#25d366] text-sm font-semibold text-white hover:bg-[#1ebe5b]"><MessageCircle size={17} />Enviar código pelo WhatsApp</a>
      )}
      {(!result || result.sent) && (
        <button type="button" disabled={busy} onClick={resend} className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"><MessageCircle size={16} />{busy ? 'Enviando...' : result?.sent ? 'Reenviar código' : 'Enviar código ao cliente'}</button>
      )}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
