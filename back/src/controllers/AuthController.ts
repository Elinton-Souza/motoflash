import { Request, Response } from "express"
import { z } from "zod"
import { AuthService } from "../services/AuthService"

const authService = new AuthService()

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  role: z.enum(["RESTAURANT", "MOTOBOY", "ADMIN"]),
  restaurantName: z.string().optional(),
  restaurantAddress: z.string().optional(),
  vehiclePlate: z.string().optional()
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
})

export class AuthController {
  async register(req: Request, res: Response) {
    const parsed = registerSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: "Dados inválidos", issues: parsed.error.issues })
      return
    }

    try {
      const result = await authService.register(parsed.data)
      res.status(201).json(result)
    } catch (error) {
      res.status(400).json({ error: (error as Error).message })
    }
  }

  async login(req: Request, res: Response) {
    const parsed = loginSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: "Informe e-mail e senha" })
      return
    }

    try {
      const result = await authService.login(parsed.data.email, parsed.data.password)
      res.status(200).json(result)
    } catch (error) {
      res.status(401).json({ error: (error as Error).message })
    }
  }
}
