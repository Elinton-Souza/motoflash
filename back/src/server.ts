import "dotenv/config"
import http from "http"
import app from "./app"
import { initSocket } from "./lib/socket"

const port = Number(process.env.PORT) || 3000
const httpServer = http.createServer(app)

// Emissores de eventos WebSocket: novo_pedido_disponivel, pedido_aceito,
// codigo_validado (Épico 1 e 4).
initSocket(httpServer)

httpServer.listen(port, () => {
  console.log(`Servidor Motoflash rodando na porta: ${port}`)
})
