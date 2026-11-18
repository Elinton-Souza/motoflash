import { Request, Response } from "express"
import { z } from "zod"
import { OrderService } from "../services/OrderService"
import { isValidPhone } from "../services/WhatsAppService"
import type { OrderStatus } from "../../generated/prisma/client"

const orderService = new OrderService()

const createOrderSchema = z.object({
  customerName: z.string().trim().min(2, "Informe o nome do cliente"),
  customerPhone: z.string({ message: "Informe o WhatsApp do cliente" }).refine(isValidPhone, "Informe o WhatsApp do cliente com DDD"),
  customerAddress: z.string().trim().min(5, "Informe o endereço de entrega").max(160),
  customerLat: z.number().min(-90).max(90).optional(),
  customerLng: z.number().min(-180).max(180).optional(),
  value: z.number().positive("Informe o valor do pedido"),
  deliveryFee: z.number().nonnegative().optional()
})

export class OrderController {
  // Restaurante cria um novo pedido (tela "Criar pedido").
  async create(req: Request, res: Response) {
    const parsed = createOrderSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos", issues: parsed.error.issues })
      return
    }

    try {
      const order = await orderService.createOrder({ ...parsed.data, restaurantId: req.user!.id })
      res.status(201).json(order)
    } catch (error) {
      res.status(400).json({ error: (error as Error).message })
    }
  }

  // Fila de pedidos do restaurante, com filtro opcional por status.
  async list(req: Request, res: Response) {
    const status = req.query.status as OrderStatus | undefined
    const orders = await orderService.listByRestaurant(req.user!.id, status)
    res.status(200).json(orders)
  }

  async getById(req: Request, res: Response) {
    const order = await orderService.getOwnedById((req.params.id as string), req.user!.id)
    if (!order) {
      res.status(404).json({ error: "Pedido não encontrado" })
      return
    }
    res.status(200).json(order)
  }

  async markReady(req: Request, res: Response) {
    if (!(await orderService.getOwnedById((req.params.id as string), req.user!.id))) {
      res.status(404).json({ error: "Pedido não encontrado" })
      return
    }

    const order = await orderService.markReady((req.params.id as string))
    res.status(200).json(order)
  }

  async cancel(req: Request, res: Response) {
    if (!(await orderService.getOwnedById((req.params.id as string), req.user!.id))) {
      res.status(404).json({ error: "Pedido não encontrado" })
      return
    }

    try {
      const order = await orderService.cancel(req.params.id as string)
      res.status(200).json(order)
    } catch (error) {
      res.status(400).json({ error: (error as Error).message })
    }
  }

  // Reenvia o código de confirmação ao cliente pelo WhatsApp.
  async notifyCustomer(req: Request, res: Response) {
    if (!(await orderService.getOwnedById((req.params.id as string), req.user!.id))) {
      res.status(404).json({ error: "Pedido não encontrado" })
      return
    }

    try {
      const result = await orderService.resendCustomerCode(req.params.id as string)
      res.status(200).json(result)
    } catch (error) {
      res.status(400).json({ error: (error as Error).message })
    }
  }

  // Botão "Despachar" / "Solicitar motoboy" da fila do restaurante.
  async requestCourier(req: Request, res: Response) {
    if (!(await orderService.getOwnedById((req.params.id as string), req.user!.id))) {
      res.status(404).json({ error: "Pedido não encontrado" })
      return
    }

    try {
      const delivery = await orderService.requestCourier((req.params.id as string))
      res.status(200).json(delivery)
    } catch (error) {
      res.status(400).json({ error: (error as Error).message })
    }
  }
}
