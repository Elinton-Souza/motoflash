import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { UserRepository } from "../repositories/UserRepository"
import { PasswordResetRepository } from "../repositories/PasswordResetRepository"
import { GeocodingService } from "./GeocodingService"
import { NotificationService } from "./NotificationService"
import { maskPhone, normalizePhone } from "./WhatsAppService"
import { generateCode } from "../utils/generateCode"
import { Role } from "../../generated/prisma/client"

const userRepository = new UserRepository()
const passwordResetRepository = new PasswordResetRepository()
const geocoding = new GeocodingService()
const notifications = new NotificationService()

const RESET_CODE_TTL_MS = 15 * 60 * 1000
const RESET_MAX_ATTEMPTS = 5
const RESET_MAX_PER_HOUR = 5

type RegisterInput = {
  name: string
  email: string
  password: string
  phone: string
  role: Exclude<Role, "ADMIN">
  restaurantName?: string
  restaurantAddress?: string
  vehiclePlate?: string
}

const roleLabel: Record<Role, string> = {
  RESTAURANT: "restaurante",
  MOTOBOY: "motoboy",
  ADMIN: "administrador"
}

export class AuthService {
  async register(input: RegisterInput) {
    const email = input.email.trim().toLowerCase()
    const existing = await userRepository.findByEmail(email)
    if (existing) {
      throw new Error("Já existe um usuário cadastrado com este e-mail")
    }

    const hashedPassword = bcrypt.hashSync(input.password, 10)

    // Posição do restaurante no mapa: a busca de motoboys parte daqui.
    const point =
      input.role === "RESTAURANT" && input.restaurantAddress
        ? await geocoding.geocode(input.restaurantAddress)
        : null

    const user = await userRepository.create({
      ...input,
      email,
      phone: normalizePhone(input.phone) ?? input.phone,
      vehiclePlate: input.vehiclePlate?.toUpperCase(),
      restaurantLat: point?.lat ?? null,
      restaurantLng: point?.lng ?? null,
      password: hashedPassword
    })

    return this.buildAuthResponse(user)
  }

  // `role` vem da tela de login usada (motoboy ou restaurante). Assim cada
  // perfil entra apenas pelo próprio acesso.
  async login(email: string, password: string, role?: Role) {
    const defaultMessage = "E-mail ou senha inválidos"
    const user = await userRepository.findByEmail(email.trim().toLowerCase())

    if (!user || !bcrypt.compareSync(password, user.password)) {
      throw new Error(defaultMessage)
    }

    if (role && user.role !== role) {
      throw new Error(`Esta conta é de ${roleLabel[user.role]}. Use o acesso de ${roleLabel[user.role]} para entrar.`)
    }

    return this.buildAuthResponse(user)
  }

  // Envia um código de 6 dígitos para o WhatsApp cadastrado. A resposta é
  // sempre a mesma, exista ou não a conta, para não revelar e-mails.
  async requestPasswordReset(email: string) {
    const genericResponse = {
      message: "Se o e-mail estiver cadastrado, enviamos um código para o WhatsApp da conta."
    }

    const user = await userRepository.findByEmail(email.trim().toLowerCase())
    if (!user || !user.phone) return genericResponse

    const lastHour = new Date(Date.now() - 60 * 60 * 1000)
    if ((await passwordResetRepository.countSince(user.id, lastHour)) >= RESET_MAX_PER_HOUR) {
      throw new Error("Muitas tentativas. Aguarde alguns minutos e tente novamente.")
    }

    const code = generateCode(6)
    await passwordResetRepository.markAllUsed(user.id)
    await passwordResetRepository.create(user.id, bcrypt.hashSync(code, 10), new Date(Date.now() + RESET_CODE_TTL_MS))

    const result = await notifications.sendPasswordReset(user.phone, code)

    // Sem provedor de WhatsApp configurado (ambiente de desenvolvimento),
    // o código aparece na resposta para ser possível testar o fluxo.
    const devMode = !notifications.automaticEnabled && process.env.NODE_ENV !== "production"

    return {
      ...genericResponse,
      sentTo: maskPhone(user.phone),
      ...(devMode ? { devCode: code } : {}),
      ...(result.sent ? {} : { whatsappSent: false })
    }
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    const invalid = "Código inválido ou expirado"
    const user = await userRepository.findByEmail(email.trim().toLowerCase())
    if (!user) throw new Error(invalid)

    const reset = await passwordResetRepository.findLatestValid(user.id)
    if (!reset || reset.attempts >= RESET_MAX_ATTEMPTS) throw new Error(invalid)

    if (!bcrypt.compareSync(code, reset.codeHash)) {
      await passwordResetRepository.registerAttempt(reset.id)
      throw new Error(invalid)
    }

    await userRepository.updatePassword(user.id, bcrypt.hashSync(newPassword, 10))
    await passwordResetRepository.markAllUsed(user.id)

    return { message: "Senha alterada com sucesso. Entre com a nova senha." }
  }

  private buildAuthResponse(user: { id: string; name: string; email: string; role: Role }) {
    const token = jwt.sign(
      { id: user.id, name: user.name, role: user.role },
      process.env.JWT_KEY as string,
      { expiresIn: "12h" }
    )

    return {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    }
  }
}
