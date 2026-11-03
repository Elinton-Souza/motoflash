import { prisma } from "../lib/prisma"
import { OrderStatus, Prisma } from "../../generated/prisma/client"
import { courierPublicFields, restaurantPublicFields } from "./publicFields"

type CreateOrderInput = {
  restaurantId: string
  customerName: string
  customerPhone?: string | null
  customerAddress: string
  customerLat: number
  customerLng: number
  value: number
  deliveryFee: number
  pickupCode: string
  deliveryCode: string
}

export class OrderRepository {
  create(data: CreateOrderInput) {
    return prisma.order.create({ data })
  }

  findById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        delivery: { include: { courier: { select: courierPublicFields } } },
        restaurant: { select: restaurantPublicFields }
      }
    })
  }

  findByRestaurant(restaurantId: string, status?: OrderStatus) {
    return prisma.order.findMany({
      where: { restaurantId, ...(status ? { status } : {}) },
      include: {
        delivery: { include: { courier: { select: courierPublicFields } } },
        restaurant: { select: restaurantPublicFields }
      },
      orderBy: { createdAt: "desc" }
    })
  }

  updateStatus(id: string, status: OrderStatus, extra: Prisma.OrderUpdateInput = {}) {
    return prisma.order.update({ where: { id }, data: { status, ...extra } })
  }
}
