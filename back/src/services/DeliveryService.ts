import { DeliveryRepository } from "../repositories/DeliveryRepository"
import { OrderRepository } from "../repositories/OrderRepository"
import { UserRepository } from "../repositories/UserRepository"
import { emitToUser } from "../lib/socket"
import type { Order } from "../../generated/prisma/client"

const deliveryRepository = new DeliveryRepository()
const orderRepository = new OrderRepository()
const userRepository = new UserRepository()

// Timeout de aceite da corrida (Épico 2/4): 30 segundos — igual ao
// contador exibido na tela "Nova corrida" do motoboy.
const OFFER_TIMEOUT_MS = 30_000
// Raio inicial de busca por motoboys (Épico 4): 5km.
const SEARCH_RADIUS_METERS = 5_000

export class DeliveryService {
  // Inicia a busca de motoboy para um pedido já pronto ("Solicitar motoboy"
  // na fila do restaurante). Só pode ser chamado para pedidos "Pronto"
  // (regra validada em OrderService.requestCourier).
  async startDispatch(order: Order) {
    const delivery = await deliveryRepository.createForOrder(order.id)
    await orderRepository.updateStatus(order.id, "DISPATCHED")

    await this.dispatchToNextCourier(delivery.id, order, [])

    return deliveryRepository.findById(delivery.id)
  }

  // Localiza o motoboy online mais próximo (via PostGIS), cria uma oferta
  // com prazo de 30s e emite o evento "novo_pedido_disponivel" — a tela
  // "Nova corrida" (restaurante, distância, ganho estimado = deliveryFee).
  // Se ninguém for encontrado, marca a entrega como sem motoboy disponível.
  private async dispatchToNextCourier(deliveryId: string, order: Order, excludedCourierIds: string[]) {
    const nearby = await userRepository.findAvailableCouriersNearby(
      order.customerLat,
      order.customerLng,
      SEARCH_RADIUS_METERS,
      excludedCourierIds
    )

    if (nearby.length === 0) {
      await deliveryRepository.updateStatus(deliveryId, "NO_COURIER_FOUND")
      return
    }

    const next = nearby[0]
    const distanceKm = next.distance / 1000
    const expiresAt = new Date(Date.now() + OFFER_TIMEOUT_MS)

    const offer = await deliveryRepository.createOffer(deliveryId, next.id, distanceKm, expiresAt)

    emitToUser(next.id, "novo_pedido_disponivel", {
      offerId: offer.id,
      deliveryId,
      orderId: order.id,
      customerAddress: order.customerAddress,
      value: Number(order.value),
      deliveryFee: Number(order.deliveryFee), // "Ganho estimado" exibido na tela do motoboy
      distanceKm,
      expiresInSeconds: OFFER_TIMEOUT_MS / 1000
    })

    setTimeout(() => {
      this.expireOfferIfPending(offer.id, deliveryId, order, [...excludedCourierIds, next.id])
    }, OFFER_TIMEOUT_MS)
  }

  private async expireOfferIfPending(
    offerId: string,
    deliveryId: string,
    order: Order,
    excludedCourierIds: string[]
  ) {
    const offer = await deliveryRepository.findOffer(offerId)
    if (!offer || offer.status !== "PENDING") return

    await deliveryRepository.updateOfferStatus(offerId, "EXPIRED")

    const delivery = await deliveryRepository.findById(deliveryId)
    if (!delivery || delivery.status !== "SEARCHING_COURIER") return

    // Repassa a chamada automaticamente para o próximo motoboy da fila (Épico 4).
    await this.dispatchToNextCourier(deliveryId, order, excludedCourierIds)
  }

  // Motoboy aceita a corrida dentro do prazo (botão "Aceitar").
  async acceptOffer(offerId: string, courierId: string) {
    const offer = await deliveryRepository.findOffer(offerId)
    if (!offer) throw new Error("Oferta de corrida não encontrada")
    if (offer.courierId !== courierId) throw new Error("Esta corrida não foi oferecida a este motoboy")
    if (offer.status !== "PENDING") throw new Error("Esta corrida já não está mais disponível")

    await deliveryRepository.updateOfferStatus(offerId, "ACCEPTED")
    const delivery = await deliveryRepository.assignCourier(offer.deliveryId, courierId)
    await userRepository.updateCourierStatus(courierId, "ON_DELIVERY")

    // Notificação visual em tempo real no painel do restaurante (nome do
    // motoboy e tempo/distância estimados) — Épico 3.
    emitToUser(delivery.order.restaurantId, "pedido_aceito", {
      deliveryId: delivery.id,
      orderId: delivery.order.id,
      courierName: delivery.courier?.name,
      distanceKm: offer.distanceKm,
      status: delivery.status
    })

    return delivery
  }

  // Motoboy recusa a corrida (botão "Recusar"). O timeout de 30s cai no
  // mesmo fluxo de repasse via expireOfferIfPending.
  async rejectOffer(offerId: string, courierId: string) {
    const offer = await deliveryRepository.findOffer(offerId)
    if (!offer) throw new Error("Oferta de corrida não encontrada")
    if (offer.courierId !== courierId) throw new Error("Esta corrida não foi oferecida a este motoboy")
    if (offer.status !== "PENDING") return offer

    await deliveryRepository.updateOfferStatus(offerId, "REJECTED")

    const delivery = await deliveryRepository.findById(offer.deliveryId)
    if (delivery?.order && delivery.status === "SEARCHING_COURIER") {
      await this.dispatchToNextCourier(delivery.id, delivery.order, [courierId])
    }

    return offer
  }

  // Tela "Confirmar retirada": o código de 4 dígitos digitado pelo motoboy
  // precisa bater com o código gerado pelo restaurante na criação do
  // pedido (Épico 2/3/4). Só é aceito com a corrida já em "A caminho"
  // (COURIER_ASSIGNED) — ou seja, motoboy já aceitou e está no local.
  async validatePickupCode(deliveryId: string, courierId: string, code: string) {
    const delivery = await deliveryRepository.findById(deliveryId)
    if (!delivery) throw new Error("Entrega não encontrada")
    if (delivery.courierId !== courierId) throw new Error("Você não está vinculado a esta entrega")
    if (delivery.status !== "COURIER_ASSIGNED") {
      throw new Error("Esta entrega não está aguardando retirada")
    }
    if (delivery.order.pickupCode !== code) {
      throw new Error("Código de retirada inválido")
    }

    const updated = await deliveryRepository.updateStatus(deliveryId, "PICKED_UP", {
      pickedUpAt: new Date()
    })

    // Restaurante também usa o código para confirmar que o motoboy retirou
    // corretamente — a tela "Confirmar retirada" do restaurante reage a
    // este evento em tempo real (Épico 3/4).
    emitToUser(delivery.order.restaurantId, "codigo_validado", {
      deliveryId,
      orderId: delivery.orderId,
      status: updated.status
    })

    return updated
  }

  // Libera a rota até o cliente somente após o código validado (Épico 2):
  // a corrida só sai de "Retirado" para "Em entrega" por aqui.
  async startRouteToCustomer(deliveryId: string, courierId: string) {
    const delivery = await deliveryRepository.findById(deliveryId)
    if (!delivery || delivery.courierId !== courierId) throw new Error("Entrega não encontrada")
    if (delivery.status !== "PICKED_UP") {
      throw new Error("A retirada ainda não foi confirmada com o código")
    }

    const updated = await deliveryRepository.updateStatus(deliveryId, "IN_DELIVERY")

    // Mantém o painel de rastreamento do restaurante ("Buscando motoboy →
    // A caminho → Retirado → Em entrega → Entregue") atualizado em tempo real.
    emitToUser(delivery.order.restaurantId, "entrega_em_andamento", {
      deliveryId,
      orderId: delivery.orderId,
      status: updated.status
    })

    return updated
  }

  // Botão único "Finalizar entrega": só pode ser acionado depois que a
  // rota até o cliente foi iniciada (IN_DELIVERY), reproduzindo o passo a
  // passo Retirado → Em entrega → Entregue do painel de rastreamento.
  // Calcula o repasse do motoboy (earning = taxa/deliveryFee do pedido) e
  // libera o motoboy para novas corridas.
  async completeDelivery(deliveryId: string, courierId: string) {
    const delivery = await deliveryRepository.findById(deliveryId)
    if (!delivery) throw new Error("Entrega não encontrada")
    if (delivery.courierId !== courierId) throw new Error("Você não está vinculado a esta entrega")
    if (delivery.status !== "IN_DELIVERY") {
      throw new Error("A entrega só pode ser finalizada depois que a rota até o cliente foi iniciada")
    }

    const earning = Number(delivery.order.deliveryFee ?? 0)

    const updated = await deliveryRepository.updateStatus(deliveryId, "DELIVERED", {
      deliveredAt: new Date(),
      earning
    })
    await orderRepository.updateStatus(delivery.orderId, "DELIVERED", { deliveredAt: new Date() })
    await userRepository.updateCourierStatus(courierId, "ONLINE")

    emitToUser(delivery.order.restaurantId, "entrega_finalizada", {
      deliveryId,
      orderId: delivery.orderId,
      status: updated.status
    })

    return updated
  }

  getActiveForCourier(courierId: string) {
    return deliveryRepository.findActiveByCourier(courierId)
  }
}
