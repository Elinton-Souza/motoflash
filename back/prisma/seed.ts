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
    courier: courier.email,
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
