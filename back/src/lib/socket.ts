import { Server as IOServer } from "socket.io"
import type { Server as HTTPServer } from "http"

// Servidor de mensageria em tempo real (Épico 1 / Épico 4).
// Cada usuário entra em uma "sala" própria (user:<id>) ao conectar,
// enviando o próprio id em socket.handshake.auth.userId. Isso permite
// emitir eventos direcionados (novo_pedido_disponivel, pedido_aceito,
// codigo_validado) sem precisar de um broadcast geral.
let io: IOServer | undefined

export function initSocket(httpServer: HTTPServer) {
  io = new IOServer(httpServer, {
    cors: { origin: "*" }
  })

  io.on("connection", (socket) => {
    const userId = socket.handshake.auth?.userId as string | undefined

    if (userId) {
      socket.join(`user:${userId}`)
    }

    socket.on("disconnect", () => {
      // conexão encerrada; nada a limpar manualmente pois as rooms
      // são gerenciadas automaticamente pelo socket.io
    })
  })

  return io
}

export function getIO(): IOServer {
  if (!io) {
    throw new Error("Socket.io ainda não foi inicializado. Chame initSocket() no server.ts.")
  }
  return io
}

export function emitToUser(userId: string, event: string, payload: unknown) {
  getIO().to(`user:${userId}`).emit(event, payload)
}
