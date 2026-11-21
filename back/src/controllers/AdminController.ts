import { Request, Response } from "express"
import { z } from "zod"
import { AdminService } from "../services/AdminService"

const adminService = new AdminService()

const idSchema = z.string().uuid()

export class AdminController {
  // Lista de entregadores com status atual e números de desempenho.
  async listCouriers(_req: Request, res: Response) {
    const couriers = await adminService.listCouriers()
    res.status(200).json(couriers)
  }

  // Detalhe de um entregador com o histórico de corridas.
  async getCourier(req: Request, res: Response) {
    const parsed = idSchema.safeParse(req.params.id)
    if (!parsed.success) {
      res.status(404).json({ error: "Entregador não encontrado" })
      return
    }

    try {
      const courier = await adminService.getCourier(parsed.data)
      res.status(200).json(courier)
    } catch (error) {
      res.status(404).json({ error: (error as Error).message })
    }
  }
}
