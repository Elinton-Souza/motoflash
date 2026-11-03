import { OrderRepository } from "../repositories/OrderRepository"
import { UserRepository } from "../repositories/UserRepository"
import { DeliveryService } from "./DeliveryService"
import { GeocodingService } from "./GeocodingService"
import { NotificationService } from "./NotificationService"
import { normalizePhone } from "./WhatsAppService"
import { generateCode } from "../utils/generateCode"
import type { OrderStatus } from "../../generated/prisma/client"

const orderRepository = new OrderRepository()
const userRepository = new UserRepository()
const deliveryService = new DeliveryService()
const geocoding = new GeocodingService()
const notifications = new NotificationService()

type CreateOrderInput = {
  restaurantId: string
  customerName: string
  customerPhone: string
  customerAddress: string
  // Coordenadas escolhidas no mapa/sugestão. Sem elas, o endereço é geocodificado.
  customerLat?: number
  customerLng?: number
  value: number
  deliveryFee?: number
}

export class OrderService {
  // Cria o pedido com os dois códigos de confirmação:
  //  - pickupCode: restaurante -> motoboy, conferido na retirada
  //  - deliveryCode: cliente -> motoboy, enviado ao cliente pelo WhatsApp
  //    e conferido na hora de finalizar a entrega
  async createOrder(input: CreateOrderInput) {
    const restaurant = await userRepository.findById(input.restaurantId)
    if (!restaurant) throw new Error("Restaurante não encontrado")

    const position = await this.resolveCustomerPosition(input, restaurant)

    const order = await orderRepository.create({
      restaurantId: input.restaurantId,
      customerName: input.customerName,
      customerPhone: normalizePhone(input.customerPhone) ?? input.customerPhone,
      customerAddress: input.customerAddress,
      customerLat: position.lat,
      customerLng: position.lng,
      value: input.value,
      deliveryFee: input.deliveryFee ?? 0,
      pickupCode: generateCode(4),
      deliveryCode: generateCode(4)
    })

    const whatsapp = await notifications.sendCustomerCode(order, restaurant)

    return { ...order, whatsapp }
  }

  private async resolveCustomerPosition(
    input: CreateOrderInput,
    restaurant: { restaurantLat: number | null; restaurantLng: number | null }
  ) {
    if (input.customerLat != null && input.customerLng != null) {
      return { lat: input.customerLat, lng: input.customerLng }
    }

    const point = await geocoding.geocode(input.customerAddress)
    if (point) return point

    if (restaurant.restaurantLat != null && restaurant.restaurantLng != null) {
      // Endereço não encontrado no mapa: usa o ponto do restaurante para a
      // entrega não travar. O motoboy segue o endereço escrito.
      console.warn(`[pedido] endereço sem coordenadas, usando a posição do restaurante: ${input.customerAddress}`)
      return { lat: restaurant.restaurantLat, lng: restaurant.restaurantLng }
    }

    throw new Error("Não encontramos este endereço no mapa. Escolha uma das sugestões ou confira o endereço.")
  }

  // Reenvia ao cliente o código de confirmação da entrega.
  async resendCustomerCode(orderId: string) {
    const order = await orderRepository.findById(orderId)
    if (!order) throw new Error("Pedido não encontrado")
    if (!order.deliveryCode) throw new Error("Este pedido não possui código de entrega")
    if (!order.customerPhone) throw new Error("Este pedido não tem o WhatsApp do cliente")

    return notifications.sendCustomerCode(order, order.restaurant)
  }

  listByRestaurant(restaurantId: string, status?: OrderStatus) {
    return orderRepository.findByRestaurant(restaurantId, status)
  }

  getById(id: string) {
    return orderRepository.findById(id)
  }

  // Pedido só é visível/alterável pelo restaurante que o criou.
  async getOwnedById(id: string, restaurantId: string) {
    const order = await orderRepository.findById(id)
    return order && order.restaurantId === restaurantId ? order : null
  }

  markReady(id: string) {
    return orderRepository.updateStatus(id, "READY", { readyAt: new Date() })
  }

  // Cancela um pedido que ainda não saiu com um motoboy.
  async cancel(id: string) {
    const order = await orderRepository.findById(id)
    if (!order) throw new Error("Pedido não encontrado")

    const cancellable = !order.delivery || ["SEARCHING_COURIER", "NO_COURIER_FOUND"].includes(order.delivery.status)
    if (order.status === "DELIVERED" || order.status === "CANCELED" || !cancellable) {
      throw new Error("Este pedido não pode mais ser cancelado")
    }

    if (order.delivery) await deliveryService.cancelSearch(order.delivery.id)
    return orderRepository.updateStatus(id, "CANCELED")
  }

  // Botão "Despachar" / "Solicitar motoboy" da fila do restaurante.
  async requestCourier(orderId: string) {
    const order = await orderRepository.findById(orderId)
    if (!order) throw new Error("Pedido não encontrado")
    if (order.status === "CANCELED") throw new Error("Este pedido foi cancelado")
    // Nova tentativa quando a busca anterior não encontrou motoboy.
    if (order.delivery?.status === "NO_COURIER_FOUND") {
      return deliveryService.restartDispatch(order.delivery.id, order)
    }
    if (order.status !== "READY") {
      throw new Error("O pedido precisa estar marcado como pronto antes de solicitar um motoboy")
    }
    if (order.delivery) {
      throw new Error("Este pedido já possui uma solicitação de entrega")
    }

    return deliveryService.startDispatch(order)
  }
}
