import { Request, Response } from "express"
import { z } from "zod"
import { AuthService } from "../services/AuthService"
import { isValidPhone } from "../services/WhatsAppService"

const authService = new AuthService()

const phoneSchema = z
  .string({ message: "Informe o WhatsApp" })
  .refine(isValidPhone, "Informe um WhatsApp válido com DDD")

const passwordSchema = z.string().min(6, "A senha precisa ter pelo menos 6 caracteres")

// O cadastro público só cria restaurantes e motoboys; cada perfil tem os
// seus campos obrigatórios.
const registerSchema = z.discriminatedUnion("role", [
  z.object({
    role: z.literal("RESTAURANT"),
    name: z.string().trim().min(2, "Informe o nome do responsável"),
    email: z.string().trim().email("E-mail inválido"),
    password: passwordSchema,
    phone: phoneSchema,
    restaurantName: z.string().trim().min(2, "Informe o nome do restaurante"),
    restaurantAddress: z.string().trim().min(5, "Informe o endereço de coleta")
  }),
  z.object({
    role: z.literal("MOTOBOY"),
    name: z.string().trim().min(2, "Informe seu nome completo"),
    email: z.string().trim().email("E-mail inválido"),
    password: passwordSchema,
    phone: phoneSchema,
    vehiclePlate: z
      .string()
      .trim()
      .regex(/^[A-Za-z]{3}-?\d[A-Za-z0-9]\d{2}$/, "Placa inválida (ex.: ABC1D23)")
  })
])

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  role: z.enum(["RESTAURANT", "MOTOBOY"]).optional()
})

const forgotSchema = z.object({ email: z.string().trim().email("E-mail inválido") })

const resetSchema = z.object({
  email: z.string().trim().email("E-mail inválido"),
  code: z.string().regex(/^\d{6}$/, "O código tem 6 dígitos"),
  password: passwordSchema
})

function firstIssue(error: z.ZodError) {
  return error.issues[0]?.message ?? "Dados inválidos"
}

export class AuthController {
  async register(req: Request, res: Response) {
    const parsed = registerSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: firstIssue(parsed.error), issues: parsed.error.issues })
      return
    }

    try {
      const data = parsed.data
      const result = await authService.register({
        ...data,
        vehiclePlate: data.role === "MOTOBOY" ? data.vehiclePlate.replace("-", "") : undefined
      })
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
      const result = await authService.login(parsed.data.email, parsed.data.password, parsed.data.role)
      res.status(200).json(result)
    } catch (error) {
      res.status(401).json({ error: (error as Error).message })
    }
  }

  async forgotPassword(req: Request, res: Response) {
    const parsed = forgotSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: firstIssue(parsed.error) })
      return
    }

    try {
      const result = await authService.requestPasswordReset(parsed.data.email)
      res.status(200).json(result)
    } catch (error) {
      res.status(429).json({ error: (error as Error).message })
    }
  }

  async resetPassword(req: Request, res: Response) {
    const parsed = resetSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: firstIssue(parsed.error) })
      return
    }

    try {
      const { email, code, password } = parsed.data
      const result = await authService.resetPassword(email, code, password)
      res.status(200).json(result)
    } catch (error) {
      res.status(400).json({ error: (error as Error).message })
    }
  }
}
