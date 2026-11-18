// Campos que podem ser expostos para outros usuários da plataforma
// (nunca inclui a senha). Usados nos "include" do Prisma.
export const courierPublicFields = {
  id: true,
  name: true,
  phone: true,
  vehiclePlate: true,
  ratingAvg: true,
  ratingCount: true,
  // Posição atual, usada para mostrar o motoboy no mapa do restaurante.
  currentLat: true,
  currentLng: true
} as const

export const restaurantPublicFields = {
  id: true,
  name: true,
  phone: true,
  restaurantName: true,
  restaurantAddress: true,
  restaurantLat: true,
  restaurantLng: true
} as const
