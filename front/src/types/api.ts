// Tipos das respostas da API do Motoflash (back/). Valores monetários
// (Decimal no Prisma) chegam como string no JSON.
export type Role = 'RESTAURANT' | 'MOTOBOY' | 'ADMIN'
export type CourierStatus = 'OFFLINE' | 'ONLINE' | 'ON_DELIVERY'
export type OrderStatus = 'PREPARING' | 'READY' | 'DISPATCHED' | 'DELIVERED' | 'CANCELED'
export type DeliveryStatus = 'SEARCHING_COURIER' | 'COURIER_ASSIGNED' | 'PICKED_UP' | 'IN_DELIVERY' | 'DELIVERED' | 'CANCELED' | 'NO_COURIER_FOUND'
export type Money = string | number

export interface AuthUser { id: string; name: string; email: string; role: Role }
export interface Session { token: string; user: AuthUser }

export interface Profile {
  id: string
  name: string
  email: string
  phone: string | null
  role: Role
  createdAt: string
  restaurantName: string | null
  restaurantAddress: string | null
  vehiclePlate: string | null
  courierStatus: CourierStatus | null
  currentLat: number | null
  currentLng: number | null
  ratingAvg: number | null
  ratingCount: number
}

export interface CourierSummary { id: string; name: string; phone: string | null; vehiclePlate: string | null; ratingAvg: number | null; ratingCount: number }
export interface RestaurantSummary { id: string; name: string; phone: string | null; restaurantName: string | null; restaurantAddress: string | null }
export interface ConnectedCourier { id: string; name: string; ratingAvg: number | null; vehiclePlate: string | null; courierStatus: CourierStatus }

export interface Delivery {
  id: string
  orderId: string
  courierId: string | null
  status: DeliveryStatus
  distanceKm: number | null
  earning: Money | null
  acceptedAt: string | null
  pickedUpAt: string | null
  deliveredAt: string | null
  createdAt: string
  courier?: CourierSummary | null
}

export interface Order {
  id: string
  number: number
  restaurantId: string
  customerName: string
  customerAddress: string
  customerLat: number
  customerLng: number
  value: Money
  deliveryFee: Money
  pickupCode?: string
  status: OrderStatus
  createdAt: string
  deliveredAt: string | null
  delivery?: Delivery | null
  restaurant?: RestaurantSummary
}

// Pedido como o motoboy enxerga (sem o código de retirada, com o restaurante).
export type CourierOrder = Omit<Order, 'pickupCode'> & { restaurant: RestaurantSummary }
export type CourierDelivery = Delivery & { order: CourierOrder }

export interface Offer {
  id: string
  deliveryId: string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED'
  distanceKm: number
  createdAt: string
  expiresAt: string
  delivery: CourierDelivery
}

export interface CourierDailySummary { date: string; totalEarnings: number; totalDeliveries: number; averageEarning: number }

export interface RestaurantFinanceSummary {
  date: string
  totalDeliveries: number
  totalDeliveryFees: number
  byCourier: Array<{ courierId: string; courierName: string; deliveries: number; totalPaidOut: number }>
}
