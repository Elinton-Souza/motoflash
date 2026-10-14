export type DeliveryStatus = 'waiting' | 'accepted' | 'pickup' | 'delivery' | 'completed' | 'cancelled'

export interface Delivery { id: string; restaurant: string; customer: string; pickupAddress: string; deliveryAddress: string; value: number; distance: string; estimatedTime: string; status: DeliveryStatus }
