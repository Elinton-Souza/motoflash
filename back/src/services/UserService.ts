import { UserRepository } from "../repositories/UserRepository"
import { DeliveryRepository } from "../repositories/DeliveryRepository"
import { emitToUser } from "../lib/socket"
import { GeocodingService } from "./GeocodingService"
import { normalizePhone } from "./WhatsAppService"
import { CourierStatus } from "../../generated/prisma/client"

const userRepository = new UserRepository()
const deliveryRepository = new DeliveryRepository()
const geocoding = new GeocodingService()

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

  async updateProfile(userId: string, data: UpdateProfileInput) {
    const current = await userRepository.findById(userId)
    if (!current) throw new Error("Usuário não encontrado")

    const changes: Parameters<UserRepository["updateProfile"]>[1] = {
      ...data,
      ...(data.phone !== undefined ? { phone: normalizePhone(data.phone) ?? data.phone } : {}),
      ...(data.vehiclePlate !== undefined ? { vehiclePlate: data.vehiclePlate.toUpperCase() } : {})
    }

    // Endereço do restaurante alterado: atualiza o ponto de coleta no mapa.
    if (current.role === "RESTAURANT" && data.restaurantAddress && data.restaurantAddress !== current.restaurantAddress) {
      const point = await geocoding.geocode(data.restaurantAddress)
      changes.restaurantLat = point?.lat ?? null
      changes.restaurantLng = point?.lng ?? null
    }

    const { password, ...safeUser } = await userRepository.updateProfile(userId, changes)
    return safeUser
  }

  async setCourierStatus(userId: string, status: CourierStatus) {
    const { password, ...safeUser } = await userRepository.updateCourierStatus(userId, status)
    return safeUser
  }

  listConnectedCouriers() {
    return userRepository.findConnectedCouriers()
  }

  // Atualização periódica da posição do motoboy. Além de guardar a
  // localização (usada na busca por proximidade via PostGIS), quando o
  // motoboy está em uma corrida ativa, repassa a posição em tempo real
  // para o restaurante acompanhar no mapa (Épico 3: "painel de
  // rastreamento... e a posição do motoboy no mapa").
  async updateCourierLocation(userId: string, lat: number, lng: number) {
    const { password, ...updated } = await userRepository.updateCourierLocation(userId, lat, lng)

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
