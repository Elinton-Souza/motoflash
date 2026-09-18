import { OrderRepository } from "../repositories/OrderRepository"
import { DeliveryService } from "./DeliveryService"
import { generateCode } from "../utils/generateCode"
import type { OrderStatus } from "../../generated/prisma/client"

const orderRepository = new OrderRepository()
const deliveryService = new DeliveryService()

type CreateOrderInput = {
  restaurantId: string
  customerName: string
  customerAddress: string
  customerLat: number
  customerLng: number
  value: number
  deliveryFee?: number
}

export class OrderService {
  // Cria o pedido e já gera o código de retirada de 4 dígitos que será
  // exibido ao restaurante e conferido pelo motoboy (Épico 3/4).
  createOrder(input: CreateOrderInput) {
    const pickupCode = generateCode(4)

    return orderRepository.create({
      restaurantId: input.restaurantId,
      customerName: input.customerName,
      customerAddress: input.customerAddress,
      customerLat: input.customerLat,
      customerLng: input.customerLng,
      value: input.value,
      deliveryFee: input.deliveryFee ?? 0,
      pickupCode
    })
  }

  listByRestaurant(restaurantId: string, status?: OrderStatus) {
    return orderRepository.findByRestaurant(restaurantId, status)
  }

  getById(id: string) {
    return orderRepository.findById(id)
  }

  markReady(id: string) {
    return orderRepository.updateStatus(id, "READY", { readyAt: new Date() })
  }

  // Botão "Despachar" / "Solicitar motoboy" da fila do restaurante.
  async requestCourier(orderId: string) {
    const order = await orderRepository.findById(orderId)
    if (!order) throw new Error("Pedido não encontrado")
    if (order.status !== "READY") {
      throw new Error("O pedido precisa estar marcado como pronto antes de solicitar um motoboy")
    }
    if (order.delivery) {
      throw new Error("Este pedido já possui uma solicitação de entrega")
    }

    return deliveryService.startDispatch(order)
  }
}
