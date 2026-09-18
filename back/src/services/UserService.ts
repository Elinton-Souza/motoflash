import { UserRepository } from "../repositories/UserRepository"
import { DeliveryRepository } from "../repositories/DeliveryRepository"
import { emitToUser } from "../lib/socket"
import { CourierStatus } from "../../generated/prisma/client"

const userRepository = new UserRepository()
const deliveryRepository = new DeliveryRepository()

type UpdateProfileInput = Partial<{
  name: string
  phone: string
  restaurantName: string
  restaurantAddress: string
  vehiclePlate: string
}>

export class UserService {
  async getProfile(userId: string) {
    const user = await userRepository.findById(userId)
    if (!user) throw new Error("Usuário não encontrado")

    const { password, ...safeUser } = user
    return safeUser
  }

  updateProfile(userId: string, data: UpdateProfileInput) {
    return userRepository.updateProfile(userId, data)
  }

  setCourierStatus(userId: string, status: CourierStatus) {
    return userRepository.updateCourierStatus(userId, status)
  }

  // Atualização periódica da posição do motoboy. Além de guardar a
  // localização (usada na busca por proximidade via PostGIS), quando o
  // motoboy está em uma corrida ativa, repassa a posição em tempo real
  // para o restaurante acompanhar no mapa (Épico 3: "painel de
  // rastreamento... e a posição do motoboy no mapa").
  async updateCourierLocation(userId: string, lat: number, lng: number) {
    const updated = await userRepository.updateCourierLocation(userId, lat, lng)

    const activeDelivery = await deliveryRepository.findActiveByCourier(userId)
    if (activeDelivery) {
      emitToUser(activeDelivery.order.restaurantId, "localizacao_motoboy_atualizada", {
        deliveryId: activeDelivery.id,
        orderId: activeDelivery.orderId,
        lat,
        lng
      })
    }

    return updated
  }
}
