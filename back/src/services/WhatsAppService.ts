// Envio de mensagens pelo WhatsApp.
//
// Provedores suportados (variável WHATSAPP_PROVIDER no .env):
//  - "twilio": WhatsApp da Twilio (funciona com o sandbox gratuito)
//  - "meta":   WhatsApp Cloud API oficial da Meta
//  - vazio:    nenhum envio automático. A mensagem é registrada no console
//              e a API devolve um link wa.me para enviar com um clique.
//
// Em todos os casos o retorno traz o link wa.me, para a tela oferecer o
// envio manual se o automático não estiver configurado ou falhar.

export type WhatsAppResult = {
  sent: boolean
  provider: string
  link: string | null
  error?: string
}

// Normaliza para o formato internacional só com dígitos (ex.: 5551999998888).
// Aceita números com ou sem DDI, com máscara ou não.
export function normalizePhone(phone: string | null | undefined): string | null {
  if (!phone) return null
  const digits = phone.replace(/\D/g, "")
  if (digits.length === 10 || digits.length === 11) return `55${digits}`
  if ((digits.length === 12 || digits.length === 13) && digits.startsWith("55")) return digits
  return null
}

export function isValidPhone(phone: string | null | undefined) {
  return normalizePhone(phone) !== null
}

// Exibe só o final do número (ex.: "(51) *****-8888").
export function maskPhone(phone: string | null | undefined) {
  const digits = normalizePhone(phone)
  if (!digits) return null
  const local = digits.slice(2)
  return `(${local.slice(0, 2)}) *****-${local.slice(-4)}`
}

export function whatsappLink(phone: string | null | undefined, message: string) {
  const to = normalizePhone(phone)
  return to ? `https://wa.me/${to}?text=${encodeURIComponent(message)}` : null
}

export class WhatsAppService {
  get provider() {
    return (process.env.WHATSAPP_PROVIDER ?? "").trim().toLowerCase()
  }

  // true quando existe um provedor configurado para envio automático.
  get isConfigured() {
    if (this.provider === "twilio") {
      return !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_WHATSAPP_FROM)
    }
    if (this.provider === "meta") {
      return !!(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID)
    }
    return false
  }

  async send(phone: string | null | undefined, message: string): Promise<WhatsAppResult> {
    const to = normalizePhone(phone)
    const link = whatsappLink(phone, message)

    if (!to) {
      return { sent: false, provider: this.provider || "link", link: null, error: "Telefone inválido ou não informado" }
    }

    if (!this.isConfigured) {
      console.log(`[whatsapp] envio automático desativado. Para +${to}: ${message}`)
      return { sent: false, provider: "link", link }
    }

    try {
      if (this.provider === "twilio") await this.sendWithTwilio(to, message)
      else await this.sendWithMeta(to, message)
      return { sent: true, provider: this.provider, link }
    } catch (error) {
      const reason = (error as Error).message
      console.error(`[whatsapp] falha ao enviar para +${to}: ${reason}`)
      return { sent: false, provider: this.provider, link, error: reason }
    }
  }

  private async sendWithTwilio(to: string, message: string) {
    const sid = process.env.TWILIO_ACCOUNT_SID as string
    const token = process.env.TWILIO_AUTH_TOKEN as string
    const from = (process.env.TWILIO_WHATSAPP_FROM as string).replace(/^whatsapp:/, "")

    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({ From: `whatsapp:${from}`, To: `whatsapp:+${to}`, Body: message }),
      signal: AbortSignal.timeout(10_000)
    })

    if (!response.ok) {
      const data = await response.json().catch(() => null)
      throw new Error(data?.message ?? `Twilio respondeu ${response.status}`)
    }
  }

  private async sendWithMeta(to: string, message: string) {
    const version = process.env.WHATSAPP_API_VERSION ?? "v21.0"
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID as string

    const response = await fetch(`https://graph.facebook.com/${version}/${phoneId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ messaging_product: "whatsapp", to, type: "text", text: { body: message } }),
      signal: AbortSignal.timeout(10_000)
    })

    if (!response.ok) {
      const data = await response.json().catch(() => null)
      throw new Error(data?.error?.message ?? `Meta respondeu ${response.status}`)
    }
  }
}
