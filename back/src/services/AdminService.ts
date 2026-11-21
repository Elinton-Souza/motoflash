import { UserRepository } from "../repositories/UserRepository"
import { DeliveryRepository } from "../repositories/DeliveryRepository"

const userRepository = new UserRepository()
const deliveryRepository = new DeliveryRepository()

type CourierStats = {
  deliveredCount: number
  totalEarnings: number
  averageEarning: number
  lastDeliveryAt: Date | null
  offersReceived: number
  offersAccepted: number
  offersRejected: number
  offersExpired: number
  // Porcentagem (0 a 100) das ofertas respondidas que o motoboy aceitou.
  // Fica nulo enquanto ele não tiver respondido nenhuma oferta.
  acceptanceRate: number | null
}

type ActiveDelivery = { id: string; status: string; orderNumber: number } | null

const emptyStats = (): CourierStats => ({
  deliveredCount: 0,
  totalEarnings: 0,
  averageEarning: 0,
  lastDeliveryAt: null,
  offersReceived: 0,
  offersAccepted: 0,
  offersRejected: 0,
  offersExpired: 0,
  acceptanceRate: null
})

// Gestão mínima de entregadores, feita pelo administrador da plataforma:
// lista de motoboys com status e números, e o histórico de cada um.
export class AdminService {
  async listCouriers() {
    const couriers = await userRepository.findCouriers()
    const ids = couriers.map((courier) => courier.id)
    const [stats, active] = await Promise.all([this.statsFor(ids), this.activeFor(ids)])

    return couriers.map((courier) => ({
      ...courier,
      stats: stats.get(courier.id) ?? emptyStats(),
      activeDelivery: active.get(courier.id) ?? null
    }))
  }

  async getCourier(id: string) {
    const courier = await userRepository.findCourierById(id)
    if (!courier) throw new Error("Entregador não encontrado")

    const [stats, active, deliveries] = await Promise.all([
      this.statsFor([id]),
      this.activeFor([id]),
      deliveryRepository.findRecentByCourier(id)
    ])

    return {
      ...courier,
      stats: stats.get(id) ?? emptyStats(),
      activeDelivery: active.get(id) ?? null,
      deliveries: deliveries.map((delivery) => ({
        id: delivery.id,
        status: delivery.status,
        orderNumber: delivery.order.number,
        restaurantName: delivery.order.restaurant.restaurantName ?? delivery.order.restaurant.name,
        customerAddress: delivery.order.customerAddress,
        distanceKm: delivery.distanceKm,
        earning: delivery.status === "DELIVERED" ? Number(delivery.earning ?? 0) : 0,
        acceptedAt: delivery.acceptedAt,
        pickedUpAt: delivery.pickedUpAt,
        deliveredAt: delivery.deliveredAt,
        createdAt: delivery.createdAt
      }))
    }
  }

  private async statsFor(courierIds: string[]) {
    const result = new Map<string, CourierStats>()
    if (courierIds.length === 0) return result

    const [delivered, offers] = await Promise.all([
      deliveryRepository.deliveredStatsByCourier(courierIds),
      deliveryRepository.offerStatsByCourier(courierIds)
    ])

    const get = (id: string) => {
      if (!result.has(id)) result.set(id, emptyStats())
      return result.get(id)!
    }

    for (const row of delivered) {
      if (!row.courierId) continue
      const stats = get(row.courierId)
      stats.deliveredCount = row._count._all
      stats.totalEarnings = Number(row._sum.earning ?? 0)
      stats.averageEarning = stats.deliveredCount > 0 ? stats.totalEarnings / stats.deliveredCount : 0
      stats.lastDeliveryAt = row._max.deliveredAt
    }

    for (const row of offers) {
      const stats = get(row.courierId)
      const count = row._count._all
      stats.offersReceived += count
      if (row.status === "ACCEPTED") stats.offersAccepted += count
      if (row.status === "REJECTED") stats.offersRejected += count
      if (row.status === "EXPIRED") stats.offersExpired += count
    }

    for (const stats of result.values()) {
      const answered = stats.offersAccepted + stats.offersRejected + stats.offersExpired
      stats.acceptanceRate = answered > 0 ? Math.round((stats.offersAccepted / answered) * 100) : null
    }

    return result
  }

  private async activeFor(courierIds: string[]) {
    const result = new Map<string, ActiveDelivery>()
    if (courierIds.length === 0) return result

    const active = await deliveryRepository.findActiveByCouriers(courierIds)
    for (const delivery of active) {
      if (!delivery.courierId) continue
      result.set(delivery.courierId, { id: delivery.id, status: delivery.status, orderNumber: delivery.order.number })
    }
    return result
  }
}
