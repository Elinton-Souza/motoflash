import { Request, Response } from "express"
import { z } from "zod"
import { DeliveryService } from "../services/DeliveryService"

const deliveryService = new DeliveryService()

const codeSchema = z.object({
  code: z.string().length(4)
})

export class DeliveryController {
  // Motoboy aceita a corrida oferecida (tela "Nova corrida", botão grande "Aceitar").
  async acceptOffer(req: Request, res: Response) {
    try {
      const delivery = await deliveryService.acceptOffer((req.params.offerId as string), req.user!.id)
      res.status(200).json(delivery)
    } catch (error) {
      res.status(400).json({ error: (error as Error).message })
    }
  }

  // Motoboy recusa a corrida (ou o timeout de 30s aciona o mesmo fluxo internamente).
  async rejectOffer(req: Request, res: Response) {
    try {
      const offer = await deliveryService.rejectOffer((req.params.offerId as string), req.user!.id)
      res.status(200).json(offer)
    } catch (error) {
      res.status(400).json({ error: (error as Error).message })
    }
  }

  // Tela de bloqueio: exige o código de 4 a 6 dígitos antes de liberar a rota até o cliente.
  async validatePickupCode(req: Request, res: Response) {
    const parsed = codeSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: "Informe um código válido" })
      return
    }

    try {
      const delivery = await deliveryService.validatePickupCode((req.params.id as string), req.user!.id, parsed.data.code)
      res.status(200).json(delivery)
    } catch (error) {
      res.status(400).json({ error: (error as Error).message })
    }
  }

  async startRoute(req: Request, res: Response) {
    try {
      const delivery = await deliveryService.startRouteToCustomer((req.params.id as string), req.user!.id)
      res.status(200).json(delivery)
    } catch (error) {
      res.status(400).json({ error: (error as Error).message })
    }
  }

  // Botão único "Finalizar entrega".
  async complete(req: Request, res: Response) {
    try {
      const delivery = await deliveryService.completeDelivery((req.params.id as string), req.user!.id)
      res.status(200).json(delivery)
    } catch (error) {
      res.status(400).json({ error: (error as Error).message })
    }
  }

  async getActive(req: Request, res: Response) {
    const delivery = await deliveryService.getActiveForCourier(req.user!.id)
    res.status(200).json(delivery)
  }
}
