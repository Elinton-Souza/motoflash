import { Request, Response } from "express"
import { z } from "zod"
import { OrderService } from "../services/OrderService"
import type { OrderStatus } from "../../generated/prisma/client"

const orderService = new OrderService()

const createOrderSchema = z.object({
  customerName: z.string().min(2),
  customerAddress: z.string().min(3),
  customerLat: z.number(),
  customerLng: z.number(),
  value: z.number().positive(),
  deliveryFee: z.number().nonnegative().optional()
})

export class OrderController {
  // Restaurante cria um novo pedido (tela "Criar pedido").
  async create(req: Request, res: Response) {
    const parsed = createOrderSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: "Dados inválidos", issues: parsed.error.issues })
      return
    }

    const order = await orderService.createOrder({ ...parsed.data, restaurantId: req.user!.id })
    res.status(201).json(order)
  }

  // Fila de pedidos do restaurante, com filtro opcional por status.
  async list(req: Request, res: Response) {
    const status = req.query.status as OrderStatus | undefined
    const orders = await orderService.listByRestaurant(req.user!.id, status)
    res.status(200).json(orders)
  }

  async getById(req: Request, res: Response) {
    const order = await orderService.getById((req.params.id as string))
    if (!order) {
      res.status(404).json({ error: "Pedido não encontrado" })
      return
    }
    res.status(200).json(order)
  }

  async markReady(req: Request, res: Response) {
    const order = await orderService.markReady((req.params.id as string))
    res.status(200).json(order)
  }

  // Botão "Despachar" / "Solicitar motoboy" da fila do restaurante.
  async requestCourier(req: Request, res: Response) {
    try {
      const delivery = await orderService.requestCourier((req.params.id as string))
      res.status(200).json(delivery)
    } catch (error) {
      res.status(400).json({ error: (error as Error).message })
    }
  }
}
