import { prisma } from "../lib/prisma"
import { DeliveryStatus, DeliveryOfferStatus, Prisma } from "../../generated/prisma/client"
import { courierPublicFields, restaurantPublicFields } from "./publicFields"

// O motoboy nunca recebe os códigos pela API: o de retirada ele recebe
// no balcão do restaurante e o de entrega, do cliente na porta.
const orderForCourier = {
  omit: { pickupCode: true, deliveryCode: true },
  include: { restaurant: { select: restaurantPublicFields } }
} as const

export class DeliveryRepository {
  createForOrder(orderId: string) {
    return prisma.delivery.create({ data: { orderId, status: "SEARCHING_COURIER" } })
  }

  findById(id: string) {
    return prisma.delivery.findUnique({
      where: { id },
      include: {
        order: { include: { restaurant: { select: restaurantPublicFields } } },
        courier: { select: courierPublicFields },
        offers: true
      }
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

  // --- Gestão de entregadores (admin) -----------------------------------

  // Entregas concluídas por motoboy: quantidade, soma dos ganhos e data da última.
  deliveredStatsByCourier(courierIds: string[]) {
    return prisma.delivery.groupBy({
      by: ["courierId"],
      where: { courierId: { in: courierIds }, status: "DELIVERED" },
      _count: { _all: true },
      _sum: { earning: true },
      _max: { deliveredAt: true }
    })
  }

  // Ofertas de corrida recebidas por motoboy, separadas por resposta
  // (aceita, recusada, expirada), para calcular a taxa de aceite.
  offerStatsByCourier(courierIds: string[]) {
    return prisma.deliveryOffer.groupBy({
      by: ["courierId", "status"],
      where: { courierId: { in: courierIds } },
      _count: { _all: true }
    })
  }

  findActiveByCouriers(courierIds: string[]) {
    return prisma.delivery.findMany({
      where: {
        courierId: { in: courierIds },
        status: { in: ["COURIER_ASSIGNED", "PICKED_UP", "IN_DELIVERY"] }
      },
      select: { id: true, courierId: true, status: true, order: { select: { number: true } } }
    })
  }

  // Histórico do motoboy para o admin: todas as corridas que ele assumiu
  // (concluídas, em andamento ou canceladas), das mais recentes para as antigas.
  findRecentByCourier(courierId: string, take = 50) {
    return prisma.delivery.findMany({
      where: { courierId },
      orderBy: { createdAt: "desc" },
      take,
      select: {
        id: true,
        status: true,
        distanceKm: true,
        earning: true,
        acceptedAt: true,
        pickedUpAt: true,
        deliveredAt: true,
        createdAt: true,
        order: {
          select: {
            number: true,
            customerAddress: true,
            restaurant: { select: { restaurantName: true, name: true } }
          }
        }
      }
    })
  }

  updateStatus(id: string, status: DeliveryStatus, extra: Prisma.DeliveryUpdateInput = {}) {
    return prisma.delivery.update({ where: { id }, data: { status, ...extra } })
  }

  assignCourier(id: string, courierId: string, distanceKm: number) {
    return prisma.delivery.update({
      where: { id },
      data: { courierId, distanceKm, status: "COURIER_ASSIGNED", acceptedAt: new Date() },
      include: {
        order: { include: { restaurant: { select: restaurantPublicFields } } },
        courier: { select: courierPublicFields }
      }
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

  expirePendingOffers(deliveryId: string) {
    return prisma.deliveryOffer.updateMany({
      where: { deliveryId, status: "PENDING" },
      data: { status: "EXPIRED", respondedAt: new Date() }
    })
  }

  // Lançamento do repasse ao motoboy (tabela de transações financeiras).
  createEarning(userId: string, deliveryId: string, amount: number) {
    return prisma.transaction.create({ data: { userId, deliveryId, type: "EARNING", amount } })
  }

  updateOfferStatus(id: string, status: DeliveryOfferStatus) {
    return prisma.deliveryOffer.update({ where: { id }, data: { status, respondedAt: new Date() } })
  }
}
