import { Request, Response } from "express"
import { z } from "zod"
import { UserService } from "../services/UserService"

const userService = new UserService()

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  restaurantName: z.string().optional(),
  restaurantAddress: z.string().optional(),
  vehiclePlate: z.string().optional()
})

const locationSchema = z.object({
  lat: z.number(),
  lng: z.number()
})

const statusSchema = z.object({
  status: z.enum(["OFFLINE", "ONLINE", "ON_DELIVERY"])
})

export class UserController {
  async me(req: Request, res: Response) {
    try {
      const profile = await userService.getProfile(req.user!.id)
      res.status(200).json(profile)
    } catch (error) {
      res.status(404).json({ error: (error as Error).message })
    }
  }

  async updateProfile(req: Request, res: Response) {
    const parsed = updateProfileSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: "Dados inválidos" })
      return
    }

    const updated = await userService.updateProfile(req.user!.id, parsed.data)
    res.status(200).json(updated)
  }

  // Motoboy alterna Online/Offline para começar ou parar de receber corridas.
  async updateCourierStatus(req: Request, res: Response) {
    const parsed = statusSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: "Status inválido" })
      return
    }

    const updated = await userService.setCourierStatus(req.user!.id, parsed.data.status)
    res.status(200).json(updated)
  }

  // Atualização periódica da posição do motoboy (usada na busca por proximidade).
  async updateCourierLocation(req: Request, res: Response) {
    const parsed = locationSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: "Localização inválida" })
      return
    }

    const updated = await userService.updateCourierLocation(req.user!.id, parsed.data.lat, parsed.data.lng)
    res.status(200).json(updated)
  }
}
