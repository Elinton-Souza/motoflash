import { prisma } from "../lib/prisma"
import { DeliveryStatus, DeliveryOfferStatus, Prisma } from "../../generated/prisma/client"

export class DeliveryRepository {
  createForOrder(orderId: string) {
    return prisma.delivery.create({ data: { orderId, status: "SEARCHING_COURIER" } })
  }

  findById(id: string) {
    return prisma.delivery.findUnique({
      where: { id },
      include: { order: true, courier: true, offers: true }
    })
  }

  findByOrderId(orderId: string) {
    return prisma.delivery.findUnique({
      where: { orderId },
      include: { order: true, courier: true }
    })
  }

  findActiveByCourier(courierId: string) {
    return prisma.delivery.findFirst({
      where: {
        courierId,
        status: { in: ["COURIER_ASSIGNED", "PICKED_UP", "IN_DELIVERY"] }
      },
      include: { order: true }
    })
  }

  findHistoryByCourier(courierId: string) {
    return prisma.delivery.findMany({
      where: { courierId, status: "DELIVERED" },
      include: { order: true },
      orderBy: { deliveredAt: "desc" }
    })
  }

  updateStatus(id: string, status: DeliveryStatus, extra: Prisma.DeliveryUpdateInput = {}) {
    return prisma.delivery.update({ where: { id }, data: { status, ...extra } })
  }

  assignCourier(id: string, courierId: string) {
    return prisma.delivery.update({
      where: { id },
      data: { courierId, status: "COURIER_ASSIGNED", acceptedAt: new Date() },
      include: { order: true, courier: true }
    })
  }

  createOffer(deliveryId: string, courierId: string, distanceKm: number, expiresAt: Date) {
    return prisma.deliveryOffer.create({
      data: { deliveryId, courierId, distanceKm, expiresAt, status: "PENDING" }
    })
  }

  findOffer(id: string) {
    return prisma.deliveryOffer.findUnique({ where: { id } })
  }

  updateOfferStatus(id: string, status: DeliveryOfferStatus) {
    return prisma.deliveryOffer.update({ where: { id }, data: { status, respondedAt: new Date() } })
  }
}
