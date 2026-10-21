import { prisma } from "../lib/prisma"
import { DeliveryStatus, DeliveryOfferStatus, Prisma } from "../../generated/prisma/client"
import { courierPublicFields, restaurantPublicFields } from "./publicFields"

// O motoboy nunca recebe o código de retirada pela API: ele precisa
// digitá-lo no balcão do restaurante.
const orderForCourier = {
  omit: { pickupCode: true },
  include: { restaurant: { select: restaurantPublicFields } }
} as const

export class DeliveryRepository {
  createForOrder(orderId: string) {
    return prisma.delivery.create({ data: { orderId, status: "SEARCHING_COURIER" } })
  }

  findById(id: string) {
    return prisma.delivery.findUnique({
      where: { id },
      include: { order: true, courier: { select: courierPublicFields }, offers: true }
    })
  }

  findByOrderId(orderId: string) {
    return prisma.delivery.findUnique({
      where: { orderId },
      include: { order: true, courier: { select: courierPublicFields } }
    })
  }

  findActiveByCourier(courierId: string) {
    return prisma.delivery.findFirst({
      where: {
        courierId,
        status: { in: ["COURIER_ASSIGNED", "PICKED_UP", "IN_DELIVERY"] }
      },
      include: { order: orderForCourier }
    })
  }

  findHistoryByCourier(courierId: string) {
    return prisma.delivery.findMany({
      where: { courierId, status: "DELIVERED" },
      include: { order: orderForCourier },
      orderBy: { deliveredAt: "desc" }
    })
  }

  updateStatus(id: string, status: DeliveryStatus, extra: Prisma.DeliveryUpdateInput = {}) {
    return prisma.delivery.update({ where: { id }, data: { status, ...extra } })
  }

  assignCourier(id: string, courierId: string, distanceKm: number) {
    return prisma.delivery.update({
      where: { id },
      data: { courierId, distanceKm, status: "COURIER_ASSIGNED", acceptedAt: new Date() },
      include: { order: true, courier: { select: courierPublicFields } }
    })
  }

  createOffer(deliveryId: string, courierId: string, distanceKm: number, expiresAt: Date) {
    return prisma.deliveryOffer.create({
      data: { deliveryId, courierId, distanceKm, expiresAt, status: "PENDING" }
    })
  }

  // Oferta ainda dentro do prazo de 30s para o motoboy (tela "Nova solicitação").
  findPendingOfferForCourier(courierId: string) {
    return prisma.deliveryOffer.findFirst({
      where: { courierId, status: "PENDING", expiresAt: { gt: new Date() } },
      include: { delivery: { include: { order: orderForCourier } } },
      orderBy: { createdAt: "desc" }
    })
  }

  findOffer(id: string) {
    return prisma.deliveryOffer.findUnique({ where: { id } })
  }

  updateOfferStatus(id: string, status: DeliveryOfferStatus) {
    return prisma.deliveryOffer.update({ where: { id }, data: { status, respondedAt: new Date() } })
  }
}
