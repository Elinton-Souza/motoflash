import type { Session } from '../types/api'

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

// A sessão fica no sessionStorage (por aba), assim é possível ficar logado
// como restaurante em uma aba e como motoboy em outra ao mesmo tempo.
const SESSION_KEY = 'motoflash.session'

export function loadSession(): Session | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as Session) : null
  } catch {
    return null
  }
}

export function saveSession(session: Session | null) {
  try {
    if (session) sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
    else sessionStorage.removeItem(SESSION_KEY)
  } catch {
    // armazenamento indisponível: a sessão dura só enquanto a página estiver aberta
  }
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

let onUnauthorized: (() => void) | undefined
export function setUnauthorizedHandler(handler: (() => void) | undefined) {
  onUnauthorized = handler
}

type RequestOptions = { method?: 'GET' | 'POST' | 'PUT' | 'DELETE'; body?: unknown }

export async function api<T>(path: string, { method = 'GET', body }: RequestOptions = {}): Promise<T> {
  const token = loadSession()?.token
  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError('Não foi possível conectar ao servidor. Verifique se o backend está rodando.', 0)
  }

  const text = await response.text()
  const data = text ? JSON.parse(text) : null

  if (!response.ok) {
    if (response.status === 401 && token) onUnauthorized?.()
    throw new ApiError(data?.error ?? 'Não foi possível concluir a operação.', response.status)
  }
  return data as T
}

export function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Erro inesperado.'
}
