import "dotenv/config"
import bcrypt from "bcrypt"
import { prisma } from "../src/lib/prisma"

// Dados de exemplo baseados nas personas do projeto: Ana Ferreira
// (restaurante) e Carlos Silva (motoboy).
async function main() {
  const password = bcrypt.hashSync("123456", 10)

  const restaurant = await prisma.user.upsert({
    where: { email: "restaurante@motoflash.com" },
    update: {},
    create: {
      name: "Ana Ferreira",
      email: "restaurante@motoflash.com",
      password,
      role: "RESTAURANT",
      restaurantName: "Pizzaria do Zé",
      restaurantAddress: "Rua das Pizzas, 100 - Centro"
    }
  })

  const courier = await prisma.user.upsert({
    where: { email: "motoboy@motoflash.com" },
    update: {},
    create: {
      name: "Carlos Silva",
      email: "motoboy@motoflash.com",
      password,
      role: "MOTOBOY",
      vehiclePlate: "ABC1D23",
      courierStatus: "ONLINE",
      currentLat: -23.5615,
      currentLng: -46.6558
    }
  })

  // Segundo motoboy e segundo restaurante, para demonstrar o repasse
  // automático da corrida quando um motoboy recusa ou não responde.
  const courier2 = await prisma.user.upsert({
    where: { email: "motoboy2@motoflash.com" },
    update: {},
    create: {
      name: "Mateus Rocha",
      email: "motoboy2@motoflash.com",
      password,
      role: "MOTOBOY",
      vehiclePlate: "XYZ9K87",
      courierStatus: "OFFLINE",
      currentLat: -23.5589,
      currentLng: -46.6612
    }
  })

  const restaurant2 = await prisma.user.upsert({
    where: { email: "restaurante2@motoflash.com" },
    update: {},
    create: {
      name: "Beatriz Lima",
      email: "restaurante2@motoflash.com",
      password,
      role: "RESTAURANT",
      restaurantName: "Burger House",
      restaurantAddress: "Av. Paulista, 1000 - Bela Vista"
    }
  })

  const admin = await prisma.user.upsert({
    where: { email: "admin@motoflash.com" },
    update: {},
    create: {
      name: "Administrador Motoflash",
      email: "admin@motoflash.com",
      password,
      role: "ADMIN"
    }
  })

  console.log("Seed concluído:", {
    restaurant: restaurant.email,
    restaurant2: restaurant2.email,
    courier: courier.email,
    courier2: courier2.email,
    admin: admin.email
  })
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
