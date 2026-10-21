import { io } from 'socket.io-client'
import { API_URL } from './api'

// Eventos emitidos pelo backend (back/src/lib/socket.ts) para a sala do usuário.
export type RealtimeEvent =
  | 'novo_pedido_disponivel'
  | 'pedido_aceito'
  | 'codigo_validado'
  | 'entrega_em_andamento'
  | 'entrega_finalizada'
  | 'localizacao_motoboy_atualizada'

type Listener = (event: RealtimeEvent, payload: unknown) => void

const listeners = new Set<Listener>()

export function subscribe(listener: Listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

// Conecta ao Socket.io entrando na sala "user:<id>". Retorna a função de desconexão.
export function connectRealtime(userId: string) {
  const socket = io(API_URL, { auth: { userId } })
  socket.onAny((event: RealtimeEvent, payload: unknown) => listeners.forEach((listener) => listener(event, payload)))
  return () => {
    socket.disconnect()
  }
}
