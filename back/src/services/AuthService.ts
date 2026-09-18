import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { UserRepository } from "../repositories/UserRepository"
import { Role } from "../../generated/prisma/client"

const userRepository = new UserRepository()

type RegisterInput = {
  name: string
  email: string
  password: string
  phone?: string
  role: Role
  restaurantName?: string
  restaurantAddress?: string
  vehiclePlate?: string
}

export class AuthService {
  async register(input: RegisterInput) {
    const existing = await userRepository.findByEmail(input.email)
    if (existing) {
      throw new Error("Já existe um usuário cadastrado com este e-mail")
    }

    const hashedPassword = bcrypt.hashSync(input.password, 10)

    const user = await userRepository.create({
      ...input,
      password: hashedPassword
    })

    return this.buildAuthResponse(user)
  }

  async login(email: string, password: string) {
    const defaultMessage = "E-mail ou senha inválidos"
    const user = await userRepository.findByEmail(email)

    if (!user || !bcrypt.compareSync(password, user.password)) {
      throw new Error(defaultMessage)
    }

    return this.buildAuthResponse(user)
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
