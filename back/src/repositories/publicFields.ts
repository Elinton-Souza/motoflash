// Campos que podem ser expostos para outros usuários da plataforma
// (nunca inclui a senha). Usados nos "include" do Prisma.
export const courierPublicFields = {
  id: true,
  name: true,
  phone: true,
  vehiclePlate: true,
  ratingAvg: true,
  ratingCount: true
} as const

export const restaurantPublicFields = {
  id: true,
  name: true,
  phone: true,
  restaurantName: true,
  restaurantAddress: true
} as const
