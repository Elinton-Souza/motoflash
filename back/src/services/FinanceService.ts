import { prisma } from "../lib/prisma"
import { DeliveryRepository } from "../repositories/DeliveryRepository"
import { Prisma } from "../../generated/prisma/client"

const deliveryRepository = new DeliveryRepository()

type DeliveryWithOrder = Prisma.DeliveryGetPayload<{ include: { order: true } }>
type DeliveryWithOrderAndCourier = Prisma.DeliveryGetPayload<{ include: { order: true; courier: true } }>

function dayRange(referenceDate: Date) {
  const start = new Date(referenceDate)
  start.setHours(0, 0, 0, 0)
  const end = new Date(referenceDate)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

export class FinanceService {
  // Tela "Hoje" do motoboy: ganhos do dia, total de corridas e médias —
  // sem gráficos complicados, só os números que o Carlos quer ver rápido.
  async getCourierDailySummary(courierId: string, referenceDate: Date = new Date()) {
    const { start, end } = dayRange(referenceDate)

    const deliveries: DeliveryWithOrder[] = await prisma.delivery.findMany({
      where: {
        courierId,
        status: "DELIVERED",
        deliveredAt: { gte: start, lte: end }
      },
      include: { order: true },
      orderBy: { deliveredAt: "desc" }
    })

    const totalEarnings = deliveries.reduce((sum: number, d: DeliveryWithOrder) => sum + Number(d.earning ?? 0), 0)
    const totalDeliveries = deliveries.length
    const averageEarning = totalDeliveries > 0 ? totalEarnings / totalDeliveries : 0

    return {
      date: start.toISOString().slice(0, 10),
      totalEarnings,
      totalDeliveries,
      averageEarning,
      deliveries: deliveries.map((d: DeliveryWithOrder) => ({
        id: d.id,
        customerAddress: d.order.customerAddress,
        deliveredAt: d.deliveredAt,
        earning: Number(d.earning ?? 0)
      }))
    }
  }

  getCourierHistory(courierId: string) {
    return deliveryRepository.findHistoryByCourier(courierId)
  }

  // Tela "Histórico — Hoje" do restaurante: total de corridas do dia e
  // valor total em taxas (deliveryFee), com repasses separados por
  // entregador (Épico 3). Por padrão considera o dia de hoje; passe
  // `referenceDate` para consultar outro dia.
  async getRestaurantFinanceSummary(restaurantId: string, referenceDate: Date = new Date()) {
    const { start, end } = dayRange(referenceDate)

    const deliveries: DeliveryWithOrderAndCourier[] = await prisma.delivery.findMany({
      where: {
        order: { restaurantId },
        status: "DELIVERED",
        deliveredAt: { gte: start, lte: end }
      },
      include: { order: true, courier: true },
      orderBy: { deliveredAt: "desc" }
    })

    const totalDeliveryFees = deliveries.reduce(
      (sum: number, d: DeliveryWithOrderAndCourier) => sum + Number(d.order.deliveryFee ?? 0),
      0
    )

    const byCourier = new Map<string, { courierName: string; deliveries: number; totalPaidOut: number }>()
    for (const d of deliveries) {
      if (!d.courier) continue
      const current = byCourier.get(d.courier.id) ?? {
        courierName: d.courier.name,
        deliveries: 0,
        totalPaidOut: 0
      }
      current.deliveries += 1
      current.totalPaidOut += Number(d.earning ?? 0)
      byCourier.set(d.courier.id, current)
    }

    return {
      date: start.toISOString().slice(0, 10),
      totalDeliveries: deliveries.length,
      totalDeliveryFees,
      byCourier: Array.from(byCourier.entries()).map(([courierId, data]) => ({ courierId, ...data })),
      history: deliveries.map((d: DeliveryWithOrderAndCourier) => ({
        deliveryId: d.id,
        orderId: d.orderId,
        courierName: d.courier?.name ?? null,
        value: Number(d.order.value),
        deliveryFee: Number(d.order.deliveryFee),
        deliveredAt: d.deliveredAt
      }))
    }
  }
}
