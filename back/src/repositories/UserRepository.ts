import { prisma } from "../lib/prisma"
import { Prisma, Role, CourierStatus } from "../../generated/prisma/client"

type CreateUserInput = {
  name: string
  email: string
  password: string
  phone?: string
  role: Role
  restaurantName?: string
  restaurantAddress?: string
  vehiclePlate?: string
}

type UpdateProfileInput = Partial<{
  name: string
  phone: string
  restaurantName: string
  restaurantAddress: string
  vehiclePlate: string
}>

export class UserRepository {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } })
  }

  findById(id: string) {
    return prisma.user.findUnique({ where: { id } })
  }

  create(data: CreateUserInput) {
    return prisma.user.create({ data })
  }

  updateProfile(id: string, data: UpdateProfileInput) {
    return prisma.user.update({ where: { id }, data })
  }

  updateCourierStatus(id: string, courierStatus: CourierStatus) {
    return prisma.user.update({ where: { id }, data: { courierStatus } })
  }

  updateCourierLocation(id: string, lat: number, lng: number) {
    return prisma.user.update({ where: { id }, data: { currentLat: lat, currentLng: lng } })
  }

  // Busca motoboys "Online" dentro de um raio (em metros), ordenados do
  // mais próximo para o mais distante, usando a extensão PostGIS
  // (ST_DWithin + ST_Distance sobre geografia) — Épico 4.
  async findAvailableCouriersNearby(
    lat: number,
    lng: number,
    radiusMeters: number,
    excludeIds: string[] = []
  ): Promise<Array<{ id: string; distance: number }>> {
    const excludeClause =
      excludeIds.length > 0
        ? Prisma.sql`AND id NOT IN (${Prisma.join(excludeIds)})`
        : Prisma.empty

    return prisma.$queryRaw<Array<{ id: string; distance: number }>>(Prisma.sql`
      SELECT id,
             ST_Distance(
               ST_MakePoint("currentLng", "currentLat")::geography,
               ST_MakePoint(${lng}, ${lat})::geography
             ) AS distance
      FROM users
      WHERE role = 'MOTOBOY'
        AND "courierStatus" = 'ONLINE'
        AND "currentLat" IS NOT NULL
        AND "currentLng" IS NOT NULL
        ${excludeClause}
        AND ST_DWithin(
              ST_MakePoint("currentLng", "currentLat")::geography,
              ST_MakePoint(${lng}, ${lat})::geography,
              ${radiusMeters}
            )
      ORDER BY distance ASC
    `)
  }
}
