import { WhatsAppService, type WhatsAppResult } from "./WhatsAppService"

const whatsapp = new WhatsAppService()

type OrderInfo = {
  number: number
  customerName: string
  customerPhone: string | null
  pickupCode: string
  deliveryCode: string | null
}

type RestaurantInfo = { name: string; restaurantName: string | null; phone: string | null }
type CourierInfo = { name: string; vehiclePlate: string | null }

const restaurantLabel = (restaurant: RestaurantInfo) => restaurant.restaurantName ?? restaurant.name
const firstName = (name: string) => name.split(" ")[0]

// Textos enviados pelo WhatsApp em cada etapa da entrega.
export const messages = {
  customerCode(order: OrderInfo, restaurant: RestaurantInfo) {
    return (
      `Olá, ${firstName(order.customerName)}! Seu pedido #${order.number} de ${restaurantLabel(restaurant)} ` +
      `será entregue pela MotoFlash.\n\n` +
      `Seu código de confirmação é *${order.deliveryCode}*.\n` +
      `Informe este código ao motoboy somente quando receber o pedido.`
    )
  },

  customerOnTheWay(order: OrderInfo, courier: CourierInfo) {
    return (
      `Seu pedido #${order.number} saiu para entrega com ${firstName(courier.name)}` +
      `${courier.vehiclePlate ? ` (placa ${courier.vehiclePlate})` : ""}.\n` +
      `Na entrega, informe o código *${order.deliveryCode}*.`
    )
  },

  restaurantPickup(order: OrderInfo, courier: CourierInfo) {
    return (
      `MotoFlash: ${courier.name}${courier.vehiclePlate ? ` (placa ${courier.vehiclePlate})` : ""} ` +
      `aceitou o pedido #${order.number} e está indo buscar.\n\n` +
      `Código de retirada: *${order.pickupCode}*.\n` +
      `Entregue o pedido somente depois que o motoboy digitar este código no aplicativo.`
    )
  },

  passwordReset(code: string) {
    return `MotoFlash: seu código para redefinir a senha é *${code}*. Ele vale por 15 minutos. Se você não pediu, ignore esta mensagem.`
  }
}

// As notificações nunca podem travar o fluxo da entrega: qualquer falha
// vira apenas um resultado com sent = false.
export class NotificationService {
  async safeSend(phone: string | null | undefined, message: string): Promise<WhatsAppResult> {
    try {
      return await whatsapp.send(phone, message)
    } catch (error) {
      return { sent: false, provider: whatsapp.provider || "link", link: null, error: (error as Error).message }
    }
  }

  sendCustomerCode(order: OrderInfo, restaurant: RestaurantInfo) {
    return this.safeSend(order.customerPhone, messages.customerCode(order, restaurant))
  }

  sendCustomerOnTheWay(order: OrderInfo, courier: CourierInfo) {
    return this.safeSend(order.customerPhone, messages.customerOnTheWay(order, courier))
  }

  sendRestaurantPickup(order: OrderInfo, restaurant: RestaurantInfo, courier: CourierInfo) {
    return this.safeSend(restaurant.phone, messages.restaurantPickup(order, courier))
  }

  sendPasswordReset(phone: string | null, code: string) {
    return this.safeSend(phone, messages.passwordReset(code))
  }

  get automaticEnabled() {
    return whatsapp.isConfigured
  }
}
