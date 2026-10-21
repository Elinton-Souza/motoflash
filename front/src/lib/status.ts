import type { DeliveryStatus, Order } from '../types/api'

// "kind" corresponde às cores do componente StatusBadge.
type StatusInfo = { label: string; kind: string }

const deliveryStatus: Record<DeliveryStatus, StatusInfo> = {
  SEARCHING_COURIER: { label: 'Buscando motoboy', kind: 'waiting' },
  COURIER_ASSIGNED: { label: 'Motoboy a caminho', kind: 'accepted' },
  PICKED_UP: { label: 'Pedido retirado', kind: 'pickup' },
  IN_DELIVERY: { label: 'Em entrega', kind: 'delivery' },
  DELIVERED: { label: 'Entregue', kind: 'completed' },
  CANCELED: { label: 'Cancelada', kind: 'cancelled' },
  NO_COURIER_FOUND: { label: 'Sem motoboy disponível', kind: 'cancelled' },
}

export function orderStatusInfo(order: Order): StatusInfo {
  if (order.status === 'DELIVERED') return deliveryStatus.DELIVERED
  if (order.status === 'CANCELED') return { label: 'Cancelado', kind: 'cancelled' }
  if (order.delivery) return deliveryStatus[order.delivery.status]
  if (order.status === 'READY') return { label: 'Pronto', kind: 'available' }
  return { label: 'Em preparo', kind: 'waiting' }
}

export const ACTIVE_DELIVERY_STATUSES: DeliveryStatus[] = ['SEARCHING_COURIER', 'COURIER_ASSIGNED', 'PICKED_UP', 'IN_DELIVERY']

export const isOrderActive = (order: Order) => !!order.delivery && ACTIVE_DELIVERY_STATUSES.includes(order.delivery.status)

export const isOrderFailed = (order: Order) => order.status === 'CANCELED' || order.delivery?.status === 'NO_COURIER_FOUND' || order.delivery?.status === 'CANCELED'
